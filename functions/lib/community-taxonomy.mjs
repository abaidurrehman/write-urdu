const PRIMARY_CATEGORIES = Object.freeze([
  'poetry',
  'essay',
  'prose',
  'thought',
  'story'
]);

const TAGS = Object.freeze([
  'ghazal',
  'nazm',
  'shayari',
  'essay',
  'prose',
  'critical-thinking',
  'personal-reflection',
  'society',
  'culture',
  'education',
  'story',
  'other'
]);

const PRIMARY_CATEGORY_SET = new Set(PRIMARY_CATEGORIES);
const TAG_SET = new Set(TAGS);
const MAX_TAGS = 5;

export const COMMUNITY_TAXONOMY = Object.freeze({
  primaryCategories: PRIMARY_CATEGORIES,
  tags: TAGS,
  maxTags: MAX_TAGS
});

export function validPrimaryCategory(value) {
  return typeof value === 'string' && PRIMARY_CATEGORY_SET.has(value);
}

export function normalizeTags(value) {
  if (!Array.isArray(value)) return { error: 'community_tags_invalid' };
  if (value.length === 0 || value.length > MAX_TAGS) return { error: 'community_tags_cardinality_invalid' };

  const seen = new Set();
  for (const tag of value) {
    if (typeof tag !== 'string' || !TAG_SET.has(tag)) return { error: 'community_tags_invalid' };
    seen.add(tag);
  }
  if (seen.size !== value.length) return { error: 'community_tags_duplicate' };

  return { value: TAGS.filter((tag) => seen.has(tag)) };
}
