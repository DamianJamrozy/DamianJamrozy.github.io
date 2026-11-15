// @ts-check
import { paintLifeScene } from './world-life.js';

/** @typedef {'school'|'internship'|'studies'|'university'|'systems'|'learning'|'design'|'community'|'netwise'|'next'} StorySceneId */
/** @typedef {'pl'|'en'} Language */
/** @typedef {{onPhaseChange?:(phase:string)=>void}} StorySceneOptions */

export const STORY_SCENE_IDS = Object.freeze([
  'school','internship','studies','university','systems','learning','design','community','netwise','next'
]);

/** @typedef {'scholarship'|'graduation'|'moving'|'ai'|'robot'|'games'|'qualifications'|'frontend'|'integration'|'uxflow'|'infrastructure'|'graphics'|'database'|'automation'|'accessibility'|'radio'|'festival'|'asbir'|'plugins'|'hobbies'|'training'|'crm'|'experience'|'collaboration'|'award'|'lecture'|'cmax'|'focus'} ConversationTopic */
/** @type {Record<ConversationTopic,{pl:string,en:string}>} */
export const TOPIC_CAPTIONS = Object.freeze({
  scholarship:{pl:'250 najlepszych uczniów · Świętokrzyskie',en:'250 top students · Świętokrzyskie'},
  graduation:{pl:'Dyplom i czapka absolwenta · UR',en:'Diploma and graduation cap · UR'},
  moving:{pl:'Z rodzinnej miejscowości do Rzeszowa · mój nowy dom',en:'From my hometown to Rzeszów · my new home'},
  ai:{pl:'Dłoń → sieć → wynik · metody uczenia maszynowego',en:'Hand → network → result · machine learning'},
  robot:{pl:'Moja praca magisterska - PJM',en:'My master’s thesis - PJM'},
  games:{pl:'Gry · od gracza do twórcy',en:'Games · from player to creator'},
  qualifications:{pl:'E12 · E13 · E14 · umiejętności techniczne',en:'E12 · E13 · E14 · technical skills'},
  frontend:{pl:'Pierwszy interfejs · HTML, CSS i JavaScript',en:'A first interface · HTML, CSS and JavaScript'},
  integration:{pl:'Frontend · technologia spotyka wygląd',en:'Frontend · technology meets visual design'},
  uxflow:{pl:'Ścieżka użytkownika · od celu do efektu',en:'The user journey · from goal to result'},
  infrastructure:{pl:'Komputery, sieć i infrastruktura instytutu',en:'Computers, networks and institute infrastructure'},
  graphics:{pl:'Grafika · kompozycja, kolor i pomysł',en:'Graphics · composition, colour and ideas'},
  database:{pl:'Baza danych · zapytanie i wynik',en:'Database · query and result'},
  automation:{pl:'Automatyzacja · powtarzalne zadania w ruchu',en:'Automation · repeated tasks in motion'},
  accessibility:{pl:'Dostępny interfejs · klawiatura i kontrast',en:'Accessible interfaces · keyboard and contrast'},
  radio:{pl:'feniks.fm · rozmowy i dźwięk',en:'feniks.fm · conversations and sound'},
  festival:{pl:'KultURalia · koncerty, tłum i wspólna energia',en:'KultURalia · live music, crowds and shared energy'},
  asbir:{pl:'ASBiR · administracja systemu i WordPress',en:'ASBiR · system administration and WordPress'},
  plugins:{pl:'WordPress · dedykowane wtyczki',en:'WordPress · custom plugins'},
  hobbies:{pl:'Po pracy · fortepian i sztuki walki',en:'After work · piano and martial arts'},
  training:{pl:'Siłownia · ćwiczenia siłowe i kickboxing',en:'Gym · strength training and kickboxing'},
  crm:{pl:'Dynamics 365 · proces i relacja z klientem',en:'Dynamics 365 · processes and customer relationships'},
  experience:{pl:'Kod, dane, UX i nauczanie · wspólna perspektywa',en:'Code, data, UX and teaching · a shared perspective'},
  collaboration:{pl:'Pomysł, plan i wspólny projekt',en:'An idea, a plan and a shared project'},
  award:{pl:'2024 · finał konkursu SEP',en:'2024 · SEP competition final'},
  lecture:{pl:'Zajęcia na Uniwersytecie Rzeszowskim',en:'Teaching at the University of Rzeszów'},
  cmax:{pl:'Czas na własne cztery kółka',en:'Time for a car of my own'},
  focus:{pl:'Od inspiracji do własnego ST',en:'From inspiration to my own ST'}
});

