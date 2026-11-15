// @ts-check

/** @typedef {'taxi'|'cmax'|'focus'} VehicleId */
/** @typedef {{vehicle:VehicleId,speed:number,throttle:boolean,braking:boolean,steering:number,drifting:boolean,paused:boolean}} DrivingMotion */
/** @typedef {{hidden:boolean,addEventListener:(type:string,listener:()=>void)=>void,removeEventListener:(type:string,listener:()=>void)=>void}} VisibilitySource */
/** @typedef {{effectsEnabled?:boolean,musicEnabled?:boolean,contextFactory?:()=>AudioContext,setTimer?:(callback:()=>void,delay:number)=>number,clearTimer?:(timer:number)=>void,visibility?:VisibilitySource|null}} DriveAudioOptions */
/** @typedef {'effects'|'music'|'dialogue'} AudioBus */
/** @typedef {{source:AudioScheduledSourceNode,nodes:AudioNode[],bus:AudioBus,stopped:boolean,ignition:boolean}} Voice */

const ENGINE_PROFILES = Object.freeze({
  taxi: { idle: 820, redline: 5700, tone: [0, 1, .35, .2, .09, .04], gain: .065, noise: .003, filter: 1350, throttleFilter:1450, lowGain:.27, bassBoost:0 },
  cmax: { idle: 780, redline: 4200, tone: [0, 1, .74, .44, .28, .18, .12, .08], gain: .075, noise: .011, filter: 1000, throttleFilter:1450, lowGain:.27, bassBoost:0 },
  focus: { idle: 900, redline: 6600, tone: [0, 1, .95, .62, .3, .13, .06, .025], gain: .09, noise: .004, filter: 1100, throttleFilter:800, lowGain:.72, bassBoost:6 }
});
const IGNITION_PROFILES = Object.freeze({
  taxi: { shutdown: .4, crank: .32, starter: 105, flare: 1500 },
  cmax: { shutdown: .55, crank: .5, starter: 78, flare: 1250 },
  focus: { shutdown: .46, crank: .26, starter: 125, flare: 1950 }
});
const MUSIC_CHORDS = Object.freeze([
  [48, 52, 55, 59, 62],
  [45, 48, 52, 55, 59],
  [41, 45, 48, 52, 55],
  [43, 47, 50, 55, 59]
]);
const MELODY = Object.freeze([2, 4, 3, 2, 1, 3, 4, 2]);

/** @param {number} value @param {number} minimum @param {number} maximum */
function clamp(value, minimum, maximum) { return Math.max(minimum, Math.min(maximum, value)); }
/** @param {number} note */
function noteFrequency(note) { return 440 * 2 ** ((note - 69) / 12); }

