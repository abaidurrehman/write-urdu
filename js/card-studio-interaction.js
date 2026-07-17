(function () {
    'use strict';
    var interaction = window.WriteUrduCardStudioInteraction;
    var app;
    var root = document.querySelector('[data-card-studio]');
    if (!interaction || !root) return;
    var layer = root.querySelector('[data-card-interaction-layer]');
    var artboard = root.querySelector('[data-card-artboard]');
    var selectionBox = root.querySelector('[data-card-selection-box]');
    var editor = root.querySelector('[data-card-canvas-editor]');
    var guides = root.querySelector('[data-card-guides]');
    var toolbar = root.querySelector('[data-card-context-toolbar]');
    var selectedLabel = root.querySelector('[data-card-selected-object]');
    var selectionLabel = root.querySelector('[data-card-selection-label]');
    var selected = null;
    var mode = 'idle';
    var gesture = null;
    var editSnapshot = null;
    var history = [];
    var future = [];
    var lastTap = { objectId: null, time: 0 };
    var composing = false;
    var resizeObserver = null;

    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function cardSize() { var preset = app.getPreset(); return { width: preset.width, height: preset.height }; }
    function syncLayerToCanvas() { var wrap = artboard.getBoundingClientRect(), canvasRect = app.getCanvas().getBoundingClientRect(); layer.style.left = (canvasRect.left - wrap.left) + 'px'; layer.style.top = (canvasRect.top - wrap.top) + 'px'; layer.style.width = canvasRect.width + 'px'; layer.style.height = canvasRect.height + 'px'; }
    function transform() { var rect = layer.getBoundingClientRect(); return interaction.getPreviewTransform(cardSize(), rect); }
    function objectRect(objectId) {
        var rect = app.getObjectRect(objectId); var layout = app.getLayouts()[objectId];
        if (layout && layout.height) rect.height = Math.max(rect.height || 0, layout.height);
        return rect;
    }
    function objectVisible(objectId) { var state = app.getState(); return objectId === 'text' || Boolean(state.attribution && state.attribution.enabled && String(state.attribution.value || '').trim()); }
    function uiText(en, ur) { return document.documentElement.lang === 'ur' ? ur : en; }
    function objectAtPoint(point) {
        var candidates = ['attribution', 'text'];
        for (var i = 0; i < candidates.length; i += 1) { var id = candidates[i]; if (objectVisible(id) && interaction.pointInExpandedRect(point, objectRect(id), 16 / Math.max(.01, transform().scaleX))) return id; }
        return null;
    }
    function refreshSelection() {
        syncLayerToCanvas();
        if (!selected || !objectVisible(selected)) { selected = null; selectionBox.hidden = true; toolbar.hidden = true; return; }
        var css = interaction.cardRectToCssRect(objectRect(selected), transform());
        selectionBox.style.left = css.left + 'px'; selectionBox.style.top = css.top + 'px'; selectionBox.style.width = Math.max(36, css.width) + 'px'; selectionBox.style.height = Math.max(36, css.height) + 'px'; selectionBox.hidden = mode === 'editing';
        selectionLabel.textContent = selected === 'attribution' ? uiText('Author/source', 'مصنف یا ماخذ') : uiText('Main text', 'مرکزی متن');
        selectedLabel.textContent = selected === 'attribution' ? uiText('Author/source selected', 'مصنف یا ماخذ منتخب ہے') : uiText('Text selected', 'متن منتخب ہے');
        toolbar.hidden = mode === 'editing' ? false : false;
        var done = toolbar.querySelector('[data-card-object-action="done"]'); if (done) done.hidden = mode !== 'editing'; var cancel = toolbar.querySelector('[data-card-object-action="cancel"]'); if (cancel) cancel.hidden = mode !== 'editing';
        var edit = toolbar.querySelector('[data-card-object-action="edit"]'); if (edit) edit.hidden = mode === 'editing';
        syncLayoutControls();
        if (mode === 'editing') positionEditor();
    }
    function syncLayoutControls() {
        var objectSelect = root.querySelector('[data-card-layout-object]'); if (!objectSelect) return;
        objectSelect.value = selected || 'text';
        var rect = objectRect(selected || 'text');
        root.querySelector('[data-card-layout-field="x"]').value = (rect.x / cardSize().width * 100).toFixed(1);
        root.querySelector('[data-card-layout-field="y"]').value = (rect.y / cardSize().height * 100).toFixed(1);
        root.querySelector('[data-card-layout-field="width"]').value = (rect.width / cardSize().width * 100).toFixed(1);
    }
    function announce(message) { var status = root.querySelector('[data-card-status]'); if (status) { status.textContent = message; status.setAttribute('role', 'status'); } }
    function clearGuides() { guides.textContent = ''; }
    function renderGuides(result) {
        clearGuides();
        (result.guides || []).forEach(function (guide) { var line = document.createElement('span'); line.className = 'card-studio-guide ' + (guide.axis === 'x' ? 'vertical' : 'horizontal'); if (guide.axis === 'x') line.style.left = (guide.value * transform().scaleX) + 'px'; else line.style.top = (guide.value * transform().scaleY) + 'px'; line.dataset.label = guide.label || ''; guides.appendChild(line); });
    }
    function snapshot() { return clone(app.getState()); }
    function historyState() { return { canUndo: history.length > 0 && mode !== 'editing', canRedo: future.length > 0 && mode !== 'editing' }; }
    function syncHistoryButtons() {
        var state = historyState();
        root.querySelectorAll('[data-card-ui-action="undo"]').forEach(function (button) { button.disabled = !state.canUndo; });
        root.querySelectorAll('[data-card-ui-action="redo"]').forEach(function (button) { button.disabled = !state.canRedo; });
    }
    function pushHistory(before) { if (!before) return; var after = snapshot(); if (JSON.stringify(before) === JSON.stringify(after)) return; history.push({ before: before, after: after }); if (history.length > 50) history.shift(); future = []; syncHistoryButtons(); }
    function recordHistory(before) { pushHistory(before); refreshSelection(); }
    function undo() { if (!history.length || mode === 'editing') return; var item = history.pop(); future.push(item); app.replaceState(item.before); announce('Change undone.'); refreshSelection(); syncHistoryButtons(); }
    function redo() { if (!future.length || mode === 'editing') return; var item = future.pop(); history.push(item); app.replaceState(item.after); announce('Change redone.'); refreshSelection(); syncHistoryButtons(); }
    function beginGesture(event, type, handle, tapToEdit) {
        if (!selected) return;
        var point = interaction.clientPointToCardPoint({ x: event.clientX, y: event.clientY }, transform());
        gesture = { type: type, handle: handle, pointerId: event.pointerId, startPoint: point, startRect: objectRect(selected), before: snapshot(), moved: false, tapToEdit: Boolean(tapToEdit), startFontSize: Number(app.getState().text.fontSize) || 64 };
        try { layer.setPointerCapture(event.pointerId); } catch (error) {}
    }
    function updateGesture(event) {
        if (!gesture || event.pointerId !== gesture.pointerId) return;
        var current = interaction.clientPointToCardPoint({ x: event.clientX, y: event.clientY }, transform());
        var dx = current.x - gesture.startPoint.x, dy = current.y - gesture.startPoint.y;
        var cssDistance = Math.sqrt(Math.pow(dx * transform().scaleX, 2) + Math.pow(dy * transform().scaleY, 2));
        if (!gesture.moved && cssDistance < (event.pointerType === 'touch' ? 6 : 3)) return;
        gesture.moved = true;
        var preset = app.getPreset(), next, snap;
        if (gesture.type === 'resize') {
            if (gesture.handle === 'font') {
                var nextSize = Math.round(Math.max(app.getState().text.minFontSize || 28, Math.min(app.getState().text.maxFontSize || 160, gesture.startFontSize + dy * .45)));
                app.updateTextStyle({ fontMode: 'manual', fontSize: nextSize }, { save: false });
                renderGuides({ guides: [] });
                refreshSelection();
                return;
            }
            next = interaction.resizeRect(gesture.startRect, gesture.handle, { x: dx, y: dy }, { minWidth: selected === 'attribution' ? preset.width * .1 : preset.width * .2, maxWidth: preset.width - preset.marginX * 2 });
            next.y = gesture.startRect.y; next.height = gesture.startRect.height;
            app.updateObjectRect(selected, next, { save: false, widthCustomized: true });
            refreshSelection();
            return;
        }
        next = interaction.moveRect(gesture.startRect, { x: dx, y: dy }, preset, { minVisible: Math.max(24, gesture.startRect.width * .2) });
        snap = interaction.calculateSnap(next, preset, { left: preset.marginX, top: preset.marginY, right: preset.width - preset.marginX, bottom: preset.height - preset.marginY }, 12 / Math.max(.01, transform().scaleX), Boolean(event.altKey));
        app.updateObjectRect(selected, snap.rect, { save: false });
        renderGuides(snap); refreshSelection();
    }
    function finishGesture(cancel) {
        if (!gesture) return;
        try { layer.releasePointerCapture(gesture.pointerId); } catch (error) {}
        clearGuides();
        if (!cancel && gesture.moved) { pushHistory(gesture.before); app.scheduleSave(); announce(selected === 'attribution' ? 'Author position updated.' : 'Text position updated.'); }
        else if (cancel) app.replaceState(gesture.before);
        gesture = null; refreshSelection();
    }
    function positionEditor() {
        if (mode !== 'editing' || !selected) return;
        var css = interaction.cardRectToCssRect(objectRect(selected), transform()); var state = app.getState(); var fontSize = selected === 'text' ? state.text.fontSize : Math.max(16, Math.round(state.text.fontSize * (state.attribution.fontSizeRatio || .44)));
        editor.style.left = css.left + 'px'; editor.style.top = css.top + 'px'; editor.style.width = Math.max(48, css.width) + 'px'; editor.style.height = Math.max(54, css.height) + 'px'; editor.style.fontFamily = '"' + (selected === 'text' ? state.text.fontFamily : state.attribution.fontFamily) + '"'; editor.style.fontSize = Math.max(16, fontSize * transform().scaleX) + 'px'; editor.style.lineHeight = String(selected === 'text' ? state.text.lineHeight : 1.35); editor.style.textAlign = state.text.align; editor.style.color = selected === 'text' ? state.text.color : state.attribution.color; editor.dir = 'auto';
    }
    function enterEdit() {
        if (!selected || !objectVisible(selected)) return;
        editSnapshot = snapshot(); mode = 'editing'; editor.value = app.getObjectValue(selected); editor.hidden = false; app.setInteractionState({ editingObjectId: selected }); refreshSelection(); positionEditor(); editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length); syncHistoryButtons(); announce('Editing ' + (selected === 'attribution' ? 'author/source.' : 'main text.'));
    }
    function commitEdit() {
        if (mode !== 'editing') return;
        var before = editSnapshot; app.updateObjectText(selected, editor.value, { save: false }); editor.hidden = true; mode = 'selected'; app.setInteractionState({ editingObjectId: null }); if (before) pushHistory(before); app.scheduleSave(); refreshSelection(); syncHistoryButtons(); announce('Edit saved.'); editSnapshot = null;
    }
    function cancelEdit() {
        if (mode !== 'editing') return;
        if (editSnapshot) app.replaceState(editSnapshot, { save: false }); editor.hidden = true; mode = 'selected'; app.setInteractionState({ editingObjectId: null }); refreshSelection(); syncHistoryButtons(); announce('Edit cancelled.'); editSnapshot = null;
    }
    function select(objectId) { if (!objectId) { selected = null; mode = 'idle'; selectionBox.hidden = true; toolbar.hidden = true; return; } selected = objectId; mode = 'selected'; app.setInteractionState({ selectedObjectId: selected }); refreshSelection(); announce((selected === 'attribution' ? 'Author/source' : 'Main text') + ' selected.'); }
    function pointerDown(event) {
        if (mode === 'editing') return;
        var resize = event.target.closest && event.target.closest('[data-card-resize]');
        if (resize && selected) { event.preventDefault(); beginGesture(event, 'resize', resize.dataset.cardResize); return; }
        var point = interaction.clientPointToCardPoint({ x: event.clientX, y: event.clientY }, transform()); var hit = objectAtPoint(point);
        if (!hit) { select(null); return; }
        event.preventDefault(); var now = Date.now(); var editOnTap = selected === hit && now - lastTap.time < 430; select(hit); lastTap = { objectId: hit, time: now }; beginGesture(event, 'drag', null, editOnTap);
    }
    function pointerMove(event) { updateGesture(event); }
    function pointerUp(event) { if (gesture && event.pointerId === gesture.pointerId) { var editOnTap = gesture.tapToEdit && !gesture.moved; finishGesture(false); if (editOnTap) enterEdit(); } }
    function keydown(event) {
        if (event.target === editor) return;
        if (event.ctrlKey || event.metaKey) { if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); } else if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); } return; }
        if (!selected) return;
        if (event.key === 'Enter') { event.preventDefault(); enterEdit(); return; }
        if (event.key === 'Escape') { event.preventDefault(); select(null); return; }
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault(); var before = snapshot(), rect = objectRect(selected), amount = event.shiftKey ? 20 : 2; if (event.key === 'ArrowLeft') rect.x -= amount; if (event.key === 'ArrowRight') rect.x += amount; if (event.key === 'ArrowUp') rect.y -= amount; if (event.key === 'ArrowDown') rect.y += amount; app.updateObjectRect(selected, interaction.clampRectToCard(rect, cardSize(), { minVisible: 20 }), { save: false }); pushHistory(before); app.scheduleSave(); refreshSelection();
    }
    function toolbarAction(event) {
        var action = event.currentTarget.dataset.cardObjectAction; if (action === 'edit') enterEdit(); else if (action === 'done') commitEdit(); else if (action === 'cancel') cancelEdit(); else if (action === 'reset' && selected) { var before = snapshot(); app.resetObject(selected); pushHistory(before); refreshSelection(); } else if (action === 'align-left' || action === 'align-center' || action === 'align-right') app.setObjectAlignment(action.replace('align-', ''));
    }
    function layoutFieldInput(event) {
        var objectId = root.querySelector('[data-card-layout-object]').value || selected || 'text';
        if (!objectVisible(objectId)) return;
        var before = snapshot(), rect = objectRect(objectId), value = Number(event.target.value) || 0;
        if (event.target.dataset.cardLayoutField === 'x') rect.x = value / 100 * cardSize().width;
        if (event.target.dataset.cardLayoutField === 'y') rect.y = value / 100 * cardSize().height;
        if (event.target.dataset.cardLayoutField === 'width') rect.width = value / 100 * cardSize().width;
        rect = interaction.clampRectToCard(rect, cardSize(), { minVisible: 20 }); app.updateObjectRect(objectId, rect, { widthCustomized: event.target.dataset.cardLayoutField === 'width' }); selected = objectId; mode = 'selected'; pushHistory(before); refreshSelection();
    }
    function layoutAction(event) {
        var objectId = selected || root.querySelector('[data-card-layout-object]').value || 'text'; if (!objectVisible(objectId)) return;
        var before = snapshot(), rect = objectRect(objectId), action = event.currentTarget.dataset.cardLayoutAction;
        if (action === 'center-x') rect.x = (cardSize().width - rect.width) / 2;
        if (action === 'center-y') rect.y = (cardSize().height - rect.height) / 2;
        if (action === 'reset') { app.resetObject(objectId); pushHistory(before); selected = objectId; refreshSelection(); return; }
        app.updateObjectRect(objectId, interaction.clampRectToCard(rect, cardSize(), { minVisible: 20 }), {}); pushHistory(before); selected = objectId; refreshSelection();
    }
    function onEditorInput() { if (composing) return; app.updateObjectText(selected, editor.value, { save: false }); positionEditor(); refreshSelection(); }
    function onEditorKeydown(event) { if (event.isComposing || composing) return; if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); commitEdit(); } else if (event.key === 'Escape') { event.preventDefault(); cancelEdit(); } }
    function onOutside(event) { if (mode !== 'editing') return; if (event.target === editor || (toolbar && toolbar.contains(event.target))) return; if (layer.contains(event.target)) { commitEdit(); return; } commitEdit(); }
    function bind() {
        layer.addEventListener('pointerdown', pointerDown); layer.addEventListener('pointermove', pointerMove); layer.addEventListener('pointerup', pointerUp); layer.addEventListener('pointercancel', function () { finishGesture(true); }); layer.addEventListener('keydown', keydown);
        editor.addEventListener('input', onEditorInput); editor.addEventListener('keydown', onEditorKeydown); editor.addEventListener('compositionstart', function () { composing = true; }); editor.addEventListener('compositionend', function () { composing = false; onEditorInput(); });
        var sidebarText = root.querySelector('#cardText'), sidebarAttribution = root.querySelector('#cardAttribution');
        if (sidebarText) sidebarText.addEventListener('input', function () { if (mode === 'editing' && selected === 'text' && document.activeElement !== editor) editor.value = sidebarText.value; });
        if (sidebarAttribution) sidebarAttribution.addEventListener('input', function () { if (mode === 'editing' && selected === 'attribution' && document.activeElement !== editor) editor.value = sidebarAttribution.value; });
        var attributionToggle = root.querySelector('[data-card-field="attribution.enabled"]'); if (attributionToggle) attributionToggle.addEventListener('change', function () { if (!attributionToggle.checked && selected === 'attribution') select(null); else refreshSelection(); });
        root.querySelectorAll('[data-card-object-action]').forEach(function (button) { button.addEventListener('click', toolbarAction); }); document.addEventListener('pointerdown', onOutside);
        root.querySelector('[data-card-layout-object]').addEventListener('change', function (event) { select(event.target.value); });
        root.querySelectorAll('[data-card-layout-field]').forEach(function (field) { field.addEventListener('change', layoutFieldInput); });
        root.querySelectorAll('[data-card-layout-action]').forEach(function (button) { button.addEventListener('click', layoutAction); });
        if (window.ResizeObserver) { resizeObserver = new ResizeObserver(function () { refreshSelection(); }); resizeObserver.observe(artboard); }
        window.addEventListener('resize', refreshSelection);
        document.addEventListener('write-urdu:locale-change', refreshSelection);
        window.WriteUrduCardStudioInteractionApi = { commit: commitEdit, cancel: cancelEdit, refresh: refreshSelection, select: select, undo: undo, redo: redo, getHistoryState: historyState, recordHistory: recordHistory };
        syncHistoryButtons();
    }
    function start() { app = window.WriteUrduCardStudioApp; if (!app) return; bind(); refreshSelection(); }
    if (window.WriteUrduCardStudioApp) start(); else document.addEventListener('write-urdu:card-studio-ready', start, { once: true });
}());
