'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const runtimePath = path.join(root, 'js', 'outcome-navigation.js');

const STATIC_UTILITY_LINKS = [
  { href: '/urdu-writing-templates', label: { en: 'Writing templates', ur: 'اردو تحریری سانچے' } },
  { href: '/why-write-urdu', label: { en: 'About Write Urdu', ur: 'رائٹ اردو کے بارے میں' } },
  { href: '/contact', label: { en: 'Contact', ur: 'رابطہ' } },
  { href: '/write-urdu-privacy', label: { en: 'Privacy and terms', ur: 'رازداری اور شرائط' } },
  { href: '/write-urdu-sitemap', label: { en: 'Sitemap', ur: 'سائٹ میپ' } }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadOutcomeNavigationRegistry() {
  const source = fs.readFileSync(runtimePath, 'utf8');
  const document = {
    readyState: 'loading',
    documentElement: {
      lang: 'en',
      getAttribute(name) { return name === 'dir' ? 'ltr' : null; }
    },
    addEventListener() {},
    querySelector() { return null; }
  };
  const window = {
    location: {
      href: 'https://write-urdu.com/',
      pathname: '/',
      search: ''
    },
    WriteUrduLocale: { get() { return 'en'; } },
    setTimeout() {}
  };
  const context = {
    window,
    document,
    URL,
    URLSearchParams,
    CustomEvent: function CustomEvent() {},
    console
  };

  vm.runInNewContext(source, context, { filename: runtimePath });
  const runtime = context.window.WriteUrduOutcomeNavigation;
  if (!runtime || !Array.isArray(runtime.groups) || !Array.isArray(runtime.footerGroups)) {
    throw new Error('Outcome navigation runtime did not expose its governed groups');
  }

  return {
    groups: clone(runtime.groups),
    footerGroups: clone(runtime.footerGroups),
    utilityLinks: clone(STATIC_UTILITY_LINKS)
  };
}

function allStaticHrefs(registry) {
  const values = new Set();
  for (const group of registry.groups || []) {
    for (const item of group.items || []) values.add(String(item.href || '').split('?')[0]);
  }
  for (const group of registry.footerGroups || []) {
    for (const item of group.items || []) values.add(String(item.href || '').split('?')[0]);
  }
  for (const item of registry.utilityLinks || []) values.add(String(item.href || '').split('?')[0]);
  return [...values].filter(Boolean);
}

module.exports = {
  STATIC_UTILITY_LINKS,
  loadOutcomeNavigationRegistry,
  allStaticHrefs
};
