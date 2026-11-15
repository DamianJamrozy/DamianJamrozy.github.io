import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { JourneyMap, mapPoint, mapRoadPath, mapTrackGeometry, mapGarageAccessPath } from '../career-drive/route-map.js';
import { sampleRoad, STATIONS, ROAD_LENGTH } from '../career-drive/world.js';
import { WORLD_REGIONS } from '../career-drive/regions.js';
import { FESTIVAL } from '../career-drive/festival.js';
import { SIDE_STORIES } from '../career-drive/side-stories.js';
import { garageAccess } from '../career-drive/garage-layout.js';
import { TRACK_ACCESS } from '../career-drive/track-access.js';

class Element {
  constructor(tag='div') {
    this.tag=tag;this.children=[];this.attributes={};this.dataset={};this.style={};this.listeners=new Map();this.textContent='';
    this.classList={toggle:(className,enabled)=>{this.attributes[`class:${className}`]=String(enabled);}};
  }
  setAttribute(key,value) {this.attributes[key]=String(value);}
  append(...nodes) {this.children.push(...nodes);}
  prepend(...nodes) {this.children.unshift(...nodes);}
  replaceChildren(...nodes) {this.children=[...nodes];}
  addEventListener(type,listener) {this.listeners.set(type,listener);}
  querySelector(selector) {return descendants(this).find(node=>selector.startsWith('#')?node.attributes.id===selector.slice(1):node.tag===selector)??null;}
}
function descendants(node) {return node.children.flatMap(child=>[child,...descendants(child)]);}
const originalDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
const originalHTMLElement=Object.getOwnPropertyDescriptor(globalThis,'HTMLElement');
before(()=>{
  Object.assign(globalThis,{HTMLElement:Element,document:{createElementNS:(namespace,tag)=>new Element(tag),createElement:tag=>new Element(tag),createTextNode:text=>Object.assign(new Element('#text'),{textContent:text})}});
});
after(()=>{
  if(originalDocument) Object.defineProperty(globalThis,'document',originalDocument);else delete globalThis.document;
  if(originalHTMLElement) Object.defineProperty(globalThis,'HTMLElement',originalHTMLElement);else delete globalThis.HTMLElement;
});
function createMap() {
  const container=new Element(),svg=new Element('svg'),road=new Element('path'),line=new Element('path'),points=new Element(),car=new Element('span');
  road.setAttribute('id','route-map-road');line.setAttribute('id','route-map-line');points.setAttribute('id','map-points');car.setAttribute('id','map-car');
  svg.append(road,line);container.append(svg,points,car);
  const selections=[];
  const map=new JourneyMap(container,index=>selections.push(index));
  return {map,container,svg,points,car,selections};
}

test('the concert icon shares the world location and translates without offering remote interaction',()=>{
  const {map,container,selections}=createMap();
  map.setSideStories(SIDE_STORIES);
  const point=mapPoint(FESTIVAL.distance);
  const icon=()=>descendants(container).find(node=>node.attributes['data-map-festival']==='kulturalia');
  assert.equal(icon().attributes.transform,`translate(${point.x*4+FESTIVAL.offset*.17} ${point.y*6})`);
  assert.equal(icon().children.find(node=>node.tag==='title').textContent,FESTIVAL.label.pl);
  assert.equal(icon().listeners.size,0);
  assert.equal(descendants(container).filter(node=>node.attributes['data-map-festival']==='kulturalia').length,1);
  assert.ok(!descendants(container).some(node=>node.attributes['data-map-side-story']==='festival'),'the stage icon must not be duplicated by a generic encounter marker');
  map.update('en',[],7);
  assert.equal(icon().children.find(node=>node.tag==='title').textContent,FESTIVAL.label.en);
  assert.equal(icon().children.filter(node=>node.tag==='circle').length,15);
  assert.deepEqual(selections,[]);
});

test('map coordinates retain the actual road bends and chronological northward direction',()=>{
  for (const distance of Array.from({length:124},(_,index)=>Math.min(ROAD_LENGTH,index*100))) {
    const point=mapPoint(distance),road=sampleRoad(distance);
    assert.ok(Math.abs(point.x*4-(190+road.x*.17))<.000001);
    assert.ok(point.x>30&&point.x<65&&point.y>0&&point.y<100);
  }
  for(const [index,station] of STATIONS.entries()) if(index>0) assert.ok(mapPoint(station.distance).y<mapPoint(STATIONS[index-1].distance).y);
  assert.deepEqual(mapPoint(-100),mapPoint(0));
  assert.deepEqual(mapPoint(Infinity),mapPoint(0));
  assert.deepEqual(mapPoint(99999),mapPoint(ROAD_LENGTH));
});

