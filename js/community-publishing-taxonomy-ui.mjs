import { COMMUNITY_TAXONOMY, COMMUNITY_CONTENT_LIMITS } from './community-publishing.mjs';

const CATEGORY_LABELS = Object.freeze({ poetry: 'Poetry', essay: 'Essay', prose: 'Prose', thought: 'Thought', story: 'Story' });
const TAG_LABELS = Object.freeze({
  ghazal: 'Ghazal', nazm: 'Nazm', shayari: 'Shayari', essay: 'Essay', prose: 'Prose',
  'critical-thinking': 'Critical thinking', 'personal-reflection': 'Personal reflection',
  society: 'Society', culture: 'Culture', education: 'Education', story: 'Story', other: 'Other'
});

export function categoryLabel(category) { return CATEGORY_LABELS[category] || category; }
export function tagLabel(tag) { return TAG_LABELS[tag] || tag; }

export function categoryOptionsMarkup(selected) {
  return COMMUNITY_TAXONOMY.primaryCategories.map((category) =>
    `<option value="${category}"${category === selected ? ' selected' : ''}>${categoryLabel(category)}</option>`
  ).join('');
}

export function tagCheckboxesMarkup(selected) {
  return COMMUNITY_TAXONOMY.tags.map((tag) => `
    <label class="wu-community-tag">
      <input type="checkbox" name="tags" value="${tag}"${selected.includes(tag) ? ' checked' : ''}>
      <span>${tagLabel(tag)}</span>
    </label>`).join('');
}

export function formErrorMessage(errors) {
  if (errors.tags) return 'Choose 1 to 5 tags for this writing.';
  if (errors.primaryCategory) return 'Choose a category.';
  if (errors.title) return 'Add a title for your writing.';
  if (errors.publicAuthorName) return 'Add the name to show with your writing.';
  if (errors.plainText) return `Add at least ${COMMUNITY_CONTENT_LIMITS.minPlainTextChars} characters of writing before publishing.`;
  return 'Please confirm all three checkboxes before submitting.';
}
