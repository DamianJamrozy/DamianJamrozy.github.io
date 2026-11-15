import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { StoryScene, STORY_SCENE_IDS, CONVERSATION_TOPICS, TOPIC_CAPTIONS, conversationTopic, topicCaption, storySceneSample } from '../career-drive/story-scenes.js';
import { paintLifeScene } from '../career-drive/world-life.js';
import { CHAPTERS } from '../career-drive/story.js';
import { SIDE_STORIES } from '../career-drive/side-stories.js';

const globalNames = ['document','window','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'];
const originalGlobals = new Map();
const scenes = [];
let rafCallbacks;
let nextRafId;
let now;
let documentListeners;
let motionListeners;
let motionQuery;
let observers;

function createContext() {
  const calls = [];
  const texts = [];
  const rectangles = [];
  const gradient = {addColorStop() {}};
  return new Proxy({
    calls,texts,rectangles,
    measureText: text => ({width:text.length*6}),
    createRadialGradient: () => gradient,
    createLinearGradient: () => gradient,
    fillText(text,x,y) { texts.push({text,x,y}); calls.push(['fillText',text,x,y]); },
    roundRect(x,y,width,height,radius) { rectangles.push({x,y,width,height,radius}); calls.push(['roundRect',x,y,width,height,radius]); }
  },{
    get(target,key) {
      if (Reflect.has(target,key)) return Reflect.get(target,key);
      return (...args) => calls.push([String(key),...args]);
    }
  });
}

function createCanvas({width=500,height=180,supported=true}={}) {
  const context = createContext();
  return {
    context,dataset:{},width:0,height:0,
    bounds:{width,height},
    getContext: () => supported ? context : null,
    getBoundingClientRect() { return this.bounds; }
  };
}

function createScene(options={},canvasOptions={}) {
  const canvas = createCanvas(canvasOptions);
  const scene = new StoryScene(canvas,options);
  scenes.push(scene);
  return {scene,canvas,context:canvas.context};
}

function advance(milliseconds) {
  const end = now+milliseconds;
  while (now<end) {
    now = Math.min(now+50,end);
    const scheduled = [...rafCallbacks.values()];
    rafCallbacks.clear();
    for (const callback of scheduled) callback(now);
  }
}

beforeEach(() => {
  for (const name of globalNames) originalGlobals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));
  rafCallbacks = new Map();
  nextRafId = 1;
  now = 1000;
  documentListeners = new Map();
  motionListeners = new Set();
  observers = [];
  motionQuery = {
    matches:false,
    addEventListener: (_type,listener) => motionListeners.add(listener),
    removeEventListener: (_type,listener) => motionListeners.delete(listener)
  };
  Object.assign(globalThis,{
    document:{
      hidden:false,
      addEventListener: (type,listener) => documentListeners.set(type,listener),
      removeEventListener: type => documentListeners.delete(type)
    },
    window:{devicePixelRatio:1,matchMedia:() => motionQuery},
    ResizeObserver:class {
      constructor(callback) { this.callback=callback; this.disconnected=false; observers.push(this); }
      observe() {}
      disconnect() { this.disconnected=true; }
    },
    requestAnimationFrame(callback) {
      const id = nextRafId++;
      rafCallbacks.set(id,callback);
      return id;
    },
    cancelAnimationFrame: id => rafCallbacks.delete(id)
  });
});

afterEach(() => {
  for (const scene of scenes.splice(0)) scene.destroy();
  for (const [name,descriptor] of originalGlobals) {
    if (descriptor) Object.defineProperty(globalThis,name,descriptor);
    else delete globalThis[name];
  }
});

test('every chapter has a scene and learning starts with the medal presentation before the classroom', () => {
  assert.deepEqual(STORY_SCENE_IDS,['school','internship','studies','university','systems','learning','design','community','netwise','next']);
  assert.equal(storySceneSample('learning',0).kind,'award');
  assert.equal(storySceneSample('learning',9999).kind,'award');
  assert.equal(storySceneSample('learning',10000).kind,'lecture');
  assert.equal(storySceneSample('learning',17999).kind,'lecture');
  assert.equal(storySceneSample('learning',18000).kind,'award');
  assert.equal(storySceneSample('missing',0).scene,'next');
  assert.equal(storySceneSample('school',-100).seconds,0);
  assert.equal(storySceneSample('school',Infinity).seconds,0);
});