/** @param {string} topic @param {Language} language */
export function topicCaption(topic,language) {
  return Object.hasOwn(TOPIC_CAPTIONS,topic)
    ? TOPIC_CAPTIONS[/** @type {ConversationTopic} */(topic)][language] : null;
}

/** Stable chapter/question positions select a relevant illustration, independently of translated text. */
export const CONVERSATION_TOPICS = Object.freeze(/** @type {Record<StorySceneId,readonly ConversationTopic[]>} */({
  school:['games','qualifications'],
  internship:['frontend','integration'],
  studies:['graduation','moving'],
  university:['infrastructure','graphics'],
  systems:['database','automation'],
  learning:['lecture','award'],
  design:['uxflow','accessibility'],
  community:['asbir','plugins'],
  netwise:['crm','experience'],
  next:['ai','collaboration']
}));

/** @param {string} chapter @param {number|null} question @returns {ConversationTopic|null} */
export function conversationTopic(chapter,question) {
  if (question === null || !Number.isInteger(question) || question<0) return null;
  const topics=CONVERSATION_TOPICS[/** @type {StorySceneId} */(chapter)];
  return topics?.[question] ?? null;
}

/** @type {Record<StorySceneId,{place:string,year:string,detail:{pl:string,en:string},tone:string}>} */
const PRESENTATION = {
  school:{place:'STASZÓW',year:'2015',detail:{pl:'Pierwszy kierunek',en:'Finding a direction'},tone:'#31492d'},
  internship:{place:'ARKONSOFT',year:'2017',detail:{pl:'Pierwsze linie kodu',en:'First lines of code'},tone:'#263b48'},
  studies:{place:'RZESZÓW',year:'2019',detail:{pl:'Nowe miasto',en:'A new city'},tone:'#314637'},
  university:{place:'RZESZÓW · UR',year:'2020',detail:{pl:'Technologia dla ludzi',en:'Technology for people'},tone:'#304838'},
  systems:{place:'RZESZÓW · UCI',year:'2022',detail:{pl:'Systemy i dane',en:'Systems and data'},tone:'#213c45'},
  learning:{place:'RZESZÓW',year:'2024',detail:{pl:'Finał konkursu SEP',en:'SEP competition final'},tone:'#4c3c26'},
  design:{place:'TORUŃ',year:'2025',detail:{pl:'Projektowanie UI/UX',en:'UI/UX design'},tone:'#383a4b'},
  community:{place:'POZNAŃ · ASBiR',year:'2025',detail:{pl:'Administracja stron',en:'Website administration'},tone:'#3d4630'},
  netwise:{place:'WARSZAWA',year:'2026',detail:{pl:'Programista .NET',en:'.NET developer'},tone:'#223b50'},
  next:{place:'→',year:'',detail:{pl:'Kolejny rozdział',en:'The next chapter'},tone:'#34462f'}
};

/**
 * Learning has two distinct moments; the medal ceremony remains the first view.
 * @param {string} chapter
 * @param {number} elapsedMilliseconds
 * @param {ConversationTopic|null} [topic]
 */
export function storySceneSample(chapter,elapsedMilliseconds,topic=null) {
  const scene = /** @type {StorySceneId} */(STORY_SCENE_IDS.includes(chapter) ? chapter:'next');
  const elapsed = Number.isFinite(elapsedMilliseconds) ? Math.max(0,elapsedMilliseconds) : 0;
  const learningTime = elapsed % 18000;
  const lecture = scene === 'learning' && learningTime >= 10000;
  const kind = topic ?? (scene === 'learning' ? (lecture ? 'lecture':'award') : scene === 'studies' ? 'moving' : scene);
  return {
    scene,
    kind,
    phase:kind,
    seconds:scene === 'learning' && !topic ? (lecture ? learningTime-10000:learningTime)/1000 : elapsed/1000,
    frame:Math.floor(elapsed/500)
  };
}

