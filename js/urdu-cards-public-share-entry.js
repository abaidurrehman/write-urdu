(function (root) {
    'use strict';

    var document = root.document;
    var Handoff = root.WriteUrduWorkspaceHandoff;
    var envelope = Handoff && typeof Handoff.take === 'function' ? Handoff.take('urdu-cards') : null;
    var attempts = 0;
    var MAX_ATTEMPTS = 120;
    var ALLOWED_ACTIONS = {
        'share-to-urdu-cards-create-own': 'create-own',
        'share-to-urdu-cards-use-public-text': 'use-public-text'
    };

    function status(message, error) {
        var node = document.querySelector('[data-urdu-cards-status]');
        if (!node) return;
        node.textContent = message || '';
        node.classList.toggle('is-error', Boolean(error));
    }

    function validEntry(value) {
        if (!value || !value.source || value.source.workspace !== 'public-share') return false;
        if (!value.target || value.target.workspace !== 'urdu-cards') return false;
        if (!value.payload || value.payload.kind !== 'plain-text') return false;
        return Boolean(ALLOWED_ACTIONS[value.actionId]);
    }

    function applyEntry() {
        var ownWords = root.WriteUrduCardsOwnWords;
        if (!ownWords) return false;

        if (!validEntry(envelope)) {
            if (envelope) status('This card start could not be restored. You can still start with your own words.', true);
            return true;
        }

        if (envelope.actionId === 'share-to-urdu-cards-create-own') {
            ownWords.open();
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.shareReferralReady === 'function') root.WriteUrduTelemetry.shareReferralReady();
            return true;
        }

        var result = ownWords.importText(envelope.payload.text);
        if (!result || !result.ok) {
            ownWords.open();
            status(result && result.reason === 'existing-text'
                ? 'Your current words were kept. Clear them before importing the shared words.'
                : 'These shared words could not be restored. You can still start fresh.', true);
            return true;
        }
        status('Shared public words are ready. Edit them or choose a card design.');
        if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.shareReferralReady === 'function') root.WriteUrduTelemetry.shareReferralReady();
        return true;
    }

    function retry() {
        if (!envelope || applyEntry()) return;
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
            status('This card start could not be prepared. You can still choose “Use my words” below.', true);
            return;
        }
        root.requestAnimationFrame(retry);
    }

    document.addEventListener('write-urdu:urdu-cards-own-words-ready', retry, { once: true });
    retry();
}(window));
