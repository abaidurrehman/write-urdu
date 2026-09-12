(function () {
    'use strict';

    var path = (window.location.pathname || '').replace(/\/+$/, '').replace(/\.html$/, '');
    if (path !== '/urdu-card-studio' && path !== '/urdu/urdu-card-studio') return;

    var root = document.querySelector('[data-card-studio]');
    if (!root) return;

    var backgrounds = [
        {
            id: 'emerald-mughal',
            name: 'Emerald Mughal',
            nameUr: 'زمردی مغلیہ',
            src: '/assets/card-studio/backgrounds/emerald-mughal.svg',
            textColor: '#fff7df',
            overlayColor: '#10291f',
            overlayOpacity: 0.08
        },
        {
            id: 'moonlit-lanterns',
            name: 'Moonlit Lanterns',
            nameUr: 'چاندنی رات',
            src: '/assets/card-studio/backgrounds/moonlit-lanterns.svg',
            textColor: '#fff7df',
            overlayColor: '#071426',
            overlayOpacity: 0.12
        },
        {
            id: 'vintage-floral',
            name: 'Vintage Floral',
            nameUr: 'پھولوں کی نزاکت',
            src: '/assets/card-studio/backgrounds/vintage-floral.svg',
            textColor: '#4b2e2c',
            overlayColor: '#ffffff',
            overlayOpacity: 0
        },
        {
            id: 'burgundy-arch',
            name: 'Burgundy Arch',
            nameUr: 'عنابی محراب',
            src: '/assets/card-studio/backgrounds/burgundy-arch.svg',
            textColor: '#fff3d2',
            overlayColor: '#32101d',
            overlayOpacity: 0.08
        }
    ];

    function isUrdu() {
        return document.documentElement.lang === 'ur';
    }

    function text(en, ur) {
        return isUrdu() ? ur : en;
    }

    function dispatchField(field, value) {
        var element = root.querySelector('[data-card-field="' + field + '"]');
        if (!element) return;
        element.value = String(value);
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function announce(message, isError) {
        var status = root.querySelector('[data-card-status]');
        if (!status) return;
        status.textContent = message;
        status.setAttribute('role', isError ? 'alert' : 'status');
    }

    function setPressed(selectedId) {
        root.querySelectorAll('[data-card-built-in-background]').forEach(function (button) {
            button.setAttribute('aria-pressed', button.dataset.cardBuiltInBackground === selectedId ? 'true' : 'false');
        });
    }

    function rasterizeBackground(blob, background) {
        return new Promise(function (resolve, reject) {
            var sourceUrl = URL.createObjectURL(blob);
            var image = new Image();
            image.onload = function () {
                URL.revokeObjectURL(sourceUrl);
                var canvas = document.createElement('canvas');
                canvas.width = 1080;
                canvas.height = 1350;
                var context = canvas.getContext('2d');
                if (!context) {
                    reject(new Error('Canvas unavailable'));
                    return;
                }
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(function (rendered) {
                    if (!rendered) {
                        reject(new Error('Background rendering failed'));
                        return;
                    }
                    var mime = rendered.type === 'image/webp' ? 'image/webp' : 'image/png';
                    var extension = mime === 'image/webp' ? 'webp' : 'png';
                    resolve(new File([rendered], background.id + '.' + extension, { type: mime }));
                }, 'image/webp', 0.92);
            };
            image.onerror = function () {
                URL.revokeObjectURL(sourceUrl);
                reject(new Error('Background image failed to load'));
            };
            image.src = sourceUrl;
        });
    }

    function applyBackground(background, button) {
        var input = document.getElementById('cardImage');
        if (!input || typeof window.fetch !== 'function' || typeof window.DataTransfer !== 'function') {
            announce(text('This browser cannot apply a ready-made background. You can still upload your own image.', 'یہ براؤزر تیار شدہ پس منظر نہیں لگا سکتا۔ آپ اپنی تصویر اب بھی اپ لوڈ کر سکتے ہیں۔'), true);
            return;
        }

        var originalLabel = button.querySelector('[data-card-background-label]');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        if (originalLabel) originalLabel.textContent = text('Loading…', 'لوڈ ہو رہا ہے…');
        announce(text('Loading designer background…', 'خوبصورت پس منظر لوڈ ہو رہا ہے…'));

        fetch(background.src, { cache: 'force-cache', credentials: 'same-origin' })
            .then(function (response) {
                if (!response.ok) throw new Error('Background request failed');
                return response.blob();
            })
            .then(function (blob) {
                return rasterizeBackground(blob, background);
            })
            .then(function (file) {
                var transfer = new DataTransfer();
                transfer.items.add(file);
                input.files = transfer.files;

                dispatchField('background.fit', 'cover');
                dispatchField('background.positionX', 0.5);
                dispatchField('background.positionY', 0.5);
                dispatchField('background.overlayColor', background.overlayColor);
                dispatchField('background.overlayOpacity', background.overlayOpacity);
                dispatchField('text.color', background.textColor);

                input.dispatchEvent(new Event('change', { bubbles: true }));
                setPressed(background.id);
                announce(text('Designer background applied. Your text is still fully editable.', 'خوبصورت پس منظر لگا دیا گیا ہے۔ آپ کا متن اب بھی مکمل طور پر قابلِ ترمیم ہے۔'));
            })
            .catch(function () {
                announce(text('This background could not be loaded. Please try again.', 'یہ پس منظر لوڈ نہیں ہو سکا۔ دوبارہ کوشش کریں۔'), true);
            })
            .finally(function () {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                if (originalLabel) originalLabel.textContent = isUrdu() ? background.nameUr : background.name;
            });
    }

    function injectStyles() {
        if (document.getElementById('cardStudioBackgroundLibraryStyles')) return;
        var style = document.createElement('style');
        style.id = 'cardStudioBackgroundLibraryStyles';
        style.textContent = [
            '.card-studio-background-library{margin:0 0 18px;padding:16px;border:1px solid rgba(18,68,50,.18);border-radius:16px;background:linear-gradient(180deg,rgba(239,249,244,.96),rgba(248,251,249,.96));box-shadow:0 5px 18px rgba(22,51,42,.06)}',
            '.card-studio-background-library-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}',
            '.card-studio-background-library-title{margin:0;font-size:1rem;color:#173e31}',
            '.card-studio-background-library-help{margin:4px 0 0;font-size:.8rem;line-height:1.45;color:#526b60}',
            '.card-studio-background-library-badge{flex:0 0 auto;padding:5px 9px;border-radius:999px;background:#dff3e7;color:#1f6848;font-size:.7rem;font-weight:800}',
            '.card-studio-background-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
            '.card-studio-background-option{appearance:none;padding:0;overflow:hidden;border:2px solid transparent;border-radius:13px;background:#fff;box-shadow:0 3px 12px rgba(22,51,42,.09);cursor:pointer;text-align:start;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}',
            '.card-studio-background-option:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,51,42,.13)}',
            '.card-studio-background-option:focus-visible{outline:3px solid rgba(45,113,83,.28);outline-offset:2px}',
            '.card-studio-background-option[aria-pressed="true"]{border-color:#2d7153;box-shadow:0 0 0 2px rgba(45,113,83,.12)}',
            '.card-studio-background-option[disabled]{cursor:wait;opacity:.72}',
            '.card-studio-background-option img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;background:#edf2ef}',
            '.card-studio-background-option span{display:block;padding:8px 9px 9px;font-size:.78rem;font-weight:700;color:#243b32;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '[dir="rtl"] .card-studio-background-option{text-align:right}',
            '@media (max-width:640px){.card-studio-background-library{padding:12px}.card-studio-background-library-grid{gap:8px}}'
        ].join('');
        document.head.appendChild(style);
    }

    function renderLibrary() {
        if (root.querySelector('[data-card-built-in-library]')) return;
        var templateGrid = root.querySelector('[data-card-templates]');
        var templateSection = templateGrid && templateGrid.closest('section[data-card-step="format"]');
        if (!templateSection || !templateSection.parentNode) return;

        injectStyles();

        var library = document.createElement('section');
        library.className = 'card-studio-background-library';
        library.dataset.cardBuiltInLibrary = 'true';
        library.dataset.cardStep = 'format';
        library.setAttribute('data-card-step-panel', '');
        library.setAttribute('aria-labelledby', 'cardStudioBackgroundLibraryTitle');

        var header = document.createElement('div');
        header.className = 'card-studio-background-library-head';

        var headingWrap = document.createElement('div');
        var title = document.createElement('h3');
        title.className = 'card-studio-background-library-title';
        title.id = 'cardStudioBackgroundLibraryTitle';
        title.textContent = text('Designer backgrounds', 'خوبصورت پس منظر');
        var help = document.createElement('p');
        help.className = 'card-studio-background-library-help';
        help.textContent = text('Pick a ready-made look here, then fine-tune text and background controls in Style.', 'یہاں تیار شدہ ڈیزائن منتخب کریں، پھر Style میں متن اور پس منظر کی باریک ترتیب کریں۔');
        headingWrap.appendChild(title);
        headingWrap.appendChild(help);

        var badge = document.createElement('span');
        badge.className = 'card-studio-background-library-badge';
        badge.textContent = text('New · 4', 'نیا · 4');
        header.appendChild(headingWrap);
        header.appendChild(badge);

        var grid = document.createElement('div');
        grid.className = 'card-studio-background-library-grid';

        backgrounds.forEach(function (background) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'card-studio-background-option';
            button.dataset.cardBuiltInBackground = background.id;
            button.setAttribute('aria-pressed', 'false');
            button.setAttribute('aria-label', text('Use ' + background.name + ' background', background.nameUr + ' پس منظر استعمال کریں'));

            var image = document.createElement('img');
            image.src = background.src;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.width = 320;
            image.height = 400;

            var label = document.createElement('span');
            label.dataset.cardBackgroundLabel = 'true';
            label.textContent = isUrdu() ? background.nameUr : background.name;

            button.appendChild(image);
            button.appendChild(label);
            button.addEventListener('click', function () { applyBackground(background, button); });
            grid.appendChild(button);
        });

        library.appendChild(header);
        library.appendChild(grid);
        templateSection.parentNode.insertBefore(library, templateSection);
    }

    renderLibrary();
    document.addEventListener('write-urdu:locale-change', function () {
        var library = root.querySelector('[data-card-built-in-library]');
        if (library) library.remove();
        renderLibrary();
    });
}());
