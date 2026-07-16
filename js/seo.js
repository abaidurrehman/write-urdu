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
    var publisher = config.PUBLISHER || { type: 'Organization', name: 'Write Urdu', contactEmail: null, aboutPath: '/why-write-urdu' };
    var publisherId = config.SITE_ORIGIN + '/#publisher';
    var sectionLabels = { tools: 'Tools', guides: 'Guides', about: 'About', utility: 'Tools' };
    var breadcrumbLabel = page.breadcrumbLabel || page.h1 || page.title.replace(/\s+–.*$/, '');
    if (page.path !== '/' && !document.querySelector('[data-seo-breadcrumbs]')) {
        var breadcrumb = document.createElement('nav'); breadcrumb.className = 'seo-breadcrumbs'; breadcrumb.setAttribute('data-seo-breadcrumbs', ''); breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        var homeLink = document.createElement('a'); homeLink.href = '/'; homeLink.textContent = 'Write Urdu'; breadcrumb.appendChild(homeLink);
        var separator = document.createElement('span'); separator.setAttribute('aria-hidden', 'true'); separator.textContent = '›'; breadcrumb.appendChild(separator);
        if (page.section && page.section !== 'utility') {
            var sectionLink = document.createElement('a'); sectionLink.href = '/write-urdu-sitemap'; sectionLink.textContent = sectionLabels[page.section] || 'Guides'; breadcrumb.appendChild(sectionLink);
            var sectionSeparator = document.createElement('span'); sectionSeparator.setAttribute('aria-hidden', 'true'); sectionSeparator.textContent = '›'; breadcrumb.appendChild(sectionSeparator);
        }
        var current = document.createElement('span'); current.setAttribute('aria-current', 'page'); current.textContent = breadcrumbLabel; breadcrumb.appendChild(current);
        var main = document.querySelector('main');
        if (main && main.parentNode) main.parentNode.insertBefore(breadcrumb, main);
    }
    document.title = page.title;
    setMeta('description', page.description);
    setMeta('robots', page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow');
    setMeta('googlebot', page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow');
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
        var publisherNode = { '@type': publisher.type || 'Organization', '@id': publisherId, name: publisher.name || 'Write Urdu', url: config.SITE_ORIGIN + '/', logo: { '@type': 'ImageObject', url: config.SITE_ORIGIN + '/image/logo10.png' } };
        if (publisher.contactEmail) publisherNode.email = publisher.contactEmail;
        var graph = [
            { '@type': 'WebSite', '@id': config.SITE_ORIGIN + '/#website', url: config.SITE_ORIGIN + '/', name: 'Write Urdu', description: 'Browser-based tools for typing, formatting, designing and sharing Urdu.', inLanguage: ['en', 'ur'], publisher: { '@id': publisherId }, potentialAction: { '@type': 'SearchAction', target: config.SITE_ORIGIN + '/write-urdu-search?q={search_term_string}', 'query-input': 'required name=search_term_string' } },
            publisherNode,
            { '@type': 'WebPage', '@id': canonical + '#webpage', url: canonical, name: page.title, description: page.description, inLanguage: ['en', 'ur'], isPartOf: { '@id': config.SITE_ORIGIN + '/#website' }, publisher: { '@id': publisherId } }
        ];
        if (page.path !== '/') {
            var breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: 'Write Urdu', item: config.SITE_ORIGIN + '/' }];
            var position = 2;
            if (page.section && page.section !== 'utility') breadcrumbItems.push({ '@type': 'ListItem', position: position++, name: sectionLabels[page.section] || 'Guides', item: config.SITE_ORIGIN + '/write-urdu-sitemap' });
            breadcrumbItems.push({ '@type': 'ListItem', position: position, name: breadcrumbLabel, item: canonical });
            graph.push({ '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumbs', itemListElement: breadcrumbItems });
        }
        if (page.schema && page.schema.indexOf('WebApplication') !== -1) {
            var featuresByPage = {
                home: ['Roman Urdu transliteration', 'Urdu suggestions', 'Copy and local draft support', 'Text export'],
                'urdu-editor': ['Rich Urdu formatting', 'Urdu fonts and alignment', 'Word, PDF and PNG export'],
                'urdu-keyboard': ['On-screen Urdu character input', 'Physical keyboard input', 'Copy and text-file export'],
                'urdu-card-studio': ['Urdu card and quote-image design', 'Urdu fonts and templates', 'Local background images', 'Direct text positioning and editing', 'PNG export'],
                'qr-code-generator': ['Urdu text and URL QR codes', 'Wi-Fi and WhatsApp payloads', 'PNG and SVG export']
            };
            graph.push({ '@type': 'WebApplication', '@id': canonical + '#application', name: page.title.replace(/\s+–.*$/, ''), url: canonical, applicationCategory: page.id === 'urdu-card-studio' ? 'DesignApplication' : page.id === 'urdu-editor' || page.id === 'home' ? 'WritingApplication' : 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript and a modern web browser', isAccessibleForFree: true, description: page.description, featureList: featuresByPage[page.id] || [], publisher: { '@id': publisherId } });
        }
        if (page.schema && (page.schema.indexOf('Article') !== -1 || page.schema.indexOf('FAQPage') !== -1)) {
            if (page.schema.indexOf('FAQPage') !== -1) {
                var entities = Array.prototype.slice.call(document.querySelectorAll('details')).map(function (detail) {
                    var question = detail.querySelector('summary'); var answer = detail.querySelector('p');
                    return question && answer ? { '@type': 'Question', name: question.textContent.trim(), acceptedAnswer: { '@type': 'Answer', text: answer.textContent.trim() } } : null;
                }).filter(Boolean);
                if (entities.length) graph.push({ '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: entities, isPartOf: { '@id': canonical + '#webpage' }, publisher: { '@id': config.SITE_ORIGIN + '/#publisher' }, inLanguage: 'en' });
            } else {
                var article = { '@type': 'Article', '@id': canonical + '#article', headline: page.title, description: page.description, mainEntityOfPage: { '@id': canonical + '#webpage' }, author: { '@id': publisherId }, publisher: { '@id': publisherId }, inLanguage: 'en', image: config.SITE_ORIGIN + '/image/logo10.png' };
                if (page.datePublished || page.lastmod) article.datePublished = page.datePublished || page.lastmod;
                if (page.dateModified || page.lastmod) article.dateModified = page.dateModified || page.lastmod;
                graph.push(article);
            }
        }
        if (page.id === 'write-urdu-documentation') {
            graph.push({ '@type': 'HowTo', '@id': canonical + '#how-to', name: 'How to type Urdu online with Write Urdu', step: [
                { '@type': 'HowToStep', name: 'Type', text: 'Enter Roman Urdu, Urdu characters or paste text into the editor.' },
                { '@type': 'HowToStep', name: 'Convert', text: 'Use Space to commit transliterated words, or switch to direct keyboard input.' },
                { '@type': 'HowToStep', name: 'Refine', text: 'Correct spacing, add punctuation, find and replace text, or format a rich document.' },
                { '@type': 'HowToStep', name: 'Share', text: 'Copy, download, print or share the result when it is ready to leave the editor.' }
            ], isPartOf: { '@id': canonical + '#webpage' } });
        }
        var schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.setAttribute('data-write-urdu-schema', '');
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
        document.head.appendChild(schema);
    }
}());
