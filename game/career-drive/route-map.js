// @ts-check
import { CHAPTERS } from './story.js';
import { ROAD_LENGTH, STATIONS, sampleRoad } from './world.js';
import { WORLD_REGIONS } from './regions.js';
import { roadProfile } from './road-layout.js';
import { TRACK_ROUTE, TRACK_BOUNDS } from './drift-track.js';
import { FESTIVAL } from './festival.js';
import { garageAccess } from './garage-layout.js';
import { TRACK_ACCESS } from './track-access.js';

/** @typedef {{id:string,distance:number,side:-1|1,label:{pl:string,en:string},kind:string}} MapSideStory */
/** @typedef {{id:'cmax'|'focus',distance:number,side:-1|1,offset:number}} MapGarage */
const SVG_NS='http://www.w3.org/2000/svg';

/** The map compresses longitudinal distance, while retaining the actual road bends.
 * @param {number} distance
 */
export function mapPoint(distance) {
  const bounded=Number.isFinite(distance)?Math.max(0,Math.min(ROAD_LENGTH,distance)):0;
  return {x:(190+sampleRoad(bounded).x*.17)/4,y:(566-bounded/ROAD_LENGTH*532)/6};
}

/** @param {number} [start] @param {number} [end] */
export function mapRoadPath(start=0,end=ROAD_LENGTH) {
  const samples=Array.from({length:Math.ceil((end-start)/70)+1},(_,index)=>Math.min(end,start+index*70));
  return samples.map((distance,index)=>{
    const point=mapPoint(distance);
    return `${index===0?'M':'L'} ${point.x*4} ${point.y*6}`;
  }).join(' ');
}

/** @param {MapGarage} garage */
export function mapGarageAccessPath(garage) {
  const access=garageAccess(garage);
  return [...access.points,access.lot].map((position,index)=>{
    const road=mapPoint(position.distance);
    const x=road.x*4+(position.x-sampleRoad(position.distance).x)*.17;
    return `${index===0?'M':'L'} ${x} ${road.y*6}`;
  }).join(' ');
}

export function mapTrackGeometry() {
  const access=[TRACK_ACCESS.approach,...TRACK_ACCESS.points].map(point=>{
    const road=mapPoint(point.distance);
    return {x:road.x*4+(point.x-sampleRoad(point.distance).x)*.17,y:road.y*6};
  });
  const first=access[0],gate=access[access.length-1];
  const entrance={x:first.x/4,y:first.y/6};
  const origin=TRACK_ROUTE[0];
  const points=TRACK_ROUTE.map(point=>({x:gate.x+(point.x-origin.x)/TRACK_BOUNDS.width*100,y:gate.y+(point.y-origin.y)/TRACK_BOUNDS.height*47}));
  return {
    entry:entrance,
    gate,
    branch:access.map((point,index)=>`${index===0?'M':'L'} ${point.x} ${point.y}`).join(' '),
    circuit:points.map((point,index)=>`${index===0?'M':'L'} ${point.x} ${point.y}`).join(' ')+' Z'
  };
}

/** @param {string} tag @param {Record<string,string|number>} [attributes] @param {string} [text] */
function svgNode(tag,attributes={},text) {
  const node=document.createElementNS(SVG_NS,tag);
  for (const [key,value] of Object.entries(attributes)) node.setAttribute(key,String(value));
  if (text!==undefined) node.textContent=text;
  return node;
}

/** A geographical overview using the same road, regions and circuit as the game. */
export class JourneyMap {
  /** @param {HTMLElement} container @param {(index:number)=>void} onSelect */
  constructor(container,onSelect) {
    this.container=container;
    this.onSelect=onSelect;
    this.distance=0;
    this.lane=0;
    /** @type {'pl'|'en'} */
    this.language='pl';
    /** @type {readonly MapSideStory[]} */
    this.sideStories=[];
    /** @type {readonly MapGarage[]} */
    this.garages=[];
    this.svg=container.querySelector('svg');
    this.terrain=svgNode('g',{'data-map-layer':'terrain'});
    this.roads=svgNode('g',{'data-map-layer':'roads'});
    this.places=svgNode('g',{'data-map-layer':'places'});
    this.extras=svgNode('g',{'data-map-layer':'extras'});
    this.parking=svgNode('g',{'data-map-layer':'parking'});
    if (this.svg) {
      this.svg.prepend(this.terrain,this.roads,this.places,this.extras,this.parking);
      for (const id of ['route-map-road','route-map-line']) this.svg.querySelector(`#${id}`)?.setAttribute('d',mapRoadPath());
    }
    this.paintGeography();
  }

