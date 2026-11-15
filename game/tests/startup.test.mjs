import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Script } from 'node:vm';

const pageUrl = new URL('../career-drive/index.html', import.meta.url);
const bundleUrl = new URL('../career-drive/app.bundle.js', import.meta.url);
const stylesheetUrl = new URL('../career-drive/game.css', import.meta.url);

function assetVersion(content) {
  return createHash('sha256').update(content.replaceAll('\r\n','\n')).digest('hex').slice(0,12);
}

test('the game loads current versioned assets through a deferred classic script', async () => {
  const [html,bundle,stylesheet] = await Promise.all([
    readFile(pageUrl,'utf8'),readFile(bundleUrl,'utf8'),readFile(stylesheetUrl,'utf8'),
  ]);
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map(match => match[1]);
  const entry = scripts.find(attributes => /\bsrc=["']\.\/app\.bundle\.js(?:\?[^"']*)?["']/.test(attributes));

  assert.ok(entry, 'the page must load the generated game bundle');
  const bundleVersion = entry.match(/\bsrc=(["'])\.\/app\.bundle\.js\?v=([a-f0-9]{12})\1/);
  assert.ok(bundleVersion, 'the bundle reference must have a twelve-digit content hash');
  assert.equal(bundleVersion[2],assetVersion(bundle),'a changed bundle must use a new cache key');
  const stylesheetVersion = html.match(/<link\b[^>]*\shref=(["'])\.\/game\.css\?v=([a-f0-9]{12})\1/);
  assert.ok(stylesheetVersion,'the game stylesheet must have a twelve-digit content hash');
  assert.equal(stylesheetVersion[2],assetVersion(stylesheet),'changed game styles must use a new cache key');
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
    window: { matchMedia: () => ({ matches: false }) },
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
