import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { Script, createContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const origin = 'https://damianjamrozy.github.io';
const personId = origin + '/#person';
const source = await readFile(new URL('content/javascript/seo.js', root), 'utf8');
const pages = [];

for (const filename of (await readdir(root)).filter(name => name.endsWith('.html') && name !== 'sitemap.html')) {
    const html = await readFile(new URL(filename, root), 'utf8');
    const data = JSON.parse(html.match(/<script id="seo-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
    const schemaText = html.match(/<script id="person-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
    pages.push({ filename, html, data, schemaText, schema: JSON.parse(schemaText) });
}

function createDocument(page) {
    const metadataElement = { textContent: JSON.stringify(page.data) };
    const schemaElement = { textContent: page.schemaText };
    const elements = new Map();
    const listeners = new Map();
    const attributes = new Map();
    for (const match of page.html.matchAll(/<meta (name|property)="([^"]+)" content="([^"]*)">/g)) {
        const values = new Map([['content', match[3]]]);
        elements.set('meta[' + match[1] + '="' + match[2] + '"]', {
            setAttribute: (name, value) => values.set(name, value),
            getAttribute: name => values.get(name),
        });
    }
    const canonical = { setAttribute: (name, value) => attributes.set(name, value), getAttribute: name => attributes.get(name) };
    elements.set('link[rel="canonical"]', canonical);
    const document = {
        title: '',
        documentElement: { lang: 'pl', setAttribute(name, value) { this[name] = value; } },
        getElementById: id => id === 'seo-data' ? metadataElement : id === 'person-schema' ? schemaElement : null,
        querySelector: selector => elements.get(selector) ?? null,
        querySelectorAll: () => [],
        addEventListener(name, listener) {
            const callbacks = listeners.get(name) ?? [];
            callbacks.push(listener);
            listeners.set(name, callbacks);
        },
    };
    let observer;
    const context = createContext({
        document,
        URL,
        URLSearchParams,
        location: new URL(page.data.url),
        localStorage: { getItem() { return null; }, setItem() {} },
        MutationObserver: class {
            constructor(callback) { this.callback = callback; observer = this; }
            observe(target, options) { this.target = target; this.options = options; }
        },
    });
    return { document, elements, canonical, listeners, schemaElement, context, get observer() { return observer; } };
}

test('raw HTML gives every page its own canonical URL, localized metadata and a consistent person', async () => {
    const people = [];
    const titles = new Set();
    for (const page of pages) {
        const base = origin + (page.filename === 'index.html' ? '/' : '/' + page.filename);
        assert.equal(page.data.url, base);
        assert.ok(page.html.includes('<link rel="canonical" href="' + base + '">'), page.filename);
        assert.ok(page.html.includes('hreflang="en" href="' + base + '?lang=en"'), page.filename);
        assert.ok(page.html.includes('hreflang="pl" href="' + base + '"'), page.filename);
        assert.equal(page.html.match(/<title>(.*?)<\/title>/)[1], page.data.translations.pl.title);
        assert.equal(page.html.match(/<meta name="description" content="([^"]+)"/)[1], page.data.translations.pl.description);
        assert.ok(!titles.has(page.data.translations.pl.title), 'titles must distinguish the pages');
        titles.add(page.data.translations.pl.title);
        const person = page.schema['@graph'].find(node => node['@id'] === personId);
        assert.equal(person.name, 'Damian Jamroży');
        assert.equal(person.jobTitle, 'Associate Technical Consultant Delivery');
        assert.ok(person.sameAs.includes('https://www.linkedin.com/in/djamrozy/'));
        await access(new URL('.' + new URL(person.image).pathname, root));
        people.push(JSON.stringify(person));
        const pageNode = page.schema['@graph'].find(node => node['@id'] === base + '#webpage');
        assert.equal(pageNode.url, base);
        assert.equal(pageNode.name, page.data.translations.pl.title);
        assert.equal(pageNode.description, page.data.translations.pl.description);
        assert.equal(pageNode['@type'], page.filename === 'about.html' ? 'ProfilePage' : 'WebPage');
        assert.equal((pageNode.mainEntity ?? pageNode.about)['@id'], personId);
        assert.doesNotMatch(page.html, /canonicalHref|getElementById\('canonical'\)/);
    }
    assert.equal(new Set(people).size, 1, 'all pages must describe the same person');
});

test('language changes keep canonical, social metadata and structured page data synchronized', () => {
    for (const page of pages) {
        const state = createDocument(page);
        new Script(source).runInContext(state.context);
        assert.equal(state.observer.target, state.document.documentElement);
        assert.deepEqual(Array.from(state.observer.options.attributeFilter), ['lang']);
        for (const language of ['en', 'pl']) {
            state.document.documentElement.lang = language;
            state.observer.callback();
            const copy = page.data.translations[language];
            const expectedUrl = page.data.url + (language === 'en' ? '?lang=en' : '');
            assert.equal(state.document.title, copy.title);
            assert.equal(state.canonical.getAttribute('href'), expectedUrl);
            assert.equal(state.elements.get('meta[name="description"]').getAttribute('content'), copy.description);
            assert.equal(state.elements.get('meta[property="og:title"]').getAttribute('content'), copy.title);
            assert.equal(state.elements.get('meta[property="og:url"]').getAttribute('content'), expectedUrl);
            assert.equal(state.elements.get('meta[name="twitter:description"]').getAttribute('content'), copy.description);
            const pageNode = JSON.parse(state.schemaElement.textContent)['@graph'].find(node => node['@id'] === page.data.url + '#webpage');
            assert.equal(pageNode.inLanguage, language);
            assert.equal(pageNode.url, expectedUrl);
            assert.equal(pageNode.description, copy.description);
        }
    }
});

test('the unchanged generated About translator cannot restore its legacy SEO description', async () => {
    const page = pages.find(page => page.filename === 'about.html');
    const state = createDocument(page);
    const translator = await readFile(new URL('content/javascript/lang_about.js', root), 'utf8');
    new Script(translator).runInContext(state.context);
    new Script(source).runInContext(state.context);
    for (const listener of state.listeners.get('DOMContentLoaded')) listener();
    assert.equal(state.elements.get('meta[name="description"]').getAttribute('content'), page.data.translations.pl.description);
    new Script('applyLang("en");').runInContext(state.context);
    state.observer.callback();
    assert.equal(state.elements.get('meta[name="description"]').getAttribute('content'), page.data.translations.en.description);
    assert.equal(state.canonical.getAttribute('href'), page.data.url + '?lang=en');
});

test('XML and text sitemaps expose existing canonical pages and omit the temporary placeholder', async () => {
    const xml = await readFile(new URL('sitemap.xml', root), 'utf8');
    const text = await readFile(new URL('sitemap.txt', root), 'utf8');
    assert.match(xml, /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
    const xmlUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    assert.deepEqual(text.trim().split(/\r?\n/), xmlUrls);
    assert.equal(new Set(xmlUrls).size, xmlUrls.length);
    for (const page of pages) {
        const shouldIndex = !page.html.includes('content="noindex, follow"');
        assert.equal(xmlUrls.includes(page.data.url), shouldIndex, page.filename);
        assert.equal(xmlUrls.includes(page.data.url + '?lang=en'), shouldIndex, page.filename + ' EN');
    }
    for (const location of xmlUrls) {
        const url = new URL(location);
        assert.equal(url.origin, origin);
        await access(new URL(url.pathname === '/' ? 'index.html' : '.' + url.pathname, root));
    }
    const robots = await readFile(new URL('robots.txt', root), 'utf8');
    assert.match(robots, /Sitemap: https:\/\/damianjamrozy\.github\.io\/sitemap\.xml/);
    assert.doesNotMatch(robots, /Sitemap: .*\.html/);
});
