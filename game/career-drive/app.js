// @ts-check
import { CHAPTERS, COPY } from './story.js';
import { CareerWorld, STATIONS, ROAD_LENGTH } from './world.js';
import { DialoguePortrait } from './portrait.js';
import { StoryScene, topicCaption } from './story-scenes.js';
import { JourneyMap } from './route-map.js';
import { getWorldRegion } from './regions.js';
import { DriveAudio } from './audio.js';
import { DriftTrack } from './drift-track.js';
import { VEHICLES, GARAGES } from './vehicles.js';
import { SIDE_STORIES } from './side-stories.js';
import { GARAGE_STORIES } from './garage-stories.js';
import { festivalPresence } from './festival.js';
import { createJoystickController } from './joystick.js';
import { SAVE_KEY, PREVIOUS_SAVE_KEY, V2_SAVE_KEY, LEGACY_SAVE_KEY, parseSave, resolveLanguage, validateSave, nextUndiscoveredChapter } from './state.js';

/** @typedef {import('./types.js').Language} Language */
/** @type {Record<Language, Record<string,string>>} */
const UI = COPY;
const AUDIO_EFFECTS_KEY = 'career-drive:effects';
const AUDIO_MUSIC_KEY = 'career-drive:music';
/** @param {string} id @returns {HTMLElement} */
function el(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing interface element: ${id}`);
  return element;
}
/** @param {string} id @returns {HTMLDialogElement} */
function dialog(id) { return /** @type {HTMLDialogElement} */(el(id)); }
/** @param {string} key */
function t(key) { return UI[language][key] ?? key; }
let storageAvailable = true;
/** @param {string} key */
function readStorage(key) {
  try { return localStorage.getItem(key); }
  catch { storageAvailable = false; return null; }
}
/** @type {Language} */
let language = resolveLanguage(new URLSearchParams(location.search).get('lang'),readStorage('lang'));
let save = parseSave(readStorage(SAVE_KEY) ?? readStorage(PREVIOUS_SAVE_KEY) ?? readStorage(V2_SAVE_KEY) ?? readStorage(LEGACY_SAVE_KEY));
const restoredDistance = save.distance;
let activeChapter = save.selected;
/** @type {number|null} */
let activeQuestion = null;
/** @type {string|null} */
let activeSideStory = null;
/** @type {number|null} */
let sideQuestion = null;
/** @type {'cmax'|'focus'|null} */
let activeGarage = null;
/** @type {'normal'|'fast'} */
let travelSpeed = 'normal';
const audio = new DriveAudio({effectsEnabled:readStorage(AUDIO_EFFECTS_KEY) !== 'off',musicEnabled:readStorage(AUDIO_MUSIC_KEY) !== 'off'});
let trackMode = false;
let lastDriveHud = '';
let audioPending = false;
const input = {forward:false,backward:false,left:false,right:false,drift:false};
const phoneViewport = window.matchMedia('(max-width: 600px), (max-width: 900px) and (max-height: 500px) and (pointer: coarse)');
let buttonDriving = false;
/** @type {ReturnType<typeof createJoystickController>|null} */
let joystick = null;
const joystickDirections = {forward:false,backward:false,left:false,right:false};
const canvas = /** @type {HTMLCanvasElement} */ (el('world'));
let animationsEnabled = readStorage('career-drive:animations') !== 'off';
const portrait = new DialoguePortrait(/** @type {HTMLImageElement} */(el('character-portrait')),{animationsEnabled});
const scene = new StoryScene(/** @type {HTMLCanvasElement} */(el('story-scene-canvas')),{onPhaseChange:updateSceneCaption});
scene.setAnimationsEnabled(animationsEnabled);
const sideScene = new StoryScene(/** @type {HTMLCanvasElement} */(el('side-scene-canvas')),{onPhaseChange:phase => { el('side-scene-title').textContent = topicCaption(phase,language) ?? ''; }});
sideScene.setAnimationsEnabled(animationsEnabled);
const garageScene = new StoryScene(/** @type {HTMLCanvasElement} */(el('garage-scene-canvas')),{onPhaseChange:phase => { el('garage-scene-title').textContent = topicCaption(phase,language) ?? ''; }});
garageScene.setAnimationsEnabled(animationsEnabled);
const journeyMap = new JourneyMap(el('route-map'),index => { dialog('route-dialog').close(); navigate(index); });
const world = new CareerWorld(canvas,{
  onNavigate: navigate,
  onArrive(index) {
    save.selected = index;
    renderDestination();
    updateDrivingHud();
    el('drive-mode').textContent = t('arriving');
    el('play-state').textContent = t('zoneArrival');
    announce(t('zoneArrival'));
    persist();
    chime();
  },
  onSpeed(speed) { if (!trackMode) el('speed-value').textContent = String(Math.round(Math.abs(speed))).padStart(2,'0'); },
  onDrive(state) { if (!trackMode) { audio.updateMotion(state); updateFestivalAudio(); updateAudioDiagnostics(); updateDrivingHud(); } },
  onTrackEnter: enterTrack,
  onGarageArrive() {
    el('drive-mode').textContent = t('arriving');
    el('play-state').textContent = t('garageZone');
    updateDrivingHud();
    announce(t('garageZone'));
    persist();
    chime();
  },
  onManual() { el('play-state').textContent = t('freeDrive'); el('drive-mode').textContent = t('nextStop'); },
  onLocation(distance,nextStation) {
    save.distance = distance;
    renderLocation(distance);
    const selected = world.getNearestStation() ?? nextStation;
    if (save.started && world.getState().target === null && !dialog('story-dialog').open && save.selected !== selected) {
      save.selected = selected;
      renderDestination();
    }
    updateDrivingHud();
  }
});
const trackCanvas = /** @type {HTMLCanvasElement} */(el('track-canvas'));
const track = new DriftTrack(trackCanvas,{
  onDrive(state) { if (trackMode) { audio.updateMotion(state); updateAudioDiagnostics(); el('speed-value').textContent = String(Math.round(Math.abs(state.speed))).padStart(2,'0'); updateDrivingHud(); } },
  onUpdate: renderTrackStatus,
  onExit: leaveTrack
});
world.setSideStories(SIDE_STORIES);
journeyMap.setSideStories(SIDE_STORIES);
journeyMap.setGarages(GARAGES);

function persist() {
  const state = world.getState();
  save.distance = state.distance;
  save.lane = state.lane;
  save.heading = state.heading;
  save.vehicle = state.vehicle;
  save.garages = state.garages;
  try { localStorage.setItem(SAVE_KEY,JSON.stringify(save)); }
  catch { storageAvailable = false; }
  el('save-status').textContent = t(storageAvailable ? 'saved':'saveUnavailable');
}
/** @param {string} message */
function announce(message) { el('announcer').textContent = message; }
/** @param {string} name */
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden','true');
  const use = document.createElementNS('http://www.w3.org/2000/svg','use');
  use.setAttribute('href',`#i-${name}`);
  svg.append(use);
  return svg;
}
function renderChapters() {
    const list = el('chapter-list');
    list.replaceChildren();
    CHAPTERS.forEach((chapter,index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.className = 'btn btn-ghost chapter-button';
      const completed = save.completed.includes(index);
      button.classList.toggle('is-complete',completed);
      if (save.selected === index) button.setAttribute('aria-current','step');
      button.setAttribute('aria-label',`${index+1}. ${chapter.year}. ${chapter.title[language]}${completed ? `. ${t('chapterVisited')}`:''}`);
      const number = document.createElement('span');
      number.className = 'chapter-number';
      number.setAttribute('aria-hidden','true');
      if (completed) number.append(icon('check')); else number.textContent = String(index+1).padStart(2,'0');
      const info = document.createElement('span');
      info.className = 'chapter-info';
      const year = document.createElement('span');
      year.className = 'chapter-year';
      year.textContent = chapter.year;
      const title = document.createElement('span');
      title.className = 'chapter-title';
      title.textContent = chapter.title[language];
      info.append(year,title);
      button.append(number,info);
      button.addEventListener('click',() => { dialog('route-dialog').close(); navigate(index); });
      item.append(button);
      list.append(item);
    });
  el('progress-count').textContent = `${save.completed.length} / ${CHAPTERS.length}`;
  /** @type {HTMLProgressElement} */(el('journey-progress')).value = save.completed.length;
  /** @type {HTMLProgressElement} */(el('journey-progress')).max = CHAPTERS.length;
  journeyMap.update(language,save.completed,save.selected);
  world.setProgress(save.completed);
}
/** @param {number} distance */
function renderLocation(distance) {
  if (trackMode) {
    el('location-year').textContent = t('trackKicker');
    el('location-title').textContent = t('trackTitle');
    el('location-description').textContent = `${VEHICLES[track.getState().vehicle].label[language]} · ${t('trackDescription')}`;
    el('scene-title').setAttribute('aria-label',t('trackTitle'));
    return;
  }
  const index = STATIONS.reduce((current,station,i) => distance >= station.distance-100 ? i : current,0);
  const region = getWorldRegion(distance);
  el('location-year').textContent = STATIONS[index].year;
  el('location-title').textContent = region.city[language];
  el('scene-title').setAttribute('aria-label',`${STATIONS[index].year}. ${region.city[language]}`);
  el('location-description').textContent = CHAPTERS[index].title[language];
  journeyMap.setDistance(distance,world.getState().lane);
  /** @type {HTMLProgressElement} */(el('road-progress')).value = distance;
  /** @type {HTMLProgressElement} */(el('road-progress')).max = ROAD_LENGTH;
}
function renderDestination() {
  const chapter = CHAPTERS[save.selected];
  el('destination-title').textContent = chapter.title[language];
  el('destination-year').textContent = `${chapter.year} · ${chapter.subtitle[language]}`;
  el('welcome-card').hidden = save.started || trackMode;
  el('drive-card').hidden = !save.started || trackMode;
}
function festivalDialogueOpen() {
  if (document.querySelectorAll('dialog[open]').length!==1) return false;
  return (dialog('story-dialog').open && scene.getState().phase==='festival')
    || (dialog('side-dialog').open && sideScene.getState().phase==='festival');
}
function updateFestivalAudio() {
  const state=world.getState();
  audio.setFestivalPresence(trackMode ? 0 : festivalDialogueOpen() ? 1 : festivalPresence(state.distance,state.lane));
}
function syncPause() {
  const paused = !save.started || document.hidden || !!document.querySelector('dialog[open]');
  joystick?.setEnabled(phoneViewport.matches && !buttonDriving && !document.hidden && !document.querySelector('dialog[open]'));
  world.setPaused(paused || trackMode);
  track.setPaused(paused || !trackMode);
  updateFestivalAudio();
  audio.setDialogueActive(save.started && !document.hidden && document.querySelectorAll('dialog[open]').length === 1 && dialog('story-dialog').open);
  audio.setPaused(!save.started || document.hidden || (paused && !festivalDialogueOpen()));
  updateAudioDiagnostics();
  scene.setActive(dialog('story-dialog').open && !document.hidden);
  sideScene.setActive(dialog('side-dialog').open && !document.hidden);
  garageScene.setActive(dialog('garage-dialog').open && !document.hidden);
}
/** @param {string} id */
function openDialog(id) {
  clearInput();
  const target = dialog(id);
  if (!target.open) {
    target.showModal();
    const content = target.querySelector('.dialog-scroll');
    if (content && !content.contains(document.activeElement)) content.scrollTop = 0;
  }
  syncPause();
}
function ensureStarted() {
  if (!save.started) {
    save.started = true;
    world.start();
    renderDestination();
    persist();
  }
  syncPause();
}
/** @param {number} index */
function navigate(index) {
  if (trackMode) leaveTrack();
  save.selected = index;
  ensureStarted();
  clearInput();
  renderChapters();
  renderDestination();
  world.navigateTo(index);
  el('play-state').textContent = `${t('autopilot')} · ${CHAPTERS[index].title[language]}`;
  el('drive-mode').textContent = t('autopilot');
  announce(`${t('destination')}: ${CHAPTERS[index].title[language]}`);
  persist();
  canvas.focus({preventScroll:true});
}
/** @param {HTMLElement} container @param {string[]} skills */
function renderSkills(container,skills) {
  container.replaceChildren();
  for (const skill of skills) {
    const chip = document.createElement('span');
    chip.className = 'skill-chip';
    chip.textContent = skill;
    container.append(chip);
  }
}
function renderStory() {
  const chapter = CHAPTERS[activeChapter];
  el('story-kicker').textContent = `${t('chapter')} ${String(activeChapter+1).padStart(2,'0')} / ${CHAPTERS.length} · ${chapter.year}`;
  el('story-tag').textContent = chapter.tag[language];
  el('story-title').textContent = chapter.title[language];
  el('story-text').textContent = chapter.intro[language];
  el('story-accessible').textContent = chapter.intro[language];
  el('story-page').textContent = `${String(activeChapter+1).padStart(2,'0')} - ${String(CHAPTERS.length).padStart(2,'0')}`;
  renderSkills(el('story-skills'),chapter.skills);
  scene.setChapter(chapter.id);
  updateSceneCaption(scene.getState().phase);
  const questions = el('story-questions');
  questions.replaceChildren();
  chapter.questions.forEach((question,index) => {
    const button = document.createElement('button');
    button.className = 'btn btn-ghost';
    const text = document.createElement('span');
    text.textContent = question.label[language];
    button.append(text,icon('arrow'));
    button.addEventListener('click',() => { activeQuestion = index; renderAnswer(); });
    questions.append(button);
  });
  renderAnswer(false,false);
}
/** @param {boolean} [focus] @param {boolean} [speak] */
function renderAnswer(focus = true,speak = true) {
  portrait.skip();
  const answer = el('story-answer');
  el('story-questions').hidden = activeQuestion !== null;
  answer.hidden = activeQuestion === null;
  if (activeQuestion !== null) {
    el('answer-text').textContent = CHAPTERS[activeChapter].questions[activeQuestion].answer[language];
    el('answer-accessible').textContent = CHAPTERS[activeChapter].questions[activeQuestion].answer[language];
    if (focus) el('answer-back').focus({preventScroll:true});
    if (speak) speakPassage();
  } else {
    portrait.setEmotion('friendly');
  }
  scene.setConversation(CHAPTERS[activeChapter].id,activeQuestion);
  if (dialog('story-dialog').open) syncPause();
}
/** @param {string} phase */
function updateSceneCaption(phase) {
  /** @type {Record<string,string>} */
  const captions = {school:'sceneSchool',internship:'sceneInternship',studies:'sceneStudies',university:'sceneUniversity',systems:'sceneSystems',award:'sceneAward',lecture:'sceneLecture',learning:'sceneAward',design:'sceneDesign',community:'sceneCommunity',netwise:'sceneNetwise',next:'sceneNext'};
  el('story-scene-title').textContent = topicCaption(phase,language) ?? t(captions[phase] ?? 'sceneNext');
}
function speakPassage() {
  const chapter = CHAPTERS[activeChapter];
  const answering = activeQuestion !== null;
  const text = answering ? chapter.questions[/** @type {number} */(activeQuestion)].answer[language] : chapter.intro[language];
  const target = el(answering ? 'answer-text':'story-text');
  const emotion = answering ? (activeQuestion === 0 ? 'thoughtful':'proud') : 'friendly';
  el('speech-skip').hidden = false;
  audio.stopTyping();
  portrait.speak(text,{
    emotion,
    onText:value => { target.textContent = value; },
    onReveal:characters => { audio.typewriterTick(characters); updateAudioDiagnostics(); },
    onComplete:() => { audio.stopTyping(); el('speech-skip').hidden = true; }
  });
}
/** @param {number} index */
function openStory(index) {
  ensureStarted();
  world.cancelNavigation();
  el('drive-mode').textContent = t('nextStop');
  activeChapter = index;
  activeQuestion = null;
  save.selected = index;
  renderChapters();
  renderDestination();
  renderStory();
  openDialog('story-dialog');
  portrait.setActive(true);
  speakPassage();
  persist();
}
function finishChapter() {
  if (!save.completed.includes(activeChapter)) save.completed.push(activeChapter);
  announce(`${t('chapterComplete')}: ${CHAPTERS[activeChapter].takeaway[language]}`);
  const next = nextUndiscoveredChapter(save.completed,activeChapter);
  save.selected = next < 0 ? activeChapter : next;
  renderChapters();
  renderDestination();
  persist();
  portrait.setActive(false);
  scene.setActive(false);
  dialog('story-dialog').close();
  chime();
  if (next < 0) {
    renderSkills(el('complete-skills'),[t('skillSoftwareEngineering'),'UI/UX',t('skillDatabases'),t('skillTeaching'),t('skillCommunity')]);
    openDialog('complete-dialog');
  } else {
    el('drive-mode').textContent = t('nextStop');
    el('play-state').textContent = CHAPTERS[activeChapter].takeaway[language];
  }
}
function applyLanguage() {
  document.documentElement.lang = language;
  document.title = t('title');
  for (const node of document.querySelectorAll('[data-i18n]')) {
    const key = node.getAttribute('data-i18n');
    if (key) node.textContent = t(key);
  }
  for (const node of document.querySelectorAll('[data-label]')) {
    const key = node.getAttribute('data-label');
    if (key) { node.setAttribute('aria-label',t(key)); node.setAttribute('title',t(key)); }
  }
  for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed',String(button.getAttribute('data-lang') === language));
  for (const id of ['cv-link','brand-link','complete-cv','phone-cv-link']) /** @type {HTMLAnchorElement} */(el(id)).href = `../../index.html?lang=${language}`;
  el('character-portrait').setAttribute('alt',t('portraitAlt'));
  document.querySelector('.touch-controls')?.setAttribute('aria-label',t('mobileControls'));
  if (location.protocol !== 'file:') {
    const url = new URL(location.href);
    url.searchParams.set('lang',language);
    history.replaceState(null,'',url);
  }
  try { localStorage.setItem('lang',language); } catch { storageAvailable = false; }
  world.setLanguage(language);
  track.setLanguage(language);
  scene.setLanguage(language);
  sideScene.setLanguage(language);
  garageScene.setLanguage(language);
  renderChapters();
  renderDestination();
  renderLocation(world.getState().distance);
  const target = world.getState().target;
  if (target !== null) {
    el('play-state').textContent = `${t('autopilot')} · ${CHAPTERS[target].title[language]}`;
    el('drive-mode').textContent = t('autopilot');
  }
  if (dialog('story-dialog').open) { renderStory(); speakPassage(); }
  if (dialog('side-dialog').open) renderSideStory();
  if (dialog('garage-dialog').open) renderGarage();
  el('save-status').textContent = t(storageAvailable ? 'saved':'saveUnavailable');
  updateSoundButton();
  updateAnimationButton();
  lastDriveHud = '';
  updateDrivingHud();
  renderTrackStatus();
  if (dialog('phone-options').open) refreshPhoneOptions();
}
function updateAnimationButton() {
  el('animation-toggle').setAttribute('aria-label',t('portraitAnimations'));
  el('animation-toggle').setAttribute('aria-pressed',String(animationsEnabled));
  el('animation-toggle').textContent = t(animationsEnabled ? 'portraitAnimationsOff':'portraitAnimationsOn');
}
function clearInput() {
  joystick?.reset();
  Object.assign(input,{forward:false,backward:false,left:false,right:false,drift:false});
  world.setInput(input);
  track.setInput(input);
  for (const button of document.querySelectorAll('.touch-key')) { button.classList.remove('is-held'); button.setAttribute('aria-pressed','false'); }
}
function interact() {
  if (trackMode) return;
  if (world.getState().trackNearby) { enterTrack(); return; }
  const garage = world.getState().nearbyGarage;
  if (garage) { openGarage(garage); return; }
  const side = world.getState().nearbySideStory;
  if (side) { openSideStory(side); return; }
  const nearby = world.getNearestStation();
  if (nearby !== null) openStory(nearby);
  else { announce(t('noStop')); el('play-state').textContent = t('noStop'); }
}
/** @param {string} id */
function openSideStory(id) {
  if (!SIDE_STORIES.some(story => story.id === id)) return;
  activeSideStory = id;
  sideQuestion = null;
  world.cancelNavigation();
  renderSideStory();
  openDialog('side-dialog');
  persist();
}
function renderSideStory() {
  const story = SIDE_STORIES.find(item => item.id === activeSideStory);
  if (!story) return;
  const answer = sideQuestion === null ? null : story.questions[sideQuestion];
  el('side-title').textContent = story.label[language];
  el('side-speaker').textContent = t('dialogueEncounter');
  el('side-partner').textContent = story.speaker[language];
  el('side-prompt').textContent = answer ? answer.label[language] : story.greeting[language];
  el('side-text').textContent = answer ? answer.answer[language] : story.intro[language];
  sideScene.setChapter(story.chapterId);
  sideScene.showTopic(answer?.topic ?? story.topic);
  el('side-scene-title').textContent = topicCaption(sideScene.getState().phase,language) ?? story.label[language];
  const questions = el('side-questions');
  questions.replaceChildren();
  story.questions.forEach((question,index) => {
    const button = document.createElement('button');
    button.className = 'btn btn-ghost';
    button.textContent = question.label[language];
    button.append(icon('arrow'));
    button.addEventListener('click',() => { sideQuestion = index; renderSideStory(); el('side-answer-back').focus({preventScroll:true}); });
    questions.append(button);
  });
  questions.hidden = answer !== null;
  el('side-answer-back').hidden = answer === null;
  const source = /** @type {HTMLAnchorElement} */(el('side-source'));
  source.hidden = !story.source;
  if (story.source) { source.href = story.source.url; source.textContent = story.source.label[language]; }
  if (dialog('side-dialog').open) syncPause();
}
/** @param {'cmax'|'focus'} id */
function openGarage(id) {
  activeGarage = id;
  world.cancelNavigation();
  renderGarage();
  openDialog('garage-dialog');
  persist();
}
function renderGarage() {
  const story = GARAGE_STORIES.find(item => item.id === activeGarage);
  if (!story) return;
  el('garage-title').textContent = story.title[language];
  el('garage-intro').textContent = story.introduction[language];
  el('garage-details').textContent = story.details[language];
  garageScene.setChapter(story.id === 'cmax' ? 'systems':'netwise');
  garageScene.showTopic(story.id);
  const cars = el('garage-cars');
  cars.replaceChildren();
  const state = world.getState();
  const parkedVehicle = activeGarage ? state.garages[activeGarage].parkedVehicle : null;
  for (const id of /** @type {import('./vehicles.js').VehicleId[]} */(['taxi','cmax','focus'])) {
    if (id !== parkedVehicle && id !== state.vehicle) continue;
    const current = state.vehicle === id;
    const button = document.createElement('button');
    button.className = 'btn btn-ghost garage-car-option';
    button.disabled = current;
    button.dataset.vehicle = id;
    if (current) button.setAttribute('aria-current','true');
    const name = document.createElement('strong');
    name.textContent = VEHICLES[id].label[language];
    const detail = document.createElement('small');
    detail.textContent = t(current ? 'garageCurrent':'garagePick');
    button.append(name,detail);
    button.addEventListener('click',() => {
      const previous = world.getState().vehicle;
      if (!save.ownedVehicles.includes(id)) save.ownedVehicles.push(id);
      world.boardVehicle(id);
      persist();
      dialog('garage-dialog').close();
      syncPause();
      audio.updateMotion(world.getTelemetry());
      audio.vehicleSwap(previous,world.getState().vehicle,world.getState().boarding);
      updateDrivingHud();
      el('play-state').textContent = t('garageBoarded');
      announce(t('garageBoarded'));
    });
    cars.append(button);
  }
}
function updateDrivingHud() {
  const road = world.getState();
  const state = trackMode ? track.getState() : road;
  const vehicle = state.vehicle;
  const nearest = trackMode ? null : road.nearbyStation;
  const trackNearby = !trackMode && road.trackNearby;
  const garage = !trackMode ? GARAGES.find(item => item.id === road.nearbyGarage) : undefined;
  const garageAccess = !trackMode ? GARAGES.find(item => Math.abs(item.distance-road.distance)<650) : undefined;
  const side = !trackMode ? SIDE_STORIES.find(story => story.id === road.nearbySideStory) : undefined;
  const hud = `${language}:${trackMode}:${vehicle}:${state.lights}:${nearest}:${side?.id}:${garage?.id}:${garageAccess?.id}:${trackNearby}:${save.started}`;
  if (hud === lastDriveHud) return;
  lastDriveHud = hud;
  document.querySelector('.touch-controls')?.classList.toggle('is-track',trackMode);
  el('vehicle-name').textContent = VEHICLES[vehicle].label[language];
  el('vehicle-detail').textContent = VEHICLES[vehicle].detail[language];
  el('lights-button').setAttribute('aria-pressed',String(state.lights));
  el('road-keyboard-hint').hidden = trackMode;
  el('track-keyboard-hint').hidden = !trackMode;
  el('lights-button').setAttribute('title',`${t(state.lights ? 'lightsOn':'lightsOff')} · L`);
  el('interaction-zone').hidden = !save.started || trackMode || (nearest === null && !trackNearby && !side && !garage);
  el('interaction-hint').textContent = trackNearby ? t('trackZone') : garage ? t('garageZone') : side ? `${side.label[language]} · ${t('sideHint')}` : `${nearest === null ? '' : CHAPTERS[nearest].title[language]} · ${t('zoneReady')}`;
  el('interact-button').textContent = t(trackNearby ? 'trackEntry' : garage ? 'garagePick':'talk');
  el('read-button').textContent = t(trackNearby ? 'trackEntry' : garage ? 'garagePick':'talk');
  el('touch-talk').textContent = t(trackNearby ? 'trackEntry' : garage ? 'garagePick':'talk');
  el('garage-drive').hidden = !save.started || !garageAccess || !!garage;
  /** @type {HTMLButtonElement} */(el('read-button')).disabled = nearest === null && !trackNearby && !side && !garage;
  /** @type {HTMLButtonElement} */(el('touch-talk')).disabled = nearest === null && !trackNearby && !side && !garage;
  el('read-button').setAttribute('title',t(trackNearby ? 'trackZone' : garage ? 'garageZone' : side ? 'sideHint' : nearest === null ? 'noStop':'zoneReady'));
  for (const id of ['horn-button','lights-button']) /** @type {HTMLButtonElement} */(el(id)).disabled = !save.started;
}
function enterTrack() {
  if (trackMode || !world.getState().trackNearby) return;
  clearInput();
  world.cancelNavigation();
  track.setVehicle(world.getState().vehicle);
  trackMode = true;
  canvas.hidden = true;
  trackCanvas.hidden = false;
  document.querySelector('.world-stage')?.classList.add('is-track');
  el('track-hud').hidden = false;
  el('touch-talk').hidden = true;
  if (track.getState().lights !== world.getState().lights) track.toggleLights();
  track.start();
  renderDestination();
  renderLocation(save.distance);
  updateDrivingHud();
  syncPause();
  el('play-state').textContent = t('trackWelcome');
  announce(t('trackWelcome'));
  trackCanvas.focus({preventScroll:true});
  persist();
}
function leaveTrack() {
  if (!trackMode) return;
  clearInput();
  track.setPaused(true);
  trackMode = false;
  trackCanvas.hidden = true;
  canvas.hidden = false;
  document.querySelector('.world-stage')?.classList.remove('is-track');
  el('track-hud').hidden = true;
  el('touch-talk').hidden = false;
  world.resize();
  renderDestination();
  renderLocation(save.distance);
  updateDrivingHud();
  syncPause();
  if (world.getState().lights !== track.getState().lights) { world.toggleLights(); updateDrivingHud(); }
  el('play-state').textContent = t('trackReturn');
  announce(t('trackReturn'));
  canvas.focus({preventScroll:true});
}
function renderTrackStatus() {
  if (!trackMode) return;
  const state = track.getState();
  el('lap-count').textContent = String(state.lap);
  el('drift-score').textContent = String(Math.floor(state.driftScore));
  el('drift-status').textContent = t(state.drifting ? 'drifting':'trackDriveHint');
}
function honk() {
  if (!save.started || document.querySelector('dialog[open]')) return;
  (trackMode ? track : world).honk();
  audio.horn();
  (trackMode ? trackCanvas : canvas).focus({preventScroll:true});
}
function toggleLights() {
  if (!save.started || document.querySelector('dialog[open]')) return;
  (trackMode ? track : world).toggleLights();
  updateDrivingHud();
  (trackMode ? trackCanvas : canvas).focus({preventScroll:true});
}
function updateAudioDiagnostics() {
  const state = audio.getState();
  Object.assign(el('sound-toggle').dataset,{running:String(state.running),engine:state.engine,gear:String(state.gear),releases:String(state.releaseCount),horns:String(state.hornCount),swaps:String(state.swapCount),engineRestarting:String(state.engineRestarting),typing:String(state.typingCount),dialogueActive:String(state.dialogueActive),musicTheme:state.musicTheme,festivalPresence:String(state.festivalPresence)});
}
function updateSoundButton() {
  const state = audio.getState();
  el('audio-all').textContent = t(state.effectsEnabled || state.musicEnabled ? 'audioMuteAll':'audioEnableAll');
  el('effects-toggle').setAttribute('aria-pressed',String(state.effectsEnabled));
  el('music-toggle').setAttribute('aria-pressed',String(state.musicEnabled));
  el('effects-toggle').textContent = t(state.effectsEnabled ? 'effectsOff':'effectsOn');
  el('music-toggle').textContent = t(state.musicEnabled ? 'musicOff':'musicOn');
  el('audio-dialog').dataset.effects = String(state.effectsEnabled);
  el('audio-dialog').dataset.music = String(state.musicEnabled);
  const strike = document.querySelector('.sound-strike');
  if (strike instanceof HTMLElement) strike.hidden = state.effectsEnabled || state.musicEnabled;
  updateAudioDiagnostics();
}
function chime() { audio.chime(); }
/** @param {'all'|'effects'|'music'} choice */
async function configureAudio(choice) {
  if (audioPending) return;
  audioPending = true;
  const buttons = ['audio-all','effects-toggle','music-toggle'].map(id => /** @type {HTMLButtonElement} */(el(id)));
  for (const button of buttons) button.disabled = true;
  let available = true;
  try {
    const state = audio.getState();
    if (choice === 'all') {
      if (state.effectsEnabled || state.musicEnabled) {
        audio.setEffectsEnabled(false);
        audio.setMusicEnabled(false);
      } else available = (await Promise.all([audio.enableEffects(),audio.enableMusic()])).every(Boolean);
    } else if (choice === 'effects') {
      if (state.effectsEnabled) audio.setEffectsEnabled(false);
      else available = await audio.enableEffects();
    } else {
      if (state.musicEnabled) audio.setMusicEnabled(false);
      else available = await audio.enableMusic();
    }
    const preferences = audio.getState();
    const enabled = preferences.effectsEnabled || preferences.musicEnabled;
    el('audio-status').textContent = t(!available ? 'soundUnavailable' : enabled ? 'audioPlaying':'audioMuted');
    try {
      localStorage.setItem(AUDIO_EFFECTS_KEY,preferences.effectsEnabled ? 'on':'off');
      localStorage.setItem(AUDIO_MUSIC_KEY,preferences.musicEnabled ? 'on':'off');
    } catch { storageAvailable = false; }
  } finally {
    audioPending = false;
    for (const button of buttons) button.disabled = false;
    updateSoundButton();
  }
}
/** @param {Event} event */
function unlockAudio(event) {
  if (!event.isTrusted) return;
  if (event instanceof PointerEvent && event.type === 'pointerdown' && event.pointerType !== 'mouse') return;
  if (event instanceof KeyboardEvent && (event.repeat || event.altKey || event.ctrlKey || event.metaKey)) return;
  void audio.unlock().then(updateSoundButton);
}
// Touch activation arrives on release; mouse and keyboard controls can unlock immediately.
window.addEventListener('pointerdown',unlockAudio,{capture:true,passive:true});
window.addEventListener('pointerup',unlockAudio,{capture:true,passive:true});
window.addEventListener('click',unlockAudio,{capture:true,passive:true});
window.addEventListener('keydown',unlockAudio,{capture:true});
el('sound-toggle').addEventListener('click',() => openDialog('audio-dialog'));
el('audio-all').addEventListener('click',() => { void configureAudio('all'); });
el('effects-toggle').addEventListener('click',() => { void configureAudio('effects'); });
el('music-toggle').addEventListener('click',() => { void configureAudio('music'); });
for (const button of document.querySelectorAll('[data-lang]')) button.addEventListener('click',() => {
  language = button.getAttribute('data-lang') === 'en' ? 'en':'pl'; applyLanguage();
});
for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click',() => {
  const id = button.getAttribute('data-close'); if (id) dialog(id).close();
});
for (const modal of document.querySelectorAll('dialog')) modal.addEventListener('close',() => {
  if (modal.id === 'phone-options') el('phone-more').setAttribute('aria-expanded','false');
  if (modal.id === 'story-dialog' && !modal.open) { portrait.setActive(false); scene.setActive(false); el('speech-skip').hidden = true; }
  if (modal.id === 'side-dialog' && !modal.open) sideScene.setActive(false);
  if (modal.id === 'garage-dialog' && !modal.open) garageScene.setActive(false);
  syncPause();
  if (!document.querySelector('dialog[open]')) {
    if (modal.id === 'phone-options' && phoneViewport.matches) el('phone-more').focus({preventScroll:true});
    else if (save.started) (trackMode ? trackCanvas : canvas).focus({preventScroll:true});
  }
});
el('start-button').addEventListener('click',() => { ensureStarted(); canvas.focus({preventScroll:true}); });
el('drive-button').addEventListener('click',() => navigate(save.selected));
el('read-button').addEventListener('click',interact);
el('interact-button').addEventListener('click',interact);
el('horn-button').addEventListener('click',honk);
el('lights-button').addEventListener('click',toggleLights);
el('track-exit').addEventListener('click',leaveTrack);
el('finish-chapter').addEventListener('click',finishChapter);
el('speech-skip').addEventListener('click',() => portrait.skip());
el('scene-replay').addEventListener('click',() => {
  scene.replay();
});
el('side-scene-replay').addEventListener('click',() => sideScene.replay());
el('garage-scene-replay').addEventListener('click',() => garageScene.replay());
el('garage-drive').addEventListener('click',() => {
  const garage = GARAGES.find(item => Math.abs(item.distance-world.getState().distance)<650);
  if (!garage) return;
  clearInput();
  world.navigateToGarage(garage.id);
  el('play-state').textContent = t('garageDrive');
  canvas.focus({preventScroll:true});
});
el('side-answer-back').addEventListener('click',() => { sideQuestion = null; renderSideStory(); el('side-questions').querySelector('button')?.focus({preventScroll:true}); });
for (const speed of ['normal','fast']) el(`travel-${speed}`).addEventListener('click',() => {
  travelSpeed = speed === 'fast' ? 'fast':'normal';
  world.setTravelSpeed(travelSpeed);
  for (const option of ['normal','fast']) el(`travel-${option}`).setAttribute('aria-pressed',String(option === travelSpeed));
  el('route-dialog').dataset.travelSpeed = travelSpeed;
});
el('animation-toggle').addEventListener('click',() => {
  animationsEnabled = !animationsEnabled;
  portrait.setAnimationsEnabled(animationsEnabled);
  scene.setAnimationsEnabled(animationsEnabled);
  sideScene.setAnimationsEnabled(animationsEnabled);
  garageScene.setAnimationsEnabled(animationsEnabled);
  world.setAnimationsEnabled(animationsEnabled);
  track.setAnimationsEnabled(animationsEnabled);
  try { localStorage.setItem('career-drive:animations',animationsEnabled ? 'on':'off'); }
  catch { storageAvailable = false; }
  updateAnimationButton();
});
el('answer-back').addEventListener('click',() => { activeQuestion = null; renderAnswer(); /** @type {HTMLButtonElement|null} */(el('story-questions').querySelector('button'))?.focus({preventScroll:true}); });
el('help-button').addEventListener('click',() => openDialog('help-dialog'));
el('pause-help-button').addEventListener('click',() => { dialog('pause-dialog').close(); openDialog('help-dialog'); });
el('pause-button').addEventListener('click',() => openDialog('pause-dialog'));
el('resume-button').addEventListener('click',() => { dialog('pause-dialog').close(); (trackMode ? trackCanvas : canvas).focus({preventScroll:true}); });
el('route-toggle').addEventListener('click',() => { renderChapters(); openDialog('route-dialog'); });
el('touch-talk').addEventListener('click',interact);
el('restart-button').addEventListener('click',() => { el('reset-confirmation').hidden = false; el('confirm-restart').focus(); });
el('confirm-restart').addEventListener('click',() => {
  if (trackMode) leaveTrack();
  save = validateSave(null);
  clearInput();
  track.reset();
  world.reset();
  persist();
  renderChapters();
  renderDestination();
  renderLocation(0);
  el('play-state').textContent = t('welcomeHint');
  el('drive-mode').textContent = t('nextMilestone');
  announce(t('welcomeTitle'));
  el('reset-confirmation').hidden = true;
  dialog('pause-dialog').close();
  syncPause();
  el('start-button').focus();
});
/** @type {Record<string,keyof typeof input>} */
const keys = {KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'drift'};
const heldKeys = new Set();
joystick = createJoystickController(el('phone-joystick'),{
  onStart() {
    if (!phoneViewport.matches || document.querySelector('dialog[open]')) return false;
    ensureStarted();
    (trackMode ? trackCanvas : canvas).focus({preventScroll:true});
    return true;
  },
  onInput(directions) {
    Object.assign(joystickDirections,directions);
    for (const direction of /** @type {const} */(['forward','backward','left','right'])) {
      input[direction] = directions[direction] || Object.entries(keys).some(([key,value]) => value === direction && heldKeys.has(key));
    }
    (trackMode ? track : world).setInput(input);
  }
});
joystick.setEnabled(phoneViewport.matches);
phoneViewport.addEventListener('change',() => {
  heldKeys.clear();
  clearInput();
  if (!phoneViewport.matches && dialog('phone-options').open) dialog('phone-options').close();
  syncPause();
});
window.addEventListener('resize',() => {
  if (phoneViewport.matches) clearInput();
});
function refreshPhoneOptions() {
  const state = trackMode ? track.getState() : world.getState();
  el('phone-vehicle-name').textContent = VEHICLES[state.vehicle].label[language];
  el('phone-destination').textContent = trackMode ? t('trackDriveHint') : `${el('destination-title').textContent} · ${el('destination-year').textContent}`;
  for (const id of ['phone-horn','phone-lights','phone-pause']) /** @type {HTMLButtonElement} */(el(id)).disabled = !save.started;
  for (const id of ['phone-map','phone-drive']) /** @type {HTMLButtonElement} */(el(id)).disabled = trackMode;
  el('phone-garage').hidden = trackMode || el('garage-drive').hidden;
  el('phone-track-exit').hidden = !trackMode;
  el('phone-track-stats').hidden = !trackMode;
  const status = track.getState();
  el('phone-track-stats').textContent = `${t('laps')}: ${status.lap} · ${t('driftScore')}: ${Math.floor(status.driftScore)}`;
  el('phone-lights').setAttribute('aria-pressed',String(state.lights));
}
el('phone-more').addEventListener('click',() => {
  if (!phoneViewport.matches) return;
  refreshPhoneOptions();
  openDialog('phone-options');
  el('phone-more').setAttribute('aria-expanded','true');
});
for (const [phoneId,originalId] of [
  ['phone-map','route-toggle'],['phone-pause','pause-button'],['phone-audio','sound-toggle'],
  ['phone-help','help-button'],['phone-horn','horn-button'],['phone-lights','lights-button'],
  ['phone-drive','drive-button'],['phone-garage','garage-drive'],['phone-track-exit','track-exit']
]) el(phoneId).addEventListener('click',() => {
  dialog('phone-options').close();
  el(originalId).click();
});
el('phone-buttons-toggle').addEventListener('click',() => {
  clearInput();
  buttonDriving = !buttonDriving;
  document.querySelector('.touch-controls')?.classList.toggle('is-buttons',buttonDriving);
  el('phone-buttons-toggle').setAttribute('aria-pressed',String(buttonDriving));
  syncPause();
});
window.addEventListener('keydown',event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable=true]')) return;
  const modalOpen = !!document.querySelector('dialog[open]');
  if (event.code === 'KeyM' && !trackMode && !event.repeat && (!modalOpen || dialog('route-dialog').open)) {
    event.preventDefault();
    if (dialog('route-dialog').open) dialog('route-dialog').close();
    else { renderChapters(); openDialog('route-dialog'); }
    return;
  }
  if (event.code === 'Escape' && !modalOpen && save.started) { event.preventDefault(); openDialog('pause-dialog'); return; }
  if (modalOpen) return;
  const onControl = event.target instanceof Element && event.target.closest('button,a,input,select,textarea');
  const direction = keys[event.code];
  if (direction) {
    // Space must still activate a focused button instead of applying the handbrake.
    if (event.code === 'Space' && onControl) return;
    event.preventDefault();
    if (!save.started) ensureStarted();
    (trackMode ? trackCanvas : canvas).focus({preventScroll:true});
    heldKeys.add(event.code);
    input[direction] = true;
    (trackMode ? track : world).setInput(input);
    return;
  }
  if (!save.started) return;
  if (onControl && (event.code === 'Enter' || event.code === 'NumpadEnter')) return;
  if ((event.code === 'KeyE' || event.code === 'Enter' || event.code === 'NumpadEnter') && !event.repeat) { event.preventDefault(); interact(); return; }
  if (event.code === 'KeyH' && !event.repeat) { event.preventDefault(); honk(); return; }
  if (event.code === 'KeyL' && !event.repeat) { event.preventDefault(); toggleLights(); return; }
});
window.addEventListener('keyup',event => {
  heldKeys.delete(event.code);
  const direction = keys[event.code];
  if (direction) { input[direction] = (direction !== 'drift' && joystickDirections[direction]) || Object.entries(keys).some(([key,value]) => value === direction && heldKeys.has(key)); (trackMode ? track : world).setInput(input); }
});
for (const button of document.querySelectorAll('[data-input]')) {
  button.setAttribute('aria-pressed','false');
  /** @param {boolean} pressed */
  const update = pressed => {
    if (pressed && document.querySelector('dialog[open]')) return;
    const direction = /** @type {keyof typeof input} */(button.getAttribute('data-input'));
    if (pressed) { ensureStarted(); (trackMode ? trackCanvas : canvas).focus({preventScroll:true}); }
    input[direction] = pressed;
    (trackMode ? track : world).setInput(input);
    button.classList.toggle('is-held',pressed);
    button.setAttribute('aria-pressed',String(pressed));
  };
  button.addEventListener('pointerdown',event => { event.preventDefault(); if (event instanceof PointerEvent) button.setPointerCapture(event.pointerId); update(true); });
  button.addEventListener('pointerup',() => update(false));
  button.addEventListener('pointercancel',() => update(false));
  button.addEventListener('lostpointercapture',() => update(false));
}
window.addEventListener('blur',() => { heldKeys.clear(); clearInput(); if (save.started && !document.querySelector('dialog[open]')) openDialog('pause-dialog'); });
document.addEventListener('visibilitychange',() => { if (document.hidden) { heldKeys.clear(); clearInput(); } syncPause(); });
window.addEventListener('pagehide',event => {
  persist();
  clearInput();
  world.setPaused(true);
  track.setPaused(true);
  audio.setDialogueActive(false);
  audio.setPaused(true);
  portrait.setActive(false);
  scene.setActive(false);
  sideScene.setActive(false);
  garageScene.setActive(false);
  if (!event.persisted) { joystick?.destroy(); world.destroy(); track.destroy(); portrait.destroy(); scene.destroy(); sideScene.destroy(); garageScene.destroy(); audio.destroy(); }
});
window.addEventListener('pageshow',() => { syncPause(); if (dialog('story-dialog').open) portrait.setActive(true); });
el('character-portrait').addEventListener('error',() => { const photo = /** @type {HTMLImageElement} */(el('character-portrait')); if (!photo.src.includes('/personal/')) photo.src = '../content/images/personal/optimized/1-800.webp'; });
world.setVehicle(save.vehicle);
world.restoreGarages(save.garages);
world.restorePosition({distance:restoredDistance,lane:save.lane,heading:save.heading});
world.setAnimationsEnabled(animationsEnabled);
track.setAnimationsEnabled(animationsEnabled);
applyLanguage();
if (save.started) world.start();
syncPause();
el('loading-state').hidden = true;
