import assert from 'node:assert/strict';
import test from 'node:test';
import { createJoystickController, joystickSample } from '../career-drive/joystick.js';

const released = {forward:false,backward:false,left:false,right:false};

function createPad(options={}) {
  const listeners = new Map();
  const captured = new Set();
  const styles = new Map();
  const classes = new Set();
  const inputs = [];
  const element = {
    style:{setProperty:(key,value)=>styles.set(key,value)},
    classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
    getBoundingClientRect:()=>({left:10,top:20,width:100,height:100}),
    setPointerCapture:id=>captured.add(id),
    hasPointerCapture:id=>captured.has(id),
    releasePointerCapture:id=>captured.delete(id),
    addEventListener:(name,listener)=>listeners.set(name,listener),
    removeEventListener:(name,listener)=>{if(listeners.get(name)===listener)listeners.delete(name);},
  };
  const controller = createJoystickController(element,{onInput:input=>inputs.push(input),...options});
  return {
    controller,inputs,styles,classes,captured,listeners,
    dispatch(type,overrides={}) {
      let prevented = false;
      const event = {pointerId:1,isPrimary:true,button:0,clientX:60,clientY:70,preventDefault(){prevented=true;},...overrides};
      listeners.get(type)?.(event);
      return prevented;
    },
  };
}

test('the dead zone prevents accidental driving while a diagonal allows gas and steering together',()=>{
  assert.deepEqual(joystickSample(3,-4,32).input,released);
  assert.deepEqual(joystickSample(0,-7.68,32).input,released);
  assert.deepEqual(joystickSample(20,-20,32).input,{...released,forward:true,right:true});
  assert.deepEqual(joystickSample(-20,20,32).input,{...released,backward:true,left:true});
});

test('the thumb is clamped to the circular pad and invalid geometry releases the controls',()=>{
  const sample = joystickSample(300,-400,32);
  assert.ok(Math.abs(Math.hypot(sample.x,sample.y)-32)<1e-8);
  assert.deepEqual(sample.input,{...released,forward:true,right:true});
  for(const [x,y,radius] of [[NaN,0,32],[0,Infinity,32],[0,0,0],[0,0,-1]]) {
    assert.deepEqual(joystickSample(x,y,radius),{x:0,y:0,input:released});
  }
});

test('captured pointer movement drives outside the pad, then releasing returns the thumb and all controls to neutral',()=>{
  const pad = createPad();
  assert.equal(pad.dispatch('pointerdown',{clientY:40}),true);
  assert.ok(pad.captured.has(1));
  assert.ok(pad.classes.has('is-active'));
  assert.deepEqual(pad.inputs.at(-1),{...released,forward:true});
  assert.equal(pad.dispatch('pointermove',{clientX:300,clientY:-300}),true);
  assert.deepEqual(pad.inputs.at(-1),{...released,forward:true,right:true});
  pad.dispatch('pointerup');
  assert.deepEqual(pad.inputs.at(-1),released);
  assert.equal(pad.styles.get('--stick-x'),'0px');
  assert.equal(pad.styles.get('--stick-y'),'0px');
  assert.equal(pad.captured.size,0);
  assert.equal(pad.classes.has('is-active'),false);
  pad.dispatch('pointermove',{clientY:0});
  assert.deepEqual(pad.inputs.at(-1),released);
});

test('a second pointer cannot take over or release the active control',()=>{
  const pad = createPad();
  pad.dispatch('pointerdown',{clientY:40});
  assert.equal(pad.dispatch('pointerdown',{pointerId:2,isPrimary:false,clientY:100}),false);
  assert.equal(pad.dispatch('pointermove',{pointerId:2,clientY:100}),false);
  pad.dispatch('pointerup',{pointerId:2});
  assert.deepEqual(pad.inputs.at(-1),{...released,forward:true});
  assert.ok(pad.captured.has(1));
  pad.dispatch('pointercancel');
  assert.deepEqual(pad.inputs.at(-1),released);
});

test('cancellation and lost capture stop acceleration, while repeated equal directions do not spam callbacks',()=>{
  for(const event of ['pointercancel','lostpointercapture']) {
    const pad = createPad();
    pad.dispatch('pointerdown',{clientY:40});
    pad.dispatch('pointermove',{clientY:10});
    pad.dispatch('pointermove',{clientY:-100});
    assert.equal(pad.inputs.length,1);
    pad.dispatch(event);
    assert.deepEqual(pad.inputs.at(-1),released);
  }
});

test('the start callback can block a dialog gesture and runs before the first driving input',()=>{
  let allowed = false;
  const events = [];
  const pad = createPad({onStart(){events.push('start');return allowed;},onInput(){events.push('drive');}});
  assert.equal(pad.dispatch('pointerdown',{clientY:40}),false);
  assert.equal(pad.captured.size,0);
  assert.deepEqual(events,['start']);
  allowed = true;
  pad.dispatch('pointerdown',{clientY:40});
  assert.deepEqual(events,['start','start','drive']);
});

test('disable, reset and destroy prevent a held throttle from surviving a dialog or viewport change',()=>{
  const pad = createPad();
  pad.dispatch('pointerdown',{clientY:40});
  pad.controller.setEnabled(false);
  assert.deepEqual(pad.inputs.at(-1),released);
  assert.equal(pad.dispatch('pointerdown',{clientY:40}),false);
  pad.controller.setEnabled(true);
  pad.dispatch('pointerdown',{clientY:40});
  pad.controller.reset();
  assert.deepEqual(pad.inputs.at(-1),released);
  pad.dispatch('pointerdown',{clientY:40});
  pad.controller.destroy();
  pad.controller.destroy();
  assert.deepEqual(pad.inputs.at(-1),released);
  assert.equal(pad.listeners.size,0);
  assert.equal(pad.captured.size,0);
});

test('a second finger can use the joystick while another finger holds a separate action button',()=>{
  const pad = createPad();
  pad.dispatch('pointerdown',{pointerId:2,isPrimary:false,pointerType:'touch',clientY:40});
  assert.deepEqual(pad.inputs.at(-1),{...released,forward:true});
  assert.ok(pad.captured.has(2));
  pad.dispatch('pointerup',{pointerId:2,isPrimary:false,pointerType:'touch'});
  assert.deepEqual(pad.inputs.at(-1),released);
});

test('secondary mouse buttons never start driving',()=>{
  const pad = createPad({onStart(){throw new Error('unexpected start');}});
  assert.equal(pad.dispatch('pointerdown',{button:2}),false);
  assert.equal(pad.inputs.length,0);
});
