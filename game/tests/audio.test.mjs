import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DriveAudio } from '../career-drive/audio.js';

class Parameter {
  constructor(value = 0) { this.value = value; this.events = []; }
  setValueAtTime(value, time) { this.value = value; this.events.push({ type: 'set', value, time }); }
  setTargetAtTime(value, time, constant) { this.value = value; this.events.push({ type: 'target', value, time, constant }); }
  linearRampToValueAtTime(value, time) { this.value = value; this.events.push({ type: 'linear', value, time }); }
  exponentialRampToValueAtTime(value, time) { this.value = value; this.events.push({ type: 'exponential', value, time }); }
}

class AudioNodeFake {
  constructor(context, type) {
    this.context = context;
    this.kind = type;
    this.connections = [];
    this.frequency = new Parameter();
    this.gain = new Parameter(1);
    this.Q = new Parameter();
    this.threshold = new Parameter();
    this.knee = new Parameter();
    this.ratio = new Parameter();
    this.attack = new Parameter();
    this.release = new Parameter();
    this.endAt = Infinity;
    this.disconnected = false;
    this.ended = false;
    context.nodes.push(this);
  }
  connect(destination) { this.connections.push(destination); return destination; }
  disconnect() { this.disconnected = true; this.connections = []; }
  setPeriodicWave(wave) { this.wave = wave; }
  start(time = this.context.currentTime) { this.startAt = time; }
  stop(time = this.context.currentTime) {
    this.endAt = time;
    if (time <= this.context.currentTime) this.finish();
  }
  finish() { if (!this.ended) { this.ended = true; this.onended?.(); } }
}

class AudioContextFake {
  constructor(options = {}) {
    this.options = options;
    this.nodes = [];
    this.sampleRate = 4000;
    this.currentTime = 0;
    this.state = 'suspended';
    this.destination = new AudioNodeFake(this, 'destination');
    this.listeners = new Map();
    this.resumeCalls = 0;
    this.closeCalls = 0;
  }
  createGain() { return new AudioNodeFake(this, 'gain'); }
  createOscillator() { return new AudioNodeFake(this, 'oscillator'); }
  createBufferSource() { return new AudioNodeFake(this, 'bufferSource'); }
  createBiquadFilter() { return new AudioNodeFake(this, 'filter'); }
  createDynamicsCompressor() { return new AudioNodeFake(this, 'compressor'); }
  createPeriodicWave(real, imaginary) { return { real, imaginary }; }
  createBuffer(_channels, length) { const samples = new Float32Array(length); return { getChannelData: () => samples }; }
  addEventListener(type, callback) { this.listeners.set(type, callback); }
  removeEventListener(type) { this.listeners.delete(type); }
  changeState(state) { this.state = state; this.listeners.get('statechange')?.(); }
  resume() {
    this.resumeCalls += 1;
    if (this.options.failResume) return Promise.reject(new Error('Audio playback was denied.'));
    if (this.options.deferResume) return new Promise(resolve => {
      this.finishResume = () => { if (this.state !== 'closed') this.changeState('running'); resolve(); };
    });
    this.changeState('running');
    return Promise.resolve();
  }
  close() { this.closeCalls += 1; this.changeState('closed'); return Promise.resolve(); }
  endVoices() {
    for (const node of this.nodes) if (node.endAt <= this.currentTime) node.finish();
  }
}

function createAudio(context, options = {}) {
  let now = 0;
  let timerId = 0;
  let factories = 0;
  const timers = new Map();
  const visibilityListeners = new Map();
  const visibility = {
    hidden: false,
    addEventListener: (type, callback) => visibilityListeners.set(type, callback),
    removeEventListener: type => visibilityListeners.delete(type),
    setHidden(hidden) { this.hidden = hidden; visibilityListeners.get('visibilitychange')?.(); }
  };
  const audio = new DriveAudio({
    effectsEnabled: false,
    musicEnabled: false,
    contextFactory: () => { factories += 1; return context; },
    visibility,
    setTimer(callback, delay) { const id = ++timerId; timers.set(id, { callback, time: now + delay }); return id; },
    clearTimer: id => timers.delete(id),
    ...options
  });
  return {
    audio, visibility, timers, visibilityListeners,
    get factories() { return factories; },
    advance(milliseconds) {
      const end = now + milliseconds;
      let calls = 0;
      while (true) {
        const due = [...timers.entries()].filter(([, timer]) => timer.time <= end).sort((a, b) => a[1].time - b[1].time)[0];
        if (!due) break;
        if (++calls > 10000) throw new Error('Audio scheduling did not settle.');
        now = due[1].time;
        context.currentTime = now / 1000;
        context.endVoices();
        timers.delete(due[0]);
        due[1].callback();
      }
      now = end;
      context.currentTime = now / 1000;
      context.endVoices();
    }
  };
}

const driving = { vehicle: 'taxi', speed: 40, throttle: true, braking: false, steering: 0, drifting: false, paused: false };

