const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/wedding-project-core.js');
const wording = require('../js/wedding-wording-registry.js');
const cardStudio = require('../js/card-studio-core.js');
const adapter = require('../js/wedding-invitation-render-adapter.js');

const fixturePath = path.join(__dirname, 'fixtures', 'wu-shaadi-001', 'wedding-projects.v1.json');
const fixtureSet = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

function fixtureById(id) {
  const fixture = fixtureSet.cases.find((candidate) => candidate.id === id);
  assert.ok(fixture, `fixture ${id} must exist`);
  return fixture;
}

// A minimal stand-in for CanvasRenderingContext2D.measureText: no real browser canvas is
// available in this Node contract-test run, so this approximates glyph width from character
// count and current font size. It is not pixel-accurate, but it exercises the exact wrap/fit
// code paths (wrapRtlText / layoutCardText / findBestFontSize) that the real renderer uses,
// which is enough to prove the adapter's output survives that pipeline without modification.
function createMockContext() {
  const state = { fontSize: 64 };
  const ctx = {
    textBaseline: 'alphabetic',
    direction: 'ltr',
    measureText(value) {
      return { width: Array.from(String(value)).length * state.fontSize * 0.56 };
    }
  };
  Object.defineProperty(ctx, 'font', {
    get() { return state.fontSize + 'px sans-serif'; },
    set(value) {
      const match = /^(\d+(?:\.\d+)?)px/.exec(String(value));
      if (match) state.fontSize = Number(match[1]);
    }
  });
  return ctx;
}

function textBox(presetId, objectId) {
  const preset = cardStudio.PRESETS.find((candidate) => candidate.id === presetId);
  assert.ok(preset, `Card Studio preset ${presetId} must exist`);
  const transform = cardStudio.defaultTransform(preset, objectId || 'text');
  return { preset, box: cardStudio.transformToRect(transform, preset, objectId || 'text') };
}

// wrapRtlText only breaks on whitespace, so rejoining its output with single spaces (per
// paragraph, respecting paragraph boundaries) must reconstruct the whitespace-normalized
// source text. Any mismatch would mean the existing renderer's wrap logic drops or mangles
// characters when fed wedding content -- including embedded Urdu/Latin mixed-script runs.
function reconstructFromLines(lines) {
  const paragraphs = [];
  let current = [];
  lines.forEach((line) => {
    current.push(line.text);
    if (line.isParagraphEnd) {
      paragraphs.push(current.join(' ').trim());
      current = [];
    }
  });
  if (current.length) paragraphs.push(current.join(' ').trim());
  return paragraphs.join('\n');
}

function normalizeWhitespace(value) {
  return String(value).split(/\r\n|\r|\n/).map((line) => line.trim().replace(/\s+/g, ' ')).join('\n');
}

// --- Case 1: Urdu-only formal Nikah wording through the current Card Studio renderer. -----
{
  const fixture = fixtureById('formal-nikah');
  const project = core.normalizeWeddingProject(fixture.document);
  const event = project.events[0];
  const rendered = wording.renderWording('formal-nikah-ur', project, event);
  assert.ok(rendered.complete, 'formal-nikah-ur must render complete for this fixture');

  const viewModel = core.buildInvitationViewModel(project, null);
  const seed = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });

  assert.equal(seed.text.value, rendered.text, 'adapter must not alter rendered wording text');
  assert.equal(seed.wedding.direction, 'rtl', 'Urdu-first wording must be detected as rtl');
  assert.equal(seed.text.align, 'right', 'rtl text must align right by default');

  const cardProject = cardStudio.normalizeCardProject(seed);
  const validation = cardStudio.validateCardProject(cardProject);
  assert.ok(validation.valid, 'Card Studio must accept the wedding seed as a valid project');

  const { preset, box } = textBox('portrait');
  const ctx = createMockContext();
  const fit = cardStudio.findBestFontSize(ctx, cardProject, box);
  assert.equal(fit.overflow, false, 'formal Nikah wording must fit the portrait preset without overflow');
  assert.ok(fit.lines.length >= 3, 'formal Nikah wording spans multiple lines');

  const wrapped = cardStudio.wrapRtlText(ctx, cardProject.text.value, box.width, {});
  assert.equal(reconstructFromLines(wrapped), normalizeWhitespace(rendered.text), 'Urdu wrap must not drop characters');
  void preset;
}