  paintGeography() {
    this.terrain.replaceChildren();this.roads.replaceChildren();this.places.replaceChildren();
    for (const region of WORLD_REGIONS) {
      const upper=mapPoint(region.end).y*6,lower=mapPoint(region.start).y*6;
      this.terrain.append(svgNode('rect',{x:0,y:upper,width:400,height:lower-upper,fill:region.ground,opacity:.4,'data-region':region.id}));
      this.paintNeighborhood(region.id,(upper+lower)/2,region.paving);
    }
    for (const [start,end] of [[0,1200],[1200,2350],[2350,10150],[10150,ROAD_LENGTH]]) {
      const profile=roadProfile((start+end)/2),d=mapRoadPath(start,end),width=profile.width*.08;
      this.roads.append(svgNode('path',{d,fill:'none',stroke:'#15271f','stroke-width':width+4,'stroke-linejoin':'round','stroke-linecap':'round'}));
      this.roads.append(svgNode('path',{d,fill:'none',stroke:profile.surface==='gravel'?'#a08b63':'#566362','stroke-width':width,'stroke-linejoin':'round','stroke-linecap':'round','data-lanes':profile.lanes}));
      if(profile.lanes>1) this.roads.append(svgNode('path',{d,fill:'none',stroke:profile.lanes===4?'#d6b46c':'#dedbc18a','stroke-width':profile.lanes===4?1.8:.9,'stroke-dasharray':profile.lanes===4?'none':'4 5'}));
    }
    for (const station of STATIONS) this.paintLandmark(station);
    const festivalPoint=mapPoint(FESTIVAL.distance);
    const festival=svgNode('g',{transform:`translate(${festivalPoint.x*4+FESTIVAL.offset*.17} ${festivalPoint.y*6})`,'data-map-festival':'kulturalia'});
    festival.append(svgNode('title',{},FESTIVAL.label[this.language]));
    festival.append(svgNode('rect',{x:-13,y:-14,width:26,height:12,rx:2,fill:'#222f32',stroke:'#d6b46c','stroke-width':1.2}));
    festival.append(svgNode('text',{x:0,y:-5,'text-anchor':'middle',class:'map-npc-icon'},'♪'));
    for(const row of [0,1,2]) for(const column of [-2,-1,0,1,2]) festival.append(svgNode('circle',{cx:column*5+(row%2?2:0),cy:row*5+2,r:1.6,fill:row%2?'#9fb8ae':'#d6b46c'}));
    this.places.append(festival);
    const circuit=mapTrackGeometry();
    this.roads.append(svgNode('path',{d:circuit.branch,fill:'none',stroke:'#7c8b80','stroke-width':7,'stroke-linecap':'round','data-map-track':'branch'}));
    this.roads.append(svgNode('path',{d:circuit.circuit,fill:'none',stroke:'#d6b46c66','stroke-width':5,'stroke-linejoin':'round','data-map-track':'circuit'}));
    this.roads.append(svgNode('path',{d:circuit.circuit,fill:'none',stroke:'#9ca995','stroke-width':2,'stroke-linejoin':'round'}));
    this.places.append(svgNode('text',{x:circuit.gate.x+38,y:circuit.gate.y+24,'text-anchor':'middle',class:'map-circuit-caption'},this.language==='pl'?'TOR':'CIRCUIT'));
    this.paintSideStories();
    this.paintGarages();
  }

