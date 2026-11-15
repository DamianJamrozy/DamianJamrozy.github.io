import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { DriftTrack, TRACK_BOUNDS, TRACK_CHECKPOINTS, TRACK_ROUTE, nearestTrackPoint } from '../career-drive/drift-track.js';
import { VEHICLES } from '../career-drive/vehicles.js';

const globalNames=['window','document','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
const previousGlobals=new Map();
let hidden=false;
let reducedMotion=false;
let nextFrame=0;
const frames=new Map();
const visibilityListeners=new Set();

before(()=>{
  for (const name of globalNames) previousGlobals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));
  Object.assign(globalThis,{
    window:{devicePixelRatio:3,matchMedia:()=>({get matches(){return reducedMotion;},addEventListener(){},removeEventListener(){}})},
    document:{get hidden(){return hidden;},addEventListener:(type,listener)=>visibilityListeners.add(listener),removeEventListener:(type,listener)=>visibilityListeners.delete(listener)},
    ResizeObserver:class {observe(){} disconnect(){this.disconnected=true;}},
    requestAnimationFrame:callback=>{const id=++nextFrame;frames.set(id,callback);return id;},
    cancelAnimationFrame:id=>frames.delete(id)
  });
});
after(()=>{
  for (const [name,descriptor] of previousGlobals) {
    if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
  }
});

const forward={forward:true,backward:false,left:false,right:false,drift:false};
const resting={forward:false,backward:false,left:false,right:false,drift:false};

