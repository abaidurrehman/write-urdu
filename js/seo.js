(function () {
    'use strict';
    var config = window.WriteUrduSeoConfig;
    if (!config) return;
    var path = (window.location.pathname || '/').replace(/\\+/g, '/').replace(/\/$/, '') || '/';
    var page = config.byPath[path] || config.byPath[path.replace(/\.html$/i, '')];
    if (!page) return;
    function setMeta(name, content, property) {
        var selector = property ? 'meta[property="' + property + '"]' : 'meta[name="' + name + '"]';
        var node = document.head.querySelector(selector);
        if (!node) { node = document.createElement('meta'); if (property) node.setAttribute('property', property); else node.setAttribute('name', name); document.head.appendChild(node); }
        node.setAttribute('content', content);
    }
    function setLink(rel, href) {
        var node = document.head.querySelector('link[rel="' + rel + '"]');
        if (!node) { node = document.createElement('link'); node.rel = rel; document.head.appendChild(node); }
        node.href = href;
    }
    var canonical = config.canonical(page.path);
    if (page.path !== '/' && !document.querySelector('[data-seo-breadcrumbs]')) {
        var breadcrumb = document.createElement('nav'); breadcrumb.className = 'seo-breadcrumbs'; breadcrumb.setAttribute('data-seo-breadcrumbs', ''); breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        breadcrumb.innerHTML = '<a href="/">Write Urdu</a><span aria-hidden="true">›</span><span aria-current="page">' + page.title.replace(/\s+–.*$/, '') + '</span>';
        var main = document.querySelector('main');
        if (main && main.parentNode) main.parentNode.insertBefore(breadcrumb, main);
    }
    document.title = page.title;
    setMeta('description', page.description);
    setMeta('robots', page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow');
    setLink('canonical', canonical);
    setMeta('', 'website', 'og:type');
    setMeta('', 'Write Urdu', 'og:site_name');
    setMeta('', page.title, 'og:title');
    setMeta('', page.description, 'og:description');
    setMeta('', canonical, 'og:url');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', page.title);
    setMeta('twitter:description', page.description);
    setMeta('', '1200', 'og:image:width'); setMeta('', '630', 'og:image:height');
    if (!document.head.querySelector('script[data-write-urdu-schema]')) {
        var graph = [
            { '@type': 'WebSite', '@id': config.SITE_ORIGIN + '/#website', url: config.SITE_ORIGIN + '/', name: 'Write Urdu', description: 'Browser-based tools for typing, formatting, designing and sharing Urdu.', inLanguage: ['en', 'ur'], publisher: { '@id': config.SITE_ORIGIN + '/#publisher' } },
            { '@type': 'Organization', '@id': config.SITE_ORIGIN + '/#publisher', name: 'Write Urdu', url: config.SITE_ORIGIN + '/', logo: { '@type': 'ImageObject', url: config.SITE_ORIGIN + '/image/logo10.png' } },
            { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: page.title, description: page.description, inLanguage: ['en', 'ur'], isPartOf: { '@id': config.SITE_ORIGIN + '/#website' }, publisher: { '@id': config.SITE_ORIGIN + '/#publisher' } }
        ];
        if (page.schema && page.schema.indexOf('WebApplication') !== -1) {
            graph.push({ '@type': 'WebApplication', '@id': canonical + '#application', name: page.title.replace(/\s+–.*$/, ''), url: canonical, applicationCategory: page.id === 'urdu-card-studio' ? 'DesignApplication' : 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a modern web browser', isAccessibleForFree: true, description: page.description, featureList: page.id === 'qr-code-generator' ? ['Urdu text and URL QR codes', 'Wi-Fi and WhatsApp payloads', 'PNG and SVG export'] : ['Urdu text-to-image design', 'Urdu fonts and templates', 'Local background images', 'PNG export'], publisher: { '@id': config.SITE_ORIGIN + '/#publisher' } });
        }
        if (page.schema && (page.schema.indexOf('Article') !== -1 || page.schema.indexOf('FAQPage') !== -1)) {
            if (page.schema.indexOf('FAQPage') !== -1) {
                var entities = Array.prototype.slice.call(document.querySelectorAll('details')).map(function (detail) {
                    var question = detail.querySelector('summary'); var answer = detail.querySelector('p');
                    return question && answer ? { '@type': 'Question', name: question.textContent.trim(), acceptedAnswer: { '@type': 'Answer', text: answer.textContent.trim() } } : null;
                }).filter(Boolean);
                if (entities.length) graph.push({ '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: entities, isPartOf: { '@id': canonical + '#webpage' }, publisher: { '@id': config.SITE_ORIGIN + '/#publisher' }, inLanguage: 'en' });
            } else graph.push({ '@type': 'Article', '@id': canonical + '#article', headline: page.title, description: page.description, mainEntityOfPage: { '@id': canonical + '#webpage' }, author: { '@id': config.SITE_ORIGIN + '/#publisher' }, publisher: { '@id': config.SITE_ORIGIN + '/#publisher' }, inLanguage: 'en' });
        }
        var schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.setAttribute('data-write-urdu-schema', '');
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
        document.head.appendChild(schema);
    }
}());