test('saved mute preferences create neither an audio context nor background music', context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  harness.audio.updateMotion(driving);
  harness.audio.horn();
  harness.audio.chime();
  assert.equal(harness.factories, 0);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, false);
});

test('audio defaults to both channels enabled without creating a context before a gesture', context => {
  const harness = createAudio(new AudioContextFake(), { effectsEnabled: undefined, musicEnabled: undefined });
  context.after(() => harness.audio.destroy());
  harness.audio.updateMotion(driving);
  harness.audio.horn();
  harness.audio.chime();
  assert.equal(harness.audio.getState().effectsEnabled, true);
  assert.equal(harness.audio.getState().musicEnabled, true);
  assert.equal(harness.audio.getState().running, false);
  assert.equal(harness.factories, 0);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
});

test('the first unlock starts the selected engine and music through one shared context', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext, { effectsEnabled: undefined, musicEnabled: undefined });
  context.after(() => harness.audio.destroy());
  harness.audio.updateMotion(driving);
  assert.equal(await harness.audio.unlock(), true);
  assert.equal(harness.factories, 1);
  assert.equal(synthContext.resumeCalls, 1);
  assert.equal(harness.audio.getState().running, true);
  assert.ok(harness.audio.engineGain.gain.value > 0);
  assert.ok(harness.audio.effectsBus.gain.value > 0);
  assert.ok(harness.audio.musicBus.gain.value > 0);
  assert.ok(harness.audio.getState().voices > 0);
  assert.equal(harness.timers.size, 1);
});

test('automatic unlock respects each independently restored mute preference', async () => {
  for (const effectsEnabled of [false, true]) {
    const harness = createAudio(new AudioContextFake(), { effectsEnabled, musicEnabled: !effectsEnabled });
    try {
      harness.audio.updateMotion(driving);
      assert.equal(await harness.audio.unlock(), true);
      assert.equal(harness.audio.getState().effectsEnabled, effectsEnabled);
      assert.equal(harness.audio.getState().musicEnabled, !effectsEnabled);
      assert.equal(harness.audio.effectsBus.gain.value > 0, effectsEnabled);
      assert.equal(harness.audio.engineGain.gain.value > 0, effectsEnabled);
      assert.equal(harness.audio.musicBus.gain.value > 0, !effectsEnabled);
      assert.equal(harness.timers.size, effectsEnabled ? 0 : 1);
    } finally { harness.audio.destroy(); }
  }
});

test('unlock never creates audio while both muted, hidden or already destroyed', async () => {
  for (const condition of ['muted', 'hidden', 'destroyed']) {
    const harness = createAudio(new AudioContextFake(), { effectsEnabled: condition !== 'muted', musicEnabled: condition !== 'muted' });
    try {
      if (condition === 'hidden') harness.visibility.setHidden(true);
      if (condition === 'destroyed') harness.audio.destroy();
      assert.equal(await harness.audio.unlock(), false, condition);
      assert.equal(harness.factories, 0, condition);
      assert.equal(harness.timers.size, 0, condition);
      assert.equal(harness.audio.getState().voices, 0, condition);
    } finally { harness.audio.destroy(); }
  }
});

test('muting during automatic unlock stays muted after the browser finishes resuming', async context => {
  const synthContext = new AudioContextFake({ deferResume: true });
  const harness = createAudio(synthContext, { effectsEnabled: true, musicEnabled: true });
  context.after(() => harness.audio.destroy());
  harness.audio.updateMotion(driving);
  const pending = harness.audio.unlock();
  harness.audio.setEffectsEnabled(false);
  harness.audio.setMusicEnabled(false);
  synthContext.finishResume();
  await pending;
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, false);
  assert.equal(harness.audio.getState().running, false);
  assert.equal(harness.audio.engineGain.gain.value, 0);
  assert.equal(harness.audio.effectsBus.gain.value, 0);
  assert.equal(harness.audio.musicBus.gain.value, 0);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
});

test('a blocked unlock preserves channel preferences and can retry on the next gesture', async context => {
  const synthContext = new AudioContextFake({ failResume: true });
  const harness = createAudio(synthContext, { effectsEnabled: true, musicEnabled: true });
  context.after(() => harness.audio.destroy());
  assert.equal(await harness.audio.unlock(), false);
  assert.equal(harness.audio.getState().effectsEnabled, true);
  assert.equal(harness.audio.getState().musicEnabled, true);
  assert.equal(harness.audio.getState().running, false);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  synthContext.options.failResume = false;
  assert.equal(await harness.audio.unlock(), true);
  assert.equal(harness.factories, 1);
  assert.equal(synthContext.resumeCalls, 2);
  assert.equal(harness.audio.getState().running, true);
  assert.equal(harness.timers.size, 1);
});

