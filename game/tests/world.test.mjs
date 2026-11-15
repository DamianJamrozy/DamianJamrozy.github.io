import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { CareerWorld, ROAD_LENGTH, STATIONS, sampleRoad } from '../career-drive/world.js';
import { WORLD_REGIONS, getWorldRegion } from '../career-drive/regions.js';
import { AWARD_PODIUM, paintLifeScene } from '../career-drive/world-life.js';
import { GARAGES, VEHICLES, paintVehicle } from '../career-drive/vehicles.js';
import { roadProfile } from '../career-drive/road-layout.js';
import { SIDE_STORIES } from '../career-drive/side-stories.js';
import { FESTIVAL } from '../career-drive/festival.js';
import { garageAccess,distanceToGarageAccess,isGaragePaved } from '../career-drive/garage-layout.js';
import { TRACK_ACCESS, trackAccessIntersectsBounds } from '../career-drive/track-access.js';

const browserGlobals = ['window', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame'];
const previousGlobals = new Map();

function createCanvas(width = 1050) {
  const gradient = { addColorStop() {} };
  const context = new Proxy({
    measureText: text => ({ width: text.length * 6 }),
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
  }, {
    get: (target, key) => Reflect.get(target, key) ?? (() => {}),
  });
  const listeners = new Map();
  return {
    width: 0,
    height: 0,
    dataset: {},
    getContext: () => context,
    getBoundingClientRect: () => ({ width, height: 700, left: 0, top: 0 }),
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: type => listeners.delete(type),
    click: point => listeners.get('click')?.({ clientX: point.x, clientY: point.y }),
  };
}

before(() => {
  for (const name of browserGlobals) previousGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.assign(globalThis, {
    window: { devicePixelRatio: 1, matchMedia: () => ({ matches: false }) },
    ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  });
});

after(() => {
  for (const [name, descriptor] of previousGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

function createWorld(context, events = {}, width = 1050) {
  const canvas = createCanvas(width);
  const arrivals = [];
  const locations = [];
  const world = new CareerWorld(canvas, {
    onArrive: index => arrivals.push(index),
    onSpeed() {},
    onLocation: (distance, nextStation) => locations.push({ distance, nextStation }),
    ...events,
  });
  context.after(() => world.destroy());
  return { world, canvas, arrivals, locations };
}

const forward = { forward: true, backward: false, left: false, right: false };

test('the ten milestones follow one finite chronological road ending in the present and future', () => {
  assert.equal(STATIONS.length, 10);
  assert.equal(ROAD_LENGTH,12300);
  assert.deepEqual(STATIONS.map(station => station.id), ['school', 'internship', 'studies', 'university', 'systems', 'learning', 'design', 'community', 'netwise', 'next']);
  assert.equal(STATIONS[8].year,'06.2026');
  assert.equal(STATIONS[8].place,'WARSZAWA · NETWISE');
  assert.match(STATIONS[6].place,/TORUŃ/);
  assert.ok(STATIONS[0].distance > 0);
  assert.ok(STATIONS.at(-1).distance < ROAD_LENGTH);
  for (const [index, station] of STATIONS.entries()) {
    if (index > 0) assert.ok(station.distance > STATIONS[index - 1].distance);
    assert.equal(station.x, sampleRoad(station.distance).x);
    assert.equal(station.y, -station.distance);
  }
});

test('all 100 autopilot routes move continuously along the same road and arrive once', context => {
  const { world, arrivals } = createWorld(context);
  for (const origin of STATIONS) {
    for (const [target, destination] of STATIONS.entries()) {
      world.restoreDistance(origin.distance);
      world.start();
      world.navigateTo(target);
      const arrivalsBefore = arrivals.length;
      let steps = 0;

      while (world.getState().target !== null && steps < 5000) {
        const previous = world.getState();
        world.update(1 / 60);
        const current = world.getState();
        assert.ok(Math.abs(current.distance - previous.distance) <= 3.25001, `Route ${origin.id} → ${destination.id} teleported`);
        assert.ok(Math.abs(current.x-sampleRoad(current.distance).x)<roadProfile(current.distance).width/2,'autopilot keeps the car inside the road');
        assert.ok(Math.abs(current.x-previous.x)<=3.25001,'autopilot horizontal movement is continuous');
        assert.equal(current.y, -current.distance);
        assert.ok(current.distance >= 0 && current.distance <= ROAD_LENGTH);
        steps += 1;
      }

      assert.equal(world.getState().target, null, `Route ${origin.id} → ${destination.id} did not finish`);
      assert.equal(world.getState().distance, destination.distance);
      assert.equal(world.getState().speed, 0);
      assert.deepEqual(arrivals.slice(arrivalsBefore), [target]);
      world.update(1 / 60);
      assert.equal(arrivals.length, arrivalsBefore + 1);
    }
  }
});

test('manual driving announces a nearby milestone once and crosses it without stopping or snapping', context => {
  const { world, arrivals } = createWorld(context);
  world.start();
  world.setInput(forward);
  let previous = world.getState().distance;
  let crossingSpeed = 0;
  for (let step = 0; step < 240; step += 1) {
    world.update(1 / 60);
    const current = world.getState().distance;
    assert.ok(current >= previous);
    if(previous<STATIONS[0].distance && current>=STATIONS[0].distance) crossingSpeed=world.getState().speed;
    previous = current;
  }
  assert.deepEqual(arrivals, [0]);
  assert.ok(world.getState().distance > STATIONS[0].distance);
  assert.ok(crossingSpeed>20,'passing an interaction zone must not brake the car');
});

test('cancelling a route for a dialogue cannot resume its old destination', context => {
  const { world, arrivals } = createWorld(context);
  world.start();
  world.navigateTo(8);
  world.tick(1000);
  world.tick(1020);
  assert.equal(world.getState().target, 8);
  assert.ok(world.getState().speed > 0);
  world.setPaused(true);
  world.cancelNavigation();
  const parked = world.getState().distance;
  world.setPaused(false);
  for (let step = 1; step <= 250; step += 1) world.tick(2000 + step * 20);
  assert.equal(world.getState().distance, parked);
  assert.equal(world.getState().target, null);
  assert.equal(world.getState().speed, 0);
  assert.deepEqual(arrivals, []);
});

test('restoring a save clamps distance and snaps the camera without restoring movement', context => {
  const { world } = createWorld(context);
  world.start();
  world.navigateTo(8);
  world.setInput(forward);
  for (const invalid of [NaN, Infinity, -Infinity, -100]) {
    world.restoreDistance(invalid);
    assert.equal(world.getState().distance, 0);
  }
  world.restoreDistance(ROAD_LENGTH + 1000);
  assert.equal(world.getState().distance, ROAD_LENGTH);
  world.restoreDistance(4200);
  assert.equal(world.cameraDistance, 4200);
  assert.equal(world.cameraX, world.getState().x);
  assert.equal(world.getState().speed, 0);
  assert.equal(world.getState().target, null);
  assert.deepEqual(world.input, { forward: false, backward: false, left: false, right: false });
});

test('a restored stop does not immediately reopen while leaving its parking area', context => {
  const { world, arrivals } = createWorld(context);
  world.restoreDistance(STATIONS[2].distance);
  assert.equal(world.getNearestStation(), 2);
  world.start();
  world.setInput(forward);
  for (let step = 0; step < 100; step += 1) world.update(1 / 60);
  assert.deepEqual(arrivals, []);
  assert.ok(world.getState().distance > STATIONS[2].distance + 100);
});

test('manual steering rotates a moving car, never strafes a parked car, and respects finite world bounds',context=>{
  const {world}=createWorld(context);
  world.restorePosition({distance:3000,lane:0,heading:0});world.start();
  world.setInput({forward:false,backward:false,left:true,right:false});
  const parked=world.getState();
  for(let step=0;step<100;step++) world.update(1/60);
  assert.equal(world.getState().x,parked.x);assert.equal(world.getState().distance,parked.distance);
  world.setInput({forward:true,backward:false,left:false,right:true});
  for(let step=0;step<900;step++) world.update(1/60);
  const moved=world.getState();
  assert.ok(Math.abs(moved.x-parked.x)>20);assert.ok(Math.abs(moved.heading)>1);
  assert.ok(Math.abs(moved.lane)<=700&&moved.distance>=0&&moved.distance<=ROAD_LENGTH);
  world.restorePosition({distance:0,lane:0,heading:0});world.setInput({forward:false,backward:true,left:false,right:false});
  for(let step=0;step<100;step++) world.update(1/60);
  assert.equal(world.getState().distance,0);assert.equal(world.getState().speed,0);
});

test('reset parks the car at the village start and clears active controls', context => {
  const { world, arrivals } = createWorld(context);
  world.restoreDistance(9400);
  world.start();
  world.navigateTo(8);
  world.update(0.04);
  world.setInput({ forward: true, backward: false, left: true, right: false });
  world.reset();
  assert.deepEqual(world.getState(), {x:14,y:-0,speed:0,target:null,paused:true,distance:0,progress:0,nextStation:0,nearbyStation:null,vehicle:'taxi',lights:false,trackNearby:false,nearbySideStory:null,nearbyGarage:null,garageTarget:null,lane:14,heading:sampleRoad(0).angle,drifting:false,onRoad:true,boarding:false,garages:{cmax:{parkedVehicle:'cmax',exchanged:false},focus:{parkedVehicle:'focus',exchanged:false}}});
  assert.equal(world.car.lane, 14);
  assert.equal(world.cameraDistance, 0);
  assert.equal(world.manualActive, false);
  assert.deepEqual(world.input, { forward: false, backward: false, left: false, right: false });
  world.start();
  world.tick(1000);
  world.tick(1020);
  assert.equal(world.getState().distance, 0);
  assert.deepEqual(arrivals, []);
});

test('a nearby date sign can select a destination before starting the engine', context => {
  const selected = [];
  const { world, canvas } = createWorld(context, { onNavigate: index => selected.push(index) });
  const station = STATIONS[0];
  canvas.click(world.screen(station.x + 118, station.distance, 20));
  assert.deepEqual(selected, [0]);
  assert.equal(world.getState().paused, true);
  assert.equal(world.getState().target, null);
});

test('mobile landmarks move closer to the road without separating their hit areas', context => {
  const selected = [];
  const { world, canvas } = createWorld(context, { onNavigate: index => selected.push(index) }, 390);
  assert.equal(world.landmarkOffset, 195);
  assert.equal(world.scale, 0.62);
  const station = STATIONS[2];
  world.restoreDistance(station.distance);
  canvas.click(world.screen(station.x - 195, station.distance, 65));
  canvas.click(world.screen(station.x + 118, station.distance, 20));
  assert.deepEqual(selected, [2, 2]);
  assert.equal(world.getState().paused, true);
});

test('each career location has its own terrain identity and readable city metadata',()=>{
  assert.equal(WORLD_REGIONS.length,10);
  assert.equal(new Set(WORLD_REGIONS.map(region=>region.ground)).size,10);
  assert.equal(getWorldRegion(300).id,'village');
  assert.equal(getWorldRegion(1600).id,'town');
  assert.equal(getWorldRegion(2900).city.pl,'Rzeszów');
  assert.equal(getWorldRegion(8100).city.pl,'Toruń');
  assert.equal(getWorldRegion(9400).city.pl,'Poznań · ASBiR');
  assert.equal(getWorldRegion(9400).city.en,'Poznań · ASBiR');
  assert.equal(getWorldRegion(10700).city.pl,'Warszawa');
  assert.equal(getWorldRegion(12000).id,'future');
  for(const [index,region] of WORLD_REGIONS.entries()) {
    if(index) assert.equal(region.start,WORLD_REGIONS[index-1].end);
    assert.ok(region.end>region.start);
    assert.ok(region.city.pl&&region.city.en);
  }
});

test('ambient life keeps moving while parked but freezes on pause and animation opt-out',context=>{
  const {world}=createWorld(context);
  world.start();
  world.tick(1000);world.tick(1040);world.tick(1080);
  assert.ok(world.animationTime>0);
  assert.equal(world.getState().distance,0);
  const activeTime=world.animationTime;
  world.setPaused(true);world.tick(1200);world.tick(1240);
  assert.equal(world.animationTime,activeTime);
  world.setPaused(false);world.setAnimationsEnabled(false);
  world.tick(1300);world.tick(1340);
  assert.equal(world.animationTime,activeTime);
  world.setInput(forward);world.tick(1380);world.tick(1420);
  assert.ok(world.getState().distance>0,'decorative opt-out must not disable driving');
  assert.equal(world.animationTime,activeTime);
  world.setInput({forward:false,backward:false,left:false,right:false});
  world.setAnimationsEnabled(true);world.reducedMotion=true;
  world.tick(1460);world.tick(1500);
  assert.equal(world.animationTime,activeTime);
});

test('the award podium always places Damian second with the correct relative platform height',()=>{
  const damian=AWARD_PODIUM.find(podium=>podium.participant==='damian');
  assert.equal(damian.rank,2);
  assert.deepEqual(AWARD_PODIUM.map(podium=>podium.rank).sort(),[1,2,3]);
  assert.ok(AWARD_PODIUM.find(podium=>podium.rank===1).height>damian.height);
  assert.ok(AWARD_PODIUM.find(podium=>podium.rank===3).height<damian.height);
});

test('shared school, award, teaching and design scenes draw different activity as time advances',()=>{
  function trace(kind,time) {
    const calls=[];
    const ctx=new Proxy({}, {
      get:(_,key)=>key==='measureText'?text=>({width:text.length*6}):(...args)=>{calls.push([key,...args]);},
      set:(_,key,value)=>{calls.push(['set',key,typeof value==='object'?'gradient':value]);return true;},
    });
    paintLifeScene(ctx,kind,time,'pl');
    return calls;
  }
  for(const kind of ['school','award','lecture','design','netwise','community']) {
    assert.notDeepEqual(trace(kind,0),trace(kind,3.1),`${kind} must contain visible activity`);
  }
  const award=trace('award',3);
  const second=award.find(call=>call[0]==='fillText'&&call[1]==='2');
  const damian=award.find(call=>call[0]==='fillText'&&call[1]==='DAMIAN');
  assert.equal(second[2],damian[2]);
});

test('interaction zones are bounded and selecting an autopilot target does not expose a distant story zone',context=>{
  const {world}=createWorld(context);
  world.restoreDistance(STATIONS[4].distance-126);
  assert.equal(world.getNearestStation(),null);
  world.navigateTo(8);
  assert.equal(world.getState().nearbyStation,null);
  world.restoreDistance(STATIONS[4].distance-124);
  assert.equal(world.getState().nearbyStation,4);
  world.restoreDistance(STATIONS[4].distance+126);
  assert.equal(world.getNearestStation(),null);
});

test('cars change only through explicit selection and never just because a milestone is crossed',context=>{
  const {world}=createWorld(context);
  for(const distance of [0,5500,10700,12300]) {world.restoreDistance(distance);assert.equal(world.getState().vehicle,'taxi');}
  world.setVehicle('cmax');world.restoreDistance(10700);assert.equal(world.getState().vehicle,'cmax');
  world.setVehicle('focus');world.restoreDistance(1600);assert.equal(world.getState().vehicle,'focus');
  assert.match(VEHICLES.cmax.detail.pl,/115 KM/);assert.match(VEHICLES.cmax.detail.pl,/200 000/);
  assert.match(VEHICLES.focus.label.pl,/2018/);assert.match(VEHICLES.focus.detail.pl,/ponad 300 KM/);
});

test('headlights and horn respond while driving, pause silences their transient effects, and reset clears them',context=>{
  const {world,canvas}=createWorld(context);
  assert.equal(world.toggleLights(),false);
  world.honk();assert.equal(world.hornTime,0);
  world.start();
  assert.equal(world.toggleLights(),true);
  world.honk();assert.ok(world.hornTime>0);
  world.render();
  assert.equal(canvas.dataset.lights,'true');
  world.setPaused(true);assert.equal(world.hornTime,0);
  assert.equal(world.toggleLights(),true);
  world.setPaused(false);assert.equal(world.toggleLights(),false);
  world.reset();assert.equal(world.getState().lights,false);
});

test('Focus throttle release emits a bounded exhaust pulse; taxi and diesel do not',context=>{
  const {world}=createWorld(context);
  const coast={forward:false,backward:false,left:false,right:false};
  for(const distance of [300,5500,10700]) {
    world.restoreDistance(distance);world.setVehicle(distance===10700?'focus':distance===5500?'cmax':'taxi');world.start();world.setInput(forward);
    for(let step=0;step<90;step++) world.update(1/60);
    world.setInput(coast);world.update(1/60);
    assert.equal(world.exhaustTime>0,distance===10700);
  }
  world.tick(1000);
  for(let step=1;step<30;step++) world.tick(1000+step*20);
  assert.equal(world.exhaustTime,0);
});

test('every selected car can enter only at the physical circuit gate after an intentional turn',context=>{
  const entries=[];const {world}=createWorld(context,{onTrackEnter:()=>entries.push(true)});
  for(const vehicle of ['taxi','cmax','focus']) {
    world.setVehicle(vehicle);
    world.restorePosition({distance:TRACK_ACCESS.entry.distance,lane:0,heading:0});world.start();
    assert.equal(world.getState().trackNearby,false,'driving past the exit is not entry');
    world.restorePosition({distance:TRACK_ACCESS.gate.distance,lane:-500,heading:0});
    assert.equal(world.getState().trackNearby,false,'the opposite side cannot open the circuit');
    world.restorePosition({distance:TRACK_ACCESS.gate.distance,lane:TRACK_ACCESS.gate.x-sampleRoad(TRACK_ACCESS.gate.distance).x,heading:Math.PI/2});
    assert.equal(world.getState().trackNearby,true,vehicle);
    assert.equal(world.getState().vehicle,vehicle);
    world.setInput({forward:true,backward:false,left:false,right:true});
    const before=entries.length;
    for(let step=0;step<50;step++) world.update(1/60);
    assert.equal(entries.length,before+1,vehicle);
    assert.equal(world.getState().vehicle,vehicle,'the gate cannot exchange the car');
  }
  assert.equal(world.getNearestStation(),null);
  world.restoreDistance(11000);assert.equal(world.getState().trackNearby,false);
});

test('the complete branch is paved, its curb stays outside the main lanes and projected scenery cannot cover it',context=>{
  for(const width of [390,1050]) {
    const {world}=createWorld(context,{},width);
    world.start();
    for(const point of TRACK_ACCESS.points) {
      world.restorePosition({distance:point.distance,lane:point.x-sampleRoad(point.distance).x,heading:0});
      assert.equal(world.getState().onRoad,true,`${width}: access asphalt must have normal grip`);
    }
    const painted=[];
    world.paintScenery=(_ctx,item)=>painted.push(item);
    world.restoreDistance(11500);world.render();
    assert.ok(painted.length>0);
    for(const item of painted) {
      const x=sampleRoad(item.distance).x+item.offset;
      const facade=item.kind==='block'||item.kind==='house'||(item.kind==='tree'&&getWorldRegion(item.distance).id==='warsaw'&&item.seed%3===0);
      const half=facade?95:item.kind==='pedestrians'?115:60,height=facade?270:item.kind==='pedestrians'?100:105;
      assert.equal(trackAccessIntersectsBounds({left:x-half,right:x+half,minDistance:item.distance-45/.72,maxDistance:item.distance+height/.72}),false,`${width}: ${item.kind} cannot cover the road`);
    }
    const paths=[];let path=[];
    world.ctx.beginPath=()=>{path=[];};
    world.ctx.moveTo=(x,y)=>path.push({x,y});world.ctx.lineTo=(x,y)=>path.push({x,y});
    world.ctx.stroke=()=>paths.push({points:[...path],width:world.ctx.lineWidth});
    world.paintTrackEntrance(world.ctx);
    const curb=paths.find(item=>Math.abs(item.width-(TRACK_ACCESS.width+TRACK_ACCESS.shoulder*2)*world.scale)<.001);
    assert.ok(curb&&curb.points.length>1);
    const first=TRACK_ACCESS.points[TRACK_ACCESS.points.length-curb.points.length];
    const roadRight=world.screen(sampleRoad(first.distance).x+roadProfile(first.distance).width/2,first.distance).x;
    assert.ok(curb.points[0].x-curb.width/2>=roadRight-.01,'the round curb cap must not form an island in the main road');
  }
});

test('drive telemetry carries the current powertrain and control state at a bounded rate',context=>{
  const samples=[];
  const {world}=createWorld(context,{onDrive:sample=>samples.push(sample)});
  world.restoreDistance(10700);world.setVehicle('focus');world.start();world.setInput(forward);
  world.tick(1000);
  for(let step=1;step<=60;step++) world.tick(1000+step*1000/60);
  assert.ok(samples.length>=15&&samples.length<=20);
  const sample=samples.at(-1);
  assert.equal(sample.vehicle,'focus');assert.equal(sample.throttle,true);assert.equal(sample.paused,false);assert.ok(sample.speed>0);
  world.setPaused(true);
  for(let step=61;step<=70;step++) world.tick(1000+step*1000/60);
  assert.equal(samples.at(-1).paused,true);assert.equal(samples.at(-1).throttle,false);
});

test('the cars use distinct bodies, taxi sign, C-Max silhouette and Focus ST exhaust rather than palette swaps',()=>{
  function trace(id,options={}) {
    const calls=[];
    const gradient={addColorStop:(...args)=>calls.push(['color',...args])};
    const ctx=new Proxy({createLinearGradient:()=>gradient},{
      get:(target,key)=>Reflect.get(target,key)??((...args)=>calls.push([key,...args])),
      set:(_,key,value)=>{calls.push(['set',key,typeof value==='object'?'gradient':value]);return true;},
    });
    paintVehicle(ctx,id,options);return calls;
  }
  const taxi=trace('taxi'),cmax=trace('cmax'),focus=trace('focus');
  assert.ok(taxi.some(call=>call[0]==='fillText'&&call[1]==='TAXI'));
  assert.ok(focus.some(call=>call[0]==='fillText'&&call[1]==='ST'));
  assert.notDeepEqual(cmax,focus);
  assert.notDeepEqual(trace('focus',{exhaust:true,time:2}),focus);
  assert.notDeepEqual(trace('cmax',{lights:true}),cmax);
  assert.deepEqual(trace('taxi',{exhaust:true}),taxi);
});

test('roads evolve from a narrow gravel lane to paved town, city and divided Warsaw streets',()=>{
  const profiles=[roadProfile(300),roadProfile(1600),roadProfile(2900),roadProfile(10700)];
  assert.deepEqual(profiles.map(profile=>profile.surface),['gravel','asphalt','asphalt','asphalt']);
  assert.deepEqual(profiles.map(profile=>profile.lanes),[1,2,2,4]);
  assert.ok(profiles[0].width<profiles[1].width&&profiles[1].width<profiles[2].width&&profiles[2].width<profiles[3].width);
  assert.equal(profiles[2].median,0);assert.ok(profiles[3].median>0);
  assert.equal(roadProfile(NaN).surface,'gravel');
});

test('manual driving can leave every road profile; grass slows the car without blocking the player',context=>{
  const {world}=createWorld(context);const speeds=[];
  for(const lane of [0,400]) {
    world.restorePosition({distance:3000,lane,heading:0});world.start();world.setInput(forward);
    for(let step=0;step<60;step++) world.update(1/60);
    speeds.push(world.getState().speed);
    assert.equal(world.getState().onRoad,lane===0);
    assert.ok(world.getState().distance>3000);
  }
  assert.ok(speeds[0]>speeds[1]*1.5);
});

test('fast map travel follows the same curve continuously and arrives three times sooner',context=>{
  const {world,arrivals}=createWorld(context);
  const steps=[];
  for(const mode of ['normal','fast']) {
    world.restoreDistance(300);world.start();world.setTravelSpeed(mode);world.navigateTo(8);
    let count=0;
    while(world.getState().target!==null&&count<5000) {
      const previous=world.getState().distance;
      world.update(1/60);
      const state=world.getState();
      assert.ok(state.distance-previous<=(mode==='fast'?9.75001:3.25001));
      assert.ok(Math.abs(state.x-sampleRoad(state.distance).x)<roadProfile(state.distance).width/2);
      count++;
    }
    assert.equal(world.getState().distance,10700);
    steps.push(count);
  }
  assert.ok(Math.abs(steps[0]/steps[1]-3)<.01);
  assert.deepEqual(arrivals,[8,8]);
});

test('optional encounters require physical proximity to their parking area, independently of milestones',context=>{
  const {world,arrivals}=createWorld(context);world.setSideStories(SIDE_STORIES);
  assert.equal(SIDE_STORIES.length,6);
  for(const spot of SIDE_STORIES) {
    world.restorePosition({distance:spot.distance,lane:0,heading:0});
    assert.equal(world.getState().nearbySideStory,null);
    const lane=spot.side*(spot.offset??(roadProfile(spot.distance).width/2+87));
    world.restorePosition({distance:spot.distance,lane,heading:0});
    assert.equal(world.getState().nearbySideStory,spot.id);assert.equal(world.getState().nearbyStation,null);
    world.restorePosition({distance:spot.distance,lane:-lane,heading:0});assert.equal(world.getState().nearbySideStory,null);
    world.restorePosition({distance:spot.distance+96,lane,heading:0});assert.equal(world.getState().nearbySideStory,null);
  }
  assert.deepEqual(arrivals,[]);
});

test('the early festival renders and interacts at its own right-hand grounds independently of ASBiR',context=>{
  const {world}=createWorld(context);world.setSideStories(SIDE_STORIES);
  const festival=SIDE_STORIES.find(spot=>spot.id==='festival');
  world.restorePosition({distance:FESTIVAL.distance,lane:FESTIVAL.offset,heading:0});
  assert.equal(world.getState().nearbySideStory,'festival');
  assert.equal(world.getState().onRoad,true,'the concert interaction area has the same driving surface as other event lots');
  assert.equal(world.sideStoryPosition(festival).x,sampleRoad(FESTIVAL.distance).x+FESTIVAL.offset);
  const labels=[];
  world.ctx.fillText=text=>labels.push(text);
  world.paintSideStories(world.ctx);
  assert.ok(labels.includes('KultURalia'));
  world.restoreDistance(STATIONS.find(station=>station.id==='community').distance);
  labels.length=0;
  world.paintSideStories(world.ctx);
  assert.ok(!labels.includes('KultURalia'),'visibility must follow the early festival, not the later ASBiR chapter');
});

test('free parking poses reload without snapping to the road, losing heading, or changing the selected car',context=>{
  const {world}=createWorld(context);
  world.setVehicle('cmax');
  const pose={distance:5730,lane:-345,heading:1.2};
  world.restorePosition(pose);
  const state=world.getState();
  assert.equal(state.distance,pose.distance);assert.equal(state.lane,pose.lane);assert.equal(state.heading,pose.heading);
  assert.equal(state.x,sampleRoad(pose.distance).x+pose.lane);assert.equal(world.cameraX,state.x);
  assert.equal(state.vehicle,'cmax');assert.equal(state.speed,0);assert.equal(state.target,null);
  world.restorePosition({distance:Infinity,lane:Infinity,heading:NaN});
  assert.equal(world.getState().distance,0);assert.equal(world.getState().lane,14);assert.ok(Number.isFinite(world.getState().heading));
  world.restorePosition({distance:ROAD_LENGTH+100,lane:10000,heading:Math.PI*100+.4});
  assert.equal(world.getState().distance,ROAD_LENGTH);assert.equal(world.getState().lane,700);assert.ok(Math.abs(world.getState().heading)<=Math.PI);
});

test('both garage autopilots approach their off-road parking continuously and stop without switching cars or opening stories',context=>{
  const parked=[];
  const {world,arrivals}=createWorld(context,{onGarageArrive:id=>parked.push(id)});
  for(const garage of GARAGES) {
    world.restorePosition({distance:garage.distance-250,lane:400,heading:0});world.start();world.setTravelSpeed('fast');world.navigateToGarage(garage.id);
    assert.equal(world.getState().garageTarget,garage.id);
    let frames=0;
    while(world.getState().garageTarget!==null&&frames<1000) {
      const previous=world.getState();world.update(1/60);const current=world.getState();
      assert.ok(Math.abs(current.distance-previous.distance)<=9.75001);assert.ok(Math.abs(current.x-previous.x)<=9.75001);
      frames++;
    }
    assert.ok(frames<1000);assert.equal(world.getState().nearbyGarage,garage.id);
    assert.equal(world.getState().vehicle,'taxi');assert.equal(world.getState().speed,0);
    const parkedPosition=world.garageParkedPosition(garage);
    assert.equal(world.getState().heading,0);
    assert.ok(Math.abs(world.getState().x-parkedPosition.x)>(VEHICLES.taxi.width+VEHICLES[garage.id].width)/2,'autopilot docks in the empty bay without covering its parked car');
    assert.ok(Math.abs(world.getState().lane)>roadProfile(garage.distance).width/2);
  }
  assert.deepEqual(parked,['cmax','focus']);assert.deepEqual(arrivals,[]);
});

test('garage autopilots from either direction follow the same paved turns that manual drivers can use',context=>{
  const {world}=createWorld(context);
  for(const garage of GARAGES) for(const direction of [-1,1]) {
    const access=garageAccess(garage);
    world.restoreDistance(garage.distance+direction*520);world.start();world.setTravelSpeed('fast');world.navigateToGarage(garage.id);
    let steps=0,accessFrames=0;
    while(world.getState().garageTarget!==null && steps<1800) {
      const drivingAccess=world.garageDocking;
      const previous=world.getState();world.update(1/60);const state=world.getState();
      if(drivingAccess) {
        accessFrames++;
        assert.ok(isGaragePaved({x:state.x,distance:state.distance},garage));
        assert.ok(state.onRoad,'painted driveway must behave like pavement rather than grass');
        assert.ok(Math.hypot(state.x-previous.x,(state.distance-previous.distance)*.72)<=195*3*.72/60+.001);
      }
      steps++;
    }
    assert.ok(accessFrames>30 && steps<1800);
    for(const point of access.points) {
      world.restorePosition({distance:point.distance,lane:point.x-sampleRoad(point.distance).x,heading:0});
      assert.ok(world.getState().onRoad,'manual driving uses the same entire access corridor');
    }
  }
});

test('garage approaches clear roadside scenery and can redock from either parking bay without crossing the parked body',context=>{
  const {world}=createWorld(context);
  for(const garage of GARAGES) {
    const objects=[];
    world.restoreDistance(garageAccess(garage).entrance.distance+100);
    const paintScenery=world.paintScenery.bind(world);
    world.paintScenery=(ctx,object)=>{objects.push(object);paintScenery(ctx,object);};
    world.render();
    for(const object of objects) assert.ok(distanceToGarageAccess({x:sampleRoad(object.distance).x+object.offset,distance:object.distance},garage)>=95);
    world.paintScenery=paintScenery;
    for(const exchanged of [false,true]) {
      world.restoreGarages({cmax:{parkedVehicle:'cmax',exchanged:garage.id==='cmax'&&exchanged},focus:{parkedVehicle:'focus',exchanged:garage.id==='focus'&&exchanged}});
      const dock=world.garageDockPosition(garage),occupied=world.garageParkedPosition(garage);
      world.restorePosition({distance:dock.distance,lane:dock.x-sampleRoad(dock.distance).x,heading:0});world.start();world.navigateToGarage(garage.id);
      let steps=0;
      while(world.getState().garageTarget!==null && steps<1000) {
        world.update(1/60);const state=world.getState();
        if(Math.abs(state.distance-occupied.distance)*.72<90) assert.ok(Math.abs(state.x-occupied.x)>40);
        steps++;
      }
      assert.ok(steps<1000);assert.equal(world.getState().heading,0);
    }
  }
});

test('a garage route starting above a parked car moves sideways to the empty bay before approaching its position',context=>{
  const {world}=createWorld(context);
  for(const garage of GARAGES) {
    const occupied=world.garageParkedPosition(garage);
    const dock=world.garageDockPosition(garage);
    const distance=garage.distance+100;
    world.restorePosition({distance,lane:occupied.x-sampleRoad(distance).x,heading:0});world.start();world.navigateToGarage(garage.id);
    let steps=0;
    while(world.getState().garageTarget!==null && steps<1000) {
      world.update(1/60);const state=world.getState();
      if(Math.abs(state.x-dock.x)>.01) assert.equal(state.distance,distance,'first clear the occupied lane sideways');
      if(state.distance<distance-.01) assert.equal(state.x,dock.x,'longitudinal travel stays in the empty bay');
      assert.ok(isGaragePaved({x:state.x,distance:state.distance},garage));
      steps++;
    }
    assert.ok(steps<1000);assert.equal(world.getState().x,dock.x);assert.equal(world.getState().heading,0);
  }
});

test('station navigation first exits either garage along its paved driveway, then reaches the requested earlier or later chapter',context=>{
  const garageArrivals=[];
  const {world,arrivals}=createWorld(context,{onGarageArrive:id=>garageArrivals.push(id)});
  for(const garage of GARAGES) for(const exchanged of [false,true]) for(const destination of [0,9]) {
    world.restoreGarages({cmax:{parkedVehicle:'cmax',exchanged:garage.id==='cmax'&&exchanged},focus:{parkedVehicle:'focus',exchanged:garage.id==='focus'&&exchanged}});
    const dock=world.garageDockPosition(garage),occupied=world.garageParkedPosition(garage),access=garageAccess(garage);
    world.restorePosition({distance:dock.distance,lane:dock.x-sampleRoad(dock.distance).x,heading:0});world.start();world.setTravelSpeed('fast');world.navigateTo(destination);
    assert.equal(world.garageExiting,true);
    let steps=0;
    while(world.garageExiting && steps<1800) {
      world.update(1/60);const state=world.getState();
      assert.equal(state.target,destination,'the requested chapter stays selected throughout the driveway exit');
      assert.ok(state.onRoad && isGaragePaved({x:state.x,distance:state.distance},garage));
      if(Math.abs(state.distance-occupied.distance)*.72<90) assert.ok(Math.abs(state.x-occupied.x)>40);
      steps++;
    }
    assert.ok(steps<1800);
    assert.equal(world.getState().x,access.entrance.x);assert.equal(world.getState().distance,access.entrance.distance);
    assert.deepEqual(garageArrivals,[],'an exit is not another garage arrival');
    const previousArrivals=arrivals.length;
    while(world.getState().target!==null && steps<4000) {world.update(1/60);steps++;}
    assert.ok(steps<4000);assert.equal(arrivals.length,previousArrivals+1);assert.equal(arrivals.at(-1),destination);
  }
});

test('partial driveway exits can be interrupted without leaving a queued station route',context=>{
  const {world,arrivals}=createWorld(context);
  for(const cancellation of ['manual','cancel','reset']) {
    const garage=GARAGES[0],point=garageAccess(garage).points[28];
    world.restorePosition({distance:point.distance,lane:point.x-sampleRoad(point.distance).x,heading:0});world.start();world.navigateTo(9);
    assert.equal(world.garageExiting,true);
    world.update(1/60);
    if(cancellation==='manual') {world.setInput({...forward,left:true});world.update(1/60);world.setInput({forward:false,backward:false,left:false,right:false});}
    else if(cancellation==='cancel') world.cancelNavigation();
    else world.reset();
    assert.equal(world.getState().target,null);assert.equal(world.garageExiting,false);assert.deepEqual(world.garageRoute,[]);
    world.setPaused(false);
    for(let step=0;step<90;step++) world.update(1/60);
    assert.equal(world.getState().target,null);assert.equal(world.getState().garageTarget,null);
  }
  assert.deepEqual(arrivals,[]);
});

test('boarding swaps a parked model only after explicit confirmation and briefly holds movement during the walk',context=>{
  const {world}=createWorld(context);const garage=GARAGES[0];const point=world.garagePosition(garage);
  world.restorePosition({distance:garage.distance,lane:point.x-sampleRoad(garage.distance).x,heading:0});world.start();
  assert.equal(world.getState().vehicle,'taxi');assert.equal(world.getState().nearbyGarage,'cmax');
  world.boardVehicle('cmax');
  const boarded=world.getState();assert.equal(boarded.vehicle,'cmax');assert.equal(boarded.boarding,true);assert.equal(world.garageCars.get('cmax'),'taxi');
  world.setInput(forward);
  for(let step=0;step<45;step++) world.update(1/60);
  assert.equal(world.getState().distance,boarded.distance);assert.equal(world.getState().x,boarded.x);
  for(let step=0;step<30;step++) world.update(1/60);
  assert.equal(world.getState().boarding,false);assert.ok(world.getState().distance>boarded.distance);
  world.setVehicle('focus');world.restoreDistance(300);assert.equal(world.getState().vehicle,'focus');
});

test('holding Space while steering separates heading and velocity and leaves bounded skid marks in the main world',context=>{
  const {world}=createWorld(context);world.setVehicle('focus');world.restorePosition({distance:10200,lane:0,heading:sampleRoad(10200).angle});world.start();world.setInput(forward);
  for(let step=0;step<70;step++) world.update(1/60);
  world.setInput({...forward,right:true,drift:true});
  let drifted=false;
  for(let step=0;step<40;step++) {world.update(1/60);drifted ||= world.getState().drifting;}
  assert.equal(drifted,true);assert.ok(world.skids.length>0&&world.skids.length<=360);
  assert.ok(Number.isFinite(world.getState().x)&&Math.abs(world.getState().heading)<=Math.PI);
});

test('parking backgrounds render before the playable car and garage lots stay clear of building facades',context=>{
  const {world}=createWorld(context);const order=[];
  const paintGarages=world.paintGarages.bind(world),paintCar=world.paintCar.bind(world);
  world.paintGarages=ctx=>{order.push('parking');paintGarages(ctx);};
  world.paintCar=ctx=>{order.push('player');paintCar(ctx);};
  const garage=GARAGES.find(garage=>garage.id==='cmax');const position=world.garagePosition(garage);
  world.restorePosition({distance:garage.distance,lane:garage.side*garage.offset,heading:0});world.render();
  assert.ok(order.indexOf('parking')<order.indexOf('player'),'parking pavement must never cover the active car');
  const uci=STATIONS.find(station=>station.id==='systems');
  const facadeX=uci.x-world.landmarkOffsetFor(uci.distance);
  assert.ok(Math.abs(position.x-facadeX)>221,'the C-Max lot and the UCI facade occupy separate ground areas');
});

test('every playable car stays above world objects at encounters, concerts and garages on desktop and mobile',context=>{
  const scholarship=SIDE_STORIES.find(story=>story.id==='scholarship');
  const positions=[
    {name:'scholarship',distance:scholarship.distance,lane:scholarship.side*(roadProfile(scholarship.distance).width/2+87)},
    {name:'concert',distance:FESTIVAL.distance,lane:FESTIVAL.offset},
    ...GARAGES.map(garage=>({name:garage.id,distance:garage.distance,lane:garage.side*garage.offset}))
  ];
  const environmentMethods=['paintTerrain','paintRoad','paintGarages','paintSkids','paintInteractionZones','paintTrackEntrance','paintTraffic','paintTrafficLights','paintScenery','paintLandmark','paintLife','paintStationSigns','paintRegionSigns','paintSideStories'];
  for(const width of [1050,390]) {
    const {world}=createWorld(context,{},width);
    world.setSideStories(SIDE_STORIES);
    const order=[];
    for(const method of [...environmentMethods,'paintCar','paintBoarding']) {
      const paint=world[method].bind(world);
      world[method]=(...args)=>{order.push(method);return paint(...args);};
    }
    for(const vehicle of Object.keys(VEHICLES)) for(const position of positions) {
      world.setVehicle(vehicle);
      world.restorePosition({...position,heading:.4});
      order.length=0;
      world.render();
      const description=`${vehicle} at ${position.name}, width ${width}`;
      const playerIndex=order.indexOf('paintCar');
      assert.equal(order.filter(method=>method==='paintCar').length,1,`${description}: draw the active car once`);
      assert.ok(playerIndex>0,description);
      assert.ok(!order.slice(playerIndex+1).some(method=>environmentMethods.includes(method)),`${description}: scenery, people and signs must not cover the car`);
      for(const method of ['paintGarages','paintLife','paintStationSigns','paintRegionSigns','paintSideStories']) {
        assert.ok(order.includes(method),`${description}: verify the real ${method} pass`);
      }
      assert.ok(order.indexOf('paintBoarding')>playerIndex,`${description}: preserve the boarding character above the car`);
    }
  }
});

test('the Warsaw activity remains animated beyond the Focus collection lot',context=>{
  const {world}=createWorld(context);world.restoreDistance(10880);
  const positions=[];const screen=world.screen.bind(world);
  world.screen=(x,distance,height=0)=>{if(x!==0) positions.push({x,distance});return screen(x,distance,height);};
  world.paintLife(world.ctx);
  const netwise=STATIONS.find(station=>station.id==='netwise');
  const activity=positions.find(point=>point.x===netwise.x+Math.max(205,roadProfile(netwise.distance).width/2+120));
  assert.ok(activity&&activity.distance>GARAGES.find(garage=>garage.id==='focus').distance+240,'coding activity stays clear of the playable parking rectangle');
});

test('parked cars and their occupied bays reload without duplicating the active car',context=>{
  const {world}=createWorld(context);const garage=GARAGES[0];
  world.restorePosition({distance:garage.distance,lane:garage.side*garage.offset,heading:0});world.start();world.boardVehicle('cmax');
  const saved=world.getState();
  assert.equal(saved.garages.cmax.parkedVehicle,'taxi');assert.equal(saved.garages.cmax.exchanged,true);
  const snapshot=saved.garages;
  world.reset();world.setVehicle(saved.vehicle);world.restoreGarages(snapshot);world.restorePosition(saved);
  const restored=world.getState(),parked=world.garageParkedPosition(garage);
  assert.equal(restored.vehicle,'cmax');assert.equal(restored.garages.cmax.parkedVehicle,'taxi');assert.equal(restored.garages.cmax.exchanged,true);
  assert.ok(Math.abs(restored.x-parked.x)>VEHICLES.cmax.width,'parked taxi and active C-Max have separate bays after reload');
  restored.garages.cmax.parkedVehicle='focus';
  assert.equal(world.getState().garages.cmax.parkedVehicle,'taxi','state snapshots do not expose mutable internal garage storage');
});

test('garage docking avoids the occupied bay before and after a physical swap and leaves the car aligned',context=>{
  const {world}=createWorld(context);
  for(const garage of GARAGES) for(const exchanged of [false,true]) {
    world.restoreGarages({cmax:{parkedVehicle:exchanged?'taxi':'cmax',exchanged},focus:{parkedVehicle:exchanged?'cmax':'focus',exchanged}});
    world.setVehicle('taxi');world.restoreDistance(garage.distance-260);world.start();world.navigateToGarage(garage.id);
    const occupied=world.garageParkedPosition(garage);
    const parkedId=world.getState().garages[garage.id].parkedVehicle;
    let steps=0;
    while(world.getState().garageTarget!==null&&steps<1500) {
      world.update(1/60);const state=world.getState();
      if(Math.abs(state.distance-occupied.distance)*.72<90) assert.ok(Math.abs(state.x-occupied.x)>40,'final approach remains beside the parked body');
      steps++;
    }
    assert.ok(steps<1500);const docked=world.getState();
    assert.equal(docked.heading,0);assert.equal(docked.speed,0);
    assert.ok(Math.abs(docked.x-occupied.x)>(VEHICLES.taxi.width+VEHICLES[parkedId].width)/2);
    if(parkedId!=='taxi') {
      world.boardVehicle(parkedId);
      assert.equal(world.getState().garages[garage.id].exchanged,!exchanged);
      assert.equal(world.getState().x,occupied.x,'boarding walks to the car that was physically parked');
      assert.equal(world.getState().garages[garage.id].parkedVehicle,'taxi');
    }
  }
});