  /** @param {string} region @param {number} middle @param {string} paving */
  paintNeighborhood(region,middle,paving) {
    const town=['village','town'].includes(region);
    const x=region!=='torun'?270:20;
    const group=svgNode('g',{opacity:town?.55:.4});
    if(town) {
      for (const row of [0,1,2]) group.append(svgNode('rect',{x:x+row*4,y:middle-20+row*15,width:83,height:11,rx:1,fill:row%2?'#9b935a':'#788a50',opacity:.55}));
      for(const column of [0,1]) group.append(svgNode('path',{d:`M ${x+column*45} ${middle-31} l 9 -7 l 9 7 v 12 h -18 Z`,fill:'#b7af89',opacity:.65}));
    } else {
      for(const row of [0,1]) for(const column of [0,1,2]) group.append(svgNode('rect',{x:x+column*27,y:middle-22+row*23,width:18,height:15,rx:1,fill:region==='torun'?'#b37954':paving,opacity:.6}));
      group.append(svgNode('path',{d:`M ${x-6} ${middle-3} h 91 M ${x+21} ${middle-29} v 60 M ${x+48} ${middle-29} v 60`,stroke:paving,'stroke-width':2,opacity:.3}));
      if(region==='torun') group.append(svgNode('path',{d:`M 8 ${middle-32} C 25 ${middle-11} 3 ${middle+8} 16 ${middle+33}`,fill:'none',stroke:'#75979d','stroke-width':8,opacity:.55}));
    }
    this.terrain.append(group);
  }

  /** @param {(typeof STATIONS)[number]} station */
  paintLandmark(station) {
    const point=mapPoint(station.distance),x=point.x*4+(point.x>45?42:-42),y=point.y*6;
    const group=svgNode('g',{transform:`translate(${x} ${y})`,'data-map-landmark':station.id,opacity:.65});
    if(station.kind==='monument') {
      group.append(svgNode('path',{d:'M -9 9 L -3 -16 L 0 -5 L 3 -16 L 9 9 Z',fill:'#b5b6a0'}));
    } else if(station.id==='design') {
      group.append(svgNode('path',{d:'M -10 8 V -3 H -4 V -17 L 0 -22 L 4 -17 V -3 H 10 V 8 Z',fill:'#bc8b64'}));
      group.append(svgNode('circle',{cx:0,cy:-10,r:2.2,fill:'#e7d4a3'}));
    } else if(station.id==='netwise') {
      for(const [offset,height] of [[-9,12],[0,24],[8,17]]) group.append(svgNode('rect',{x:offset,y:9-height,width:6,height,fill:'#a7bcc4'}));
    } else if(station.id==='university'||station.id==='learning') {
      group.append(svgNode('path',{d:'M -13 -6 L 0 -13 L 13 -6 Z M -13 8 H 13',fill:'#c9c7a7',stroke:'#c9c7a7','stroke-width':2}));
      for(const offset of [-9,-3,3,9]) group.append(svgNode('path',{d:`M ${offset} -3 V 7`,stroke:'#c9c7a7','stroke-width':2}));
    } else {
      group.append(svgNode('path',{d:'M -12 9 V -7 L 0 -15 L 12 -7 V 9 Z',fill:station.kind==='school'?'#bca46f':'#9ba995'}));
      group.append(svgNode('path',{d:'M -6 0 H 6 M 0 -6 V 9',stroke:'#293c31','stroke-width':2}));
    }
    this.places.append(group);
  }

  /** @param {readonly MapSideStory[]} stories */
  setSideStories(stories) { this.sideStories=stories;this.paintSideStories(); }

