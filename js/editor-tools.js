(function () {
    'use strict';

    var SAVE_DELAY = 650;
    var DRAFT_PREFIX = 'write-urdu:draft:v1:';
    var HISTORY_PREFIX = 'write-urdu:history:v1:';
    var MAX_HISTORY_ITEMS = 5;

    function notify(message, type) {
        if (window.WriteUrduUI && typeof window.WriteUrduUI.notify === 'function') {
            window.WriteUrduUI.notify(message, type);
        }
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
        root.setAttribute('aria-label', 'Writing tools and local draft status');
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
                    '<span data-save-status>Drafts stay on this device</span>' +
                '</p>' +
                '<div class="editor-tool-actions">' +
                    '<button type="button" class="editor-tool-button" data-action="find" aria-expanded="false">Find &amp; replace</button>' +
                    '<button type="button" class="editor-tool-button" data-action="history" aria-expanded="false">Recent drafts</button>' +
                    '<button type="button" class="editor-tool-button" data-action="import">Import text</button>' +
                    '<button type="button" class="editor-tool-button" data-action="focus" aria-pressed="false">Focus mode</button>' +
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
                '<div class="editor-history-heading"><strong>Recent drafts</strong><button type="button" data-action="clear-history">Clear history</button></div>' +
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
            notify('Type some Urdu text before sharing.', 'error');
            return;
        }
        if (typeof navigator.share === 'function') {
            navigator.share({ title: 'Write Urdu', text: text }).then(function () {
                notify('Text shared successfully.', 'success');
            }).catch(function (error) {
                if (error && error.name === 'AbortError') return;
                notify('Sharing was unavailable. You can copy the text instead.', 'error');
            });
            return;
        }
        var shareWindow = window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
        if (shareWindow) shareWindow.opener = null;
        else notify('Sharing was blocked. Copy the text and share it manually.', 'error');
    }

    function initialiseTools(adapter) {
        if (!adapter || !adapter.mount || document.querySelector('.editor-productivity')) return;

        var panel = createToolsPanel(adapter.kind);
        var toolbar = document.querySelector('.home-actions, .tool-actions, .keyboard-actions');
        var toolActions = panel.querySelector('.editor-tool-actions');
        var findPanel = panel.querySelector('[data-find-panel]');
        var historyPanel = panel.querySelector('[data-history-panel]');
        // Resolve the list from its own panel before that panel is moved into
        // the top toolbar. Rebuild it defensively if custom markup or a stale
        // cached document omitted the list element.
        if (!toolActions || !findPanel || !historyPanel) return;
        var historyList = historyPanel.querySelector('[data-history-list]');
        if (!historyList) {
            historyList = document.createElement('div');
            historyList.className = 'editor-history-list';
            historyList.setAttribute('data-history-list', '');
            historyPanel.appendChild(historyList);
        }
        if (toolbar) {
            // Promote the discoverability controls beside Copy/Export/Share;
            // their references stay local so the existing handlers continue
            // to work after the nodes are re-parented.
            toolbar.appendChild(toolActions);
            toolbar.appendChild(findPanel);
            toolbar.appendChild(historyPanel);
        }
        // Keep status, quick punctuation tools and recovery below the editor;
        // only the discoverability controls are promoted into the top bar.
        adapter.mount.insertAdjacentElement('afterend', panel);
        markPageIntroduction();

        var storage = getStorage();
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
        var pendingDraft = null;
        var saveTimer;
        var dirty = false;

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
                return Array.isArray(items) ? items.filter(function (item) {
                    return item && typeof item.content === 'string' && item.content.trim();
                }).slice(0, MAX_HISTORY_ITEMS) : [];
            } catch (error) {
                return [];
            }
        }

        function saveHistory(snapshot) {
            if (!storage || !snapshot || !snapshot.content) return;
            var items = readHistory().filter(function (item) {
                return item.content !== snapshot.content;
            });
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
            if (!items.length) {
                var empty = document.createElement('span');
                empty.className = 'editor-history-empty';
                empty.textContent = 'No saved drafts yet.';
                historyList.appendChild(empty);
                return;
            }
            items.forEach(function (item, index) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'editor-history-item';
                button.setAttribute('data-history-index', String(index));
                button.textContent = historyPreview(item.text || item.content) + ' · ' + formatSavedTime(item.savedAt);
                historyList.appendChild(button);
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
                saveStatus.textContent = 'Local saving unavailable';
                return;
            }
            try {
                if (adapter.hasContent()) {
                    var savedAt = Date.now();
                    storage.setItem(storageKey, JSON.stringify({
                        content: adapter.getContent(),
                        text: adapter.getText(),
                        savedAt: savedAt
                    }));
                    saveHistory({
                        content: adapter.getContent(),
                        text: adapter.getText(),
                        savedAt: savedAt
                    });
                    renderHistory();
                    saveStatus.textContent = 'Saved on this device at ' + new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else {
                    storage.removeItem(storageKey);
                    saveStatus.textContent = 'No local draft';
                }
                dirty = false;
            } catch (error) {
                saveStatus.textContent = 'Draft could not be saved';
            }
        }

        function scheduleSave() {
            dirty = true;
            if (pendingDraft) {
                pendingDraft = null;
                recovery.hidden = true;
            }
            saveStatus.textContent = storage ? 'Saving locally…' : 'Local saving unavailable';
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
        renderHistory();
        if (!storage) historyButton.disabled = true;
        if (pendingDraft && pendingDraft.content && !adapter.hasContent()) {
            recoveryDescription.textContent = 'Saved ' + formatSavedTime(pendingDraft.savedAt) + '.';
            recovery.hidden = false;
            saveStatus.textContent = 'Draft available to restore';
        } else if (pendingDraft) {
            saveStatus.textContent = 'Saved on this device';
            pendingDraft = null;
        } else if (!storage) {
            saveStatus.textContent = 'Local saving unavailable';
        }

        panel.querySelector('[data-action="restore-draft"]').addEventListener('click', function () {
            if (!pendingDraft) return;
            var content = pendingDraft.content;
            pendingDraft = null;
            recovery.hidden = true;
            adapter.setContent(content);
            adapter.focus();
            notify('Your local draft was restored.', 'success');
        });

        panel.querySelector('[data-action="discard-draft"]').addEventListener('click', function () {
            if (storage) storage.removeItem(storageKey);
            pendingDraft = null;
            recovery.hidden = true;
            saveStatus.textContent = 'No local draft';
            notify('Local draft discarded.', 'success');
        });

        historyButton.addEventListener('click', function () {
            var opening = historyPanel.hidden;
            historyPanel.hidden = !opening;
            historyButton.setAttribute('aria-expanded', String(opening));
            if (opening) renderHistory();
        });

        historyList.addEventListener('click', function (event) {
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
            notify('Recent draft restored.', 'success');
        });

        historyPanel.querySelector('[data-action="clear-history"]').addEventListener('click', function () {
            if (storage) storage.removeItem(historyKey);
            renderHistory();
            notify('Recent draft history cleared.', 'success');
        });

        importButton.addEventListener('click', function () {
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
                notify('Text file imported successfully.', 'success');
            };
            reader.onerror = function () {
                importFile.value = '';
                notify('Text file could not be imported.', 'error');
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
            if (adapter.transform(convertDigits)) notify('English numerals converted to Urdu numerals.', 'success');
            else notify('No English numerals were found.', 'error');
        });

        panel.querySelector('[data-action="cleanup"]').addEventListener('click', function () {
            if (adapter.transform(normaliseSpacing)) notify('Spacing and Urdu punctuation were cleaned.', 'success');
            else notify('No spacing changes were needed.', 'success');
        });

        findButton.addEventListener('click', function () {
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
                notify('Enter the text you want to find.', 'error');
                return;
            }
            var replacements = adapter.replaceAll(search, findPanel.elements.replacement.value);
            notify(replacements ? replacements + ' replacement' + (replacements === 1 ? '' : 's') + ' made.' : 'No matching text was found.', replacements ? 'success' : 'error');
        });

        focusButton.addEventListener('click', function () {
            setFocusMode(!document.body.classList.contains('write-urdu-focus'));
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && document.body.classList.contains('write-urdu-focus')) setFocusMode(false);
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
