import { COMMUNITY_TAXONOMY, COMMUNITY_CONTENT_LIMITS } from './community-publishing.mjs';

const CATEGORY_LABELS = Object.freeze({ poetry: 'Poetry', essay: 'Essay', prose: 'Prose', thought: 'Thought', story: 'Story' });
const CATEGORY_ICONS = Object.freeze({ poetry: 'fa-feather', essay: 'fa-file-alt', prose: 'fa-book-open', thought: 'fa-lightbulb', story: 'fa-book' });
const TAG_LABELS = Object.freeze({
  ghazal: 'Ghazal', nazm: 'Nazm', shayari: 'Shayari', essay: 'Essay', prose: 'Prose',
  'critical-thinking': 'Critical thinking', 'personal-reflection': 'Personal reflection',
  society: 'Society', culture: 'Culture', education: 'Education', story: 'Story', other: 'Other'
});
const TAG_ICONS = Object.freeze({
  ghazal: 'fa-feather-alt', nazm: 'fa-music', shayari: 'fa-feather', essay: 'fa-file-alt', prose: 'fa-book-open',
  'critical-thinking': 'fa-lightbulb', 'personal-reflection': 'fa-heart',
  society: 'fa-users', culture: 'fa-landmark', education: 'fa-graduation-cap', story: 'fa-book', other: 'fa-ellipsis-h'
});

export function categoryLabel(category) { return CATEGORY_LABELS[category] || category; }
export function tagLabel(tag) { return TAG_LABELS[tag] || tag; }

export function categoryCardsMarkup(selected) {
  return COMMUNITY_TAXONOMY.primaryCategories.map((category) => {
    const checked = category === selected;
    return `
    <label class="wu-community-category-card${checked ? ' is-selected' : ''}">
      <input type="radio" name="primaryCategory" value="${category}"${checked ? ' checked' : ''} required>
      <i class="fas ${CATEGORY_ICONS[category] || 'fa-feather'}" aria-hidden="true"></i>
      <span>${categoryLabel(category)}</span>
    </label>`;
  }).join('');
}

export function tagCheckboxesMarkup(selected) {
  return COMMUNITY_TAXONOMY.tags.map((tag) => {
    const checked = selected.includes(tag);
    return `
    <label class="wu-community-tag${checked ? ' is-selected' : ''}">
      <input type="checkbox" name="tags" value="${tag}"${checked ? ' checked' : ''}>
      <i class="fas ${TAG_ICONS[tag] || 'fa-tag'}" aria-hidden="true"></i>
      <span>${tagLabel(tag)}</span>
    </label>`;
  }).join('');
}

export function formErrorMessage(errors) {
  if (errors.tags) return 'Choose 1 to 5 tags for this writing.';
  if (errors.primaryCategory) return 'Choose a category.';
  if (errors.title) return 'Add a title for your writing.';
  if (errors.publicAuthorName) return 'Add the name to show with your writing.';
  if (errors.plainText) return `Add at least ${COMMUNITY_CONTENT_LIMITS.minPlainTextChars} characters of writing before publishing.`;
  return 'Please confirm all three checkboxes before submitting.';
}
