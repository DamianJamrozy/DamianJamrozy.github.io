// @ts-check
import { getWorldRegion } from './regions.js';
import { paintLifeScene } from './world-life.js';
import { GARAGES, VEHICLES, paintVehicle } from './vehicles.js';
import { roadProfile, roadLaneCenter, sampleRoad, ROAD_VERTICAL_SCALE } from './road-layout.js';
import { garageAccess, garageDockRoute, garageExitRoute, distanceToGarageAccess, isGaragePaved } from './garage-layout.js';
import { festivalPresence } from './festival.js';
import { TRACK_ACCESS, isTrackAccessPaved, isAtTrackGate, trackAccessIntersectsBounds } from './track-access.js';

/** @typedef {'pl'|'en'} Language */
/** @typedef {{x:number,y:number}} Point */
/** @typedef {{forward:boolean,backward:boolean,left:boolean,right:boolean,drift?:boolean}} DriveInput */
/** @typedef {{onArrive:(index:number)=>void,onSpeed:(speed:number)=>void,onManual?:()=>void,onNavigate?:(index:number)=>void,onLocation?:(distance:number,nextStation:number)=>void,onDrive?:(state:import('./vehicles.js').DrivingTelemetry)=>void,onTrackEnter?:()=>void,onGarageArrive?:(id:'cmax'|'focus')=>void}} WorldEvents */
/** @typedef {{distance:number,offset:number,kind:'tree'|'house'|'block'|'lamp'|'bench'|'pedestrians',seed:number}} Scenery */
/** @typedef {{id:string,distance:number,side:-1|1,offset?:number,label:{pl:string,en:string},kind:'games'|'scholarship'|'music'|'festival'|'robot'|'sport'}} SideSpot */

export const ROAD_LENGTH = 12300;
const VERTICAL_SCALE = ROAD_VERTICAL_SCALE;
const GOLD = "#e4bf78";

export { sampleRoad } from './road-layout.js';

const STATION_DATA = [
  {
    id: "school",
    distance: 300,
    year: "2015",
    label: { pl: "Technikum · Staszów", en: "Technical school · Staszów" },
    place: "STASZÓW",
    kind: "school",
  },
  {
    id: "internship",
    distance: 1600,
    year: "11.2017",
    label: { pl: "Praktyki · Arkonsoft", en: "Internship · Arkonsoft" },
    place: "ARKONSOFT",
    kind: "office",
  },
  {
    id: "studies",
    distance: 2900,
    year: "2019",
    label: { pl: "Nowy rozdział · Rzeszów", en: "A new chapter · Rzeszów" },
    place: "RZESZÓW",
    kind: "monument",
  },
  {
    id: "university",
    distance: 4200,
    year: "01.2020",
    label: { pl: "Uniwersytet Rzeszowski", en: "University of Rzeszów" },
    place: "UNIWERSYTET RZESZOWSKI",
    kind: "university",
  },
  {
    id: "systems",
    distance: 5500,
    year: "01.2022",
    label: { pl: "Centrum Informatyzacji", en: "University IT Center" },
    place: "UCI",
    kind: "systems",
  },
  {
    id: "learning",
    distance: 6800,
    year: "2023–2024",
    label: { pl: "Wiedza i nauczanie", en: "Learning and teaching" },
    place: "UNIWERSYTET RZESZOWSKI",
    kind: "learning",
  },
  {
    id: "design",
    distance: 8100,
    year: "03.2025",
    label: { pl: "SSC Master · Toruń", en: "SSC Master · Toruń" },
    place: "TORUŃ · SSC MASTER",
    kind: "design",
  },
  {
    id: "community",
    distance: 9400,
    year: "03.2025",
    label: { pl: "ASBiR · Poznań", en: "ASBiR · Poznań" },
    place: "POZNAŃ · ASBiR",
    kind: "community",
  },
  {
    id: "netwise",
    distance: 10700,
    year: "06.2026",
    label: { pl: "Netwise · Warszawa", en: "Netwise · Warsaw" },
    place: "WARSZAWA · NETWISE",
    kind: "netwise",
  },
  {
    id: "next",
    distance: 12000,
    year: "→",
    label: { pl: "Następny rozdział", en: "The next chapter" },
    place: "THE ROAD AHEAD",
    kind: "future",
  },
];
export const STATIONS = Object.freeze(
  STATION_DATA.map((station) => ({
    ...station,
    ...sampleRoad(station.distance),
  })),
);

/** @param {number} value */
function noise(value) {
  const n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}
/** @param {number} value @param {number} min @param {number} max */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** @type {Scenery[]} */
const SCENERY = [];
for (const index of Array.from({ length: 117 }, (_, i) => i)) {
  const distance = index * 112 - 250;
  for (const side of [-1, 1]) {
    const seed = index * 7 + side + 1;
    SCENERY.push({
      distance,
      offset: side * (172 + noise(seed) * 190),
      kind: "tree",
      seed,
    });
    SCENERY.push({
      distance: distance + 43,
      offset: side * (400 + noise(seed + 5) * 230),
      kind: "tree",
      seed: seed + 71,
    });
    if (
      index % 3 === 0 &&
      !STATIONS.some((station) => Math.abs(station.distance - distance) < 270)
    )
      SCENERY.push({
        distance: distance + 14,
        offset: side * (245 + noise(seed + 1) * 80),
        kind: distance < 2350 ? "house" : "block",
        seed: seed + 13,
      });
    if (index % 4 === 0 && distance > 1000)
      SCENERY.push({
        distance: distance - 23,
        offset: side * 116,
        kind: "lamp",
        seed,
      });
    if (index % 9 === 0 && distance > 2500)
      SCENERY.push({
        distance: distance + 35,
        offset: side * 136,
        kind: "bench",
        seed,
      });
  }
}

for(const [index,distance] of [900,2200,3600,4900,6100,7300,8600,9900,11300].entries()) {
  SCENERY.push({distance,offset:220,kind:'pedestrians',seed:index+401});
}