test('the shared ceremony places Damian on second place, between the heights of first and third', () => {
  const context = createContext();
  paintLifeScene(context,'award',3,'pl');
  const positions = ['1','2','3'].map(rank => context.texts.find(text => text.text===rank));
  assert.ok(positions.every(Boolean));
  const [first,second,third] = positions;
  const damian = context.texts.find(text => text.text==='DAMIAN');
  assert.equal(damian.x,second.x);
  assert.ok(second.x<first.x && first.x<third.x);
  const platformHeight = position => context.rectangles.find(rectangle => rectangle.width===50 && rectangle.height>10 && rectangle.x+25===position.x).height;
  assert.ok(platformHeight(first)>platformHeight(second));
  assert.ok(platformHeight(second)>platformHeight(third));
});

test('all chapter scenes render shared animated art without requiring images or DOM mutations', () => {
  const {scene,context,canvas} = createScene();
  for (const chapter of STORY_SCENE_IDS) {
    scene.setChapter(chapter);
    context.calls.length = 0;
    scene.render();
    const before = JSON.stringify(context.calls);
    scene.elapsed = 2300;
    context.calls.length = 0;
    scene.render();
    assert.notEqual(JSON.stringify(context.calls),before,`${chapter} should change its illustration over time`);
    assert.equal(canvas.dataset.scene,chapter);
  }
});

test('each conversation selects its own relevant scene using stable chapter and question identifiers', () => {
  const {scene,canvas}=createScene();
  const allTopics=Object.values(CONVERSATION_TOPICS).flat();
  assert.equal(new Set(allTopics).size,allTopics.length,'each question across the route has its own scene');
  for(const chapter of STORY_SCENE_IDS) {
    const topics=CONVERSATION_TOPICS[chapter];
    assert.equal(topics.length,CHAPTERS.find(item=>item.id===chapter).questions.length);
    assert.notEqual(topics[0],topics[1],`${chapter}: questions must show different moments`);
    for(const [question,topic] of topics.entries()) {
      scene.setConversation(chapter,question);
      assert.equal(scene.getState().scene,chapter);
      assert.equal(scene.getState().phase,topic);
      assert.equal(canvas.dataset.topic,topic);
    }
    scene.setConversation(chapter,null);
    assert.equal(scene.getState().topic,null);
  }
  assert.equal(conversationTopic('school',0),'games');
  assert.equal(conversationTopic('studies',1),'moving');
  assert.equal(conversationTopic('unknown',0),null);
  assert.equal(conversationTopic('school',2),null);
  assert.equal(conversationTopic('school',.5),null);
  assert.equal(conversationTopic('school',-1),null);
});

test('conversation scenes persist beyond the automatic intro cycle and replay the chosen topic', () => {
  const {scene,canvas}=createScene();
  scene.setConversation('learning',0);
  scene.setActive(true);
  advance(20500);
  assert.equal(scene.getState().phase,'lecture');
  assert.ok(scene.getState().frame>30);
  scene.replay();
  assert.equal(scene.getState().frame,0);
  assert.equal(scene.getState().phase,'lecture');
  scene.showTopic('graduation');
  advance(2500);
  assert.equal(scene.getState().phase,'graduation');
  scene.replay();
  assert.equal(canvas.dataset.phase,'graduation');
  assert.equal(scene.getState().frame,0);
  scene.showTopic('not-a-topic');
  assert.equal(scene.getState().topic,null);
  assert.equal(scene.getState().phase,'award');
});

test('the separate feniks.fm encounter and all its replies render without ASBiR branding or inherited employment dates',()=>{
  const radio=SIDE_STORIES.find(story=>story.id==='music');
  for(const width of [390,800]) {
    const {scene,context}=createScene({}, {width});
    for(const language of ['pl','en']) {
      scene.setLanguage(language);
      scene.setChapter(radio.chapterId);
      for(const topic of [radio.topic,...radio.questions.map(question=>question.topic)]) {
        scene.showTopic(topic);
        context.texts.length=0;
        scene.render();
        const labels=context.texts.map(item=>item.text);
        assert.ok(labels.length>0);
        assert.ok(labels.every(label=>!/ASBiR|POZNAŃ|2025|2020/iu.test(label)),`${width}.${language}.${topic}: ${labels.join(' | ')}`);
        if(topic==='radio') {
          assert.ok(labels.includes('FENIKS.FM'));
          assert.ok(labels.includes('ON AIR'));
        }
        if(topic==='hobbies') {
          assert.ok(labels.includes(language==='pl'?'PO PRACY':'AFTER WORK'));
          assert.ok(labels.includes('HOBBY'));
        }
      }
    }
  }
});

