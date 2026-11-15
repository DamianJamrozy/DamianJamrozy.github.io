// @ts-check
import { paintVehicle, VEHICLES } from './vehicles.js';

/** @typedef {import('./vehicles.js').DrivingTelemetry} DrivingTelemetry */
/** @typedef {import('./vehicles.js').VehicleId} VehicleId */
/** @typedef {{x:number,y:number}} Point */
/** @typedef {{forward:boolean,backward:boolean,left:boolean,right:boolean,drift:boolean}} TrackInput */
/** @typedef {{vehicle:VehicleId,speed:number,lap:number,driftScore:number,drifting:boolean,lights:boolean,paused:boolean,x:number,y:number,heading:number,onRoad:boolean,checkpoint:number,exhaust:boolean}} TrackState */
/** @typedef {{onDrive?:(state:DrivingTelemetry)=>void,onUpdate?:(state:TrackState)=>void,onExit?:()=>void}} TrackEvents */

const GOLD = '#e4bf78';
const ROAD_WIDTH = 210;
export const TRACK_BOUNDS = Object.freeze({width:2400,height:1800});
export const TRACK_CHECKPOINTS = Object.freeze([
  {x:350,y:1500},{x:1100,y:1500},{x:1860,y:1500},{x:2160,y:1240},
  {x:1970,y:930},{x:1370,y:840},{x:1160,y:620},{x:1430,y:410},
  {x:1950,y:440},{x:2080,y:230},{x:1620,y:150},{x:1010,y:250},
  {x:760,y:520},{x:790,y:800},{x:430,y:1010},{x:220,y:1250}
]);

/** @param {number} value @param {number} minimum @param {number} maximum */
function clamp(value,minimum,maximum) { return Math.max(minimum,Math.min(maximum,value)); }

/** Smooth closed geometry shared by road rendering, grip and the overview. */
export const TRACK_ROUTE = Object.freeze(TRACK_CHECKPOINTS.flatMap((point,index,points) => {
  const previous = points[(index-1+points.length)%points.length];
  const next = points[(index+1)%points.length];
  const after = points[(index+2)%points.length];
  return Array.from({length:12},(_,sample) => {
    const t=sample/12,t2=t*t,t3=t2*t;
    return {
      x:.5*((2*point.x)+(-previous.x+next.x)*t+(2*previous.x-5*point.x+4*next.x-after.x)*t2+(-previous.x+3*point.x-3*next.x+after.x)*t3),
      y:.5*((2*point.y)+(-previous.y+next.y)*t+(2*previous.y-5*point.y+4*next.y-after.y)*t2+(-previous.y+3*point.y-3*next.y+after.y)*t3)
    };
  });
}));

/** @param {Point} point */
export function nearestTrackPoint(point) {
  let nearest = {x:TRACK_ROUTE[0].x,y:TRACK_ROUTE[0].y,distance:Infinity};
  for (const [index,start] of TRACK_ROUTE.entries()) {
    const end=TRACK_ROUTE[(index+1)%TRACK_ROUTE.length];
    const dx=end.x-start.x,dy=end.y-start.y;
    const projection=clamp(((point.x-start.x)*dx+(point.y-start.y)*dy)/(dx*dx+dy*dy),0,1);
    const x=start.x+dx*projection,y=start.y+dy*projection;
    const distance=Math.hypot(point.x-x,point.y-y);
    if (distance<nearest.distance) nearest={x,y,distance};
  }
  return nearest;
}

