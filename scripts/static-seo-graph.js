'use strict';

const seo = require('../seo.config.js');
const templateLibrary = require('../js/template-library-core.js');
const writingTemplates = require('../js/writing-template-catalog.js');

const SECTION_LABELS = { tools: 'Tools', guides: 'Guides', about: 'About', utility: 'Tools' };
const PAGE_TOPICS = {
  home: ['English to Urdu typing', 'Urdu typing online', 'Urdu writing online'],
  'urdu-editor': ['Urdu document editing', 'Urdu document formatting'],
  'urdu-keyboard': ['Urdu keyboard', 'Direct Urdu typing'],
  'roman-urdu-transliteration': ['English to Urdu typing', 'Roman Urdu typing'],
  'urdu-alphabet': ['Urdu alphabet', 'Urdu script'],
  'write-urdu-documentation': ['Urdu typing', 'Urdu writing', 'Write Urdu help']
};

function hasSchema(page, type) {
  return Boolean(page && Array.isArray(page.schema) && page.schema.includes(type));
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function plainText(value) {
  return decodeEntities(String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceDescription(html, fallback) {
  const tag = (String(html || '').match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i) || [])[0];
  if (!tag) return fallback;
  const value = tag.match(/\bcontent=(["'])([\s\S]*?)\1/i);
  return value && value[2] ? decodeEntities(value[2]).trim() : fallback;
}

function extractFaq(html) {
  const entities = [];
  const details = String(html || '').match(/<details\b[\s\S]*?<\/details>/gi) || [];
  for (const detail of details) {
    const summary = detail.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const answer = detail.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
    const questionText = summary && plainText(summary[1]);
    const answerText = answer && plainText(answer[1]);
    if (!questionText || !answerText) continue;
    entities.push({
      '@type': 'Question',
      name: questionText,
      acceptedAnswer: { '@type': 'Answer', text: answerText }
    });
  }
  return entities;
}

function publisherNode(config) {
  const publisher = config.PUBLISHER || { type: 'Organization', name: 'Write Urdu' };
  const publisherId = config.SITE_ORIGIN + '/#publisher';
  const node = {
    '@type': publisher.type || 'Organization',
    '@id': publisherId,
    name: publisher.name || 'Write Urdu',
    url: config.SITE_ORIGIN + '/',
    description: publisher.description || 'Tools for writing and creating in Urdu.',
    logo: {
      '@type': 'ImageObject',
      '@id': config.SITE_ORIGIN + '/#logo',
      url: config.SITE_ORIGIN + (publisher.logoPath || '/image/logo10.png'),
      contentUrl: config.SITE_ORIGIN + (publisher.logoPath || '/image/logo10.png')
    },
    knowsLanguage: ['en', 'ur']
  };
  if (publisher.alternateName && publisher.alternateName.length) node.alternateName = publisher.alternateName;
  if (publisher.contactEmail) node.email = publisher.contactEmail;
  if (publisher.publishingPrinciplesPath) node.publishingPrinciples = config.SITE_ORIGIN + publisher.publishingPrinciplesPath;
  if (publisher.contactEmail || publisher.contactPath) {
    node.contactPoint = {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Urdu']
    };
    if (publisher.contactEmail) node.contactPoint.email = publisher.contactEmail;
    if (publisher.contactPath) node.contactPoint.url = config.SITE_ORIGIN + publisher.contactPath;
  }
  return node;
}

function websiteNode(config) {
  const publisher = config.PUBLISHER || {};
  return {
    '@type': 'WebSite',
    '@id': config.SITE_ORIGIN + '/#website',
    url: config.SITE_ORIGIN + '/',
    name: 'Write Urdu',
    alternateName: publisher.alternateName || ['WriteUrdu', 'Write-Urdu.com'],
    description: 'Tools for typing, formatting, designing and sharing Urdu.',
    inLanguage: ['en', 'ur'],
    publisher: { '@id': config.SITE_ORIGIN + '/#publisher' }
  };
}

function applicationFeatures(pageId) {
  const values = {
    home: ['Type Urdu with English letters', 'Urdu word suggestions', 'Direct Urdu typing', 'Copy and save drafts', 'Download text'],
    'urdu-editor': ['Format Urdu documents', 'Urdu fonts and alignment', 'Download Word, PDF and PNG'],
    'urdu-keyboard': ['On-screen Urdu keyboard', 'Physical keyboard input', 'Copy and download text'],
    'urdu-card-studio': ['Create Urdu quote and poetry images', 'Urdu fonts and templates', 'Use your own background image', 'Move and edit text on the design', 'Download PNG'],
    'qr-code-generator': ['QR codes for Urdu text and links', 'Wi-Fi and WhatsApp QR codes', 'Download PNG and SVG'],
    'stylish-urdu-text-generator': ['Ready-made Urdu text styles', 'English-letter and direct Urdu input', 'Save favourites and copy text', 'Continue to Urdu Name Art'],
    'urdu-name-art-maker': ['Create Urdu name images', 'Templates and direct editing', 'Use your own background image', 'Download PNG']
  };
  return values[pageId] || [];
}

function templateItems(page, canonical) {
  if (page.id === 'urdu-templates' && templateLibrary && Array.isArray(templateLibrary.TEMPLATES)) {
    return templateLibrary.TEMPLATES.map((template, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: template.name,
      url: canonical + '?template=' + encodeURIComponent(template.slug)
    }));
  }
  if ((page.id === 'urdu-writing-templates' || page.id === 'urdu-writing-templates-ur') && Array.isArray(writingTemplates)) {
    return writingTemplates.map((template, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: template.title,
        alternateName: template.titleUrdu,
        inLanguage: 'ur'
      }
    }));
  }
  return [];
}

function buildGraph(page, html, options = {}) {
  const config = options.config || seo;
  const canonical = config.canonical(page.path);
  const resolvedTitle = page.searchTitle || page.title;
  const resolvedDescription = sourceDescription(html, page.searchDescription || page.description);
  const publisherId = config.SITE_ORIGIN + '/#publisher';
  const websiteId = config.SITE_ORIGIN + '/#website';
  const webpageId = canonical + '#webpage';
  const breadcrumbLabel = page.breadcrumbLabel || page.h1 || String(page.title || '').replace(/\s+–.*$/, '');
  const language = options.language || 'en';

  const webpage = {
    '@type': page.id === 'why-write-urdu' ? 'AboutPage' : 'WebPage',
    '@id': webpageId,
    url: canonical,
    name: resolvedTitle,
    description: resolvedDescription,
    inLanguage: language === 'ur' ? 'ur' : ['en', 'ur'],
    isPartOf: { '@id': websiteId },
    publisher: { '@id': publisherId }
  };
  if (page.lastmod) webpage.dateModified = page.lastmod;
  if (page.datePublished) webpage.datePublished = page.datePublished;
  if (PAGE_TOPICS[page.id]) webpage.about = PAGE_TOPICS[page.id].map(name => ({ '@type': 'Thing', name }));

  const graph = [websiteNode(config), publisherNode(config), webpage];

  if (page.path !== '/') {
    const items = [{ '@type': 'ListItem', position: 1, name: 'Write Urdu', item: config.SITE_ORIGIN + '/' }];
    let position = 2;
    if (page.section && page.section !== 'utility') {
      items.push({
        '@type': 'ListItem', position: position++,
        name: SECTION_LABELS[page.section] || 'Guides',
        item: config.SITE_ORIGIN + '/write-urdu-sitemap'
      });
    }
    items.push({ '@type': 'ListItem', position, name: breadcrumbLabel, item: canonical });
    graph.push({ '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumbs', itemListElement: items });
    webpage.breadcrumb = { '@id': canonical + '#breadcrumbs' };
  }

  if (hasSchema(page, 'WebApplication')) {
    const applicationId = canonical + '#application';
    graph.push({
      '@type': 'WebApplication',
      '@id': applicationId,
      name: resolvedTitle.replace(/\s+[–—].*$/, ''),
      url: canonical,
      mainEntityOfPage: { '@id': webpageId },
      applicationCategory: page.id === 'urdu-card-studio' ? 'DesignApplication' : (page.id === 'urdu-editor' || page.id === 'home' || page.id === 'urdu-writing-templates' ? 'WritingApplication' : 'UtilitiesApplication'),
      operatingSystem: 'Any',
      browserRequirements: 'Works in a modern web browser',
      isAccessibleForFree: true,
      description: resolvedDescription,
      inLanguage: language,
      featureList: applicationFeatures(page.id),
      publisher: { '@id': publisherId }
    });
    webpage.mainEntity = { '@id': applicationId };
  }

  if (hasSchema(page, 'CollectionPage')) {
    const listId = canonical + '#template-list';
    const items = templateItems(page, canonical);
    graph.push({
      '@type': 'CollectionPage',
      '@id': canonical + '#collection',
      url: canonical,
      name: resolvedTitle,
      description: resolvedDescription,
      isPartOf: { '@id': webpageId },
      mainEntity: { '@id': listId },
      publisher: { '@id': publisherId },
      inLanguage: language
    });
    if (items.length) {
      graph.push({
        '@type': 'ItemList',
        '@id': listId,
        name: page.id.indexOf('writing-templates') !== -1 ? 'Urdu writing templates' : 'Urdu template library',
        numberOfItems: items.length,
        itemListElement: items
      });
    }
  }

  if (hasSchema(page, 'FAQPage')) {
    const entities = extractFaq(html);
    if (entities.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': canonical + '#faq',
        url: canonical,
        mainEntity: entities,
        isPartOf: { '@id': webpageId },
        publisher: { '@id': publisherId },
        inLanguage: language
      });
    }
  } else if (hasSchema(page, 'Article')) {
    const publisher = config.PUBLISHER || {};
    const article = {
      '@type': 'Article',
      '@id': canonical + '#article',
      url: canonical,
      headline: resolvedTitle,
      description: resolvedDescription,
      mainEntityOfPage: { '@id': webpageId },
      author: { '@id': publisherId },
      publisher: { '@id': publisherId },
      inLanguage: language
    };
    if (publisher.publishingPrinciplesPath) article.publishingPrinciples = config.SITE_ORIGIN + publisher.publishingPrinciplesPath;
    if (page.datePublished) article.datePublished = page.datePublished;
    if (page.dateModified || page.lastmod) article.dateModified = page.dateModified || page.lastmod;
    graph.push(article);
    webpage.mainEntity = { '@id': article['@id'] };
  }

  if (page.id === 'write-urdu-documentation') {
    graph.push({
      '@type': 'HowTo',
      '@id': canonical + '#how-to',
      name: 'How to type Urdu online with Write Urdu',
      step: [
        { '@type': 'HowToStep', name: 'Type', text: 'Type with English letters, enter Urdu directly, or paste text into the editor.' },
        { '@type': 'HowToStep', name: 'Convert', text: 'Press Space to turn words typed with English letters into Urdu, or use direct Urdu input.' },
        { '@type': 'HowToStep', name: 'Refine', text: 'Correct spacing, add punctuation, find and replace text, or format a longer document.' },
        { '@type': 'HowToStep', name: 'Share', text: 'Copy, download, print or share the result when it is ready.' }
      ],
      isPartOf: { '@id': webpageId }
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function schemaTag(page, html, options) {
  const payload = JSON.stringify(buildGraph(page, html, options)).replace(/</g, '\\u003c');
  return '<script type="application/ld+json" data-write-urdu-schema>' + payload + '</script>';
}

function applyStaticSeoGraph(html, page, options = {}) {
  if (!page || page.indexable !== true) return html;
  const tag = schemaTag(page, html, options);
  let output = String(html || '').replace(/\s*<script\b[^>]*data-write-urdu-schema[^>]*>[\s\S]*?<\/script>/ig, '');
  if (!/<\/head>/i.test(output)) throw new Error('Missing </head> for ' + page.path);
  return output.replace(/<\/head>/i, '    ' + tag + '\n</head>');
}

module.exports = {
  buildGraph,
  applyStaticSeoGraph,
  extractFaq,
  plainText,
  sourceDescription,
  templateItems
};
