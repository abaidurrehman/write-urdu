(function () {
    'use strict';

    var root = document.querySelector('[data-dictionary-tool]');
    var core = window.WriteUrduDictionaryCore;
    if (!root || !core) return;

    var form = root.querySelector('[data-dictionary-form]');
    var directionSelect = root.querySelector('[data-dictionary-direction]');
    var input = root.querySelector('[data-dictionary-term]');
    var inputLabel = root.querySelector('[data-dictionary-term-label]');
    var count = root.querySelector('[data-dictionary-count]');
    var submitButton = root.querySelector('[data-dictionary-submit]');
    var clearButton = root.querySelector('[data-dictionary-clear]');
    var status = root.querySelector('[data-dictionary-status]');
    var notice = root.querySelector('[data-dictionary-notice]');
    var resultHeading = root.querySelector('[data-dictionary-result-heading]');
    var source = root.querySelector('[data-dictionary-source]');
    var entries = root.querySelector('[data-dictionary-entries]');
    var emptyState = root.querySelector('[data-dictionary-empty]');
    var synonymsSection = root.querySelector('[data-dictionary-synonyms-section]');
    var synonymsList = root.querySelector('[data-dictionary-synonyms]');
    var synonymNote = root.querySelector('[data-dictionary-synonym-note]');
    var busy = false;

    function setStatus(text, state) {
        status.textContent = text;
        status.setAttribute('data-state', state || 'idle');
    }

    function setNotice(text, state) {
        notice.textContent = text || '';
        notice.setAttribute('data-state', state || 'idle');
    }

    function clearChildren(node) {
        while (node.firstChild) node.removeChild(node.firstChild);
    }

    function clearResults() {
        source.textContent = '';
        clearChildren(entries);
        clearChildren(synonymsList);
        emptyState.hidden = true;
        synonymsSection.hidden = true;
        synonymNote.textContent = '';
    }

    function updateActions() {
        var checked = core.validateTerm(input.value);
        submitButton.disabled = busy || !checked.ok;
        clearButton.disabled = busy || (!input.value && !source.textContent);
        directionSelect.disabled = busy;
        input.disabled = busy;
        count.textContent = input.value.length + ' / ' + core.MAX_TERM_CHARS;
    }

    function applyDirection(clearAll) {
        var config = core.direction(directionSelect.value);
        input.setAttribute('lang', config.from);
        input.setAttribute('dir', config.inputDir);
        inputLabel.textContent = config.label;
        input.placeholder = config.placeholder;
        input.classList.toggle('dictionary-urdu-text', config.from === 'ur');
        resultHeading.textContent = config.resultLabel;
        entries.setAttribute('dir', config.resultDir);
        entries.setAttribute('lang', config.to);
        entries.classList.toggle('dictionary-urdu-results', config.to === 'ur');
        if (clearAll) {
            input.value = '';
            clearResults();
            setStatus('Ready', 'idle');
            setNotice('Direction changed. Enter a new word or short phrase.', 'info');
        }
        updateActions();
    }

    function createText(tag, className, value) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        node.textContent = value;
        return node;
    }

    function renderBackTranslations(item, parent) {
        var backs = Array.isArray(item.backTranslations) ? item.backTranslations : [];
        if (!backs.length) return;
        var wrap = document.createElement('div');
        wrap.className = 'dictionary-back-translations';
        wrap.appendChild(createText('strong', '', 'Context / back-translations'));
        var list = document.createElement('ul');
        backs.forEach(function (back) {
            var li = document.createElement('li');
            li.appendChild(createText('span', 'dictionary-back-term', String(back.term || '')));
            var details = [];
            if (Number(back.examplesAvailable) > 0) details.push(String(back.examplesAvailable) + ' examples available');
            if (details.length) li.appendChild(createText('small', '', ' · ' + details.join(' · ')));
            list.appendChild(li);
        });
        wrap.appendChild(list);
        parent.appendChild(wrap);
    }

    function renderEntries(payload) {
        clearResults();
        source.textContent = payload.source || '';
        var list = Array.isArray(payload.entries) ? payload.entries : [];
        if (!list.length) {
            emptyState.hidden = false;
        } else {
            list.forEach(function (item) {
                var card = document.createElement('article');
                card.className = 'dictionary-entry';
                var top = document.createElement('div');
                top.className = 'dictionary-entry-top';
                top.appendChild(createText('strong', 'dictionary-entry-term', String(item.term || '')));

                var meta = document.createElement('div');
                meta.className = 'dictionary-entry-meta';
                if (item.partOfSpeech) meta.appendChild(createText('span', '', String(item.partOfSpeech)));
                var confidence = core.confidencePercent(item.confidence);
                if (confidence !== null) meta.appendChild(createText('span', '', confidence + '% match'));
                if (meta.childNodes.length) top.appendChild(meta);
                card.appendChild(top);
                renderBackTranslations(item, card);
                entries.appendChild(card);
            });
        }

        var synonyms = Array.isArray(payload.synonyms) ? payload.synonyms.filter(Boolean) : [];
        synonymsSection.hidden = false;
        clearChildren(synonymsList);
        if (synonyms.length) {
            synonyms.forEach(function (term) {
                synonymsList.appendChild(createText('li', '', String(term)));
            });
            synonymNote.textContent = 'Verified same-language synonyms from an approved lexical source.';
        } else {
            synonymNote.textContent = 'Verified same-language synonyms are not available in this preview yet. Back-translations above are context clues, not synonyms.';
        }
    }

    async function lookup(event) {
        if (event) event.preventDefault();
        var request = core.buildRequest(directionSelect.value, input.value);
        if (!request.ok) {
            setNotice(request.error === 'term_too_long' ? 'Use 100 characters or fewer.' : 'Enter a word or short phrase first.', 'error');
            return;
        }

        busy = true;
        setStatus('Looking up', 'busy');
        setNotice('Looking up this term…', 'info');
        updateActions();

        try {
            var response = await fetch('/api/dictionary-lookup', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(request.body)
            });
            var payload = await response.json().catch(function () { return null; });
            if (!response.ok || !payload || payload.ok !== true || !Array.isArray(payload.entries)) {
                throw { code: payload && payload.error ? payload.error : 'dictionary_unavailable' };
            }
            renderEntries(payload);
            if (payload.entries.length) {
                setStatus('Results ready', 'ready');
                setNotice('Meanings and alternatives are ready. Compare the options and context clues.', 'success');
            } else {
                setStatus('No dictionary entry', 'idle');
                setNotice('No dictionary entry was found. Check the spelling or try a simpler base word.', 'info');
            }
        } catch (error) {
            clearResults();
            setStatus('Dictionary unavailable', 'error');
            setNotice(core.friendlyError(error && error.code), 'error');
        } finally {
            busy = false;
            updateActions();
        }
    }

    form.addEventListener('submit', lookup);
    directionSelect.addEventListener('change', function () { applyDirection(true); });
    input.addEventListener('input', function () {
        if (input.value.length > core.MAX_TERM_CHARS) input.value = input.value.slice(0, core.MAX_TERM_CHARS);
        clearResults();
        setStatus(core.cleanTerm(input.value) ? 'Ready to look up' : 'Ready', 'idle');
        setNotice('', 'idle');
        updateActions();
    });
    clearButton.addEventListener('click', function () {
        input.value = '';
        clearResults();
        setStatus('Ready', 'idle');
        setNotice('Cleared.', 'info');
        input.focus();
        updateActions();
    });

    applyDirection(false);
    clearResults();
    setStatus('Ready', 'idle');
    setNotice('Enter one word or a short phrase, then choose Look up word.', 'info');
}());
