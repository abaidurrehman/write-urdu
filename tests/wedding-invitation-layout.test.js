const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const layout = require('../js/wedding-invitation-layout.js');

function project(overrides) {
  return Object.assign({
    invitationLanguage: 'urdu',
    couple: { personA: { displayName: 'عائشہ' }, personB: { displayName: 'احمد' } },
    families: [{ role: 'bride_side', displayName: 'جناب طارق خان' }, { role: 'groom_side', displayName: 'جناب عمران علی' }],
    events: [{ id: 'e1', type: 'nikah', date: '2026-11-22', hostMode: 'bride_side', programme: [{ labelType: 'gathering', time: '19:00' }], venueId: 'v1' }],
    venues: [{ id: 'v1', name: 'پرل گارڈن', city: 'لاہور' }]
  }, overrides || {});
}

const roles = (composed) => composed.blocks.map((block) => block.role);
const textOf = (composed, role) => composed.blocks.filter((block) => block.role === role).map((block) => block.text);

// Dates and times are formatted deterministically in both scripts.
assert.equal(layout.formatDate('2026-11-22', 'ur'), 'بروز اتوار، 22 نومبر 2026');
assert.equal(layout.formatDate('2026-11-22', 'en'), 'Sunday, 22 November 2026');
assert.equal(layout.formatDate('not-a-date', 'en'), '');
assert.equal(layout.formatTime('19:00', 'en'), '7:00 PM');
assert.equal(layout.formatTime('19:30', 'ur'), 'شام 7:30 بجے');
assert.equal(layout.formatTime('13:00', 'ur'), 'دوپہر 1 بجے');
assert.equal(layout.formatTime('21:00', 'ur'), 'رات 9 بجے');
assert.equal(layout.formatTime('00:15', 'en'), '12:15 AM');

// Urdu traditional Nikah: full hierarchy in reading order.
{
  const composed = layout.composeInvitation(project(), 'e1', { sample: false });
  assert.deepEqual(roles(composed), ['kicker', 'heading', 'invite', 'name', 'joiner', 'name', 'divider', 'date', 'time', 'venue', 'address', 'host', 'closing']);
  assert.deepEqual(textOf(composed, 'name'), ['عائشہ', 'احمد']);
  assert.deepEqual(textOf(composed, 'heading'), ['دعوتِ نکاح']);
  assert.deepEqual(textOf(composed, 'host'), ['منجانب: جناب طارق خان']);
  assert.equal(composed.usedSample, false);
  assert.deepEqual(composed.missing, []);
  composed.blocks.filter((block) => block.role !== 'divider').forEach((block) => assert.equal(block.script, 'ur', `${block.role} should be Urdu`));
}

// Never invent: exports omit missing values; previews flag every sample they add.
{
  const empty = project({ couple: {}, events: [{ id: 'e1', type: 'walima' }], venues: [], families: [] });
  const exported = layout.composeInvitation(empty, 'e1', { sample: false });
  assert.deepEqual(exported.missing, ['bride', 'groom', 'date', 'venue']);
  assert.equal(exported.usedSample, false);
  assert.ok(!roles(exported).includes('name') && !roles(exported).includes('date') && !roles(exported).includes('venue'));
  assert.ok(exported.blocks.every((block) => !block.sample));
  const preview = layout.composeInvitation(empty, 'e1', { sample: true });
  assert.equal(preview.usedSample, true);
  ['name', 'date', 'time', 'venue'].forEach((role) => {
    assert.ok(preview.blocks.some((block) => block.role === role && block.sample), `sample ${role} must be flagged`);
  });
  assert.doesNotMatch(layout.invitationPlainText(empty, 'e1'), /عائشہ|Ayesha|Pearl|پرل/, 'Copied wording must never contain sample values');
}

// Groom's family hosting puts the groom first; hosts are never inferred from names.
{
  const composed = layout.composeInvitation(project({ events: [{ id: 'e1', type: 'walima', date: '2026-11-24', hostMode: 'groom_side' }] }), 'e1');
  assert.deepEqual(textOf(composed, 'name'), ['احمد', 'عائشہ']);
  assert.deepEqual(textOf(composed, 'host'), ['منجانب: جناب عمران علی']);
  const couple = layout.composeInvitation(project({ events: [{ id: 'e1', type: 'walima', hostMode: 'couple' }] }), 'e1');
  assert.ok(!roles(couple).includes('host'), 'The couple hosting has no family line');
}

