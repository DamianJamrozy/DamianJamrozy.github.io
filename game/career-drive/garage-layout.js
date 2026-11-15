// @ts-check
import { sampleRoad, roadLaneCenter, ROAD_VERTICAL_SCALE } from './road-layout.js';

/** @typedef {{id:'cmax'|'focus',distance:number,side:-1|1,offset:number}} Garage */
/** @typedef {{x:number,distance:number}} GaragePoint */
/** @typedef {{points:readonly GaragePoint[],width:number,entrance:GaragePoint,lot:GaragePoint,apron:readonly GaragePoint[]}} GarageAccess */
/** @type {WeakMap<Garage,GarageAccess>} */
const layouts=new WeakMap();

/** @param {GaragePoint} start @param {GaragePoint} first @param {GaragePoint} second @param {GaragePoint} end */
function curve(start,first,second,end) {
  return Array.from({length:21},(_,index)=>{
    const t=index/20,inverse=1-t;
    return {
      x:inverse**3*start.x+3*inverse**2*t*first.x+3*inverse*t*t*second.x+t**3*end.x,
      distance:inverse**3*start.distance+3*inverse**2*t*first.distance+3*inverse*t*t*second.distance+t**3*end.distance
    };
  });
}

/** Access turns off before the university facade, then runs beside it to the parking apron.
 * @param {Garage} garage @returns {GarageAccess}
 */
export function garageAccess(garage) {
  const existing=layouts.get(garage);
  if(existing) return existing;
  const entranceDistance=garage.distance-400,turnDistance=garage.distance-300;
  const lot={x:sampleRoad(garage.distance).x+garage.side*garage.offset,distance:garage.distance};
  const entrance={x:sampleRoad(entranceDistance).x+roadLaneCenter(entranceDistance),distance:entranceDistance};
  const turn={x:lot.x-garage.side*90,distance:turnDistance};
  const apron={x:lot.x,distance:garage.distance-150};
  const points=[
    ...curve(entrance,{x:entrance.x,distance:turnDistance},{x:turn.x-garage.side*65,distance:turnDistance},turn),
    ...curve(turn,{x:lot.x,distance:turnDistance},{x:lot.x,distance:garage.distance-240},apron).slice(1)
  ].map(point=>Object.freeze(point));
  const apronPoints=[
    {x:lot.x-51,distance:garage.distance-175},{x:lot.x+51,distance:garage.distance-175},
    {x:lot.x+101,distance:garage.distance-95},{x:lot.x-101,distance:garage.distance-95}
  ].map(point=>Object.freeze(point));
  const layout=Object.freeze({points:Object.freeze(points),width:92,entrance:Object.freeze(entrance),lot:Object.freeze(lot),apron:Object.freeze(apronPoints)});
  layouts.set(garage,layout);
  return layout;
}

/** The final aisle reaches the empty bay from below both parked-car footprints.
 * @param {Garage} garage @param {GaragePoint} dock @returns {readonly GaragePoint[]}
 */
export function garageDockRoute(garage,dock) {
  const access=garageAccess(garage);
  return [...access.points,{x:dock.x,distance:garage.distance-150},{x:dock.x,distance:dock.distance}];
}

/** @param {GaragePoint} point @param {Garage} garage */
export function nearestGarageAccess(point,garage) {
  const points=garageAccess(garage).points;
  let nearest={distance:Infinity,index:0,point:points[0]};
  if(!Number.isFinite(point.x)||!Number.isFinite(point.distance)) return nearest;
  for(const [index,start] of points.entries()) {
    const end=points[index+1];
    if(!end) continue;
    const dx=end.x-start.x,dy=(end.distance-start.distance)*ROAD_VERTICAL_SCALE;
    const px=point.x-start.x,py=(point.distance-start.distance)*ROAD_VERTICAL_SCALE;
    const ratio=Math.max(0,Math.min(1,(px*dx+py*dy)/(dx*dx+dy*dy||1)));
    const distance=Math.hypot(px-dx*ratio,py-dy*ratio);
    if(distance<nearest.distance) nearest={distance,index,point:{x:start.x+dx*ratio,distance:start.distance+(end.distance-start.distance)*ratio}};
  }
  return nearest;
}

/** @param {GaragePoint} point @param {Garage} garage */
export function distanceToGarageAccess(point,garage) { return nearestGarageAccess(point,garage).distance; }

/** The empty bay leaves via the wide apron, then follows the same access back to its real road join.
 * @param {Garage} garage @param {GaragePoint} current @param {GaragePoint} dock @param {GaragePoint} occupied
 * @returns {readonly GaragePoint[]}
 */
export function garageExitRoute(garage,current,dock,occupied) {
  const access=garageAccess(garage);
  const inLot=Math.abs(current.x-access.lot.x)<=101 && current.distance>=garage.distance-114 && current.distance<=garage.distance+123;
  if(inLot) {
    const clearAbove=current.distance>occupied.distance;
    const aisleX=clearAbove?dock.x:current.x;
    return [current,
      ...(clearAbove?[{x:aisleX,distance:current.distance}]:[]),
      {x:aisleX,distance:garage.distance-110},
      {x:dock.x,distance:garage.distance-110},
      {x:dock.x,distance:garage.distance-150},
      ...[...access.points].reverse()];
  }
  const nearest=nearestGarageAccess(current,garage);
  return [current,nearest.point,...access.points.slice(0,nearest.index+1).reverse()];
}

/** @param {GaragePoint} point @param {Garage} garage */
export function isGaragePaved(point,garage) {
  const access=garageAccess(garage);
  const apronStart=access.apron[0].distance,apronEnd=access.apron[2].distance;
  const apronProgress=(point.distance-apronStart)/(apronEnd-apronStart);
  const apronHalfWidth=51+apronProgress*50;
  const onApron=apronProgress>=0 && apronProgress<=1 && Math.abs(point.x-access.lot.x)<=apronHalfWidth;
  const onLot=Math.abs(point.x-access.lot.x)<=101 && point.distance>=garage.distance-82/ROAD_VERTICAL_SCALE && point.distance<=garage.distance+88/ROAD_VERTICAL_SCALE;
  return onApron || onLot || distanceToGarageAccess(point,garage)<=access.width/2+4;
}
