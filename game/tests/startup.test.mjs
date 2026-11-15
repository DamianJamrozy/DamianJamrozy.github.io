import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

const pageUrl = new URL('../career-drive/index.html', import.meta.url);
const bundleUrl = new URL('../career-drive/app.bundle.js', import.meta.url);

test('the game loads a deferred classic bundle when opened as a local file', async () => {
  const html = await readFile(pageUrl, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(match => match[1]);
  const entry = scripts.find(attributes => /\bsrc=["']\.\/app\.bundle\.js["']/.test(attributes));

  assert.ok(entry, 'the page must load the generated game bundle');
  assert.match(entry, /\bdefer\b/);
  assert.doesNotMatch(entry, /\btype=["']module["']/);
  assert.ok(scripts.every(attributes => !/\btype=["']module["']/.test(attributes)), 'local files cannot load ES module scripts');
});

test('the distributed bundle parses as a classic script without a module loader', async () => {
  const bundle = await readFile(bundleUrl, 'utf8');
  assert.doesNotThrow(() => new Script(bundle, { filename: 'app.bundle.js' }));
});

test('a bundled startup failure replaces loading with a safe message and an exit', async () => {
  const bundle = await readFile(bundleUrl, 'utf8');
  const internalDetail = 'STARTUP_INTERNAL_TEST_DETAIL';
  const children = [];
  let attemptedStartup = false;
  let clearedLoading = false;
  const message = {
    replaceChildren() { clearedLoading = true; children.length = 0; },
    append(...elements) { children.push(...elements); },
  };
  const document = {
    baseURI: 'file:///D:/portfolio/game/career-drive/index.html?lang=pl',
    hidden: false,
    addEventListener() {},
    getElementById(id) {
      if (id === 'loading-state') return message;
      attemptedStartup = true;
      throw new Error(internalDetail);
    },
    createElement(tagName) { return { tagName, textContent: '', href: '' }; },
  };
  const script = new Script(bundle, { filename: 'app.bundle.js' });

  script.runInNewContext({
    document,
    location: new URL(document.baseURI),
    localStorage: { getItem() { return null; } },
    URL,
    URLSearchParams,
  });
  await new Promise(resolve => setImmediate(resolve));

  assert.ok(attemptedStartup, 'the bundle must run the application without importing another file');
  assert.ok(clearedLoading, 'an initialization error must replace the loading state');
  assert.equal(children.length, 2);
  assert.equal(children[0].tagName, 'p');
  assert.match(children[0].textContent, /Nie udało się rozpocząć podróży/);
  assert.match(children[0].textContent, /The journey could not start/);
  assert.equal(children[1].tagName, 'a');
  assert.equal(children[1].href, '../../index.html');
  assert.match(children[1].textContent, /Wyjście \/ Exit/);
  assert.doesNotMatch(children.map(child => child.textContent).join(' '), new RegExp(internalDetail));
});