/** A bounded, pausable performance for the illustration inside a dialogue. */
export class StoryScene {
  /** @param {HTMLCanvasElement} canvas @param {StorySceneOptions} [options] */
  constructor(canvas,options={}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d',{alpha:false});
    /** @type {StorySceneId} */
    this.chapter = 'school';
    /** @type {ConversationTopic|null} */
    this.topic = null;
    /** @type {Language} */
    this.language = 'pl';
    this.active = false;
    this.animationsEnabled = true;
    this.destroyed = false;
    this.elapsed = 0;
    this.lastTimestamp = 0;
    this.lastPaint = 0;
    this.frameRequest = 0;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.lastPhase = '';
    this.onPhaseChange = options.onPhaseChange;
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.canvas.dataset.supported = String(this.context !== null);
    this.onVisibilityChange = () => this.refreshAnimation();
    this.onMotionChange = () => this.refreshAnimation();
    document.addEventListener('visibilitychange',this.onVisibilityChange);
    this.motionQuery.addEventListener('change',this.onMotionChange);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }

  get motionAllowed() {
    return this.active && this.animationsEnabled && !this.motionQuery.matches && !document.hidden && !this.destroyed && this.context !== null;
  }

  /** @param {string} id */
  setChapter(id) {
    this.chapter = /** @type {StorySceneId} */(STORY_SCENE_IDS.includes(id) ? id:'next');
    this.topic = null;
    this.replay();
  }

  /** @param {string} chapter @param {number|null} question */
  setConversation(chapter,question) {
    this.chapter = /** @type {StorySceneId} */(STORY_SCENE_IDS.includes(chapter) ? chapter:'next');
    this.topic = conversationTopic(this.chapter,question);
    this.replay();
  }

  /** Side conversations can select their own topic without pretending it is another career chapter.
   * @param {string} topic
   */
  showTopic(topic) {
    this.topic = Object.hasOwn(TOPIC_CAPTIONS,topic) ? /** @type {ConversationTopic} */(topic) : null;
    this.replay();
  }

  replay() {
    this.elapsed = 0;
    this.lastTimestamp = 0;
    this.lastPaint = 0;
    this.render();
    this.schedule();
  }

  /** @param {'award'|'lecture'} moment */
  showMoment(moment) {
    if (this.chapter !== 'learning') return;
    this.topic = null;
    this.elapsed = moment === 'lecture' ? 10000 : 0;
    this.lastTimestamp = 0;
    this.lastPaint = 0;
    this.render();
    this.schedule();
  }

  /** @param {Language} language */
  setLanguage(language) {
    this.language = language;
    this.render();
  }

  /** @param {boolean} active */
  setActive(active) {
    if (this.destroyed) return;
    this.active = active;
    if (active) this.resize();
    this.refreshAnimation();
  }

  /** @param {boolean} enabled */
  setAnimationsEnabled(enabled) {
    this.animationsEnabled = enabled;
    this.refreshAnimation();
  }

  refreshAnimation() {
    this.cancelFrame();
    this.lastTimestamp = 0;
    this.lastPaint = 0;
    this.render();
    this.schedule();
  }

  schedule() {
    if (!this.motionAllowed || this.frameRequest) return;
    this.frameRequest = requestAnimationFrame(time => this.tick(time));
  }

  cancelFrame() {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = 0;
  }

  /** @param {number} time */
  tick(time) {
    this.frameRequest = 0;
    if (!this.motionAllowed) return;
    const delta = this.lastTimestamp ? Math.max(0,Math.min(time-this.lastTimestamp,100)) : 0;
    this.lastTimestamp = time;
    this.elapsed += delta;
    if (!this.lastPaint || time-this.lastPaint >= 1000/24) {
      this.render();
      this.lastPaint = time;
    }
    this.schedule();
  }

  resize() {
    if (this.destroyed) return;
    const bounds = this.canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    this.width = bounds.width;
    this.height = bounds.height;
    this.dpr = Math.min(window.devicePixelRatio || 1,1.5);
    this.canvas.width = Math.round(this.width*this.dpr);
    this.canvas.height = Math.round(this.height*this.dpr);
    this.render();
  }

  getState() {
    const sample = storySceneSample(this.chapter,this.elapsed,this.topic);
    return {active:this.active,scene:sample.scene,topic:this.topic,phase:sample.phase,frame:sample.frame,animationsEnabled:this.animationsEnabled && !this.motionQuery.matches};
  }

