// @ts-check

/** @typedef {'neutral'|'friendly'|'thoughtful'|'proud'} PortraitEmotion */
/** @typedef {{emotion?:PortraitEmotion,onText?:(text:string)=>void,onReveal?:(characters:string)=>void,onComplete?:()=>void}} SpeechOptions */
/** @typedef {{sheetUrl?:string,animationsEnabled?:boolean}} PortraitOptions */

const COLUMNS = 3;
const ROWS = 2;
const CHARACTER_INTERVAL = 24;
const MOUTH_INTERVAL = 110;

/**
 * The closed and open mouths belong to the same expression, so talking never
 * replaces the whole performance with an unrelated face.
 * @param {PortraitEmotion} emotion
 * @param {boolean} talking
 * @param {boolean} blinking
 */
export function selectPortraitFrame(emotion, talking, blinking) {
  if (blinking) return 1;
  if (emotion === 'thoughtful') return talking ? 2 : 5;
  if (emotion === 'friendly' || emotion === 'proud') return talking ? 4 : 3;
  return talking ? 2 : 0;
}

/** @param {number} characterCount @param {number} elapsedMilliseconds */
export function speechRevealCount(characterCount, elapsedMilliseconds) {
  return Math.min(characterCount, Math.floor(Math.max(0, elapsedMilliseconds) / CHARACTER_INTERVAL));
}

