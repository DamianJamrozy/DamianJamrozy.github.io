// @ts-check
import { roadProfile } from './road-layout.js';

export const FESTIVAL = Object.freeze({
  distance:4750,
  offset:roadProfile(4750).width/2+120,
  label:{pl:'KultURalia · koncerty',en:'KultURalia · live concerts'}
});

/** The concert fades with physical distance from its grounds, including lateral driving.
 * @param {number} distance @param {number} lane
 */
export function festivalPresence(distance,lane) {
  if (!Number.isFinite(distance) || !Number.isFinite(lane)) return 0;
  const separation=Math.hypot((distance-FESTIVAL.distance)*.72,lane-FESTIVAL.offset);
  const proximity=Math.max(0,Math.min(1,(520-separation)/430));
  return proximity*proximity*(3-2*proximity);
}
