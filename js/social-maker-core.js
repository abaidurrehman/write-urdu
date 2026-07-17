(function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduSocialMaker = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    var MODES = {
        whatsapp: {
            id: 'whatsapp',
            route: '/urdu-whatsapp-status-maker',
            title: 'WhatsApp Status Maker',
            subtitle: 'Create a polished Urdu status image, download it, and upload it to WhatsApp yourself.',
            defaultPreset: 'story',
            templateId: 'midnight',
            filenamePrefix: 'urdu-whatsapp-status',
            sampleText: 'آج کا دن ایک نئی شروعات ہے۔',
            safeAreas: { story: { top: 230, right: 100, bottom: 290, left: 100 } },
            guideLabel: 'WhatsApp status safe area'
        },
        instagram: {
            id: 'instagram',
            route: '/urdu-instagram-post-maker',
            title: 'Instagram Post Maker',
            subtitle: 'Design an Urdu post, quote or announcement, then download the image for Instagram.',
            defaultPreset: 'square',
            templateId: 'minimal-white',
            filenamePrefix: 'urdu-instagram-post',
            sampleText: 'اپنی بات خوب صورت انداز میں شیئر کریں۔',
            safeAreas: {
                square: { top: 90, right: 90, bottom: 90, left: 90 },
                portrait: { top: 120, right: 90, bottom: 150, left: 90 },
                story: { top: 230, right: 100, bottom: 290, left: 100 }
            },
            guideLabel: 'Instagram safe area'
        }
    };

    function getMode(value) {
        return value && MODES[value] ? MODES[value] : null;
    }

    function getModeFromLocation(location) {
        try {
            var params = new URLSearchParams((location || (typeof window !== 'undefined' ? window.location : {})).search || '');
            return getMode(params.get('social'));
        } catch (error) {
            return null;
        }
    }

    function storageKey(mode) {
        return 'writeUrdu.socialProjects.v1:' + (getMode(mode) || { id: 'card' }).id;
    }

    function recentKey() { return 'writeUrdu.socialRecentTemplates.v1'; }

    function getSafeArea(mode, preset) {
        var config = getMode(mode);
        var selected = config && config.safeAreas[preset && preset.id];
        if (selected) return Object.assign({}, selected);
        var width = Number(preset && preset.width) || 1080;
        var height = Number(preset && preset.height) || 1080;
        var horizontal = Math.round(width * .09);
        var vertical = Math.round(height * .09);
        return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
    }

    function applyDefaults(core, project, mode, incomingText) {
        var config = getMode(mode);
        if (!config || !core || !project) return project;
        var next = core.applyPreset(project, config.defaultPreset);
        next = core.applyTemplate(next, config.templateId);
        next.name = config.filenamePrefix;
        next.socialMode = config.id;
        if (incomingText != null) next.text.value = String(incomingText);
        else if (!String(next.text.value || '').trim() || next.text.value === core.DEFAULT_TEXT) next.text.value = config.sampleText;
        return core.normalizeCardProject(next);
    }

    function isInsideSafeArea(rect, preset, safeArea) {
        if (!rect || !preset || !safeArea) return false;
        return rect.x >= safeArea.left && rect.y >= safeArea.top &&
            rect.x + rect.width <= preset.width - safeArea.right &&
            rect.y + rect.height <= preset.height - safeArea.bottom;
    }

    function evaluateSafeArea(objects, preset, safeArea) {
        var outside = [];
        Object.keys(objects || {}).forEach(function (id) {
            if (objects[id] && !isInsideSafeArea(objects[id], preset, safeArea)) outside.push(id);
        });
        return { valid: outside.length === 0, outside: outside };
    }

    function safeFilename(prefix, extension) {
        var base = String(prefix || 'write-urdu-social').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'write-urdu-social';
        return base + '-' + new Date().toISOString().slice(0, 10) + '.' + (extension === 'jpeg' ? 'jpg' : 'png');
    }

    return { MODES: MODES, getMode: getMode, getModeFromLocation: getModeFromLocation, storageKey: storageKey, recentKey: recentKey, getSafeArea: getSafeArea, applyDefaults: applyDefaults, isInsideSafeArea: isInsideSafeArea, evaluateSafeArea: evaluateSafeArea, safeFilename: safeFilename };
}));