test('topics have different drawn geometry, animate their subject and provide complete bilingual captions', () => {
  const signatures=new Set();
  const {scene,context}=createScene();
  for(const topic of Object.keys(TOPIC_CAPTIONS)) {
    for(const language of ['pl','en']) assert.ok(topicCaption(topic,language)?.trim());
    scene.showTopic(topic);
    context.calls.length=0;
    scene.render();
    const before=JSON.stringify(context.calls);
    const geometry=JSON.stringify(context.calls.filter(call=>call[0]!=='fillText'));
    assert.ok(!signatures.has(geometry),`${topic}: scene should have its own geometry`);
    signatures.add(geometry);
    scene.elapsed=2300;
    context.calls.length=0;
    scene.render();
    assert.notEqual(JSON.stringify(context.calls),before,`${topic}: subject should move over time`);
  }
  assert.equal(topicCaption('unknown','pl'),null);
});

test('the training encounter and its replies stay personal on phone and desktop without employer names or dates', () => {
  const sport=SIDE_STORIES.find(story=>story.id==='sport');
  for(const width of [390,800]) {
    const {scene,context,canvas}=createScene({}, {width});
    for(const language of ['pl','en']) {
      scene.setLanguage(language);
      scene.setChapter(sport.chapterId);
      for(const topic of [sport.topic,...sport.questions.map(question=>question.topic)]) {
        scene.showTopic(topic);
        context.texts.length=0;
        scene.render();
        const labels=context.texts.map(item=>item.text);
        assert.equal(canvas.dataset.phase,topic);
        assert.ok(labels.includes(language==='pl'?'PO PRACY':'AFTER WORK'));
        assert.ok(labels.every(label=>!/ASBiR|POZNAŃ|2025|2026/iu.test(label)),`${width}.${language}.${topic}: ${labels.join(' | ')}`);
        if(topic==='training') {
          assert.ok(labels.includes(language==='pl'?'TERAZ':'NOW'));
          assert.ok(labels.includes(language==='pl'?'ĆWICZENIA SIŁOWE':'STRENGTH TRAINING'));
          assert.ok(labels.includes('KICKBOXING'));
        } else assert.ok(labels.includes('HOBBY'));
      }
    }
  }
});

test('strength and kickboxing artwork moves over time and retains the same readable pose with animation disabled', () => {
  const {scene,context}=createScene();
  scene.setChapter('next');
  scene.showTopic('training');
  context.calls.length=0;
  scene.render();
  const firstGeometry=context.calls.filter(call=>call[0]!=='fillText');
  scene.elapsed=2300;
  context.calls.length=0;
  scene.render();
  assert.notDeepEqual(context.calls.filter(call=>call[0]!=='fillText'),firstGeometry);
  scene.setAnimationsEnabled(false);
  context.calls.length=0;
  context.texts.length=0;
  scene.render();
  const staticGeometry=[...context.calls];
  assert.ok(context.texts.some(item=>item.text==='ĆWICZENIA SIŁOWE'));
  assert.ok(context.texts.some(item=>item.text==='KICKBOXING'));
  scene.elapsed=12000;
  context.calls.length=0;
  scene.render();
  assert.deepEqual(context.calls,staticGeometry);
  scene.setAnimationsEnabled(true);
  motionQuery.matches=true;
  for(const listener of motionListeners) listener();
  context.calls.length=0;
  scene.render();
  assert.deepEqual(context.calls,staticGeometry,'system reduced motion uses the same meaningful static training pose');
});

test('the scholarship certificate shows 250 students and the graduation cap is placed on the graduate', () => {
  const {scene,context}=createScene();
  scene.setChapter('studies');
  scene.showTopic('scholarship');
  assert.equal(scene.getState().phase,'scholarship');
  assert.ok(context.texts.some(text=>text.text==='250'));
  assert.ok(context.texts.some(text=>text.text==='ŚWIĘTOKRZYSKIE'));
  scene.showTopic('graduation');
  context.calls.length=0;
  scene.render();
  assert.ok(context.calls.some(call=>call[0]==='moveTo'&&call[1]===-28&&call[2]===-73));
  scene.elapsed=2200;
  context.calls.length=0;
  scene.render();
  assert.ok(context.calls.some(call=>call[0]==='moveTo'&&call[1]===-28&&call[2]===-9));
  scene.setAnimationsEnabled(false);
  scene.replay();
  context.calls.length=0;
  scene.render();
  assert.ok(context.calls.some(call=>call[0]==='moveTo'&&call[1]===-28&&call[2]===-9),'reduced motion retains a meaningful cap-on-head pose');
});