  render() {
    if (this.destroyed) return;
    const sample = storySceneSample(this.chapter,this.elapsed,this.topic);
    this.canvas.dataset.scene = sample.scene;
    this.canvas.dataset.phase = sample.phase;
    this.canvas.dataset.topic = this.topic ?? '';
    this.canvas.dataset.active = String(this.active);
    this.canvas.dataset.frame = String(sample.frame);
    if (sample.phase !== this.lastPhase) {
      this.lastPhase = sample.phase;
      this.onPhaseChange?.(sample.phase);
    }
    if (!this.context || this.width < 1 || this.height < 1) return;
    const ctx = this.context;
    const compact = this.width < 420;
    const logicalWidth = compact ? 480 : 640;
    const scale = Math.min(this.width/logicalWidth,this.height/250);
    const offsetX = (this.width-logicalWidth*scale)/2;
    const offsetY = (this.height-250*scale)/2;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    ctx.fillStyle = '#101914';
    ctx.fillRect(0,0,this.width,this.height);
    ctx.save();
    ctx.translate(offsetX,offsetY);
    ctx.scale(scale,scale);
    this.paintBackdrop(ctx,logicalWidth,sample.kind);
    const presentation = PRESENTATION[sample.scene];
    const lecture = sample.kind === 'lecture';
    const topicCaption = TOPIC_CAPTIONS[/** @type {ConversationTopic} */(sample.kind)]?.[this.language];
    ctx.fillStyle = '#d6b46c';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    const garage = sample.kind === 'cmax' || sample.kind === 'focus';
    const personal = sample.kind === 'hobbies' || sample.kind === 'training' || (sample.scene === 'next' && sample.kind === 'games');
    const place = garage ? (this.language==='pl'?'MÓJ GARAŻ':'MY GARAGE') : sample.kind === 'festival' ? 'RZESZÓW · KULTURALIA' : sample.kind === 'radio' ? 'FENIKS.FM' : personal ? (this.language==='pl'?'PO PRACY':'AFTER WORK') : sample.kind === 'scholarship' ? 'ŚWIĘTOKRZYSKIE' : sample.kind === 'robot' || sample.kind === 'ai' ? 'PJM · AI' : sample.scene === 'netwise' && this.language === 'en' ? 'WARSAW' : presentation.place;
    ctx.fillText(place,22,30);
    ctx.font = sample.kind==='cmax'?'700 32px Georgia, serif':'700 40px Georgia, serif';
    ctx.fillStyle = '#ebe2c7';
    ctx.fillText(sample.kind==='festival'?'LIVE':sample.kind==='radio'?'ON AIR':sample.kind==='training'?(this.language==='pl'?'TERAZ':'NOW'):personal?'HOBBY':sample.kind==='cmax'?'C-MAX':sample.kind==='focus'?'ST':lecture ? '2025' : sample.kind === 'scholarship' ? '250' : sample.kind === 'graduation' ? 'UR' : sample.kind === 'ai' || sample.kind === 'robot' ? 'AI' : presentation.year,22,72);
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = '#bdcbb7';
    const detail = topicCaption ?? presentation.detail[this.language];
    this.paintWords(ctx,detail,22,94,compact ? 120:175);
    ctx.save();
    ctx.translate(compact ? 300 : 370,140);
    ctx.scale(1.05,1.05);
    const illustrationTime = !this.animationsEnabled || this.motionQuery.matches ? 3 : sample.seconds;
    paintLifeScene(ctx,sample.kind,illustrationTime,this.language);
    ctx.restore();
    if (!compact) this.paintDetail(ctx,sample.scene,logicalWidth,lecture,sample.kind);
    ctx.restore();
  }