  paintSideStories() {
    this.extras.replaceChildren();
    for (const story of this.sideStories) {
      if (story.kind==='festival') continue;
      const point=mapPoint(story.distance),x=point.x*4+story.side*34,y=point.y*6;
      const group=svgNode('g',{'data-map-side-story':story.id,class:'map-side-story'});
      group.append(svgNode('title',{},story.label[this.language]));
      group.append(svgNode('path',{d:`M ${point.x*4} ${y} H ${x}`,stroke:'#d6b46c55','stroke-width':1,'stroke-dasharray':'2 3'}));
      group.append(svgNode('circle',{cx:x,cy:y,r:7,fill:'#1c3527',stroke:'#d6b46c99','stroke-width':1}));
      group.append(svgNode('text',{x,y:y+3,'text-anchor':'middle',class:'map-npc-icon'},story.kind==='music'?'♪':story.kind==='sport'?'●':story.kind==='robot'?'⚙':story.kind==='games'?'✦':'★'));
      this.extras.append(group);
    }
  }

  /** @param {readonly MapGarage[]} garages */
  setGarages(garages) { this.garages=garages.map(garage=>({...garage}));this.paintGarages(); }

  paintGarages() {
    this.parking.replaceChildren();
    for (const garage of this.garages) {
      const point=mapPoint(garage.distance),x=point.x*4+garage.side*garage.offset*.17,y=point.y*6;
      const group=svgNode('g',{'data-map-garage':garage.id});
      group.append(svgNode('title',{},this.language==='pl'?'Parking':'Car park'));
      const driveway=mapGarageAccessPath(garage);
      group.append(svgNode('path',{d:driveway,fill:'none',stroke:'#a4ab93','stroke-width':7,'stroke-linejoin':'round','stroke-linecap':'round',opacity:.65,'data-map-driveway':garage.id}));
      group.append(svgNode('path',{d:driveway,fill:'none',stroke:'#455653','stroke-width':4.5,'stroke-linejoin':'round','stroke-linecap':'round'}));
      group.append(svgNode('path',{d:driveway,fill:'none',stroke:'#e4cf9b','stroke-width':.6,'stroke-dasharray':'2 2'}));
      group.append(svgNode('rect',{x:x-8,y:y-8,width:16,height:16,rx:3,fill:'#203b32',stroke:'#e4bf78','stroke-width':1}));
      group.append(svgNode('text',{x,y:y+3,'text-anchor':'middle',class:'map-npc-icon'},'P'));
      this.parking.append(group);
    }
  }

  /** @param {'pl'|'en'} language @param {number[]} completed @param {number} selected */
  update(language,completed,selected) {
    if(this.language!==language) { this.language=language;this.paintGeography(); }
    const points=this.container.querySelector('#map-points');
    if (!points) return;
    points.replaceChildren();
    STATIONS.forEach((station,index)=>{
      const point=mapPoint(station.distance);
      const button=document.createElement('button');
      button.className=`btn btn-ghost map-point${point.x>45?' label-left':''}`;
      button.classList.toggle('is-complete',completed.includes(index));
      button.setAttribute('aria-label',`${station.year}. ${station.label[language]}. ${CHAPTERS[index].title[language]}`);
      if(selected===index) button.setAttribute('aria-current','step');
      button.style.left=`${point.x}%`;button.style.top=`${point.y}%`;
      const number=document.createElement('span');
      number.textContent=completed.includes(index)?'✓':String(index+1).padStart(2,'0');
      number.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.className='map-year';label.append(document.createTextNode(station.year));
      const title=document.createElement('span');title.className='map-stop-name';title.textContent=station.label[language];
      label.append(title);button.append(number,label);
      button.addEventListener('click',()=>this.onSelect(index));points.append(button);
    });
    this.setDistance(this.distance,this.lane);
  }

  /** @param {number} distance @param {number} [lane] */
  setDistance(distance,lane=0) {
    this.distance=distance;
    this.lane=Number.isFinite(lane)?lane:0;
    const car=this.container.querySelector('#map-car');
    if (!(car instanceof HTMLElement)) return;
    const point=mapPoint(distance);
    car.style.left=`${Math.max(0,Math.min(100,point.x+this.lane*.17/4))}%`;car.style.top=`${point.y}%`;
    this.container.dataset.distance=String(Math.round(Number.isFinite(distance)?distance:0));
    this.container.dataset.lane=String(Math.round(this.lane));
  }
}