// Bilingual: Urdu title and closing frame English details; English names stay English.
{
  const composed = layout.composeInvitation(project({
    invitationLanguage: 'bilingual',
    couple: { personA: { displayName: 'Ayesha' }, personB: { displayName: 'Ahmed' } },
    families: [{ role: 'bride_side', displayName: 'Mr & Mrs Tariq Khan' }],
    venues: [{ id: 'v1', name: 'Pearl Garden', city: 'Lahore' }]
  }), 'e1');
  const byRole = Object.fromEntries(composed.blocks.map((block) => [block.role, block]));
  assert.equal(byRole.heading.script, 'ur');
  assert.equal(byRole.subheading.text, 'NIKAH CEREMONY');
  assert.equal(byRole.invite.script, 'en');
  assert.equal(byRole.date.text, 'Sunday, 22 November 2026');
  assert.equal(byRole.closing.script, 'ur');
  assert.equal(byRole.joiner.text, '&');
  assert.equal(byRole.host.text, 'Hosted by Mr & Mrs Tariq Khan', 'English family names get an English prefix');
}

// English modern Mehndi uses festive wording; custom invitation line overrides the style.
{
  const english = project({ invitationLanguage: 'english', couple: { personA: { displayName: 'Sana' }, personB: { displayName: 'Bilal' } } });
  english.events = [{ id: 'e1', type: 'mehndi', wordingTone: 'informal', date: '2026-12-18' }];
  assert.deepEqual(textOf(layout.composeInvitation(english, 'e1'), 'invite'), ['Join us for an evening of colour, music & dholki']);
  english.events[0].customWording = 'Come dance with us!';
  assert.deepEqual(textOf(layout.composeInvitation(english, 'e1'), 'invite'), ['Come dance with us!']);
}

// Numbers-only RSVP on an Urdu card takes the Urdu prefix.
{
  const p = project();
  p.events[0].rsvpText = '0300 1234567';
  p.events[0].dressCode = 'سبز اور پیلا';
  const composed = layout.composeInvitation(p, 'e1');
  assert.deepEqual(textOf(composed, 'rsvp'), ['برائے رابطہ: 0300 1234567']);
  assert.deepEqual(textOf(composed, 'extra'), ['لباس: سبز اور پیلا']);
}

// Several programme times render as labelled rows on one line.
{
  const p = project();
  p.events[0].programme = [{ labelType: 'nikah', time: '19:00' }, { labelType: 'dinner', time: '21:00' }];
  assert.deepEqual(textOf(layout.composeInvitation(p, 'e1'), 'time'), ['نکاح: شام 7 بجے  •  طعام: رات 9 بجے']);
}

// Multi-event: each card reads its own event's details only.
{
  const p = project({
    events: [
      { id: 'm', type: 'mehndi', date: '2026-12-18', venueId: 'vm' },
      { id: 'n', type: 'nikah', date: '2026-12-19', venueId: 'vn' }
    ],
    venues: [{ id: 'vm', name: 'گھر' }, { id: 'vn', name: 'مسجد' }]
  });
  assert.deepEqual(textOf(layout.composeInvitation(p, 'm'), 'venue'), ['بمقام: گھر']);
  assert.deepEqual(textOf(layout.composeInvitation(p, 'n'), 'venue'), ['بمقام: مسجد']);
  assert.match(textOf(layout.composeInvitation(p, 'm'), 'date')[0], /18 دسمبر/);
  assert.match(textOf(layout.composeInvitation(p, 'n'), 'date')[0], /19 دسمبر/);
  assert.equal(layout.eventSummary(p, 'n'), 'Nikah · Sat 19 Dec');
}

// The religious opening appears only once its library entry has passed human review.
{
  const p = project({ religiousOpening: { mode: 'verified_library', libraryId: 'bismillah-standard' } });
  assert.ok(!roles(layout.composeInvitation(p, 'e1')).includes('opening'), 'Unreviewed religious text must not render');
}

// Location QR only for a real http(s) link and only when asked.
{
  const p = project();
  p.venues[0].mapUrl = 'https://maps.app.goo.gl/example';
  assert.equal(layout.composeInvitation(p, 'e1').qr, null);
  p.events[0].showMapQr = true;
  assert.equal(layout.composeInvitation(p, 'e1').qr.url, 'https://maps.app.goo.gl/example');
  p.venues[0].mapUrl = 'javascript:alert(1)';
  assert.equal(layout.composeInvitation(p, 'e1').qr, null);
}

// Privacy: the maker only ever sends bounded enums to telemetry — never names, venues or wording.
{
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'urdu-wedding-invitation-maker.js'), 'utf8');
  const calls = source.match(/track\('[a-z_]+', \{[^}]*\}\)/g) || [];
  assert.ok(calls.length >= 4, 'Export/share outcomes should be measured');
  calls.forEach((call) => {
    const keys = (call.match(/(\w+):/g) || []).map((key) => key.slice(0, -1));
    keys.forEach((key) => assert.ok(['format', 'success', 'error_category'].includes(key), `Telemetry key ${key} is not allowed: ${call}`));
  });
  assert.doesNotMatch(source, /location\.(search|hash)\s*=|history\.(push|replace)State/, 'Wedding details must never be placed in the URL');
  assert.doesNotMatch(source, /wa\.me\/\?text=|api\.whatsapp\.com\/send\?text=/, 'Invitation text must not be pushed through a URL');
}

console.log('wedding invitation layout contract passed');
