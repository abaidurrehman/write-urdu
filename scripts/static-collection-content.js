'use strict';

const templateLibrary = require('../js/template-library-core.js');
const writingTemplates = require('../js/writing-template-catalog.js');
const writingRuntime = require('../js/writing-templates-runtime.js');
const stylishCore = require('../js/stylish-urdu-core.js');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceContainer(html, attr, content) {
  const source = String(html || '');
  const startMarker = '<!-- wu-static-collection:start:' + attr + ' -->';
  const endMarker = '<!-- wu-static-collection:end:' + attr + ' -->';
  const marked = new RegExp(escapeRegex(startMarker) + '[\\s\\S]*?' + escapeRegex(endMarker), 'i');
  const markedContent = startMarker + content + endMarker;
  if (marked.test(source)) return source.replace(marked, markedContent);

  const openRe = new RegExp('<([a-z0-9-]+)\\b(?=[^>]*\\b' + attr + '(?:\\s|=|>|$))[^>]*>', 'i');
  const open = openRe.exec(source);
  if (!open) throw new Error('Missing collection container: ' + attr);
  const tagName = open[1];
  const openEnd = open.index + open[0].length;
  const tokenRe = new RegExp('<\\/?' + tagName + '\\b[^>]*>', 'ig');
  tokenRe.lastIndex = openEnd;
  let depth = 1;
  let token;
  while ((token = tokenRe.exec(source))) {
    if (/^<\//.test(token[0])) depth -= 1;
    else if (!/\/>$/.test(token[0])) depth += 1;
    if (depth === 0) {
      return source.slice(0, openEnd) + markedContent + source.slice(token.index);
    }
  }
  throw new Error('Unclosed collection container: ' + attr);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceSimpleText(html, attr, content) {
  const re = new RegExp('(<([a-z0-9-]+)\\b(?=[^>]*\\b' + attr + '(?:\\s|=|>|$))[^>]*>)[\\s\\S]*?(<\\/\\2>)', 'i');
  if (!re.test(html)) return html;
  return html.replace(re, '$1' + escapeHtml(content) + '$3');
}

function ensureHidden(html, attr) {
  const re = new RegExp('<([a-z0-9-]+)\\b(?=[^>]*\\b' + attr + '(?:\\s|=|>|$))([^>]*)>', 'i');
  return html.replace(re, function (tag, name, attrs) {
    if (/\shidden(?:\s|=|>|$)/i.test(tag)) return tag;
    return '<' + name + attrs + ' hidden>';
  });
}

function templateCategoryLabel(template) {
  if (templateLibrary && typeof templateLibrary.getCategoryLabel === 'function') return templateLibrary.getCategoryLabel(template.category);
  const category = (templateLibrary.CATEGORIES || []).find(item => item.id === template.category);
  return category ? category.label : template.category;
}

function templateDimensions(template) {
  if (templateLibrary && typeof templateLibrary.dimensionsLabel === 'function') return templateLibrary.dimensionsLabel(template);
  return template.canvas.width + ' × ' + template.canvas.height;
}

function renderTemplateLibraryCategories() {
  const buttons = ['<button type="button" class="template-filter-button" data-template-category="all" aria-pressed="true">All templates</button>'];
  for (const category of templateLibrary.CATEGORIES || []) {
    buttons.push('<button type="button" class="template-filter-button" data-template-category="' + escapeHtml(category.id) + '" aria-pressed="false">' + escapeHtml(category.shortLabel) + '</button>');
  }
  return buttons.join('');
}

function renderTemplateLibraryCards() {
  return (templateLibrary.TEMPLATES || []).map(template => {
    const accent = template.style && template.style.accent ? template.style.accent : '#177245';
    const preview = template.nameUrdu || 'اپنا اردو متن لکھیں';
    return '<article class="template-card" data-template-id="' + escapeHtml(template.id) + '" data-wu-static-catalogue-item>' +
      '<div class="template-card-preview" style="background-color:' + escapeHtml(template.canvas.backgroundColor) + ';border-top:5px solid ' + escapeHtml(accent) + '">' +
        '<img src="' + escapeHtml(template.thumbnail) + '" width="1200" height="630" loading="lazy" decoding="async" alt="' + escapeHtml(template.name) + ' Urdu design template preview" style="opacity:.42">' +
        '<div class="template-card-preview-copy" lang="ur" dir="rtl">' + escapeHtml(preview) + '</div>' +
      '</div>' +
      '<div class="template-card-body">' +
        '<div class="template-card-title-row"><h3>' + escapeHtml(template.name) + '</h3><button type="button" class="template-favorite" data-template-favorite="' + escapeHtml(template.id) + '" aria-pressed="false" aria-label="Add ' + escapeHtml(template.name) + ' to favorites">☆</button></div>' +
        '<p class="template-card-category">' + escapeHtml(templateCategoryLabel(template)) + '</p>' +
        '<p class="template-card-description">' + escapeHtml(template.description) + '</p>' +
        '<div class="template-card-footer"><span class="template-card-size">' + escapeHtml(templateDimensions(template)) + '</span><button type="button" class="template-open" data-template-open="' + escapeHtml(template.slug) + '">Edit in Card Studio</button></div>' +
      '</div>' +
    '</article>';
  }).join('');
}

function writingCategory(template, urdu) {
  const category = (writingRuntime.CATEGORIES || []).find(item => item.id === template.category);
  if (!category) return template.category;
  return urdu ? category.labelUrdu : category.label;
}

function writingPreview(template) {
  return String(template.body || '').split('\n').filter(Boolean).slice(0, 3).join(' ');
}

function renderWritingCategories(urdu) {
  return (writingRuntime.CATEGORIES || []).map(category => '<button type="button" class="writing-template-filter" data-writing-template-category="' + escapeHtml(category.id) + '" aria-pressed="' + (category.id === 'all' ? 'true' : 'false') + '">' + escapeHtml(urdu ? category.labelUrdu : category.label) + '</button>').join('');
}

function renderWritingTemplateCards(urdu) {
  return writingTemplates.map(template => {
    const description = urdu ? 'اس تیار اردو سانچے کو اپنی معلومات کے مطابق ایڈٹ کریں۔' : template.description;
    return '<article class="writing-template-card" data-template-id="' + escapeHtml(template.id) + '" data-wu-static-catalogue-item>' +
      '<span class="writing-template-badge">' + escapeHtml(writingCategory(template, urdu)) + '</span>' +
      '<h3 lang="ur" dir="rtl">' + escapeHtml(template.titleUrdu) + '</h3>' +
      (urdu ? '<p class="writing-template-english-title" hidden></p>' : '<p class="writing-template-english-title">' + escapeHtml(template.title) + '</p>') +
      '<p class="writing-template-description">' + escapeHtml(description) + '</p>' +
      '<p class="writing-template-preview" lang="ur" dir="rtl">' + escapeHtml(writingPreview(template)) + '</p>' +
      '<button type="button" class="urdu-tool-button primary" data-writing-template-open="' + escapeHtml(template.id) + '">' + (urdu ? 'یہ سانچہ استعمال کریں' : 'Use this template') + '</button>' +
    '</article>';
  }).join('');
}

function representativeStylishItems() {
  const sample = 'آپ کا اردو نام';
  const categories = ['minimal', 'royal', 'hearts', 'islamic', 'gaming', 'social', 'kashida', 'urdu-english', 'decorative', 'popular'];
  const items = [];
  for (const category of categories) {
    const options = category === 'popular'
      ? { category: 'all', query: 'popular', limit: 1 }
      : { category, limit: 1 };
    const result = stylishCore.generateStyles(sample, options);
    if (result.items && result.items[0]) items.push(result.items[0]);
  }
  return items;
}

function renderStylishExamples() {
  return representativeStylishItems().map(item => '<article class="stylish-card" data-style-id="' + escapeHtml(item.id) + '" data-wu-static-catalogue-item>' +
    '<div class="stylish-card-preview" dir="auto">' + escapeHtml(item.output) + '</div>' +
    '<div class="stylish-card-meta"><span class="stylish-card-name">' + escapeHtml(item.name) + '</span><span class="stylish-badge">' + escapeHtml(item.compatibility) + '</span></div>' +
  '</article>').join('');
}

function applyStaticCollectionContent(html, route) {
  let output = String(html || '');
  if (route === '/urdu-templates') {
    output = replaceContainer(output, 'data-template-categories', renderTemplateLibraryCategories());
    output = replaceContainer(output, 'data-template-grid', renderTemplateLibraryCards());
    output = replaceSimpleText(output, 'data-template-result-count', (templateLibrary.TEMPLATES || []).length + ' templates available');
    output = ensureHidden(output, 'data-template-skeleton');
    return output;
  }
  if (route === '/urdu-writing-templates' || route === '/urdu/urdu-writing-templates') {
    const urdu = route.startsWith('/urdu/');
    output = replaceContainer(output, 'data-writing-template-categories', renderWritingCategories(urdu));
    output = replaceContainer(output, 'data-writing-template-grid', renderWritingTemplateCards(urdu));
    output = replaceSimpleText(output, 'data-writing-template-count', urdu ? (writingTemplates.length + ' اردو تحریری سانچے') : (writingTemplates.length + ' writing templates'));
    return output;
  }
  if (route === '/stylish-urdu-text-generator') {
    const items = representativeStylishItems();
    output = replaceContainer(output, 'data-stylish-results', renderStylishExamples());
    output = replaceSimpleText(output, 'data-stylish-count', items.length + ' representative styles · add your text for personalized results');
    return output;
  }
  return output;
}

module.exports = {
  applyStaticCollectionContent,
  renderTemplateLibraryCards,
  renderWritingTemplateCards,
  renderStylishExamples,
  representativeStylishItems,
  escapeHtml
};