test('unlock recovers an interrupted context without restoring a muted channel', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext, { effectsEnabled: true, musicEnabled: true });
  context.after(() => harness.audio.destroy());
  await harness.audio.unlock();
  harness.audio.setEffectsEnabled(false);
  synthContext.changeState('suspended');
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(await harness.audio.unlock(), true);
  assert.equal(synthContext.resumeCalls, 2);
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.effectsBus.gain.value, 0);
  assert.equal(harness.audio.getState().musicEnabled, true);
  assert.ok(harness.audio.musicBus.gain.value > 0);
  assert.equal(harness.timers.size, 1);
});

test('repeated gestures reuse the running context without duplicating music scheduling', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext, { effectsEnabled: true, musicEnabled: true });
  context.after(() => harness.audio.destroy());
  await harness.audio.unlock();
  const voices = harness.audio.getState().voices;
  for (const _gesture of Array.from({ length: 30 })) assert.equal(await harness.audio.unlock(), true);
  assert.equal(harness.factories, 1);
  assert.equal(synthContext.resumeCalls, 1);
  assert.equal(harness.timers.size, 1);
  assert.equal(harness.audio.getState().voices, voices);
  harness.audio.setEffectsEnabled(false);
  harness.audio.setMusicEnabled(false);
  await harness.audio.unlock();
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, false);
  assert.equal(harness.timers.size, 0);
});

test('effects and original music have independent buses, switches and a shared context', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  assert.equal(await harness.audio.enableEffects(), true);
  assert.equal(harness.factories, 1);
  assert.equal(harness.audio.getState().musicScheduled, false);
  assert.equal(await harness.audio.enableMusic(), true);
  assert.equal(harness.factories, 1);
  assert.equal(harness.timers.size, 1);
  assert.ok(harness.audio.getState().voices > 0);
  harness.audio.setEffectsEnabled(false);
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, true);
  assert.equal(harness.timers.size, 1);
  assert.equal(harness.audio.effectsBus.gain.value, 0);
  harness.audio.setMusicEnabled(false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
});

test('taxi, diesel and turbo engines have different harmonics and react to speed and throttle', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, speed: 4 });
  const taxiWave = harness.audio.engineOscillator.wave;
  const lowFrequency = harness.audio.engineOscillator.frequency.value;
  harness.audio.updateMotion({ ...driving, speed: 19 });
  assert.ok(harness.audio.engineOscillator.frequency.value > lowFrequency);
  const taxiGain = harness.audio.engineGain.gain.value;
  harness.audio.updateMotion({ ...driving, vehicle: 'cmax' });
  assert.notEqual(harness.audio.engineOscillator.wave, taxiWave);
  assert.ok(harness.audio.gritGain.gain.value > .01);
  assert.ok(harness.audio.rattleDepth.gain.value > 0);
  const dieselWave = harness.audio.engineOscillator.wave;
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 90 });
  assert.notEqual(harness.audio.engineOscillator.wave, dieselWave);
  assert.ok(harness.audio.engineGain.gain.value > taxiGain);
  assert.equal(harness.audio.rattleDepth.gain.value, 0);
  assert.equal(harness.audio.getState().engine, 'focus');
  assert.ok(harness.audio.getState().gear > 1);
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 90, throttle: false });
  assert.ok(harness.audio.engineGain.gain.value < taxiGain);
});

test('Focus has a deeper exhaust mix at matched driving input without changing four-cylinder ignition tracking', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  for (const [speed, throttle] of [[0, false], [40, true], [90, true]]) {
    const profiles = new Map();
    for (const vehicle of ['taxi', 'cmax', 'focus']) {
      harness.audio.updateMotion({ ...driving, vehicle, speed, throttle });
      assert.equal(harness.audio.engineOscillator.frequency.value, harness.audio.engineRpm / 30, vehicle);
      assert.equal(harness.audio.engineLowOscillator.frequency.value, harness.audio.engineRpm / 60, vehicle);
      profiles.set(vehicle, {
        bass: harness.audio.engineBassFilter.gain.value,
        lowMix: harness.audio.engineLowGain.gain.value,
        cutoff: harness.audio.engineFilter.frequency.value
      });
    }
    const focus = profiles.get('focus');
    assert.equal(harness.audio.engineBassFilter.type, 'lowshelf');
    assert.ok(harness.audio.engineBassFilter.frequency.value >= 80 && harness.audio.engineBassFilter.frequency.value <= 250);
    for (const vehicle of ['taxi', 'cmax']) {
      assert.ok(focus.bass > profiles.get(vehicle).bass, vehicle);
      assert.ok(focus.lowMix > profiles.get(vehicle).lowMix * 2, vehicle);
    }
    assert.ok(focus.cutoff < profiles.get('taxi').cutoff, 'the Focus exhaust has less high-frequency buzz');
    harness.audio.updateMotion({ ...driving, vehicle: 'taxi', speed, throttle });
    assert.equal(harness.audio.engineBassFilter.gain.value, profiles.get('taxi').bass, 'returning to taxi removes the ST bass shelf');
    assert.equal(harness.audio.engineLowGain.gain.value, profiles.get('taxi').lowMix, 'returning to taxi restores its original mix');
  }
});

