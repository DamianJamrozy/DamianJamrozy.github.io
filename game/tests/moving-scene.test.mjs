import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paintLifeScene } from '../career-drive/world-life.js';

function renderMoving(time,language='pl',kind='moving') {
  const calls=[];
  const context=new Proxy({}, {
    get: (_target,method) => (...args) => calls.push([String(method),...args]),
    set: () => true
  });
  paintLifeScene(context,kind,time,language);
  return calls;
}

test('moving to Rzeszow shows a hometown-to-university journey and a new home without repeating the scholarship',()=>{
  const calls=renderMoving(0);
  const labels=calls.filter(([method])=>method==='fillText').map(([,text])=>text);
  assert.ok(labels.includes('RODZINNE STRONY → RZESZÓW'));
  assert.ok(!labels.some(text=>text.includes('STASZÓW')),'the school location must not be assumed to be Damian’s hometown');
  assert.ok(labels.includes('UR'));
  assert.ok(labels.includes('RZESZÓW - MÓJ DOM'));
  assert.ok(!labels.some(text=>/250|STYPENDIUM|SCHOLARSHIP|MARSHAL|PODIUM/.test(text)));
  assert.ok(calls.some(([method,x,y,width,height])=>method==='roundRect'&&y>0&&width>40&&height>40),'arrival includes a residential building');
});

test('Damian arrives with luggage, then settles by his home while reduced-motion time zero remains stable',()=>{
  const initial=renderMoving(0),walking=renderMoving(2),settled=renderMoving(6);
  assert.deepEqual(renderMoving(0),initial);
  const driverPosition=calls=>calls.find(([method])=>method==='translate').slice(1);
  assert.ok(driverPosition(walking)[0]>driverPosition(initial)[0]);
  assert.ok(driverPosition(settled)[0]>driverPosition(walking)[0]);
  assert.deepEqual(driverPosition(settled),driverPosition(renderMoving(7)),'the arrival walk finishes instead of walking endlessly past home');
  for(const calls of [initial,walking,settled]) {
    assert.ok(calls.some(([method,x,y,width,height])=>method==='roundRect'&&width===15&&height===14),'luggage remains visible on arrival');
    for(const call of calls) for(const value of call.slice(1)) if(typeof value==='number') assert.ok(Number.isFinite(value));
  }
});

test('the new-home caption is bilingual and the original scholarship scene stays available at its own stop',()=>{
  const labels=(kind,language)=>renderMoving(0,language,kind).filter(([method])=>method==='fillText').map(([,text])=>text);
  assert.ok(labels('moving','en').includes('RZESZÓW - MY HOME'));
  assert.ok(labels('moving','en').includes('HOMETOWN → RZESZÓW'));
  assert.ok(labels('scholarship','pl').includes('250'));
  assert.ok(labels('scholarship','en').includes('250'));
});
