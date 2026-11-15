// @ts-check
import { paintVehicle } from './vehicles.js';

/** @typedef {'school'|'office'|'internship'|'monument'|'studies'|'moving'|'university'|'systems'|'learning'|'award'|'lecture'|'design'|'community'|'asbir'|'plugins'|'festival'|'netwise'|'future'|'next'|'pedestrians'|'scholarship'|'graduation'|'ai'|'robot'|'games'|'qualifications'|'frontend'|'integration'|'uxflow'|'infrastructure'|'graphics'|'database'|'automation'|'accessibility'|'radio'|'hobbies'|'training'|'crm'|'experience'|'collaboration'|'cmax'|'focus'} SceneKind */

const GOLD = '#e4bf78';
const INK = '#14291f';
export const AWARD_PODIUM = Object.freeze([
  {x:-57,height:28,rank:2,participant:'damian',shirt:'#202e42'},
  {x:0,height:43,rank:1,participant:'winner',shirt:'#a1b7a2'},
  {x:57,height:20,rank:3,participant:'third',shirt:'#b27c69'},
]);

/** @param {number} value */
function clampUnit(value) { return Math.max(0,Math.min(1,value)); }
/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} w @param {number} h @param {string} fill @param {number} [radius] */
function panel(ctx,x,y,w,h,fill,radius=3) {
  ctx.fillStyle=fill;
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,radius);
  ctx.fill();
}
/** @param {CanvasRenderingContext2D} ctx @param {string} text @param {number} x @param {number} y @param {number} [size] @param {string} [fill] */
function label(ctx,text,x,y,size=9,fill='#f6e7bb') {
  ctx.font=`700 ${size}px Inter,system-ui,sans-serif`;
  ctx.fillStyle=fill;
  ctx.textAlign='center';
  ctx.fillText(text,x,y);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {string} shirt @param {number} phase @param {number} [scale] @param {number} [arm] @param {boolean} [damian] */
function person(ctx,x,y,shirt,phase,scale=1,arm=0,damian=false) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  ctx.fillStyle='#0b1d1545';
  ctx.beginPath();ctx.ellipse(2,2,8,3,0,0,Math.PI*2);ctx.fill();
  const step=Math.sin(phase)*3;
  ctx.strokeStyle='#26352f';ctx.lineWidth=3.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-3,-8);ctx.lineTo(-4-step,1);ctx.moveTo(3,-8);ctx.lineTo(4+step,1);ctx.stroke();
  panel(ctx,-6,-22,12,16,shirt,4);
  ctx.strokeStyle=shirt;ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-5,-20);ctx.lineTo(-10,-12-arm*10);ctx.moveTo(5,-20);ctx.lineTo(10,-12-arm*10);ctx.stroke();
  ctx.fillStyle='#e3b886';ctx.beginPath();ctx.arc(0,-29,6.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=damian?'#604126':'#574737';ctx.beginPath();ctx.ellipse(-1,-33,6,3.5,-.2,Math.PI,Math.PI*2);ctx.fill();
  if(damian) {
    ctx.fillStyle='#8d6335';ctx.beginPath();ctx.moveTo(-6,-33);ctx.lineTo(-2,-40);ctx.lineTo(4,-36);ctx.lineTo(7,-33);ctx.fill();
    ctx.strokeStyle=GOLD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6,-22);ctx.lineTo(-6,-12);ctx.stroke();
  }
  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function volleyball(ctx,time,language) {
  panel(ctx,-106,-66,212,126,'#547553',9);
  panel(ctx,-91,-54,182,100,'#b79661',3);
  ctx.strokeStyle='#f6e5ba';ctx.lineWidth=1.5;
  ctx.strokeRect(-82,-46,164,84);
  ctx.beginPath();ctx.moveTo(0,-46);ctx.lineTo(0,38);ctx.moveTo(-41,-46);ctx.lineTo(-41,38);ctx.moveTo(41,-46);ctx.lineTo(41,38);ctx.stroke();
  ctx.strokeStyle='#203b2d';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-64);ctx.lineTo(0,44);ctx.stroke();
  ctx.strokeStyle='#ecdfbb';ctx.lineWidth=1;
  for(const row of [-51,-43,-35,-27,-19,-11,-3,5,13,21,29]) {
    ctx.beginPath();ctx.moveTo(-4,row);ctx.lineTo(4,row+4);ctx.stroke();
  }
  const phase=(time%3)/3;
  const ballX=-65+130*phase;
  const ballY=-31-Math.sin(phase*Math.PI)*65;
  const teams = /** @type {[number,string][]} */([[-1,'#d6a751'],[1,'#7396b0']]);
  for(const [side,shirt] of teams) {
    for(const [index,y] of [-26,0,29].entries()) {
      const active=side<0?phase<.18:phase>.8;
      const jump=index===0&&active?Math.sin((side<0?phase:1-phase)*Math.PI/.18)*10:0;
      person(ctx,Number(side)*(index===1?65:43),y-jump,String(shirt),time*5+index,.72,active?.9:.15);
    }
  }
  ctx.fillStyle='#fff1c7';ctx.beginPath();ctx.arc(ballX,ballY,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#a67b39';ctx.lineWidth=1;ctx.beginPath();ctx.arc(ballX,ballY,3,-1,2);ctx.stroke();
  label(ctx,language==='pl'?'SIATKÓWKA':'VOLLEYBALL',0,68,8);
  person(ctx,-78+Math.sin(time*1.1)*17,98+Math.cos(time*1.1)*10,'#d6bd6f',time*7,.68);
  person(ctx,53+Math.sin(time*1.4+2)*22,100+Math.cos(time*1.4+2)*9,'#ab7b69',time*7+3,.68);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {boolean} [books] */
function pedestrians(ctx,time,books=false) {
  panel(ctx,-102,-23,204,53,'#a9ad90',8);
  ctx.strokeStyle='#c8c7a250';ctx.lineWidth=1;
  for(const offset of [-80,-40,0,40,80]) {ctx.beginPath();ctx.moveTo(offset,-23);ctx.lineTo(offset,30);ctx.stroke();}
  for(const [index,shirt] of ['#ceac68','#869caf','#b77b70','#aeb991'].entries()) {
    const phase=(time*.15+index*.24)%1;
    const direction=index%2?1:-1;
    const x=(phase*180-90)*direction;
    const y=index%2?22:-3;
    person(ctx,x,y,shirt,time*5+index,.9);
    if(books) panel(ctx,x+4,y-17,8,9,'#e5d7ac',1);
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function ceremony(ctx,time,language) {
  panel(ctx,-115,-96,230,156,'#3a5144',9);
  panel(ctx,-106,-89,212,48,'#263e36',4);
  label(ctx,language==='pl'?'KONKURS PRAC DYPLOMOWYCH':'DIPLOMA THESIS AWARDS',0,-69,8);
  label(ctx,'2024',0,-52,11,GOLD);
  panel(ctx,-102,14,204,42,'#223c31',3);
  const cycle=time%8;
  for(const podium of AWARD_PODIUM) {
    const damian=podium.participant==='damian';
    panel(ctx,podium.x-25,28-podium.height,50,podium.height,'#c8b381',3);
    panel(ctx,podium.x-25,28-podium.height,50,5,damian?'#f1d28d':'#ddcc9f',2);
    label(ctx,String(podium.rank),podium.x,21,16,INK);
    const wave=damian&&cycle>2.5?.4+Math.sin(time*5)*.25:.05;
    person(ctx,podium.x,27-podium.height,podium.shirt,0,.9,wave,damian);
    if(damian&&cycle>=2.2) {
      ctx.strokeStyle=GOLD;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(podium.x-4,-22-podium.height);ctx.lineTo(podium.x,-13-podium.height);ctx.lineTo(podium.x+4,-22-podium.height);ctx.stroke();
      ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(podium.x,-13-podium.height,3,0,Math.PI*2);ctx.fill();
    }
  }
  label(ctx,'DAMIAN',-57,43,8,GOLD);
  const approach=clampUnit(cycle/1.7);
  const retreat=clampUnit((cycle-3.8)/1.7);
  const presenterX=-116+approach*26-retreat*26;
  person(ctx,presenterX,-1,'#788ca0',cycle<1.7||cycle>3.8?time*5:0,.95,cycle>1.6&&cycle<3.9?.65:0);
  if(cycle>1&&cycle<2.2) {
    const transfer=clampUnit((cycle-1.6)/.6);
    const medalX=(presenterX+10)*(1-transfer)-57*transfer;
    const medalY=-20*(1-transfer)-41*transfer;
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(medalX,medalY,4,0,Math.PI*2);ctx.fill();
  }
  for(const [index,x] of [-86,-27,29,85].entries()) person(ctx,x,88,['#9989ad','#bb8f6c','#7ca0a0','#aaa669'][index],0,.72,cycle>2?.3+Math.sin(time*7+index)*.3:0);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function designStudio(ctx,time,language) {
  panel(ctx,-108,-86,216,144,'#583f39',8);
  panel(ctx,-94,-72,188,109,'#e0d5b6',5);
  const reveal=(time%7)/7;
  ctx.strokeStyle='#8f8977';ctx.lineWidth=2;
  const boxes=[[-79,-57,112,11],[-79,-37,46,44],[-25,-37,105,20],[-25,-9,48,16],[31,-9,49,16]];
  boxes.forEach((box,index)=>{if(reveal>(index+.4)/7)ctx.strokeRect(box[0],box[1],box[2],box[3]);});
  if(reveal>.78) {panel(ctx,34,-34,43,11,'#c5a65c',2);label(ctx,'UI / UX',0,26,12,'#4c655b');}
  const penX=-75+reveal*150;
  person(ctx,-101,53,'#26394b',0,1,.7,true);
  ctx.strokeStyle='#273c46';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-91,30);ctx.lineTo(penX,-42);ctx.stroke();
  ctx.fillStyle='#4f6456';ctx.beginPath();ctx.arc(penX,-42,3,0,Math.PI*2);ctx.fill();
  label(ctx,language==='pl'?'PROJEKTOWANIE EKRANÓW':'DESIGN IN PROGRESS',0,79,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {boolean} [crm] @param {'pl'|'en'} [language] */
function coding(ctx,time,crm=true,language='pl') {
  panel(ctx,-107,-87,214,145,'#293f4b',9);
  for(const [index,x] of [-58,29].entries()) {
    panel(ctx,x-35,-69,73,59,'#b0babb',4);
    panel(ctx,x-31,-65,65,50,'#102d35',2);
    label(ctx,crm?(index?'D365 / CRM':'.NET'):(index?'JavaScript':'HTML / CSS'),x+1,-48,crm?10:8,index?'#b8b3dc':'#8fcebd');
    const rows=Math.floor((time*2+index)%5)+1;
    for(const line of Array.from({length:rows},(_,i)=>i)) panel(ctx,x-23,-38+line*5,22+(line%3)*10,2,index?'#9f8dc7':'#69a99b',1);
    panel(ctx,x-4,-10,8,12,'#8b9999',1);
  }
  panel(ctx,-102,9,204,12,'#ae9870',3);
  person(ctx,-10,58,'#203344',0,1,.2+Math.sin(time*7)*.12,true);
  label(ctx,crm?(language==='pl'?'NETWISE · WARSZAWA':'NETWISE · WARSAW'):'ARKONSOFT · FRONTEND',0,82,8,GOLD);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function lecture(ctx,time,language) {
  panel(ctx,-115,-91,230,152,'#8f977b',8);
  panel(ctx,-103,-80,206,88,'#213f36',4);
  ctx.strokeStyle='#d8dfba';ctx.lineWidth=1.5;
  for(const [index,width] of [62,105,85,120].entries()) {
    ctx.beginPath();ctx.moveTo(-40,-60+index*14);ctx.lineTo(-40+width,-60+index*14);ctx.stroke();
  }
  label(ctx,'UR',77,-60,14,GOLD);
  person(ctx,-75,20,'#203347',0,1.05,.75,true);
  const pointerY=-43+Math.sin(time*.9)*14;
  ctx.strokeStyle='#d6bc7d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-66,-7);ctx.lineTo(-18,pointerY);ctx.stroke();
  for(const [index,x] of [-77,-25,27,79].entries()) {
    const raised=(Math.floor(time/2)+index)%4===0?.9:.1;
    person(ctx,x,92,['#7399a4','#b58d67','#9b86ad','#9cab78'][index],0,.85,raised);
    panel(ctx,x-20,77,40,8,'#beaa7b',2);
    panel(ctx,x-7,74,15,3,'#e6d7ad',1);
  }
  label(ctx,language==='pl'?'WYKŁAD · SALA UR':'TEACHING · UNIVERSITY',0,116,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function support(ctx,time,language) {
  panel(ctx,-112,-83,224,145,'#344c3d',8);
  panel(ctx,-91,-62,86,58,'#77908b',4);
  panel(ctx,-85,-56,74,46,'#163c39',2);
  ctx.strokeStyle='#7eb8a0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-70,-33);ctx.lineTo(-56,-21);ctx.lineTo(-29,-45);ctx.stroke();
  panel(ctx,-96,-2,96,9,'#bdc7b3',3);
  person(ctx,54,44,'#203347',0,1.15,.4+Math.sin(time*2)*.2,true);
  const repair=Math.sin(time*2)*11;
  ctx.strokeStyle=GOLD;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(44,18);ctx.lineTo(9+repair,-7);ctx.stroke();
  ctx.strokeStyle='#9ebcae';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,4);ctx.bezierCurveTo(-30,55,44,55,54,10);ctx.stroke();
  panel(ctx,47,-72,46,31,'#d3c69c',4);
  label(ctx,language==='pl'?'POMOC':'HELP',70,-54,8,INK);
  const dotX=-81+(time%3)*20;
  ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(dotX,-17,3,0,Math.PI*2);ctx.fill();
  label(ctx,language==='pl'?'UR · WSPARCIE IT':'UR · IT SUPPORT',0,82,9);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function future(ctx,time,language) {
  panel(ctx,-114,-88,228,160,'#31574a',10);
  ctx.strokeStyle=GOLD;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-34,40,Math.PI,Math.PI*2);ctx.lineTo(40,39);ctx.moveTo(-40,-34);ctx.lineTo(-40,39);ctx.stroke();
  ctx.fillStyle='#b8ba8e';ctx.beginPath();ctx.moveTo(-68,76);ctx.lineTo(-17,-30);ctx.lineTo(17,-30);ctx.lineTo(68,76);ctx.fill();
  ctx.strokeStyle='#fff0b0';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(0,68);ctx.lineTo(0,-24);ctx.stroke();ctx.setLineDash([]);
  person(ctx,-21,44-Math.sin(time*.6)*14,'#203649',time*3,.95,0,true);
  person(ctx,24,52-Math.sin(time*.6+1)*12,'#ae9966',time*3+1,.9);
  label(ctx,language==='pl'?'DALEJ PISZEMY HISTORIĘ':'THE STORY CONTINUES',0,100,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function servers(ctx,time,language) {
  panel(ctx,-95,-84,190,123,'#334a4f',8);
  for(const [index,x] of [-63,-20,23,66].entries()) {
    panel(ctx,x-16,-73,33,90,'#17333b',3);
    for(const level of [0,1,2,3,4]) {
      panel(ctx,x-11,-65+level*15,23,10,'#45636b',2);
      ctx.fillStyle=Math.floor(time*2+index+level)%3?'#b8c77d':'#d6b474';
      ctx.beginPath();ctx.arc(x+5,-60+level*15,1.8,0,Math.PI*2);ctx.fill();
    }
  }
  person(ctx,-55+Math.sin(time*.7)*35,67,'#d0b571',time*3,.95,0,true);
  label(ctx,language==='pl'?'UCI · DANE / SYSTEMY':'UCI · DATA / SYSTEMS',0,88,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time */
function community(ctx,time) {
  panel(ctx,-111,-52,222,115,'#667c58',10);
  ctx.strokeStyle='#c9be91';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-104,-70);ctx.quadraticCurveTo(0,-41,104,-70);ctx.stroke();
  for(const [index,x] of [-85,-51,-17,17,51,85].entries()) {
    const y=-62+Math.sin((x+104)/208*Math.PI)*12;
    ctx.fillStyle=['#d6b46c','#b67563','#7eabb0'][index%3];ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x+9,y);ctx.lineTo(x+Math.sin(time*2+index)*3,y+16);ctx.fill();
  }
  for(const [index,x] of [-76,-35,8,51,86].entries()) person(ctx,x,33+Math.sin(index)*10,['#ccae67','#a1839e','#7ea7ac','#b3b481','#b27f6b'][index],0,.9,.2+Math.sin(time*3+index)*.25,index===2);
  panel(ctx,-58,53,116,7,'#a48d63',2);
  label(ctx,'ASBiR',0,86,11);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function scholarship(ctx,time,language) {
  panel(ctx,-114,-92,228,166,'#4b4934',9);
  ctx.fillStyle='#e6c57612';ctx.beginPath();ctx.moveTo(-75,-92);ctx.lineTo(-112,74);ctx.lineTo(34,74);ctx.fill();
  panel(ctx,-77,-77,153,95,'#cfb879',5);
  panel(ctx,-70,-70,139,81,'#f1e6bd',2);
  ctx.strokeStyle='#9f894e';ctx.lineWidth=1;ctx.strokeRect(-63,-64,125,68);
  label(ctx,'250',0,-35,29,'#435346');
  label(ctx,language==='pl'?'NAJLEPSZYCH UCZNIÓW':'TOP STUDENTS',0,-17,8,'#435346');
  label(ctx,'ŚWIĘTOKRZYSKIE',0,-3,8,'#72633b');
  const cycle=time%7, approach=clampUnit(cycle/1.6);
  const studentX=68-approach*30;
  person(ctx,studentX,64,'#203347',cycle<1.6?time*5:0,1.1,cycle>2?.5:.1,true);
  person(ctx,-49,64,'#9e8d68',0,1.1,.55);
  const handover=clampUnit((cycle-1.5)/1.5), certificateX=-29+handover*48;
  panel(ctx,certificateX,22-handover*5,28,20,'#f2deb0',2);
  label(ctx,'250',certificateX+14,35-handover*5,7,'#435346');
  for(const [index,x] of [-97,-79,81,99].entries()) {
    const sparkle=.5+.5*Math.sin(time*2+index);
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(x,-27+index*18,1.5+sparkle,0,Math.PI*2);ctx.fill();
  }
  label(ctx,language==='pl'?'STYPENDIUM MARSZAŁKA':'MARSHAL’S SCHOLARSHIP',0,94,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function graduation(ctx,time,language) {
  panel(ctx,-114,-90,228,161,'#3d4657',9);
  panel(ctx,-97,-75,194,34,'#253a45',4);
  label(ctx,language==='pl'?'UNIWERSYTET RZESZOWSKI':'UNIVERSITY OF RZESZÓW',0,-55,8);
  person(ctx,0,57,'#1e3046',0,1.5,.4,true);
  const cycle=time%6, capDrop=clampUnit(cycle/1.7);
  const capY=-73+capDrop*64;
  ctx.fillStyle='#182934';ctx.beginPath();ctx.moveTo(-28,capY);ctx.lineTo(0,capY-12);ctx.lineTo(28,capY);ctx.lineTo(0,capY+12);ctx.closePath();ctx.fill();
  panel(ctx,-16,capY+3,32,8,'#243b45',1);
  ctx.strokeStyle=GOLD;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(0,capY);ctx.lineTo(24,capY+2);ctx.lineTo(24+Math.sin(time*3)*3,capY+24);ctx.stroke();
  panel(ctx,12,30,42,15,'#ead3a0',3);panel(ctx,30,29,4,17,'#af7050',1);
  const raise=Math.sin(Math.min(cycle,2)/2*Math.PI)*9;
  person(ctx,-72,63-raise,'#a49876',0,1,.9);
  person(ctx,74,63-raise,'#7d9b9d',0,1,.8);
  label(ctx,language==='pl'?'INŻYNIER → MAGISTER INŻYNIER':'ENGINEER → MASTER OF ENGINEERING',0,94,7);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function moving(ctx,time,language) {
  panel(ctx,-115,-91,230,163,'#304b49',9);
  panel(ctx,-105,-82,210,23,'#213b42',4);
  label(ctx,language==='pl'?'RODZINNE STRONY → RZESZÓW':'HOMETOWN → RZESZÓW',0,-66,8,GOLD);
  panel(ctx,-101,-23,51,40,'#b6b094',3);
  ctx.fillStyle='#80664c';ctx.beginPath();ctx.moveTo(-108,-23);ctx.lineTo(-76,-48);ctx.lineTo(-43,-23);ctx.closePath();ctx.fill();
  panel(ctx,-91,-15,12,13,'#e1d399',1);panel(ctx,-68,-7,11,24,'#67543e',1);
  panel(ctx,-108,17,65,5,'#7c8f72',2);
  for(const [index,x] of [9,34,63,87].entries()) {
    const height=[30,44,35,49][index];
    panel(ctx,x-9,-height,20,height+5,'#64817d',2);
    for(const y of [12,25,38]) if(y<height) {
      panel(ctx,x-5,-height+y,4,6,'#d8c894',1);panel(ctx,x+3,-height+y,4,6,'#b2c2a3',1);
    }
  }
  panel(ctx,21,-32,67,29,'#9ead9c',2);
  ctx.fillStyle='#c0b38a';ctx.beginPath();ctx.moveTo(17,-32);ctx.lineTo(55,-51);ctx.lineTo(92,-32);ctx.closePath();ctx.fill();
  for(const x of [31,44,65,78]) panel(ctx,x,-26,4,21,'#d3d5b5',1);
  label(ctx,'UR',55,-17,9,'#304d49');
  ctx.strokeStyle='#d7bc7a';ctx.lineWidth=2;ctx.setLineDash([4,5]);
  ctx.beginPath();ctx.moveTo(-44,0);ctx.quadraticCurveTo(-16,-27,11,-7);ctx.stroke();ctx.setLineDash([]);
  const travel=(time%9)/9;
  const markerX=-44+travel*55,markerY=-7-Math.sin(travel*Math.PI)*12;
  ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(markerX,markerY,3,0,Math.PI*2);ctx.fill();
  panel(ctx,48,10,53,55,'#b6bba3',3);panel(ctx,44,7,61,6,'#7d9187',2);
  for(const [x,y] of [[56,20],[80,20],[56,37],[80,37]]) panel(ctx,x,y,12,10,'#ead39a',1);
  panel(ctx,68,47,12,18,'#526e67',1);panel(ctx,43,65,63,5,'#8b9a7e',2);
  ctx.strokeStyle='#a6af89';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-99,66);ctx.lineTo(45,66);ctx.stroke();
  const approach=clampUnit((time%9)/4.5),driverX=-78+approach*114;
  person(ctx,driverX,65,'#203347',approach<1?time*6:0,1,approach<1?.15:.5,true);
  const suitcaseX=driverX+(approach<1?10:-19),suitcaseY=approach<1?49+Math.sin(time*6)*1.5:51;
  panel(ctx,suitcaseX,suitcaseY,15,14,'#b89e67',2);
  ctx.strokeStyle='#d9c68d';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(suitcaseX+5,suitcaseY);ctx.lineTo(suitcaseX+5,suitcaseY-4);ctx.lineTo(suitcaseX+10,suitcaseY-4);ctx.lineTo(suitcaseX+10,suitcaseY);ctx.stroke();
  for(const wheel of [3,12]) {ctx.fillStyle='#203a3a';ctx.beginPath();ctx.arc(suitcaseX+wheel,suitcaseY+14,1.8,0,Math.PI*2);ctx.fill();}
  const heartY=approach===1?-8+Math.sin(time*1.5)*2:-8;
  ctx.fillStyle='#d4a57b';ctx.beginPath();ctx.moveTo(-15,heartY+8);ctx.bezierCurveTo(-34,heartY-4,-22,heartY-15,-15,heartY-7);ctx.bezierCurveTo(-8,heartY-15,4,heartY-4,-15,heartY+8);ctx.fill();
  label(ctx,language==='pl'?'RZESZÓW - MÓJ DOM':'RZESZÓW - MY HOME',0,97,9);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {number} time @param {number} [scale] */
function robot(ctx,x,y,time,scale=1) {
  ctx.save();ctx.translate(x,y+Math.sin(time*2)*2);ctx.scale(scale,scale);
  ctx.strokeStyle='#98b6b2';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(0,-48);ctx.stroke();
  ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(0,-50,3,0,Math.PI*2);ctx.fill();
  panel(ctx,-23,-38,46,33,'#8da4a3',7);panel(ctx,-17,-31,34,20,'#15323a',4);
  ctx.fillStyle='#b9e5cf';for(const eye of [-8,8]) {ctx.beginPath();ctx.arc(eye,-23,3,0,Math.PI*2);ctx.fill();}
  panel(ctx,-17,-1,34,34,'#69868b',5);panel(ctx,-10,6,20,14,'#263f47',3);
  label(ctx,'AI',0,17,9,GOLD);
  ctx.strokeStyle='#8da4a3';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-19,7);ctx.lineTo(-31,15-Math.sin(time*2)*8);ctx.moveTo(19,7);ctx.lineTo(33,4+Math.sin(time*2)*8);ctx.moveTo(-9,34);ctx.lineTo(-12,44);ctx.moveTo(9,34);ctx.lineTo(12,44);ctx.stroke();
  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language @param {boolean} [conversation] */
function artificialIntelligence(ctx,time,language,conversation=false) {
  panel(ctx,-115,-91,230,163,'#253f4b',10);
  if(conversation) {
    robot(ctx,-63,9,time,1.1);
    person(ctx,70,66,'#203347',0,1.1,.35,true);
    panel(ctx,-4,-75,102,62,'#d6dfc2',7);
    label(ctx,language==='pl'?'PRACA MAGISTERSKA':'MASTER’S THESIS',47,-59,7,'#2a4a43');
    label(ctx,'PJM',47,-19,9,'#2a4a43');
    const reveal=Math.floor(time%5)+1;
    for(const row of [0,1,2]) if(row<reveal) panel(ctx,9,-48+row*8,69-row*6,3,'#729086',1);
    ctx.fillStyle='#d6dfc2';ctx.beginPath();ctx.moveTo(10,-15);ctx.lineTo(-5,-1);ctx.lineTo(27,-15);ctx.fill();
  } else {
    const layers=[[-88,[-54,-5,43]],[-25,[-69,-23,23,69]],[42,[-48,0,48]]];
    const phase=(time%6)/6;
    for(const [index,layer] of layers.entries()) {
      const [x,ys]=/** @type {[number,number[]]} */(layer);
      if(index) {
        const [previousX,previousYs]=/** @type {[number,number[]]} */(layers[index-1]);
        for(const [node,y] of ys.entries()) for(const previousY of previousYs) {
          ctx.strokeStyle=phase>(index*3+node)/11?'#c9b577':'#51787955';ctx.lineWidth=1.2;
          ctx.beginPath();ctx.moveTo(previousX,previousY);ctx.lineTo(x,y);ctx.stroke();
        }
      }
      for(const [node,y] of ys.entries()) {
        ctx.fillStyle=phase>(index*3+node)/11?'#e6c984':'#779da3';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();
      }
    }
    robot(ctx,86,25,time,.62);
    ctx.save();ctx.translate(-88,62);ctx.rotate(Math.sin(time*.8)*.08);
    panel(ctx,-10,-9,20,24,'#d6b08a',7);panel(ctx,-6,11,12,10,'#c29a77',2);
    ctx.strokeStyle='#d6b08a';ctx.lineWidth=4.5;ctx.lineCap='round';ctx.beginPath();
    for(const [x,length] of [[-7,19],[-2,27],[3,25],[8,18]]) {ctx.moveTo(x,-4);ctx.lineTo(x,-length);}
    ctx.moveTo(-7,1);ctx.lineTo(-18,-7);ctx.stroke();ctx.restore();
    label(ctx,language==='pl'?'DŁOŃ → SIEĆ → PJM':'HAND → NETWORK → PJM',0,102,8);
  }
  if(conversation) label(ctx,language==='pl'?'POROZMAWIAJMY O AI':'LET’S TALK ABOUT AI',0,94,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function games(ctx,time,language) {
  panel(ctx,-115,-91,230,163,'#343c56',10);
  panel(ctx,-102,-78,204,94,'#172d36',5);
  for(const [index,x] of [-97,-45,7,59].entries()) panel(ctx,x,-10-Math.sin(index)*14,38,7,'#789a82',1);
  const runner=-84+(time%5)/5*168, jump=Math.abs(Math.sin(time*3))*20;
  person(ctx,runner,-13-jump,'#dfb567',time*7,.6,0,true);
  ctx.fillStyle='#dfc983';ctx.beginPath();ctx.arc(68,-54,6,0,Math.PI*2);ctx.fill();
  panel(ctx,-62,28,124,43,'#9daba2',16);panel(ctx,-44,41,22,7,'#324b4d',2);panel(ctx,-36,33,7,22,'#324b4d',2);
  for(const [x,y,color] of [[29,39,'#d2ab68'],[41,49,'#a97765'],[18,50,'#698d9d']]) {ctx.fillStyle=String(color);ctx.beginPath();ctx.arc(Number(x),Number(y),4,0,Math.PI*2);ctx.fill();}
  label(ctx,language==='pl'?'OD GRACZA DO TWÓRCY':'FROM PLAYER TO CREATOR',0,94,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function qualifications(ctx,time,language) {
  panel(ctx,-113,-90,226,160,'#3e5141',9);
  for(const [index,code] of ['E12','E13','E14'].entries()) {
    const x=-73+index*70, y=-34+Math.sin(time*1.5+index)*4;
    panel(ctx,x-29,y-35,58,81,'#e0cf9b',4);panel(ctx,x-24,y-30,48,69,'#f0e7c7',2);
    label(ctx,code,x,y-4,15,'#3d574e');
    ctx.strokeStyle='#729575';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-10,y+14);ctx.lineTo(x-2,y+22);ctx.lineTo(x+13,y+6);ctx.stroke();
  }
  person(ctx,0,80,'#203347',0,.9,.5,true);
  label(ctx,language==='pl'?'KOMPUTERY · SIECI · APLIKACJE':'COMPUTERS · NETWORKS · APPLICATIONS',0,102,7);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function frontend(ctx,time,language) {
  panel(ctx,-114,-91,228,162,'#29494d',9);panel(ctx,-99,-77,198,119,'#d8dec5',5);panel(ctx,-99,-77,198,17,'#7f9c93',4);
  for(const x of [-90,-81,-72]) {ctx.fillStyle='#d2bd88';ctx.beginPath();ctx.arc(x,-69,2,0,Math.PI*2);ctx.fill();}
  const progress=(time%5)/5;
  panel(ctx,-86,-48,106,13,'#829b80',2);
  for(const [index,x] of [-86,-25,36].entries()) {
    if(progress>index*.18) {panel(ctx,x,-24,50,49,'#b7c5a3',3);panel(ctx,x+5,-18,40,22,'#7e9b9b',2);panel(ctx,x+5,10,32,3,'#8a9d81',1);}
  }
  ctx.strokeStyle='#324d4b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-87+progress*161,-6);ctx.lineTo(-83+progress*161,9);ctx.lineTo(-76+progress*161,3);ctx.closePath();ctx.stroke();
  label(ctx,'HTML → CSS → JavaScript',0,87,9);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function uxFlow(ctx,time,language) {
  panel(ctx,-113,-90,226,160,'#4b454c',9);
  for(const [index,x] of [-82,0,82].entries()) {
    panel(ctx,x-26,-49,52,77,'#d5d0b4',6);panel(ctx,x-20,-40,40,14,'#76978e',2);panel(ctx,x-20,-17,40,4,'#9aab91',1);panel(ctx,x-20,-6,28,4,'#9aab91',1);
    if(index<2) {ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+29,-9);ctx.lineTo(x+49,-9);ctx.lineTo(x+43,-15);ctx.moveTo(x+49,-9);ctx.lineTo(x+43,-3);ctx.stroke();}
  }
  const step=Math.floor(time*1.5)%3;
  ctx.strokeStyle='#f1cb78';ctx.lineWidth=3;ctx.strokeRect(-108+step*82,-52,52,83);
  ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(-53+(time%2)*10,-9,3,0,Math.PI*2);ctx.fill();
  person(ctx,-76+step*76,72,'#203347',0,.9,.25,true);
  label(ctx,language==='pl'?'CEL → DZIAŁANIE → EFEKT':'GOAL → ACTION → RESULT',0,96,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function infrastructure(ctx,time,language) {
  panel(ctx,-114,-90,228,161,'#2e4952',9);
  const devices=[[-77,-43],[0,-58],[77,-43]];
  ctx.strokeStyle='#8bb7ac';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-77,-10);ctx.lineTo(-77,21);ctx.lineTo(77,21);ctx.lineTo(77,-10);ctx.moveTo(0,21);ctx.lineTo(0,-26);ctx.stroke();
  for(const [index,[x,y]] of devices.entries()) {panel(ctx,x-25,y-16,50,35,'#9fb3b1',3);panel(ctx,x-20,y-11,40,25,'#244751',2);label(ctx,index===1?'UR':'IT',x,y+5,10);}
  const signal=-77+(time%3)/3*154;ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(signal,21,4,0,Math.PI*2);ctx.fill();
  panel(ctx,-32,43,64,21,'#789a8f',4);for(const x of [-20,-10,0,10,20]) panel(ctx,x,50,4,4,'#d3c688',1);
  label(ctx,language==='pl'?'INFRASTRUKTURA INSTYTUTU':'INSTITUTE INFRASTRUCTURE',0,93,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function graphics(ctx,time,language) {
  panel(ctx,-113,-90,226,160,'#51434d',9);panel(ctx,-65,-79,116,128,'#e2d8ba',4);
  ctx.fillStyle='#89a49a';ctx.beginPath();ctx.arc(-6,-35,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#bb9a67';ctx.beginPath();ctx.moveTo(-50,17);ctx.lineTo(-16,-25);ctx.lineTo(2,3);ctx.lineTo(24,-15);ctx.lineTo(43,17);ctx.fill();
  for(const [index,width] of [75,57,65].entries()) panel(ctx,-47,27+index*6,width,2,'#7d8e7c',1);
  const penX=-20+Math.sin(time)*31, penY=-20+Math.cos(time)*24;ctx.strokeStyle='#3d5354';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(penX,penY);ctx.lineTo(penX+24,penY-29);ctx.stroke();
  for(const [index,color] of ['#bf8d69','#83a29b','#d4b461','#7e90ae'].entries()) {ctx.fillStyle=color;ctx.beginPath();ctx.arc(81,-37+index*22,7,0,Math.PI*2);ctx.fill();}
  label(ctx,language==='pl'?'KOD I GRAFIKA':'CODE AND GRAPHICS',0,92,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function database(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#293f4e',9);
  panel(ctx,-39,-57,78,102,'#6b9191',1);
  for(const y of [-57,-23,11,45]) {ctx.fillStyle=y===-57?'#abc3b3':'#729f9a';ctx.beginPath();ctx.ellipse(0,y,39,12,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b5c9b180';ctx.lineWidth=1;ctx.stroke();}
  label(ctx,'MSSQL',0,-51,10,'#264941');
  for(const [index,x] of [-91,87].entries()) {panel(ctx,x-16,-39,32,42,'#d2c9a8',3);for(const row of [0,1,2]) panel(ctx,x-10,-31+row*8,19,3,'#8e9c85',1);const phase=(time*.5+index*.5)%1;ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(x+(index?-1:1)*phase*46,20,4,0,Math.PI*2);ctx.fill();}
  label(ctx,language==='pl'?'ZAPYTANIE → DANE → WYNIK':'QUERY → DATA → RESULT',0,91,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function automation(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#3b4f48',9);panel(ctx,-103,32,206,17,'#7a9180',6);
  for(const index of [0,1,2,3,4,5,6]) {ctx.fillStyle='#c4ba90';ctx.beginPath();ctx.arc(-89+index*29,40,5,0,Math.PI*2);ctx.fill();}
  panel(ctx,-31,-65,62,95,'#9bab92',6);panel(ctx,-24,-56,48,55,'#294b47',3);label(ctx,'⚙',0,-22,27,GOLD);
  const packageX=-97+(time%4)/4*194;panel(ctx,packageX-12,5,24,26,packageX>30?'#d4be7f':'#91b3a8',3);
  label(ctx,packageX>30?'✓':'…',packageX,23,15,'#31544b');
  ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-31,20,time,time+Math.PI*1.2);ctx.stroke();
  label(ctx,language==='pl'?'POWTARZALNE ZADANIE → AUTOMAT':'REPEATED TASK → AUTOMATION',0,91,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function plugins(ctx,time,language) {
  panel(ctx,-115,-92,230,169,'#273b37',10);
  panel(ctx,-1,-79,105,140,'#aab9a8',5);
  panel(ctx,-1,-79,105,19,'#31554d',4);
  label(ctx,'WordPress',51,-66,9,GOLD);
  panel(ctx,10,-48,82,15,'#d2b771',3);
  for(const [index,width] of [65,76,53].entries()) panel(ctx,10,-22+index*10,width,4,'#667e70',1);
  const step=Math.floor(time/1.5)%3, progress=clampUnit((time%1.5)/.9);
  for(const [index,y] of [-39,0,39].entries()) {
    const active=index===step, shift=active?progress*12:0;
    panel(ctx,-103+shift,y-13,52,27,active?'#e1bf77':'#71968a',5);
    label(ctx,['{ }','⚙','↻'][index],-78+shift,y+5,15,INK);
    ctx.strokeStyle=active?GOLD:'#75988a';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-51+shift,y-5);ctx.lineTo(-44+shift,y-5);ctx.moveTo(-51+shift,y+5);ctx.lineTo(-44+shift,y+5);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-36,y);ctx.lineTo(-17,y);ctx.lineTo(-17,44);ctx.lineTo(10,44);ctx.stroke();
    if(active) {
      ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(-35+progress*18,y,3,0,Math.PI*2);ctx.fill();
      panel(ctx,10,34,82,19,'#294b42',3);
      label(ctx,progress>.8?'✓':language==='pl'?'ŁĄCZENIE':'CONNECTING',51,47,progress>.8?14:7,GOLD);
    }
  }
  label(ctx,language==='pl'?'DEDYKOWANE WTYCZKI':'CUSTOM PLUGINS',0,96,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function accessibility(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#3f4750',9);panel(ctx,-100,-66,139,89,'#abb9ad',5);panel(ctx,-94,-60,127,75,'#1b3a40',2);
  panel(ctx,-82,-46,93,11,'#d5c699',2);panel(ctx,-82,-25,76,4,'#8ba698',1);panel(ctx,-82,-13,91,4,'#8ba698',1);
  const focus=Math.floor(time*1.5)%3;ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.strokeRect(-85,-49+focus*18,100,15);
  ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(20,-42+focus*18,2.5+Math.sin(time*3)*.8,0,Math.PI*2);ctx.fill();
  panel(ctx,56,-61,42,94,'#d3d6bd',7);panel(ctx,61,-52,32,74,'#2e4e50',2);panel(ctx,65,-43,24,9,'#d5c699',2);
  for(const y of [-24,-10,4]) panel(ctx,65,y,24,3,'#9bb3a2',1);
  label(ctx,'WCAG',-32,57,13,GOLD);label(ctx,'AA',77,57,13,GOLD);
  label(ctx,language==='pl'?'CZYTELNOŚĆ · KLAWIATURA · KONTRAST':'CLARITY · KEYBOARD · CONTRAST',0,91,7);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function radio(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#4b354b',9);panel(ctx,-101,-76,202,27,'#253641',4);
  label(ctx,'feniks.fm',0,-57,15,GOLD);panel(ctx,-101,22,202,14,'#b59b75',3);
  person(ctx,-71,42,'#203347',0,1,.35,true);person(ctx,71,42,'#a48d74',0,1,.3);
  panel(ctx,-9,-18,18,33,'#a3b2ac',8);ctx.strokeStyle='#9bacad';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(0,22);ctx.moveTo(-14,22);ctx.lineTo(14,22);ctx.stroke();
  for(const side of [-1,1]) for(const index of [0,1,2]) {ctx.strokeStyle=`rgba(215,186,116,${.25+.6*(.5+.5*Math.sin(time*4-index))})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-4,24+index*10,side<0?2.4:-.7,side<0?3.9:.7);ctx.stroke();}
  for(const [index,x] of [-79,-56,-33,21,44,67].entries()) panel(ctx,x,48,13,5+Math.abs(Math.sin(time*3+index))*14,'#8bafa0',1);
  label(ctx,language==='pl'?'AUDYCJE · WYWIADY · REALIZACJA':'SHOWS · INTERVIEWS · PRODUCTION',0,91,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function festival(ctx,time,language) {
  panel(ctx,-115,-96,230,188,'#273239',9);
  panel(ctx,-108,-24,216,111,'#3b4141',6);
  panel(ctx,-88,-88,176,71,'#141e2c',3);
  panel(ctx,-95,-25,190,12,'#7c725f',2);
  panel(ctx,-97,-94,194,8,'#87918b',2);
  for(const x of [-94,94]) {
    panel(ctx,x-3,-90,6,73,'#79847f',1);
    ctx.strokeStyle='#a1aba0';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x-3,-88);ctx.lineTo(x+3,-73);ctx.lineTo(x-3,-58);ctx.lineTo(x+3,-43);ctx.lineTo(x-3,-26);ctx.stroke();
  }
  label(ctx,'KultURalia',0,-72,16,GOLD);
  for(const [index,x] of [-73,-25,25,73].entries()) {
    const direction=Math.sin(time*.6+index*1.7)*39;
    ctx.fillStyle=index%2?'#8fa5e51a':'#e6c26e1c';
    ctx.beginPath();ctx.moveTo(x,-85);ctx.lineTo(x+direction-21,79);ctx.lineTo(x+direction+26,79);ctx.closePath();ctx.fill();
    panel(ctx,x-5,-87,10,6,index%2?'#9da8d2':'#dfbd77',2);
  }
  for(const x of [-104,104]) {
    panel(ctx,x-8,-63,16,47,'#111a20',3);
    for(const y of [-53,-37,-23]) {ctx.strokeStyle='#74858a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.stroke();}
  }
  person(ctx,0,-35,'#96a4aa',0,.52,.3+Math.sin(time*7)*.2);
  ctx.fillStyle='#bba16d';ctx.beginPath();ctx.ellipse(0,-38,10,9,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#e1ce9f';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-38,8,7,0,0,Math.PI*2);ctx.stroke();
  for(const x of [-13,13]) {ctx.strokeStyle='#b5b8a4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,-38);ctx.lineTo(x,-52);ctx.stroke();ctx.fillStyle='#c7ac70';ctx.beginPath();ctx.ellipse(x,-53,7,2,0,0,Math.PI*2);ctx.fill();}
  for(const [index,x] of [-47,47].entries()) {
    person(ctx,x,-25,index?'#87b5b0':'#bd8f78',time*2+index,.65,.25+Math.sin(time*5+index)*.12);
    ctx.save();ctx.translate(x,-37);ctx.rotate(index?-.45:.4);
    ctx.fillStyle=index?'#bbac6e':'#bf805a';ctx.beginPath();ctx.ellipse(0,0,5,8,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#d5caa8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(0,-18);ctx.stroke();ctx.restore();
  }
  const singerX=9+Math.sin(time*.9)*4;
  person(ctx,singerX,-18,'#dac079',Math.sin(time*2),.78,.7);
  ctx.strokeStyle='#a3b4b7';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(singerX+8,-20);ctx.lineTo(singerX+8,-45);ctx.moveTo(singerX+3,-20);ctx.lineTo(singerX+13,-20);ctx.stroke();
  ctx.fillStyle='#c4ceca';ctx.beginPath();ctx.arc(singerX+7,-46,2.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#a7af9a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-103,-3);ctx.lineTo(103,-3);ctx.stroke();
  for(const x of [-100,-75,-50,-25,0,25,50,75,100]) {ctx.beginPath();ctx.moveTo(x,-3);ctx.lineTo(x,5);ctx.stroke();}
  const shirts=['#d2b477','#819ead','#b38ca8','#90ac8c','#c28b71','#b4b99a'];
  for(const row of [0,1,2,3,4,5,6]) {
    const scale=.43+row*.035;
    for(const column of [0,1,2,3,4,5,6,7]) {
      const index=row*8+column,phase=time*(1.6+(index%5)*.12)+index*1.9;
      const x=-93+column*26+(row%2?6:0)+Math.sin(phase)*1.3;
      const y=18+row*10-Math.max(0,Math.sin(phase*1.3))*(1.3+index%3);
      person(ctx,x,y,shirts[(column+row*3)%shirts.length],phase,scale,.45+Math.sin(phase*.8)*.4);
    }
  }
  label(ctx,language==='pl'?'KONCERTY · RZESZÓW':'LIVE MUSIC · RZESZÓW',0,100,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function hobbies(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#3f4650',9);panel(ctx,-102,-73,115,113,'#253d46',5);panel(ctx,-93,-49,96,39,'#c8c5ad',2);
  for(const [index,x] of [-87,-75,-63,-51,-39,-27,-15].entries()) {panel(ctx,x,-45,10,32,Math.floor(time*3)%7===index?'#e7c779':'#ece4c8',1);if(index<6&&index!==2) panel(ctx,x+7,-45,5,19,'#20323b',1);}
  person(ctx,-46,72,'#203347',0,1,.45,true);ctx.strokeStyle='#b5c7a9';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-74,47);ctx.lineTo(-79,-8);ctx.moveTo(-39,47);ctx.lineTo(-29,-8);ctx.stroke();
  panel(ctx,31,-72,68,110,'#b4a47b',4);ctx.strokeStyle='#665641';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(65,-71);ctx.lineTo(65,-49);ctx.stroke();
  panel(ctx,49,-49,32,84,'#936454',14);const strike=.5+.5*Math.sin(time*3);person(ctx,43+strike*6,63,'#d4d5bc',0,.95,strike,true);
  ctx.strokeStyle='#d4d5bc';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(48,43);ctx.lineTo(56+strike*12,34-strike*8);ctx.stroke();
  label(ctx,language==='pl'?'FORTEPIAN · TRENING · PASJE':'PIANO · TRAINING · PASSIONS',0,96,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} x @param {number} y @param {boolean} profile */
function athleteHead(ctx,x,y,profile) {
  ctx.fillStyle='#e3b886';ctx.beginPath();ctx.arc(x,y,7.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#604126';ctx.beginPath();ctx.ellipse(x-1,y-5,7,4,-.15,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8d6335';ctx.beginPath();ctx.moveTo(x-7,y-5);ctx.lineTo(x-2,y-12);ctx.lineTo(x+4,y-9);ctx.lineTo(x+7,y-5);ctx.fill();
  if(profile) {
    ctx.fillStyle='#e3b886';ctx.beginPath();ctx.moveTo(x+6,y-1);ctx.lineTo(x+10,y+1);ctx.lineTo(x+6,y+3);ctx.fill();
    ctx.fillStyle='#536452';ctx.beginPath();ctx.arc(x+4,y-1,1,0,Math.PI*2);ctx.fill();
  }
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function training(ctx,time,language) {
  panel(ctx,-115,-93,230,174,'#223c39',10);
  panel(ctx,-108,-84,103,151,'#314e48',5);
  panel(ctx,3,-84,105,151,'#263f43',5);
  label(ctx,language==='pl'?'ĆWICZENIA SIŁOWE':'STRENGTH TRAINING',-57,-69,7,GOLD);
  label(ctx,'KICKBOXING',55,-69,8,GOLD);
  panel(ctx,-108,65,216,10,'#152d2a',3);
  ctx.strokeStyle='#82988c';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(-101,63);ctx.lineTo(-101,-51);ctx.lineTo(-15,-51);ctx.lineTo(-15,63);ctx.stroke();
  for(const y of [-36,-7,22]) {
    ctx.strokeStyle='#a6ad8a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-104,y);ctx.lineTo(-98,y);ctx.moveTo(-18,y);ctx.lineTo(-12,y);ctx.stroke();
  }

  const lift=(1-Math.cos(time*2))/2, handY=8-lift*51, elbowY=21-lift*29;
  ctx.save();ctx.translate(-58,0);
  ctx.strokeStyle='#79918d';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(-5,34);ctx.lineTo(-8,51);ctx.lineTo(-11,64);ctx.moveTo(5,34);ctx.lineTo(8,51);ctx.lineTo(11,64);ctx.stroke();
  panel(ctx,-14,62,11,5,'#d2bc7c',2);panel(ctx,3,62,11,5,'#d2bc7c',2);
  panel(ctx,-10,2,20,34,'#203347',6);
  ctx.strokeStyle='#d0a57c';ctx.lineWidth=6;ctx.beginPath();
  ctx.moveTo(-8,9);ctx.lineTo(-19,elbowY);ctx.lineTo(-25,handY);ctx.moveTo(8,9);ctx.lineTo(19,elbowY);ctx.lineTo(25,handY);ctx.stroke();
  for(const side of [-1,1]) {
    const grip=side*25;
    ctx.strokeStyle='#e3b886';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(grip,handY);ctx.lineTo(grip,handY-3);ctx.stroke();
    ctx.strokeStyle='#b2bdaa';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(grip-10,handY-2);ctx.lineTo(grip+10,handY-2);ctx.stroke();
    for(const plate of [-8,8]) panel(ctx,grip+plate-3,handY-10,6,16,'#d6b46c',2);
  }
  athleteHead(ctx,0,-9,false);ctx.restore();

  const cycle=time%6;
  const punch=cycle<2?Math.sin(cycle/2*Math.PI):0;
  const kick=cycle>=3&&cycle<5?Math.sin((cycle-3)/2*Math.PI):0;
  const sway=(punch**5+kick**5)*.12;
  ctx.save();ctx.translate(87,-51);ctx.rotate(-sway);
  ctx.strokeStyle='#a9b1a0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,12);ctx.stroke();
  panel(ctx,-12,12,24,87,'#93765a',10);panel(ctx,-10,26,20,6,'#d6b46c',1);panel(ctx,-10,72,20,6,'#d6b46c',1);
  label(ctx,'DJ',0,59,9,'#f1dfb4');ctx.restore();

  ctx.save();ctx.translate(25-kick*3,Math.sin(time*3)*1.1);
  ctx.strokeStyle='#79918d';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(-1,29);ctx.lineTo(-7,47);ctx.lineTo(-14,64);
  ctx.moveTo(5,29);ctx.lineTo(15+kick*20,45-kick*16);ctx.lineTo(24+kick*36,64-kick*54);ctx.stroke();
  panel(ctx,-19,62,12,5,'#d7c48f',2);
  ctx.save();ctx.translate(24+kick*36,64-kick*54);ctx.rotate(-kick*.6);panel(ctx,-3,-2,12,5,'#d7c48f',2);ctx.restore();
  ctx.save();ctx.rotate(-kick*.12);panel(ctx,-9,-6,21,36,'#203347',6);
  ctx.strokeStyle='#d0a57c';ctx.lineWidth=6;ctx.beginPath();
  ctx.moveTo(-7,0);ctx.lineTo(-12,12);ctx.lineTo(0,-9);
  ctx.moveTo(9,0);ctx.lineTo(18+punch*15,7-punch*10);ctx.lineTo(25+punch*30,-11+punch*3);ctx.stroke();
  panel(ctx,-5,-14,11,10,'#d6b46c',4);panel(ctx,20+punch*30,-16+punch*3,12,11,'#d6b46c',4);
  athleteHead(ctx,0,-20,true);ctx.restore();ctx.restore();
  label(ctx,language==='pl'?'SIŁOWNIA · SIŁA · KICKBOXING':'GYM · STRENGTH · KICKBOXING',0,96,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function crm(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#263e51',9);panel(ctx,-101,-77,202,118,'#d2d9c4',5);panel(ctx,-101,-77,202,20,'#655d91',4);label(ctx,'DYNAMICS 365 · CRM',0,-63,9,'#f0ead3');
  for(const [index,x] of [-87,-25,37].entries()) {panel(ctx,x,-44,52,70,'#bccbbb',3);label(ctx,['01','02','03'][index],x+26,-31,8,'#47665d');for(const row of [0,1,2]) panel(ctx,x+7,-20+row*13,38,8,'#e4e6cd',2);}
  const progress=(time%5)/5,cardX=-80+progress*155;panel(ctx,cardX,-5,34,15,'#b59e66',3);label(ctx,'.NET',cardX+17,5,7,'#233d44');
  label(ctx,language==='pl'?'KONTAKTY → PROCES → RELACJA':'CONTACTS → PROCESS → RELATIONSHIP',0,91,7);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function collaboration(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#455044',9);panel(ctx,-71,-68,142,90,'#b3a47f',7);panel(ctx,-52,-55,104,59,'#e1dbbc',3);
  for(const [index,x] of [-33,0,33].entries()) {panel(ctx,x-12,-41,24,18,['#83a49d','#b69c6c','#988ca5'][index],2);ctx.strokeStyle='#758978';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,-18);ctx.lineTo(x,0);ctx.stroke();}
  for(const [index,x] of [-83,0,83].entries()) person(ctx,x,60,['#a98c6e','#203347','#7e9a9c'][index],0,1,.3+Math.sin(time*2+index)*.2,index===1);
  label(ctx,language==='pl'?'POMYSŁ → PLAN → WSPÓLNY PROJEKT':'IDEA → PLAN → SHARED PROJECT',0,94,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function integration(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#3e4c4e',9);
  panel(ctx,-99,-64,84,101,'#17373e',5);label(ctx,'</>',-57,-39,17,'#a1c4ad');
  for(const [index,width] of [54,38,48,31,53].entries()) panel(ctx,-85,-23+index*9,width,3,index%2?'#b39ac3':'#7da79c',1);
  panel(ctx,25,-64,75,101,'#d6d7bb',5);panel(ctx,31,-55,63,13,'#8ca696',2);panel(ctx,31,-32,27,27,'#b6c2a1',2);panel(ctx,64,-32,29,27,'#9cb3ad',2);panel(ctx,31,4,62,11,'#b69d68',2);
  const transfer=(time%3)/3;
  ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-14);ctx.lineTo(20,-14);ctx.lineTo(13,-21);ctx.moveTo(20,-14);ctx.lineTo(13,-7);ctx.stroke();
  ctx.fillStyle='#f1d48b';ctx.beginPath();ctx.arc(-10+transfer*28,-14,3,0,Math.PI*2);ctx.fill();
  person(ctx,1,78,'#203347',0,.9,.2+Math.sin(time*2)*.15,true);
  label(ctx,language==='pl'?'TECHNOLOGIA SPOTYKA WYGLĄD':'TECHNOLOGY MEETS VISUAL DESIGN',0,98,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language */
function experience(ctx,time,language) {
  panel(ctx,-114,-90,228,160,'#35474b',9);
  const skills=[{x:-75,y:-50,label:'CODE',color:'#8babac'},{x:75,y:-50,label:'DATA',color:'#a896b5'},{x:-75,y:42,label:'UI/UX',color:'#bb9b68'},{x:75,y:42,label:'UR',color:'#91ac81'}];
  for(const [index,skill] of skills.entries()) {
    ctx.strokeStyle='#8ba99a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(skill.x,skill.y);ctx.lineTo(0,0);ctx.stroke();
    panel(ctx,skill.x-26,skill.y-18,52,36,skill.color,5);label(ctx,skill.label,skill.x,skill.y+4,9,'#243d40');
    const phase=(time*.45+index*.25)%1;
    ctx.fillStyle=GOLD;ctx.beginPath();ctx.arc(skill.x*(1-phase),skill.y*(1-phase),3,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#d3c18d';ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();
  label(ctx,'.NET',0,-2,9,'#284744');label(ctx,'CRM',0,10,8,'#284744');
  label(ctx,language==='pl'?'DOŚWIADCZENIA ŁĄCZĄ SIĘ W PRAKTYCE':'EXPERIENCE COMES TOGETHER',0,96,8);
}

/** @param {CanvasRenderingContext2D} ctx @param {number} time @param {'pl'|'en'} language @param {'cmax'|'focus'} model */
function garage(ctx,time,language,model) {
  const focus=model==='focus',cycle=time%7,walk=clampUnit(cycle/2.7),handover=clampUnit((cycle-1)/1.8);
  panel(ctx,-114,-91,228,162,focus?'#34454c':'#4c4d3b',9);
  panel(ctx,-105,-82,210,24,focus?'#24343e':'#2c403b',4);
  label(ctx,focus?'FORD FOCUS ST · 2018':'FORD C-MAX · 2009',0,-66,10,GOLD);
  panel(ctx,-105,-51,210,107,focus?'#71817f':'#8e927b',5);
  ctx.strokeStyle='#d8d7b355';ctx.lineWidth=1.2;
  for(const x of [-100,-28,100]) {ctx.beginPath();ctx.moveTo(x,-47);ctx.lineTo(x,52);ctx.stroke();}
  if(focus) {
    ctx.fillStyle='#c4cbb570';ctx.beginPath();ctx.ellipse(48,9,49,40,0,0,Math.PI*2);ctx.fill();
    panel(ctx,-101,-47,47,18,'#3c5661',2);label(ctx,'USA → PL',-77,-35,7,'#d3dcc7');
  } else {
    ctx.strokeStyle='#c2c4a2';ctx.lineWidth=2;ctx.strokeRect(15,-47,76,99);
  }
  ctx.save();ctx.beginPath();ctx.rect(-106,-52,212,108);ctx.clip();
  ctx.save();ctx.translate(-65,2);ctx.scale(focus?.83:.8,focus?.83:.8);ctx.rotate(focus?-.08:-.1);
  paintVehicle(ctx,focus?'cmax':'taxi',{time});ctx.restore();
  ctx.save();ctx.translate(focus?48:53,focus?5:1);ctx.rotate(focus?-.2:0);ctx.scale(1.08,1.08);
  paintVehicle(ctx,model,{time,lights:cycle>3.4,steering:Math.sin(time*.8)*.15,exhaust:focus&&cycle>4.4&&cycle<4.75});ctx.restore();
  ctx.restore();
  const driverX=-46+walk*83;
  person(ctx,-94,77,'#9d9576',0,.78,handover<1?.65:.1);
  person(ctx,driverX,77,'#203347',walk<1?time*6:0,.95,cycle>3.4?.5:.1,true);
  const keyX=-84+(driverX+84)*handover,keyY=51-Math.sin(handover*Math.PI)*12;
  ctx.strokeStyle=GOLD;ctx.lineWidth=2;ctx.beginPath();ctx.arc(keyX,keyY,3.5,0,Math.PI*2);ctx.moveTo(keyX+3,keyY);ctx.lineTo(keyX+11,keyY);ctx.lineTo(keyX+11,keyY+3);ctx.moveTo(keyX+8,keyY);ctx.lineTo(keyX+8,keyY+3);ctx.stroke();
  label(ctx,focus?(language==='pl'?'250 → 300+ KM · BLOW-OFF':'250 → 300+ HP · BLOW-OFF'):(language==='pl'?'CZARNY DIESEL · 115 KM':'BLACK DIESEL · 115 HP'),0,104,8);
}

/** Drawn in a local ~230×200 scene, centred on (0,0).
 * @param {CanvasRenderingContext2D} ctx
 * @param {SceneKind|string} kind
 * @param {number} time
 * @param {'pl'|'en'} language
 */
export function paintLifeScene(ctx,kind,time,language='pl') {
  ctx.save();
  if(kind==='school') volleyball(ctx,time,language);
  else if(kind==='learning'||kind==='award') ceremony(ctx,time,language);
  else if(kind==='lecture') lecture(ctx,time,language);
  else if(kind==='design') designStudio(ctx,time,language);
  else if(kind==='netwise') coding(ctx,time,true,language);
  else if(kind==='internship'||kind==='office') coding(ctx,time,false,language);
  else if(kind==='university') support(ctx,time,language);
  else if(kind==='systems') servers(ctx,time,language);
  else if(kind==='community'||kind==='asbir') community(ctx,time);
  else if(kind==='festival') festival(ctx,time,language);
  else if(kind==='scholarship') scholarship(ctx,time,language);
  else if(kind==='graduation') graduation(ctx,time,language);
  else if(kind==='moving') moving(ctx,time,language);
  else if(kind==='ai'||kind==='robot') artificialIntelligence(ctx,time,language,kind==='robot');
  else if(kind==='games') games(ctx,time,language);
  else if(kind==='qualifications') qualifications(ctx,time,language);
  else if(kind==='frontend') frontend(ctx,time,language);
  else if(kind==='integration') integration(ctx,time,language);
  else if(kind==='uxflow') uxFlow(ctx,time,language);
  else if(kind==='infrastructure') infrastructure(ctx,time,language);
  else if(kind==='graphics') graphics(ctx,time,language);
  else if(kind==='database') database(ctx,time,language);
  else if(kind==='automation') automation(ctx,time,language);
  else if(kind==='plugins') plugins(ctx,time,language);
  else if(kind==='accessibility') accessibility(ctx,time,language);
  else if(kind==='radio') radio(ctx,time,language);
  else if(kind==='hobbies') hobbies(ctx,time,language);
  else if(kind==='training') training(ctx,time,language);
  else if(kind==='crm') crm(ctx,time,language);
  else if(kind==='experience') experience(ctx,time,language);
  else if(kind==='collaboration') collaboration(ctx,time,language);
  else if(kind==='cmax'||kind==='focus') garage(ctx,time,language,kind);
  else if(kind==='future'||kind==='next') future(ctx,time,language);
  else pedestrians(ctx,time,kind==='monument'||kind==='studies');
  ctx.restore();
}