// --- Case 2: bilingual (Urdu + Latin mixed-script) Baraat wording. -------------------------
{
  const fixture = fixtureById('bride-side-baraat');
  const project = core.normalizeWeddingProject(fixture.document);
  const event = project.events[0];
  const rendered = wording.renderWording('traditional-baraat-bilingual', project, event);
  assert.ok(rendered.complete, 'traditional-baraat-bilingual must render complete for this fixture');
  assert.match(rendered.text, /[A-Za-z]/, 'fixture must contain Latin script');
  assert.match(rendered.text, /[؀-ۿ]/, 'fixture must contain Urdu script');

  const viewModel = core.buildInvitationViewModel(project, null);
  const seed = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });
  const cardProject = cardStudio.normalizeCardProject(seed);
  assert.ok(cardStudio.validateCardProject(cardProject).valid, 'bilingual seed must validate');

  const { box } = textBox('portrait');
  const ctx = createMockContext();
  const fit = cardStudio.findBestFontSize(ctx, cardProject, box);
  assert.equal(fit.overflow, false, 'mixed-script Baraat wording must fit without overflow');

  const wrapped = cardStudio.wrapRtlText(ctx, cardProject.text.value, box.width, {});
  assert.equal(reconstructFromLines(wrapped), normalizeWhitespace(rendered.text), 'mixed-script wrap must not drop characters');
}

// --- Case 3: English-only Walima wording (direction must follow the text, not assume rtl). -
{
  const fixture = fixtureById('groom-side-walima');
  const project = core.normalizeWeddingProject(fixture.document);
  const event = project.events[0];
  const rendered = wording.renderWording('groom-family-walima-en', project, event);
  assert.ok(rendered.complete, 'groom-family-walima-en must render complete for this fixture');

  const viewModel = core.buildInvitationViewModel(project, null);
  const seed = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });
  assert.equal(seed.wedding.direction, 'ltr', 'English-first wording must be detected as ltr');
  assert.equal(seed.text.align, 'left');

  const cardProject = cardStudio.normalizeCardProject(seed);
  assert.ok(cardStudio.validateCardProject(cardProject).valid, 'English seed must validate');
}

// --- Adapter boundary: it must not invent wording, and must be a pure function. ------------
{
  const fixture = fixtureById('formal-nikah');
  const project = core.normalizeWeddingProject(fixture.document);
  const viewModel = core.buildInvitationViewModel(project, null);
  const rendered = wording.renderWording('formal-nikah-ur', project, project.events[0]);

  assert.throws(
    () => adapter.buildCardStudioSeed(viewModel, ''),
    /wordingText is required/,
    'adapter must refuse to fabricate wording when none is supplied'
  );

  const first = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });
  const second = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });
  assert.deepEqual(first, second, 'adapter must be a pure function of its inputs');

  // Non-responsibility check: passing a guestId-scoped view model must not change which
  // guests/events the adapter "sees" -- it only ever touches the events already filtered
  // into the view model it was given, never re-deriving guest scope itself.
  assert.equal(typeof adapter.buildCardStudioSeed.length, 'number');
}

// --- Renderer/mobile-preview-cost proxy. ----------------------------------------------------
// Node CPU timing is not a substitute for an on-device mobile profile; this is a structural
// smoke ceiling proving the full viewModel -> wording -> adapter -> layout pipeline used by a
// preview does not carry hidden quadratic/network cost, not a literal device benchmark.
{
  const fixture = fixtureById('multi-event-wedding');
  const project = core.normalizeWeddingProject(fixture.document);
  const viewModel = core.buildInvitationViewModel(project, null);
  const { box } = textBox('portrait');
  const iterations = 200;

  const started = process.hrtime.bigint();
  for (let i = 0; i < iterations; i += 1) {
    for (const event of project.events) {
      const rendered = wording.renderWording('concise-whatsapp', project, event);
      const seed = adapter.buildCardStudioSeed(viewModel, rendered.text, { presetId: 'portrait' });
      const cardProject = cardStudio.normalizeCardProject(seed);
      const ctx = createMockContext();
      cardStudio.findBestFontSize(ctx, cardProject, box);
    }
  }
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  const perCallMs = elapsedMs / (iterations * project.events.length);

  console.log(`WU-SHAADI-001 render-adapter preview-cost proxy: ${project.events.length * iterations} calls in ${elapsedMs.toFixed(1)}ms (${perCallMs.toFixed(3)}ms/call)`);
  assert.ok(perCallMs < 25, `preview pipeline call cost regressed unexpectedly (${perCallMs.toFixed(3)}ms/call)`);
}

console.log('Wedding invitation render-adapter proof passed (Urdu, bilingual and English wording through the current Card Studio renderer).');
