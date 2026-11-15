import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CHAPTERS, COPY } from '../career-drive/story.js';
import { SAVE_KEY, PREVIOUS_SAVE_KEY, V2_SAVE_KEY, LEGACY_SAVE_KEY, isChapterIndex, parseSave, resolveLanguage, validateSave, nextUndiscoveredChapter } from '../career-drive/state.js';
import { GARAGE_STORIES } from '../career-drive/garage-stories.js';

const emptySave = {version:4,completed:[],selected:0,started:false,distance:0,lane:0,heading:0,vehicle:'taxi',ownedVehicles:['taxi'],garages:{cmax:{parkedVehicle:'cmax',exchanged:false},focus:{parkedVehicle:'focus',exchanged:false}}};

test('finishing a selected date continues forward before returning to missed earlier chapters', () => {
  assert.equal(nextUndiscoveredChapter([2],2),3);
  assert.equal(nextUndiscoveredChapter([2,3,4,5,6,7,8,9],9),0);
  assert.equal(nextUndiscoveredChapter([0,1,2,3,4,5,6,7,8,9],9),-1);
});

test('the road contains ten unique chapters in chronological order', () => {
  assert.deepEqual(CHAPTERS.map(chapter => chapter.id), [
    'school', 'internship', 'studies', 'university', 'systems', 'learning', 'design', 'community', 'netwise', 'next'
  ]);
  assert.deepEqual(CHAPTERS.map(chapter => chapter.year), [
    '2015', '11.2017', '2019', '01.2020', '01.2022', '2023–2024', '03.2025', '03.2025', '06.2026', '→'
  ]);
  assert.equal(new Set(CHAPTERS.map(chapter => chapter.id)).size, CHAPTERS.length);
});

test('every chapter and conversation is complete in Polish and English', () => {
  for (const chapter of CHAPTERS) {
    assert.ok(chapter.year.trim(), `${chapter.id}: missing year`);
    assert.ok(chapter.skills.length > 0, `${chapter.id}: missing skills`);
    assert.ok(chapter.skills.every(skill => typeof skill === 'string' && skill.trim()));
    assert.ok(chapter.questions.length >= 2, `${chapter.id}: needs conversation choices`);

    const fields = ['title', 'subtitle', 'tag', 'intro', 'takeaway'];
    for (const field of fields) {
      assert.deepEqual(Object.keys(chapter[field]).sort(), ['en', 'pl']);
      for (const language of ['pl', 'en']) {
        assert.equal(typeof chapter[field][language], 'string');
        assert.ok(chapter[field][language].trim(), `${chapter.id}.${field}.${language}`);
      }
    }

    for (const question of chapter.questions) {
      for (const field of ['label', 'answer']) {
        assert.deepEqual(Object.keys(question[field]).sort(), ['en', 'pl']);
        for (const language of ['pl', 'en']) {
          assert.equal(typeof question[field][language], 'string');
          assert.ok(question[field][language].trim(), `${chapter.id}: missing ${language} ${field}`);
        }
      }
    }
  }
});

test('both interface languages provide the same complete set of text', () => {
  assert.deepEqual(Object.keys(COPY).sort(), ['en', 'pl']);
  assert.deepEqual(Object.keys(COPY.pl).sort(), Object.keys(COPY.en).sort());
  for (const [language, entries] of Object.entries(COPY)) {
    for (const [key, value] of Object.entries(entries)) {
      assert.equal(typeof value, 'string', `${language}.${key}`);
      assert.ok(value.trim(), `${language}.${key}: empty translation`);
    }
  }
});

