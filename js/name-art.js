(function () {
    'use strict';
    var frame = document.querySelector('[data-name-art-frame]');
    if (!frame) return;
    var key = 'writeUrdu.nameArt.handoff.v1';
    var incoming = null;
    try { incoming = JSON.parse(sessionStorage.getItem(key) || 'null'); sessionStorage.removeItem(key); } catch (error) { incoming = null; }
    var created = incoming && Date.parse(incoming.createdAt || '');
    if (!incoming || incoming.version !== 1 || typeof incoming.text !== 'string' || !incoming.text.trim() || (created && Date.now() - created > 30 * 60 * 1000)) incoming = null;
    if (incoming) {
        try { sessionStorage.setItem('writeUrdu.cardStudio.incoming', JSON.stringify({ version: 1, text: incoming.text.trim(), source: incoming.source || 'name-art', createdAt: new Date().toISOString() })); } catch (error) { /* session storage may be unavailable */ }
    }
    frame.src = 'urdu-card-studio.html?nameArt=1';
}());
