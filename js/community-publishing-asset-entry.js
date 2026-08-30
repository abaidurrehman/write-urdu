(function () {
  'use strict';

  function ensureStylesheet(href) {
    if (document.querySelector('link[href$="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function ensureStyles() {
    ensureStylesheet('/css/card-studio-publish.css');
    ensureStylesheet('/css/community-publishing.css');
  }

  function ensureCommunityAssetUi() {
    return new Promise(function (resolve) {
      if (window.WriteUrduCommunityAssetPublish) { resolve(window.WriteUrduCommunityAssetPublish); return; }
      var existing = document.querySelector('script[data-wu-community-asset-ui]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(window.WriteUrduCommunityAssetPublish || null); }, { once: true });
        window.setTimeout(function () { resolve(window.WriteUrduCommunityAssetPublish || null); }, 1600);
        return;
      }
      var script = document.createElement('script');
      script.type = 'module';
      script.src = '/js/community-publishing-asset-ui.mjs';
      script.setAttribute('data-wu-community-asset-ui', '');
      script.onload = function () { resolve(window.WriteUrduCommunityAssetPublish || null); };
      script.onerror = function () { resolve(null); };
      document.head.appendChild(script);
    });
  }

  function toast(message) {
    var current = document.querySelector('.wu-share-toast');
    if (current) current.remove();
    var node = document.createElement('div');
    node.className = 'wu-share-toast is-error';
    node.setAttribute('role', 'status');
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(function () { node.remove(); }, 3200);
  }

  function mountButton(container, getText) {
    if (!container || container.querySelector('[data-card-action="publish-community"]')) return null;
    ensureStyles();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'card-studio-button wu-community-toolbar-button';
    button.setAttribute('data-card-action', 'publish-community');
    button.innerHTML = '<i class="fas fa-feather-alt" aria-hidden="true"></i> Submit to Urdu Writers';
    button.addEventListener('click', function () {
      var text = String((typeof getText === 'function' ? getText() : '') || '').trim();
      if (!text) { toast('Add your own Urdu text before submitting.'); return; }
      ensureCommunityAssetUi().then(function (publisher) {
        if (publisher && publisher.open) publisher.open(text);
        else toast('Could not open the community submission form. Please try again.');
      });
    });
    container.appendChild(button);
    return button;
  }

  window.WriteUrduCommunityAssetEntry = Object.freeze({ mountButton: mountButton });
}());