/** A responsive, local sprite performance that also controls dialogue reveal. */
export class DialoguePortrait {
  /** @param {HTMLImageElement} fallbackImage @param {PortraitOptions} [options] */
  constructor(fallbackImage, options = {}) {
    this.image = fallbackImage;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'dialogue-character-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.hidden = true;
    this.image.after(this.canvas);
    this.context = this.canvas.getContext('2d', {alpha:false});
    this.sprite = new Image();
    this.active = false;
    this.loaded = false;
    this.destroyed = false;
    this.speaking = false;
    this.blinking = false;
    this.mouthOpen = false;
    this.animationsEnabled = options.animationsEnabled !== false;
    this.userReducedMotion = false;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    /** @type {PortraitEmotion} */
    this.emotion = 'friendly';
    /** @type {number|null} */
    this.speechTimer = null;
    /** @type {number|null} */
    this.blinkTimer = null;
    /** @type {number|null} */
    this.blinkEndTimer = null;
    /** @type {((text:string)=>void)|undefined} */
    this.onText = undefined;
    /** @type {((characters:string)=>void)|undefined} */
    this.onReveal = undefined;
    /** @type {(()=>void)|undefined} */
    this.onComplete = undefined;
    /** @type {string[]} */
    this.characters = [];
    this.visibleCharacters = 0;
    this.startedAt = 0;
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    this.lastPaintedFrame = -1;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.canvas);
    this.onVisibilityChange = () => {
      if (document.hidden) {
        this.skip();
        this.clearBlinkTimers();
      } else if (this.active) {
        this.scheduleBlink();
        this.render();
      }
    };
    this.onMotionChange = () => this.refreshMotion();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.addEventListener('change', this.onMotionChange);
    this.sprite.onload = () => {
      if (this.destroyed || !this.context || this.sprite.naturalWidth < COLUMNS || this.sprite.naturalHeight < ROWS) return;
      this.loaded = true;
      this.canvas.hidden = false;
      this.image.classList.add('portrait-is-animated');
      this.canvas.dataset.ready = 'true';
      this.resize();
    };
    this.sprite.onerror = () => {
      this.loaded = false;
      this.canvas.hidden = true;
      this.image.classList.remove('portrait-is-animated');
      this.canvas.dataset.ready = 'false';
    };
    this.sprite.src = options.sheetUrl ?? new URL('./assets/damian-expression-sheet.png', import.meta.url).href;
  }

  get motionAllowed() {
    return this.animationsEnabled && !this.userReducedMotion && !this.motionQuery.matches;
  }

  /** @param {boolean} active */
  setActive(active) {
    if (this.destroyed) return;
    if (active && this.active) {
      this.resize();
      return;
    }
    this.active = active;
    if (!active) {
      this.stopSpeech();
      this.clearBlinkTimers();
      this.blinking = false;
      this.render();
      return;
    }
    this.resize();
    this.scheduleBlink();
  }

  /** @param {PortraitEmotion} emotion */
  setEmotion(emotion) {
    this.emotion = emotion;
    this.render();
  }

  /** @param {boolean} enabled */
  setAnimationsEnabled(enabled) {
    this.animationsEnabled = enabled;
    this.refreshMotion();
  }

  /** @param {boolean} reduced */
  setReducedMotion(reduced) {
    this.userReducedMotion = reduced;
    this.refreshMotion();
  }

  refreshMotion() {
    if (!this.motionAllowed) {
      this.skip();
      this.clearBlinkTimers();
      this.blinking = false;
    } else if (this.active) {
      this.scheduleBlink();
    }
    this.render();
  }

  /** @param {string} text @param {SpeechOptions} [options] */
  speak(text, options = {}) {
    if (this.destroyed) return;
    this.stopSpeech();
    if (options.emotion) this.emotion = options.emotion;
    this.characters = Array.from(text);
    this.visibleCharacters = 0;
    this.onText = options.onText;
    this.onReveal = options.onReveal;
    this.onComplete = options.onComplete;
    if (!this.active || !this.motionAllowed || document.hidden || this.characters.length === 0) {
      this.visibleCharacters = this.characters.length;
      this.onText?.(text);
      const onComplete = this.onComplete;
      this.onText = undefined;
      this.onReveal = undefined;
      this.onComplete = undefined;
      onComplete?.();
      this.render();
      return;
    }
    this.speaking = true;
    this.startedAt = performance.now();
    this.onText?.('');
    this.updateSpeech();
  }

  updateSpeech() {
    this.speechTimer = null;
    if (!this.speaking || !this.active || this.destroyed) return;
    const elapsed = performance.now() - this.startedAt;
    const visible = speechRevealCount(this.characters.length, elapsed);
    if (visible !== this.visibleCharacters) {
      const revealed = this.characters.slice(this.visibleCharacters, visible).join('');
      this.visibleCharacters = visible;
      this.onText?.(this.characters.slice(0, visible).join(''));
      if (!document.hidden) this.onReveal?.(revealed);
    }
    if (visible >= this.characters.length) {
      this.finishSpeech();
      return;
    }
    const cadence = Math.floor(elapsed / MOUTH_INTERVAL) % 5;
    const currentCharacter = this.characters[Math.max(0, visible - 1)];
    this.mouthOpen = cadence !== 0 && cadence !== 3 && !/[\s.,!?;:—–-]/u.test(currentCharacter);
    this.render();
    this.speechTimer = window.setTimeout(() => this.updateSpeech(), 32);
  }

  /** Reveal the remainder immediately and return the mouth to its resting pose. */
  skip() {
    if (!this.speaking) return;
    this.visibleCharacters = this.characters.length;
    this.onText?.(this.characters.join(''));
    this.finishSpeech();
  }

  finishSpeech() {
    const onComplete = this.onComplete;
    this.stopSpeech();
    this.render();
    onComplete?.();
  }

  stopSpeech() {
    if (this.speechTimer !== null) window.clearTimeout(this.speechTimer);
    this.speechTimer = null;
    this.speaking = false;
    this.mouthOpen = false;
    this.onText = undefined;
    this.onReveal = undefined;
    this.onComplete = undefined;
  }

  scheduleBlink() {
    this.clearBlinkTimers();
    this.render();
    if (!this.active || !this.motionAllowed || document.hidden || this.destroyed) return;
    this.blinkTimer = window.setTimeout(() => {
      this.blinkTimer = null;
      if (!this.active || !this.motionAllowed || document.hidden || this.destroyed) return;
      this.blinking = true;
      this.render();
      this.blinkEndTimer = window.setTimeout(() => {
        this.blinkEndTimer = null;
        this.blinking = false;
        this.render();
        this.scheduleBlink();
      }, 130);
    }, 2900 + Math.random() * 2600);
  }

  clearBlinkTimers() {
    if (this.blinkTimer !== null) window.clearTimeout(this.blinkTimer);
    if (this.blinkEndTimer !== null) window.clearTimeout(this.blinkEndTimer);
    this.blinkTimer = null;
    this.blinkEndTimer = null;
    this.blinking = false;
  }

  resize() {
    if (!this.loaded || !this.context || this.destroyed) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    this.width = bounds.width;
    this.height = bounds.height;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    this.lastPaintedFrame = -1;
    this.render();
  }

  render() {
    const frame = selectPortraitFrame(this.emotion, this.mouthOpen && this.motionAllowed, this.blinking && this.motionAllowed);
    this.canvas.dataset.expression = this.emotion;
    this.canvas.dataset.frame = String(frame);
    this.canvas.dataset.speaking = String(this.speaking);
    if (!this.loaded || !this.context || this.width < 1 || this.height < 1 || frame === this.lastPaintedFrame || this.destroyed) return;
    const tileWidth = this.sprite.naturalWidth / COLUMNS;
    const tileHeight = this.sprite.naturalHeight / ROWS;
    const sourceX = (frame % COLUMNS) * tileWidth;
    const sourceY = Math.floor(frame / COLUMNS) * tileHeight;
    const scale = Math.max(this.width / tileWidth, this.height / tileHeight);
    const drawnWidth = tileWidth * scale;
    const drawnHeight = tileHeight * scale;
    const position = getComputedStyle(this.image).objectPosition.split(' ');
    const horizontal = Number.parseFloat(position[0]) / 100;
    const vertical = Number.parseFloat(position[1] ?? '20%') / 100;
    const x = (this.width - drawnWidth) * (Number.isFinite(horizontal) ? horizontal : .5);
    const y = (this.height - drawnHeight) * (Number.isFinite(vertical) ? vertical : .2);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(this.sprite, sourceX, sourceY, tileWidth, tileHeight, x, y, drawnWidth, drawnHeight);
    this.lastPaintedFrame = frame;
  }

  getState() {
    return {
      active: this.active,
      speaking: this.speaking,
      expression: this.emotion,
      frame: selectPortraitFrame(this.emotion, this.mouthOpen, this.blinking),
      ready: this.loaded,
      animationsEnabled: this.motionAllowed
    };
  }

  destroy() {
    this.stopSpeech();
    this.clearBlinkTimers();
    this.destroyed = true;
    this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.motionQuery.removeEventListener('change', this.onMotionChange);
    this.sprite.onload = null;
    this.sprite.onerror = null;
    this.canvas.remove();
    this.image.classList.remove('portrait-is-animated');
  }
}
