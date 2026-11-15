// @ts-check

/** @typedef {'taxi'|'cmax'|'focus'} VehicleId */
/** @typedef {{parkedVehicle:VehicleId,exchanged:boolean}} GarageState */
/** @typedef {{cmax:GarageState,focus:GarageState}} GarageSnapshot */
/** @typedef {{vehicle:VehicleId,speed:number,throttle:boolean,braking:boolean,steering:number,drifting:boolean,paused:boolean}} DrivingTelemetry */
/** @typedef {{time?:number,lights?:boolean,brake?:boolean,speed?:number,steering?:number,exhaust?:number|boolean,horn?:number|boolean}} VehiclePaintOptions */

export const VEHICLES = Object.freeze({
  taxi: {label:{pl:'Taxi - pierwszy kurs',en:'Taxi - the first ride'},detail:{pl:'Początek podróży',en:'The journey begins'},body:'#e8bf68',highlight:'#f5d38a',accent:'#a67a34',width:34,length:78,maxSpeed:255,acceleration:210},
  cmax: {label:{pl:'Ford C-Max - 2009 - diesel',en:'Ford C-Max - 2009 - diesel'},detail:{pl:'Czarny - 115 KM - prawie 200 000 km',en:'Black - 115 hp - nearly 200,000 km'},body:'#242b30',highlight:'#485157',accent:'#11191d',width:38,length:84,maxSpeed:285,acceleration:195},
  focus: {label:{pl:'Ford Focus ST - 2018 - USA',en:'Ford Focus ST - 2018 - USA'},detail:{pl:'Perłowo-szary - benzyna - 250 KM seryjnie / ponad 300 KM po tuningu',en:'Pearl-grey - petrol - 250 hp stock / over 300 hp tuned'},body:'#b8bdbc',highlight:'#e2e5de',accent:'#727e82',width:38,length:82,maxSpeed:550,acceleration:390},
});


/** @type {readonly {id:'cmax'|'focus',distance:number,side:-1|1,offset:number}[]} */
export const GARAGES = Object.freeze([
  {id:'cmax',distance:5650,side:-1,offset:478},
  {id:'focus',distance:10880,side:1,offset:291},
]);

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} width @param {number} height @param {number} radius @param {string|CanvasGradient} fill */
function panel(ctx,x,y,width,height,radius,fill) {
  ctx.fillStyle=fill;
  ctx.beginPath();ctx.roundRect(x,y,width,height,radius);ctx.fill();
}

/** @param {CanvasRenderingContext2D} ctx @param {number[][]} points @param {string|CanvasGradient} fill */
function polygon(ctx,points,fill) {
  ctx.fillStyle=fill;ctx.beginPath();
  for(const [index,point] of points.entries()) {
    if(index) ctx.lineTo(point[0],point[1]); else ctx.moveTo(point[0],point[1]);
  }
  ctx.closePath();ctx.fill();
}

/** Draws a car facing -Y; the caller owns position, scale and heading.
 * @param {CanvasRenderingContext2D} ctx @param {VehicleId} id @param {VehiclePaintOptions} [options]
 */
