import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { DialoguePortrait, selectPortraitFrame, speechRevealCount } from '../career-drive/portrait.js';

const globalNames = ['document', 'window', 'ResizeObserver', 'Image', 'getComputedStyle', 'performance'];
const previousGlobals = new Map();
const portraits = [];
let clock;
let documentListeners;
let motionListeners;
let motionQuery;
let observers;
let imageAutoLoads;
let originalRandom;

function createClock() {
  let now = 0;
  let nextId = 1;
  const timers = new Map();
  return {
    get now() { return now; },
    get pending() { return timers.size; },
    setTimeout(callback, delay) {
      const id = nextId++;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    advance(milliseconds) {
      const target = now + milliseconds;
      let calls = 0;
      while (true) {
        const due = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!due) break;
        if (++calls > 10000) throw new Error('A portrait timer did not settle.');
        now = due[1].at;
        timers.delete(due[0]);
        due[1].callback();
      }
      now = target;
    }
  };
}

function createCanvas() {
  const frames = [];
  return {
    frames,
    width: 0,
    height: 0,
    hidden: false,
    dataset: {},
    setAttribute() {},
    getBoundingClientRect: () => ({ width: 400, height: 570 }),
    getContext: () => ({
      setTransform() {},
      clearRect() {},
      drawImage(_sprite, x, y, width, height) { frames.push(Math.round(x / width) + Math.round(y / height) * 3); }
    }),
    remove() { this.removed = true; }
  };
}

function createPortrait(options) {
  const classes = new Set();
  const fallback = {
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    after(canvas) { this.canvas = canvas; }
  };
  const portrait = new DialoguePortrait(fallback, options);
  portraits.push(portrait);
  return { portrait, canvas: fallback.canvas, classes };
}

beforeEach(() => {
  for (const name of globalNames) previousGlobals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  clock = createClock();
  documentListeners = new Map();
  motionListeners = new Set();
  observers = [];
  imageAutoLoads = true;
  motionQuery = {
    matches: false,
    addEventListener: (_type, callback) => motionListeners.add(callback),
    removeEventListener: (_type, callback) => motionListeners.delete(callback)
  };
  originalRandom = Math.random;
  Math.random = () => .5;
  Object.assign(globalThis, {
    document: {
      hidden: false,
      createElement: () => createCanvas(),
      addEventListener(type, callback) {
        const listeners = documentListeners.get(type) ?? new Set();
        listeners.add(callback);
        documentListeners.set(type, listeners);
      },
      removeEventListener: (type, callback) => documentListeners.get(type)?.delete(callback)
    },
    window: {
      devicePixelRatio: 2,
      matchMedia: () => motionQuery,
      setTimeout: clock.setTimeout,
      clearTimeout: clock.clearTimeout
    },
    ResizeObserver: class {
      constructor() { observers.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    },
    Image: class {
      naturalWidth = 2304;
      naturalHeight = 2048;
      set src(value) { this.url = value; if (imageAutoLoads) this.onload?.(); }
    },
    getComputedStyle: () => ({ objectPosition: '50% 20%' })
  });
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => clock.now } });
});

