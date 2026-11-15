import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FESTIVAL, festivalPresence } from '../career-drive/festival.js';
import { STATIONS } from '../career-drive/world.js';
import { CHAPTERS } from '../career-drive/story.js';
import { SIDE_STORIES } from '../career-drive/side-stories.js';
import { conversationTopic } from '../career-drive/story-scenes.js';
import { getWorldRegion } from '../career-drive/regions.js';

test('KultURalia is an optional stop on the right between university life and UCI, with sound based on actual car proximity',()=>{
  const university=STATIONS.find(station=>station.id==='university');
  const systems=STATIONS.find(station=>station.id==='systems');
  const festival=SIDE_STORIES.find(story=>story.id==='festival');
  assert.ok(FESTIVAL.distance>university.distance && FESTIVAL.distance<systems.distance);
  assert.equal(festival.distance,FESTIVAL.distance);
  assert.equal(festival.side,1);
  assert.ok(FESTIVAL.offset>0);
  assert.equal(festivalPresence(FESTIVAL.distance,FESTIVAL.offset),1);
  const road=festivalPresence(FESTIVAL.distance,0);
  assert.ok(road>0 && road<1);
  assert.ok(festivalPresence(FESTIVAL.distance,-200)<road);
  assert.equal(festivalPresence(FESTIVAL.distance-1500,0),0);
  assert.equal(festivalPresence(FESTIVAL.distance+1500,0),0);
  for(const invalid of [NaN,Infinity,-Infinity]) {
    assert.equal(festivalPresence(invalid,0),0);
    assert.equal(festivalPresence(0,invalid),0);
  }
});

test('KultURalia tells its own student event story while the later ASBiR chapter stays focused on its work',()=>{
  const community=CHAPTERS.find(chapter=>chapter.id==='community');
  assert.equal(community.questions.length,2);
  assert.equal(conversationTopic('community',0),'asbir');
  const work=community.questions.map(question=>question.answer.pl).join(' ');
  assert.match(work,/asbir\.pl/);
  assert.match(work,/festiwaladr\.pl/);
  assert.match(work,/WordPress/);
  for(const question of community.questions) for(const language of ['pl','en']) assert.doesNotMatch(question.answer[language],/KultURalia/i);
  const radio=SIDE_STORIES.find(story=>story.id==='music');
  assert.equal(radio.topic,'radio');
  const festival=SIDE_STORIES.find(story=>story.id==='festival');
  assert.equal(festival.topic,'festival');
  for(const language of ['pl','en']) {
    const story=[festival.intro[language],...festival.questions.map(question=>question.answer[language])].join(' ');
    assert.match(story,/koncert|concert/i);
    assert.match(story,/tłum|crowd/i);
    assert.match(festival.intro[language],/organiz|organis/i);
  }
  assert.equal(conversationTopic('community',1),'plugins');
  assert.equal(conversationTopic('community',2),null);
});

test('the festival describes artist liaison and keeps the sourced 2024 forecast distinct from an attendance record',()=>{
  const festival=SIDE_STORIES.find(story=>story.id==='festival');
  const role=festival.questions[0].answer;
  assert.match(role.pl,/kontakt z artystami/);
  assert.match(role.pl,/czuli się dobrze/);
  assert.match(role.pl,/wszystko, czego potrzebowali/);
  assert.match(role.pl,/poznałem osobiście wielu znanych artystów/);
  assert.match(role.en,/point of contact/);
  assert.match(role.en,/wellbeing on site/);
  assert.match(role.en,/everything they needed/);
  assert.match(role.en,/well-known artists in person/);
  const scale=festival.questions[2].answer;
  assert.match(scale.pl,/2024.*zapowiadali kilkanaście tysięcy/);
  assert.match(scale.en,/2024.*expected over ten thousand/);
  for(const language of ['pl','en']) {
    assert.doesNotMatch(scale[language],/20[ .,]?000|20 tys/i);
    assert.match(scale[language],/zapowiadali|expected/i);
    const story=[festival.intro[language],...festival.questions.map(question=>question.answer[language])].join(' ');
    assert.doesNotMatch(story,/ASBiR|feniks\.fm/i);
  }
  assert.equal(festival.source.url,'https://rzeszow-news.pl/kulturalia-2024-znamy-pierwszych-artystow-impreza-bez-korowodu-studentow/');
});

test('feniks.fm is a separate Rzeszow radio encounter while ASBiR remains a Poznan technical role',()=>{
  const community=CHAPTERS.find(chapter=>chapter.id==='community');
  const asbir=STATIONS.find(station=>station.id===community.id);
  const radio=SIDE_STORIES.find(story=>story.id==='music');
  const university=STATIONS.find(station=>station.id==='university');
  const systems=STATIONS.find(station=>station.id==='systems');
  assert.equal(radio.chapterId,'university');
  assert.notEqual(radio.chapterId,community.id);
  assert.equal(radio.side,-1);
  assert.ok(radio.distance>university.distance && radio.distance<systems.distance);
  assert.ok(radio.questions.every(question=>question.topic!=='asbir'));
  assert.equal(CHAPTERS.length,10,'separation must preserve the saved chapter indices');
  for(const language of ['pl','en']) {
    const asbirPassages=[community.title[language],community.subtitle[language],community.tag[language],community.intro[language],community.takeaway[language],...community.skills,...community.questions.flatMap(question=>[question.label[language],question.answer[language]])].join(' ');
    assert.match(asbirPassages,/ASBiR/);
    assert.match(asbirPassages,/Poznań|Poznaniu/);
    assert.doesNotMatch(asbirPassages,/feniks(?:\.fm)?|\bradi[oa]\b|audycj|wywiad|samorząd|student government|Audio\s*&\s*Video|fortepian|martial arts/iu);
    const radioPassages=[radio.label[language],radio.intro[language],...radio.questions.flatMap(question=>[question.label[language],question.answer[language]])].join(' ');
    assert.match(radio.label[language],/feniks\.fm/);
    assert.doesNotMatch(radioPassages,/ASBiR|Poznań|Poznaniu/iu);
    assert.match(getWorldRegion(radio.distance).city[language],/Rzeszów/);
    assert.match(asbir.label[language],/ASBiR.*Poznań/);
    assert.match(getWorldRegion(asbir.distance).city[language],/Poznań.*ASBiR/);
  }
});