/** A finite, freely driven circuit. Velocity and heading separate during a drift. */
export class DriftTrack {
  /** @param {HTMLCanvasElement} canvas @param {TrackEvents} [events] */
  constructor(canvas,events={}) {
    const context=canvas.getContext('2d',{alpha:false});
    if (!context) throw new Error('Canvas 2D is unavailable');
    this.canvas=canvas;
    this.ctx=context;
    this.events=events;
    /** @type {'pl'|'en'} */
    this.language='pl';
    /** @type {VehicleId} */
    this.vehicle='taxi';
    this.width=1;
    this.height=1;
    this.dpr=1;
    this.scale=1;
    this.camera={x:350,y:1500};
    this.car={x:350,y:1500,vx:0,vy:0,heading:0,steering:0};
    /** @type {TrackInput} */
    this.input={forward:false,backward:false,left:false,right:false,drift:false};
    this.paused=true;
    this.destroyed=false;
    this.lights=false;
    this.lap=0;
    this.checkpoint=1;
    this.driftScore=0;
    this.drifting=false;
    this.onRoad=true;
    this.elapsed=0;
    this.telemetryTime=0;
    this.exhaustTime=0;
    this.exhaustCooldown=0;
    this.hornTime=0;
    this.previousThrottle=false;
    this.lastTimestamp=0;
    this.frameRequest=0;
    this.animationsEnabled=true;
    /** @type {{a:Point,b:Point,life:number}[]} */
    this.skids=[];
    /** @type {{x:number,y:number,life:number}[]} */
    this.smoke=[];
    this.motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.onMotionChange=()=>this.render();
    this.onVisibilityChange=()=>{
      this.lastTimestamp=0;
      if (document.hidden) { this.clearInput(); this.publish(); this.cancelFrame(); }
      else this.schedule();
    };
    this.motionQuery.addEventListener?.('change',this.onMotionChange);
    document.addEventListener('visibilitychange',this.onVisibilityChange);
    this.observer=new ResizeObserver(()=>this.resize());
    this.observer.observe(canvas);
    this.resize();
  }

  start() { this.setPaused(false); }

  /** @param {boolean} paused */
  setPaused(paused) {
    if (this.destroyed) return;
    this.paused=paused;
    this.lastTimestamp=0;
    if (paused) { this.clearInput(); this.cancelFrame(); }
    this.publish();
    this.render();
    this.schedule();
  }

  clearInput() {
    this.input={forward:false,backward:false,left:false,right:false,drift:false};
    this.previousThrottle=false;
  }

  /** @param {TrackInput} input */
  setInput(input) { this.input={...input}; }

  /** Keep the car selected on the main road; changing models never carries over another car's speed.
   * @param {VehicleId} vehicle
   */
  setVehicle(vehicle) {
    if (this.destroyed || !Object.hasOwn(VEHICLES,vehicle) || this.vehicle===vehicle) return this.vehicle;
    this.vehicle=vehicle;
    this.car={x:350,y:1500,vx:0,vy:0,heading:0,steering:0};
    this.camera={x:350,y:1500};this.checkpoint=1;
    this.drifting=false;this.onRoad=true;this.exhaustTime=0;this.exhaustCooldown=0;this.hornTime=0;
    this.smoke=[];
    this.clearInput();
    this.publish();
    this.render();
    return this.vehicle;
  }

  toggleLights() { this.lights=!this.lights; this.render(); return this.lights; }
  honk() { this.hornTime=.45; this.render(); }

  /** @param {'pl'|'en'} language */
  setLanguage(language) { this.language=language; this.render(); }

  /** @param {boolean} enabled */
  setAnimationsEnabled(enabled) { this.animationsEnabled=enabled; this.render(); }

  reset() {
    this.car={x:350,y:1500,vx:0,vy:0,heading:0,steering:0};
    this.camera={x:350,y:1500};
    this.lap=0;
    this.checkpoint=1;
    this.driftScore=0;
    this.drifting=false;
    this.onRoad=true;
    this.exhaustTime=0;
    this.exhaustCooldown=0;
    this.hornTime=0;
    this.skids=[];
    this.smoke=[];
    this.clearInput();
    this.publish();
    this.render();
  }

  /** @returns {TrackState} */
  getState() {
    return {
      vehicle:this.vehicle,speed:Math.round(Math.hypot(this.car.vx,this.car.vy)*.32),lap:this.lap,
      driftScore:Math.floor(this.driftScore),drifting:this.drifting,lights:this.lights,
      paused:this.paused,x:this.car.x,y:this.car.y,heading:this.car.heading,
      onRoad:this.onRoad,checkpoint:this.checkpoint,exhaust:this.exhaustTime>0
    };
  }

  publish() {
    const state=this.getState();
    this.events.onUpdate?.(state);
    this.events.onDrive?.({vehicle:this.vehicle,speed:state.speed,
      throttle:!this.paused&&!document.hidden&&this.input.forward,
      braking:!this.paused&&!document.hidden&&this.input.backward,
      steering:this.car.steering,drifting:this.drifting&&!this.paused,
      paused:this.paused||document.hidden});
  }

