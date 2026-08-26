'use strict';

const { loadOutcomeNavigationRegistry } = require('./static-shell-registry.js');

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function localeValue(value, locale) {
  if (value && typeof value === 'object') return value[locale] || value.en || value.ur || '';
  return String(value || '');
}

function defaultHrefFor(href) {
  return href;
}

function renderNavGroup(group, locale, hrefFor) {
  const items = (group.items || [])
    .filter(item => item && item.href && !item.role)
    .map(item => '<a href="' + escapeHtml(hrefFor(item.href)) + '">' + escapeHtml(localeValue(item.label, locale)) + '</a>')
    .join('');
  return '<div class="wu-static-nav-group" data-wu-static-nav-group="' + escapeHtml(group.id) + '">' +
    '<strong>' + escapeHtml(localeValue(group.label, locale)) + '</strong>' + items + '</div>';
}

function renderStaticNav(options) {
  const settings = options || {};
  const locale = settings.locale === 'ur' ? 'ur' : 'en';
  const hrefFor = settings.hrefFor || defaultHrefFor;
  const registry = settings.registry || loadOutcomeNavigationRegistry();
  const brandLabel = locale === 'ur' ? 'رائٹ اردو' : 'Write Urdu';
  return '<nav class="navbar wu-static-site-nav" data-wu-static-shell="nav" aria-label="' + (locale === 'ur' ? 'بنیادی نیویگیشن' : 'Primary navigation') + '">' +
    '<a class="wu-static-brand" href="' + escapeHtml(hrefFor('/')) + '">' + brandLabel + '</a>' +
    '<div class="wu-static-nav-groups">' + registry.groups.map(group => renderNavGroup(group, locale, hrefFor)).join('') + '</div>' +
    '</nav>';
}

function renderFooterGroup(group, locale, hrefFor) {
  const items = (group.items || []).map(item => '<a href="' + escapeHtml(hrefFor(item.href)) + '">' + escapeHtml(localeValue(item.label, locale)) + '</a>').join('');
  return '<div class="wu-static-footer-group" data-wu-static-footer-group="' + escapeHtml(group.id) + '">' +
    '<strong>' + escapeHtml(localeValue(group.label, locale)) + '</strong>' + items + '</div>';
}

function renderStaticFooter(options) {
  const settings = options || {};
  const locale = settings.locale === 'ur' ? 'ur' : 'en';
  const hrefFor = settings.hrefFor || defaultHrefFor;
  const registry = settings.registry || loadOutcomeNavigationRegistry();
  const utility = (registry.utilityLinks || []).map(item => '<a href="' + escapeHtml(hrefFor(item.href)) + '">' + escapeHtml(localeValue(item.label, locale)) + '</a>').join('');
  return '<footer data-wu-static-shell="footer">' +
    '<nav class="wu-static-footer-nav" aria-label="' + (locale === 'ur' ? 'فوٹر نیویگیشن' : 'Footer navigation') + '">' +
      registry.footerGroups.map(group => renderFooterGroup(group, locale, hrefFor)).join('') +
      '<div class="wu-static-footer-group" data-wu-static-footer-group="trust"><strong>' + (locale === 'ur' ? 'مدد اور اعتماد' : 'Help & trust') + '</strong>' + utility + '</div>' +
    '</nav>' +
  '</footer>';
}

function replacePrimaryNav(html, markup) {
  const classNav = /<nav\b(?=[^>]*\bclass=["'][^"']*\bnavbar\b[^"']*["'])[^>]*>[\s\S]*?<\/nav>/i;
  if (classNav.test(html)) return html.replace(classNav, markup);
  const firstNav = /<nav\b[^>]*>[\s\S]*?<\/nav>/i;
  if (!firstNav.test(html)) throw new Error('Static shell source has no primary navigation placeholder');
  return html.replace(firstNav, markup);
}

function replaceFooter(html, markup) {
  const footer = /<footer\b[^>]*>[\s\S]*?<\/footer>/i;
  if (!footer.test(html)) throw new Error('Static shell source has no footer placeholder');
  return html.replace(footer, markup);
}

function applyStaticShell(html, options) {
  const settings = options || {};
  const registry = settings.registry || loadOutcomeNavigationRegistry();
  const nav = renderStaticNav({ ...settings, registry });
  const footer = renderStaticFooter({ ...settings, registry });
  return replaceFooter(replacePrimaryNav(String(html), nav), footer);
}

module.exports = {
  renderStaticNav,
  renderStaticFooter,
  applyStaticShell
};
