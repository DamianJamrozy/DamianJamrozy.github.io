// @ts-check
(() => {
    /** @typedef {{ title: string, description: string }} SeoCopy */
    /** @typedef {{ url: string, translations: { pl: SeoCopy, en: SeoCopy } }} PageMetadata */
    /** @typedef {{ '@id': string, name?: string, description?: string, url?: string, inLanguage?: string | string[] }} SchemaNode */
    /** @typedef {{ '@context': string, '@graph': SchemaNode[] }} StructuredData */

    const metadataElement = document.getElementById('seo-data');
    const schemaElement = document.getElementById('person-schema');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!metadataElement || !schemaElement || !canonical) return;

    /** @type {PageMetadata} */
    const metadata = JSON.parse(metadataElement.textContent || '{}');
    /** @type {StructuredData} */
    const structuredData = JSON.parse(schemaElement.textContent || '{}');
    const pageNode = structuredData['@graph'].find(node => node['@id'] === `${metadata.url}#webpage`);

    /**
     * @param {string} selector
     * @param {string} content
     */
    function setMetaContent(selector, content) {
        document.querySelector(selector)?.setAttribute('content', content);
    }

    const applyMetadata = () => {
        const language = document.documentElement.lang === 'en' ? 'en' : 'pl';
        const copy = metadata.translations[language];
        const pageUrl = new URL(metadata.url);
        if (language === 'en') pageUrl.searchParams.set('lang', 'en');

        document.title = copy.title;
        canonical.setAttribute('href', pageUrl.href);
        setMetaContent('meta[name="description"]', copy.description);
        setMetaContent('meta[property="og:title"]', copy.title);
        setMetaContent('meta[property="og:description"]', copy.description);
        setMetaContent('meta[property="og:url"]', pageUrl.href);
        setMetaContent('meta[property="og:locale"]', language === 'en' ? 'en_US' : 'pl_PL');
        setMetaContent('meta[property="og:locale:alternate"]', language === 'en' ? 'pl_PL' : 'en_US');
        setMetaContent('meta[name="twitter:title"]', copy.title);
        setMetaContent('meta[name="twitter:description"]', copy.description);

        if (pageNode) {
            pageNode.name = copy.title;
            pageNode.description = copy.description;
            pageNode.url = pageUrl.href;
            pageNode.inLanguage = language;
            schemaElement.textContent = JSON.stringify(structuredData, null, 2);
        }
    };

    // Legacy translators own the visible page; SEO follows their selected language.
    const languageObserver = new MutationObserver(applyMetadata);
    languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    document.addEventListener('DOMContentLoaded', applyMetadata);
    applyMetadata();
})();