  /** @param {number} seconds */
  update(seconds) {
    if (this.paused||this.destroyed||document.hidden||!Number.isFinite(seconds)||seconds<=0) return;
    const dt=Math.min(seconds,.04);
    this.elapsed+=dt;
    this.exhaustTime=Math.max(0,this.exhaustTime-dt);
    this.exhaustCooldown=Math.max(0,this.exhaustCooldown-dt);
    this.hornTime=Math.max(0,this.hornTime-dt);
    const car=this.car;
    const vehicle=VEHICLES[this.vehicle];
    const speed=Math.hypot(car.vx,car.vy);
    this.onRoad=nearestTrackPoint(car).distance<ROAD_WIDTH*.5;
    const requestedSteering=(this.input.right?1:0)-(this.input.left?1:0);
    car.steering+=(requestedSteering-car.steering)*Math.min(1,dt*5.5);
    const previousCos=Math.cos(car.heading),previousSin=Math.sin(car.heading);
    const forwardSpeed=car.vx*previousCos+car.vy*previousSin;
    const handbrake=this.input.drift&&speed>85;
    car.heading+=car.steering*Math.min(1,Math.abs(forwardSpeed)/125)*Math.sign(forwardSpeed)*dt*(handbrake?1.8:1.2);
    car.heading=Math.atan2(Math.sin(car.heading),Math.cos(car.heading));
    const cos=Math.cos(car.heading),sin=Math.sin(car.heading);
    let longitudinal=car.vx*cos+car.vy*sin;
    let lateral=-car.vx*sin+car.vy*cos;
    const acceleration=(this.input.forward?(longitudinal< -20?500:vehicle.acceleration):0)-(this.input.backward?(longitudinal>20?520:Math.min(225,vehicle.acceleration*.7)):0);
    longitudinal+=acceleration*dt;
    const drag=this.onRoad?(handbrake?.85:.38):2.6;
    longitudinal*=Math.exp(-drag*dt);
    longitudinal=clamp(longitudinal,this.onRoad?-Math.min(145,vehicle.maxSpeed*.4):-80,this.onRoad?vehicle.maxSpeed:Math.min(175,vehicle.maxSpeed*.55));
    lateral*=Math.exp(-(this.onRoad?(handbrake?1.35:8.5):4.5)*dt);
    car.vx=cos*longitudinal-sin*lateral;
    car.vy=sin*longitudinal+cos*lateral;
    if (Math.hypot(car.vx,car.vy)<.45) { car.vx=0; car.vy=0; }
    const old={x:car.x,y:car.y};
    car.x+=car.vx*dt;
    car.y+=car.vy*dt;
    const boundedX=clamp(car.x,65,TRACK_BOUNDS.width-65),boundedY=clamp(car.y,65,TRACK_BOUNDS.height-65);
    if (boundedX!==car.x) car.vx=0;
    if (boundedY!==car.y) car.vy=0;
    car.x=boundedX;car.y=boundedY;
    const slip=Math.abs(Math.atan2(lateral,Math.max(1,Math.abs(longitudinal))));
    this.drifting=this.onRoad&&speed>110&&slip>.105;
    if (this.drifting) {
      this.driftScore+=speed*slip*dt*.45;
      if (this.animationsEnabled&&!this.motionQuery.matches) {
        if (Math.hypot(car.x-old.x,car.y-old.y)>2) this.skids.push({a:old,b:{x:car.x,y:car.y},life:18});
        if (this.smoke.length<30) this.smoke.push({x:car.x-cos*28,y:car.y-sin*28,life:.9});
      }
    }
    if (this.vehicle==='focus'&&this.previousThrottle&&!this.input.forward&&speed>145&&this.exhaustCooldown===0) {
      this.exhaustTime=.3;this.exhaustCooldown=.85;
    }
    this.previousThrottle=this.input.forward;
    for (const mark of this.skids) mark.life-=dt;
    for (const puff of this.smoke) puff.life-=dt;
    this.skids=this.skids.filter(mark=>mark.life>0).slice(-360);
    this.smoke=this.smoke.filter(puff=>puff.life>0);
    this.updateCheckpoint();
    const cameraBlend=this.motionQuery.matches?1:Math.min(1,dt*5);
    this.camera.x+=(car.x+cos*75-this.camera.x)*cameraBlend;
    this.camera.y+=(car.y+sin*75-this.camera.y)*cameraBlend;
    this.telemetryTime+=dt;
    if (this.telemetryTime>=.05) { this.telemetryTime=0; this.publish(); }
  }