  /** @param {CanvasRenderingContext2D} ctx @param {number} width @param {string} kind */
  paintBackdrop(ctx,width,kind) {
    const sample = storySceneSample(this.chapter,this.elapsed,this.topic);
    const tone = PRESENTATION[sample.scene].tone;
    const light = ctx.createRadialGradient(width*.6,80,5,width*.6,140,width*.7);
    light.addColorStop(0,tone);
    light.addColorStop(1,'#101914');
    ctx.fillStyle = light;
    ctx.fillRect(0,0,width,250);
    ctx.fillStyle = '#08130d66';
    ctx.fillRect(0,218,width,32);
    ctx.strokeStyle = '#d6b46c1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18,218);
    ctx.lineTo(width-18,218);
    ctx.stroke();
    if (kind === 'award') {
      ctx.fillStyle = '#d6b46c0d';
      for (const x of [210,width-100]) {
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x-90,218);
        ctx.lineTo(x+90,218);
        ctx.closePath();
        ctx.fill();
      }
    } else if (['design','netwise','systems','internship','ai','robot','database','automation','crm','frontend','accessibility','plugins','cmax','focus'].includes(kind)) {
      ctx.strokeStyle = '#9abcb00b';
      ctx.beginPath();
      for (let x=0;x<=width;x+=28) { ctx.moveTo(x,0); ctx.lineTo(x,218); }
      for (let y=22;y<=218;y+=28) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
      ctx.stroke();
    } else {
      ctx.fillStyle = '#b7c89406';
      for (const x of [width*.32,width*.77]) {
        ctx.beginPath();
        ctx.arc(x,155,75,0,Math.PI*2);
        ctx.fill();
      }
    }
  }

  /** @param {CanvasRenderingContext2D} ctx @param {StorySceneId} scene @param {number} width @param {boolean} lecture @param {string} [kind] */
  paintDetail(ctx,scene,width,lecture,kind=scene) {
    const details = {
      school:['IT','HTML · CSS'],internship:['FRONTEND','HTML · JS'],studies:['UR','2019 →'],
      university:['UR',this.language === 'pl' ? 'WSPARCIE IT':'IT SUPPORT'],
      systems:['MSSQL',this.language === 'pl' ? 'AUTOMATYZACJA':'AUTOMATION'],learning:['II','DAMIAN'],
      design:['UI / UX','SSC MASTER'],community:['ASBiR',this.language === 'pl' ? 'ADMINISTRACJA':'ADMINISTRATION'],
      netwise:['NETWISE','.NET · CRM'],next:[this.language === 'pl' ? 'DALEJ':'NEXT','→']
    };
    ctx.textAlign = 'right';
    ctx.fillStyle = '#d6b46c';
    ctx.font = '700 15px Inter, sans-serif';
    const personal = kind === 'hobbies' || kind === 'training' || (scene === 'next' && kind === 'games');
    const topicLabel = kind==='festival'?'KultURalia':kind==='radio'?'feniks.fm':kind==='training'?(this.language==='pl'?'TRENING':'TRAINING'):personal?'HOBBY':kind==='plugins'?'WordPress':kind==='cmax'?'2009':kind==='focus'?'2018':kind === 'scholarship' ? '2019' : kind === 'graduation' ? '2023 · 2024' : kind === 'ai' || kind === 'robot' ? 'PJM' : null;
    ctx.fillText(lecture ? 'UR' : topicLabel ?? details[scene][0],width-20,30);
    ctx.fillStyle = '#aabca4';
    ctx.font = '500 10px Inter, sans-serif';
    const second = kind==='festival'?(this.language==='pl'?'KONCERTY · LUDZIE':'LIVE MUSIC · PEOPLE'):kind==='radio'?(this.language==='pl'?'AUDYCJE · WYWIADY':'SHOWS · INTERVIEWS'):kind==='training'?(this.language==='pl'?'SIŁOWNIA · KICKBOXING':'GYM · KICKBOXING'):personal?(this.language==='pl'?'MUZYKA · SPORT · GRY':'MUSIC · SPORT · GAMES'):kind==='plugins'?(this.language==='pl'?'WTYCZKI':'PLUGINS'):kind==='cmax'?(this.language==='pl'?'115 KM · DIESEL':'115 HP · DIESEL'):kind==='focus'?(this.language==='pl'?'300+ KM · USA':'300+ HP · USA'):lecture ? (this.language === 'pl' ? 'NAUCZANIE':'TEACHING') : details[scene][1];
    ctx.fillText(second,width-20,49);
  }

  /** @param {CanvasRenderingContext2D} ctx @param {string} text @param {number} x @param {number} y @param {number} width */
  paintWords(ctx,text,x,y,width) {
    let line = '';
    let baseline = y;
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) {
        ctx.fillText(line,x,baseline);
        line = word;
        baseline += 17;
      } else line = next;
    }
    if (line) ctx.fillText(line,x,baseline);
  }

  destroy() {
    this.cancelFrame();
    this.active = false;
    this.destroyed = true;
    this.canvas.dataset.active = 'false';
    this.observer.disconnect();
    document.removeEventListener('visibilitychange',this.onVisibilityChange);
    this.motionQuery.removeEventListener('change',this.onMotionChange);
  }
}
