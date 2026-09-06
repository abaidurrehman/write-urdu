// Thin ESM re-export around the shared, UMD-wrapped conversion engine.
// The mapping tables live in exactly one place: js/inpage-unicode-core.js
// (the same file the /tools/inpage-unicode-converter/ browser page loads).
// Never redefine or copy the mapping tables here.
import InPageCore from '../../js/inpage-unicode-core.js';

export const PROFILE = InPageCore.PROFILE;
export const decodeLegacyText = InPageCore.decodeLegacyText;
export const encodeUnicodeText = InPageCore.encodeUnicodeText;
