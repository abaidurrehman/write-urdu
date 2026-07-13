(function () {
    'use strict';

    var slots = Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle'));
    if (!slots.length || document.querySelector('script[data-write-urdu-ads]')) return;

    function initializeSlots() {
        slots.forEach(function (slot) {
            if (slot.getAttribute('data-adsbygoogle-status')) return;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.warn('An advertising slot could not be initialized.', error);
            }
        });
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4727847909946286';
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-write-urdu-ads', '');
    script.onload = initializeSlots;
    document.head.appendChild(script);
}());
