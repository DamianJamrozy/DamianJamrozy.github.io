// @ts-check

export const ROAD_VERTICAL_SCALE = .72;

/** The same centerline drives road painting, map geometry and garage access.
 * @param {number} distance
 */
export function sampleRoad(distance) {
  const x=Math.sin(distance/1250)*178+Math.sin(distance/480)*70;
  const derivative=Math.cos(distance/1250)*178/1250+Math.cos(distance/480)*70/480;
  return {x,y:-distance,angle:Math.atan2(derivative,ROAD_VERTICAL_SCALE)};
}

/** @typedef {{width:number,lanes:1|2|4,surface:'gravel'|'asphalt',shoulder:number,median:number}} RoadProfile */

/** Road engineering follows the era while preserving the same chronological centerline.
 * @param {number} distance @returns {RoadProfile}
 */
export function roadProfile(distance) {
  if (!Number.isFinite(distance)) distance=0;
  if (distance < 1200) return {width:96,lanes:1,surface:'gravel',shoulder:13,median:0};
  if (distance < 2350) return {width:142,lanes:2,surface:'asphalt',shoulder:15,median:0};
  if (distance < 10150) return {width:196,lanes:2,surface:'asphalt',shoulder:20,median:0};
  return {width:292,lanes:4,surface:'asphalt',shoulder:23,median:12};
}

/** @param {number} distance */
export function roadLaneCenter(distance) {
  const profile=roadProfile(distance);
  return profile.lanes===1 ? 14 : profile.width/(profile.lanes===4?8:4)+profile.median/2;
}

