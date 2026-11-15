import assert from 'node:assert/strict';
import test from 'node:test';
import { SIDE_STORIES } from '../career-drive/side-stories.js';
import { CHAPTERS } from '../career-drive/story.js';
import { topicCaption } from '../career-drive/story-scenes.js';
import { STATIONS, ROAD_LENGTH } from '../career-drive/world.js';

test('optional encounters sit between main milestones and do not become required CV chapters', () => {
  assert.equal(SIDE_STORIES.length,6);
  assert.equal(new Set(SIDE_STORIES.map(story => story.id)).size,SIDE_STORIES.length);
  assert.equal(CHAPTERS.length,10);
  for (const story of SIDE_STORIES) {
    assert.ok(story.distance>0 && story.distance<ROAD_LENGTH);
    assert.ok(STATIONS.every(station => Math.abs(station.distance-story.distance)>250));
    assert.ok(story.side===-1 || story.side===1);
    assert.ok(CHAPTERS.some(chapter => chapter.id===story.chapterId));
  }
});

test('every encounter and answer has bilingual dialogue and a supported meaningful animation', () => {
  for (const story of SIDE_STORIES) {
    for (const language of ['pl','en']) {
      for (const field of ['label','speaker','intro']) assert.ok(story[field][language].trim());
      assert.ok(topicCaption(story.topic,language));
      assert.ok(story.questions.length>=2);
      for (const question of story.questions) {
        assert.ok(question.label[language].trim());
        assert.ok(question.answer[language].trim());
        assert.ok(topicCaption(question.topic,language));
      }
    }
  }
});

test('the training break reflects current strength training and kickboxing while retaining other personal interests', () => {
  const sport=SIDE_STORIES.find(story=>story.id==='sport');
  assert.equal(sport.chapterId,'next','personal training must not inherit an employer chapter');
  assert.equal(sport.topic,'training');
  assert.equal(sport.questions[0].label.pl,'Co jeszcze robisz po pracy?');
  assert.equal(sport.questions[0].topic,'training');
  assert.match(sport.questions[0].answer.pl,/siłow/iu);
  assert.match(sport.questions[0].answer.pl,/siłown/iu);
  assert.match(sport.questions[0].answer.en,/strength training/iu);
  assert.match(sport.questions[0].answer.en,/gym/iu);
  for(const language of ['pl','en']) {
    assert.match(sport.questions[0].answer[language],/kickboxing/iu);
    assert.doesNotMatch(sport.questions[0].answer[language],/ASBiR|feniks|Poznań|Poznaniu/iu);
    assert.ok(sport.questions.some(question=>question.topic==='games'));
    const hobbies=sport.questions.find(question=>question.topic==='hobbies');
    assert.ok(hobbies);
    assert.match(hobbies.answer[language],/fortepian|piano/iu);
    assert.match(hobbies.answer[language],/film|movie/iu);
    assert.match(hobbies.answer[language],/muzyk|music/iu);
  }
});

test('scholarship follows the owner correction and the robot explains the sourced PJM thesis', () => {
  const scholarship=SIDE_STORIES.find(story=>story.id==='scholarship');
  assert.match(scholarship.intro.pl,/250/);
  assert.match(scholarship.intro.en,/250/);
  const robot=SIDE_STORIES.find(story=>story.id==='robot');
  assert.match(robot.intro.pl,/język(?:a migowego|iem migowym)/);
  assert.match(robot.intro.en,/Sign Language/);
  assert.equal(new URL(robot.source.url).protocol,'https:');
  assert.equal(new URL(robot.source.url).hostname,'sep.w.prz.edu.pl');
});
