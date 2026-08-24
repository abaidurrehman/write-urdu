'use strict';

// Small reviewed additions for growth surfaces that are intentionally kept
// separate from the large Phase 1 locale dictionary. The static Urdu generator
// consumes these alongside locale/ur.js so new acquisition UI cannot drift
// between English source HTML and generated /urdu/ output.
module.exports = {
  '/': [
    ['aria-label="Try Urdu Voice Typing"', 'aria-label="اردو وائس ٹائپنگ آزمائیں"'],
    [
      '<span class="wu-voice-entry-copy"><span class="wu-voice-entry-kicker">Speak Urdu</span><strong>Talk. Get Urdu text.</strong><small>Use Urdu Voice Typing when speaking is faster than typing.</small></span>',
      '<span class="wu-voice-entry-copy"><span class="wu-voice-entry-kicker">آواز سے اردو لکھیں</span><strong>بولیں، اردو متن حاصل کریں۔</strong><small>جب بولنا ٹائپ کرنے سے آسان ہو تو اردو وائس ٹائپنگ استعمال کریں۔</small></span>'
    ],
    [
      '<article><h3><a href="/tools/urdu-voice-typing">Urdu Voice Typing</a></h3><p>Speak Urdu and turn your voice into editable Urdu text with your microphone.</p></article>',
      '<article><h3><a href="/tools/urdu-voice-typing">اردو وائس ٹائپنگ</a></h3><p>مائیک سے اردو بولیں اور اپنی آواز کو قابلِ تدوین اردو متن میں تبدیل کریں۔</p></article>'
    ]
  ]
};