afterEach(() => {
  for (const portrait of portraits.splice(0)) portrait.destroy();
  assert.equal(clock.pending, 0, 'destroy must leave no pending portrait timer');
  Math.random = originalRandom;
  for (const [name, descriptor] of previousGlobals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

test('expressions use their matching resting and talking faces, with a closed-eye blink frame', () => {
  assert.equal(selectPortraitFrame('neutral', false, false), 0);
  assert.equal(selectPortraitFrame('neutral', true, false), 2);
  assert.equal(selectPortraitFrame('friendly', false, false), 3);
  assert.equal(selectPortraitFrame('friendly', true, false), 4);
  assert.equal(selectPortraitFrame('thoughtful', false, false), 5);
  assert.equal(selectPortraitFrame('thoughtful', true, false), 2);
  assert.equal(selectPortraitFrame('proud', false, false), 3);
  for (const emotion of ['neutral', 'friendly', 'thoughtful', 'proud']) assert.equal(selectPortraitFrame(emotion, true, true), 1);
});

test('dialogue reveal is bounded by elapsed time and keeps Unicode characters intact', () => {
  assert.equal(speechRevealCount(8, -100), 0);
  assert.equal(speechRevealCount(8, 48), 2);
  assert.equal(speechRevealCount(8, 10000), 8);
  const { portrait } = createPortrait();
  const revealed = [];
  let completions = 0;
  portrait.setActive(true);
  portrait.speak('Cześć 🚗!', { onText: text => revealed.push(text), onComplete: () => completions++ });
  clock.advance(64);
  assert.equal(revealed.at(-1), 'Cz');
  clock.advance(500);
  assert.equal(revealed.at(-1), 'Cześć 🚗!');
  assert.ok(revealed.every(text => !/[\uD800-\uDBFF]$/u.test(text)), 'the typewriter must not reveal half an emoji');
  assert.equal(completions, 1);
  assert.equal(portrait.getState().speaking, false);
});

test('mouth frames alternate while a passage is revealed and settle after it finishes', () => {
  const { portrait, canvas } = createPortrait();
  portrait.setActive(true);
  portrait.speak('A'.repeat(100), { emotion: 'friendly' });
  clock.advance(170);
  assert.equal(portrait.getState().speaking, true);
  assert.equal(canvas.dataset.frame, '4');
  clock.advance(200);
  assert.equal(canvas.dataset.frame, '3');
  assert.ok(canvas.frames.includes(4));
  assert.ok(canvas.frames.includes(3));
  clock.advance(2300);
  assert.equal(portrait.getState().speaking, false);
  assert.equal(canvas.dataset.frame, '3');
});

test('progressive reveal reports only new Unicode characters after each displayed text update', () => {
  const { portrait } = createPortrait();
  const chunks = [];
  let displayed = '';
  portrait.setActive(true);
  portrait.speak('Cześć 🚗!', {
    onText: text => { displayed = text; },
    onReveal: characters => {
      chunks.push(characters);
      assert.equal(displayed, chunks.join(''));
    }
  });
  assert.deepEqual(chunks, [], 'the initial empty passage does not make a reveal event');
  clock.advance(64);
  assert.deepEqual(chunks, ['C', 'z']);
  clock.advance(500);
  assert.equal(chunks.join(''), 'Cześć 🚗!');
  assert.ok(chunks.every(chunk => chunk.length > 0 && !/[\uD800-\uDBFF]$/u.test(chunk)));
  assert.equal(portrait.onReveal, undefined, 'a completed passage releases its callback');
});

test('skipping a passage reveals its remainder without emitting a catch-up reveal event', () => {
  const { portrait } = createPortrait();
  const chunks = [];
  portrait.setActive(true);
  portrait.speak('A longer passage to finish immediately.', { onReveal: characters => chunks.push(characters) });
  clock.advance(96);
  const beforeSkip = [...chunks];
  portrait.skip();
  clock.advance(1000);
  assert.deepEqual(chunks, beforeSkip);
  assert.equal(portrait.onReveal, undefined);
});

test('instant text under disabled animation, reduced motion, inactivity or hidden visibility has no reveal events', () => {
  const { portrait } = createPortrait();
  let reveals = 0;
  let displayed = '';
  const options = { onText: text => { displayed = text; }, onReveal: () => reveals++ };
  portrait.speak('Inactive.', options);
  assert.equal(displayed, 'Inactive.');
  portrait.setActive(true);
  portrait.setAnimationsEnabled(false);
  portrait.speak('Animation disabled.', options);
  assert.equal(displayed, 'Animation disabled.');
  portrait.setAnimationsEnabled(true);
  portrait.setReducedMotion(true);
  portrait.speak('Reduced motion.', options);
  assert.equal(displayed, 'Reduced motion.');
  portrait.setReducedMotion(false);
  document.hidden = true;
  portrait.speak('Hidden.', options);
  assert.equal(displayed, 'Hidden.');
  clock.advance(1000);
  assert.equal(reveals, 0);
  assert.equal(portrait.onReveal, undefined);
});

test('closing, hiding, replacing or disabling a running passage never emits its trailing characters', () => {
  for (const interruption of ['close', 'hidden', 'replace', 'disable', 'destroy']) {
    document.hidden = false;
    const { portrait } = createPortrait();
    const chunks = [];
    portrait.setActive(true);
    portrait.speak('A long passage interrupted before its ending.', { onReveal: characters => chunks.push(characters) });
    clock.advance(96);
    const beforeInterruption = [...chunks];
    if (interruption === 'close') portrait.setActive(false);
    if (interruption === 'hidden') {
      document.hidden = true;
      for (const callback of documentListeners.get('visibilitychange')) callback();
    }
    if (interruption === 'replace') portrait.speak('Replacement.');
    if (interruption === 'disable') portrait.setAnimationsEnabled(false);
    if (interruption === 'destroy') portrait.destroy();
    clock.advance(1000);
    assert.deepEqual(chunks, beforeInterruption, interruption);
    assert.equal(portrait.onReveal, undefined, interruption);
    portrait.setActive(false);
  }
});

test('idle blinking closes the eyes briefly and restores the current expression', () => {
  const { portrait, canvas } = createPortrait();
  portrait.setEmotion('thoughtful');
  portrait.setActive(true);
  assert.equal(canvas.dataset.frame, '5');
  clock.advance(4200);
  assert.equal(canvas.dataset.frame, '1');
  portrait.setActive(true);
  clock.advance(130);
  assert.equal(canvas.dataset.frame, '5');
  assert.equal(clock.pending, 1, 'there should be one future blink, not duplicate blink loops');
});

test('skipping reveals the full passage once and stops its mouth animation', () => {
  const { portrait, canvas } = createPortrait();
  let completions = 0;
  const revealed = [];
  portrait.setActive(true);
  portrait.speak('Jeszcze długa droga przed nami.', { onText: text => revealed.push(text), onComplete: () => completions++ });
  clock.advance(160);
  portrait.skip();
  const callbackCount = revealed.length;
  portrait.skip();
  clock.advance(1000);
  assert.equal(revealed.at(-1), 'Jeszcze długa droga przed nami.');
  assert.equal(revealed.length, callbackCount);
  assert.equal(completions, 1);
  assert.equal(canvas.dataset.speaking, 'false');
  assert.equal(canvas.dataset.frame, '3');
});

test('disabled animation shows the full text and a static open-eye expression', () => {
  const { portrait, canvas } = createPortrait({ animationsEnabled: false });
  const revealed = [];
  let completions = 0;
  portrait.setActive(true);
  portrait.speak('Everything is available immediately.', { emotion: 'thoughtful', onText: text => revealed.push(text), onComplete: () => completions++ });
  assert.deepEqual(revealed, ['Everything is available immediately.']);
  assert.equal(completions, 1);
  assert.equal(canvas.dataset.frame, '5');
  assert.equal(portrait.getState().animationsEnabled, false);
  assert.equal(clock.pending, 0);
});

test('system and explicit reduced-motion preferences cannot start portrait timers', () => {
  motionQuery.matches = true;
  const first = createPortrait();
  first.portrait.setActive(true);
  first.portrait.setAnimationsEnabled(true);
  let text = '';
  first.portrait.speak('System preference', { onText: value => { text = value; } });
  assert.equal(text, 'System preference');
  assert.equal(first.portrait.getState().animationsEnabled, false);
  assert.equal(clock.pending, 0);

  motionQuery.matches = false;
  const second = createPortrait();
  second.portrait.setReducedMotion(true);
  second.portrait.setActive(true);
  second.portrait.speak('Explicit preference', { onText: value => { text = value; } });
  assert.equal(text, 'Explicit preference');
  assert.equal(second.portrait.getState().animationsEnabled, false);
  assert.equal(second.canvas.dataset.frame, '3');
  assert.equal(clock.pending, 0);
});

test('switching animation off during speech reveals its remainder and clears movement timers', () => {
  const { portrait, canvas } = createPortrait();
  const revealed = [];
  let completions = 0;
  portrait.setActive(true);
  portrait.speak('A longer passage to interrupt.', { onText: text => revealed.push(text), onComplete: () => completions++ });
  clock.advance(170);
  assert.equal(canvas.dataset.frame, '4');
  portrait.setAnimationsEnabled(false);
  assert.equal(revealed.at(-1), 'A longer passage to interrupt.');
  assert.equal(completions, 1);
  assert.equal(canvas.dataset.frame, '3');
  assert.equal(clock.pending, 0);
});

test('closing a portrait cancels callbacks and both speech and blink timers', () => {
  const { portrait, canvas } = createPortrait();
  const revealed = [];
  let completions = 0;
  portrait.setActive(true);
  portrait.speak('A passage that must not update a closed dialog.', { onText: text => revealed.push(text), onComplete: () => completions++ });
  clock.advance(96);
  portrait.setActive(false);
  const callbackCount = revealed.length;
  clock.advance(10000);
  assert.equal(revealed.length, callbackCount);
  assert.equal(completions, 0);
  assert.equal(canvas.dataset.speaking, 'false');
  assert.equal(canvas.dataset.frame, '3');
  assert.equal(portrait.speechTimer, null);
  assert.equal(portrait.blinkTimer, null);
  assert.equal(portrait.blinkEndTimer, null);
  assert.equal(clock.pending, 0);
});

test('starting another answer cannot complete or reveal the previous passage later', () => {
  const { portrait } = createPortrait();
  let oldCompletions = 0;
  let newCompletions = 0;
  const oldText = [];
  const newText = [];
  portrait.setActive(true);
  portrait.speak('This original answer is much longer.', { onText: text => oldText.push(text), onComplete: () => oldCompletions++ });
  clock.advance(96);
  const oldCallbacks = oldText.length;
  portrait.speak('Nowa.', { emotion: 'thoughtful', onText: text => newText.push(text), onComplete: () => newCompletions++ });
  clock.advance(2000);
  assert.equal(oldText.length, oldCallbacks);
  assert.equal(oldCompletions, 0);
  assert.equal(newText.at(-1), 'Nowa.');
  assert.equal(newCompletions, 1);
  assert.equal(portrait.getState().expression, 'thoughtful');
});

test('a hidden tab finishes text and stops animation until visibility returns', () => {
  const { portrait, canvas } = createPortrait();
  let revealed = '';
  portrait.setActive(true);
  portrait.speak('Finish this passage safely.', { onText: text => { revealed = text; } });
  clock.advance(160);
  document.hidden = true;
  for (const callback of documentListeners.get('visibilitychange')) callback();
  assert.equal(revealed, 'Finish this passage safely.');
  assert.equal(canvas.dataset.frame, '3');
  assert.equal(clock.pending, 0);
  document.hidden = false;
  for (const callback of documentListeners.get('visibilitychange')) callback();
  assert.equal(clock.pending, 1);
});

test('a failed sprite keeps the original image visible and leaves dialogue usable', () => {
  imageAutoLoads = false;
  const { portrait, canvas, classes } = createPortrait();
  portrait.sprite.onerror();
  assert.equal(portrait.getState().ready, false);
  assert.equal(canvas.hidden, true);
  assert.equal(classes.has('portrait-is-animated'), false);
  let revealed = '';
  portrait.setAnimationsEnabled(false);
  portrait.setActive(true);
  portrait.speak('Fallback dialogue.', { onText: text => { revealed = text; } });
  assert.equal(revealed, 'Fallback dialogue.');
});

test('destroy restores the fallback image and removes timers, observers, listeners and canvas', () => {
  const { portrait, canvas, classes } = createPortrait();
  portrait.setActive(true);
  portrait.speak('A passage during teardown.');
  assert.equal(classes.has('portrait-is-animated'), true);
  assert.equal(documentListeners.get('visibilitychange').size, 1);
  assert.equal(motionListeners.size, 1);
  portrait.destroy();
  assert.equal(classes.has('portrait-is-animated'), false);
  assert.equal(canvas.removed, true);
  assert.ok(observers.every(observer => observer.disconnected));
  assert.equal(documentListeners.get('visibilitychange').size, 0);
  assert.equal(motionListeners.size, 0);
  assert.equal(clock.pending, 0);
  clock.advance(10000);
  assert.equal(clock.pending, 0);
});