test('every translated HTML text and accessible label exists in both languages', async () => {
  const html = await readFile(new URL('../career-drive/index.html', import.meta.url), 'utf8');
  const keys = new Set([...html.matchAll(/data-(?:i18n|label)="([^"]+)"/g)].map(match => match[1]));
  assert.ok(keys.size > 0, 'the interface should expose its translation keys');
  for (const key of keys) {
    for (const language of ['pl', 'en']) {
      assert.equal(typeof COPY[language][key], 'string', `${key}: missing ${language} translation`);
      assert.ok(COPY[language][key].trim(), `${key}: empty ${language} translation`);
    }
  }
});

test('current and legacy saves use separate storage keys', () => {
  assert.equal(SAVE_KEY, 'career-drive:v4');
  assert.equal(PREVIOUS_SAVE_KEY, 'career-drive:v3');
  assert.equal(V2_SAVE_KEY, 'career-drive:v2');
  assert.equal(LEGACY_SAVE_KEY, 'career-drive:v1');
});

test('a valid current save round-trips all ten discoveries and road position', () => {
  const saved = {...emptySave,completed:[0,1,2,3,4,5,6,7,8,9],selected:9,started:true,distance:8543.25,lane:-220.5,heading:.35,vehicle:'focus',ownedVehicles:['taxi','cmax','focus'],garages:{cmax:{parkedVehicle:'taxi',exchanged:true},focus:{parkedVehicle:'cmax',exchanged:true}}};
  assert.deepEqual(parseSave(JSON.stringify(saved)), saved);
});

test('missing, malformed and non-object saves recover to a new journey', () => {
  const invalidSaves = [null, '', '{', '{"version":', 'null', 'false', '42', '"text"', '[]'];
  for (const serialized of invalidSaves) {
    assert.deepEqual(parseSave(serialized), emptySave, `unexpected recovery for ${serialized}`);
  }
});

test('unknown save versions are not interpreted as the current format', () => {
  for (const version of [undefined, 0, 5, 100, '1', '2', '3', '4', null]) {
    const saved = { version, completed: [0, 6], selected: 6, started: true };
    assert.deepEqual(parseSave(JSON.stringify(saved)), emptySave);
  }
});

test('discovery data removes duplicates and rejects invalid chapter indexes', () => {
  const saved = {
    version: 4,
    completed: [3, 3, -1, 0, 10, 8, 1.5, '2', null, {}, true, 0],
    selected: 3,
    started: true
  };
  assert.deepEqual(parseSave(JSON.stringify(saved)), {
    ...emptySave,completed:[3,0,8],selected:3,started:true
  });
});

test('invalid discovery collections cannot become chapter progress', () => {
  for (const completed of [undefined, null, false, 3, '0,1', { 0: 1 }]) {
    const result = parseSave(JSON.stringify({ version: 4, completed, selected: 2, started: true }));
    assert.deepEqual(result, {...emptySave,selected:2,started:true});
  }
});

test('invalid selected stops return to the first chapter without losing discoveries', () => {
  for (const selected of [undefined, null, -1, 10, 1.5, '2', true, {}, []]) {
    const result = parseSave(JSON.stringify({ version: 4, completed: [2], selected, started: true }));
    assert.deepEqual(result, {...emptySave,completed:[2],started:true});
  }
});

test('only a boolean true marks the game as started', () => {
  for (const started of [undefined, null, false, 1, 'true', {}, []]) {
    assert.equal(parseSave(JSON.stringify({ version: 4, started })).started, false);
  }
});

test('validation does not mutate supplied progress or reuse a previous journey', () => {
  const saved = {...emptySave,completed:[1,1,4],selected:4,started:true,distance:100,ownedVehicles:['taxi','cmax']};
  const result = validateSave(saved);
  assert.deepEqual(saved.completed, [1, 1, 4]);
  result.completed.push(6);
  result.ownedVehicles.push('focus');
  assert.deepEqual(saved.completed, [1, 1, 4]);
  assert.deepEqual(saved.ownedVehicles,['taxi','cmax']);
  const first = parseSave(null);
  first.completed.push(0);
  first.ownedVehicles.push('cmax');
  assert.deepEqual(parseSave(null), emptySave);
});

test('chapter indexes follow the current route boundaries', () => {
  assert.equal(isChapterIndex(0), true);
  assert.equal(isChapterIndex(CHAPTERS.length - 1), true);
  for (const value of [-1, CHAPTERS.length, 1.5, NaN, Infinity, '2', null, true, {}, []]) {
    assert.equal(isChapterIndex(value), false);
  }
});

test('road distance is finite and constrained to the playable road', () => {
  for (const [distance, expected] of [[-500, 0], [0, 0], [0.5, 0.5], [12299.75, 12299.75], [12300, 12300], [12301, 12300]]) {
    assert.equal(validateSave({ version: 4, distance }).distance, expected);
  }
  for (const distance of [undefined, null, NaN, Infinity, -Infinity, '500', false, {}, []]) {
    assert.equal(validateSave({ version: 4, distance }).distance, 0);
  }
});

test('legacy discoveries migrate to the matching historical chapters', () => {
  const saved = { version: 1, completed: [0, 1, 2, 3, 4, 5, 6], selected: 6, started: true };
  assert.deepEqual(parseSave(JSON.stringify(saved)), {
    ...emptySave,completed:[0,1,2,3,4,5,6,7,9],selected:9,started:true
  });
  assert.deepEqual(validateSave({ version: 1, completed: [0] }).completed, [0, 1, 2]);
  assert.deepEqual(validateSave({ version: 4, completed: [0] }).completed, [0]);
});

test('each legacy selection migrates without inventing a driving position', () => {
  const migratedSelections = [0, 3, 4, 5, 6, 7, 9];
  for (const [selected, expected] of migratedSelections.entries()) {
    const result = validateSave({ version: 1, selected, distance: 4000 });
    assert.equal(result.selected, expected);
    assert.equal(result.distance, 0);
  }
});

test('legacy migration ignores duplicates and invalid historical indexes', () => {
  const result = validateSave({
    version: 1, completed: [6, 0, 0, -1, 7, 1.5, '2', null, {}, true], selected: 7, started: true
  });
  assert.deepEqual(result,{...emptySave,completed:[9,0,1,2],started:true});
  for (const completed of [undefined, null, false, '0,1', { 0: 1 }]) {
    assert.deepEqual(validateSave({ version: 1, completed }).completed, []);
  }
  for (const selected of [undefined, null, -1, 7, 1.5, '2', true, {}, []]) {
    assert.equal(validateSave({ version: 1, selected }).selected, 0);
  }
  assert.equal(validateSave({ version: 1, started: 'true' }).started, false);
  const legacy = { version: 1, completed: [0, 0, 4], selected: 4, started: true };
  const migrated = validateSave(legacy);
  migrated.completed.push(8);
  assert.deepEqual(legacy.completed, [0, 0, 4]);
});

test('the previous nine-stop save keeps its future chapter without completing Netwise', () => {
  const previous = { version: 2, completed: [0,1,2,3,4,5,6,7,8], selected: 8, started: true, distance: 10700 };
  const migrated = validateSave(previous);
  assert.deepEqual(migrated,{...emptySave,completed:[0,1,2,3,4,5,6,7,9],selected:9,started:true,distance:12000});
  assert.equal(migrated.completed.includes(8), false);
  assert.deepEqual(previous.completed, [0,1,2,3,4,5,6,7,8]);
});

test('previous positions preserve old milestones and shift only the former final section', () => {
  for (const [distance, expected] of [[0,0],[300,300],[1600,1600],[6800,6800],[9400,9400],[10699.75,10699.75],[10700,12000],[10850,12150],[11000,12300],[11001,12300],[-2,0]]) {
    assert.equal(validateSave({ version: 2, distance }).distance, expected);
  }
  for (const distance of [undefined,null,NaN,Infinity,-Infinity,'10700',true,{},[]]) {
    assert.equal(validateSave({ version: 2, distance }).distance,0);
  }
});

test('previous selections and discoveries reject indexes that did not exist in that version', () => {
  assert.deepEqual(validateSave({ version: 2, completed:[8,8,7,9,-1,1.5,'2',null], selected:8 }),
    {...emptySave,completed:[9,7],selected:9});
  for (const selected of [undefined,null,9,10,-1,1.5,'8',true,{},[]]) {
    assert.equal(validateSave({ version:2, selected }).selected,0);
  }
  for (const completed of [undefined,null,false,'0,1',{0:1}]) {
    assert.deepEqual(validateSave({version:2,completed}).completed,[]);
  }
});

test('v3 keeps all ten chapter indexes and distance while waiting for manual car choices',()=>{
  const previous={version:3,completed:[0,4,8,9],selected:8,started:true,distance:10880,lane:250,heading:1.5,vehicle:'focus',ownedVehicles:['taxi','focus']};
  assert.deepEqual(validateSave(previous),{...emptySave,completed:[0,4,8,9],selected:8,started:true,distance:10880});
  for(const distance of [300,5500,10700,12000,12300]) {
    const migrated=validateSave({version:3,distance});
    assert.equal(migrated.distance,distance);
    assert.equal(migrated.vehicle,'taxi');
    assert.deepEqual(migrated.ownedVehicles,['taxi']);
  }
});

test('every older version starts with taxi ownership rather than inventing garage decisions',()=>{
  for(const version of [1,2,3]) {
    const migrated=validateSave({version,distance:9400,vehicle:'cmax',ownedVehicles:['taxi','cmax','focus'],lane:100,heading:2});
    assert.equal(migrated.version,4);
    assert.equal(migrated.vehicle,'taxi');
    assert.deepEqual(migrated.ownedVehicles,['taxi']);
    assert.equal(migrated.lane,0);assert.equal(migrated.heading,0);
  }
});

test('owned cars are distinct valid IDs with taxi always present and selected only when owned',()=>{
  const result=validateSave({version:4,vehicle:'focus',ownedVehicles:['focus','focus','unknown',null,{},true,'cmax','taxi']});
  assert.deepEqual(result.ownedVehicles,['taxi','focus','cmax']);
  assert.equal(result.vehicle,'focus');
  assert.equal(validateSave({version:4,vehicle:'cmax',ownedVehicles:['taxi','focus']}).vehicle,'taxi');
  assert.equal(validateSave({version:4,vehicle:'focus',ownedVehicles:['taxi']}).vehicle,'taxi');
  assert.equal(validateSave({version:4,vehicle:'taxi',ownedVehicles:['cmax']}).vehicle,'taxi');
});

test('invalid garage values cannot grant ownership or select an unknown car',()=>{
  for(const ownedVehicles of [undefined,null,false,'cmax,focus',3,{}, {'0':'focus'}]) {
    const result=validateSave({version:4,vehicle:'focus',ownedVehicles});
    assert.equal(result.vehicle,'taxi');assert.deepEqual(result.ownedVehicles,['taxi']);
  }
  for(const vehicle of [undefined,null,false,0,'Focus','rs',{},[]]) {
    assert.equal(validateSave({version:4,vehicle,ownedVehicles:['taxi','cmax','focus']}).vehicle,'taxi');
  }
});

test('free-driving lateral position and heading remain finite within restore boundaries',()=>{
  for(const [lane,expected] of [[-1000,-700],[-700,-700],[-.25,-.25],[0,0],[340.75,340.75],[700,700],[1000,700]]) {
    assert.equal(validateSave({version:4,lane}).lane,expected);
  }
  for(const [heading,expected] of [[-10,-Math.PI],[-Math.PI,-Math.PI],[-.5,-.5],[0,0],[.5,.5],[Math.PI,Math.PI],[10,Math.PI]]) {
    assert.equal(validateSave({version:4,heading}).heading,expected);
  }
  for(const value of [undefined,null,false,true,'100',NaN,Infinity,-Infinity,{},[]]) {
    const result=validateSave({version:4,lane:value,heading:value});
    assert.equal(result.lane,0);assert.equal(result.heading,0);
  }
});

test('garage parking and completed exchange positions survive a v4 round-trip',()=>{
  const saved={...emptySave,distance:10900,vehicle:'focus',ownedVehicles:['taxi','cmax','focus'],garages:{cmax:{parkedVehicle:'taxi',exchanged:true},focus:{parkedVehicle:'cmax',exchanged:true}}};
  const restored=parseSave(JSON.stringify(saved));
  assert.deepEqual(restored,saved);
  restored.garages.focus.parkedVehicle='taxi';
  assert.equal(saved.garages.focus.parkedVehicle,'cmax');
  const empty=validateSave(null);empty.garages.cmax.exchanged=true;
  assert.deepEqual(validateSave(null),emptySave);
});

test('v4 saves missing garage snapshots reconstruct parked cars without cloning the active car',()=>{
  const focus=validateSave({version:4,vehicle:'focus',ownedVehicles:['taxi','cmax','focus']});
  assert.deepEqual(focus.garages,{cmax:{parkedVehicle:'taxi',exchanged:true},focus:{parkedVehicle:'cmax',exchanged:true}});
  const directFocus=validateSave({version:4,vehicle:'focus',ownedVehicles:['taxi','focus']});
  assert.deepEqual(directFocus.garages,{cmax:{parkedVehicle:'cmax',exchanged:false},focus:{parkedVehicle:'taxi',exchanged:true}});
  const cmax=validateSave({version:4,vehicle:'cmax',ownedVehicles:['taxi','cmax','focus']});
  assert.deepEqual(cmax.garages,{cmax:{parkedVehicle:'taxi',exchanged:true},focus:{parkedVehicle:'focus',exchanged:false}});
  assert.deepEqual(validateSave({version:4,vehicle:'taxi',ownedVehicles:['taxi','cmax']}).garages,emptySave.garages);
});

test('garage validation keeps only fixed slots, valid car IDs and literal boolean exchange flags',()=>{
  const result=validateSave({version:4,garages:{cmax:{parkedVehicle:'unknown',exchanged:'true',extra:'ignored'},focus:{parkedVehicle:'taxi',exchanged:true},other:{parkedVehicle:'focus',exchanged:true}}});
  assert.deepEqual(result.garages,{cmax:{parkedVehicle:'cmax',exchanged:false},focus:{parkedVehicle:'taxi',exchanged:true}});
  for(const garages of [undefined,null,[],false,'cmax',7]) assert.deepEqual(validateSave({version:4,garages}).garages,emptySave.garages);
  for(const slot of [null,[],false,'focus',9]) {
    assert.deepEqual(validateSave({version:4,garages:{cmax:slot,focus:slot}}).garages,emptySave.garages);
  }
  const recovered=validateSave({version:4,vehicle:'focus',ownedVehicles:['taxi','focus'],garages:{focus:{parkedVehicle:Infinity,exchanged:1}}});
  assert.deepEqual(recovered.garages.focus,{parkedVehicle:'taxi',exchanged:true});
});

test('older saves cannot inject garage state before manual car ownership existed',()=>{
  for(const version of [1,2,3]) {
    const result=validateSave({version,garages:{cmax:{parkedVehicle:'focus',exchanged:true},focus:{parkedVehicle:'taxi',exchanged:true}}});
    assert.deepEqual(result.garages,emptySave.garages);
  }
});

test('garage stories contain the supplied personal car facts in both languages without purchase dates',()=>{
  assert.deepEqual(GARAGE_STORIES.map(story=>story.id),['cmax','focus']);
  for(const story of GARAGE_STORIES) for(const field of ['title','introduction','details']) {
    assert.deepEqual(Object.keys(story[field]).sort(),['en','pl']);
    for(const language of ['pl','en']) { assert.ok(story[field][language].trim());assert.doesNotMatch(story[field][language],/—/); }
  }
  const [cmax,focus]=GARAGE_STORIES;
  const cmaxPolish=Object.values(cmax).filter(value=>value?.pl).map(value=>value.pl).join(' ');
  const focusPolish=Object.values(focus).filter(value=>value?.pl).map(value=>value.pl).join(' ');
  const focusEnglish=Object.values(focus).filter(value=>value?.en).map(value=>value.en).join(' ');
  for (const fact of [/pierwsz/iu,/czarny/iu,/2009/]) assert.match(cmaxPolish,fact);
  assert.match(cmax.details.pl,/115 KM.*zakupie.*200 000/);
  assert.match(cmax.details.en,/115 hp.*200,000/);
  assert.match(focus.introduction.pl,/Focus RS/);
  assert.match(focus.introduction.pl,/Ken\w* Block\w*/u);
  assert.match(focus.introduction.pl,/2018.*USA/);
  for (const fact of [/250 KM/,/ponad 300 KM/,/blow-off/,/70 (?:000|tysięcy)/]) assert.match(focusPolish,fact);
  for (const fact of [/250 hp/,/more than 300 hp/,/70,000/]) assert.match(focusEnglish,fact);
});

test('the current biography reflects the supplied role, place and teaching dates', () => {
  const netwise = CHAPTERS.find(chapter => chapter.id === 'netwise');
  const design = CHAPTERS.find(chapter => chapter.id === 'design');
  const learning = CHAPTERS.find(chapter => chapter.id === 'learning');
  assert.equal(netwise.year,'06.2026');
  assert.match(netwise.subtitle.pl,/Netwise.*Warszawa/);
  assert.match(netwise.intro.pl,/obecnie/);
  assert.deepEqual(netwise.skills,['C#','.NET','Dynamics 365','CRM']);
  assert.match(design.subtitle.pl,/UI\/UX Designer.*Toruń/);
  assert.doesNotMatch(design.intro.pl,/architekt/iu);
  assert.doesNotMatch(design.intro.en,/architect/iu);
  assert.match(learning.questions[0].answer.pl,/od lutego do października 2025/);
  assert.match(learning.questions[0].answer.en,/from February to October 2025/);
});

test('a supported URL language takes precedence over the saved preference', () => {
  assert.equal(resolveLanguage('pl', 'en'), 'pl');
  assert.equal(resolveLanguage('en', 'pl'), 'en');
  assert.equal(resolveLanguage('en', null), 'en');
});

test('missing or unsupported URL languages use the saved supported preference', () => {
  for (const query of [null, '', 'de', 'EN', 'PL']) {
    assert.equal(resolveLanguage(query, 'en'), 'en');
    assert.equal(resolveLanguage(query, 'pl'), 'pl');
  }
});

test('invalid or missing language preferences safely default to Polish', () => {
  for (const saved of [null, '', 'de', 'EN', 'PL']) {
    assert.equal(resolveLanguage(null, saved), 'pl');
    assert.equal(resolveLanguage('unsupported', saved), 'pl');
  }
});
