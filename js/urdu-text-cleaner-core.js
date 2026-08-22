(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduTextCleanerCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    var BIDI_CONTROLS = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
    var JOIN_CONTROLS = /[\u200C\u200D]/g;
    var PRESENTATION_FORMS = /[\uFB50-\uFDFF\uFE70-\uFEFF]/g;

    function countMatches(text, regex) {
        var matches = String(text || '').match(regex);
        return matches ? matches.length : 0;
    }

    function countPattern(text, regex) {
        var count = 0;
        String(text || '').replace(regex, function () {
            count += 1;
            return arguments[0];
        });
        return count;
    }

    function hasArabicNearby(text, index) {
        var source = String(text || '');
        var before = source.slice(Math.max(0, index - 3), index);
        var after = source.slice(index + 1, index + 4);
        return ARABIC_SCRIPT.test(before) || ARABIC_SCRIPT.test(after);
    }

    function normalizePresentationForms(text) {
        return String(text || '').replace(PRESENTATION_FORMS, function (character) {
            var normalized = typeof character.normalize === 'function' ? character.normalize('NFKC') : character;
            return normalized || character;
        });
    }

    function collapseDuplicateBidi(text) {
        return String(text || '').replace(/([\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069])\1+/g, '$1');
    }

    function collapseDuplicateJoinControls(text) {
        return String(text || '').replace(/([\u200C\u200D])\1+/g, '$1');
    }

    function countSuspiciousJoinControls(text) {
        var source = String(text || '');
        var count = 0;
        for (var i = 0; i < source.length; i += 1) {
            var ch = source.charAt(i);
            if (ch !== '\u200C' && ch !== '\u200D') continue;
            var prev = i > 0 ? source.charAt(i - 1) : '';
            var next = i + 1 < source.length ? source.charAt(i + 1) : '';
            if (!prev || !next || /[\s.,،؛؟!?()[\]{}]/.test(prev) || /[\s.,،؛؟!?()[\]{}]/.test(next)) count += 1;
        }
        return count;
    }

    function countMixedLatinPunctuation(text) {
        var source = String(text || '');
        var count = 0;
        for (var i = 0; i < source.length; i += 1) {
            if (!/[,;?]/.test(source.charAt(i))) continue;
            if (hasArabicNearby(source, i)) count += 1;
        }
        return count;
    }

    function countMixedDirectionSequences(text) {
        var source = String(text || '');
        var left = /[\u0600-\u06FF][ \t]*[\/:\-][ \t]*(?:[A-Za-z0-9۰-۹٠-٩])/g;
        var right = /(?:[A-Za-z0-9۰-۹٠-٩])[ \t]*[\/:\-][ \t]*[\u0600-\u06FF]/g;
        return countPattern(source, left) + countPattern(source, right);
    }

    function countUnmatchedBrackets(text) {
        var source = String(text || '');
        var opens = { '(': ')', '[': ']', '{': '}' };
        var closes = { ')': '(', ']': '[', '}': '{' };
        var stack = [];
        var problems = 0;
        for (var i = 0; i < source.length; i += 1) {
            var ch = source.charAt(i);
            if (opens[ch]) stack.push(ch);
            else if (closes[ch]) {
                if (!stack.length || stack[stack.length - 1] !== closes[ch]) problems += 1;
                else stack.pop();
            }
        }
        return problems + stack.length;
    }

    function digitStylesPresent(text) {
        var source = String(text || '');
        var styles = [];
        if (/[0-9]/.test(source)) styles.push('western');
        if (/[٠-٩]/.test(source)) styles.push('arabic-indic');
        if (/[۰-۹]/.test(source)) styles.push('eastern-arabic');
        return styles;
    }

    var RULES = [
        {
            id: 'arabic-yeh', category: 'characters', safety: 'safe', autoFix: true,
            title: 'Arabic yeh found',
            explanation: 'Arabic ي often appears when Urdu text is copied from another keyboard or document. Urdu usually uses ی.',
            count: function (text) { return countMatches(text, /\u064A/g); },
            transform: function (text) { return String(text || '').replace(/\u064A/g, '\u06CC'); }
        },
        {
            id: 'arabic-kaf', category: 'characters', safety: 'safe', autoFix: true,
            title: 'Arabic kaf found',
            explanation: 'Arabic ك can cause inconsistent Urdu search and display. Urdu normally uses ک.',
            count: function (text) { return countMatches(text, /\u0643/g); },
            transform: function (text) { return String(text || '').replace(/\u0643/g, '\u06A9'); }
        },
        {
            id: 'presentation-forms', category: 'characters', safety: 'safe', autoFix: true,
            title: 'Older character shapes found',
            explanation: 'Text copied from older documents can use character shapes that do not work well in current apps. These can usually be replaced safely.',
            count: function (text) {
                var source = String(text || '');
                var count = 0;
                source.replace(PRESENTATION_FORMS, function (ch) {
                    var normalized = typeof ch.normalize === 'function' ? ch.normalize('NFKC') : ch;
                    if (normalized && normalized !== ch) count += 1;
                    return ch;
                });
                return count;
            },
            transform: normalizePresentationForms
        },
        {
            id: 'nbsp', category: 'spacing', safety: 'safe', autoFix: true,
            title: 'Unusual spaces found',
            explanation: 'Some hidden spaces can behave unexpectedly when Urdu text is pasted between apps. Ordinary spaces are safer for normal writing.',
            count: function (text) { return countMatches(text, /\u00A0/g); },
            transform: function (text) { return String(text || '').replace(/\u00A0/g, ' '); }
        },
        {
            id: 'duplicate-spaces', category: 'spacing', safety: 'safe', autoFix: true,
            title: 'Repeated spaces found',
            explanation: 'Repeated ordinary spaces can be collapsed without changing line breaks.',
            count: function (text) { return countPattern(text, / {2,}/g); },
            transform: function (text) { return String(text || '').replace(/ {2,}/g, ' '); }
        },
        {
            id: 'space-before-punctuation', category: 'punctuation', safety: 'safe', autoFix: true,
            title: 'Spaces before punctuation found',
            explanation: 'Extra spaces before common Urdu or Latin punctuation are usually accidental.',
            count: function (text) { return countPattern(text, /[ \t]+(?=[،؛؟,.!?])/g); },
            transform: function (text) { return String(text || '').replace(/[ \t]+(?=[،؛؟,.!?])/g, ''); }
        },
        {
            id: 'zero-width-no-break-space', category: 'invisible', safety: 'safe', autoFix: true,
            title: 'Hidden copy-and-paste marks found',
            explanation: 'This invisible mark is often added during copy and paste and can be removed safely from editable Urdu text.',
            count: function (text) { return countMatches(text, /\uFEFF/g); },
            transform: function (text) { return String(text || '').replace(/\uFEFF/g, ''); }
        },
        {
            id: 'duplicate-bidi-controls', category: 'direction', safety: 'safe', autoFix: true,
            title: 'Repeated text-direction marks found',
            explanation: 'The same hidden direction mark appears more than once in a row. Keeping one is enough and preserves the intended text direction.',
            count: function (text) { return countPattern(text, /([\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069])\1+/g); },
            transform: collapseDuplicateBidi
        },
        {
            id: 'duplicate-join-controls', category: 'invisible', safety: 'safe', autoFix: true,
            title: 'Repeated letter-joining marks found',
            explanation: 'The same hidden joining mark appears more than once in a row. The cleaner keeps one instead of removing every mark.',
            count: function (text) { return countPattern(text, /([\u200C\u200D])\1+/g); },
            transform: collapseDuplicateJoinControls
        },
        {
            id: 'tatweel', category: 'characters', safety: 'review', autoFix: false,
            title: 'Kashida / tatweel found',
            explanation: 'Kashida can be decorative or intentional. Remove it only when you want plain searchable text.',
            count: function (text) { return countMatches(text, /\u0640/g); },
            actionLabel: 'Remove kashida',
            transform: function (text) { return String(text || '').replace(/\u0640/g, ''); }
        },
        {
            id: 'bidi-controls', category: 'direction', safety: 'review', autoFix: false,
            title: 'Hidden text-direction marks found',
            explanation: 'Some apps add invisible marks to control how Urdu and English appear together. Review them before removing anything.',
            count: function (text) { return countMatches(text, BIDI_CONTROLS); }
        },
        {
            id: 'suspicious-join-controls', category: 'invisible', safety: 'review', autoFix: false,
            title: 'Hidden joining marks near spaces or punctuation',
            explanation: 'Joining marks can be useful inside Urdu words, but marks beside a space or punctuation may be copy-and-paste leftovers.',
            count: countSuspiciousJoinControls
        },
        {
            id: 'latin-punctuation-near-urdu', category: 'punctuation', safety: 'review', autoFix: false,
            title: 'Latin punctuation beside Urdu text',
            explanation: 'A comma, semicolon or question mark beside Urdu may be intentional, especially in mixed-language text. Review before converting it to Urdu punctuation.',
            count: countMixedLatinPunctuation
        },
        {
            id: 'mixed-direction-sequence', category: 'direction', safety: 'review', autoFix: false,
            title: 'Urdu mixed with numbers or separators',
            explanation: 'Urdu beside numbers, slashes, colons or hyphens can look different across apps. Check the result before changing the text.',
            count: countMixedDirectionSequences
        },
        {
            id: 'unmatched-brackets', category: 'direction', safety: 'review', autoFix: false,
            title: 'Unmatched brackets found',
            explanation: 'Unmatched brackets are especially confusing in right-to-left text. Review the logical opening and closing characters rather than reversing them blindly.',
            count: countUnmatchedBrackets
        },
        {
            id: 'mixed-numeral-styles', category: 'numbers', safety: 'review', autoFix: false,
            title: 'Mixed numeral styles found',
            explanation: 'The text contains more than one digit style. Choose a target style only if you want consistent numerals.',
            count: function (text) { return digitStylesPresent(text).length > 1 ? 1 : 0; }
        }
    ];

    function analyze(text) {
        var source = String(text || '');
        var issues = RULES.map(function (rule) {
            var count = Math.max(0, Number(rule.count(source)) || 0);
            if (!count) return null;
            return {
                id: rule.id,
                category: rule.category,
                safety: rule.safety,
                autoFix: Boolean(rule.autoFix),
                actionable: typeof rule.transform === 'function',
                actionLabel: rule.actionLabel || (rule.safety === 'safe' ? 'Fix this' : null),
                title: rule.title,
                explanation: rule.explanation,
                count: count
            };
        }).filter(Boolean);

        return {
            length: source.length,
            issueCount: issues.reduce(function (sum, issue) { return sum + issue.count; }, 0),
            issueTypes: issues.length,
            safeIssueTypes: issues.filter(function (issue) { return issue.safety === 'safe'; }).length,
            reviewIssueTypes: issues.filter(function (issue) { return issue.safety === 'review'; }).length,
            issues: issues,
            digitStyles: digitStylesPresent(source)
        };
    }

    function findRule(id) {
        return RULES.find(function (rule) { return rule.id === id; }) || null;
    }

    function applyRule(text, id) {
        var rule = findRule(id);
        if (!rule || typeof rule.transform !== 'function') return String(text || '');
        return rule.transform(String(text || ''));
    }

    function applySafeFixes(text) {
        return RULES.reduce(function (value, rule) {
            if (rule.safety !== 'safe' || !rule.autoFix || typeof rule.transform !== 'function') return value;
            return rule.transform(value);
        }, String(text || ''));
    }

    function digitValue(character) {
        var code = character.charCodeAt(0);
        if (code >= 48 && code <= 57) return code - 48;
        if (code >= 0x0660 && code <= 0x0669) return code - 0x0660;
        if (code >= 0x06F0 && code <= 0x06F9) return code - 0x06F0;
        return null;
    }

    function convertNumerals(text, target) {
        var sets = {
            western: '0123456789',
            'arabic-indic': '٠١٢٣٤٥٦٧٨٩',
            'eastern-arabic': '۰۱۲۳۴۵۶۷۸۹'
        };
        var digits = sets[target];
        if (!digits) return String(text || '');
        return String(text || '').replace(/[0-9٠-٩۰-۹]/g, function (character) {
            var value = digitValue(character);
            return value === null ? character : digits.charAt(value);
        });
    }

    function issueCountBucket(count) {
        var value = Math.max(0, Number(count) || 0);
        if (!value) return '0';
        if (value <= 2) return '1-2';
        if (value <= 5) return '3-5';
        if (value <= 10) return '6-10';
        return '11+';
    }

    return {
        RULES: RULES,
        analyze: analyze,
        applyRule: applyRule,
        applySafeFixes: applySafeFixes,
        convertNumerals: convertNumerals,
        issueCountBucket: issueCountBucket,
        digitStylesPresent: digitStylesPresent,
        countUnmatchedBrackets: countUnmatchedBrackets
    };
}));
