'use strict';

// Royal Mughal is drawn by the shared browser/runtime module so the wedding maker can render
// the same artwork live at any card size; this build entry only adapts it to the build API.
var art = require('../../../js/card-art-royal-mughal.js');

module.exports = {
    id: 'royal-mughal-emerald',
    render: function (W, H, options) { return art.render(W, H, options).svg; },
    palettes: Object.keys(art.PALETTES)
};
