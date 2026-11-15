import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paintLifeScene } from '../career-drive/world-life.js';

function renderFestival(time,language='pl',kind='festival') {
  const calls=[];
  const context=new Proxy({}, {
    get: (_target,method) => (...args) => calls.push([String(method),...args]),
    set: () => true
  });
  paintLifeScene(context,kind,time,language);
  return calls;
}

test('KultURalia presents a concert with a large audience instead of a radio interview', () => {
  const calls=renderFestival(0);
  const labels=calls.filter(([method])=>method==='fillText').map(([,text])=>text);
  assert.ok(labels.includes('KultURalia'));
  assert.ok(labels.includes('KONCERTY · RZESZÓW'));
  assert.ok(!labels.includes('feniks.fm'));
  const people=calls.filter(([method,x,y,width,height])=>method==='ellipse'&&x===2&&y===2&&width===8&&height===3);
  assert.ok(people.length>=50,'an outdoor concert should show a dense crowd and performers');
  const equipment=calls.filter(([method])=>method==='roundRect');
  assert.ok(equipment.some(([,x,y,width,height])=>width>150&&height>50&&y<0),'the event has an elevated broad stage');
  const speakers=equipment.filter(([,x,y,width,height])=>Math.abs(x)>90&&width===16&&height>40);
  assert.equal(speakers.length,2,'a pair of PA stacks frames the stage');
});

test('the concert crowd, performers and light beams change continuously while a motion-free frame stays deterministic', () => {
  const initial=renderFestival(0);
  assert.deepEqual(renderFestival(0),initial);
  const later=renderFestival(1.75);
  assert.notDeepEqual(later,initial);
  const positions=calls=>calls.filter(([method])=>method==='translate');
  assert.notDeepEqual(positions(later),positions(initial),'the band and audience move');
  const beams=calls=>calls.filter(([method])=>method==='lineTo');
  assert.notDeepEqual(beams(later),beams(initial),'stage lights sweep gently');
  for(const call of later) {
    for(const value of call.slice(1)) if(typeof value==='number') assert.ok(Number.isFinite(value));
  }
});

test('concert captions are bilingual and the separate radio scene keeps its own identity', () => {
  const labels=(time,language,kind)=>renderFestival(time,language,kind).filter(([method])=>method==='fillText').map(([,text])=>text);
  assert.ok(labels(0,'en','festival').includes('LIVE MUSIC · RZESZÓW'));
  for(const language of ['pl','en']) {
    const radio=labels(0,language,'radio');
    assert.ok(radio.includes('feniks.fm'));
    assert.ok(!radio.some(text=>/kulturalia/i.test(text)));
  }
});