/** A scrolling road journey with route-relative controls and view-culling. */
export class CareerWorld {
  /** @param {HTMLCanvasElement} canvas @param {WorldEvents} events */
  constructor(canvas, events) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas 2D is unavailable");
    this.canvas = canvas;
    this.ctx = context;
    this.events = events;
    this.stations = STATIONS;
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.scale = 1;
    this.landmarkOffset = 235;
    this.cameraDistance = 0;
    this.cameraX = 0;
    this.carY = 0;
    this.car = { distance: 0, lane: 14, speed: 0, x: 14, y: 0, angle: sampleRoad(0).angle, vx:0, vy:0 };
    /** @type {import('./vehicles.js').VehicleId} */
    this.vehicle = 'taxi';
    /** @type {'cmax'|'focus'|null} */
    this.garageTarget = null;
    this.garageDocking = false;
    /** @type {readonly import('./garage-layout.js').GaragePoint[]} */
    this.garageRoute = [];
    this.garageRouteIndex = 0;
    this.garageExiting = false;
    /** @type {Map<'cmax'|'focus',import('./vehicles.js').VehicleId>} */
    this.garageCars = new Map([['cmax','cmax'],['focus','focus']]);
    /** @type {Set<'cmax'|'focus'>} */
    this.exchangedGarages = new Set();
    /** @type {{time:number,start:{x:number,distance:number,angle:number},end:{x:number,distance:number},vehicle:import('./vehicles.js').VehicleId}|null} */
    this.boarding = null;
    this.drifting = false;
    this.onRoad = true;
    /** @type {{a:Point,b:Point,life:number}[]} */
    this.skids = [];
    /** @type {SideSpot[]} */
    this.sideStories = [];
    /** @type {DriveInput} */
    this.input = { forward: false, backward: false, left: false, right: false };
    /** @type {number|null} */
    this.target = null;
    /** @type {number|null} */
    this.lastArrival = null;
    /** @type {Set<number>} */
    this.visited = new Set();
    /** @type {Language} */
    this.language = "pl";
    this.paused = true;
    this.destroyed = false;
    this.manualActive = false;
    this.dirty = true;
    this.lastFrame = 0;
    this.lastSpeed = -1;
    this.locationTimer = 0;
    this.animationTime = 0;
    this.animationFrameTime = 0;
    this.driveTime = 0;
    this.driveTelemetryTime = 0;
    this.steering = 0;
    this.lights = false;
    this.hornTime = 0;
    this.exhaustTime = 0;
    this.exhaustCooldown = 0;
    this.previousThrottle = false;
    this.trackEntryHeld = 0;
    this.trackEntryUsed = false;
    /** @type {'normal'|'fast'} */
    this.travelSpeed = 'normal';
    this.animationsEnabled = true;
    this.frame = 0;
    this.motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    this.reducedMotion = this.motionQuery.matches;
    this.onMotionChange = () => { this.reducedMotion=this.motionQuery.matches; this.dirty=true; };
    this.motionQuery.addEventListener?.('change',this.onMotionChange);
    this.onCanvasClick = this.handleCanvasClick.bind(this);
    canvas.addEventListener("click", this.onCanvasClick);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.syncCar();
    this.resize();
    this.frame = requestAnimationFrame((time) => this.tick(time));
  }
  start() {
    this.paused = false;
    this.lastFrame = 0;
    this.dirty = true;
  }
  /** @param {boolean} enabled */
  setAnimationsEnabled(enabled) {
    this.animationsEnabled = enabled;
    this.dirty = true;
  }
  cancelNavigation() {
    this.target = null;
    this.garageTarget = null;
    this.garageDocking = false;
    this.garageRoute = [];
    this.garageRouteIndex = 0;
    this.garageExiting = false;
    this.car.speed = 0;
    this.car.vx = 0;
    this.car.vy = 0;
    this.drifting = false;
    this.manualActive = false;
    this.setInput({
      forward: false,
      backward: false,
      left: false,
      right: false,
    });
    this.dirty = true;
  }
  reset() {
    this.restoreDistance(0);
    this.lastArrival = null;
    this.car.lane = roadLaneCenter(0);
    this.paused = true;
    this.lastFrame = 0;
    this.lastSpeed = -1;
    this.locationTimer = 0;
    this.animationTime = 0;
    this.animationFrameTime = 0;
    this.driveTime = 0;
    this.steering = 0;
    this.lights = false;
    this.hornTime = 0;
    this.exhaustTime = 0;
    this.exhaustCooldown = 0;
    this.previousThrottle = false;
    this.trackEntryHeld = 0;
    this.trackEntryUsed = false;
    this.vehicle = 'taxi';
    this.boarding = null;
    this.skids = [];
    this.garageCars = new Map([['cmax','cmax'],['focus','focus']]);
    this.exchangedGarages.clear();
  }
  /** @param {number} distance */
  restoreDistance(distance) {
    this.restorePosition({distance,lane:roadLaneCenter(Number.isFinite(distance)?distance:0),heading:sampleRoad(Number.isFinite(distance)?distance:0).angle});
  }
  /** @param {{distance:number,lane:number,heading:number}} pose */
  restorePosition(pose) {
    this.cancelNavigation();
    this.steering=0;this.previousThrottle=false;this.exhaustTime=0;this.exhaustCooldown=0;
    this.trackEntryHeld=0;this.trackEntryUsed=false;this.boarding=null;this.drifting=false;
    this.car.distance=Number.isFinite(pose.distance)?clamp(pose.distance,0,ROAD_LENGTH):0;
    this.car.lane=Number.isFinite(pose.lane)?clamp(pose.lane,-700,700):roadLaneCenter(this.car.distance);
    this.car.x=sampleRoad(this.car.distance).x+this.car.lane;
    this.car.angle=Number.isFinite(pose.heading)?Math.atan2(Math.sin(pose.heading),Math.cos(pose.heading)):sampleRoad(this.car.distance).angle;
    this.syncCar();
    this.cameraDistance=this.car.distance;this.cameraX=this.car.x;
    this.lastArrival=this.getNearestStation();this.dirty=true;
  }
  /** @param {import('./vehicles.js').VehicleId} id */
  setVehicle(id) {
    if(!Object.hasOwn(VEHICLES,id)) return this.vehicle;
    this.vehicle=id;this.previousThrottle=false;this.exhaustTime=0;this.exhaustCooldown=0;this.dirty=true;
    return this.vehicle;
  }
  /** @param {import('./vehicles.js').VehicleId} id */
  boardVehicle(id) {
    if(!Object.hasOwn(VEHICLES,id)||id===this.vehicle) return this.vehicle;
    const garage=GARAGES.find(item=>item.id===this.getNearbyGarage());
    const oldVehicle=this.vehicle;
    const start={x:this.car.x,distance:this.car.distance,angle:this.car.angle};
    this.cancelNavigation();this.setVehicle(id);
    if(garage) {
      const end=this.garageParkedPosition(garage);
      this.garageCars.set(garage.id,oldVehicle);
      if(this.exchangedGarages.has(garage.id)) this.exchangedGarages.delete(garage.id);
      else this.exchangedGarages.add(garage.id);
      this.car.x=end.x;this.car.distance=end.distance;this.car.angle=0;this.syncCar();
      this.boarding=this.reducedMotion||!this.animationsEnabled?null:{time:.9,start,end,vehicle:oldVehicle};
    }
    return this.vehicle;
  }
  /** @param {typeof GARAGES[number]} garage */
  garagePosition(garage) {
    return {x:sampleRoad(garage.distance).x+garage.side*garage.offset,distance:garage.distance};
  }
  /** @param {typeof GARAGES[number]} garage */
  garageParkedPosition(garage) {
    const position=this.garagePosition(garage);
    return {x:position.x+garage.side*(this.exchangedGarages.has(garage.id)?-36:32),distance:garage.distance+16};
  }
  /** @param {typeof GARAGES[number]} garage */
  garageDockPosition(garage) {
    const position=this.garagePosition(garage);
    return {x:position.x+garage.side*(this.exchangedGarages.has(garage.id)?32:-36),distance:garage.distance+16};
  }
  /** @param {import('./vehicles.js').GarageSnapshot} snapshot */
  restoreGarages(snapshot) {
    this.garageCars=new Map([['cmax',snapshot.cmax.parkedVehicle],['focus',snapshot.focus.parkedVehicle]]);
    this.exchangedGarages.clear();
    if(snapshot.cmax.exchanged) this.exchangedGarages.add('cmax');
    if(snapshot.focus.exchanged) this.exchangedGarages.add('focus');
    this.dirty=true;
  }
  getNearbyGarage() {
    return GARAGES.find(garage=>{
      const position=this.garagePosition(garage);
      return Math.abs(this.car.distance-position.distance)<115&&Math.abs(this.car.x-position.x)<105;
    })?.id??null;
  }
  /** @param {'cmax'|'focus'} id */
  navigateToGarage(id) {
    const garage=GARAGES.find(garage=>garage.id===id);
    if(!garage) return;
    this.cancelNavigation();this.garageTarget=id;this.lastArrival=null;this.dirty=true;
    const dock=this.garageDockPosition(garage);
    this.garageRoute=garageDockRoute(garage,dock);
    if(this.getNearbyGarage()===id) {
      const current={x:this.car.x,distance:this.car.distance};
      const occupied=this.garageParkedPosition(garage);
      const exitDistance=garage.distance-150;
      const clearAbove=current.distance>occupied.distance;
      this.garageRoute=[current,
        clearAbove?{x:dock.x,distance:current.distance}:{x:current.x,distance:exitDistance},
        ...(clearAbove?[]:[{x:dock.x,distance:exitDistance}]),dock];
      this.garageDocking=true;this.garageRouteIndex=1;
    }
  }
  /** @param {number} dt @param {typeof GARAGES[number]} garage */
  followGarageRoute(dt,garage) {
    const previousX=this.car.x,previousDistance=this.car.distance;
    const pace=195*VERTICAL_SCALE*(this.travelSpeed==='fast'?3:1);
    let remaining=pace*dt;
    while(remaining>0 && this.garageRouteIndex<this.garageRoute.length) {
      const point=this.garageRoute[this.garageRouteIndex];
      const dx=point.x-this.car.x,dy=(point.distance-this.car.distance)*VERTICAL_SCALE;
      const separation=Math.hypot(dx,dy);
      if(separation<=remaining) {
        this.car.x=point.x;this.car.distance=point.distance;
        this.garageRouteIndex++;remaining-=separation;
      } else {
        this.car.x+=dx/separation*remaining;
        this.car.distance+=dy/separation*remaining/VERTICAL_SCALE;
        remaining=0;
      }
    }
    this.car.vx=(this.car.x-previousX)/dt;
    this.car.vy=-(this.car.distance-previousDistance)*VERTICAL_SCALE/dt;
    this.car.speed=Math.hypot(this.car.vx,this.car.vy);
    if(this.car.speed>.1) this.car.angle=Math.atan2(this.car.vx,-this.car.vy);
    this.steering*=Math.exp(-dt*7);this.drifting=false;this.syncCar();
    if(this.garageRouteIndex===this.garageRoute.length) {
      const exiting=this.garageExiting;
      this.garageTarget=null;this.garageDocking=false;this.garageRoute=[];this.garageRouteIndex=0;
      this.garageExiting=false;
      this.car.speed=0;this.car.vx=0;this.car.vy=0;if(!exiting)this.car.angle=0;this.steering=0;
      this.events.onLocation?.(this.car.distance,this.nextStation());
      if(!exiting) this.events.onGarageArrive?.(garage.id);
    }
  }
  /** @param {boolean} paused */
  setPaused(paused) {
    this.paused = paused;
    this.lastFrame = 0;
    this.dirty = true;
    if (paused) {
      this.hornTime = 0;
      this.exhaustTime = 0;
      this.previousThrottle = false;
      this.setInput({
        forward: false,
        backward: false,
        left: false,
        right: false,
      });
    }
  }
  /** @param {DriveInput} input */
  setInput(input) {
    this.input = { ...input };
  }
  /** @param {number[]} indices */
  setProgress(indices) {
    this.visited = new Set(indices);
    this.dirty = true;
  }
  /** @param {Language} language */
  setLanguage(language) {
    this.language = language;
    this.dirty = true;
  }
  getState() {
    return {
      x: this.car.x,
      y: this.car.y,
      speed: Math.round(Math.hypot(this.car.vx,this.car.vy) * 0.32),
      target: this.target,
      paused: this.paused,
      distance: this.car.distance,
      progress: this.car.distance / ROAD_LENGTH,
      nextStation: this.nextStation(),
      nearbyStation: this.getNearestStation(),
      vehicle: this.vehicle,
      lights: this.lights,
      trackNearby: this.isTrackNearby(),
      nearbySideStory: this.getNearbySideStory(),
      nearbyGarage: this.getNearbyGarage(),
      garageTarget: this.garageTarget,
      lane: this.car.lane,
      heading: this.car.angle,
      drifting: this.drifting,
      onRoad: this.onRoad,
      boarding: this.boarding!==null,
      garages:{
        cmax:{parkedVehicle:this.garageCars.get('cmax')??'cmax',exchanged:this.exchangedGarages.has('cmax')},
        focus:{parkedVehicle:this.garageCars.get('focus')??'focus',exchanged:this.exchangedGarages.has('focus')},
      },
    };
  }
  isTrackNearby() {
    return isAtTrackGate({x:this.car.x,distance:this.car.distance});
  }
  /** @param {number} distance */
  landmarkOffsetFor(distance) { return Math.max(this.landmarkOffset,roadProfile(distance).width/2+132); }
  /** @param {number} distance */
  signOffsetFor(distance) { return Math.max(118,roadProfile(distance).width/2+44); }
  /** @param {SideSpot[]} spots */
  setSideStories(spots) { this.sideStories=spots.map(spot=>({...spot})); this.dirty=true; }
  /** @param {SideSpot} spot */
  sideStoryPosition(spot) {
    return {x:sampleRoad(spot.distance).x+spot.side*(spot.offset??(roadProfile(spot.distance).width/2+87)),distance:spot.distance};
  }
  getNearbySideStory() {
    return this.sideStories.find(spot=>Math.abs(spot.distance-this.car.distance)<95 && Math.abs(this.car.x-this.sideStoryPosition(spot).x)<92)?.id ?? null;
  }
  /** @param {'normal'|'fast'} speed */
  setTravelSpeed(speed) { this.travelSpeed=speed==='fast'?'fast':'normal'; }
  toggleLights() {
    if (this.paused) return this.lights;
    this.lights = !this.lights;
    this.dirty = true;
    return this.lights;
  }
  honk() {
    if (this.paused) return;
    this.hornTime = 0.65;
    this.dirty = true;
  }
  /** @returns {import('./vehicles.js').DrivingTelemetry} */
  getTelemetry() {
    return {
      vehicle: this.vehicle,
      speed: this.paused ? 0 : Math.hypot(this.car.vx,this.car.vy) * 0.32,
      throttle: !this.paused && !this.boarding && (this.input.forward || this.target !== null || this.garageTarget!==null),
      braking: !this.paused && this.input.backward && this.car.speed > 0,
      steering: this.steering,
      drifting: this.drifting&&!this.paused,
      paused: this.paused,
    };
  }
  nextStation() {
    const next = STATIONS.findIndex(
      (station) => station.distance > this.car.distance + 35,
    );
    return next < 0 ? STATIONS.length - 1 : next;
  }
  getNearestStation() {
    const index = STATIONS.findIndex(
      (station) => Math.abs(station.distance - this.car.distance) < 125 && this.car.lane<roadProfile(this.car.distance).width/2+38 && this.car.lane>-(roadProfile(this.car.distance).width/2+220),
    );
    return index < 0 ? null : index;
  }
  /** @param {number} index */
  navigateTo(index) {
    if (!Number.isInteger(index) || !STATIONS[index]) return;
    const current={x:this.car.x,distance:this.car.distance};
    const garage=Math.abs(this.car.lane)>roadProfile(this.car.distance).width/2+8
      ? GARAGES.find(item=>isGaragePaved(current,item)) : undefined;
    this.target = index;
    this.garageTarget = null;
    this.garageDocking = false;
    this.garageRoute = [];
    this.garageRouteIndex = 0;
    this.garageExiting = false;
    this.lastArrival = null;
    this.manualActive = false;
    this.car.speed = 0;
    if(garage) {
      this.garageTarget=garage.id;this.garageDocking=true;this.garageExiting=true;
      this.garageRoute=garageExitRoute(garage,current,this.garageDockPosition(garage),this.garageParkedPosition(garage));
      this.garageRouteIndex=1;
    }
    this.dirty = true;
  }
  syncCar() {
    this.car.y=-this.car.distance;
    this.car.lane=this.car.x-sampleRoad(this.car.distance).x;
    const parking=GARAGES.some(garage=>isGaragePaved({x:this.car.x,distance:this.car.distance},garage))
      ||this.sideStories.some(spot=>Math.abs(this.car.distance-spot.distance)<100&&Math.abs(this.car.x-this.sideStoryPosition(spot).x)<90);
    this.onRoad=Math.abs(this.car.lane)<roadProfile(this.car.distance).width/2+8||parking||isTrackAccessPaved({x:this.car.x,distance:this.car.distance});
  }
  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    this.width = bounds.width;
    this.height = bounds.height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.scale = clamp(this.width / 1080, 0.62, 1.16);
    this.landmarkOffset = this.width < 600 ? 195 : 235;
    this.carY = clamp(this.height * 0.68, 290, this.height - 125);
    this.dirty = true;
    this.render();
  }
  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.motionQuery.removeEventListener?.('change',this.onMotionChange);
    this.canvas.removeEventListener("click", this.onCanvasClick);
  }
  /** @param {number} time */
  tick(time) {
    if (this.destroyed) return;
    const dt = this.lastFrame
      ? Math.min((time - this.lastFrame) / 1000, 0.04)
      : 0;
    this.lastFrame = time;
    if (!this.paused) {
      this.driveTime += dt;
      const hadHorn=this.hornTime>0,hadExhaust=this.exhaustTime>0;
      this.hornTime = Math.max(0,this.hornTime-dt);
      this.exhaustTime = Math.max(0,this.exhaustTime-dt);
      this.exhaustCooldown = Math.max(0,this.exhaustCooldown-dt);
      if((hadHorn&&this.hornTime===0)||(hadExhaust&&this.exhaustTime===0)) this.dirty=true;
      for(const skid of this.skids) skid.life-=dt;
      this.skids=this.skids.filter(skid=>skid.life>0);
    }
    const animateLife = !this.paused && !this.reducedMotion && this.animationsEnabled;
    if (animateLife) this.animationTime += dt;
    const moving =
      !this.paused &&
      (this.target !== null || this.garageTarget!==null || this.boarding!==null ||
        Math.hypot(this.car.vx,this.car.vy) > 0.1 ||
        Object.values(this.input).some(Boolean));
    if (moving) this.update(dt);
    this.driveTelemetryTime += dt;
    if (this.driveTelemetryTime >= 0.05) {
      this.driveTelemetryTime = 0;
      this.events.onDrive?.(this.getTelemetry());
    }
    const cameraMoving =
      Math.abs(this.cameraDistance - this.car.distance) > 0.1 ||
      Math.abs(this.cameraX - this.car.x) > 0.1;
    if (cameraMoving) {
      const blend = this.reducedMotion ? 1 : Math.min(1, dt * 8);
      this.cameraDistance += (this.car.distance - this.cameraDistance) * blend;
      this.cameraX += (this.car.x - this.cameraX) * blend;
    }
    const speed = this.paused ? 0 : Math.round(Math.hypot(this.car.vx,this.car.vy) * 0.32);
    if (speed !== this.lastSpeed) {
      this.lastSpeed = speed;
      this.events.onSpeed(speed);
    }
    this.locationTimer += dt;
    if (moving && this.locationTimer > 0.2) {
      this.locationTimer = 0;
      this.events.onLocation?.(this.car.distance, this.nextStation());
    }
    this.animationFrameTime += dt;
    const lifeFrame = animateLife && this.animationFrameTime >= 1 / 30;
    if (moving || cameraMoving || this.dirty || lifeFrame || this.hornTime>0 || this.exhaustTime>0) {
      this.render();
      this.dirty = false;
      this.animationFrameTime = 0;
    }
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }
  /** @param {number} seconds */
  update(seconds) {
    if(this.paused||!Number.isFinite(seconds)||seconds<=0) return;
    const dt=Math.min(seconds,.04);
    if(this.boarding) {
      this.boarding.time-=dt;
      if(this.boarding.time<=0) this.boarding=null;
      this.dirty=true;return;
    }
    const throttle=this.input.forward||this.target!==null||this.garageTarget!==null;
    const speed=Math.hypot(this.car.vx,this.car.vy);
    if(this.previousThrottle&&!throttle&&this.vehicle==='focus'&&speed*.32>45&&this.exhaustCooldown===0) {
      this.exhaustTime=.34;this.exhaustCooldown=.85;
    }
    this.previousThrottle=throttle;
    const active=Object.values(this.input).some(Boolean);
    if(active&&!this.manualActive) {
      this.target=null;this.garageTarget=null;this.garageDocking=false;this.garageRoute=[];this.garageRouteIndex=0;this.garageExiting=false;this.events.onManual?.();
    }
    this.manualActive=active;
    const previous=this.car.distance;
    if(this.lastArrival!==null&&Math.abs(previous-STATIONS[this.lastArrival].distance)>150) this.lastArrival=null;
    const garage=this.garageTarget?GARAGES.find(item=>item.id===this.garageTarget):undefined;
    const station=this.target!==null?STATIONS[this.target]:undefined;
    if(garage&&this.garageDocking) {
      this.followGarageRoute(dt,garage);
    } else if(station||garage) {
      const destination=garage?garageAccess(garage).entrance.distance:station?.distance??previous;
      const difference=destination-previous;
      const pace=195*(this.travelSpeed==='fast'?3:1);
      const movement=Math.min(Math.abs(difference),pace*dt);
      this.car.distance=previous+Math.sign(difference)*movement;
      const road=sampleRoad(this.car.distance);
      const desiredX=road.x+roadLaneCenter(this.car.distance);
      const dx=clamp(desiredX-this.car.x,-pace*dt,pace*dt);
      this.car.x+=dx;
      this.car.vx=dx/dt;this.car.vy=-(this.car.distance-previous)*VERTICAL_SCALE/dt;
      this.car.speed=Math.hypot(this.car.vx,this.car.vy);
      if(this.car.speed>.1) this.car.angle=Math.atan2(this.car.vx,-this.car.vy);
      this.steering*=Math.exp(-dt*7);this.drifting=false;this.syncCar();
      if(Math.abs(destination-this.car.distance)<.01&&Math.abs(desiredX-this.car.x)<.01) {
        if(garage&&!this.garageDocking) {
          this.garageDocking=true;this.garageRouteIndex=1;
          this.car.speed=0;this.car.vx=0;this.car.vy=0;
          return;
        }
        const index=this.target;
        this.target=null;this.garageTarget=null;this.garageDocking=false;this.car.speed=0;this.car.vx=0;this.car.vy=0;
        if(garage) {this.car.angle=0;this.steering=0;}
        this.events.onLocation?.(this.car.distance,this.nextStation());
        if(index!==null) {this.lastArrival=index;this.events.onArrive(index);}
        else if(garage) this.events.onGarageArrive?.(garage.id);
      }
    } else {
      const car=this.car,vehicle=VEHICLES[this.vehicle];
      const steeringTarget=(this.input.right?1:0)-(this.input.left?1:0);
      this.steering+=(steeringTarget-this.steering)*Math.min(1,dt*6);
      const oldForward=car.vx*Math.sin(car.angle)-car.vy*Math.cos(car.angle);
      const handbrake=!!this.input.drift&&speed>85;
      car.angle+=this.steering*Math.min(1,Math.abs(oldForward)/110)*Math.sign(oldForward)*dt*(handbrake?2:1.3);
      car.angle=Math.atan2(Math.sin(car.angle),Math.cos(car.angle));
      const sin=Math.sin(car.angle),cos=Math.cos(car.angle);
      let longitudinal=car.vx*sin-car.vy*cos;
      let lateral=car.vx*cos+car.vy*sin;
      const acceleration=(this.input.forward?(longitudinal< -20?500:vehicle.acceleration):0)-(this.input.backward?(longitudinal>20?520:225):0);
      longitudinal+=acceleration*dt;
      longitudinal*=Math.exp(-(this.onRoad?(handbrake?.85:acceleration?.35:.7):2.6)*dt);
      longitudinal=clamp(longitudinal,this.onRoad?-145:-80,this.onRoad?vehicle.maxSpeed:145);
      lateral*=Math.exp(-(this.onRoad?(handbrake?1.35:8.5):4.5)*dt);
      car.vx=sin*longitudinal+cos*lateral;car.vy=-cos*longitudinal+sin*lateral;
      if(Math.hypot(car.vx,car.vy)<.45) {car.vx=0;car.vy=0;}
      const old={x:car.x,y:car.distance};
      car.x+=car.vx*dt;car.distance-=car.vy*dt/VERTICAL_SCALE;
      const distance=clamp(car.distance,0,ROAD_LENGTH);
      if(distance!==car.distance) car.vy=0;
      car.distance=distance;
      const road=sampleRoad(distance),x=clamp(car.x,road.x-700,road.x+700);
      if(x!==car.x) car.vx=0;
      car.x=x;car.speed=longitudinal;this.syncCar();
      const slip=Math.abs(Math.atan2(lateral,Math.max(1,Math.abs(longitudinal))));
      this.drifting=this.onRoad&&speed>110&&slip>.105;
      if(this.drifting&&!this.reducedMotion&&this.animationsEnabled&&Math.hypot(car.x-old.x,car.distance-old.y)>2) {
        this.skids.push({a:old,b:{x:car.x,y:car.distance},life:18});this.skids=this.skids.slice(-360);
      }
      const nearby=this.getNearestStation();
      if(nearby!==null&&nearby!==this.lastArrival) {
        this.lastArrival=nearby;this.events.onLocation?.(car.distance,this.nextStation());this.events.onArrive(nearby);
      }
    }
    if(!this.isTrackNearby()) {this.trackEntryHeld=0;this.trackEntryUsed=false;}
    else if(this.target===null&&this.input.forward&&this.input.right&&!this.trackEntryUsed) {
      this.trackEntryHeld+=dt;
      if(this.trackEntryHeld>=.2) {this.trackEntryUsed=true;this.events.onTrackEnter?.();}
    } else this.trackEntryHeld=0;
  }
  /** @param {number} x @param {number} distance @param {number} [height] */
  screen(x, distance, height = 0) {
    return {
      x: this.width / 2 + (x - this.cameraX) * this.scale,
      y:
        this.carY +
        (this.cameraDistance - distance) * this.scale * VERTICAL_SCALE -
        height * this.scale,
    };
  }
  /** @param {MouseEvent} event */
  handleCanvasClick(event) {
    const bounds = this.canvas.getBoundingClientRect(),
      x = event.clientX - bounds.left,
      y = event.clientY - bounds.top;
    const index = STATIONS.findIndex((station) => {
      const point = this.screen(station.x + this.signOffsetFor(station.distance), station.distance, 20);
      const landmark = this.screen(station.x - this.landmarkOffsetFor(station.distance), station.distance);
      const onLandmark = Math.abs(x - landmark.x) < 120 * this.scale &&
        y > landmark.y - 200 * this.scale && y < landmark.y + 60 * this.scale;
      return Math.hypot(x - point.x, y - point.y) < 38 || onLandmark;
    });
    if (index >= 0) this.events.onNavigate?.(index);
  }
  /** @param {number} distance */
  visible(distance) {
    const y = this.screen(0, distance).y;
    return y > -270 * this.scale && y < this.height + 270 * this.scale;
  }
  /** @param {CanvasRenderingContext2D} ctx @param {Point[]} points @param {string|CanvasGradient} fill */
  polygon(ctx, points, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    points.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
    );
    ctx.closePath();
    ctx.fill();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r @param {string} fill */
  rounded(ctx, x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  render() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const region = getWorldRegion(this.cameraDistance),
      ground = ctx.createLinearGradient(0, 0, this.width, this.height);
    if(this.canvas.dataset) {
      this.canvas.dataset.region=region.id;
      this.canvas.dataset.lifeFrame=String(Math.floor((this.reducedMotion||!this.animationsEnabled?0:this.animationTime)*30));
      this.canvas.dataset.vehicle=this.vehicle;
      this.canvas.dataset.lights=String(this.lights);
      this.canvas.dataset.nearby=this.getNearestStation()===null?'':String(this.getNearestStation());
      this.canvas.dataset.trackNearby=String(this.isTrackNearby());
      this.canvas.dataset.exhaust=String(this.exhaustTime>0);
      this.canvas.dataset.surface=roadProfile(this.car.distance).surface;
      this.canvas.dataset.lanes=String(roadProfile(this.car.distance).lanes);
      this.canvas.dataset.sideStory=this.getNearbySideStory()??'';
      this.canvas.dataset.garage=this.getNearbyGarage()??'';
      this.canvas.dataset.boarding=String(this.boarding!==null);
      this.canvas.dataset.drifting=String(this.drifting);
      this.canvas.dataset.onRoad=String(this.onRoad);
      this.canvas.dataset.heading=this.car.angle.toFixed(3);
      this.canvas.dataset.lane=this.car.lane.toFixed(2);
      this.canvas.dataset.festival=String(festivalPresence(this.car.distance,this.car.lane)>.1);
    }
    ground.addColorStop(0, region.ground);
    ground.addColorStop(1, region.shade);
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, this.width, this.height);
    this.paintTerrain(ctx);
    this.paintRoad(ctx);
    this.paintGarages(ctx);
    this.paintSkids(ctx);
    this.paintInteractionZones(ctx);
    this.paintTrackEntrance(ctx);
    this.paintTraffic(ctx);
    this.paintTrafficLights(ctx);
    const objects = SCENERY.filter((item) => {
      if (!this.visible(item.distance)) return false;
      if(!this.trackSceneryClear(item)) return false;
      // Tall foreground facades project above their footprint and must leave both parking bays visible.
      if (GARAGES.some(garage => {
        const lot = this.garagePosition(garage);
        const objectX = sampleRoad(item.distance).x + item.offset;
        const clearance=item.kind==='block'||item.kind==='house'||getWorldRegion(item.distance).id==='warsaw'?150:95;
        return (Math.abs(item.distance-garage.distance)<380 && Math.abs(objectX-lot.x)<230)
          || distanceToGarageAccess({x:objectX,distance:item.distance},garage)<clearance;
      })) return false;
      // Milestone lots stay clear so foreground trees cannot hide their facades.
      return item.kind !== 'tree' || !STATIONS.some(station =>
        Math.abs(station.distance-item.distance)<170 && Math.abs(item.offset+this.landmarkOffsetFor(station.distance))<145);
    });
    const landmarks = STATIONS.filter((station) =>
      this.visible(station.distance),
    );
    const ordered = [
      ...objects.map((item) => ({
        distance: item.distance,
        item,
        station: null,
      })),
      ...landmarks.map((station) => ({
        distance: station.distance,
        item: null,
        station,
      })),
    ].sort((a, b) => b.distance - a.distance);
    for (const object of ordered) {
      if (object.item) this.paintScenery(ctx, object.item);
      else if (object.station) this.paintLandmark(ctx, object.station);
    }
    this.paintLife(ctx);
    this.paintStationSigns(ctx);
    this.paintRegionSigns(ctx);
    this.paintSideStories(ctx);
    // Keep the playable car readable even when it overlaps a roadside illustration or facade.
    this.paintCar(ctx);
    this.paintBoarding(ctx);
    const fog = ctx.createLinearGradient(0, 0, 0, this.height);
    fog.addColorStop(0, "#0b151e88");
    fog.addColorStop(0.2, "#08110d00");
    fog.addColorStop(0.8, "#08110d00");
    fog.addColorStop(1, "#09110d7a");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, this.width, this.height);
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintSkids(ctx) {
    if(this.reducedMotion||!this.animationsEnabled) return;
    ctx.lineWidth=9*this.scale;
    for(const skid of this.skids) {
      const a=this.screen(skid.a.x,skid.a.y),b=this.screen(skid.b.x,skid.b.y);
      ctx.strokeStyle=`rgba(8,16,15,${Math.min(.42,skid.life/18)})`;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintGarages(ctx) {
    for(const garage of GARAGES) {
      const access=garageAccess(garage);
      if(!this.visible(garage.distance)&&!this.visible(access.entrance.distance)) continue;
      this.paintGarageAccess(ctx,garage);
      const position=this.garagePosition(garage),point=this.screen(position.x,position.distance);
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
      this.rounded(ctx,-101,-88,202,170,10,'#adb49e');this.rounded(ctx,-96,-83,192,160,7,'#566763');
      ctx.strokeStyle=this.getNearbyGarage()===garage.id?'#f1d287':'#d6d7b588';ctx.lineWidth=2;
      ctx.strokeRect(-88,-73,176,140);
      for(const bay of [-1,1]) {ctx.beginPath();ctx.moveTo(bay*15,-60);ctx.lineTo(bay*81,-60);ctx.lineTo(bay*81,53);ctx.stroke();}
      this.rounded(ctx,-94,-132,188,36,5,'#203931');
      this.label(ctx,garage.id==='cmax'?'FORD C-MAX - 2009':'FORD FOCUS ST - 2018',0,-118,9,'#e8d49d');
      this.label(ctx,'P · E / ENTER',0,-104,8,'#bac8af');
      const parked=this.garageCars.get(garage.id)??garage.id;
      const parkedPosition=this.garageParkedPosition(garage);
      if(!this.boarding||Math.abs(this.boarding.end.distance-garage.distance)>50) {
        ctx.save();ctx.translate(parkedPosition.x-position.x,(garage.distance-parkedPosition.distance)*VERTICAL_SCALE);paintVehicle(ctx,parked);ctx.restore();
      }
      ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {typeof GARAGES[number]} garage */
  paintGarageAccess(ctx,garage) {
    const access=garageAccess(garage),points=access.points.map(point=>this.screen(point.x,point.distance));
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    const trace=()=>{
      ctx.beginPath();
      for(const [index,point] of points.entries()) {
        if(index) ctx.lineTo(point.x,point.y);else ctx.moveTo(point.x,point.y);
      }
    };
    trace();ctx.strokeStyle='#11251d55';ctx.lineWidth=(access.width+22)*this.scale;ctx.stroke();
    trace();ctx.strokeStyle='#b7b49b';ctx.lineWidth=(access.width+10)*this.scale;ctx.stroke();
    trace();ctx.strokeStyle='#414e4c';ctx.lineWidth=access.width*this.scale;ctx.stroke();
    trace();ctx.strokeStyle='#e6d39a99';ctx.lineWidth=1.8*this.scale;ctx.setLineDash([11*this.scale,13*this.scale]);ctx.stroke();ctx.setLineDash([]);
    const lot=access.lot;
    const apron=access.apron.map(point=>this.screen(point.x,point.distance));
    this.polygon(ctx,apron,'#b7b49b');
    this.polygon(ctx,[
      this.screen(lot.x-46,garage.distance-172),this.screen(lot.x+46,garage.distance-172),
      this.screen(lot.x+96,garage.distance-92),this.screen(lot.x-96,garage.distance-92)
    ],'#465552');
    for(const index of [12,31]) {
      const point=points[index],next=points[index+1];
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
      ctx.rotate(Math.atan2(next.x-point.x,point.y-next.y));
      ctx.strokeStyle='#eddfb4b3';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-7,4);ctx.lineTo(0,-5);ctx.lineTo(7,4);ctx.stroke();ctx.restore();
    }
    const signDistance=garage.distance-350,road=sampleRoad(signDistance);
    const sign=this.screen(road.x+garage.side*(roadProfile(signDistance).width/2+68),signDistance,14);
    ctx.translate(sign.x,sign.y);ctx.scale(this.scale,this.scale);
    this.rounded(ctx,-35,-34,70,42,5,'#18362f');
    ctx.strokeStyle='#d7c184';ctx.lineWidth=1;ctx.strokeRect(-31,-30,62,34);
    this.label(ctx,garage.side<0?'← P':'P →',0,-15,15,GOLD);
    this.label(ctx,this.language==='pl'?'WJAZD':'ENTRANCE',0,0,7,'#e2d8b9');
    ctx.fillStyle='#9ba58d';ctx.fillRect(-24,8,3,24);ctx.fillRect(21,8,3,24);
    ctx.restore();
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintBoarding(ctx) {
    if(!this.boarding||this.reducedMotion||!this.animationsEnabled) return;
    const {start,end,vehicle,time}=this.boarding;
    const from=this.screen(start.x,start.distance),to=this.screen(end.x,end.distance);
    ctx.save();ctx.translate(from.x,from.y);ctx.scale(this.scale,this.scale);ctx.rotate(start.angle);paintVehicle(ctx,vehicle);ctx.restore();
    const progress=clamp(1-time/.9,0,1);
    const x=from.x+(to.x-from.x)*progress,y=from.y+(to.y-from.y)*progress;
    ctx.save();ctx.translate(x,y);ctx.scale(this.scale,this.scale);
    const step=Math.sin(progress*Math.PI*8)*4;
    ctx.strokeStyle='#263b36';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(-5-step,12);ctx.moveTo(3,3);ctx.lineTo(5+step,12);ctx.stroke();
    this.rounded(ctx,-7,-15,14,22,4,'#253951');ctx.fillStyle='#dbb789';ctx.beginPath();ctx.arc(0,-22,6,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintInteractionZones(ctx) {
    for (const [index,station] of STATIONS.entries()) {
      if (!this.visible(station.distance)) continue;
      const point=this.screen(station.x,station.distance);
      const nearby=this.getNearestStation()===index;
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);ctx.rotate(sampleRoad(station.distance).angle);
      ctx.fillStyle=nearby?'#ead3911b':'#b2d7bc09';
      ctx.strokeStyle=nearby?'#f5d887cc':'#d3c89266';
      ctx.lineWidth=nearby?2.4:1.5;
      ctx.setLineDash([9,7]);
      const width=roadProfile(station.distance).width-10;
      ctx.beginPath();ctx.roundRect(-width/2,-88,width,176,10);ctx.fill();ctx.stroke();ctx.setLineDash([]);
      this.rounded(ctx,-37,-102,74,19,4,nearby?'#e4bf78':'#20372b');
      this.label(ctx,'E / ENTER',0,-89,8,nearby?'#213428':'#e4cf9d');
      ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintTrackEntrance(ctx) {
    if (!this.visible(TRACK_ACCESS.entry.distance)&&!this.visible(TRACK_ACCESS.gate.distance)) return;
    const {points,width,shoulder,entry,gate}=TRACK_ACCESS;
    const curbStart=points.findIndex(point=>point.x-sampleRoad(point.distance).x>=roadProfile(point.distance).width/2+width/2+shoulder);
    const path=(start=0)=>{
      ctx.beginPath();
      for(const [index,point] of points.slice(start).entries()) {
        const screen=this.screen(point.x,point.distance);
        if(index) ctx.lineTo(screen.x,screen.y); else ctx.moveTo(screen.x,screen.y);
      }
    };
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    // Curbs start outside the main carriageway; the asphalt alone makes the open junction.
    path(Math.max(0,curbStart));ctx.strokeStyle='#c0b29a';ctx.lineWidth=(width+shoulder*2)*this.scale;ctx.stroke();
    path();ctx.strokeStyle='#3c4647';ctx.lineWidth=width*this.scale;ctx.stroke();
    path(Math.max(0,curbStart));ctx.setLineDash([14*this.scale,17*this.scale]);ctx.strokeStyle='#ecd7a388';ctx.lineWidth=2*this.scale;ctx.stroke();ctx.setLineDash([]);
    const marker=this.screen(gate.x,gate.distance);
    ctx.strokeStyle='#ead391';ctx.lineWidth=3*this.scale;ctx.beginPath();
    ctx.moveTo(marker.x-27*this.scale,marker.y+17*this.scale);ctx.lineTo(marker.x+27*this.scale,marker.y-17*this.scale);ctx.stroke();
    const arrow=this.screen(points[14].x,points[14].distance);
    ctx.fillStyle=GOLD;ctx.font=`700 ${17*this.scale}px Inter, sans-serif`;ctx.textAlign='center';ctx.fillText('→',arrow.x,arrow.y+6*this.scale);
    const sign=this.screen(entry.x+82,entry.distance-125,25);
    ctx.translate(sign.x,sign.y);ctx.scale(this.scale,this.scale);
    this.rounded(ctx,-43,-28,110,49,6,'#122c2b');
    ctx.strokeStyle='#e4bf78';ctx.lineWidth=1.5;ctx.strokeRect(-40,-25,104,43);
    this.label(ctx,this.language==='pl'?'TOR · DRIFT →':'DRIFT CIRCUIT →',12,-8,9,GOLD);
    this.label(ctx,this.language==='pl'?'ZJAZD W PRAWO':'RIGHT-HAND EXIT',12,8,7,'#efe2ba');
    ctx.fillStyle='#8a9d87';ctx.fillRect(-31,22,4,30);ctx.fillRect(46,22,4,30);
    ctx.restore();
    const gateSign=this.screen(gate.x,gate.distance+100,40);
    ctx.save();ctx.translate(gateSign.x,gateSign.y);ctx.scale(this.scale,this.scale);
    this.rounded(ctx,-53,-20,106,39,5,'#122c2b');
    this.label(ctx,this.language==='pl'?'WJAZD NA TOR':'CIRCUIT ENTRY',0,-4,8,GOLD);
    this.label(ctx,'E / ENTER',0,10,8,'#efe2ba');ctx.restore();
  }
  /** @param {Scenery} item */
  trackSceneryClear(item) {
    const x=sampleRoad(item.distance).x+item.offset;
    const facade=item.kind==='block'||item.kind==='house'||(item.kind==='tree'&&getWorldRegion(item.distance).id==='warsaw'&&item.seed%3===0);
    const halfWidth=facade?95:item.kind==='pedestrians'?115:60;
    const height=facade?270:item.kind==='pedestrians'?100:105;
    return !trackAccessIntersectsBounds({left:x-halfWidth,right:x+halfWidth,minDistance:item.distance-45/VERTICAL_SCALE,maxDistance:item.distance+height/VERTICAL_SCALE},12);
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintTerrain(ctx) {
    const start = Math.max(
        -400,
        Math.floor((this.cameraDistance - 1400) / 200) * 200,
      ),
      end = Math.min(ROAD_LENGTH + 500, this.cameraDistance + 1800);
    for (let distance = start; distance < end; distance += 200) {
      const road = sampleRoad(distance),
        point = this.screen(road.x, distance),
        region = getWorldRegion(distance);
      if (region.id === 'village') {
        for (const side of [-1, 1]) {
          const x = point.x + side * 480 * this.scale - 120 * this.scale,
            y = point.y - 110 * this.scale;
          this.rounded(
            ctx,
            x,
            y,
            240 * this.scale,
            130 * this.scale,
            5 * this.scale,
            side < 0 ? "#696447" : "#455d3d",
          );
          ctx.strokeStyle = side < 0 ? "#d1b26e28" : "#95a57522";
          ctx.lineWidth = 2 * this.scale;
          for (const row of [0, 1, 2, 3, 4, 5]) {
            ctx.beginPath();
            ctx.moveTo(x + 12 * this.scale, y + (14 + row * 21) * this.scale);
            ctx.lineTo(x + 225 * this.scale, y + (14 + row * 21) * this.scale);
            ctx.stroke();
          }
        }
      } else if (region.id === 'torun') {
        this.paintRiver(ctx,point,distance);
        this.paintTownSquare(ctx,point,region.paving,'#ad8468');
      } else if (region.id === 'warsaw') {
        this.paintTownSquare(ctx,point,region.paving,'#5d7882');
        for(const side of [-1,1]) {
          const x=point.x+side*420*this.scale;
          this.rounded(ctx,x-55*this.scale,point.y-100*this.scale,110*this.scale,140*this.scale,2,'#627e8a44');
          ctx.strokeStyle='#b4ced11f';ctx.lineWidth=1;
          for(const line of [0,1,2,3,4,5]) {ctx.beginPath();ctx.moveTo(x-55*this.scale,point.y+(-90+line*23)*this.scale);ctx.lineTo(x+55*this.scale,point.y+(-90+line*23)*this.scale);ctx.stroke();}
        }
      } else if (region.id === 'campus' || region.id === 'awards' || region.id === 'community') {
        for(const side of [-1,1]) {
          this.rounded(ctx,point.x+(side<0?-560:125)*this.scale,point.y-115*this.scale,435*this.scale,150*this.scale,24*this.scale,region.id==='awards'?'#a99a6755':'#78a66d33');
          this.rounded(ctx,point.x+(side<0?-560:125)*this.scale,point.y-18*this.scale,435*this.scale,20*this.scale,3,region.paving+'99');
        }
      } else if (region.id === 'technology') {
        this.paintTownSquare(ctx,point,region.paving,'#3f6873');
        ctx.strokeStyle='#89bfc72b';ctx.lineWidth=2;
        for(const side of [-1,1]) {ctx.beginPath();ctx.moveTo(point.x+side*150*this.scale,point.y);ctx.lineTo(point.x+side*410*this.scale,point.y);ctx.lineTo(point.x+side*410*this.scale,point.y-50*this.scale);ctx.stroke();}
      } else {
        for (const side of [-1, 1])
          this.rounded(
            ctx,
            point.x + (side < 0 ? -560 : 180) * this.scale,
            point.y - 115 * this.scale,
            380 * this.scale,
            100 * this.scale,
            12 * this.scale,
            "#ffffff04",
          );
      }
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {Point} point @param {string} paving @param {string} accent */
  paintTownSquare(ctx,point,paving,accent) {
    for(const side of [-1,1]) {
      const x=point.x+(side<0?-585:125)*this.scale,y=point.y-115*this.scale;
      this.rounded(ctx,x,y,460*this.scale,155*this.scale,5,paving+'38');
      ctx.strokeStyle=accent+'55';ctx.lineWidth=1;
      for(const column of [0,1,2,3,4,5,6,7,8]) {ctx.beginPath();ctx.moveTo(x+column*57*this.scale,y);ctx.lineTo(x+column*57*this.scale,y+155*this.scale);ctx.stroke();}
      for(const row of [0,1,2,3,4]) {ctx.beginPath();ctx.moveTo(x,y+row*38*this.scale);ctx.lineTo(x+460*this.scale,y+row*38*this.scale);ctx.stroke();}
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {Point} point @param {number} distance */
  paintRiver(ctx,point,distance) {
    const x=point.x+395*this.scale;
    this.rounded(ctx,x,point.y-130*this.scale,310*this.scale,170*this.scale,24*this.scale,'#365c6a');
    ctx.strokeStyle='#a7c0b844';ctx.lineWidth=2;
    for(const row of [0,1,2,3]) {
      const wave=Math.sin(this.animationTime*.8+row+distance*.01)*9*this.scale;
      ctx.beginPath();ctx.moveTo(x+20*this.scale+wave,point.y+(-100+row*38)*this.scale);ctx.lineTo(x+260*this.scale+wave,point.y+(-100+row*38)*this.scale);ctx.stroke();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintLife(ctx) {
    const time=this.reducedMotion||!this.animationsEnabled?0:this.animationTime;
    for(const station of STATIONS) {
      // The office vignette sits beyond the collection lot to keep its playable parking clear.
      const distance=station.distance+(station.id==='netwise'?500:140);
      if(!this.visible(distance)) continue;
      const point=this.screen(station.x+Math.max(205,roadProfile(station.distance).width/2+120),distance);
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
      paintLifeScene(ctx,station.kind,time,this.language);
      ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintRoad(ctx) {
    const lower=this.cameraDistance-(this.height-this.carY+180)/(this.scale*VERTICAL_SCALE);
    const upper=this.cameraDistance+(this.carY+180)/(this.scale*VERTICAL_SCALE);
    const start=Math.floor(lower/35)*35;
    const points=[];
    for(let distance=start;distance<=upper+35;distance+=35) {
      const road=sampleRoad(distance);
      points.push({distance,point:this.screen(road.x,distance),profile:roadProfile(distance)});
    }
    for(const [index,current] of points.entries()) {
      const next=points[index+1];
      if(!next) continue;
      const strip=(extra=0)=>[
        {x:current.point.x-(current.profile.width/2+extra)*this.scale,y:current.point.y},
        {x:next.point.x-(next.profile.width/2+extra)*this.scale,y:next.point.y},
        {x:next.point.x+(next.profile.width/2+extra)*this.scale,y:next.point.y},
        {x:current.point.x+(current.profile.width/2+extra)*this.scale,y:current.point.y},
      ];
      this.polygon(ctx,strip(current.profile.shoulder+14),'#14241d55');
      this.polygon(ctx,strip(current.profile.shoulder),current.profile.surface==='gravel'?'#b3a17b':'#90988a');
      this.polygon(ctx,strip(),current.profile.surface==='gravel'?'#94866b':'#46504d');
      if(current.profile.surface==='gravel') {
        for(const pebble of [0,1,2,3,4,5,6]) {
          const seed=current.distance+pebble*83;
          const x=current.point.x+(noise(seed)-.5)*(current.profile.width-12)*this.scale;
          const y=current.point.y-noise(seed+7)*24*this.scale;
          ctx.fillStyle=pebble%2?'#d3c09a77':'#615e4b55';ctx.beginPath();ctx.ellipse(x,y,(1.2+noise(seed+3)*1.4)*this.scale,1.2*this.scale,.3,0,Math.PI*2);ctx.fill();
        }
      }
      if(current.profile.median>0) {
        const median=current.profile.median/2*this.scale;
        const nextMedian=next.profile.median/2*this.scale;
        this.polygon(ctx,[{x:current.point.x-median,y:current.point.y},{x:next.point.x-nextMedian,y:next.point.y},{x:next.point.x+nextMedian,y:next.point.y},{x:current.point.x+median,y:current.point.y}],'#a4a786');
      }
      for(const side of [-1,1]) {
        ctx.strokeStyle='#e3dfbb70';ctx.lineWidth=1.5*this.scale;
        ctx.beginPath();ctx.moveTo(current.point.x+side*(current.profile.width/2-6)*this.scale,current.point.y);ctx.lineTo(next.point.x+side*(next.profile.width/2-6)*this.scale,next.point.y);ctx.stroke();
      }
      if(Math.floor(current.distance/35)%2===0&&current.profile.lanes>1) {
        for(const lane of current.profile.lanes===4?[-1,1]:[0]) {
          const offset=lane*current.profile.width/4*this.scale;
          const nextOffset=lane*next.profile.width/4*this.scale;
          ctx.strokeStyle=current.profile.lanes===4?'#eee7ce9c':'#f1d38e9c';ctx.lineWidth=2*this.scale;
          ctx.beginPath();ctx.moveTo(current.point.x+offset,current.point.y);ctx.lineTo(next.point.x+nextOffset,next.point.y);ctx.stroke();
        }
      }
    }
    for(const station of STATIONS) {
      if(!this.visible(station.distance)) continue;
      const point=this.screen(station.x,station.distance),width=roadProfile(station.distance).width;
      this.rounded(ctx,point.x-(width/2+180)*this.scale,point.y-33*this.scale,170*this.scale,83*this.scale,12*this.scale,'#a49d7e');
      this.rounded(ctx,point.x-(width/2+178)*this.scale,point.y-31*this.scale,166*this.scale,79*this.scale,10*this.scale,'#696f5b');
      const stripes=Math.floor((width-20)/21);
      for(let stripe=0;stripe<stripes;stripe++) this.rounded(ctx,point.x+(-width/2+13+stripe*21)*this.scale,point.y+70*this.scale,12*this.scale,28*this.scale,1,'#ede3b873');
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintTraffic(ctx) {
    const time=this.reducedMotion||!this.animationsEnabled?0:this.animationTime;
    const traffic=[{base:730,direction:-1,speed:54},{base:2130,direction:1,speed:71},{base:3890,direction:-1,speed:67},{base:5710,direction:1,speed:62},{base:7520,direction:-1,speed:77},{base:9160,direction:1,speed:75},{base:10890,direction:-1,speed:91},{base:11730,direction:1,speed:82}];
    for(const [index,car] of traffic.entries()) {
      const distance=((car.base+car.direction*time*car.speed)%ROAD_LENGTH+ROAD_LENGTH)%ROAD_LENGTH;
      if(!this.visible(distance)) continue;
      const road=sampleRoad(distance),profile=roadProfile(distance);
      const lane=profile.lanes===1?car.direction*21:car.direction*(profile.width/4);
      const point=this.screen(road.x+lane,distance);
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale*.88,this.scale*.88);ctx.rotate(road.angle+(car.direction<0?Math.PI:0));
      ctx.fillStyle='#0c1b1b55';ctx.beginPath();ctx.ellipse(4,7,20,37,0,0,Math.PI*2);ctx.fill();
      for(const side of [-1,1]) {this.rounded(ctx,side*16-3,-22,6,16,2,'#182426');this.rounded(ctx,side*16-3,15,6,16,2,'#182426');}
      const color=['#9eaa9d','#a87562','#789392','#bca976'][index%4];
      this.rounded(ctx,-16,-38,32,74,9,color);this.rounded(ctx,-12,-18,24,39,5,'#304a4b');
      this.rounded(ctx,-10,-4,20,18,3,color);this.rounded(ctx,-11,-16,22,8,3,'#a6bdb47a');
      ctx.fillStyle='#dfdfb9';ctx.fillRect(-12,-34,7,3);ctx.fillRect(5,-34,7,3);
      ctx.fillStyle='#a8493d';ctx.fillRect(-12,29,7,3);ctx.fillRect(5,29,7,3);ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintTrafficLights(ctx) {
    for(const distance of [2660,3960,5260,6560,7860,9160,10400,11300]) {
      if(!this.visible(distance)) continue;
      const road=sampleRoad(distance),profile=roadProfile(distance);
      const phase=Math.floor((this.reducedMotion||!this.animationsEnabled?0:this.animationTime)/5+distance/1300)%3;
      for(const side of [-1,1]) {
        const point=this.screen(road.x+side*(profile.width/2+14),distance);
        ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
        ctx.fillStyle='#a2ab94';ctx.fillRect(-2,-8,4,32);this.rounded(ctx,-8,-49,16,45,4,'#1c2e2a');
        for(const [index,color] of ['#df7864','#e5c474','#9fbc83'].entries()) {ctx.fillStyle=index===phase?color:'#435044';ctx.beginPath();ctx.arc(0,-40+index*13,4,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {Scenery} object */
  paintScenery(ctx, object) {
    const road = sampleRoad(object.distance),
      point = this.screen(road.x + object.offset, object.distance);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.scale(this.scale, this.scale);
    const region=getWorldRegion(object.distance);
    if (object.kind === "tree") {
      if(region.id==='warsaw'&&object.seed%3===0) this.block(ctx,54+noise(object.seed)*30,140+noise(object.seed+3)*110,object.seed,'glass');
      else this.tree(ctx, noise(object.seed), object.seed);
    }
    else if (object.kind === "house") this.house(ctx, object.seed);
    else if (object.kind === "block") {
      if(region.id==='torun') this.townHouse(ctx,object.seed);
      else this.block(ctx,92+noise(object.seed)*50,(region.id==='warsaw'?125:65)+noise(object.seed+3)*(region.id==='warsaw'?100:60),object.seed,region.id==='warsaw'?'glass':'default');
    }
    else if (object.kind === "lamp") this.lamp(ctx);
    else if(object.kind==='pedestrians') paintLifeScene(ctx,'pedestrians',this.reducedMotion||!this.animationsEnabled?0:this.animationTime,this.language);
    else {
      this.rounded(ctx, -16, -5, 32, 8, 2, "#a09065");
      this.rounded(ctx, -16, -13, 32, 5, 2, "#cab787");
      ctx.fillStyle = "#182b24";
      ctx.fillRect(-13, 3, 4, 10);
      ctx.fillRect(9, 3, 4, 10);
    }
    ctx.restore();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} seed */
  townHouse(ctx,seed) {
    const width=65+noise(seed)*20,height=95+noise(seed+2)*30;
    this.rounded(ctx,-width/2,-height,width,height+15,3,seed%2?'#b27a58':'#aa6651');
    this.polygon(ctx,[{x:-width/2-4,y:-height},{x:-width/2+10,y:-height-12},{x:-width/2+10,y:-height-22},{x:0,y:-height-45},{x:width/2-10,y:-height-22},{x:width/2-10,y:-height-12},{x:width/2+4,y:-height}],'#c6986c');
    for(const y of [-height+20,-height+49,-height+78]) for(const x of [-17,17]) {
      ctx.fillStyle='#f0d4a1';ctx.beginPath();ctx.roundRect(x-7,y,14,18,[7,7,0,0]);ctx.fill();
    }
    this.rounded(ctx,-8,-8,16,23,2,'#41554b');
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} variation @param {number} seed */
  tree(ctx, variation, seed) {
    const size = 23 + variation * 15;
    ctx.fillStyle = "#10251b55";
    ctx.beginPath();
    ctx.ellipse(12, 7, size * 0.9, size * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#695c3e";
    ctx.fillRect(-3, -15, 6, 23);
    if (seed % 3 === 0) {
      for (const [level, width] of [
        [0, size],
        [-17, size * 0.8],
        [-32, size * 0.56],
      ])
        this.polygon(
          ctx,
          [
            { x: -width, y: level },
            { x: width, y: level },
            { x: 0, y: level - 35 },
          ],
          level === 0 ? "#294d35" : level === -17 ? "#396344" : "#53754b",
        );
    } else {
      ctx.fillStyle = "#284d36";
      ctx.beginPath();
      ctx.arc(0, -23, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#456a42";
      ctx.beginPath();
      ctx.arc(-7, -30, size * 0.76, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#678050";
      ctx.beginPath();
      ctx.arc(-12, -36, size * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} seed */
  house(ctx, seed) {
    const color = ["#b6ad86", "#c5b49a", "#9da68b"][seed % 3];
    ctx.fillStyle = "#10201755";
    ctx.beginPath();
    ctx.ellipse(12, 12, 57, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    this.rounded(ctx, -44, -48, 88, 65, 3, color);
    this.polygon(
      ctx,
      [
        { x: -51, y: -42 },
        { x: 0, y: -88 },
        { x: 51, y: -42 },
      ],
      seed % 2 ? "#8a5c44" : "#726647",
    );
    this.polygon(
      ctx,
      [
        { x: 0, y: -88 },
        { x: 51, y: -42 },
        { x: 51, y: -26 },
        { x: 0, y: -72 },
      ],
      "#5c4937",
    );
    ctx.fillStyle = "#efe4a4";
    ctx.fillRect(-29, -26, 17, 22);
    ctx.fillRect(14, -26, 17, 22);
    ctx.fillStyle = "#554c36";
    ctx.fillRect(-3, -15, 16, 32);
    ctx.fillStyle = "#7b775c";
    ctx.fillRect(-48, 17, 96, 6);
  }
  /** @param {CanvasRenderingContext2D} ctx @param {number} width @param {number} height @param {number} seed @param {string} [palette] */
  block(ctx, width, height, seed,palette='default') {
    const facade = (palette==='glass'?["#63828a","#7e9a9d","#53717d"]:["#8d9a86", "#a1a18c", "#b3aa8f"])[seed % 3];
    this.rounded(ctx, -width / 2 + 9, 8, width, 27, 8, "#12271d66");
    this.rounded(ctx, -width / 2, -height, width, height + 19, 3, facade);
    this.polygon(
      ctx,
      [
        { x: width / 2, y: -height },
        { x: width / 2 + 15, y: -height - 12 },
        { x: width / 2 + 15, y: 7 },
        { x: width / 2, y: 19 },
      ],
      "#637561",
    );
    this.polygon(
      ctx,
      [
        { x: -width / 2, y: -height },
        { x: -width / 2 + 15, y: -height - 12 },
        { x: width / 2 + 15, y: -height - 12 },
        { x: width / 2, y: -height },
      ],
      "#c3bfa0",
    );
    for (let level = 21; level < height - 8; level += 25)
      for (let offset = -width / 2 + 13; offset < width / 2 - 9; offset += 23) {
        ctx.fillStyle =
          Math.round(offset + level + seed) % 3 ? "#eed896" : "#526b63";
        ctx.fillRect(offset, -height + level, 12, 16);
        ctx.fillStyle = "#354c4229";
        ctx.fillRect(offset, -height + level, 12, 3);
      }
    ctx.fillStyle = "#385549";
    ctx.fillRect(-10, -12, 20, 31);
  }
  /** @param {CanvasRenderingContext2D} ctx */
  lamp(ctx) {
    ctx.strokeStyle = "#a8aa8a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -48);
    ctx.quadraticCurveTo(0, -57, 15, -57);
    ctx.stroke();
    const light = ctx.createRadialGradient(15, -55, 0, 15, -55, 39);
    light.addColorStop(0, "#ffdf8f38");
    light.addColorStop(1, "#ffdf8f00");
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(15, -55, 39, 0, Math.PI * 2);
    ctx.fill();
    this.rounded(ctx, 9, -59, 15, 6, 2, "#f4dfa2");
  }
  /** @param {CanvasRenderingContext2D} ctx @param {typeof STATIONS[number]} station */
  paintLandmark(ctx, station) {
    const point = this.screen(station.x - this.landmarkOffsetFor(station.distance), station.distance);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.scale(this.scale, this.scale);
    this.rounded(ctx, -120, -93, 240, 145, 15, "#b6af8b");
    this.rounded(ctx, -115, -88, 230, 134, 12, "#768270");
    if (station.kind === "monument") this.monument(ctx);
    else if(station.kind==='design') this.torunLandmark(ctx);
    else if(station.kind==='netwise') this.warsawLandmark(ctx);
    else if (station.kind === "future") {
      this.rounded(ctx, -100, -65, 200, 98, 8, "#3e6250");
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, -72, 53, Math.PI, Math.PI * 2);
      ctx.stroke();
      this.label(ctx, "NEXT", 0, -40, 21, "#f6d48e");
      this.polygon(
        ctx,
        [
          { x: -17, y: -22 },
          { x: 17, y: -22 },
          { x: 17, y: -34 },
          { x: 39, y: -9 },
          { x: 17, y: 16 },
          { x: 17, y: 3 },
          { x: -17, y: 3 },
        ],
        GOLD,
      );
    } else {
      const height =
          station.kind === "school"
            ? 72
            : station.kind === "systems"
              ? 135
              : 97,
        width = station.kind === "office" ? 168 : 205;
      this.block(ctx, width, height, STATIONS.indexOf(station) + 1);
      if (station.kind === "school") {
        this.polygon(
          ctx,
          [
            { x: -114, y: -72 },
            { x: 0, y: -113 },
            { x: 114, y: -72 },
          ],
          "#a27f52",
        );
        this.rounded(ctx, -69, -44, 138, 17, 3, "#3a5140");
        this.label(ctx, "TECHNIKUM", 0, -32, 11, "#f1dfaa");
        for (const x of [-76, 76]) {
          ctx.fillStyle = "#d6cbaa";
          ctx.fillRect(x, -59, 9, 78);
        }
        ctx.fillStyle = "#c7b27c";
        ctx.fillRect(119, -38, 3, 72);
        ctx.fillStyle = "#eee6cf";
        ctx.fillRect(122, -37, 31, 11);
        ctx.fillStyle = "#b86152";
        ctx.fillRect(122, -26, 31, 11);
      } else if (station.kind === "university" || station.kind === "learning") {
        this.rounded(ctx, -104, -70, 208, 70, 3, "#c9c5a4");
        for (const x of [-81, -48, -15, 18, 51, 84]) {
          this.rounded(ctx, x - 4, -68, 9, 88, 2, "#e1d7b0");
          this.rounded(ctx, x - 7, 14, 15, 7, 1, "#a8aa8b");
        }
        this.rounded(ctx, -112, -88, 224, 25, 3, "#d7cba2");
        this.label(ctx, "UNIWERSYTET", 0, -71, 12, "#34483d");
        if (station.kind === "learning") {
          this.rounded(ctx, -37, -130, 75, 28, 4, "#354d40");
          this.label(ctx, "2023 · 2024", 0, -111, 10, GOLD);
        }
      } else {
        const title =
          station.kind === "office"
            ? "ARKONSOFT"
            : station.kind === "systems"
              ? "UCI UR"
              : station.kind === "design"
                ? "SSC MASTER"
                : "ASBiR";
        this.rounded(
          ctx,
          -width / 2 + 10,
          -height + 8,
          width - 20,
          22,
          3,
          "#263e32",
        );
        this.label(
          ctx,
          title,
          0,
          -height + 24,
          station.kind === "office" ? 13 : 12,
          GOLD,
        );
        if (station.kind === "design")
          for (const [offset, color] of [
            [-43, "#cbaee3"],
            [-10, "#aac8a9"],
            [23, "#e4c384"],
          ])
            this.rounded(
              ctx,
              Number(offset),
              -height - 30,
              24,
              23,
              4,
              String(color),
            );
        if (station.kind === "community")
          for (const [x, color] of [
            [-74, "#e2bc75"],
            [-36, "#b7c3a3"],
            [18, "#a9bdc3"],
            [63, "#dbb29b"],
          ]) {
            const px = Number(x);
            ctx.fillStyle = String(color);
            ctx.beginPath();
            ctx.arc(px, 33, 5, 0, Math.PI * 2);
            ctx.fill();
            this.rounded(ctx, px - 4, 39, 8, 13, 3, String(color));
          }
      }
    }
    ctx.restore();
  }
  /** A red-brick clock tower and gabled streets identify the Toruń chapter.
   * @param {CanvasRenderingContext2D} ctx
   */
  torunLandmark(ctx) {
    this.rounded(ctx,-110,-75,220,107,3,'#a46f52');
    this.polygon(ctx,[{x:-118,y:-75},{x:-86,y:-108},{x:-54,y:-75}],'#ba8863');
    this.polygon(ctx,[{x:53,y:-75},{x:85,y:-108},{x:117,y:-75}],'#ba8863');
    this.rounded(ctx,-29,-151,58,182,3,'#a7664d');
    this.rounded(ctx,-34,-155,68,10,1,'#c59369');
    for(const x of [-30,-15,0,15,30]) this.rounded(ctx,x-4,-170,8,20,1,'#be8a61');
    this.rounded(ctx,-18,-141,36,35,1,'#e2caa0');
    ctx.strokeStyle='#3d4c40';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-123);ctx.lineTo(0,-136);ctx.moveTo(0,-123);ctx.lineTo(11,-116);ctx.stroke();
    ctx.fillStyle='#3d4c40';ctx.beginPath();ctx.arc(0,-123,2,0,Math.PI*2);ctx.fill();
    for(const x of [-88,-61,60,87]) {
      ctx.fillStyle='#edd3a0';ctx.beginPath();ctx.roundRect(x-7,-55,14,29,[7,7,0,0]);ctx.fill();
    }
    this.rounded(ctx,-88,-3,176,29,3,'#364d42');
    this.label(ctx,'SSC MASTER · UI / UX',0,15,11,GOLD);
    this.label(ctx,'TORUŃ',0,51,10,'#f3dfb0');
  }
  /** A stepped city tower and glass office identify Warsaw without implying a street address.
   * @param {CanvasRenderingContext2D} ctx
   */
  warsawLandmark(ctx) {
    this.rounded(ctx,-114,-54,82,89,2,'#a8afa0');
    this.rounded(ctx,-98,-99,50,134,1,'#c0beaa');
    this.rounded(ctx,-91,-131,36,37,1,'#c9c4ad');
    this.rounded(ctx,-84,-148,22,22,1,'#d5cdb5');
    ctx.strokeStyle='#e4d7b8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-73,-148);ctx.lineTo(-73,-184);ctx.stroke();
    this.rounded(ctx,-78,-115,10,10,1,'#4e6564');
    for(const y of [-83,-62,-41,-20]) for(const x of [-89,-73,-57]) this.rounded(ctx,x-3,y,6,12,1,'#6c817b');
    this.rounded(ctx,-18,-119,122,154,4,'#577c86');
    this.polygon(ctx,[{x:-18,y:-119},{x:4,y:-137},{x:124,y:-137},{x:104,y:-119}],'#a1b5b3');
    this.polygon(ctx,[{x:104,y:-119},{x:124,y:-137},{x:124,y:18},{x:104,y:35}],'#3b616d');
    for(const y of [-103,-79,-55,-31,-7]) for(const x of [-1,24,49,74]) {
      this.rounded(ctx,x,y,15,15,1,'#a2c2bd');
    }
    this.rounded(ctx,-10,-111,106,24,3,'#183c49');
    this.label(ctx,'NETWISE',43,-94,13,GOLD);
    this.rounded(ctx,-10,10,106,21,3,'#254855');
    this.label(ctx,'.NET · D365 CRM',43,24,9,'#d9e1ca');
  }
  /** Stylized two-wing city landmark on a circular plaza.
   * @param {CanvasRenderingContext2D} ctx
   */
  monument(ctx) {
    ctx.fillStyle = "#596859";
    ctx.beginPath();
    ctx.ellipse(0, 14, 101, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d0c49b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 14, 88, 38, 0, 0, Math.PI * 2);
    ctx.stroke();
    this.rounded(ctx, -54, 2, 108, 19, 4, "#b9bca4");
    const concrete = ctx.createLinearGradient(-65, 0, 60, -150);
    concrete.addColorStop(0, "#b4b9a1");
    concrete.addColorStop(0.5, "#e1dbc0");
    concrete.addColorStop(1, "#a5af9a");
    ctx.fillStyle = concrete;
    ctx.beginPath();
    ctx.moveTo(-30, 9);
    ctx.bezierCurveTo(-49, -38, -72, -116, -48, -174);
    ctx.bezierCurveTo(-20, -143, -10, -91, -8, -49);
    ctx.lineTo(-4, -7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(30, 9);
    ctx.bezierCurveTo(49, -38, 72, -116, 48, -174);
    ctx.bezierCurveTo(20, -143, 10, -91, 8, -49);
    ctx.lineTo(4, -7);
    ctx.closePath();
    ctx.fill();
    this.polygon(
      ctx,
      [
        { x: -15, y: -58 },
        { x: -26, y: -79 },
        { x: -15, y: -114 },
        { x: 2, y: -119 },
        { x: 19, y: -101 },
        { x: 23, y: -75 },
        { x: 8, y: -54 },
      ],
      "#87634a",
    );
    ctx.strokeStyle = "#d9c79c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, -115);
    ctx.lineTo(-3, -75);
    ctx.moveTo(-12, -99);
    ctx.lineTo(10, -99);
    ctx.stroke();
  }
  /** @param {CanvasRenderingContext2D} ctx @param {string} text @param {number} x @param {number} y @param {number} size @param {string} color */
  label(ctx, text, x, y, size, color) {
    ctx.font = `700 ${size}px Inter,system-ui,sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintStationSigns(ctx) {
    for (const [index, station] of STATIONS.entries()) {
      if (!this.visible(station.distance)) continue;
      const point = this.screen(station.x + this.signOffsetFor(station.distance), station.distance, 20);
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.scale(this.scale, this.scale);
      ctx.fillStyle = "#8d967c";
      ctx.fillRect(-2, 11, 4, 35);
      this.rounded(
        ctx,
        -42,
        -35,
        84,
        52,
        6,
        this.visited.has(index) ? "#e4c27c" : "#20372b",
      );
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-42, -35, 84, 52, 6);
      ctx.stroke();
      this.label(
        ctx,
        station.year,
        0,
        -9,
        station.year.length > 5 ? 12 : 18,
        this.visited.has(index) ? "#20372b" : "#f0dbab",
      );
      this.label(
        ctx,
        this.visited.has(index) ? "✓" : String(index + 1).padStart(2, "0"),
        0,
        8,
        9,
        this.visited.has(index) ? "#20372b" : "#b5bb9b",
      );
      ctx.restore();
      const label = this.screen(station.x - this.landmarkOffsetFor(station.distance), station.distance - 107);
      ctx.save();
      ctx.translate(label.x, label.y);
      ctx.font = `600 ${Math.max(8, 10 * this.scale)}px Inter,system-ui,sans-serif`;
      const width = ctx.measureText(station.place).width + 22;
      this.rounded(ctx, -width / 2, -12, width, 25, 4, "#13251ee8");
      ctx.fillStyle = "#eddfb9";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(station.place, 0, 0.5);
      ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintSideStories(ctx) {
    const time=this.reducedMotion||!this.animationsEnabled?0:this.animationTime;
    for(const spot of this.sideStories) {
      if(!this.visible(spot.distance)) continue;
      const position=this.sideStoryPosition(spot);
      const point=this.screen(position.x,position.distance);
      const nearby=this.getNearbySideStory()===spot.id;
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
      if(spot.kind==='festival') {
        paintLifeScene(ctx,'festival',time,this.language);
        this.rounded(ctx,-109,112,218,26,5,'#163027ed');
        this.label(ctx,spot.label[this.language],0,129,10,'#f0d59b');
        this.rounded(ctx,58,78,51,18,4,nearby?'#e9c77d':'#20382f');
        this.label(ctx,'E / ENTER',83,91,8,nearby?'#163027':'#e9c77d');
        ctx.restore();
        continue;
      }
      this.rounded(ctx,-78,-54,156,121,11,'#b1a486');this.rounded(ctx,-73,-49,146,111,8,'#5d7161');
      ctx.strokeStyle=nearby?'#f0cf84':'#c5bc9377';ctx.lineWidth=nearby?3:1.5;
      ctx.setLineDash([7,5]);ctx.strokeRect(-68,-44,136,101);ctx.setLineDash([]);
      this.rounded(ctx,-14,-45,54,46,5,'#1c3731');
      ctx.strokeStyle='#e9ca87';ctx.fillStyle='#e9ca87';ctx.lineWidth=2;
      if(spot.kind==='games') {
        this.rounded(ctx,-3,-34,33,22,7,'#ddc484');
        ctx.fillStyle='#28443b';ctx.fillRect(2,-28,3,11);ctx.fillRect(-2,-24,11,3);ctx.beginPath();ctx.arc(23,-26,2,0,Math.PI*2);ctx.arc(18,-19,2,0,Math.PI*2);ctx.fill();
      } else if(spot.kind==='scholarship') {
        this.rounded(ctx,0,-38,28,31,2,'#e5d8b2');this.label(ctx,'250',14,-18,10,'#3a4c3b');
      } else if(spot.kind==='music') {
        this.rounded(ctx,-5,-30,40,21,2,'#172820');
        for(const key of [0,1,2,3,4,5,6]) {ctx.fillStyle='#e5dfc7';ctx.fillRect(-2+key*5,-27,4,15);}
        for(const key of [0,1,3,4,5]) {ctx.fillStyle='#273a30';ctx.fillRect(1+key*5,-27,3,8);}
        ctx.beginPath();ctx.moveTo(27,-35);ctx.lineTo(27,-45);ctx.lineTo(35,-47);ctx.stroke();
      } else if(spot.kind==='robot') {
        this.rounded(ctx,0,-38,30,22,5,'#b8c4b8');ctx.fillStyle='#284c44';ctx.fillRect(6,-30,5,4);ctx.fillRect(20,-30,5,4);
        ctx.beginPath();ctx.moveTo(15,-38);ctx.lineTo(15,-45);ctx.stroke();ctx.fillStyle='#e5c16f';ctx.beginPath();ctx.arc(15,-46,3,0,Math.PI*2);ctx.fill();
        this.rounded(ctx,7,-14,16,8,2,'#b8c4b8');
      } else {
        ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-7,-24);ctx.lineTo(35,-24);ctx.stroke();
        for(const x of [-3,4,23,30]) this.rounded(ctx,x,-35,5,22,2,'#e9ca87');
      }
      const wave=Math.sin(time*2.2)*5;
      ctx.strokeStyle='#263d32';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-32,30);ctx.lineTo(-36,48);ctx.moveTo(-24,30);ctx.lineTo(-21,48);ctx.stroke();
      this.rounded(ctx,-38,8,21,25,6,spot.kind==='scholarship'?'#c4ac70':'#7d9fa0');
      ctx.strokeStyle=spot.kind==='scholarship'?'#c4ac70':'#7d9fa0';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-35,14);ctx.lineTo(-46,26);ctx.moveTo(-20,14);ctx.lineTo(-7,-1+wave);ctx.stroke();
      ctx.fillStyle='#dcb389';ctx.beginPath();ctx.arc(-27,0,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#625036';ctx.beginPath();ctx.ellipse(-28,-6,8,4,0,Math.PI,Math.PI*2);ctx.fill();
      ctx.font='600 10px Inter,system-ui,sans-serif';const text=spot.label[this.language];const labelWidth=ctx.measureText(text).width+18;
      this.rounded(ctx,-labelWidth/2,70,labelWidth,25,4,'#163027ed');this.label(ctx,text,0,87,10,'#f0d59b');
      this.label(ctx,'E / ENTER',37,48,8,nearby?'#f9dfa2':'#c7d2b7');ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintRegionSigns(ctx) {
    const entrances=[{distance:70,name:'STASZÓW'},{distance:2400,name:'RZESZÓW'},{distance:7600,name:'TORUŃ'},{distance:8950,name:'POZNAŃ'},{distance:10150,name:'WARSZAWA'}];
    for(const entrance of entrances) {
      if(!this.visible(entrance.distance)) continue;
      const road=sampleRoad(entrance.distance),point=this.screen(road.x-133,entrance.distance,20);
      ctx.save();ctx.translate(point.x,point.y);ctx.scale(this.scale,this.scale);
      this.rounded(ctx,-59,-28,118,36,4,'#e5dfbd');
      ctx.strokeStyle='#314d3d';ctx.lineWidth=2;ctx.strokeRect(-54,-23,108,26);
      this.label(ctx,entrance.name,0,-5,12,'#2d4539');
      ctx.fillStyle='#a5ad93';ctx.fillRect(-41,8,4,28);ctx.fillRect(37,8,4,28);
      ctx.restore();
    }
  }
  /** @param {CanvasRenderingContext2D} ctx */
  paintCar(ctx) {
    const point=this.screen(this.car.x,this.car.distance);
    const motion=this.reducedMotion||!this.animationsEnabled?0:this.driveTime;
    const suspension=Math.sin(motion*23)*Math.min(0.55,Math.abs(this.car.speed)/500);
    ctx.save();ctx.translate(point.x,point.y+suspension);ctx.scale(this.scale,this.scale);
    if(roadProfile(this.car.distance).lanes===1) ctx.scale(.9,.9);
    ctx.rotate(this.car.angle);
    paintVehicle(ctx,this.vehicle,{
      time:motion,lights:this.lights,brake:this.input.backward&&this.car.speed>0,
      speed:Math.abs(this.car.speed)*.32,steering:this.steering,
      exhaust:motion&&this.exhaustTime>0?this.exhaustTime:0,horn:this.hornTime,
    });
    ctx.restore();
  }
}