export function paintVehicle(ctx,id,options={}) {
  const car=VEHICLES[id], half=car.width/2, front=-car.length/2, rear=car.length/2;
  const {time=0,lights=false,brake=false,speed=0,steering=0,exhaust=0,horn=0}=options;
  ctx.save();
  ctx.fillStyle='#07110e80';ctx.beginPath();ctx.ellipse(6,10,half+8,rear+3,0,0,Math.PI*2);ctx.fill();
  if(lights) {
    const beam=ctx.createLinearGradient(0,front,0,front-175);
    beam.addColorStop(0,'#fff1bd77');beam.addColorStop(1,'#fff1bd00');
    polygon(ctx,[[-half+3,front],[half-3,front],[73,front-175],[-73,front-175]],beam);
  }
  if(id==='focus'&&exhaust) {
    const reach=18+Math.sin(time*85)*7;
    const flame=ctx.createLinearGradient(0,rear,0,rear+reach);
    flame.addColorStop(0,'#8cc9ff');flame.addColorStop(.25,'#fff1aa');flame.addColorStop(.55,'#ffb33b');flame.addColorStop(1,'#ef5b1500');
    polygon(ctx,[[-6,rear-2],[6,rear-2],[9,rear+reach*.55],[0,rear+reach],[-8,rear+reach*.4]],flame);
  }
  for(const side of [-1,1]) {
    ctx.save();ctx.translate(side*(half-1),-24);ctx.rotate(steering*.18);
    panel(ctx,-4,-9,8,18,2,'#111a1b');ctx.restore();
    panel(ctx,side*(half-1)-4,16,8,18,2,'#111a1b');
  }
  const paint=ctx.createLinearGradient(-half,0,half,0);
  paint.addColorStop(0,car.accent);paint.addColorStop(.25,car.highlight);paint.addColorStop(.7,car.body);paint.addColorStop(1,car.accent);
  panel(ctx,-half,front+3,car.width,car.length,10,'#091414');
  panel(ctx,-half,front,car.width,car.length-3,10,paint);
  panel(ctx,-half+3,front+5,car.width-6,car.length-14,8,car.body);
  // The MPV has a taller, longer glasshouse; the ST has a shorter hatch and rear spoiler.
  const windshield=id==='cmax'?-23:-19, roofEnd=id==='cmax'?20:15;
  polygon(ctx,[[-half+4,windshield],[half-4,windshield],[half-7,windshield+13],[-half+7,windshield+13]],'#819b9d');
  polygon(ctx,[[-half+5,windshield+1],[0,windshield+1],[-7,windshield+11],[-half+7,windshield+11]],'#abc4bd88');
  panel(ctx,-half+6,windshield+14,car.width-12,roofEnd-windshield-14,3,car.highlight);
  for(const side of [-1,1]) {
    polygon(ctx,[[side*(half-3),windshield+4],[side*(half-3),roofEnd],[side*(half-6),roofEnd-3],[side*(half-6),windshield+13]],'#253b40');
    panel(ctx,side*(half+1)-3,windshield+8,6,6,2,car.body);
    ctx.strokeStyle=car.accent;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(side*(half-2),0);ctx.lineTo(side*(half-2),rear-10);ctx.stroke();
  }
  polygon(ctx,[[-half+6,roofEnd+2],[half-6,roofEnd+2],[half-4,rear-10],[-half+4,rear-10]],'#3e575c');
  panel(ctx,-half+5,front+3,car.width-10,4,2,lights?'#fff4cf':'#d3d6be');
  panel(ctx,-half+4,rear-7,8,4,1,brake?'#ff493b':'#a94f40');
  panel(ctx,half-12,rear-7,8,4,1,brake?'#ff493b':'#a94f40');
  if(brake) {
    ctx.shadowColor='#ff493b';ctx.shadowBlur=9;panel(ctx,-5,rear-10,10,2,1,'#ff5a41');ctx.shadowBlur=0;
  }
  panel(ctx,-6,rear-3,12,2,1,'#eee5c7');
  if(id==='taxi') {
    panel(ctx,-10,-1,20,9,2,'#f3d888');
    ctx.fillStyle='#24302a';ctx.font='700 5px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('TAXI',0,5.5);
    for(const side of [-1,1]) for(const row of [0,1,2]) panel(ctx,side*(half-2)-1,8+row*4,2,2,0,'#303628');
  } else {
    panel(ctx,-8,front+10,16,6,2,'#17262d');
    ctx.fillStyle='#87a0a9';ctx.beginPath();ctx.ellipse(0,front+12,3,1.5,0,0,Math.PI*2);ctx.fill();
    if(id==='cmax') {
      ctx.strokeStyle='#647278';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-half+4,-15);ctx.lineTo(-half+4,21);ctx.moveTo(half-4,-15);ctx.lineTo(half-4,21);ctx.stroke();
      panel(ctx,-half+2,rear-15,4,10,1,brake?'#ff5a41':'#ad4d42');panel(ctx,half-6,rear-15,4,10,1,brake?'#ff5a41':'#ad4d42');
    } else {
      polygon(ctx,[[-12,front+16],[12,front+16],[8,front+23],[-8,front+23]],'#172326');
      panel(ctx,-half+1,rear-15,car.width-2,5,1,'#5f6a6d');
      panel(ctx,-half+3,rear-16,car.width-6,2,1,'#d7ded7');
      polygon(ctx,[[-7,rear],[0,rear-3],[7,rear],[0,rear+5]],'#a9b3b4');
      polygon(ctx,[[-4,rear],[0,rear-1],[4,rear],[0,rear+2]],'#142026');
      ctx.fillStyle='#ba4239';ctx.font='italic 700 6px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('ST',5,rear-17);
    }
  }
  if(horn) {
    ctx.strokeStyle='#f6d88a';ctx.lineWidth=2;
    for(const side of [-1,1]) {
      ctx.beginPath();ctx.arc(side*28,-27,8+Number(horn)*7,side>0?-.9:Math.PI-.9,side>0?.9:Math.PI+.9);ctx.stroke();
    }
  }
  if(speed>0) {
    ctx.strokeStyle='#f4f4e91a';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-half+5,front+9);ctx.lineTo(-half+5,front+18);ctx.stroke();
  }
  ctx.restore();
}
