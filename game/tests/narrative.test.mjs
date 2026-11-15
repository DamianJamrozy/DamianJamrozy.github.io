import assert from 'node:assert/strict';
import test from 'node:test';
import { CHAPTERS, COPY } from '../career-drive/story.js';
import { SIDE_STORIES } from '../career-drive/side-stories.js';
import { STATIONS } from '../career-drive/world.js';
import { conversationTopic, storySceneSample } from '../career-drive/story-scenes.js';
import { GARAGE_STORIES } from '../career-drive/garage-stories.js';

const externalBiography = /(?<![\w.@])CV\b|curriculum vitae|portfolio|about page|stron\S*\s+[„"']?o mnie/iu;

test('the thesis award is told once in the main story and the robot adds technical context instead of repeating it',()=>{
  const learning=CHAPTERS.find(chapter=>chapter.id==='learning');
  const robot=SIDE_STORIES.find(story=>story.id==='robot');
  const awardRank=/drug(?:ie|im|ą)\s+(?:miejs\S*|nagrod\S*)|second\s+(?:place|prize)/giu;
  for(const language of ['pl','en']) {
    const passages=[...CHAPTERS,...SIDE_STORIES].flatMap(story=>[
      story.intro[language],...story.questions.flatMap(question=>[question.label[language],question.answer[language]])
    ]).join(' ');
    assert.equal([...passages.matchAll(awardRank)].length,1,language);
    assert.doesNotMatch(learning.intro[language],awardRank);
    assert.match(learning.questions[1].answer[language],/2024.*39/);
    assert.match(learning.questions[1].answer[language],/SEP/);
    assert.match(learning.questions[1].answer[language],awardRank);
    assert.equal(conversationTopic('learning',1),'award');
    const robotPassages=[robot.intro[language],...robot.questions.map(question=>question.answer[language])].join(' ');
    assert.match(robotPassages,/PJM/);
    assert.doesNotMatch(robotPassages,/SEP|konkurs|competition/iu);
    assert.ok(robot.questions.every(question=>question.topic!=='award'));
  }
  assert.match(learning.questions[1].answer.pl,/sekcję grafiki komputerowej, warsztaty/);
  assert.match(learning.questions[1].answer.en,/computer graphics section, ran workshops/);
});

test('the first car story introduces ownership once and gives its technical facts in one passage',()=>{
  const cmax=GARAGE_STORIES.find(story=>story.id==='cmax');
  for(const language of ['pl','en']) {
    assert.doesNotMatch(cmax.introduction[language],/2009|115|200[ ,]000/);
    const story=`${cmax.introduction[language]} ${cmax.details[language]}`;
    for(const fact of [/2009/g,/115/g,/200[ ,]000/g]) assert.equal([...story.matchAll(fact)].length,1);
  }
  assert.match(cmax.introduction.pl,/pierwszego własnego samochodu/);
  assert.match(cmax.introduction.en,/first car of my own/);
});

test('Rzeszow introduces moving for university and staying in the city while the earlier scholarship remains separate',()=>{
  const chapter=CHAPTERS.find(item=>item.id==='studies');
  const scholarship=SIDE_STORIES.find(item=>item.id==='scholarship');
  const stop=STATIONS.find(item=>item.id==='studies');
  assert.ok(scholarship.distance<stop.distance);
  for(const language of ['pl','en']) {
    const passages=[chapter.intro[language],chapter.takeaway[language],...chapter.questions.flatMap(question=>[question.label[language],question.answer[language]])].join(' ');
    assert.doesNotMatch(passages,/stypend|scholarship|250/i);
    assert.match(scholarship.intro[language],/250/);
  }
  assert.match(chapter.intro.pl,/przeprowadziłem się z rodzinnej miejscowości do Rzeszowa/);
  assert.match(chapter.intro.en,/moved from my hometown to Rzeszów/);
  assert.match(chapter.questions[1].answer.pl,/mieszkam w nim do dziś/);
  assert.match(chapter.questions[1].answer.en,/still live here today/);
  assert.equal(storySceneSample('studies',0).kind,'moving');
  assert.equal(conversationTopic('studies',1),'moving');
});

test('the main story tells Damian’s experiences directly without referring to another biography', () => {
  for (const chapter of CHAPTERS) {
    for (const language of ['pl','en']) {
      const passages = [chapter.intro[language],...chapter.questions.map(question => question.answer[language])];
      for (const passage of passages) {
        assert.doesNotMatch(passage,externalBiography,`${chapter.id}.${language}`);
        assert.doesNotMatch(passage,/[—–]/u,`${chapter.id}.${language}: narrative uses ordinary hyphens`);
        assert.doesNotMatch(passage,/\bDamian(?:’s|\s+(?:received|earned|joined|completed|works|likes|otrzymał|ukończył|pracował|lubi))\b/iu,`${chapter.id}.${language}: narrator speaks in his own voice`);
      }
    }
  }
});

test('journey navigation and dialogue labels keep the standalone first-person framing in both languages', () => {
  for (const language of ['pl','en']) {
    for (const value of Object.values(COPY[language])) assert.doesNotMatch(value,externalBiography);
    assert.equal(COPY[language].dialogueDamian,'Damian Jamroży');
    assert.ok(COPY[language].dialogueEncounter.trim());
  }
});

test('side encounters separate the NPC question from Damian’s own account without explanatory game commentary', () => {
  for (const story of SIDE_STORIES) {
    for (const language of ['pl','en']) {
      assert.ok(story.speaker[language].trim());
      assert.ok(story.greeting[language].trim());
      const replies = [story.intro[language],...story.questions.map(question => question.answer[language])];
      for (const reply of replies) {
        assert.doesNotMatch(reply,externalBiography,`${story.id}.${language}`);
        assert.doesNotMatch(reply,/\bDamian(?:’s|\s+(?:received|earned|joined|completed|works|likes|otrzymał|ukończył|pracował|lubi))\b/iu);
        assert.doesNotMatch(reply,/bohaterem gry|guide robot in this scene|simulated conversation|narrative adaptation/iu);
      }
    }
  }
});