test('the thesis illustration distinguishes the hand/network/PJM pipeline from a robot conversation', () => {
  const {scene,context}=createScene();
  scene.showTopic('ai');
  context.texts.length=0;
  scene.render();
  assert.ok(context.texts.some(text=>text.text==='DŁOŃ → SIEĆ → PJM'));
  assert.ok(!context.texts.some(text=>text.text==='PRACA MAGISTERSKA'));
  scene.showTopic('robot');
  context.texts.length=0;
  scene.render();
  assert.ok(context.texts.some(text=>text.text==='PRACA MAGISTERSKA'));
  assert.ok(context.texts.some(text=>text.text==='PJM'));
  scene.setLanguage('en');
  context.texts.length=0;
  scene.render();
  assert.ok(context.texts.some(text=>text.text==='MASTER’S THESIS'));
});

test('garage topics show the real cars, animate walking and key handover, and replay their selected model', () => {
  const {scene,context,canvas}=createScene();
  scene.showTopic('cmax');
  context.calls.length=0;
  context.texts.length=0;
  scene.render();
  assert.equal(canvas.dataset.phase,'cmax');
  assert.ok(context.texts.some(text=>text.text==='FORD C-MAX · 2009'));
  assert.ok(context.texts.some(text=>text.text==='CZARNY DIESEL · 115 KM'));
  assert.ok(context.texts.some(text=>text.text==='TAXI'),'the first swap still shows the original taxi');
  assert.ok(context.calls.some(call=>call[0]==='translate'&&call[1]===-46&&call[2]===77));
  scene.elapsed=3100;
  context.calls.length=0;
  scene.render();
  assert.ok(context.calls.some(call=>call[0]==='translate'&&call[1]===37&&call[2]===77),'the driver walks to the new car');
  assert.ok(context.calls.some(call=>call[0]==='arc'&&call[1]===37&&call[2]===51&&call[3]===3.5),'the keys arrive with the driver');
  scene.showTopic('focus');
  context.texts.length=0;
  scene.render();
  assert.ok(context.texts.some(text=>text.text==='FORD FOCUS ST · 2018'));
  assert.ok(context.texts.some(text=>text.text==='USA → PL'));
  assert.ok(context.texts.some(text=>text.text==='250 → 300+ KM · BLOW-OFF'));
  assert.ok(!context.texts.some(text=>text.text==='TAXI'),'the second swap starts from the C-Max');
  scene.elapsed=3500;
  scene.replay();
  assert.equal(scene.getState().phase,'focus');
  assert.equal(scene.getState().frame,0);
  scene.setLanguage('en');
  context.texts.length=0;
  scene.render();
  assert.ok(context.texts.some(text=>text.text==='250 → 300+ HP · BLOW-OFF'));
  scene.setAnimationsEnabled(false);
  context.calls.length=0;
  scene.render();
  assert.ok(context.calls.some(call=>call[0]==='translate'&&call[1]===37&&call[2]===77),'reduced motion shows the completed handover');
});

test('an active scene advances its illustration and stops advancing when the dialog closes', () => {
  const {scene,canvas} = createScene();
  assert.equal(rafCallbacks.size,0);
  scene.setActive(true);
  assert.equal(rafCallbacks.size,1);
  advance(1550);
  assert.ok(scene.getState().frame>=2);
  assert.equal(canvas.dataset.active,'true');
  scene.setActive(false);
  const paused = scene.getState();
  assert.equal(rafCallbacks.size,0);
  advance(5000);
  assert.deepEqual(scene.getState(),paused);
  assert.equal(canvas.dataset.active,'false');
});

test('replaying the same chapter resets its clock and showMoment selects award or lecture without changing chapter', () => {
  const {scene,canvas,context} = createScene();
  scene.setChapter('learning');
  scene.setActive(true);
  advance(1400);
  assert.ok(scene.getState().frame>0);
  scene.showMoment('lecture');
  assert.equal(scene.getState().phase,'lecture');
  assert.ok(context.texts.some(text => text.text==='2025'));
  scene.setChapter('learning');
  assert.equal(scene.getState().phase,'award');
  assert.equal(scene.getState().frame,0);
  assert.equal(canvas.dataset.phase,'award');
  scene.showMoment('lecture');
  scene.showMoment('award');
  assert.equal(scene.getState().phase,'award');
  scene.setChapter('design');
  scene.showMoment('lecture');
  assert.equal(scene.getState().phase,'design');
});