test('engine shutdown and startup keep each vehicle’s bass profile consistent with its driving sound', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  for (const vehicle of ['taxi', 'cmax', 'focus']) {
    harness.audio.updateMotion({ ...driving, vehicle, speed: 0, throttle: false });
    const bassBoost = harness.audio.engineBassFilter.gain.value;
    for (const phase of ['shutdown', 'startup']) {
      harness.audio.engineIgnition(vehicle, phase, harness.audio.context.currentTime);
      const engineVoice = [...harness.audio.voices].find(voice => voice.source.wave === harness.audio.engineWaves[vehicle]);
      const bassFilter = engineVoice.nodes.find(node => node.type === 'lowshelf');
      assert.equal(bassFilter.gain.value, bassBoost, `${vehicle} ${phase}`);
      assert.ok(engineVoice.nodes.some(node => node.type === 'lowpass'));
      harness.advance(2000);
      assert.equal(harness.audio.getState().voices, 0);
    }
  }
});

test('dialogue typing requires explicit effects consent and never creates its own audio context', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  harness.audio.setDialogueActive(true);
  assert.equal(harness.audio.typewriterTick('Cześć'), false);
  assert.equal(harness.factories, 0);
  assert.equal(harness.timers.size, 0);
  await harness.audio.enableMusic();
  assert.equal(harness.audio.typewriterTick('A'), false, 'music consent does not enable typing effects');
  assert.ok([...harness.audio.voices].every(voice => voice.bus === 'music'));
  harness.audio.setMusicEnabled(false);
  await harness.audio.enableEffects();
  assert.equal(harness.audio.typewriterTick('Ż'), true);
  assert.equal(harness.factories, 1);
  harness.audio.setDialogueActive(false);
  assert.equal(harness.audio.typewriterTick('B'), false);
  assert.equal(harness.audio.getState().voices, 0);
});

test('typing can sound in a paused story while engine, travel music, horn and other effects stay silent', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  await harness.audio.enableMusic();
  harness.audio.updateMotion(driving);
  harness.audio.setDialogueActive(true);
  harness.audio.setPaused(true);
  assert.equal(harness.audio.typewriterTick('Dialogue'), true);
  assert.ok(harness.audio.dialogueBus.gain.value > 0);
  assert.equal(harness.audio.effectsBus.gain.value, 0);
  assert.equal(harness.audio.musicBus.gain.value, 0);
  assert.equal(harness.audio.engineGain.gain.value, 0);
  assert.equal(harness.audio.gritGain.gain.value, 0);
  assert.equal(harness.timers.size, 0);
  harness.audio.horn();
  harness.audio.chime();
  assert.equal(harness.audio.getState().hornCount, 0);
  assert.ok([...harness.audio.voices].every(voice => voice.bus === 'dialogue'));
  const voice = [...harness.audio.voices][0];
  assert.equal(voice.source.kind, 'bufferSource');
  assert.ok(voice.nodes.some(node => node.type === 'bandpass'));
  assert.ok(voice.source.endAt - voice.source.startAt < .05, 'a key click has a short bounded tail');
  harness.audio.stopTyping();
  assert.equal(harness.audio.getState().voices, 0, 'skipping a passage clears the current key click');
  assert.equal(voice.stopped, true);
  assert.ok(voice.nodes.every(node => node.disconnected));
});

test('typing accepts Unicode text, ignores separators, rate limits bursts and never schedules a catch-up backlog', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.setPaused(true);
  harness.audio.setDialogueActive(true);
  for (const characters of ['', ' ', '\n\t', '...?!-', '🚗']) assert.equal(harness.audio.typewriterTick(characters), false);
  assert.equal(harness.audio.typewriterTick('Żółć'), true);
  for (const _event of Array.from({ length: 100 })) assert.equal(harness.audio.typewriterTick('A'), false);
  assert.equal(harness.audio.getState().typingCount, 1);
  harness.advance(59);
  assert.equal(harness.audio.typewriterTick('B'), false);
  harness.advance(2);
  assert.equal(harness.audio.typewriterTick('日本'), true);
  harness.advance(10000);
  const before = harness.audio.getState().typingCount;
  assert.equal(harness.audio.typewriterTick('A long reveal chunk after a delayed frame '.repeat(100)), true);
  assert.equal(harness.audio.getState().typingCount, before + 1, 'one callback produces one click regardless of chunk length');
  assert.equal(harness.audio.getState().voices, 1);
  assert.equal(harness.timers.size, 0, 'typing uses no JavaScript scheduler');
  harness.advance(1000);
  assert.equal(harness.audio.getState().typingCount, before + 1, 'elapsed time alone cannot produce typing sounds');
  assert.equal(harness.audio.getState().voices, 0);
});