  updateCheckpoint() {
    const expected=TRACK_CHECKPOINTS[this.checkpoint];
    if (Math.hypot(this.car.x-expected.x,this.car.y-expected.y)>125) return;
    this.checkpoint=(this.checkpoint+1)%TRACK_CHECKPOINTS.length;
    if (this.checkpoint===1) this.lap+=1;
  }

  schedule() {
    if (this.paused||this.destroyed||document.hidden||this.frameRequest) return;
    this.frameRequest=requestAnimationFrame(time=>this.tick(time));
  }
  cancelFrame() { if (this.frameRequest) cancelAnimationFrame(this.frameRequest); this.frameRequest=0; }

  /** @param {number} timestamp */
  tick(timestamp) {
    this.frameRequest=0;
    if (this.paused||this.destroyed||document.hidden) return;
    const dt=this.lastTimestamp?Math.min((timestamp-this.lastTimestamp)/1000,.04):0;
    this.lastTimestamp=timestamp;
    this.update(dt);
    this.render();
    this.schedule();
  }

  resize() {
    if (this.destroyed) return;
    const bounds=this.canvas.getBoundingClientRect();
    if (bounds.width<1||bounds.height<1) return;
    this.width=bounds.width;this.height=bounds.height;
    this.dpr=Math.min(window.devicePixelRatio||1,1.75);
    this.scale=clamp(this.width/1000,.58,1.03);
    this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
    this.render();
  }

  /** @param {CanvasRenderingContext2D} ctx */
  traceRoad(ctx) {
    ctx.beginPath();
    for (const [index,point] of TRACK_ROUTE.entries()) {
      if (index===0) ctx.moveTo(point.x,point.y);else ctx.lineTo(point.x,point.y);
    }
    ctx.closePath();
  }

