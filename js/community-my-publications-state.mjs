const REJECTION_COPY = Object.freeze({
  incomplete_or_low_quality: 'This submission needs more work before it can be published.',
  spam_or_promotion: 'This submission appears mainly promotional and was not published.',
  abusive_or_hateful: 'This submission could not be published because of its content.',
  sexual_or_unsafe: 'This submission could not be published because of its content.',
  personal_information: 'Please remove private information before submitting again.',
  copyright_or_ownership: 'We could not publish this because of an authorship or copyright concern.',
  plagiarism_concern: 'We could not publish this because of an authorship or copyright concern.',
  off_topic: "This submission does not fit Write Urdu's writing categories.",
  needs_writer_revision: 'Please revise this writing and submit it again.',
  other: 'This submission was not published. See the note below if one is provided.'
});

const STATE_LABELS = Object.freeze({
  in_review: 'In review',
  published: 'Published',
  not_approved: 'Not approved',
  revision_in_review: 'Revision in review',
  withdrawn: 'Withdrawn by you',
  unpublished_removed: 'Unpublished / removed'
});

export function rejectionCopy(rejectionCode) {
  return REJECTION_COPY[rejectionCode] || REJECTION_COPY.other;
}

export function stateLabel(state) {
  return STATE_LABELS[state] || 'In review';
}

function groupKey(entry) {
  return entry.publicationId ? `pub:${entry.publicationId}` : `sub:${entry.submissionId}`;
}

function latestBy(entries, field) {
  return entries.reduce((latest, entry) => {
    if (!latest) return entry;
    return String(entry[field] || '') > String(latest[field] || '') ? entry : latest;
  }, null);
}

function buildStandaloneCard(entry) {
  const state = entry.submissionStatus === 'rejected' ? 'not_approved' : 'in_review';
  return {
    key: groupKey(entry),
    submissionId: entry.submissionId,
    publicationId: null,
    title: entry.title,
    publicAuthorName: entry.publicAuthorName,
    primaryCategory: entry.primaryCategory,
    tags: entry.tags,
    plainTextPreview: entry.plainTextPreview,
    state,
    submittedAt: entry.submittedAt,
    updatedAt: entry.updatedAt,
    publishedAt: null,
    publicSlug: null,
    sourceDocumentId: entry.sourceDocumentId,
    reviseSubmissionId: null,
    rejectionCode: state === 'not_approved' ? entry.rejectionCode : null,
    rejectionNote: state === 'not_approved' ? entry.rejectionNote : null,
    revisionRejection: null
  };
}

function buildPublicationCard(entries) {
  const live = latestBy(entries.filter((entry) => entry.submissionStatus === 'approved'), 'submissionRevision')
    || latestBy(entries, 'updatedAt');
  const pending = entries.filter((entry) => entry.submissionStatus === 'pending');
  const rejectedRevision = latestBy(entries.filter((entry) => entry.submissionStatus === 'rejected'), 'submittedAt');

  let state;
  if (live.publicationStatus === 'unpublished') {
    state = live.unpublishedBy === 'author' ? 'withdrawn' : 'unpublished_removed';
  } else if (pending.length > 0) {
    state = 'revision_in_review';
  } else {
    state = 'published';
  }

  const revisable = state === 'published';
  const sourceDocumentEntry = entries.find((entry) => entry.sourceDocumentId) || null;

  return {
    key: groupKey(live),
    submissionId: live.submissionId,
    publicationId: live.publicationId,
    title: live.title,
    publicAuthorName: live.publicAuthorName,
    primaryCategory: live.primaryCategory,
    tags: live.tags,
    plainTextPreview: live.plainTextPreview,
    state,
    submittedAt: live.submittedAt,
    updatedAt: latestBy(entries, 'updatedAt')?.updatedAt || live.updatedAt,
    publishedAt: live.publishedAt,
    publicSlug: live.publicSlug,
    sourceDocumentId: sourceDocumentEntry ? sourceDocumentEntry.sourceDocumentId : null,
    reviseSubmissionId: revisable ? live.submissionId : null,
    rejectionCode: null,
    rejectionNote: null,
    revisionRejection: rejectedRevision
      ? { rejectionCode: rejectedRevision.rejectionCode, rejectionNote: rejectedRevision.rejectionNote, submittedAt: rejectedRevision.submittedAt }
      : null
  };
}

export function groupMyPublicationItems(items) {
  const groups = new Map();
  for (const entry of Array.isArray(items) ? items : []) {
    const key = groupKey(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  return Array.from(groups.values())
    .map((entries) => (entries[0].publicationId ? buildPublicationCard(entries) : buildStandaloneCard(entries[0])))
    .sort((a, b) => (String(b.updatedAt || '') > String(a.updatedAt || '') ? 1 : -1));
}
