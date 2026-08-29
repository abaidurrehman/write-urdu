const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');

const VALID_ID = '11111111-1111-4111-8111-111111111111';

function moderatorRequest(url, options) {
  return new Request(url, {
    ...options,
    headers: { 'cf-access-authenticated-user-email': 'mod@write-urdu.com', ...(options && options.body ? { 'content-type': 'application/json' } : {}), ...(options && options.headers) }
  });
}

(async () => {
  const moderation = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-moderation.mjs')).href);
  const env = { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } };

  function pendingSubmission(overrides) {
    return {
      id: 'submission-1',
      userId: 'writer-1',
      status: 'pending',
      submissionRevision: 2,
      publicationId: null,
      title: 'اصل عنوان',
      content: 'متن',
      plainText: 'متن',
      publicAuthorName: 'قلم کار',
      contentFormat: 'plain',
      primaryCategory: 'poetry',
      tagsJson: JSON.stringify(['ghazal']),
      ...overrides
    };
  }

  const approveBody = (submissionRevision, extra) => JSON.stringify({ submissionRevision, ...extra });

  // --- First approval: creates exactly one publication, claims lock before writing it ---
  {
    const calls = [];
    let inserted = null;
    let claimed = false;
    const repository = {
      async getSubmissionForModeration() { return pendingSubmission(); },
      async slugTaken() { return false; },
      async claimApproval(id, revision, publicationId, moderatorEmail) {
        calls.push('claim');
        claimed = true;
        assert.strictEqual(id, VALID_ID);
        assert.strictEqual(revision, 2);
        assert.strictEqual(moderatorEmail, 'mod@write-urdu.com');
        return true;
      },
      async insertPublication(publication) {
        calls.push('insert');
        assert.strictEqual(claimed, true, 'Lock must be claimed before the publication row is written');
        inserted = publication;
      },
      async getDetail() { return { id: 'submission-1', status: 'approved' }; },
      async getPublication() { return { id: inserted.id, slug: inserted.slug }; }
    };

    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2) }),
      env, VALID_ID, { repositoryFactory: () => repository, randomUUID: () => 'new-publication-id', now: () => '2026-08-29T10:00:00.000Z' }
    );
    assert.strictEqual(response.status, 201);
    assert.deepStrictEqual(calls, ['claim', 'insert'], 'Publication must be written only after the approval lock is claimed');
    assert.strictEqual(inserted.id, 'new-publication-id');
    assert.strictEqual(inserted.userId, 'writer-1', 'Publication must carry the writer as owner (NOT NULL user_id)');
    assert.strictEqual(inserted.title, 'اصل عنوان');
    assert.match(inserted.slug, /^[a-z0-9]{4}-/);
  }

  // --- Title/body/public name cannot be rewritten by the approval request ---
  {
    let inserted = null;
    const repository = {
      async getSubmissionForModeration() { return pendingSubmission(); },
      async slugTaken() { return false; },
      async claimApproval() { return true; },
      async insertPublication(publication) { inserted = publication; },
      async getDetail() { return {}; },
      async getPublication() { return {}; }
    };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', {
        method: 'POST',
        body: JSON.stringify({ submissionRevision: 2, title: 'hacked title', publicAuthorName: 'hacked name', primaryCategory: 'essay', tags: ['essay'] })
      }),
      env, VALID_ID, { repositoryFactory: () => repository, randomUUID: () => 'pub-2', now: () => '2026-08-29T10:00:00.000Z' }
    );
    assert.strictEqual(response.status, 201);
    assert.strictEqual(inserted.title, 'اصل عنوان', 'Approval request must not be able to rewrite the submitted title');
    assert.strictEqual(inserted.publicAuthorName, 'قلم کار', 'Approval request must not be able to rewrite the public author name');
    assert.strictEqual(inserted.primaryCategory, 'essay', 'Moderator-adjusted category is the one allowed override');
  }

  // --- Stale revision: 409, no publication change ---
  {
    let insertCalled = false;
    const repository = {
      async getSubmissionForModeration() { return pendingSubmission({ submissionRevision: 3 }); },
      async insertPublication() { insertCalled = true; },
      async claimApproval() { insertCalled = true; return true; }
    };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 409);
    assert.strictEqual((await response.json()).error.code, 'community_moderation_stale_review');
    assert.strictEqual(insertCalled, false, 'Stale review must never touch the publication');
  }

  // --- Non-pending status: deterministic conflict ---
  {
    const repository = { async getSubmissionForModeration() { return pendingSubmission({ status: 'rejected' }); } };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 409);
    assert.strictEqual((await response.json()).error.code, 'community_moderation_conflict');
  }

  // --- Duplicate approval is idempotent: no second publication created ---
  {
    let insertCalled = false;
    const repository = {
      async getSubmissionForModeration() {
        return pendingSubmission({ status: 'approved', publicationId: 'existing-pub' });
      },
      async getPublication() { return { id: 'existing-pub', slug: 'abcd-x' }; },
      async getDetail() { return { id: 'submission-1', status: 'approved' }; },
      async insertPublication() { insertCalled = true; },
      async claimApproval() { insertCalled = true; return true; }
    };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual((await response.json()).status, 'already_approved');
    assert.strictEqual(insertCalled, false, 'Repeating an identical approval must not create a duplicate publication');
  }

  // --- Invalid category adjustment rejected before any write ---
  {
    const repository = { async getSubmissionForModeration() { throw new Error('must not be reached'); } };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2, { primaryCategory: 'not-real' }) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'community_primary_category_invalid');
  }

  // --- Revision approval: replaces snapshot atomically, slug/published_at untouched, no new publication ---
  {
    let claimed = false;
    let replaced = null;
    let insertCalled = false;
    const repository = {
      async getSubmissionForModeration() {
        return pendingSubmission({ id: 'submission-2', publicationId: 'pub-existing', title: 'نظرثانی شدہ عنوان' });
      },
      async claimApproval(id, revision, publicationId) {
        claimed = true;
        assert.strictEqual(publicationId, 'pub-existing', 'Revision approval must reuse the existing publication id, not mint a new one');
        return true;
      },
      async insertPublication() { insertCalled = true; },
      async replacePublicationSnapshot(publicationId, snapshot) {
        assert.strictEqual(claimed, true, 'Lock must be claimed before the publication snapshot is replaced');
        replaced = { publicationId, snapshot };
      },
      async getDetail() { return { id: 'submission-2', status: 'approved' }; },
      async getPublication() { return { id: 'pub-existing' }; }
    };
    const response = await moderation.handleModerationApprove(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: approveBody(2) }),
      env, VALID_ID, { repositoryFactory: () => repository, now: () => '2026-08-29T11:00:00.000Z' }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual(insertCalled, false, 'Revision approval must never call insertPublication');
    assert.strictEqual(replaced.publicationId, 'pub-existing');
    assert.strictEqual(replaced.snapshot.title, 'نظرثانی شدہ عنوان');
    assert.strictEqual(replaced.snapshot.sourceSubmissionId, VALID_ID);
  }

  // --- Rejection: pending exact revision rejects, no publication touched, structured code required ---
  {
    const repository = {
      async getSubmissionForModeration() { return pendingSubmission(); },
      async reject(id, revision, code, note, moderatorEmail) {
        assert.strictEqual(revision, 2);
        assert.strictEqual(code, 'spam_or_promotion');
        assert.strictEqual(moderatorEmail, 'mod@write-urdu.com');
        return true;
      },
      async getDetail() { return { id: 'submission-1', status: 'rejected' }; },
      async replacePublicationSnapshot() { throw new Error('reject must never touch a publication'); },
      async insertPublication() { throw new Error('reject must never touch a publication'); }
    };
    const response = await moderation.handleModerationReject(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: JSON.stringify({ submissionRevision: 2, rejectionCode: 'spam_or_promotion' }) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual((await response.json()).status, 'rejected');
  }

  // --- Rejection requires a controlled code ---
  {
    const repository = { async getSubmissionForModeration() { throw new Error('must not be reached'); } };
    const response = await moderation.handleModerationReject(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: JSON.stringify({ submissionRevision: 2, rejectionCode: 'not-a-real-code' }) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 400);
    assert.strictEqual((await response.json()).error.code, 'community_rejection_code_invalid');
  }

  // --- Rejecting a revision leaves the current publication untouched ---
  {
    let publicationTouched = false;
    const repository = {
      async getSubmissionForModeration() { return pendingSubmission({ id: 'submission-3', publicationId: 'pub-live' }); },
      async reject() { return true; },
      async getDetail() { return { id: 'submission-3', status: 'rejected' }; },
      async replacePublicationSnapshot() { publicationTouched = true; },
      async unpublish() { publicationTouched = true; }
    };
    const response = await moderation.handleModerationReject(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST', body: JSON.stringify({ submissionRevision: 2, rejectionCode: 'needs_writer_revision' }) }),
      env, VALID_ID, { repositoryFactory: () => repository }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual(publicationTouched, false, 'Rejecting a revision must leave the existing publication live and unchanged');
  }

  // --- Unpublish: idempotent, never deletes the source submission/document ---
  {
    let unpublishCalls = 0;
    const repository = {
      async getPublication() {
        return unpublishCalls === 0 ? { id: 'pub-1', status: 'published' } : { id: 'pub-1', status: 'unpublished' };
      },
      async unpublish() { unpublishCalls += 1; return true; }
    };
    let response = await moderation.handlePublicationUnpublish(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST' }), env, VALID_ID, { repositoryFactory: () => repository, now: () => '2026-08-29T12:00:00.000Z' }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual((await response.json()).status, 'unpublished');
    assert.strictEqual(unpublishCalls, 1);

    // Repeating the call against an already-unpublished row is a safe no-op, not a second write.
    response = await moderation.handlePublicationUnpublish(
      moderatorRequest('https://os.write-urdu.com/x', { method: 'POST' }), env, VALID_ID, { repositoryFactory: () => repository, now: () => '2026-08-29T12:05:00.000Z' }
    );
    assert.strictEqual(response.status, 200);
    assert.strictEqual(unpublishCalls, 1, 'Unpublishing an already-unpublished row must not issue a second write');
  }

  // --- Rejection code taxonomy matches the OS moderator UI exactly (no drift) ---
  // The OS script touches `document` at module load, so it is compared as text here rather than dynamically imported (no DOM in this test runner).
  const fs = require('node:fs');
  const osScriptSource = fs.readFileSync(path.join(root, 'js', 'community-writing-os.mjs'), 'utf8');
  const uiCodes = [...osScriptSource.matchAll(/code:\s*'([a-z_]+)'/g)].map((match) => match[1]).sort();
  assert.deepStrictEqual(uiCodes, [...moderation.REJECTION_CODES].sort(), 'OS rejection reasons must match the server-enforced code set exactly');

  console.log('Community moderation approval (COMMUNITY-C approval) contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
