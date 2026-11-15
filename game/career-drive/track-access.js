// @ts-check
import { sampleRoad, roadProfile, roadLaneCenter, ROAD_VERTICAL_SCALE } from './road-layout.js';

/** @typedef {{x:number,distance:number}} AccessPoint */
/** @typedef {{left:number,right:number,minDistance:number,maxDistance:number}} AccessBounds */

const entryDistance=11420;
const road=sampleRoad(entryDistance);
const approach=Object.freeze({x:road.x+roadLaneCenter(entryDistance),distance:entryDistance});
const entry=Object.freeze({x:road.x+roadProfile(entryDistance).width/2-20,distance:entryDistance});
const gate=Object.freeze({x:road.x+520,distance:11700});
const first={x:road.x+255,distance:entryDistance};
const second={x:road.x+350,distance:11670};
const points=Object.freeze(Array.from({length:41},(_,index)=>{
  const t=index/40,inverse=1-t;
  return Object.freeze({
    x:inverse**3*entry.x+3*inverse**2*t*first.x+3*inverse*t*t*second.x+t**3*gate.x,
    distance:inverse**3*entry.distance+3*inverse**2*t*first.distance+3*inverse*t*t*second.distance+t**3*gate.distance
  });
}));

/** One smooth right-hand junction shared by the world, grip, entry zone and map. */
export const TRACK_ACCESS=Object.freeze({approach,entry,gate,points,width:90,shoulder:10,gateRadius:57});

/** @param {AccessPoint} point */
export function distanceToTrackAccess(point) {
  let nearest=Infinity;
  for(const [index,start] of points.entries()) {
    const end=points[index+1];
    if(!end) continue;
    const dx=end.x-start.x,dy=(end.distance-start.distance)*ROAD_VERTICAL_SCALE;
    const px=point.x-start.x,py=(point.distance-start.distance)*ROAD_VERTICAL_SCALE;
    const fraction=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy)));
    nearest=Math.min(nearest,Math.hypot(px-fraction*dx,py-fraction*dy));
  }
  return nearest;
}

/** @param {AccessPoint} point */
export function isTrackAccessPaved(point) {
  return distanceToTrackAccess(point)<=TRACK_ACCESS.width/2+4;
}

/** The circuit can only be opened after driving beyond the main-road junction. @param {AccessPoint} point */
export function isAtTrackGate(point) {
  return Math.hypot(point.x-gate.x,(point.distance-gate.distance)*ROAD_VERTICAL_SCALE)<=TRACK_ACCESS.gateRadius;
}

/** Conservative projected bounds keep tall facades, tree canopies and signs clear of the full paved width.
 * @param {AccessBounds} bounds @param {number} [padding]
 */
export function trackAccessIntersectsBounds(bounds,padding=0) {
  const radius=TRACK_ACCESS.width/2+TRACK_ACCESS.shoulder+padding;
  const left=bounds.left-radius,right=bounds.right+radius;
  const lower=bounds.minDistance-radius/ROAD_VERTICAL_SCALE,upper=bounds.maxDistance+radius/ROAD_VERTICAL_SCALE;
  for(const [index,start] of points.entries()) {
    const end=points[index+1];
    if(!end) continue;
    let minimum=0,maximum=1;
    const dx=end.x-start.x,dy=end.distance-start.distance;
    for(const [direction,offset] of [[-dx,start.x-left],[dx,right-start.x],[-dy,start.distance-lower],[dy,upper-start.distance]]) {
      if(direction===0) { if(offset<0) {maximum=-1;break;} continue; }
      const crossing=offset/direction;
      if(direction<0) minimum=Math.max(minimum,crossing);
      else maximum=Math.min(maximum,crossing);
      if(minimum>maximum) break;
    }
    if(minimum<=maximum) return true;
  }
  return false;
}