test('closing, hiding, muting, suspending or destroying dialogue playback cancels its click without a stale replay', async () => {
  for (const interruption of ['close', 'hidden', 'mute', 'suspended', 'destroy']) {
    const synthContext = new AudioContextFake();
    const harness = createAudio(synthContext);
    try {
      await harness.audio.enableEffects();
      harness.audio.setPaused(true);
      harness.audio.setDialogueActive(true);
      assert.equal(harness.audio.typewriterTick('A'), true);
      const click = [...harness.audio.voices][0];
      if (interruption === 'close') harness.audio.setDialogueActive(false);
      if (interruption === 'hidden') harness.visibility.setHidden(true);
      if (interruption === 'mute') harness.audio.setEffectsEnabled(false);
      if (interruption === 'suspended') synthContext.changeState('suspended');
      if (interruption === 'destroy') harness.audio.destroy();
      assert.equal(harness.audio.typewriterTick('B'), false, interruption);
      assert.equal(harness.audio.getState().voices, 0, interruption);
      assert.equal(click.stopped, true, interruption);
      assert.ok(click.nodes.every(node => node.disconnected), interruption);
      harness.advance(1000);
      if (interruption === 'destroy') continue;
      if (interruption === 'close') harness.audio.setDialogueActive(true);
      if (interruption === 'hidden') harness.visibility.setHidden(false);
      if (interruption === 'mute') await harness.audio.enableEffects();
      if (interruption === 'suspended') synthContext.changeState('running');
      assert.equal(harness.audio.getState().typingCount, 1, interruption);
      assert.equal(harness.audio.getState().voices, 0, interruption);
      assert.equal(harness.audio.typewriterTick('C'), true, `${interruption}: a fresh reveal is allowed`);
    } finally { harness.audio.destroy(); }
  }
});

test('garage handover shuts down the old engine before cranking the new one and crossfades back to idle', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, vehicle: 'cmax', speed: 0, throttle: false });
  assert.equal(harness.audio.vehicleSwap('taxi', 'cmax'), true);
  const voices = [...harness.audio.voices];
  const shutdown = voices.find(voice => voice.source.wave === harness.audio.engineWaves.taxi);
  const startup = voices.find(voice => voice.source.wave === harness.audio.engineWaves.cmax);
  const starter = voices.find(voice => voice.source.type === 'sawtooth');
  assert.equal(shutdown.source.startAt, 0);
  assert.equal(startup.source.startAt, .9);
  assert.ok(shutdown.source.endAt < starter.source.startAt);
  assert.equal(starter.source.startAt, startup.source.startAt);
  assert.ok(starter.source.endAt < startup.source.endAt);
  assert.ok(shutdown.source.frequency.events.at(-1).value < shutdown.source.frequency.events[0].value);
  assert.ok(startup.source.frequency.events.some(event => event.value > 780 / 30));
  assert.ok(voices.some(voice => voice.source.kind === 'bufferSource'), 'diesel mechanical rattle');
  assert.ok(voices.every(voice => voice.ignition && voice.bus === 'effects'));
  assert.equal(harness.audio.engineGain.gain.value, 0);
  assert.equal(harness.audio.gritGain.gain.value, 0);
  assert.equal(harness.audio.getState().engineRestarting, true);
  assert.equal(harness.timers.size, 0, 'ignition uses the audio clock without a timer');
  harness.advance(2100);
  harness.audio.updateMotion({ ...driving, vehicle: 'cmax', speed: 0, throttle: false });
  assert.equal(harness.audio.getState().engineRestarting, false);
  assert.equal(harness.audio.getState().voices, 0);
  assert.ok(harness.audio.engineGain.gain.value > 0);
  assert.ok(harness.audio.gritGain.gain.value > 0);
});

test('all garage swaps use the selected car profile, including reverse swaps and reduced-motion boarding', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  const crankLengths = new Map();
  for (const [previous, next] of [['cmax', 'focus'], ['focus', 'cmax'], ['cmax', 'taxi']]) {
    assert.equal(harness.audio.vehicleSwap(previous, next, false), true);
    const voices = [...harness.audio.voices];
    const shutdown = voices.find(voice => voice.source.wave === harness.audio.engineWaves[previous]);
    const startup = voices.find(voice => voice.source.wave === harness.audio.engineWaves[next]);
    const starter = voices.find(voice => voice.source.type === 'sawtooth');
    assert.ok(shutdown.source.endAt < startup.source.startAt);
    assert.ok(Math.abs(startup.source.startAt - shutdown.source.startAt - .62) < .00001);
    crankLengths.set(next, starter.source.endAt - starter.source.startAt);
    harness.advance(2000);
    assert.equal(harness.audio.getState().voices, 0);
  }
  assert.ok(crankLengths.get('cmax') > crankLengths.get('taxi'));
  assert.ok(crankLengths.get('taxi') > crankLengths.get('focus'));
});