function createTrack(context,events={},width=1050) {
  hidden=false;reducedMotion=false;
  const gradient={addColorStop(){}};
  const labels=[];
  const drawing=new Proxy({labels,fillText:text=>labels.push(text),measureText:text=>({width:text.length*6}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(target,key)=>Reflect.get(target,key)??(()=>{})});
  const canvas={dataset:{},width:0,height:0,getContext:()=>drawing,getBoundingClientRect:()=>({width,height:700})};
  const updates=[],telemetry=[];
  const track=new DriftTrack(canvas,{onUpdate:state=>updates.push(state),onDrive:state=>telemetry.push(state),...events});
  context.after(()=>track.destroy());
  return {track,canvas,updates,telemetry,labels};
}

function advance(track,seconds) {
  for (let frame=0;frame<seconds*60;frame+=1) track.update(1/60);
}

test('the circuit is a finite, smooth closed serpentine with meaningful road distances',()=>{
  assert.equal(TRACK_CHECKPOINTS.length,16);
  assert.equal(TRACK_ROUTE.length,192);
  for (const [index,point] of TRACK_ROUTE.entries()) {
    assert.ok(point.x>0&&point.x<TRACK_BOUNDS.width);
    assert.ok(point.y>0&&point.y<TRACK_BOUNDS.height);
    const next=TRACK_ROUTE[(index+1)%TRACK_ROUTE.length];
    assert.ok(Math.hypot(point.x-next.x,point.y-next.y)<100);
    assert.ok(nearestTrackPoint(point).distance<.001);
  }
  assert.ok(nearestTrackPoint({x:1350,y:1190}).distance>200);
});

test('the track starts parked, accelerates continuously and slows more on grass',context=>{
  const {track}=createTrack(context);
  track.setInput(forward);advance(track,1);
  assert.equal(track.getState().x,350);
  track.start();track.setInput(forward);advance(track,1.5);
  const moving=track.getState();
  assert.ok(moving.x>500&&moving.speed>50);
  assert.equal(moving.onRoad,true);
  const onRoadVelocity=Math.hypot(track.car.vx,track.car.vy);
  track.car.y=1190;track.car.x=1350;
  advance(track,1);
  assert.equal(track.getState().onRoad,false);
  assert.ok(Math.hypot(track.car.vx,track.car.vy)<onRoadVelocity);
});

test('steering with a handbrake separates heading from velocity and earns actual slip score',context=>{
  const {track}=createTrack(context);
  track.start();track.setInput(forward);advance(track,1.2);
  const straight=track.getState();
  track.setInput({...forward,right:true,drift:true});
  let sawDrift=false;
  for(let step=0;step<60;step+=1){track.update(1/60);sawDrift ||= track.getState().drifting;}
  assert.ok(track.getState().heading>straight.heading+.3);
  assert.ok(sawDrift);
  assert.ok(track.getState().driftScore>0);
  track.reset();track.setInput({...resting,drift:true,right:true});advance(track,3);
  assert.equal(track.getState().driftScore,0);
});

test('braking reduces forward movement and holding reverse can drive backwards',context=>{
  const {track}=createTrack(context);
  track.start();track.setInput(forward);advance(track,1);
  const fast=track.getState().speed;
  track.setInput({...resting,backward:true});advance(track,.5);
  assert.ok(track.getState().speed<fast);
  advance(track,2);
  assert.ok(track.car.vx<0);
});

test('the perimeter constrains the car and grass limits forward speed',context=>{
  const {track}=createTrack(context);
  track.start();track.car.x=TRACK_BOUNDS.width+100;track.car.y=-100;track.car.vx=900;track.car.vy=-900;
  track.setInput(forward);track.update(1/60);
  assert.ok(track.getState().x<=TRACK_BOUNDS.width-65&&track.getState().y>=65);
  assert.equal(track.car.vx,0);assert.equal(track.car.vy,0);
});

test('lap counting requires all ordered checkpoints and cannot be farmed at the finish line',context=>{
  const {track}=createTrack(context);
  track.start();
  for(let pass=0;pass<5;pass+=1){Object.assign(track.car,TRACK_CHECKPOINTS[0]);track.updateCheckpoint();}
  assert.equal(track.getState().lap,0);
  for (const point of TRACK_CHECKPOINTS.slice(1)) { Object.assign(track.car,point);track.updateCheckpoint(); }
  assert.equal(track.getState().lap,0);
  Object.assign(track.car,TRACK_CHECKPOINTS[0]);track.updateCheckpoint();
  assert.equal(track.getState().lap,1);
  for (const point of [...TRACK_CHECKPOINTS].reverse()) { Object.assign(track.car,point);track.updateCheckpoint(); }
  assert.equal(track.getState().lap,1);
});

test('Focus overrun exhaust happens once on a fast lift-off and lights work independently',context=>{
  const {track,canvas}=createTrack(context,{},390);
  track.setVehicle('focus');
  track.start();track.setInput(forward);advance(track,1);
  track.setInput(resting);track.update(1/60);
  assert.equal(track.getState().exhaust,true);
  advance(track,.5);
  assert.equal(track.getState().exhaust,false);
  assert.equal(track.toggleLights(),true);
  track.honk();track.render();
  assert.equal(canvas.dataset.lights,'true');
  assert.equal(canvas.dataset.vehicle,'focus');
  assert.equal(canvas.dataset.track,'serpentine');
  assert.equal(canvas.width,Math.round(390*1.75));
});

test('every selected car keeps its model and engine telemetry on the circuit without advertising a future model',context=>{
  for(const vehicle of ['taxi','cmax','focus']) {
    const {track,canvas,telemetry,labels}=createTrack(context,{},390);
    assert.equal(track.getState().vehicle,'taxi');
    track.setVehicle(vehicle);track.start();track.setInput(forward);advance(track,.8);
    labels.length=0;track.render();track.publish();
    assert.equal(track.getState().vehicle,vehicle);
    assert.equal(canvas.dataset.vehicle,vehicle);
    assert.equal(telemetry.at(-1).vehicle,vehicle);
    assert.equal(telemetry.at(-1).throttle,true);
    assert.ok(labels.includes(vehicle==='taxi'?'TAXI':vehicle==='cmax'?'FORD C-MAX':'FORD FOCUS ST'));
    if(vehicle!=='focus') assert.ok(labels.every(label=>!/FOCUS|300\+|TOR ST|ST CIRCUIT/i.test(label)));
    track.setLanguage('en');labels.length=0;track.render();
    if(vehicle==='cmax') assert.ok(labels.includes('115 HP - DIESEL'));
    if(vehicle==='focus') assert.ok(labels.includes('300+ HP'));
    if(vehicle==='taxi') assert.ok(labels.includes('FREE DRIVING'));
  }
});

test('track acceleration and road speed caps follow each vehicle profile, with the tuned Focus fastest',context=>{
  const speeds=new Map();
  for(const vehicle of ['taxi','cmax','focus']) {
    const {track}=createTrack(context);
    track.setVehicle(vehicle);track.start();track.setInput(forward);advance(track,1);
    speeds.set(vehicle,Math.hypot(track.car.vx,track.car.vy));
    assert.ok(track.getState().speed>0);
    assert.ok(speeds.get(vehicle)<=VEHICLES[vehicle].maxSpeed);
    Object.assign(track.car,{x:500,y:1500,vx:1000,vy:0,heading:0,steering:0});
    track.update(1/60);
    assert.ok(Math.abs(track.car.vx-VEHICLES[vehicle].maxSpeed)<.001,vehicle);
    track.setInput({...resting,backward:true});advance(track,.7);
    assert.ok(track.car.vx<VEHICLES[vehicle].maxSpeed,'all cars can brake');
    advance(track,3);
    assert.ok(track.car.vx<0,'all cars can reverse');
  }
  assert.ok(speeds.get('focus')>speeds.get('taxi')*1.5);
  assert.ok(speeds.get('focus')>speeds.get('cmax')*1.5);
});

test('all cars can drift, while lift-off flames belong exclusively to the Focus',context=>{
  for(const vehicle of ['taxi','cmax','focus']) {
    const {track}=createTrack(context);
    track.setVehicle(vehicle);track.start();track.setInput(forward);advance(track,1.2);
    track.setInput({...forward,right:true,drift:true});advance(track,.7);
    assert.ok(track.getState().driftScore>0,vehicle);
    Object.assign(track.car,{x:500,y:1500,vx:180,vy:0,heading:0,steering:0});
    track.previousThrottle=true;track.exhaustCooldown=0;track.setInput(resting);track.update(1/60);
    assert.equal(track.getState().exhaust,vehicle==='focus',vehicle);
  }
});

test('changing cars parks the new model without stale motion or flames and preserves completed session totals',context=>{
  const {track,telemetry}=createTrack(context);
  track.setVehicle('focus');track.start();track.setInput(forward);advance(track,1);
  track.lap=2;track.driftScore=130;track.checkpoint=5;track.lights=true;
  track.exhaustTime=.2;track.hornTime=.2;
  track.setVehicle('cmax');
  const state=track.getState();
  assert.equal(state.vehicle,'cmax');assert.equal(state.x,350);assert.equal(state.y,1500);
  assert.equal(state.speed,0);assert.equal(state.heading,0);assert.equal(state.checkpoint,1);
  assert.equal(state.exhaust,false);assert.equal(track.hornTime,0);assert.deepEqual(track.input,resting);
  assert.equal(state.lap,2);assert.equal(state.driftScore,130);assert.equal(state.lights,true);
  assert.equal(telemetry.at(-1).vehicle,'cmax');assert.equal(telemetry.at(-1).throttle,false);
  track.setInput(forward);advance(track,.6);
  const position=track.getState().x;track.setVehicle('cmax');
  assert.equal(track.getState().x,position,'same-car reentry preserves its track pose');
  assert.equal(track.setVehicle('unknown'),'cmax');
  track.reset();assert.equal(track.getState().vehicle,'cmax');assert.equal(track.getState().lap,0);
});

test('pausing and hiding freeze physics, clear held controls and publish silent telemetry',context=>{
  const {track,telemetry}=createTrack(context);
  track.start();track.setInput(forward);advance(track,1);
  track.setPaused(true);
  const paused=track.getState();advance(track,1);
  assert.equal(track.getState().x,paused.x);
  assert.equal(telemetry.at(-1).paused,true);
  assert.equal(telemetry.at(-1).throttle,false);
  track.setPaused(false);track.setInput(forward);hidden=true;
  for (const listener of visibilityListeners) listener();
  advance(track,2);
  assert.equal(track.getState().x,paused.x);
  assert.equal(track.input.forward,false);
  assert.equal(telemetry.at(-1).paused,true);
  hidden=false;
});

test('reduced motion suppresses decorative smoke while drift handling remains available',context=>{
  const {track}=createTrack(context);
  reducedMotion=true;
  track.start();track.setInput(forward);advance(track,1.2);
  track.setInput({...forward,right:true,drift:true});advance(track,1);
  assert.ok(track.getState().driftScore>0);
  assert.equal(track.smoke.length,0);
  assert.equal(track.skids.length,0);
});

test('destroy removes animation and visibility listeners and prevents further changes',context=>{
  const {track}=createTrack(context);
  track.start();const request=track.frameRequest;
  assert.ok(frames.has(request));
  const listener=track.onVisibilityChange;
  assert.ok(visibilityListeners.has(listener));
  track.destroy();
  assert.equal(frames.has(request),false);
  assert.equal(visibilityListeners.has(listener),false);
  track.setInput(forward);advance(track,1);
  assert.equal(track.getState().x,350);
});
