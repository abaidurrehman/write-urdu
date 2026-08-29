const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const repoRoot = path.join(__dirname, '..');

  // --- Static source checks -------------------------------------------------

  const migrationSource = fs.readFileSync(
    path.join(repoRoot, 'migrations/0013_community_publication_withdrawal.sql'),
    'utf8'
  );
  assert.match(migrationSource, /ALTER TABLE "community_writing_publications"/);
  assert.match(migrationSource, /ADD COLUMN "unpublished_by" TEXT CHECK \("unpublished_by" IN \('author', 'moderator'\)\)/);

  const moderationSource = fs.readFileSync(path.join(repoRoot, 'functions/lib/community-moderation.mjs'), 'utf8');
  assert.match(
    moderationSource,
    /unpublished_by = 'moderator'/,
    'Moderator-initiated unpublish must tag unpublished_by so writer UI can distinguish it from self-withdrawal'
  );

  const myPublicationsLibSource = fs.readFileSync(path.join(repoRoot, 'functions/lib/community-my-publications.mjs'), 'utf8');
  assert.doesNotMatch(myPublicationsLibSource, /writing_documents/, 'My Publications must never read writing_documents directly');
  assert.match(myPublicationsLibSource, /requireCommunityContext/);
  for (const marker of [
    'FROM community_writing_submissions WHERE id = ?1 AND user_id = ?2',
    'FROM community_writing_publications WHERE id = ?1 AND user_id = ?2',
    'WHERE id = ?2 AND user_id = ?3 AND status'
  ]) {
    assert.ok(myPublicationsLibSource.includes(marker), `Expected owner-scoped query fragment: ${marker}`);
  }

  for (const routeFile of [
    'functions/api/community/my-publications.js',
    'functions/api/community/submissions/[id]/revise.js',
    'functions/api/community/publications/[id]/withdraw.js'
  ]) {
    const source = fs.readFileSync(path.join(repoRoot, routeFile), 'utf8');
    assert.match(source, /community-my-publications\.mjs/, `${routeFile} must delegate to the lib module`);
  }

  console.log('Community my-publications repository (COMMUNITY-E static) contracts passed.');

  // --- Pure state-grouping matrix (spec WU-COMMUNITY-001E section 21) -------

  const { groupMyPublicationItems, stateLabel, rejectionCopy } = await import('../js/community-my-publications-state.mjs');

  function entry(overrides) {
    return {
      submissionId: 'sub-1',
      publicationId: null,
      title: 'Title',
      publicAuthorName: 'Writer',
      primaryCategory: 'poetry',
      tags: ['ghazal'],
      plainTextPreview: 'preview',
      submissionStatus: 'pending',
      publicationStatus: null,
      submissionRevision: 1,
      submittedAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      reviewedAt: null,
      rejectionCode: null,
      rejectionNote: null,
      publicSlug: null,
      publishedAt: null,
      unpublishedBy: null,
      sourceDocumentId: null,
      ...overrides
    };
  }

  {
    const [card] = groupMyPublicationItems([entry({ submissionStatus: 'pending', publicationId: null })]);
    assert.equal(card.state, 'in_review');
    assert.equal(stateLabel(card.state), 'In review');
  }

  {
    const [card] = groupMyPublicationItems([entry({
      submissionId: 'sub-1', publicationId: 'pub-1', submissionStatus: 'approved',
      publicationStatus: 'published', publicSlug: 'ab-title', publishedAt: '2026-08-02T00:00:00.000Z'
    })]);
    assert.equal(card.state, 'published');
    assert.equal(card.reviseSubmissionId, 'sub-1');
  }

  {
    const [card] = groupMyPublicationItems([entry({ submissionStatus: 'rejected', publicationId: null, rejectionCode: 'needs_writer_revision' })]);
    assert.equal(card.state, 'not_approved');
    assert.equal(rejectionCopy(card.rejectionCode), 'Please revise this writing and submit it again.');
  }

  {
    const items = [
      entry({ submissionId: 'sub-1', publicationId: 'pub-1', submissionStatus: 'approved', publicationStatus: 'published', publicSlug: 'ab-title', publishedAt: '2026-08-02T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z' }),
      entry({ submissionId: 'sub-2', publicationId: 'pub-1', submissionStatus: 'pending', publicationStatus: 'published', publicSlug: 'ab-title', submissionRevision: 2, updatedAt: '2026-08-03T00:00:00.000Z' })
    ];
    const [card] = groupMyPublicationItems(items);
    assert.equal(card.state, 'revision_in_review');
    assert.equal(card.reviseSubmissionId, null, 'Must not offer another revision while one is already pending');
  }

  {
    const items = [
      entry({ submissionId: 'sub-1', publicationId: 'pub-1', submissionStatus: 'approved', publicationStatus: 'published', publicSlug: 'ab-title', publishedAt: '2026-08-02T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z' }),
      entry({ submissionId: 'sub-2', publicationId: 'pub-1', submissionStatus: 'rejected', publicationStatus: 'published', publicSlug: 'ab-title', submissionRevision: 2, rejectionCode: 'off_topic', updatedAt: '2026-08-03T00:00:00.000Z' })
    ];
    const [card] = groupMyPublicationItems(items);
    assert.equal(card.state, 'published', 'A rejected revision must not take down the currently published version');
    assert.ok(card.revisionRejection, 'Revision rejection must be surfaced separately from the Published state');
    assert.equal(card.revisionRejection.rejectionCode, 'off_topic');
    assert.equal(card.reviseSubmissionId, 'sub-1', 'Writer may submit another revision after a rejected one');
  }

  {
    const [card] = groupMyPublicationItems([entry({
      submissionId: 'sub-1', publicationId: 'pub-1', submissionStatus: 'approved',
      publicationStatus: 'unpublished', unpublishedBy: 'author'
    })]);
    assert.equal(card.state, 'withdrawn');
    assert.equal(stateLabel(card.state), 'Withdrawn by you');
  }

  {
    const [card] = groupMyPublicationItems([entry({
      submissionId: 'sub-1', publicationId: 'pub-1', submissionStatus: 'approved',
      publicationStatus: 'unpublished', unpublishedBy: 'moderator'
    })]);
    assert.equal(card.state, 'unpublished_removed');
  }

  console.log('Community my-publications state mapping (COMMUNITY-E state) contracts passed.');

  // --- Repository-level tests against a minimal fake D1 ----------------------

  const { createMyPublicationsRepository } = await import('../functions/lib/community-my-publications.mjs');

  function makeSubmissionRow(overrides) {
    return {
      id: 'sub-owned', user_id: 'user-a', source_document_id: null, publication_id: null,
      submission_revision: 1, status: 'approved', content_format: 'plain', editor_kind: 'basic',
      public_author_name: 'Writer', title: 'Title', content: 'Body', plain_text: 'Body',
      primary_category: 'poetry', tags_json: '["ghazal"]', submitted_at: '2026-08-01T00:00:00.000Z',
      updated_at: '2026-08-01T00:00:00.000Z', reviewed_at: null, rejection_code: null, rejection_note: null,
      ...overrides
    };
  }

  function makePublicationRow(overrides) {
    return {
      id: 'pub-owned', source_submission_id: 'sub-owned', user_id: 'user-a', slug: 'ab-title',
      status: 'published', public_author_name: 'Writer', title: 'Title', content: 'Body', plain_text: 'Body',
      content_format: 'plain', primary_category: 'poetry', tags_json: '["ghazal"]',
      published_at: '2026-08-02T00:00:00.000Z', updated_at: '2026-08-02T00:00:00.000Z',
      report_count: 0, last_report_at: null, unpublished_by: null,
      ...overrides
    };
  }

  function createFakeDb(state) {
    function selectSubmissionsJoinPublications(args) {
      const [userId] = args;
      return state.submissions
        .filter((row) => row.user_id === userId)
        .map((row) => {
          const publication = state.publications.find((p) => p.id === row.publication_id) || null;
          return {
            submissionId: row.id, publicationId: row.publication_id, title: row.title,
            publicAuthorName: row.public_author_name, primaryCategory: row.primary_category,
            tagsJson: row.tags_json, submissionStatus: row.status, submissionRevision: row.submission_revision,
            plainText: row.plain_text, submittedAt: row.submitted_at, updatedAt: row.updated_at,
            reviewedAt: row.reviewed_at, rejectionCode: row.rejection_code, rejectionNote: row.rejection_note,
            sourceDocumentId: row.source_document_id,
            publicationStatus: publication ? publication.status : null,
            publicSlug: publication ? publication.slug : null,
            publishedAt: publication ? publication.published_at : null,
            unpublishedBy: publication ? publication.unpublished_by : null
          };
        });
    }

    function runSelect(sql, args) {
      if (sql.includes('LEFT JOIN community_writing_publications')) {
        return selectSubmissionsJoinPublications(args);
      }
      if (sql.includes('SELECT id, publication_id AS publicationId')) {
        const [id, userId] = args;
        const row = state.submissions.find((s) => s.id === id && s.user_id === userId);
        return row ? [{ id: row.id, publicationId: row.publication_id }] : [];
      }
      if (sql.includes('SELECT id, status, unpublished_by AS unpublishedBy')) {
        const [id, userId] = args;
        const row = state.publications.find((p) => p.id === id && p.user_id === userId);
        return row ? [{ id: row.id, status: row.status, unpublishedBy: row.unpublished_by }] : [];
      }
      if (sql.includes('COALESCE(MAX(submission_revision), 0) AS maxRevision')) {
        const [publicationId] = args;
        const revisions = state.submissions.filter((s) => s.publication_id === publicationId).map((s) => s.submission_revision);
        return [{ maxRevision: revisions.length ? Math.max(...revisions) : 0 }];
      }
      if (sql.includes('source_document_id AS sourceDocumentId')) {
        const [id] = args;
        const row = state.submissions.find((s) => s.id === id);
        return row ? [{
          id: row.id, sourceDocumentId: row.source_document_id, publicationId: row.publication_id,
          submissionRevision: row.submission_revision, status: row.status, contentFormat: row.content_format,
          editorKind: row.editor_kind, publicAuthorName: row.public_author_name, title: row.title,
          content: row.content, plainText: row.plain_text, primaryCategory: row.primary_category,
          tagsJson: row.tags_json, submittedAt: row.submitted_at, updatedAt: row.updated_at
        }] : [];
      }
      throw new Error(`Unmatched SELECT in fake D1: ${sql.slice(0, 120)}`);
    }

    function runWrite(sql, args) {
      if (sql.includes('INSERT INTO community_writing_submissions')) {
        const [id, userId, sourceDocumentId, publicationId, revision, contentFormat, editorKind, authorName, title, content, plainText, category, tagsJson, guidelinesVersion, signature, now] = args;
        state.submissions.push(makeSubmissionRow({
          id, user_id: userId, source_document_id: sourceDocumentId, publication_id: publicationId,
          submission_revision: revision, status: 'pending', content_format: contentFormat, editor_kind: editorKind,
          public_author_name: authorName, title, content, plain_text: plainText, primary_category: category,
          tags_json: tagsJson, submitted_at: now, updated_at: now
        }));
        return { meta: { changes: 1 } };
      }
      if (sql.includes("SET status = 'unpublished', unpublished_by = 'author'")) {
        const [now, publicationId, userId] = args;
        const row = state.publications.find((p) => p.id === publicationId && p.user_id === userId && p.status === 'published');
        if (!row) return { meta: { changes: 0 } };
        row.status = 'unpublished';
        row.unpublished_by = 'author';
        row.updated_at = now;
        return { meta: { changes: 1 } };
      }
      throw new Error(`Unmatched write in fake D1: ${sql.slice(0, 120)}`);
    }

    return {
      prepare(sql) {
        let boundArgs = [];
        return {
          bind(...args) { boundArgs = args; return this; },
          async first() {
            const rows = runSelect(sql, boundArgs);
            return rows[0] || null;
          },
          async all() { return { results: runSelect(sql, boundArgs) }; },
          async run() {
            const trimmed = sql.trim().toUpperCase();
            return trimmed.startsWith('SELECT') ? { results: runSelect(sql, boundArgs) } : runWrite(sql, boundArgs);
          }
        };
      }
    };
  }

  {
    const state = {
      submissions: [
        makeSubmissionRow({ id: 'sub-a', user_id: 'user-a', publication_id: 'pub-a' }),
        makeSubmissionRow({ id: 'sub-b', user_id: 'user-b', publication_id: 'pub-b' })
      ],
      publications: [
        makePublicationRow({ id: 'pub-a', user_id: 'user-a', slug: 'a-title' }),
        makePublicationRow({ id: 'pub-b', user_id: 'user-b', slug: 'b-title' })
      ]
    };
    const repo = createMyPublicationsRepository(createFakeDb(state));

    const listA = await repo.list('user-a');
    assert.equal(listA.length, 1);
    assert.equal(listA[0].submissionId, 'sub-a');

    const listB = await repo.list('user-b');
    assert.equal(listB.length, 1);
    assert.equal(listB[0].submissionId, 'sub-b');

    assert.equal(await repo.getOwnedPublication('user-b', 'pub-a'), null, 'User B must not resolve user A publication');
    assert.ok(await repo.getOwnedPublication('user-a', 'pub-a'), 'User A must resolve own publication');

    const nextRevision = await repo.nextRevisionNumber('pub-a');
    assert.equal(nextRevision, 2, 'Next revision continues the submission_revision lineage already on the approved row');

    const created = await repo.createRevision('user-a', 'pub-a', {
      sourceDocumentId: null, contentFormat: 'plain', editorKind: 'basic', publicAuthorName: 'Writer',
      title: 'New title', content: 'New body', plainText: 'New body', primaryCategory: 'poetry',
      tags: ['ghazal'], guidelinesVersion: '2026-08-25', contentSignature: 'sig-1'
    }, nextRevision, '2026-08-04T00:00:00.000Z', 'sub-a-rev2');
    assert.equal(created.status, 'pending');
    assert.equal(created.publicationId, 'pub-a');
    assert.equal(created.submissionRevision, 2);

    const withdrawnFirst = await repo.withdraw('user-a', 'pub-a', '2026-08-05T00:00:00.000Z');
    assert.equal(withdrawnFirst, true);
    const withdrawnSecond = await repo.withdraw('user-a', 'pub-a', '2026-08-06T00:00:00.000Z');
    assert.equal(withdrawnSecond, false, 'Repository-level withdraw is a conditional UPDATE; the handler layer makes the endpoint idempotent');

    const own = await repo.getOwnedPublication('user-a', 'pub-a');
    assert.equal(own.status, 'unpublished');
    assert.equal(own.unpublishedBy, 'author');
  }

  console.log('Community my-publications repository (COMMUNITY-E repository) contracts passed.');

  // --- Route-level tests with injected fake repositories ---------------------

  const {
    handleMyPublicationsList,
    handleSubmissionRevise,
    handlePublicationWithdraw
  } = await import('../functions/lib/community-my-publications.mjs');

  function envFor(featureEnabled) {
    return { COMMUNITY_SUBMISSIONS_ENABLED: featureEnabled ? 'true' : 'false', METRICS_DB: { prepare() { return {}; } } };
  }

  async function sessionUserA() {
    return { user: { id: 'user-a' } };
  }
  async function noSession() {
    return {};
  }

  {
    const request = new Request('https://write-urdu.com/api/community/my-publications');
    const response = await handleMyPublicationsList(request, envFor(false), { getSession: sessionUserA });
    assert.equal(response.status, 404);
  }

  {
    const request = new Request('https://write-urdu.com/api/community/my-publications');
    const response = await handleMyPublicationsList(request, envFor(true), { getSession: noSession });
    assert.equal(response.status, 401);
  }

  {
    const fakeItems = [{ submissionId: 'sub-a' }];
    const repositoryFactory = () => ({ async list(userId) { assert.equal(userId, 'user-a'); return fakeItems; } });
    const request = new Request('https://write-urdu.com/api/community/my-publications');
    const response = await handleMyPublicationsList(request, envFor(true), { getSession: sessionUserA, repositoryFactory });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.items, fakeItems);
  }

  function fakeMyRepo(overrides = {}) {
    return {
      async getOwnedSubmission() { return { id: 'sub-live', publicationId: 'pub-1' }; },
      async getOwnedPublication() { return { id: 'pub-1', status: 'published', unpublishedBy: null }; },
      async nextRevisionNumber() { return 2; },
      async createRevision(userId, publicationId, input, revisionNumber) {
        return { id: 'sub-new', publicationId, submissionRevision: revisionNumber, status: 'pending' };
      },
      async withdraw() { return true; },
      ...overrides
    };
  }

  function fakeSubmissionRepo(overrides = {}) {
    return {
      async verifyDocumentOwnership() { return true; },
      async findPendingDuplicate() { return null; },
      async countPending() { return 0; },
      async countSince() { return 0; },
      ...overrides
    };
  }

  const validRevisionBody = {
    editorKind: 'basic', contentFormat: 'plain', title: 'Revised title', publicAuthorName: 'Writer',
    plainText: 'x'.repeat(90), primaryCategory: 'poetry', tags: ['ghazal'],
    rightsConfirmed: true, publicConfirmed: true, guidelinesVersion: '2026-08-25'
  };

  {
    // Submission id fails ID_PATTERN entirely -> 404 before any context/lookup work.
    const request = new Request('https://write-urdu.com/api/community/submissions/not-a-uuid/revise', { method: 'POST' });
    const response = await handleSubmissionRevise(request, envFor(true), 'not-a-uuid', { getSession: sessionUserA });
    assert.equal(response.status, 404);
  }

  const validSubmissionId = '11111111-1111-4111-8111-111111111111';

  {
    const myRepositoryFactory = () => fakeMyRepo({ async getOwnedSubmission() { return null; } });
    const request = new Request(`https://write-urdu.com/api/community/submissions/${validSubmissionId}/revise`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validRevisionBody)
    });
    const response = await handleSubmissionRevise(request, envFor(true), validSubmissionId, {
      getSession: sessionUserA, myRepositoryFactory, submissionRepositoryFactory: fakeSubmissionRepo
    });
    assert.equal(response.status, 404, 'A submission not owned (or with no linked publication) must not be revisable');
  }

  {
    const myRepositoryFactory = () => fakeMyRepo({ async getOwnedPublication() { return { id: 'pub-1', status: 'unpublished', unpublishedBy: 'author' }; } });
    const request = new Request(`https://write-urdu.com/api/community/submissions/${validSubmissionId}/revise`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validRevisionBody)
    });
    const response = await handleSubmissionRevise(request, envFor(true), validSubmissionId, {
      getSession: sessionUserA, myRepositoryFactory, submissionRepositoryFactory: fakeSubmissionRepo
    });
    assert.equal(response.status, 409, 'A withdrawn/unpublished publication must not accept a revision');
  }

  {
    let createCalledWith = null;
    const myRepositoryFactory = () => fakeMyRepo({
      async createRevision(userId, publicationId, input, revisionNumber) {
        createCalledWith = { userId, publicationId, revisionNumber };
        return { id: 'sub-new', publicationId, submissionRevision: revisionNumber, status: 'pending' };
      }
    });
    const request = new Request(`https://write-urdu.com/api/community/submissions/${validSubmissionId}/revise`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validRevisionBody)
    });
    const response = await handleSubmissionRevise(request, envFor(true), validSubmissionId, {
      getSession: sessionUserA, myRepositoryFactory, submissionRepositoryFactory: fakeSubmissionRepo
    });
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.submission.publicationId, 'pub-1');
    assert.equal(body.submission.submissionRevision, 2);
    assert.deepEqual(createCalledWith, { userId: 'user-a', publicationId: 'pub-1', revisionNumber: 2 });
    assert.equal(body.submission.status, 'pending', 'Approval only happens through Slice C moderation, never directly here');
  }

  {
    const duplicate = { id: 'sub-dup', publicationId: 'pub-1' };
    const myRepositoryFactory = () => fakeMyRepo();
    const submissionRepositoryFactory = () => fakeSubmissionRepo({ async findPendingDuplicate() { return duplicate; } });
    const request = new Request(`https://write-urdu.com/api/community/submissions/${validSubmissionId}/revise`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validRevisionBody)
    });
    const response = await handleSubmissionRevise(request, envFor(true), validSubmissionId, {
      getSession: sessionUserA, myRepositoryFactory, submissionRepositoryFactory
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.submission, duplicate);
  }

  {
    const myRepositoryFactory = () => fakeMyRepo();
    const submissionRepositoryFactory = () => fakeSubmissionRepo({ async countPending() { return 5; } });
    const request = new Request(`https://write-urdu.com/api/community/submissions/${validSubmissionId}/revise`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validRevisionBody)
    });
    const response = await handleSubmissionRevise(request, envFor(true), validSubmissionId, {
      getSession: sessionUserA, myRepositoryFactory, submissionRepositoryFactory
    });
    assert.equal(response.status, 409, 'Revisions count against the same pending quota as new submissions');
  }

  const validPublicationId = '22222222-2222-4222-8222-222222222222';

  {
    const repositoryFactory = () => fakeMyRepo({ async getOwnedPublication() { return null; } });
    const request = new Request(`https://write-urdu.com/api/community/publications/${validPublicationId}/withdraw`, { method: 'POST' });
    const response = await handlePublicationWithdraw(request, envFor(true), validPublicationId, { getSession: sessionUserA, repositoryFactory });
    assert.equal(response.status, 404, 'Withdraw on a publication not owned by the caller must 404, not leak existence');
  }

  {
    let withdrawCalls = 0;
    const repositoryFactory = () => fakeMyRepo({
      async getOwnedPublication() { return { id: validPublicationId, status: 'published', unpublishedBy: null }; },
      async withdraw() { withdrawCalls += 1; return true; }
    });
    const request = new Request(`https://write-urdu.com/api/community/publications/${validPublicationId}/withdraw`, { method: 'POST' });
    const response = await handlePublicationWithdraw(request, envFor(true), validPublicationId, { getSession: sessionUserA, repositoryFactory });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'unpublished');
    assert.equal(body.withdrawnByAuthor, true);
    assert.equal(withdrawCalls, 1);
  }

  {
    let withdrawCalls = 0;
    const repositoryFactory = () => fakeMyRepo({
      async getOwnedPublication() { return { id: validPublicationId, status: 'unpublished', unpublishedBy: 'author' }; },
      async withdraw() { withdrawCalls += 1; return true; }
    });
    const request = new Request(`https://write-urdu.com/api/community/publications/${validPublicationId}/withdraw`, { method: 'POST' });
    const response = await handlePublicationWithdraw(request, envFor(true), validPublicationId, { getSession: sessionUserA, repositoryFactory });
    assert.equal(response.status, 200);
    assert.equal(withdrawCalls, 0, 'Repeat withdrawal must be a no-op read, not a second write');
  }

  {
    const repositoryFactory = () => fakeMyRepo({
      async getOwnedPublication() { return { id: validPublicationId, status: 'unpublished', unpublishedBy: 'moderator' }; }
    });
    const request = new Request(`https://write-urdu.com/api/community/publications/${validPublicationId}/withdraw`, { method: 'POST' });
    const response = await handlePublicationWithdraw(request, envFor(true), validPublicationId, { getSession: sessionUserA, repositoryFactory });
    const body = await response.json();
    assert.equal(body.withdrawnByAuthor, false, 'A moderator removal must not be relabelled as a self-withdrawal');
  }

  console.log('Community my-publications routes (COMMUNITY-E routes) contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
