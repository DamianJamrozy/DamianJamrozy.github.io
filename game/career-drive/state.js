// @ts-check
import { CHAPTERS } from './story.js';
export const SAVE_KEY = 'career-drive:v4';
export const PREVIOUS_SAVE_KEY = 'career-drive:v3';
export const V2_SAVE_KEY = 'career-drive:v2';
export const LEGACY_SAVE_KEY = 'career-drive:v1';
const LEGACY_STOPS = [[0,1,2],[3],[4],[5],[6],[7],[9]];
const MAX_DISTANCE = 12300;
const PREVIOUS_MAX_DISTANCE = 11000;
const PREVIOUS_FUTURE_DISTANCE = 10700;
const FUTURE_DISTANCE = 12000;
/** @typedef {import('./vehicles.js').VehicleId} VehicleId */
/** @typedef {{parkedVehicle:VehicleId,exchanged:boolean}} GarageParking */
/** @typedef {{cmax:GarageParking,focus:GarageParking}} GarageSave */
/** @typedef {{version:4,completed:number[],selected:number,started:boolean,distance:number,lane:number,heading:number,vehicle:VehicleId,ownedVehicles:VehicleId[],garages:GarageSave}} Save */
/** @param {unknown} input @returns {Save} */
export function validateSave(input) {
  const empty = /** @type {Save} */ ({version:4,completed:[],selected:0,started:false,distance:0,lane:0,heading:0,vehicle:'taxi',ownedVehicles:['taxi'],garages:{cmax:{parkedVehicle:'cmax',exchanged:false},focus:{parkedVehicle:'focus',exchanged:false}}});
  if (!input || typeof input !== 'object') return empty;
  const value = /** @type {{version?:unknown,completed?:unknown,selected?:unknown,started?:unknown,distance?:unknown,lane?:unknown,heading?:unknown,vehicle?:unknown,ownedVehicles?:unknown,garages?:unknown}} */ (input);
  if (value.version === 1) {
    const legacy = (/** @type {unknown[]} */(Array.isArray(value.completed) ? value.completed : []))
      .filter(index => typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < LEGACY_STOPS.length);
    const selected = typeof value.selected === 'number' && Number.isInteger(value.selected) ? LEGACY_STOPS[value.selected]?.[0] ?? 0 : 0;
    return {...empty,completed:[...new Set(legacy.flatMap(index => LEGACY_STOPS[/** @type {number} */(index)]))],selected,started:value.started === true};
  }
  if (value.version === 2) {
    const completed = Array.isArray(value.completed) ? value.completed.filter(isPreviousChapterIndex) : [];
    const selected = isPreviousChapterIndex(value.selected) ? value.selected : 0;
    const previousDistance = typeof value.distance === 'number' && Number.isFinite(value.distance)
      ? Math.max(0,Math.min(PREVIOUS_MAX_DISTANCE,value.distance)) : 0;
    const distance = previousDistance >= PREVIOUS_FUTURE_DISTANCE
      ? FUTURE_DISTANCE + previousDistance - PREVIOUS_FUTURE_DISTANCE : previousDistance;
    return {...empty,completed:[...new Set(completed.map(index => index === 8 ? 9 : index))],selected:selected === 8 ? 9 : selected,started:value.started === true,distance};
  }
  if (value.version !== 3 && value.version !== 4) return empty;
  const distance = typeof value.distance === 'number' && Number.isFinite(value.distance) ? Math.max(0,Math.min(MAX_DISTANCE,value.distance)) : 0;
  const progress={...empty,completed:Array.isArray(value.completed) ? [...new Set(value.completed.filter(isChapterIndex))] : [],selected:isChapterIndex(value.selected) ? value.selected : 0,started:value.started === true,distance};
  if (value.version === 3) return progress;
  const ownedVehicles=/** @type {VehicleId[]} */(['taxi']);
  if (Array.isArray(value.ownedVehicles)) for (const vehicle of value.ownedVehicles) {
    if (isVehicleId(vehicle)&&!ownedVehicles.includes(vehicle)) ownedVehicles.push(vehicle);
  }
  const vehicle=isVehicleId(value.vehicle)&&ownedVehicles.includes(value.vehicle)?value.vehicle:'taxi';
  const lane=typeof value.lane==='number'&&Number.isFinite(value.lane)?Math.max(-700,Math.min(700,value.lane)):0;
  const heading=typeof value.heading==='number'&&Number.isFinite(value.heading)?Math.max(-Math.PI,Math.min(Math.PI,value.heading)):0;
  const fallback=empty.garages;
  if(vehicle==='cmax'||(vehicle==='focus'&&ownedVehicles.includes('cmax'))) fallback.cmax={parkedVehicle:'taxi',exchanged:true};
  if(vehicle==='focus') fallback.focus={parkedVehicle:ownedVehicles.includes('cmax')?'cmax':'taxi',exchanged:true};
  const garages=value.garages&&typeof value.garages==='object'&&!Array.isArray(value.garages)
    ? /** @type {{cmax?:unknown,focus?:unknown}} */(value.garages) : {};
  return {...progress,vehicle,ownedVehicles,lane,heading,garages:{cmax:validateGarageParking(garages.cmax,fallback.cmax),focus:validateGarageParking(garages.focus,fallback.focus)}};
}
/** @param {unknown} input @param {GarageParking} fallback @returns {GarageParking} */
function validateGarageParking(input,fallback) {
  if(!input||typeof input!=='object'||Array.isArray(input)) return {...fallback};
  const value=/** @type {{parkedVehicle?:unknown,exchanged?:unknown}} */(input);
  return {parkedVehicle:isVehicleId(value.parkedVehicle)?value.parkedVehicle:fallback.parkedVehicle,exchanged:typeof value.exchanged==='boolean'?value.exchanged:fallback.exchanged};
}
/** @param {unknown} value @returns {value is VehicleId} */
function isVehicleId(value) { return value==='taxi'||value==='cmax'||value==='focus'; }
/** @param {unknown} value @returns {value is number} */
function isPreviousChapterIndex(value) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 9; }
/** @param {unknown} value @returns {value is number} */
export function isChapterIndex(value) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < CHAPTERS.length; }
/** @param {string|null} serialized @returns {Save} */
export function parseSave(serialized) {
  if (!serialized) return validateSave(null);
  try { return validateSave(JSON.parse(serialized)); } catch { return validateSave(null); }
}
/** @param {string|null} query @param {string|null} saved @returns {'pl'|'en'} */
export function resolveLanguage(query, saved) { return query === 'pl' || query === 'en' ? query : saved === 'en' ? 'en' : 'pl'; }

/** @param {number[]} completed @param {number} current */
export function nextUndiscoveredChapter(completed,current) {
  const remaining = CHAPTERS.map((_,index) => index).filter(index => !completed.includes(index));
  return remaining.find(index => index > current) ?? remaining[0] ?? -1;
}