test('boarding never enables effects and loading a saved vehicle does not play an ignition sequence', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  assert.equal(harness.audio.vehicleSwap('taxi', 'cmax'), false);
  assert.equal(harness.factories, 0);
  await harness.audio.enableMusic();
  assert.equal(harness.audio.vehicleSwap('taxi', 'cmax'), false);
  assert.ok([...harness.audio.voices].every(voice => voice.bus === 'music'));
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 0, throttle: false });
  assert.equal(harness.audio.getState().swapCount, 0);
  assert.equal(harness.audio.vehicleSwap('focus', 'focus'), false);
  assert.ok([...harness.audio.voices].every(voice => !voice.ignition));
});

test('mute, pause, hidden page, suspended context and destroy cancel even the future starter without replaying it', async () => {
  for (const interruption of ['mute', 'pause', 'hidden', 'suspended', 'destroy']) {
    const synthContext = new AudioContextFake();
    const harness = createAudio(synthContext);
    try {
      await harness.audio.enableEffects();
      harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 0, throttle: false });
      harness.audio.vehicleSwap('cmax', 'focus');
      const scheduled = [...harness.audio.voices];
      if (interruption === 'mute') harness.audio.setEffectsEnabled(false);
      if (interruption === 'pause') harness.audio.setPaused(true);
      if (interruption === 'hidden') harness.visibility.setHidden(true);
      if (interruption === 'suspended') synthContext.changeState('suspended');
      if (interruption === 'destroy') harness.audio.destroy();
      assert.equal(harness.audio.getState().engineRestarting, false, interruption);
      assert.equal(harness.audio.getState().voices, 0, interruption);
      assert.equal(harness.audio.vehicleSwap('cmax', 'focus'), false, interruption);
      assert.ok(scheduled.every(voice => voice.stopped && voice.nodes.every(node => node.disconnected)), interruption);
      harness.advance(3000);
      if (interruption === 'destroy') continue;
      if (interruption === 'mute') await harness.audio.enableEffects();
      if (interruption === 'pause') harness.audio.setPaused(false);
      if (interruption === 'hidden') harness.visibility.setHidden(false);
      if (interruption === 'suspended') synthContext.changeState('running');
      harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 0, throttle: false });
      assert.equal(harness.audio.getState().swapCount, 1, interruption);
      assert.equal(harness.audio.getState().voices, 0, interruption);
      assert.ok(harness.audio.engineGain.gain.value > 0, interruption);
    } finally { harness.audio.destroy(); }
  }
});

test('rapid repeat swaps replace the old ignition while keeping the independent music playing', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  await harness.audio.enableMusic();
  const music = [...harness.audio.voices];
  harness.audio.vehicleSwap('taxi', 'cmax');
  const firstSwap = [...harness.audio.voices].filter(voice => voice.ignition);
  harness.advance(100);
  harness.audio.vehicleSwap('cmax', 'taxi');
  assert.ok(firstSwap.every(voice => voice.stopped));
  assert.ok(music.every(voice => !voice.stopped));
  for (const index of Array.from({ length: 40 }, (_, index) => index)) {
    harness.audio.vehicleSwap(index % 2 ? 'cmax' : 'taxi', index % 2 ? 'taxi' : 'cmax');
    harness.advance(30);
    assert.ok([...harness.audio.voices].filter(voice => voice.ignition).length <= 4);
    assert.equal(harness.timers.size, 1);
  }
  harness.advance(2400);
  assert.ok([...harness.audio.voices].every(voice => !voice.ignition));
});

test('Focus lift-off triggers one bounded blow-off and exhaust-pop event above its speed threshold', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 1);
  const voices = harness.audio.getState().voices;
  for (const _event of Array.from({ length: 40 })) harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 1);
  assert.equal(harness.audio.getState().voices, voices);
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 1);
  harness.advance(900);
  assert.equal(harness.audio.getState().voices, 0);
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 2);
});

test('lift-off still sounds when the next telemetry sample has already slowed below the turbo threshold', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 46 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 40, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 1);
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 30, throttle: false });
  assert.equal(harness.audio.getState().releaseCount, 1);
});

test('muted, paused and non-Focus driving cannot create turbo-release or horn sounds', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  for (const vehicle of ['taxi', 'cmax']) {
    harness.audio.updateMotion({ ...driving, vehicle, speed: 80 });
    harness.audio.updateMotion({ ...driving, vehicle, speed: 80, throttle: false });
  }
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 10 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 10, throttle: false });
  harness.audio.setPaused(true);
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80 });
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 80, throttle: false });
  harness.audio.horn();
  assert.equal(harness.audio.getState().releaseCount, 0);
  assert.equal(harness.audio.getState().hornCount, 0);
  assert.equal(harness.audio.engineGain.gain.value, 0);
  harness.audio.setPaused(false);
  harness.audio.setEffectsEnabled(false);
  harness.audio.horn();
  assert.equal(harness.audio.getState().hornCount, 0);
});