test('the displayed road uses the complete sampled path rather than milestone-to-milestone curves',()=>{
  const path=mapRoadPath(),first=mapPoint(0),last=mapPoint(ROAD_LENGTH);
  assert.ok(path.startsWith(`M ${first.x*4} ${first.y*6}`));
  assert.ok(path.endsWith(`L ${last.x*4} ${last.y*6}`));
  assert.ok(path.split(' L ').length>170);
  assert.equal(path.includes('C'),false);
});

test('the actual closed serpentine circuit branches right after Netwise',()=>{
  const geometry=mapTrackGeometry(),roadEntry=mapPoint(TRACK_ACCESS.approach.distance);
  const entry={x:roadEntry.x+(TRACK_ACCESS.approach.x-sampleRoad(TRACK_ACCESS.approach.distance).x)*.17/4,y:roadEntry.y};
  assert.deepEqual(geometry.entry,entry);
  assert.ok(geometry.branch.startsWith(`M ${entry.x*4} ${entry.y*6}`));
  assert.ok(geometry.circuit.endsWith(' Z'));
  assert.ok(entry.y<mapPoint(STATIONS[8].distance).y);
  assert.ok(geometry.branch.endsWith(`L ${geometry.gate.x} ${geometry.gate.y}`));
  assert.ok(geometry.circuit.startsWith(`M ${geometry.gate.x} ${geometry.gate.y}`),'branch and circuit meet at one shared gate');
  const branchNumbers=geometry.branch.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const access=[TRACK_ACCESS.approach,...TRACK_ACCESS.points];
  assert.equal(branchNumbers.length,access.length*2);
  assert.ok((entry.x-roadEntry.x)*4<292*.08/2,'the compact map junction must touch the displayed main-road asphalt');
  for(const [index,point] of access.entries()) {
    const road=mapPoint(point.distance);
    assert.equal(branchNumbers[index*2],road.x*4+(point.x-sampleRoad(point.distance).x)*.17);
    assert.equal(branchNumbers[index*2+1],road.y*6);
  }
  const circuitNumbers=geometry.circuit.match(/-?\d+(?:\.\d+)?/g).map(Number);
  for(let index=0;index<circuitNumbers.length;index+=2){assert.ok(circuitNumbers[index]>=0&&circuitNumbers[index]<=400);assert.ok(circuitNumbers[index+1]>0&&circuitNumbers[index+1]<100);}
});

test('rendered geography includes every region, landmark, lane profile and side circuit',()=>{
  const {container}=createMap(),nodes=descendants(container);
  assert.deepEqual(nodes.filter(node=>node.attributes['data-region']).map(node=>node.attributes['data-region']),WORLD_REGIONS.map(region=>region.id));
  assert.deepEqual(nodes.filter(node=>node.attributes['data-map-landmark']).map(node=>node.attributes['data-map-landmark']),STATIONS.map(station=>station.id));
  assert.deepEqual(nodes.filter(node=>node.attributes['data-lanes']).map(node=>node.attributes['data-lanes']),['1','2','2','4']);
  assert.equal(nodes.filter(node=>node.attributes['data-map-track']==='circuit').length,1);
});

