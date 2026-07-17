(function () {
    'use strict';

    var SAVE_DELAY = 650;
    var DRAFT_PREFIX = 'write-urdu:draft:v1:';
    var HISTORY_PREFIX = 'write-urdu:history:v1:';
    var ONBOARDING_PREFIX = 'write-urdu:onboarding:v1:';
    var MAX_HISTORY_ITEMS = 5;

    function notify(message, type) {
        if (window.WriteUrduUI && typeof window.WriteUrduUI.notify === 'function') {
            window.WriteUrduUI.notify(message, type);
        }
    }

    function uiText(key, fallback) {
        if (window.WriteUrduLocale && typeof window.WriteUrduLocale.translateUi === 'function') {
            return window.WriteUrduLocale.translateUi(key, fallback);
        }
        return fallback || key;
    }

    function notifyText(key, fallback, type) {
        notify(uiText(key, fallback), type);
    }

    function dispatchInput(element) {
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function countOccurrences(value, search) {
        if (!search) return 0;
        return value.split(search).length - 1;
    }

    function countWords(text) {
        var value = String(text || '').trim();
        if (!value) return 0;
        try {
            return (value.match(/[\p{L}\p{M}\p{N}]+/gu) || []).length;
        } catch (error) {
            return value.split(/\s+/).filter(Boolean).length;
        }
    }

    function normaliseSpacing(text) {
        return String(text || '').split('\n').map(function (line) {
            return line
                .replace(/[\t ]{2,}/g, ' ')
                .replace(/[\t ]+([،؛؟۔,.!?])/g, '$1')
                .replace(/([،؛])(?=[^\s\n])/g, '$1 ');
        }).join('\n').replace(/\n{3,}/g, '\n\n');
    }

    function convertDigits(text) {
        var digits = '۰۱۲۳۴۵۶۷۸۹';
        return String(text || '').replace(/[0-9]/g, function (digit) {
            return digits[Number(digit)];
        });
    }

    // TinyMCE can emit a change event while focus leaves the iframe. Its
    // generated HTML may also contain harmless editor-only attributes or
    // whitespace changes. Use a stable signature for draft comparisons
    // instead of treating every raw HTML string as new content.
    function normaliseDraftContent(value) {
        return String(value || '')
            .replace(/\r\n?/g, '\n')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/\sdata-mce-[^=]+=(?:"[^"]*"|'[^']*')/gi, '')
            .replace(/&nbsp;|\u00a0/gi, ' ')
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    function normaliseDraftText(value) {
        return String(value || '')
            .replace(/\r\n?/g, '\n')
            .replace(/\u00a0/g, ' ')
            .replace(/[ \t]+/g, ' ')
            .trim();
    }

    function draftSignature(snapshot) {
        if (!snapshot) return '';
        var text = normaliseDraftText(snapshot.text);
        var content = normaliseDraftContent(snapshot.content);
        // Text is included separately so equivalent rich-editor markup still
        // deduplicates, while content preserves meaningful formatting changes.
        return text + '\u0000' + content;
    }

    function createTextAdapter(element, kind) {
        return {
            kind: kind,
            mount: kind === 'basic' ? document.getElementById('demo') : element,
            getText: function () { return element.value || ''; },
            getContent: function () { return element.value || ''; },
            hasContent: function () { return Boolean((element.value || '').trim()); },
            setContent: function (content) {
                element.value = String(content || '');
                dispatchInput(element);
            },
            setPlainText: function (content) {
                element.value = String(content || '');
                dispatchInput(element);
            },
            focus: function () { element.focus({ preventScroll: true }); },
            onChange: function (callback) { element.addEventListener('input', callback); },
            insertText: function (text) {
                var start = typeof element.selectionStart === 'number' ? element.selectionStart : element.value.length;
                var end = typeof element.selectionEnd === 'number' ? element.selectionEnd : start;
                element.focus();
                if (typeof element.setRangeText === 'function') {
                    element.setRangeText(text, start, end, 'end');
                } else {
                    element.value = element.value.slice(0, start) + text + element.value.slice(end);
                }
                dispatchInput(element);
            },
            replaceAll: function (search, replacement) {
                var value = element.value || '';
                var count = countOccurrences(value, search);
                if (count) {
                    element.value = value.split(search).join(replacement);
                    dispatchInput(element);
                }
                return count;
            },
            transform: function (transformer) {
                var before = element.value || '';
                var after = transformer(before);
                if (before === after) return false;
                element.value = after;
                dispatchInput(element);
                return true;
            }
        };
    }

    function createRichAdapter(editor) {
        function visitTextNodes(callback) {
            var body = editor.getBody();
            var view = editor.getWin();
            var showText = view.NodeFilter ? view.NodeFilter.SHOW_TEXT : 4;
            var walker = editor.getDoc().createTreeWalker(body, showText);
            var nodes = [];
            var node;
            while ((node = walker.nextNode())) nodes.push(node);
            return callback(nodes);
        }

        function commitTextChange(change) {
            var changed = false;
            editor.undoManager.transact(function () {
                changed = visitTextNodes(change);
            });
            if (changed) {
                editor.nodeChanged();
                editor.fire('change');
            }
            return changed;
        }

        var source = document.getElementById('basic-example');
        return {
            kind: 'rich',
            mount: source ? source.parentElement : editor.getContainer(),
            getText: function () { return editor.getContent({ format: 'text' }) || ''; },
            getContent: function () { return editor.getContent() || ''; },
            hasContent: function () {
                return Boolean((editor.getContent({ format: 'text' }) || '').trim() || editor.getBody().querySelector('img,table,hr'));
            },
            setContent: function (content) { editor.setContent(String(content || '')); },
            setPlainText: function (content) {
                var holder = document.createElement('div');
                holder.textContent = String(content || '');
                editor.setContent('<p>' + holder.innerHTML.replace(/\r?\n/g, '<br>') + '</p>');
            },
            focus: function () { editor.focus(); },
            onChange: function (callback) { editor.on('input change undo redo SetContent', callback); },
            insertText: function (text) {
                var container = document.createElement('div');
                container.textContent = text;
                editor.insertContent(container.innerHTML);
            },
            replaceAll: function (search, replacement) {
                var replacements = 0;
                if (!search) return replacements;
                commitTextChange(function (nodes) {
                    nodes.forEach(function (textNode) {
                        var count = countOccurrences(textNode.nodeValue, search);
                        if (!count) return;
                        replacements += count;
                        textNode.nodeValue = textNode.nodeValue.split(search).join(replacement);
                    });
                    return replacements > 0;
                });
                return replacements;
            },
            transform: function (transformer) {
                return commitTextChange(function (nodes) {
                    var changed = false;
                    nodes.forEach(function (textNode) {
                        var after = transformer(textNode.nodeValue);
                        if (after === textNode.nodeValue) return;
                        textNode.nodeValue = after;
                        changed = true;
                    });
                    return changed;
                });
            }
        };
    }

    function createToolsPanel(kind) {
        var root = document.createElement('section');
        root.className = 'editor-productivity';
        root.setAttribute('aria-label', 'Writing tools, drafts and editor options');
        root.setAttribute('data-editor-kind', kind);
        root.innerHTML =
            '<div class="editor-draft-recovery" data-draft-recovery hidden>' +
                '<span><strong>Local draft found.</strong> <span data-draft-description></span></span>' +
                '<span class="editor-draft-actions">' +
                    '<button type="button" data-action="restore-draft">Restore</button>' +
                    '<button type="button" data-action="discard-draft">Discard</button>' +
                '</span>' +
            '</div>' +
            '<div class="editor-productivity-main">' +
                '<p class="editor-stats" aria-live="polite">' +
                    '<span data-word-count>0 words</span><span aria-hidden="true">·</span>' +
                    '<span data-character-count>0 characters</span><span aria-hidden="true">·</span>' +
                    '<span data-save-status>Drafts are saved only on this device</span>' +
                '</p>' +
                '<div class="editor-tool-actions">' +
                    '<button type="button" class="editor-tool-button" data-action="find" aria-expanded="false">Find &amp; replace</button>' +
                    '<button type="button" class="editor-tool-button" data-action="history" aria-expanded="false">Recent drafts</button>' +
                    '<button type="button" class="editor-tool-button" data-action="import">Import text</button>' +
                    '<button type="button" class="editor-tool-button" data-action="focus" aria-pressed="false">Focus mode</button>' +
                    '<button type="button" class="editor-tool-button" data-action="shortcuts" aria-expanded="false">Shortcuts</button>' +
                '</div>' +
            '</div>' +
            '<div class="editor-quick-tools" role="toolbar" aria-label="Urdu punctuation and cleanup tools">' +
                '<span class="editor-insert-group" data-insert-group>' +
                    '<span class="editor-quick-label">Insert</span>' +
                    '<button type="button" data-insert="،" aria-label="Insert Urdu comma" lang="ur">،</button>' +
                    '<button type="button" data-insert="۔" aria-label="Insert Urdu full stop" lang="ur">۔</button>' +
                    '<button type="button" data-insert="؟" aria-label="Insert Urdu question mark" lang="ur">؟</button>' +
                    '<button type="button" data-insert="؛" aria-label="Insert Urdu semicolon" lang="ur">؛</button>' +
                '</span>' +
                '<button type="button" data-action="digits" title="Convert English numerals to Urdu numerals">123 → ۱۲۳</button>' +
                '<button type="button" data-action="cleanup">Clean spacing</button>' +
            '</div>' +
                '<form class="editor-find-panel" data-find-panel hidden>' +
                '<label>Find<input type="text" name="find" autocomplete="off"></label>' +
                '<label>Replace with<input type="text" name="replacement" autocomplete="off"></label>' +
                '<button type="submit">Replace all</button>' +
                '<button type="button" data-action="close-find">Cancel</button>' +
            '</form>' +
            '<input type="file" data-import-file accept=".txt,text/plain" hidden>' +
            '<div class="editor-history-panel" data-history-panel hidden>' +
                '<div class="editor-history-heading"><strong>Recent drafts <span data-history-count>(0)</span></strong><button type="button" data-action="clear-history">Clear history</button></div>' +
                '<div class="editor-history-list" data-history-list></div>' +
            '</div>';
        if (kind === 'keyboard') root.querySelector('[data-insert-group]').hidden = true;
        return root;
    }

    function getStorage() {
        try {
            var probe = 'write-urdu-storage-test';
            window.localStorage.setItem(probe, probe);
            window.localStorage.removeItem(probe);
            return window.localStorage;
        } catch (error) {
            return null;
        }
    }

    function formatSavedTime(timestamp) {
        if (!timestamp) return '';
        try {
            return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp));
        } catch (error) {
            return new Date(timestamp).toLocaleString();
        }
    }

    function onboardingCopy(kind) {
        if (kind === 'keyboard') {
            return {
                title: 'Start typing Urdu directly',
                body: 'Choose a character from the on-screen keyboard, or type with your physical keyboard. Your work is kept in this browser.',
                tip: 'Tip: choose Copy text when you are ready to paste your Urdu elsewhere.'
            };
        }
        if (kind === 'rich') {
            return {
                title: 'Write and format your Urdu document',
                body: 'Type a Roman Urdu word and press Space to convert it, then use the toolbar for headings, lists, fonts and alignment.',
                tip: 'Tip: open Shortcuts to find tools quickly or save a local draft.'
            };
        }
        return {
            title: 'Write Urdu in three simple steps',
            body: 'Type a Roman Urdu word—for example, mera—then press Space to convert it into Urdu script.',
            tip: 'Tip: press Ctrl+G whenever you want to switch between Roman Urdu and Urdu input.'
        };
    }

    function createOnboarding(kind, storage) {
        var card = document.createElement('aside');
        var copy = onboardingCopy(kind);
        var dismissed = false;
        try { dismissed = storage && storage.getItem(ONBOARDING_PREFIX + kind) === 'dismissed'; } catch (error) { /* private browsing */ }
        card.className = 'editor-onboarding';
        card.setAttribute('data-editor-onboarding', kind);
        card.hidden = dismissed;
        card.innerHTML =
            '<div class="editor-onboarding-icon" aria-hidden="true">✎</div>' +
            '<div class="editor-onboarding-copy">' +
                '<strong data-onboarding-title>' + copy.title + '</strong>' +
                '<p data-onboarding-body>' + copy.body + '</p>' +
                '<small data-onboarding-tip>' + copy.tip + '</small>' +
            '</div>' +
            '<button type="button" class="editor-onboarding-dismiss" data-action="onboarding-dismiss" aria-label="Got it">Got it</button>';
        return card;
    }

    function createCommandPalette() {
        var palette = document.createElement('div');
        palette.className = 'editor-command-backdrop';
        palette.hidden = true;
        palette.setAttribute('data-command-palette', '');
        palette.innerHTML =
            '<section class="editor-command-dialog" role="dialog" aria-modal="true" aria-labelledby="writeUrduCommandTitle">' +
                '<div class="editor-command-heading"><div><span class="editor-command-kicker">Write Urdu</span><h2 id="writeUrduCommandTitle">Shortcuts and tools</h2></div>' +
                    '<button type="button" class="editor-command-close" data-command="close" aria-label="Close">×</button></div>' +
                '<label class="editor-command-search"><span class="sr-only">Search commands</span><input type="search" data-command-search placeholder="Search commands" autocomplete="off"></label>' +
                '<div class="editor-command-list" role="listbox">' +
                    '<button type="button" data-command="save"><span>Ctrl/Cmd + S</span><strong>Save draft</strong></button>' +
                    '<button type="button" data-command="find"><span>Ctrl/Cmd + F</span><strong>Find and replace</strong></button>' +
                    '<button type="button" data-command="history"><span>Local history</span><strong>Recent drafts</strong></button>' +
                    '<button type="button" data-command="import"><span>Text file</span><strong>Import text</strong></button>' +
                    '<button type="button" data-command="focus"><span>Ctrl/Cmd + Shift + F</span><strong>Focus mode</strong></button>' +
                '</div>' +
                '<p class="editor-command-note">Your drafts are stored only on this device.</p>' +
            '</section>';
        return palette;
    }

    function markPageIntroduction() {
        var heading = document.querySelector('h1');
        var intro = heading && heading.closest('.container');
        if (!intro) return;
        intro.classList.add('editor-page-intro');
        if (intro.nextElementSibling && intro.nextElementSibling.matches('hr')) {
            intro.nextElementSibling.classList.add('editor-intro-divider');
        }
    }

    function shareText(adapter) {
        var text = adapter.getText().trim();
        if (!text) {
            notifyText('Type some Urdu text before sharing.', 'Type some Urdu text before sharing.', 'error');
            return;
        }
        if (typeof navigator.share === 'function') {
            navigator.share({ title: 'Write Urdu', text: text }).then(function () {
                notifyText('Text shared successfully.', 'Text shared successfully.', 'success');
            }).catch(function (error) {
                if (error && error.name === 'AbortError') return;
                notifyText('Sharing was unavailable. You can copy the text instead.', 'Sharing was unavailable. You can copy the text instead.', 'error');
            });
            return;
        }
        var shareWindow = window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
        if (shareWindow) shareWindow.opener = null;
        else notifyText('Sharing was blocked. Copy the text and share it manually.', 'Sharing was blocked. Copy the text and share it manually.', 'error');
    }

    function initialiseTools(adapter) {
        if (!adapter || !adapter.mount || document.querySelector('.editor-productivity')) return;

        var storage = getStorage();
        var onboarding = createOnboarding(adapter.kind, storage);
        // Keep the writing surface first. Guidance is useful, but it should
        // not push the primary editor below the fold on the first visit.
        if (adapter.mount.parentElement) adapter.mount.parentElement.appendChild(onboarding);
        var panel = createToolsPanel(adapter.kind);
        var toolbar = document.querySelector('.home-actions, .tool-actions, .keyboard-actions');
        var toolActions = panel.querySelector('.editor-tool-actions');
        var findPanel = panel.querySelector('[data-find-panel]');
        var historyPanel = panel.querySelector('[data-history-panel]');
        // Resolve the list from its own panel before that panel is moved into
        // the top toolbar. Rebuild it defensively if custom markup or a stale
        // cached document omitted the list element.
        if (!toolActions || !findPanel || !historyPanel) return;
        var toolMenu = document.createElement('details');
        toolMenu.className = 'action-menu editor-tools-menu';
        toolMenu.setAttribute('aria-label', 'Writing tools');
        toolMenu.innerHTML = '<summary class="btn btn-quiet" role="button"><i class="fas fa-wrench" aria-hidden="true"></i> Tools</summary><div class="editor-tools-menu-panel"></div>';
        var toolMenuPanel = toolMenu.querySelector('.editor-tools-menu-panel');
        var historyList = historyPanel.querySelector('[data-history-list]');
        if (!historyList) {
            historyList = document.createElement('div');
            historyList.className = 'editor-history-list';
            historyList.setAttribute('data-history-list', '');
            historyPanel.appendChild(historyList);
        }
        if (toolbar) {
            // Keep the discoverability controls together in one compact menu;
            // their references stay local so the existing handlers continue
            // to work after the nodes are re-parented.
            toolMenuPanel.appendChild(toolActions);
            toolbar.appendChild(toolMenu);
            toolbar.appendChild(findPanel);
            toolbar.appendChild(historyPanel);
        }
        // Keep status, quick punctuation tools and recovery below the editor;
        // only the discoverability controls are promoted into the top bar.
        adapter.mount.insertAdjacentElement('afterend', panel);
        document.body.classList.add('has-editor-tools');
        markPageIntroduction();

        var storageKey = DRAFT_PREFIX + adapter.kind;
        var historyKey = HISTORY_PREFIX + adapter.kind;
        var recovery = panel.querySelector('[data-draft-recovery]');
        var recoveryDescription = panel.querySelector('[data-draft-description]');
        var wordCount = panel.querySelector('[data-word-count]');
        var characterCount = panel.querySelector('[data-character-count]');
        var saveStatus = panel.querySelector('[data-save-status]');
        // The primary productivity buttons may be moved into the page toolbar
        // above the editor. Query them from their own container so the
        // handlers work whether the controls are docked or in the fallback
        // panel.
        var findButton = toolActions.querySelector('[data-action="find"]');
        var historyButton = toolActions.querySelector('[data-action="history"]');
        var importButton = toolActions.querySelector('[data-action="import"]');
        var importFile = panel.querySelector('[data-import-file]');
        var focusButton = toolActions.querySelector('[data-action="focus"]');
        var shortcutsButton = toolActions.querySelector('[data-action="shortcuts"]');
        var commandPalette = createCommandPalette();
        document.body.appendChild(commandPalette);
        var pendingDraft = null;
        var saveTimer;
        var dirty = false;
        var lastSavedSignature = '';

        function readDraft() {
            if (!storage) return null;
            try {
                var value = storage.getItem(storageKey);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                return null;
            }
        }

        function readHistory() {
            if (!storage) return [];
            try {
                var value = storage.getItem(historyKey);
                var items = value ? JSON.parse(value) : [];
                if (!Array.isArray(items)) return [];
                var seen = Object.create(null);
                var cleanItems = items.filter(function (item) {
                    return item && typeof item.content === 'string' && item.content.trim();
                }).filter(function (item) {
                    var signature = draftSignature(item);
                    if (!signature || seen[signature]) return false;
                    seen[signature] = true;
                    return true;
                }).slice(0, MAX_HISTORY_ITEMS);
                // Compact duplicate entries written by older versions as soon
                // as history is read, without requiring user intervention.
                if (cleanItems.length !== items.length) {
                    storage.setItem(historyKey, JSON.stringify(cleanItems));
                }
                return cleanItems;
            } catch (error) {
                return [];
            }
        }

        function saveHistory(snapshot) {
            if (!storage || !snapshot || !snapshot.content) return;
            var signature = draftSignature(snapshot);
            var items = readHistory();
            var duplicate = items.find(function (item) { return draftSignature(item) === signature; });
            if (duplicate && duplicate.title && !snapshot.title) snapshot.title = duplicate.title;
            items = items.filter(function (item) { return draftSignature(item) !== signature; });
            items.unshift(snapshot);
            storage.setItem(historyKey, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
        }

        function historyPreview(text) {
            var value = String(text || '').replace(/\s+/g, ' ').trim();
            return value.length > 72 ? value.slice(0, 72) + '…' : value;
        }

        function renderHistory() {
            historyList.textContent = '';
            var items = readHistory();
            var historyCount = historyPanel.querySelector('[data-history-count]');
            if (historyCount) historyCount.textContent = '(' + items.length + ')';
            if (!items.length) {
                var empty = document.createElement('span');
                empty.className = 'editor-history-empty';
                empty.textContent = uiText('No saved drafts yet. Type something to create one.', 'No saved drafts yet. Type something to create one.');
                historyList.appendChild(empty);
                return;
            }
            items.forEach(function (item, index) {
                var row = document.createElement('div');
                var restore = document.createElement('button');
                var rename = document.createElement('button');
                var remove = document.createElement('button');
                var title = item.title || historyPreview(item.text || item.content);
                row.className = 'editor-history-item';
                restore.type = 'button';
                restore.className = 'editor-history-restore';
                restore.setAttribute('data-history-index', String(index));
                restore.textContent = title + ' · ' + formatSavedTime(item.savedAt);
                rename.type = 'button';
                rename.className = 'editor-history-action';
                rename.setAttribute('data-history-rename-index', String(index));
                rename.textContent = 'Rename';
                remove.type = 'button';
                remove.className = 'editor-history-action editor-history-delete';
                remove.setAttribute('data-history-delete-index', String(index));
                remove.textContent = 'Delete';
                row.appendChild(restore);
                row.appendChild(rename);
                row.appendChild(remove);
                historyList.appendChild(row);
            });
        }

        function updateStats() {
            var text = adapter.getText();
            var words = countWords(text);
            var characters = Array.from(text).length;
            wordCount.textContent = words + (words === 1 ? ' word' : ' words');
            characterCount.textContent = characters + (characters === 1 ? ' character' : ' characters');
        }

        function writeDraft() {
            window.clearTimeout(saveTimer);
            if (!dirty || pendingDraft) return;
            if (!storage) {
                saveStatus.textContent = uiText('Local saving unavailable', 'Local saving unavailable');
                return;
            }
            try {
                var snapshot = {
                    content: adapter.getContent(),
                    text: adapter.getText()
                };
                var signature = draftSignature(snapshot);
                // Ignore editor lifecycle events (especially rich-editor blur)
                // when the effective document has not changed since the last
                // successful save.
                if (signature === lastSavedSignature) {
                    dirty = false;
                    saveStatus.textContent = uiText('Saved on this device', 'Saved on this device');
                    return;
                }
                if (adapter.hasContent()) {
                    var savedAt = Date.now();
                    storage.setItem(storageKey, JSON.stringify({
                        content: snapshot.content,
                        text: snapshot.text,
                        savedAt: savedAt
                    }));
                    saveHistory({
                        content: snapshot.content,
                        text: snapshot.text,
                        savedAt: savedAt
                    });
                    renderHistory();
                    saveStatus.textContent = uiText('Saved on this device at', 'Saved on this device at') + ' ' + new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    lastSavedSignature = signature;
                } else {
                    storage.removeItem(storageKey);
                    saveStatus.textContent = uiText('No local draft', 'No local draft');
                    lastSavedSignature = '';
                }
                dirty = false;
            } catch (error) {
                saveStatus.textContent = uiText('Draft could not be saved', 'Draft could not be saved');
            }
        }

        function scheduleSave() {
            var currentSignature = draftSignature({
                content: adapter.getContent(),
                text: adapter.getText()
            });
            // TinyMCE's blur/change notification is not a user edit. Do not
            // turn it into a pending save when the document is unchanged.
            if (!dirty && currentSignature === lastSavedSignature) return;
            dirty = true;
            if (pendingDraft) {
                pendingDraft = null;
                recovery.hidden = true;
            }
            saveStatus.textContent = storage ? uiText('Saving locally…', 'Saving locally…') : uiText('Local saving unavailable', 'Local saving unavailable');
            window.clearTimeout(saveTimer);
            saveTimer = window.setTimeout(writeDraft, SAVE_DELAY);
        }

        function handleChange() {
            updateStats();
            scheduleSave();
        }

        function setFocusMode(enabled) {
            document.body.classList.toggle('write-urdu-focus', enabled);
            focusButton.setAttribute('aria-pressed', String(enabled));
            focusButton.textContent = enabled ? 'Exit focus' : 'Focus mode';
            if (enabled) adapter.focus();
        }

        adapter.onChange(handleChange);
        updateStats();

        pendingDraft = readDraft();
        lastSavedSignature = draftSignature(pendingDraft || readHistory()[0]);
        renderHistory();
        if (!storage) historyButton.disabled = true;
        if (pendingDraft && pendingDraft.content && !adapter.hasContent()) {
            recoveryDescription.textContent = 'Saved ' + formatSavedTime(pendingDraft.savedAt) + '.';
            recovery.hidden = false;
            saveStatus.textContent = uiText('Draft available to restore', 'Draft available to restore');
        } else if (pendingDraft) {
            saveStatus.textContent = uiText('Saved on this device', 'Saved on this device');
            pendingDraft = null;
        } else if (!storage) {
            saveStatus.textContent = uiText('Local saving unavailable', 'Local saving unavailable');
        }

        panel.querySelector('[data-action="restore-draft"]').addEventListener('click', function () {
            if (!pendingDraft) return;
            var content = pendingDraft.content;
            pendingDraft = null;
            recovery.hidden = true;
            adapter.setContent(content);
            adapter.focus();
            notifyText('Your local draft has been restored.', 'Your local draft has been restored.', 'success');
        });

        panel.querySelector('[data-action="discard-draft"]').addEventListener('click', function () {
            if (storage) storage.removeItem(storageKey);
            pendingDraft = null;
            recovery.hidden = true;
            saveStatus.textContent = uiText('No local draft', 'No local draft');
            notifyText('Local draft deleted.', 'Local draft deleted.', 'success');
        });

        onboarding.querySelector('[data-action="onboarding-dismiss"]').addEventListener('click', function () {
            onboarding.hidden = true;
            if (storage) storage.setItem(ONBOARDING_PREFIX + adapter.kind, 'dismissed');
        });

        function closeToolMenu() {
            if (toolMenu) toolMenu.open = false;
        }

        historyButton.addEventListener('click', function () {
            closeToolMenu();
            var opening = historyPanel.hidden;
            historyPanel.hidden = !opening;
            historyButton.setAttribute('aria-expanded', String(opening));
            if (opening) renderHistory();
        });

        historyList.addEventListener('click', function (event) {
            var deleteButton = event.target.closest('[data-history-delete-index]');
            if (deleteButton) {
                var deleteIndex = Number(deleteButton.getAttribute('data-history-delete-index'));
                var deleteItems = readHistory();
                if (!deleteItems[deleteIndex]) return;
                deleteItems.splice(deleteIndex, 1);
                if (storage) storage.setItem(historyKey, JSON.stringify(deleteItems));
                renderHistory();
                notifyText('Draft deleted from this device.', 'Draft deleted from this device.', 'success');
                return;
            }
            var renameButton = event.target.closest('[data-history-rename-index]');
            if (renameButton) {
                var renameIndex = Number(renameButton.getAttribute('data-history-rename-index'));
                var renameItems = readHistory();
                if (!renameItems[renameIndex] || !storage) return;
                var proposedTitle = window.prompt('Name this draft', renameItems[renameIndex].title || historyPreview(renameItems[renameIndex].text || renameItems[renameIndex].content));
                if (proposedTitle === null) return;
                renameItems[renameIndex].title = String(proposedTitle).trim().slice(0, 60) || 'Untitled draft';
                storage.setItem(historyKey, JSON.stringify(renameItems));
                renderHistory();
                notifyText('Draft name updated.', 'Draft name updated.', 'success');
                return;
            }
            var button = event.target.closest('[data-history-index]');
            if (!button) return;
            var item = readHistory()[Number(button.getAttribute('data-history-index'))];
            if (!item) return;
            pendingDraft = null;
            recovery.hidden = true;
            adapter.setContent(item.content);
            historyPanel.hidden = true;
            historyButton.setAttribute('aria-expanded', 'false');
            adapter.focus();
                notifyText('Recent draft restored successfully.', 'Recent draft restored successfully.', 'success');
        });

        historyPanel.querySelector('[data-action="clear-history"]').addEventListener('click', function () {
            if (storage && readHistory().length && !window.confirm('Clear all recent drafts from this device?')) return;
            if (storage) storage.removeItem(historyKey);
            renderHistory();
            notifyText('Draft history cleared from this device.', 'Draft history cleared from this device.', 'success');
        });

        importButton.addEventListener('click', function () {
            closeToolMenu();
            importFile.click();
        });

        importFile.addEventListener('change', function () {
            var file = importFile.files && importFile.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                adapter.setPlainText(String(reader.result || ''));
                adapter.focus();
                importFile.value = '';
                notifyText('Text file imported successfully.', 'Text file imported successfully.', 'success');
            };
            reader.onerror = function () {
                importFile.value = '';
                notifyText('Text file could not be imported.', 'Text file could not be imported.', 'error');
            };
            reader.readAsText(file, 'UTF-8');
        });

        panel.querySelectorAll('[data-insert]').forEach(function (button) {
            button.addEventListener('click', function () {
                adapter.insertText(button.getAttribute('data-insert'));
                adapter.focus();
            });
        });

        panel.querySelector('[data-action="digits"]').addEventListener('click', function () {
            if (adapter.transform(convertDigits)) notifyText('English numerals converted to Urdu numerals.', 'English numerals converted to Urdu numerals.', 'success');
            else notifyText('No English numerals found.', 'No English numerals found.', 'error');
        });

        panel.querySelector('[data-action="cleanup"]').addEventListener('click', function () {
            if (adapter.transform(normaliseSpacing)) notifyText('Spacing and Urdu punctuation cleaned.', 'Spacing and Urdu punctuation cleaned.', 'success');
            else notifyText('Spacing was already clean.', 'Spacing was already clean.', 'success');
        });

        findButton.addEventListener('click', function () {
            closeToolMenu();
            var opening = findPanel.hidden;
            findPanel.hidden = !opening;
            findButton.setAttribute('aria-expanded', String(opening));
            if (opening && window.matchMedia('(min-width: 768px)').matches) findPanel.elements.find.focus();
        });

        findPanel.querySelector('[data-action="close-find"]').addEventListener('click', function () {
            findPanel.hidden = true;
            findButton.setAttribute('aria-expanded', 'false');
        });

        findPanel.addEventListener('submit', function (event) {
            event.preventDefault();
            var search = findPanel.elements.find.value;
            if (!search) {
                notifyText('Enter text to find.', 'Enter text to find.', 'error');
                return;
            }
            var replacements = adapter.replaceAll(search, findPanel.elements.replacement.value);
            notify(replacements ? replacements + ' replacement' + (replacements === 1 ? '' : 's') + ' made.' : uiText('No matching text was found.', 'No matching text was found.'), replacements ? 'success' : 'error');
        });

        focusButton.addEventListener('click', function () {
            closeToolMenu();
            setFocusMode(!document.body.classList.contains('write-urdu-focus'));
        });

        function closeCommandPalette() {
            commandPalette.hidden = true;
            if (shortcutsButton) shortcutsButton.setAttribute('aria-expanded', 'false');
        }

        function openCommandPalette() {
            commandPalette.hidden = false;
            if (shortcutsButton) shortcutsButton.setAttribute('aria-expanded', 'true');
            var search = commandPalette.querySelector('[data-command-search]');
            if (search) {
                search.value = '';
                commandPalette.querySelectorAll('[data-command]').forEach(function (item) { item.hidden = item.getAttribute('data-command') === 'close'; });
                window.setTimeout(function () { search.focus(); }, 0);
            }
        }

        if (shortcutsButton) shortcutsButton.addEventListener('click', function () {
            closeToolMenu();
            if (commandPalette.hidden) openCommandPalette();
            else closeCommandPalette();
        });

        commandPalette.addEventListener('click', function (event) {
            if (event.target === commandPalette) {
                closeCommandPalette();
                return;
            }
            var command = event.target.closest('[data-command]');
            if (!command) return;
            var action = command.getAttribute('data-command');
            if (action === 'close') closeCommandPalette();
            if (action === 'save') { writeDraft(); notifyText('Draft saved locally on this device.', 'Draft saved locally on this device.', 'success'); closeCommandPalette(); }
            if (action === 'find') { closeCommandPalette(); findButton.click(); }
            if (action === 'history') { closeCommandPalette(); historyButton.click(); }
            if (action === 'import') { closeCommandPalette(); importButton.click(); }
            if (action === 'focus') { closeCommandPalette(); setFocusMode(!document.body.classList.contains('write-urdu-focus')); }
        });

        var commandSearch = commandPalette.querySelector('[data-command-search]');
        if (commandSearch) commandSearch.addEventListener('input', function () {
            var query = commandSearch.value.toLowerCase().trim();
            commandPalette.querySelectorAll('.editor-command-list [data-command]').forEach(function (item) {
                item.hidden = Boolean(query) && item.textContent.toLowerCase().indexOf(query) === -1;
            });
        });

        document.addEventListener('keydown', function (event) {
            var modifier = event.ctrlKey || event.metaKey;
            var key = event.key.toLowerCase();
            if (modifier && event.shiftKey && key === 'p') {
                event.preventDefault();
                if (commandPalette.hidden) openCommandPalette(); else closeCommandPalette();
            } else if (modifier && key === 's') {
                event.preventDefault();
                writeDraft();
                notifyText('Draft saved locally on this device.', 'Draft saved locally on this device.', 'success');
            } else if (modifier && key === 'f' && !event.shiftKey) {
                event.preventDefault();
                findButton.click();
            } else if (event.key === 'Escape') {
                if (!commandPalette.hidden) closeCommandPalette();
                if (document.body.classList.contains('write-urdu-focus')) setFocusMode(false);
            }
        });

        document.querySelectorAll('[data-write-urdu-share]').forEach(function (button) {
            button.addEventListener('click', function () { shareText(adapter); });
        });

        var clearButton = document.getElementById('clear');
        if (clearButton) clearButton.addEventListener('click', function () {
            window.setTimeout(function () {
                updateStats();
                scheduleSave();
            }, 0);
        });

        var keyboard = document.getElementById('key1');
        if (keyboard) keyboard.addEventListener('click', function () {
            window.setTimeout(function () {
                updateStats();
                scheduleSave();
            }, 0);
        });

        window.addEventListener('pagehide', writeDraft);
        window.WriteUrduTools = {
            adapter: adapter,
            saveDraft: writeDraft,
            share: function () { shareText(adapter); }
        };
    }

    function boot() {
        var basic = document.getElementById('transliterateTextarea');
        if (basic) {
            initialiseTools(createTextAdapter(basic, 'basic'));
            return;
        }
        var keyboard = document.getElementById('write');
        if (keyboard) {
            initialiseTools(createTextAdapter(keyboard, 'keyboard'));
            return;
        }

        var attempts = 0;
        var richTimer = window.setInterval(function () {
            attempts += 1;
            var editor = window.tinymce && window.tinymce.get && window.tinymce.get('basic-example');
            if (editor && editor.initialized) {
                window.clearInterval(richTimer);
                initialiseTools(createRichAdapter(editor));
            } else if (attempts > 100) {
                window.clearInterval(richTimer);
            }
        }, 100);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
}());