test('horn repetition is rate limited and drift adds tyre friction without permanently overlapping voices', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  harness.audio.updateMotion({ ...driving, vehicle: 'focus', speed: 70, drifting: true, steering: .9 });
  assert.ok(harness.audio.tyreGain.gain.value > 0);
  for (const _event of Array.from({ length: 100 })) harness.audio.horn();
  assert.equal(harness.audio.getState().hornCount, 1);
  assert.equal(harness.audio.getState().voices, 2);
  harness.advance(400);
  assert.equal(harness.audio.getState().voices, 0);
  harness.audio.horn();
  assert.equal(harness.audio.getState().hornCount, 2);
  harness.audio.updateMotion({ ...driving, speed: 0 });
  assert.equal(harness.audio.tyreGain.gain.value, 0);
});

test('music schedules a bounded loop and removes finished voices over repeated phrases', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableMusic();
  harness.advance(120000);
  const state = harness.audio.getState();
  assert.equal(harness.timers.size, 1);
  assert.ok(state.voices > 0 && state.voices < 24);
  assert.ok(state.musicStep >= 0 && state.musicStep < 64);
  harness.audio.setMusicEnabled(false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
});

test('approaching the festival never enables audio or bypasses the independent music switch', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  harness.audio.setFestivalPresence(1);
  assert.equal(harness.factories, 0);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().musicTheme, 'festival');
  await harness.audio.enableEffects();
  harness.advance(1000);
  assert.equal(harness.audio.getState().musicEnabled, false);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  await harness.audio.enableMusic();
  harness.advance(500);
  assert.ok(harness.audio.getState().festivalStep > 0);
  assert.equal(harness.audio.getState().musicStep, 0);
  assert.equal(harness.factories, 1);
  harness.audio.setMusicEnabled(false);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  harness.audio.setFestivalPresence(.5);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().effectsEnabled, true);
});

test('festival proximity crossfades the two themes smoothly and restores the travel music on departure', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableMusic();
  harness.advance(400);
  harness.audio.setFestivalPresence(.25);
  assert.equal(harness.audio.travelMusicBus.gain.value, .75);
  assert.equal(harness.audio.festivalMusicBus.gain.value, .25);
  assert.ok(harness.audio.festivalMusicBus.gain.events.at(-1).constant >= .3);
  const distantCutoff = harness.audio.festivalFilter.frequency.value;
  harness.audio.setFestivalPresence(4);
  assert.equal(harness.audio.getState().festivalPresence, 1);
  assert.ok(harness.audio.festivalFilter.frequency.value > distantCutoff);
  assert.equal(harness.audio.travelMusicBus.gain.value, 0);
  const travelStep = harness.audio.getState().musicStep;
  harness.advance(4000);
  assert.equal(harness.audio.getState().musicStep, travelStep);
  assert.ok(harness.audio.getState().festivalStep > 0);
  assert.equal(harness.timers.size, 1);
  harness.audio.setFestivalPresence(-2);
  const festivalStep = harness.audio.getState().festivalStep;
  harness.advance(2000);
  assert.equal(harness.audio.getState().musicTheme, 'travel');
  assert.equal(harness.audio.getState().festivalStep, festivalStep);
  assert.notEqual(harness.audio.getState().musicStep, travelStep);
  assert.equal(harness.audio.travelMusicBus.gain.value, 1);
  assert.equal(harness.audio.festivalMusicBus.gain.value, 0);
  harness.audio.setFestivalPresence(NaN);
  assert.equal(harness.audio.getState().festivalPresence, 0);
  assert.equal(harness.timers.size, 1);
});

test('the concert has percussion and pitched instruments while the paused car stays silent', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  harness.audio.setFestivalPresence(1);
  await harness.audio.enableEffects();
  await harness.audio.enableMusic();
  harness.audio.updateMotion({ ...driving, paused: true });
  harness.advance(2200);
  assert.equal(harness.audio.engineGain.gain.value, 0);
  assert.equal(harness.audio.gritGain.gain.value, 0);
  assert.equal(harness.audio.tyreGain.gain.value, 0);
  assert.ok(synthContext.nodes.some(node => node.kind === 'bufferSource' && !node.loop && Number.isFinite(node.endAt)));
  assert.ok(synthContext.nodes.some(node => node.kind === 'oscillator' && node.type === 'sawtooth' && Number.isFinite(node.endAt)));
  assert.ok([...harness.audio.voices].every(voice => voice.bus === 'music'));
  harness.audio.setEffectsEnabled(false);
  assert.equal(harness.audio.getState().musicEnabled, true);
  assert.equal(harness.timers.size, 1);
  assert.ok(harness.audio.getState().voices > 0);
});