/** All sounds are original synthesis; the engine colours suggest each car without using recordings. */
export class DriveAudio {
  /** @param {DriveAudioOptions} [options] */
  constructor(options = {}) {
    this.contextFactory = options.contextFactory ?? (() => {
      const browser = /** @type {Window & {AudioContext?:typeof AudioContext,webkitAudioContext?:typeof AudioContext}} */ (window);
      const Context = browser.AudioContext ?? browser.webkitAudioContext;
      if (!Context) throw new Error('Web Audio is unavailable.');
      return new Context({ latencyHint: 'interactive' });
    });
    this.setTimer = options.setTimer ?? ((callback, delay) => window.setTimeout(callback, delay));
    this.clearTimer = options.clearTimer ?? (timer => window.clearTimeout(timer));
    this.visibility = options.visibility === undefined ? (typeof document === 'undefined' ? null : document) : options.visibility;
    /** @type {AudioContext|null} */
    this.context = null;
    /** @type {Promise<boolean>|null} */
    this.resuming = null;
    /** @type {boolean|null} */
    this.available = null;
    this.effectsEnabled = options.effectsEnabled ?? true;
    this.musicEnabled = options.musicEnabled ?? true;
    this.effectsRevision = 0;
    this.musicRevision = 0;
    this.paused = false;
    this.dialogueActive = false;
    this.destroyed = false;
    /** @type {DrivingMotion} */
    this.motion = { vehicle: 'taxi', speed: 0, throttle: false, braking: false, steering: 0, drifting: false, paused: true };
    this.engineRpm = 820;
    this.gear = 1;
    this.lastHorn = -Infinity;
    this.lastRelease = -Infinity;
    this.hornCount = 0;
    this.releaseCount = 0;
    this.swapCount = 0;
    this.engineRestartAt = 0;
    this.lastTyping = -Infinity;
    this.typingCount = 0;
    this.musicStep = 0;
    this.nextNoteTime = 0;
    this.festivalPresence = 0;
    this.festivalStep = 0;
    this.nextFestivalNoteTime = 0;
    this.musicTimer = 0;
    /** @type {Set<Voice>} */
    this.voices = new Set();
    /** @type {AudioNode[]} */
    this.engineNodes = [];
    /** @type {AudioScheduledSourceNode[]} */
    this.engineSources = [];
    /** @type {GainNode|null} */
    this.effectsBus = null;
    /** @type {GainNode|null} */
    this.dialogueBus = null;
    /** @type {GainNode|null} */
    this.musicBus = null;
    /** @type {GainNode|null} */
    this.travelMusicBus = null;
    /** @type {GainNode|null} */
    this.festivalMusicBus = null;
    /** @type {BiquadFilterNode|null} */
    this.festivalFilter = null;
    /** @type {GainNode|null} */
    this.engineGain = null;
    /** @type {GainNode|null} */
    this.engineLowGain = null;
    /** @type {BiquadFilterNode|null} */
    this.engineBassFilter = null;
    /** @type {GainNode|null} */
    this.gritGain = null;
    /** @type {GainNode|null} */
    this.windGain = null;
    /** @type {GainNode|null} */
    this.tyreGain = null;
    /** @type {GainNode|null} */
    this.rattleDepth = null;
    /** @type {OscillatorNode|null} */
    this.engineOscillator = null;
    /** @type {OscillatorNode|null} */
    this.engineLowOscillator = null;
    /** @type {OscillatorNode|null} */
    this.rattleOscillator = null;
    /** @type {BiquadFilterNode|null} */
    this.engineFilter = null;
    /** @type {AudioBuffer|null} */
    this.noiseBuffer = null;
    /** @type {Record<VehicleId,PeriodicWave>|null} */
    this.engineWaves = null;
    /** @type {VehicleId|null} */
    this.appliedVehicle = null;
    this.onVisibilityChange = () => this.refresh();
    this.onContextStateChange = () => this.refresh();
    this.visibility?.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  /** Resume from a user gesture without changing the player's saved mute choices. */
  async unlock() {
    if (this.destroyed || this.visibility?.hidden || (!this.effectsEnabled && !this.musicEnabled)) return false;
    if (this.context?.state === 'running') return true;
    const ready = await this.ensureContext();
    this.refresh();
    return ready;
  }

  /** Call in a click/key handler: an AudioContext is created only after this action. */
  async enableEffects() {
    if (this.destroyed) return false;
    const revision = ++this.effectsRevision;
    this.effectsEnabled = true;
    const ready = await this.ensureContext();
    if (this.destroyed || revision !== this.effectsRevision) return false;
    if (!ready) this.effectsEnabled = false;
    this.refresh();
    return ready && this.effectsEnabled;
  }

  /** @param {boolean} enabled */
  setEffectsEnabled(enabled) {
    if (enabled) { void this.enableEffects(); return; }
    ++this.effectsRevision;
    this.effectsEnabled = false;
    this.engineRestartAt = 0;
    this.stopVoices('effects');
    this.stopTyping();
    this.refresh();
  }

  /** Call in a click/key handler; the music switch is independent of effects. */
  async enableMusic() {
    if (this.destroyed) return false;
    const revision = ++this.musicRevision;
    this.musicEnabled = true;
    const ready = await this.ensureContext();
    if (this.destroyed || revision !== this.musicRevision) return false;
    if (!ready) this.musicEnabled = false;
    this.refresh();
    return ready && this.musicEnabled;
  }

  /** @param {boolean} enabled */
  setMusicEnabled(enabled) {
    if (enabled) { void this.enableMusic(); return; }
    ++this.musicRevision;
    this.musicEnabled = false;
    this.stopVoices('music');
    this.refresh();
  }

  /** Proximity changes the mix only and respects the music switch. @param {number} level */
  setFestivalPresence(level) {
    if (this.destroyed) return;
    const presence = Number.isFinite(level) ? clamp(level, 0, 1) : 0;
    if (this.festivalPresence === presence) return;
    this.festivalPresence = presence;
    this.updateMusicMix();
  }

  updateMusicMix() {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.travelMusicBus?.gain.setTargetAtTime(1 - this.festivalPresence, now, .35);
    this.festivalMusicBus?.gain.setTargetAtTime(this.festivalPresence, now, .35);
    this.festivalFilter?.frequency.setTargetAtTime(650 + this.festivalPresence * 4350, now, .4);
  }

  /** @param {boolean} paused */
  setPaused(paused) {
    if (this.paused === paused) return;
    this.paused = paused;
    this.refresh();
  }

  get audible() {
    return this.playbackReady && !this.paused;
  }

  get playbackReady() {
    return !this.destroyed && !this.visibility?.hidden && this.context?.state === 'running';
  }

  get dialogueAudible() {
    return this.playbackReady && this.dialogueActive;
  }

  /** Dialogue feedback has its own bus so the parked car and travel music stay paused. @param {boolean} active */
  setDialogueActive(active) {
    if (this.destroyed || this.dialogueActive === active) return;
    this.dialogueActive = active;
    this.refresh();
  }

  async ensureContext() {
    try {
      if (this.destroyed) return false;
      if (!this.context) {
        const context = this.contextFactory();
        this.context = context;
        this.buildGraph(context);
        context.addEventListener('statechange', this.onContextStateChange);
      }
      const context = this.context;
      if (!context) return false;
      if (context.state === 'closed') return false;
      if (context.state !== 'running') {
        this.resuming ??= context.resume().then(() => context.state === 'running').catch(() => false).finally(() => { this.resuming = null; });
        if (!await this.resuming) return false;
      }
      this.available = true;
      return !this.destroyed && context.state === 'running';
    } catch {
      this.available = false;
      this.disconnectGraph();
      const failedContext = this.context;
      this.context = null;
      if (failedContext && failedContext.state !== 'closed') void failedContext.close().catch(() => { this.available = false; });
      return false;
    }
  }

  /** @param {AudioContext} context */
  buildGraph(context) {
    const master = context.createGain();
    master.gain.value = .65;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    limiter.attack.value = .004;
    limiter.release.value = .16;
    master.connect(limiter).connect(context.destination);
    this.effectsBus = context.createGain();
    this.dialogueBus = context.createGain();
    this.musicBus = context.createGain();
    this.effectsBus.gain.value = 0;
    this.dialogueBus.gain.value = 0;
    this.musicBus.gain.value = 0;
    this.effectsBus.connect(master);
    this.dialogueBus.connect(master);
    this.musicBus.connect(master);
    this.engineNodes.push(master, limiter, this.effectsBus, this.dialogueBus, this.musicBus);
    this.travelMusicBus = context.createGain();
    this.festivalMusicBus = context.createGain();
    this.festivalFilter = context.createBiquadFilter();
    this.festivalFilter.type = 'lowpass';
    this.festivalFilter.Q.value = .5;
    this.travelMusicBus.gain.value = 1 - this.festivalPresence;
    this.festivalMusicBus.gain.value = this.festivalPresence;
    this.festivalFilter.frequency.value = 650 + this.festivalPresence * 4350;
    this.travelMusicBus.connect(this.musicBus);
    this.festivalMusicBus.connect(this.festivalFilter).connect(this.musicBus);
    this.engineNodes.push(this.travelMusicBus, this.festivalMusicBus, this.festivalFilter);

    this.noiseBuffer = context.createBuffer(1, Math.ceil(context.sampleRate * 2), context.sampleRate);
    const samples = this.noiseBuffer.getChannelData(0);
    let noiseSeed = 731;
    for (const index of samples.keys()) {
      noiseSeed = (noiseSeed * 16807) % 2147483647;
      samples[index] = noiseSeed / 1073741823.5 - 1;
    }
    const waves = Object.fromEntries(Object.entries(ENGINE_PROFILES).map(([id, profile]) => {
      const real = new Float32Array(profile.tone.length);
      return [id, context.createPeriodicWave(real, new Float32Array(profile.tone))];
    }));
    this.engineWaves = /** @type {Record<VehicleId,PeriodicWave>} */ (waves);
    this.engineOscillator = context.createOscillator();
    this.engineOscillator.setPeriodicWave(this.engineWaves.taxi);
    this.engineLowOscillator = context.createOscillator();
    this.engineLowOscillator.type = 'sine';
    this.engineLowGain = context.createGain();
    this.engineLowGain.gain.value = .27;
    this.engineBassFilter = context.createBiquadFilter();
    this.engineBassFilter.type = 'lowshelf';
    this.engineBassFilter.frequency.value = 160;
    this.engineBassFilter.gain.value = 0;
    this.engineGain = context.createGain();
    this.engineGain.gain.value = 0;
    this.engineFilter = context.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 1300;
    this.engineFilter.Q.value = .65;
    this.engineOscillator.connect(this.engineFilter);
    this.engineLowOscillator.connect(this.engineLowGain).connect(this.engineFilter);
    this.engineFilter.connect(this.engineBassFilter).connect(this.engineGain).connect(this.effectsBus);

    const grit = context.createBufferSource();
    grit.buffer = this.noiseBuffer;
    grit.loop = true;
    const gritFilter = context.createBiquadFilter();
    gritFilter.type = 'bandpass';
    gritFilter.frequency.value = 720;
    gritFilter.Q.value = .55;
    this.gritGain = context.createGain();
    this.gritGain.gain.value = 0;
    grit.connect(gritFilter).connect(this.gritGain).connect(this.effectsBus);
    this.rattleOscillator = context.createOscillator();
    this.rattleOscillator.type = 'sine';
    this.rattleDepth = context.createGain();
    this.rattleDepth.gain.value = 0;
    this.rattleOscillator.connect(this.rattleDepth).connect(this.gritGain.gain);

    const wind = context.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = context.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 430;
    this.windGain = context.createGain();
    this.windGain.gain.value = 0;
    wind.connect(windFilter).connect(this.windGain).connect(this.effectsBus);
    const tyres = context.createBufferSource();
    tyres.buffer = this.noiseBuffer;
    tyres.loop = true;
    const tyreFilter = context.createBiquadFilter();
    tyreFilter.type = 'bandpass';
    tyreFilter.frequency.value = 1650;
    tyreFilter.Q.value = .8;
    this.tyreGain = context.createGain();
    this.tyreGain.gain.value = 0;
    tyres.connect(tyreFilter).connect(this.tyreGain).connect(this.effectsBus);
    this.engineNodes.push(this.engineOscillator, this.engineLowOscillator, this.engineLowGain, this.engineBassFilter, this.engineFilter, this.engineGain, grit, gritFilter, this.gritGain, this.rattleOscillator, this.rattleDepth, wind, windFilter, this.windGain, tyres, tyreFilter, this.tyreGain);
    for (const source of [this.engineOscillator, this.engineLowOscillator, grit, this.rattleOscillator, wind, tyres]) {
      source.start();
      this.engineSources.push(source);
    }
    this.appliedVehicle = 'taxi';
  }

  /** @param {DrivingMotion} motion */
  updateMotion(motion) {
    const previous = this.motion;
    const vehicle = motion.vehicle in ENGINE_PROFILES ? motion.vehicle : 'taxi';
    const speed = Number.isFinite(motion.speed) ? clamp(Math.abs(motion.speed), 0, 280) : 0;
    this.motion = {
      vehicle, speed,
      throttle: motion.throttle === true,
      braking: motion.braking === true,
      steering: Number.isFinite(motion.steering) ? clamp(motion.steering, -1, 1) : 0,
      drifting: motion.drifting === true,
      paused: motion.paused === true
    };
    if (vehicle === 'focus' && previous.vehicle === 'focus' && previous.throttle && !this.motion.throttle && !previous.paused && !this.motion.paused && Math.max(speed,previous.speed) > 45 && this.audible && this.effectsEnabled) this.overrun();
    this.updateEngine();
  }

  updateEngine() {
    const context = this.context;
    const profile = ENGINE_PROFILES[this.motion.vehicle];
    const thresholds = this.motion.vehicle === 'cmax' ? [18, 38, 64, 96, 135, 190] : [22, 47, 79, 118, 165, 250];
    let gearIndex = thresholds.findIndex(speed => this.motion.speed < speed);
    if (gearIndex < 0) gearIndex = thresholds.length - 1;
    this.gear = gearIndex + 1;
    const bottom = gearIndex === 0 ? 0 : thresholds[gearIndex - 1];
    const gearProgress = clamp((this.motion.speed - bottom) / (thresholds[gearIndex] - bottom), 0, 1);
    this.engineRpm = this.motion.speed < 2 ? profile.idle + (this.motion.throttle ? 1100 : 0) : profile.idle + 850 + gearProgress * (profile.redline - profile.idle - 1200);
    if (!context || !this.engineOscillator || !this.engineLowOscillator || !this.engineFilter || !this.engineGain || !this.gritGain || !this.rattleDepth || !this.rattleOscillator || !this.tyreGain || !this.windGain) return;
    const now = context.currentTime;
    const active = this.audible && this.effectsEnabled && !this.motion.paused && now >= this.engineRestartAt;
    if (this.appliedVehicle !== this.motion.vehicle && this.engineWaves) {
      this.engineOscillator.setPeriodicWave(this.engineWaves[this.motion.vehicle]);
      this.appliedVehicle = this.motion.vehicle;
    }
    // Four-cylinder ignition pulses, with a lower mechanical note below the exhaust harmonics.
    const ignition = this.engineRpm / 30;
    this.engineOscillator.frequency.setTargetAtTime(ignition, now, .09);
    this.engineLowOscillator.frequency.setTargetAtTime(ignition / 2, now, .11);
    this.engineFilter.frequency.setTargetAtTime(profile.filter + (this.motion.throttle ? profile.throttleFilter : 150) + this.motion.speed * 4, now, .13);
    this.engineLowGain?.gain.setTargetAtTime(profile.lowGain, now, .12);
    this.engineBassFilter?.gain.setTargetAtTime(profile.bassBoost, now, .12);
    this.engineGain.gain.setTargetAtTime(active ? profile.gain * (this.motion.throttle ? 1 : .44) : 0, now, .07);
    this.gritGain.gain.setTargetAtTime(active ? profile.noise * (this.motion.throttle ? 1.4 : 1) : 0, now, .08);
    this.rattleOscillator.frequency.setTargetAtTime(this.engineRpm / 60, now, .1);
    this.rattleDepth.gain.setTargetAtTime(active && this.motion.vehicle === 'cmax' ? .007 : 0, now, .1);
    this.windGain.gain.setTargetAtTime(active ? clamp((this.motion.speed - 30) / 180, 0, 1) * .014 : 0, now, .15);
    const slip = this.motion.drifting || (Math.abs(this.motion.steering) > .8 && this.motion.speed > 64);
    this.tyreGain.gain.setTargetAtTime(active && slip && this.motion.speed > 14 ? .045 : 0, now, .08);
  }

  refresh() {
    if (this.musicTimer) this.clearTimer(this.musicTimer);
    this.musicTimer = 0;
    if (!this.context || this.destroyed) return;
    const now = this.context.currentTime;
    this.effectsBus?.gain.setTargetAtTime(this.audible && this.effectsEnabled ? .65 : 0, now, .025);
    this.dialogueBus?.gain.setTargetAtTime(this.dialogueAudible && this.effectsEnabled ? .65 : 0, now, .01);
    this.musicBus?.gain.setTargetAtTime(this.audible && this.musicEnabled ? .28 : 0, now, .035);
    this.updateEngine();
    if (!this.audible) {
      this.engineRestartAt = 0;
      this.stopVoices('effects');
      this.stopVoices('music');
    }
    if (!this.dialogueAudible) this.stopTyping();
    if (!this.audible || !this.musicEnabled) {
      this.nextNoteTime = 0;
      this.nextFestivalNoteTime = 0;
      return;
    }
    this.pumpMusic();
  }

  pumpMusic() {
    this.musicTimer = 0;
    if (!this.audible || !this.musicEnabled || !this.context) return;
    const now = this.context.currentTime;
    if (this.festivalPresence < 1) {
      if (this.nextNoteTime < now - .1 || !this.nextNoteTime) this.nextNoteTime = now + .04;
      let scheduled = 0;
      while (this.nextNoteTime < now + .16 && scheduled < 8) {
        this.scheduleMusicStep(this.musicStep, this.nextNoteTime);
        this.musicStep = (this.musicStep + 1) % 64;
        this.nextNoteTime += .375;
        scheduled += 1;
      }
    } else this.nextNoteTime = 0;
    if (this.festivalPresence > 0) {
      if (this.nextFestivalNoteTime < now - .1 || !this.nextFestivalNoteTime) this.nextFestivalNoteTime = now + .04;
      let scheduled = 0;
      while (this.nextFestivalNoteTime < now + .16 && scheduled < 8) {
        this.scheduleFestivalStep(this.festivalStep, this.nextFestivalNoteTime);
        this.festivalStep = (this.festivalStep + 1) % 64;
        this.nextFestivalNoteTime += .25;
        scheduled += 1;
      }
    } else this.nextFestivalNoteTime = 0;
    this.musicTimer = this.setTimer(() => this.pumpMusic(), 90);
  }

  /** @param {number} step @param {number} time */
  scheduleMusicStep(step, time) {
    const chord = MUSIC_CHORDS[Math.floor(step / 16) % MUSIC_CHORDS.length];
    if (step % 8 === 0) {
      for (const note of chord.slice(1, 4)) this.tone(noteFrequency(note), time, 3.1, .045, 'sine', 'music', .24, this.travelMusicBus);
    }
    if (step % 4 === 0) this.tone(noteFrequency(chord[0] - 12), time, 1.0, .17, 'sine', 'music', .035, this.travelMusicBus);
    if (step % 2 === 0) {
      const note = chord[MELODY[Math.floor(step / 2) % MELODY.length]] + 12;
      this.tone(noteFrequency(note), time, .75, .16, 'sine', 'music', .012, this.travelMusicBus);
      this.tone(noteFrequency(note) * 2, time, .42, .025, 'sine', 'music', .008, this.travelMusicBus);
    }
  }

  /** An original 120 BPM band loop, kept under the same music consent and limiter. @param {number} step @param {number} time */
  scheduleFestivalStep(step, time) {
    const chord = MUSIC_CHORDS[Math.floor(step / 16) % MUSIC_CHORDS.length];
    if (step % 8 === 0 || step % 8 === 3 || step % 8 === 6) this.festivalKick(time);
    if (step % 4 === 2) {
      this.noise(time, .14, .13, 1850, 'bandpass', 'music', this.festivalMusicBus);
      this.tone(185, time, .11, .09, 'triangle', 'music', .002, this.festivalMusicBus);
    }
    this.noise(time, step % 8 === 7 ? .14 : .045, step % 2 ? .035 : .055, 6100, 'highpass', 'music', this.festivalMusicBus);
    if (step % 2 === 0 || step % 8 === 7) {
      const bass = chord[step % 8 === 6 ? 2 : 0] - 12;
      this.tone(noteFrequency(bass), time, .23, .21, 'triangle', 'music', .012, this.festivalMusicBus);
    }
    if (step % 4 === 0 || step % 8 === 3) {
      for (const [index, note] of chord.slice(1, 4).entries()) {
        this.tone(noteFrequency(note + 12), time + index * .012, .55, .026, 'sawtooth', 'music', .008, this.festivalMusicBus);
      }
    }
    if (step % 2 === 1) {
      const note = chord[MELODY[Math.floor(step / 2) % MELODY.length]] + 12;
      this.tone(noteFrequency(note), time, .32, .095, 'triangle', 'music', .018, this.festivalMusicBus);
      this.tone(noteFrequency(note) * 2, time + .09, .24, .018, 'sine', 'music', .025, this.festivalMusicBus);
    }
  }

  /** @param {number} time */
  festivalKick(time) {
    const context = this.context;
    if (!context || !this.festivalMusicBus || this.voices.size >= 64) return;
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(135, time);
    oscillator.frequency.exponentialRampToValueAtTime(44, time + .16);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.linearRampToValueAtTime(.38, time + .004);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + .23);
    oscillator.connect(envelope).connect(this.festivalMusicBus);
    this.trackVoice(oscillator, [oscillator, envelope], 'music', time, .24);
  }