test('native chapter controls follow actual coordinates and invoke only the selected route',()=>{
  const {map,points,selections}=createMap();
  map.update('pl',[0,3],8);
  assert.equal(points.children.length,10);
  for (const [index,button] of points.children.entries()) {
    const point=mapPoint(STATIONS[index].distance);
    assert.equal(button.style.left,`${point.x}%`);assert.equal(button.style.top,`${point.y}%`);
    assert.match(button.attributes['aria-label'],new RegExp(STATIONS[index].year.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  }
  assert.equal(points.children[8].attributes['aria-current'],'step');
  points.children[8].listeners.get('click')();
  assert.deepEqual(selections,[8]);
});

test('optional NPC spots remain decorative, translate titles and never route the car',()=>{
  const {map,container,selections}=createMap();
  map.setSideStories([{id:'music',distance:4850,side:-1,label:{pl:'Muzyka i montaż',en:'Music and editing'},kind:'music'}]);
  let spot=descendants(container).find(node=>node.attributes['data-map-side-story']==='music');
  assert.equal(spot.children.find(node=>node.tag==='title').textContent,'Muzyka i montaż');
  assert.equal(spot.listeners.size,0);assert.deepEqual(selections,[]);
  map.update('en',[],0);
  spot=descendants(container).find(node=>node.attributes['data-map-side-story']==='music');
  assert.equal(spot.children.find(node=>node.tag==='title').textContent,'Music and editing');
  assert.ok(descendants(container).some(node=>node.textContent==='CIRCUIT'));
});

test('the car marker stays on the same transformed road through language and progress updates',()=>{
  const {map,car,container}=createMap();
  map.setDistance(6725);const point=mapPoint(6725);
  assert.equal(car.style.left,`${point.x}%`);assert.equal(car.style.top,`${point.y}%`);
  map.update('en',[0,1,2],4);
  assert.equal(car.style.left,`${point.x}%`);assert.equal(car.style.top,`${point.y}%`);
  assert.equal(container.dataset.distance,'6725');
});

test('the car marker follows the actual free-driving lateral position and retains it across map updates',()=>{
  const {map,car,container}=createMap();
  const distance=10880,lane=330;
  map.setDistance(distance,lane);
  const point=mapPoint(distance),left=`${point.x+lane*.17/4}%`;
  assert.equal(car.style.left,left);
  assert.equal(car.style.top,`${point.y}%`);
  assert.equal(container.dataset.lane,String(lane));
  map.update('en',[0,4],8);
  assert.equal(car.style.left,left,'changing language or progress must not snap the parked car onto the road');
  map.update('pl',[0,4,8],9);
  assert.equal(car.style.left,left);
  map.setDistance(distance,-100000);assert.equal(car.style.left,'0%');
  map.setDistance(distance,100000);assert.equal(car.style.left,'100%');
  map.setDistance(distance,NaN);assert.equal(car.style.left,`${point.x}%`);
  map.setDistance(distance,80);map.setDistance(distance);assert.equal(car.style.left,`${point.x}%`,'the optional lane defaults to the road centre');
});

test('parking markers use the same road transform and physical side offset without offering teleport controls',()=>{
  const {map,container,selections}=createMap();
  const garages=[{id:'cmax',distance:5650,side:-1,offset:225},{id:'focus',distance:10880,side:1,offset:330}];
  map.setGarages(garages);
  for(const garage of garages) {
    const marker=descendants(container).find(node=>node.attributes['data-map-garage']===garage.id);
    const point=mapPoint(garage.distance),x=point.x*4+garage.side*garage.offset*.17,y=point.y*6;
    const box=marker.children.find(node=>node.tag==='rect');
    assert.equal(Number(box.attributes.x)+8,x);
    assert.equal(Number(box.attributes.y)+8,y);
    assert.ok(marker.children.some(node=>node.tag==='text'&&node.textContent==='P'));
    const entrance=garageAccess(garage).entrance,entry=mapPoint(entrance.distance);
    const driveway=marker.children.find(node=>node.attributes['data-map-driveway']===garage.id);
    assert.equal(driveway.attributes.d,mapGarageAccessPath(garage));
    assert.ok(driveway.attributes.d.startsWith(`M ${entry.x*4+(entrance.x-sampleRoad(entrance.distance).x)*.17} ${entry.y*6}`));
    assert.ok(driveway.attributes.d.endsWith(`L ${x} ${y}`));
    assert.ok(driveway.attributes.d.split(' L ').length>30,'the map follows the bends rather than a straight shortcut');
    assert.ok(!marker.children.some(node=>/C-Max|Focus|\bST\b/.test(node.textContent)),'the parking marker must not reveal future models');
    assert.equal(marker.listeners.size,0);
  }
  assert.deepEqual(selections,[]);
  map.setSideStories([{id:'robot',distance:7350,side:1,label:{pl:'Robot',en:'Robot'},kind:'robot'}]);
  assert.equal(descendants(container).filter(node=>node.attributes['data-map-garage']).length,2,'painting NPC spots must retain parking markers');
  map.update('en',[],0);
  assert.equal(descendants(container).filter(node=>node.attributes['data-map-garage']).length,2);
  assert.equal(descendants(container).filter(node=>node.tag==='title'&&node.textContent==='Car park').length,2);
  map.setGarages([]);
  assert.equal(descendants(container).filter(node=>node.attributes['data-map-garage']).length,0);
});