  render() {
    if (this.destroyed) return;
    const ctx=this.ctx,state=this.getState();
    Object.assign(this.canvas.dataset,{track:'serpentine',lap:String(state.lap),drifting:String(state.drifting),speed:String(state.speed),exhaust:String(state.exhaust),lights:String(this.lights),vehicle:this.vehicle,checkpoint:String(this.checkpoint)});
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    ctx.fillStyle='#263a2e';ctx.fillRect(0,0,this.width,this.height);
    ctx.save();
    ctx.translate(this.width*.5-this.camera.x*this.scale,this.height*.58-this.camera.y*this.scale);
    ctx.scale(this.scale,this.scale);
    this.paintGround(ctx);
    ctx.lineJoin='round';ctx.lineCap='round';
    this.traceRoad(ctx);ctx.strokeStyle='#c9bfac';ctx.lineWidth=ROAD_WIDTH+20;ctx.stroke();
    ctx.setLineDash([38,38]);ctx.strokeStyle='#a04d42';ctx.lineWidth=ROAD_WIDTH+20;ctx.stroke();ctx.setLineDash([]);
    this.traceRoad(ctx);ctx.strokeStyle='#303b3b';ctx.lineWidth=ROAD_WIDTH;ctx.stroke();
    this.traceRoad(ctx);ctx.strokeStyle='#d6c59838';ctx.lineWidth=2;ctx.setLineDash([12,24]);ctx.stroke();ctx.setLineDash([]);
    this.paintStart(ctx);
    for (const mark of this.skids) {
      ctx.strokeStyle=`rgba(7,13,13,${Math.min(.48,mark.life/18)})`;ctx.lineWidth=13;
      ctx.beginPath();ctx.moveTo(mark.a.x,mark.a.y);ctx.lineTo(mark.b.x,mark.b.y);ctx.stroke();
    }
    ctx.save();ctx.translate(this.car.x,this.car.y);ctx.rotate(this.car.heading+Math.PI/2);
    paintVehicle(ctx,this.vehicle,{time:this.elapsed,lights:this.lights,brake:this.input.backward,speed:state.speed,steering:this.car.steering,exhaust:this.exhaustTime>0&&!this.motionQuery.matches&&this.animationsEnabled,horn:this.hornTime>0});
    ctx.restore();
    if (this.animationsEnabled&&!this.motionQuery.matches) for (const puff of this.smoke) {
      ctx.fillStyle=`rgba(207,215,200,${puff.life*.2})`;
      ctx.beginPath();ctx.arc(puff.x,puff.y,10+(1-puff.life)*24,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    this.paintOverview(ctx);
  }

  /** @param {CanvasRenderingContext2D} ctx */
  paintGround(ctx) {
    ctx.fillStyle='#2f4435';ctx.fillRect(0,0,TRACK_BOUNDS.width,TRACK_BOUNDS.height);
    ctx.strokeStyle='#8e98712c';ctx.lineWidth=3;ctx.strokeRect(58,58,TRACK_BOUNDS.width-116,TRACK_BOUNDS.height-116);
    for (const row of [130,470,850,1220,1640]) for (const column of [130,470,900,1350,1770,2250]) {
      if (nearestTrackPoint({x:column,y:row}).distance<190) continue;
      ctx.fillStyle='#172e23';ctx.beginPath();ctx.arc(column,row,38,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#38573a';ctx.beginPath();ctx.arc(column-7,row-8,29,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#364648';ctx.fillRect(75,1510,340,145);
    ctx.fillStyle='#7c8479';ctx.fillRect(110,1590,205,45);
    ctx.fillStyle='#1c2c26';ctx.fillRect(100,1580,225,19);
    ctx.fillStyle=GOLD;ctx.font='700 16px Inter, sans-serif';ctx.textAlign='center';
    ctx.fillText(this.language==='pl'?'PADOK - WYJAZD':'PADDOCK - EXIT',240,1690);
    ctx.fillStyle='#192d25';ctx.fillRect(1200,1120,390,170);
    ctx.strokeStyle='#e4bf7850';ctx.lineWidth=2;ctx.strokeRect(1200,1120,390,170);
    const vehicleName=this.vehicle==='taxi'?'TAXI':this.vehicle==='cmax'?'FORD C-MAX':'FORD FOCUS ST';
    ctx.fillStyle=GOLD;ctx.font='700 27px Georgia, serif';ctx.fillText(vehicleName,1395,1190);
    ctx.fillStyle='#c8cdbb';ctx.font='500 16px Inter, sans-serif';
    const performance=this.vehicle==='focus'?(this.language==='pl'?'300+ KM':'300+ HP'):this.vehicle==='cmax'?(this.language==='pl'?'115 KM - DIESEL':'115 HP - DIESEL'):(this.language==='pl'?'SWOBODNA JAZDA':'FREE DRIVING');
    ctx.fillText(performance,1395,1230);
  }

  /** @param {CanvasRenderingContext2D} ctx */
  paintStart(ctx) {
    for (const column of [0,1]) for (const row of Array.from({length:10},(_,index)=>index)) {
      ctx.fillStyle=(column+row)%2?'#1b2523':'#e6ddc5';ctx.fillRect(350+column*14,1395+row*21,14,21);
    }
    const target=TRACK_CHECKPOINTS[this.checkpoint];
    ctx.strokeStyle='#e4bf7855';ctx.lineWidth=3;ctx.setLineDash([8,8]);
    ctx.beginPath();ctx.arc(target.x,target.y,44,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=GOLD;ctx.font='700 13px Inter, sans-serif';ctx.textAlign='center';
    ctx.fillText(this.language==='pl'?'START / META':'START / FINISH',365,1360);
  }

  /** @param {CanvasRenderingContext2D} ctx */
  paintOverview(ctx) {
    const width=this.width<600?132:178,height=width*.75,x=this.width-width-18,y=100;
    ctx.fillStyle='#0b1610df';ctx.beginPath();ctx.roundRect(x,y,width,height+31,10);ctx.fill();
    ctx.strokeStyle='#d6b46c4a';ctx.lineWidth=1;ctx.stroke();
    ctx.save();ctx.translate(x+9,y+24);ctx.scale((width-18)/TRACK_BOUNDS.width,(height-8)/TRACK_BOUNDS.height);
    this.traceRoad(ctx);ctx.strokeStyle='#c1c4ae';ctx.lineWidth=36;ctx.lineJoin='round';ctx.stroke();
    const next=TRACK_CHECKPOINTS[this.checkpoint];
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(next.x,next.y,55,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(this.car.x,this.car.y,68,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.textAlign='left';ctx.fillStyle=GOLD;ctx.font='600 9px Inter, sans-serif';
    ctx.fillText(this.language==='pl'?'SERPENTYNY · TOR':'SERPENTINE · CIRCUIT',x+10,y+16);
  }

  destroy() {
    this.destroyed=true;this.cancelFrame();this.clearInput();
    this.observer.disconnect();this.motionQuery.removeEventListener?.('change',this.onMotionChange);
    document.removeEventListener('visibilitychange',this.onVisibilityChange);
    this.skids=[];this.smoke=[];
  }
}
