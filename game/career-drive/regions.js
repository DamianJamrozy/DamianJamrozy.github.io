// @ts-check

/** @typedef {'village'|'town'|'rzeszow'|'campus'|'technology'|'awards'|'torun'|'community'|'warsaw'|'future'} RegionId */
/** @typedef {{id:RegionId,start:number,end:number,city:{pl:string,en:string},ground:string,shade:string,paving:string}} WorldRegion */

/** @type {readonly WorldRegion[]} */
export const WORLD_REGIONS = Object.freeze([
  {id:'village',start:0,end:1100,city:{pl:'Staszów',en:'Staszów'},ground:'#537044',shade:'#324b32',paving:'#b5a27d'},
  {id:'town',start:1100,end:2300,city:{pl:'Pierwsza praktyka',en:'First internship'},ground:'#6c7059',shade:'#444e40',paving:'#b9ab91'},
  {id:'rzeszow',start:2300,end:3550,city:{pl:'Rzeszów',en:'Rzeszów'},ground:'#527360',shade:'#354d43',paving:'#a3aa96'},
  {id:'campus',start:3550,end:4900,city:{pl:'Rzeszów · Uniwersytet',en:'Rzeszów · University'},ground:'#4c7560',shade:'#304c42',paving:'#d0c4a4'},
  {id:'technology',start:4900,end:6200,city:{pl:'Rzeszów · UCI',en:'Rzeszów · IT Center'},ground:'#344e53',shade:'#243b43',paving:'#98b1ae'},
  {id:'awards',start:6200,end:7500,city:{pl:'Rzeszów · rozwój i nagrody',en:'Rzeszów · learning and awards'},ground:'#66684c',shade:'#454a3c',paving:'#d2bf8e'},
  {id:'torun',start:7500,end:8800,city:{pl:'Toruń',en:'Toruń'},ground:'#805e49',shade:'#503e36',paving:'#c09e77'},
  {id:'community',start:8800,end:10050,city:{pl:'Poznań · ASBiR',en:'Poznań · ASBiR'},ground:'#4f6b58',shade:'#304c40',paving:'#b7b58f'},
  {id:'warsaw',start:10050,end:11550,city:{pl:'Warszawa',en:'Warsaw'},ground:'#536875',shade:'#30424f',paving:'#b0bcc0'},
  {id:'future',start:11550,end:12301,city:{pl:'Dalej w drogę',en:'The road ahead'},ground:'#3c6558',shade:'#25463d',paving:'#d1ba7e'},
]);

/** @param {number} distance @returns {WorldRegion} */
export function getWorldRegion(distance) {
  return WORLD_REGIONS.find(region => distance < region.end) ?? WORLD_REGIONS[WORLD_REGIONS.length-1];
}