test('phase notifications fire on actual moment changes rather than every rendered frame', () => {
  const phases = [];
  const {scene} = createScene({onPhaseChange:phase => phases.push(phase)});
  scene.setChapter('learning');
  scene.setActive(true);
  const before = phases.length;
  advance(1500);
  assert.equal(phases.length,before);
  scene.showMoment('lecture');
  assert.equal(phases.at(-1),'lecture');
  const lectureCount = phases.length;
  advance(1200);
  scene.setLanguage('en');
  assert.equal(phases.length,lectureCount);
  scene.setChapter('learning');
  assert.equal(phases.at(-1),'award');
  advance(10100);
  assert.equal(phases.at(-1),'lecture');
});

test('visible place names and scene details follow the selected language', () => {
  const {scene,context} = createScene();
  scene.setLanguage('en');
  scene.setChapter('netwise');
  context.texts.length = 0;
  scene.render();
  assert.ok(context.texts.some(text => text.text==='WARSAW'));
  assert.ok(context.texts.some(text => text.text==='NETWISE · WARSAW'));
  assert.ok(!context.texts.some(text => text.text.includes('WARSZAWA')));

  scene.setLanguage('pl');
  scene.setChapter('university');
  context.texts.length = 0;
  scene.render();
  assert.ok(context.texts.some(text => text.text==='WSPARCIE IT'));
  assert.ok(context.texts.some(text => text.text==='UR · WSPARCIE IT'));

  scene.setChapter('systems');
  context.texts.length = 0;
  scene.render();
  assert.ok(context.texts.some(text => text.text==='AUTOMATYZACJA'));
  assert.ok(context.texts.some(text => text.text==='UCI · DANE / SYSTEMY'));
  assert.ok(!context.texts.some(text => text.text.includes('DATA / SYSTEMS')));

  scene.setChapter('next');
  context.texts.length = 0;
  scene.render();
  assert.ok(context.texts.some(text => text.text==='DALEJ'));
  assert.ok(!context.texts.some(text => text.text==='NEXT'));
});

test('disabled animation and reduced-motion preferences retain a static meaningful scene', () => {
  const {scene,canvas} = createScene();
  scene.setChapter('learning');
  scene.setAnimationsEnabled(false);
  scene.setActive(true);
  assert.equal(rafCallbacks.size,0);
  assert.equal(canvas.dataset.phase,'award');
  assert.equal(scene.getState().animationsEnabled,false);
  scene.setAnimationsEnabled(true);
  assert.equal(rafCallbacks.size,1);
  motionQuery.matches = true;
  for (const listener of motionListeners) listener();
  const reducedState = scene.getState();
  assert.equal(rafCallbacks.size,0);
  advance(8000);
  assert.deepEqual(scene.getState(),reducedState);
  motionQuery.matches = false;
  for (const listener of motionListeners) listener();
  assert.equal(rafCallbacks.size,1);
});

test('a hidden page freezes and resumes the current moment without catching up hidden time', () => {
  const {scene} = createScene();
  scene.setActive(true);
  advance(1300);
  document.hidden = true;
  documentListeners.get('visibilitychange')();
  const before = scene.elapsed;
  assert.equal(rafCallbacks.size,0);
  advance(20000);
  document.hidden = false;
  documentListeners.get('visibilitychange')();
  advance(100);
  assert.ok(scene.elapsed-before<=100);
});

test('mobile resize keeps a bounded pixel ratio and missing canvas support leaves the story usable', () => {
  window.devicePixelRatio = 3;
  const {scene,canvas} = createScene({}, {width:300,height:145});
  assert.equal(canvas.width,450);
  assert.equal(canvas.height,218);
  canvas.bounds = {width:360,height:160};
  observers[0].callback();
  assert.equal(canvas.width,540);
  scene.setLanguage('en');
  const fallback = createScene({}, {supported:false});
  fallback.scene.setChapter('netwise');
  fallback.scene.setActive(true);
  assert.equal(fallback.canvas.dataset.supported,'false');
  assert.equal(rafCallbacks.size,0);
});

test('destroy cancels animation and removes observers and preference listeners', () => {
  const {scene,context,canvas} = createScene();
  scene.setActive(true);
  advance(1000);
  scene.destroy();
  const callsBefore = context.calls.length;
  advance(10000);
  assert.equal(context.calls.length,callsBefore);
  assert.equal(rafCallbacks.size,0);
  assert.equal(documentListeners.size,0);
  assert.equal(motionListeners.size,0);
  assert.ok(observers.every(observer => observer.disconnected));
  assert.equal(canvas.dataset.active,'false');
});