test('repeated festival transitions keep one bounded scheduler and silence on pause, hidden, mute and destroy', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  await harness.audio.enableMusic();
  let largestVoiceCount = 0;
  for (const index of Array.from({ length: 120 }, (_, index) => index)) {
    harness.audio.setFestivalPresence([0, .3, .7, 1][index % 4]);
    harness.advance(1000);
    largestVoiceCount = Math.max(largestVoiceCount, harness.audio.getState().voices);
    assert.equal(harness.timers.size, 1);
  }
  assert.ok(largestVoiceCount > 0 && largestVoiceCount < 40);
  harness.audio.setFestivalPresence(1);
  harness.audio.setPaused(true);
  const step = harness.audio.getState().festivalStep;
  harness.advance(5000);
  assert.equal(harness.audio.getState().festivalStep, step);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.audio.musicBus.gain.value, 0);
  assert.equal(harness.timers.size, 0);
  harness.audio.setPaused(false);
  harness.advance(500);
  assert.ok(harness.audio.getState().voices > 0);
  harness.visibility.setHidden(true);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  harness.visibility.setHidden(false);
  harness.audio.setMusicEnabled(false);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  await harness.audio.enableMusic();
  harness.audio.destroy();
  harness.audio.setFestivalPresence(.4);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().running, false);
  assert.ok(synthContext.nodes.filter(node => node.kind !== 'destination').every(node => node.disconnected));
});

test('hiding a page or pausing stops scheduled voices, engine gain and music timers until resumed', async context => {
  const harness = createAudio(new AudioContextFake());
  context.after(() => harness.audio.destroy());
  await harness.audio.enableEffects();
  await harness.audio.enableMusic();
  harness.audio.updateMotion(driving);
  harness.audio.horn();
  harness.visibility.setHidden(true);
  const pausedStep = harness.audio.getState().musicStep;
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.audio.getState().running, false);
  assert.equal(harness.audio.engineGain.gain.value, 0);
  assert.equal(harness.audio.effectsBus.gain.value, 0);
  assert.equal(harness.timers.size, 0);
  harness.advance(60000);
  assert.equal(harness.audio.getState().musicStep, pausedStep);
  harness.visibility.setHidden(false);
  assert.equal(harness.audio.getState().running, true);
  assert.equal(harness.timers.size, 1);
  harness.audio.setPaused(true);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.timers.size, 0);
  harness.audio.setPaused(false);
  assert.equal(harness.timers.size, 1);
});

test('rapidly disabling an enable request cannot turn effects or music back on after resume resolves', async context => {
  const synthContext = new AudioContextFake({ deferResume: true });
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  const effects = harness.audio.enableEffects();
  const music = harness.audio.enableMusic();
  harness.audio.setEffectsEnabled(false);
  harness.audio.setMusicEnabled(false);
  assert.equal(synthContext.resumeCalls, 1);
  synthContext.finishResume();
  assert.equal(await effects, false);
  assert.equal(await music, false);
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, false);
  assert.equal(harness.audio.getState().running, false);
  assert.equal(harness.timers.size, 0);
});

test('unavailable audio and a rejected browser resume return a safe result without background timers', async context => {
  const denied = createAudio(new AudioContextFake({ failResume: true }));
  const missing = createAudio(new AudioContextFake(), { contextFactory: () => { throw new Error('Unavailable'); } });
  context.after(() => { denied.audio.destroy(); missing.audio.destroy(); });
  assert.equal(await denied.audio.enableEffects(), false);
  assert.equal(await missing.audio.enableMusic(), false);
  assert.equal(denied.audio.getState().effectsEnabled, false);
  assert.equal(missing.audio.getState().musicEnabled, false);
  assert.equal(missing.audio.getState().available, false);
  assert.equal(denied.timers.size, 0);
  assert.equal(missing.timers.size, 0);
});

test('interrupted context playback clears music scheduling and resumes only the selected channels', async context => {
  const synthContext = new AudioContextFake();
  const harness = createAudio(synthContext);
  context.after(() => harness.audio.destroy());
  await harness.audio.enableMusic();
  synthContext.changeState('suspended');
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.audio.getState().running, false);
  synthContext.changeState('running');
  assert.equal(harness.timers.size, 1);
  assert.equal(harness.audio.getState().effectsEnabled, false);
  assert.equal(harness.audio.getState().musicEnabled, true);
});

test('destroy removes all sources, listeners and timers, including during an unfinished resume', async () => {
  const synthContext = new AudioContextFake({ deferResume: true });
  const harness = createAudio(synthContext);
  const pending = harness.audio.enableMusic();
  harness.audio.destroy();
  harness.audio.destroy();
  synthContext.finishResume();
  assert.equal(await pending, false);
  assert.equal(synthContext.closeCalls, 1);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.visibilityListeners.size, 0);
  assert.equal(synthContext.listeners.size, 0);
  assert.equal(harness.audio.getState().voices, 0);
  assert.equal(harness.audio.getState().running, false);
  assert.ok(synthContext.nodes.filter(node => node.kind !== 'destination').every(node => node.disconnected));
  assert.equal(await harness.audio.enableEffects(), false);
});