  horn() {
    if (!this.context || !this.audible || !this.effectsEnabled || this.motion.paused || this.context.currentTime - this.lastHorn < .35) return;
    const now = this.context.currentTime;
    this.lastHorn = now;
    this.hornCount += 1;
    const root = this.motion.vehicle === 'cmax' ? 300 : this.motion.vehicle === 'focus' ? 350 : 330;
    this.tone(root, now, .25, .16, 'triangle', 'effects', .015);
    this.tone(root * 1.25, now, .25, .1, 'triangle', 'effects', .015);
  }

  chime() {
    if (!this.context || !this.audible || !this.effectsEnabled) return;
    for (const [index, frequency] of [440, 554.37, 659.25].entries()) this.tone(frequency, this.context.currentTime + index * .12, .45, .12, 'sine', 'effects', .015);
  }

  /** One quiet key click per reveal chunk, with no backlog after a delayed frame. @param {string} characters */
  typewriterTick(characters) {
    const context = this.context;
    if (!context || !this.dialogueBus || !this.noiseBuffer || !this.dialogueAudible || !this.effectsEnabled || !/[\p{L}\p{N}]/u.test(characters) || context.currentTime - this.lastTyping < .06 || this.voices.size >= 64) return false;
    const now = context.currentTime;
    this.lastTyping = now;
    const key = context.createBufferSource();
    key.buffer = this.noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000 + this.typingCount % 4 * 115;
    filter.Q.value = .7;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(.045, now + .002);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + .022);
    key.connect(filter).connect(envelope).connect(this.dialogueBus);
    this.trackVoice(key, [key, filter, envelope], 'dialogue', now, .024);
    this.typingCount += 1;
    return true;
  }

  stopTyping() {
    this.stopVoices('dialogue');
    this.lastTyping = -Infinity;
  }

  /** Explicit garage handover only; restoring a vehicle never triggers ignition.
   * @param {VehicleId} previous @param {VehicleId} next @param {boolean} [walking]
   */
  vehicleSwap(previous, next, walking = true) {
    if (previous === next || !this.context || !this.audible || !this.effectsEnabled) return false;
    this.stopVoices('effects', true);
    const now = this.context.currentTime;
    const start = now + (walking ? .9 : .62);
    this.engineRestartAt = start + IGNITION_PROFILES[next].crank + .48;
    this.engineIgnition(previous, 'shutdown', now);
    this.engineIgnition(next, 'startup', start);
    this.swapCount += 1;
    this.updateEngine();
    return true;
  }

  /** @param {VehicleId} vehicle @param {'shutdown'|'startup'} phase @param {number} time */
  engineIgnition(vehicle, phase, time) {
    const context = this.context;
    if (!context || !this.effectsBus || !this.engineWaves || this.voices.size > 56) return;
    const engine = ENGINE_PROFILES[vehicle];
    const ignition = IGNITION_PROFILES[vehicle];
    const starting = phase === 'startup';
    const duration = starting ? ignition.crank + .62 : ignition.shutdown;
    const oscillator = context.createOscillator();
    oscillator.setPeriodicWave(this.engineWaves[vehicle]);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(engine.filter, time);
    filter.Q.value = .65;
    const bass = context.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 160;
    bass.gain.value = engine.bassBoost;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    if (starting) {
      const catchTime = time + ignition.crank;
      oscillator.frequency.setValueAtTime(6, time);
      oscillator.frequency.linearRampToValueAtTime(9, catchTime - .02);
      oscillator.frequency.exponentialRampToValueAtTime(ignition.flare / 30, catchTime + .08);
      oscillator.frequency.exponentialRampToValueAtTime(engine.idle / 30, time + duration);
      envelope.gain.linearRampToValueAtTime(engine.gain * .34, time + .035);
      envelope.gain.setValueAtTime(engine.gain * .34, catchTime - .02);
      envelope.gain.linearRampToValueAtTime(engine.gain * 1.4, catchTime + .055);
      envelope.gain.linearRampToValueAtTime(engine.gain * .55, catchTime + .4);
    } else {
      oscillator.frequency.setValueAtTime(engine.idle / 30, time);
      oscillator.frequency.exponentialRampToValueAtTime(5, time + duration);
      envelope.gain.linearRampToValueAtTime(engine.gain * .95, time + .015);
    }
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(filter).connect(bass).connect(envelope).connect(this.effectsBus);
    this.trackVoice(oscillator, [oscillator, filter, bass, envelope], 'effects', time, duration, true);

    if (starting) {
      const starter = context.createOscillator();
      starter.type = 'sawtooth';
      starter.frequency.setValueAtTime(ignition.starter, time);
      starter.frequency.linearRampToValueAtTime(ignition.starter * 1.45, time + ignition.crank);
      const starterFilter = context.createBiquadFilter();
      starterFilter.type = 'bandpass';
      starterFilter.frequency.value = vehicle === 'cmax' ? 480 : 720;
      starterFilter.Q.value = .8;
      const starterGain = context.createGain();
      starterGain.gain.setValueAtTime(0, time);
      starterGain.gain.linearRampToValueAtTime(.065, time + .018);
      starterGain.gain.exponentialRampToValueAtTime(.0001, time + ignition.crank);
      starter.connect(starterFilter).connect(starterGain).connect(this.effectsBus);
      this.trackVoice(starter, [starter, starterFilter, starterGain], 'effects', time, ignition.crank, true);
    }
    if (vehicle === 'cmax' && this.noiseBuffer) {
      const rattle = context.createBufferSource();
      rattle.buffer = this.noiseBuffer;
      const rattleFilter = context.createBiquadFilter();
      rattleFilter.type = 'bandpass';
      rattleFilter.frequency.value = 620;
      const rattleGain = context.createGain();
      rattleGain.gain.setValueAtTime(0, time);
      rattleGain.gain.linearRampToValueAtTime(.03, time + .02);
      rattleGain.gain.exponentialRampToValueAtTime(.0001, time + duration);
      rattle.connect(rattleFilter).connect(rattleGain).connect(this.effectsBus);
      this.trackVoice(rattle, [rattle, rattleFilter, rattleGain], 'effects', time, duration, true);
    }
  }

  overrun() {
    if (!this.context || this.context.currentTime - this.lastRelease < .85) return;
    const now = this.context.currentTime;
    this.lastRelease = now;
    this.releaseCount += 1;
    this.noise(now, .34, .12, 2400, 'highpass');
    for (const [index, offset] of [.08, .2].entries()) {
      this.noise(now + offset, .045, index === 0 ? .15 : .085, 580, 'lowpass');
      this.tone(76 - index * 14, now + offset, .07, .1, 'triangle', 'effects', .002);
    }
  }

  /** @param {number} frequency @param {number} time @param {number} duration @param {number} volume @param {OscillatorType} type @param {'effects'|'music'} bus @param {number} attack @param {GainNode|null} [musicDestination] */
  tone(frequency, time, duration, volume, type, bus, attack, musicDestination) {
    const context = this.context;
    const destination = bus === 'effects' ? this.effectsBus : (musicDestination ?? this.musicBus);
    if (!context || !destination || this.voices.size >= 64) return;
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + attack);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(envelope).connect(destination);
    this.trackVoice(oscillator, [oscillator, envelope], bus, time, duration);
  }

  /** @param {number} time @param {number} duration @param {number} volume @param {number} frequency @param {BiquadFilterType} type @param {'effects'|'music'} [bus] @param {GainNode|null} [musicDestination] */
  noise(time, duration, volume, frequency, type, bus = 'effects', musicDestination) {
    const context = this.context;
    const destination = bus === 'effects' ? this.effectsBus : (musicDestination ?? this.musicBus);
    if (!context || !destination || !this.noiseBuffer || this.voices.size >= 64) return;
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(160, frequency * .35), time + duration);
    filter.Q.value = .7;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.connect(filter).connect(envelope).connect(destination);
    this.trackVoice(source, [source, filter, envelope], bus, time, duration);
  }

  /** @param {AudioScheduledSourceNode} source @param {AudioNode[]} nodes @param {AudioBus} bus @param {number} time @param {number} duration @param {boolean} [ignition] */
  trackVoice(source, nodes, bus, time, duration, ignition = false) {
    const voice = { source, nodes, bus, stopped: false, ignition };
    this.voices.add(voice);
    source.onended = () => {
      for (const node of nodes) node.disconnect();
      this.voices.delete(voice);
    };
    source.start(time);
    source.stop(time + duration + .015);
  }

  /** @param {AudioBus} [bus] @param {boolean} [ignitionOnly] */
  stopVoices(bus, ignitionOnly = false) {
    for (const voice of this.voices) {
      if (bus && voice.bus !== bus) continue;
      if (ignitionOnly && !voice.ignition) continue;
      if (!voice.stopped) {
        voice.stopped = true;
        voice.source.stop();
      }
      for (const node of voice.nodes) node.disconnect();
      this.voices.delete(voice);
    }
  }

  getState() {
    return {
      available: this.available,
      effectsEnabled: this.effectsEnabled,
      musicEnabled: this.musicEnabled,
      running: (this.audible && (this.effectsEnabled || this.musicEnabled)) || (this.dialogueAudible && this.effectsEnabled),
      dialogueActive: this.dialogueActive,
      typingCount: this.typingCount,
      engine: this.motion.vehicle,
      rpm: Math.round(this.engineRpm),
      gear: this.gear,
      drifting: this.motion.drifting,
      voices: this.voices.size,
      musicScheduled: this.musicTimer !== 0,
      musicStep: this.musicStep,
      festivalStep: this.festivalStep,
      festivalPresence: this.festivalPresence,
      musicTheme: this.festivalPresence >= .5 ? 'festival' : 'travel',
      hornCount: this.hornCount,
      releaseCount: this.releaseCount,
      swapCount: this.swapCount,
      engineRestarting: this.context !== null && this.context.currentTime < this.engineRestartAt
    };
  }

  disconnectGraph() {
    this.engineRestartAt = 0;
    for (const source of this.engineSources) source.stop();
    for (const node of this.engineNodes) node.disconnect();
    this.engineSources = [];
    this.engineNodes = [];
    this.effectsBus = null;
    this.dialogueBus = null;
    this.musicBus = null;
    this.travelMusicBus = null;
    this.festivalMusicBus = null;
    this.festivalFilter = null;
    this.engineGain = null;
    this.engineLowGain = null;
    this.engineBassFilter = null;
    this.gritGain = null;
    this.windGain = null;
    this.tyreGain = null;
    this.rattleDepth = null;
    this.engineOscillator = null;
    this.engineLowOscillator = null;
    this.rattleOscillator = null;
    this.engineFilter = null;
    this.engineWaves = null;
    this.noiseBuffer = null;
    this.appliedVehicle = null;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.dialogueActive = false;
    ++this.effectsRevision;
    ++this.musicRevision;
    this.effectsEnabled = false;
    this.musicEnabled = false;
    if (this.musicTimer) this.clearTimer(this.musicTimer);
    this.musicTimer = 0;
    this.visibility?.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.context?.removeEventListener('statechange', this.onContextStateChange);
    this.stopVoices();
    this.disconnectGraph();
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => { this.available = false; });
  }
}
