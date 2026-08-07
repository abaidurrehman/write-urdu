(function () {
    'use strict';

    function loadV2Shell() {
        if (typeof document === 'undefined' || document.querySelector('script[src="js/v2-shell.js"]')) return;
        var shell = document.createElement('script');
        shell.src = 'js/v2-shell.js';
        shell.async = false;
        shell.setAttribute('data-write-urdu-v2-shell', '');
        document.head.appendChild(shell);
    }

    loadV2Shell();

    var config = window.WriteUrduSeoConfig;
    if (!config) return;
    var path = (window.location.pathname || '/').replace(/\\+/g, '/').replace(/\/$/, '') || '/';
    var page = config.byPath[path] || config.byPath[path.replace(/\.html$/i, '')];
    if (!page) return;

    function setMeta(name, content, property) {
        if (!content) return;
        var selector = property ? 'meta[property="' + property + '"]' : 'meta[name="' + name + '"]';
        var node = document.head.querySelector(selector);
        if (!node) {
            node = document.createElement('meta');
            if (property) node.setAttribute('property', property);
            else node.setAttribute('name', name);
            document.head.appendChild(node);
        }
        node.setAttribute('content', content);
    }

    function setLink(rel, href) {
        var node = document.head.querySelector('link[rel="' + rel + '"]');
        if (!node) {
            node = document.createElement('link');
            node.rel = rel;
            document.head.appendChild(node);
        }
        node.href = href;
    }

    function hasSchema(type) {
        return !!(page.schema && page.schema.indexOf(type) !== -1);
    }

    var canonical = config.canonical(page.path);
    var resolvedTitle = page.searchTitle || page.title;
    var resolvedDescription = page.searchDescription || page.description;
    var publisher = config.PUBLISHER || { type: 'Organization', name: 'Write Urdu', contactEmail: null, aboutPath: '/why-write-urdu' };
    var publisherId = config.SITE_ORIGIN + '/#publisher';
    var websiteId = config.SITE_ORIGIN + '/#website';
    var webpageId = canonical + '#webpage';
    var sectionLabels = { tools: 'Tools', guides: 'Guides', about: 'About', utility: 'Tools' };
    var breadcrumbLabel = page.breadcrumbLabel || page.h1 || page.title.replace(/\s+–.*$/, '');
    var pageTopics = {
        home: ['Urdu typing online', 'Urdu writing online', 'Roman Urdu transliteration'],
        'urdu-editor': ['Urdu rich text editing', 'Urdu document formatting'],
        'urdu-keyboard': ['Urdu keyboard', 'Direct Urdu typing'],
        'roman-urdu-transliteration': ['Roman Urdu', 'Urdu transliteration'],
        'urdu-alphabet': ['Urdu alphabet', 'Urdu script'],
        'write-urdu-documentation': ['Urdu typing', 'Urdu writing', 'Write Urdu documentation']
    };

    if (page.path !== '/' && !document.querySelector('[data-seo-breadcrumbs]')) {
        var breadcrumb = document.createElement('nav');
        breadcrumb.className = 'seo-breadcrumbs';
        breadcrumb.setAttribute('data-seo-breadcrumbs', '');
        breadcrumb.setAttribute('aria-label', 'Breadcrumb');
        var homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.textContent = 'Write Urdu';
        breadcrumb.appendChild(homeLink);
        var separator = document.createElement('span');
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '›';
        breadcrumb.appendChild(separator);
        if (page.section && page.section !== 'utility') {
            var sectionLink = document.createElement('a');
            sectionLink.href = '/write-urdu-sitemap';
            sectionLink.textContent = sectionLabels[page.section] || 'Guides';
            breadcrumb.appendChild(sectionLink);
            var sectionSeparator = document.createElement('span');
            sectionSeparator.setAttribute('aria-hidden', 'true');
            sectionSeparator.textContent = '›';
            breadcrumb.appendChild(sectionSeparator);
        }
        var current = document.createElement('span');
        current.setAttribute('aria-current', 'page');
        current.textContent = breadcrumbLabel;
        breadcrumb.appendChild(current);
        var main = document.querySelector('main');
        if (main && main.parentNode) main.parentNode.insertBefore(breadcrumb, main);
    }

    document.title = resolvedTitle;
    setMeta('description', resolvedDescription);
    setMeta('robots', page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow');
    setMeta('googlebot', page.indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow');
    setMeta('application-name', 'Write Urdu');
    setMeta('author', publisher.name || 'Write Urdu');
    setLink('canonical', canonical);
    setMeta('', hasSchema('Article') ? 'article' : 'website', 'og:type');
    setMeta('', 'Write Urdu', 'og:site_name');
    setMeta('', resolvedTitle, 'og:title');
    setMeta('', resolvedDescription, 'og:description');
    setMeta('', canonical, 'og:url');
    setMeta('', 'en_US', 'og:locale');
    setMeta('', 'ur_PK', 'og:locale:alternate');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', resolvedTitle);
    setMeta('twitter:description', resolvedDescription);
    setMeta('', '1200', 'og:image:width');
    setMeta('', '630', 'og:image:height');
    if (hasSchema('Article') && page.lastmod) setMeta('', page.lastmod, 'article:modified_time');
    if (hasSchema('Article') && page.datePublished) setMeta('', page.datePublished, 'article:published_time');

    if (!document.head.querySelector('script[data-write-urdu-schema]')) {
        var publisherNode = {
            '@type': publisher.type || 'Organization',
            '@id': publisherId,
            name: publisher.name || 'Write Urdu',
            url: config.SITE_ORIGIN + '/',
            description: publisher.description || 'Browser-based Urdu writing tools.',
            logo: {
                '@type': 'ImageObject',
                '@id': config.SITE_ORIGIN + '/#logo',
                url: config.SITE_ORIGIN + (publisher.logoPath || '/image/logo10.png'),
                contentUrl: config.SITE_ORIGIN + (publisher.logoPath || '/image/logo10.png')
            },
            knowsLanguage: ['en', 'ur']
        };
        if (publisher.alternateName && publisher.alternateName.length) publisherNode.alternateName = publisher.alternateName;
        if (publisher.contactEmail) publisherNode.email = publisher.contactEmail;
        if (publisher.publishingPrinciplesPath) publisherNode.publishingPrinciples = config.SITE_ORIGIN + publisher.publishingPrinciplesPath;
        if (publisher.contactEmail || publisher.contactPath) {
            publisherNode.contactPoint = {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: publisher.contactEmail || undefined,
                url: publisher.contactPath ? config.SITE_ORIGIN + publisher.contactPath : undefined,
                availableLanguage: ['English', 'Urdu']
            };
        }

        var websiteNode = {
            '@type': 'WebSite',
            '@id': websiteId,
            url: config.SITE_ORIGIN + '/',
            name: 'Write Urdu',
            alternateName: publisher.alternateName || ['WriteUrdu', 'Write-Urdu.com'],
            description: 'Browser-based tools for typing, formatting, designing and sharing Urdu.',
            inLanguage: ['en', 'ur'],
            publisher: { '@id': publisherId }
        };

        var webpageNode = {
            '@type': page.id === 'why-write-urdu' ? 'AboutPage' : 'WebPage',
            '@id': webpageId,
            url: canonical,
            name: resolvedTitle,
            description: resolvedDescription,
            inLanguage: ['en', 'ur'],
            isPartOf: { '@id': websiteId },
            publisher: { '@id': publisherId }
        };
        if (page.lastmod) webpageNode.dateModified = page.lastmod;
        if (page.datePublished) webpageNode.datePublished = page.datePublished;
        if (pageTopics[page.id]) webpageNode.about = pageTopics[page.id].map(function (name) { return { '@type': 'Thing', name: name }; });

        var graph = [websiteNode, publisherNode, webpageNode];

        if (page.path !== '/') {
            var breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: 'Write Urdu', item: config.SITE_ORIGIN + '/' }];
            var position = 2;
            if (page.section && page.section !== 'utility') {
                breadcrumbItems.push({ '@type': 'ListItem', position: position++, name: sectionLabels[page.section] || 'Guides', item: config.SITE_ORIGIN + '/write-urdu-sitemap' });
            }
            breadcrumbItems.push({ '@type': 'ListItem', position: position, name: breadcrumbLabel, item: canonical });
            graph.push({ '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumbs', itemListElement: breadcrumbItems });
            webpageNode.breadcrumb = { '@id': canonical + '#breadcrumbs' };
        }

        if (hasSchema('WebApplication')) {
            var featuresByPage = {
                home: ['Roman Urdu transliteration', 'Urdu suggestions', 'Direct Urdu writing', 'Copy and local draft support', 'Text export'],
                'urdu-editor': ['Rich Urdu formatting', 'Urdu fonts and alignment', 'Word, PDF and PNG export'],
                'urdu-keyboard': ['On-screen Urdu character input', 'Physical keyboard input', 'Copy and text-file export'],
                'urdu-card-studio': ['Urdu card and quote-image design', 'Urdu fonts and templates', 'Local background images', 'Direct text positioning and editing', 'PNG export'],
                'qr-code-generator': ['Urdu text and URL QR codes', 'Wi-Fi and WhatsApp payloads', 'PNG and SVG export'],
                'stylish-urdu-text-generator': ['Curated Unicode Urdu styles', 'Roman Urdu and direct Urdu input', 'Local favourites and copy actions', 'Name Art handoff'],
                'urdu-name-art-maker': ['Urdu font-based name images', 'Card Studio templates and direct editing', 'Local background images', 'PNG export']
            };
            var applicationId = canonical + '#application';
            graph.push({
                '@type': 'WebApplication',
                '@id': applicationId,
                name: resolvedTitle.replace(/\s+[–—].*$/, ''),
                url: canonical,
                mainEntityOfPage: { '@id': webpageId },
                applicationCategory: page.id === 'urdu-card-studio' ? 'DesignApplication' : page.id === 'urdu-editor' || page.id === 'home' ? 'WritingApplication' : 'UtilitiesApplication',
                operatingSystem: 'Any',
                browserRequirements: 'Requires JavaScript and a modern web browser',
                isAccessibleForFree: true,
                description: resolvedDescription,
                featureList: featuresByPage[page.id] || [],
                publisher: { '@id': publisherId }
            });
            webpageNode.mainEntity = { '@id': applicationId };
        }

        if (hasSchema('CollectionPage')) {
            var templateLibrary = window.WriteUrduTemplateLibrary;
            var collectionItems = templateLibrary && Array.isArray(templateLibrary.TEMPLATES) ? templateLibrary.TEMPLATES.map(function (template, index) {
                return { '@type': 'ListItem', position: index + 1, name: template.name, url: canonical + '?template=' + encodeURIComponent(template.slug) };
            }) : [];
            graph.push({ '@type': 'CollectionPage', '@id': canonical + '#collection', url: canonical, name: resolvedTitle, description: resolvedDescription, isPartOf: { '@id': webpageId }, mainEntity: { '@id': canonical + '#template-list' }, publisher: { '@id': publisherId }, inLanguage: 'en' });
            if (collectionItems.length) graph.push({ '@type': 'ItemList', '@id': canonical + '#template-list', name: 'Urdu template library', numberOfItems: collectionItems.length, itemListElement: collectionItems });
        }

        if (hasSchema('FAQPage')) {
            var entities = Array.prototype.slice.call(document.querySelectorAll('details')).map(function (detail) {
                var question = detail.querySelector('summary');
                var answer = detail.querySelector('p');
                return question && answer ? { '@type': 'Question', name: question.textContent.trim(), acceptedAnswer: { '@type': 'Answer', text: answer.textContent.trim() } } : null;
            }).filter(Boolean);
            if (entities.length) graph.push({ '@type': 'FAQPage', '@id': canonical + '#faq', url: canonical, mainEntity: entities, isPartOf: { '@id': webpageId }, publisher: { '@id': publisherId }, inLanguage: 'en' });
        } else if (hasSchema('Article')) {
            var article = {
                '@type': 'Article',
                '@id': canonical + '#article',
                url: canonical,
                headline: resolvedTitle,
                description: resolvedDescription,
                mainEntityOfPage: { '@id': webpageId },
                author: { '@id': publisherId },
                publisher: { '@id': publisherId },
                publishingPrinciples: publisher.publishingPrinciplesPath ? config.SITE_ORIGIN + publisher.publishingPrinciplesPath : undefined,
                inLanguage: 'en'
            };
            if (page.datePublished) article.datePublished = page.datePublished;
            if (page.dateModified || page.lastmod) article.dateModified = page.dateModified || page.lastmod;
            graph.push(article);
            webpageNode.mainEntity = { '@id': canonical + '#article' };
        }

        if (page.id === 'write-urdu-documentation') {
            graph.push({
                '@type': 'HowTo',
                '@id': canonical + '#how-to',
                name: 'How to type Urdu online with Write Urdu',
                step: [
                    { '@type': 'HowToStep', name: 'Type', text: 'Enter Roman Urdu, Urdu characters or paste text into the editor.' },
                    { '@type': 'HowToStep', name: 'Convert', text: 'Use Space to commit transliterated words, or switch to direct keyboard input.' },
                    { '@type': 'HowToStep', name: 'Refine', text: 'Correct spacing, add punctuation, find and replace text, or format a rich document.' },
                    { '@type': 'HowToStep', name: 'Share', text: 'Copy, download, print or share the result when it is ready to leave the editor.' }
                ],
                isPartOf: { '@id': webpageId }
            });
        }

        var schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.setAttribute('data-write-urdu-schema', '');
        schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
        document.head.appendChild(schema);
    }
}());