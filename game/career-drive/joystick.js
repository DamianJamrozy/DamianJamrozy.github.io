// @ts-check

/** @typedef {{forward:boolean,backward:boolean,left:boolean,right:boolean}} JoystickInput */
/** @typedef {{onInput:(input:Readonly<JoystickInput>)=>void,onStart?:()=>boolean|void}} JoystickOptions */

const DEAD_ZONE = .24;

/** @returns {JoystickInput} */
function releasedInput() { return {forward:false,backward:false,left:false,right:false}; }

/**
 * Clamp the thumb to a circle while allowing acceleration and steering together.
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 */
export function joystickSample(x,y,radius) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) {
    return {x:0,y:0,input:releasedInput()};
  }
  const distance = Math.hypot(x,y);
  const scale = distance > radius ? radius / distance : 1;
  const offsetX = x * scale, offsetY = y * scale;
  return {
    x:offsetX,
    y:offsetY,
    input:{
      forward:offsetY / radius < -DEAD_ZONE,
      backward:offsetY / radius > DEAD_ZONE,
      left:offsetX / radius < -DEAD_ZONE,
      right:offsetX / radius > DEAD_ZONE,
    },
  };
}

/** @param {HTMLElement} element @param {JoystickOptions} options */
export function createJoystickController(element,options) {
  let enabled = true, destroyed = false;
  /** @type {number|null} */
  let pointerId = null;
  let centerX = 0, centerY = 0, radius = 1;
  let previousInput = releasedInput();

  /** @param {JoystickInput} next */
  function publish(next) {
    if (next.forward === previousInput.forward && next.backward === previousInput.backward &&
        next.left === previousInput.left && next.right === previousInput.right) return;
    previousInput = next;
    options.onInput({...next});
  }

  /** @param {number} x @param {number} y */
  function move(x,y) {
    const sample = joystickSample(x-centerX,y-centerY,radius);
    element.style.setProperty('--stick-x',`${sample.x}px`);
    element.style.setProperty('--stick-y',`${sample.y}px`);
    publish(sample.input);
  }

  function reset() {
    const captured = pointerId;
    pointerId = null;
    if (captured !== null && element.hasPointerCapture(captured)) element.releasePointerCapture(captured);
    element.classList.remove('is-active');
    element.style.setProperty('--stick-x','0px');
    element.style.setProperty('--stick-y','0px');
    publish(releasedInput());
  }

  /** @param {PointerEvent} event */
  function pointerDown(event) {
    if (!enabled || destroyed || pointerId !== null || event.button !== 0) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0 || options.onStart?.() === false) return;
    event.preventDefault();
    pointerId = event.pointerId;
    centerX = bounds.left + bounds.width / 2;
    centerY = bounds.top + bounds.height / 2;
    radius = Math.min(bounds.width,bounds.height) * .32;
    element.setPointerCapture(pointerId);
    element.classList.add('is-active');
    move(event.clientX,event.clientY);
  }

  /** @param {PointerEvent} event */
  function pointerMove(event) {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    move(event.clientX,event.clientY);
  }

  /** @param {PointerEvent} event */
  function pointerEnd(event) { if (event.pointerId === pointerId) reset(); }

  element.addEventListener('pointerdown',pointerDown);
  element.addEventListener('pointermove',pointerMove);
  element.addEventListener('pointerup',pointerEnd);
  element.addEventListener('pointercancel',pointerEnd);
  element.addEventListener('lostpointercapture',pointerEnd);

  return {
    reset,
    /** @param {boolean} next */
    setEnabled(next) { enabled = next; if (!next) reset(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      reset();
      element.removeEventListener('pointerdown',pointerDown);
      element.removeEventListener('pointermove',pointerMove);
      element.removeEventListener('pointerup',pointerEnd);
      element.removeEventListener('pointercancel',pointerEnd);
      element.removeEventListener('lostpointercapture',pointerEnd);
    },
  };
}
