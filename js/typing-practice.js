(function () {
    'use strict';

    var root = document.querySelector('[data-typing-practice]');
    var Core = window.WriteUrduTypingPracticeCore;
    if (!root || !Core) return;

    var STORAGE_KEY = 'writeUrdu.typingPractice.v1';
    var URDU_PATTERN = /[\u0600-\u06ff]/;
    var KEYBOARD_ROWS = [
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l'],
        ['z','x','c','v','b','n','m',',','.','/']
    ];

    var LESSONS = [
        { id:'home-row', group:'Foundation', number:1, title:'Home row', urdu:'درمیانی قطار', copy:'Build muscle memory for the easiest home-row letters.', target:'ا س د ف گ ح ج ک ل  ا س د ف گ ح ج ک ل  سال دل کل حال گل' },
        { id:'top-row', group:'Foundation', number:2, title:'Top row', urdu:'اوپری قطار', copy:'Practice the most useful letters on the top row.', target:'ق و ع ر ت ے ء ی ہ پ  ق و ع ر ت ے ی ہ پ  یہ وہ پر تو پھر' },
        { id:'bottom-row', group:'Foundation', number:3, title:'Bottom row', urdu:'نچلی قطار', copy:'Add bottom-row letters and Urdu punctuation.', target:'ز ش چ ط ب ن م  ز ش چ ط ب ن م  نام بات شب چمن زمان' },
        { id:'shift-letters', group:'Foundation', number:4, title:'Shift letters', urdu:'شفٹ والے حروف', copy:'Learn common Urdu letters that use Shift on the phonetic layout.', target:'آ ص ڈ غ ھ ض خ ذ ژ ث ظ ں ڑ ٹ  بڑا گھر خاص ٹھنڈا آغاز' },
        { id:'common-words', group:'Words', number:5, title:'Common words', urdu:'عام الفاظ', copy:'Move from individual keys to everyday Urdu words.', target:'میں آپ ہم تم یہ وہ ایک اور ہے ہیں تھا تھی کے کی کو سے پر بھی' },
        { id:'daily-words', group:'Words', number:6, title:'Daily life', urdu:'روزمرہ کے الفاظ', copy:'Practice useful words with repeated letter patterns.', target:'گھر کتاب پانی سکول بازار دوست وقت کام صبح شام خوشی دنیا زندگی' },
        { id:'short-sentences', group:'Sentences', number:7, title:'Short sentences', urdu:'مختصر جملے', copy:'Keep a steady rhythm across spaces and complete phrases.', target:'آج موسم اچھا ہے۔ میں اردو لکھ رہا ہوں۔ آپ کیسے ہیں؟ ہم وقت پر گھر جائیں گے۔' },
        { id:'natural-sentences', group:'Sentences', number:8, title:'Natural Urdu', urdu:'سادہ اردو', copy:'Practice natural sentence flow without rushing.', target:'اچھی تحریر صاف سوچ سے شروع ہوتی ہے۔ روز تھوڑی مشق رفتار اور درستگی دونوں بہتر کرتی ہے۔' },
        { id:'punctuation', group:'Sentences', number:9, title:'Punctuation', urdu:'اوقاف', copy:'Practice Urdu comma, full stop and question mark in context.', target:'علی نے کتاب، قلم اور کاغذ خریدا۔ آپ آج کہاں جا رہے ہیں؟ میں نے کہا، ابھی گھر چلتے ہیں۔' },
        { id:'flow', group:'Speed', number:10, title:'Build flow', urdu:'روانی', copy:'A longer passage for smooth, consistent typing.', target:'اردو ٹائپنگ میں رفتار سے پہلے درستگی اہم ہے۔ جب انگلیاں حروف کی جگہ یاد کر لیں تو رفتار خود بہتر ہونے لگتی ہے۔ ہر روز چند منٹ کی باقاعدہ مشق لمبے وقفوں سے زیادہ فائدہ دیتی ہے۔' },
        { id:'focus', group:'Speed', number:11, title:'Accuracy first', urdu:'پہلے درستگی', copy:'Hold accuracy through a paragraph with varied vocabulary.', target:'تیز ٹائپ کرنے کی کوشش میں غلطیوں کو نظر انداز نہ کریں۔ پہلے لفظ کو صحیح لکھیں، پھر آہستہ آہستہ رفتار بڑھائیں۔ مشکل حروف کو الگ مشق کریں اور اپنی غلطیوں کے نمونے پہچانیں۔' },
        { id:'confidence', group:'Speed', number:12, title:'Confident typing', urdu:'اعتماد کے ساتھ', copy:'Finish the foundation course with a realistic paragraph.', target:'مسلسل مشق کے بعد اردو کی بورڈ اجنبی محسوس نہیں ہوتا۔ مقصد صرف زیادہ الفاظ فی منٹ لکھنا نہیں بلکہ کم غلطیوں کے ساتھ صاف اور درست اردو لکھنا ہے۔ اپنی پچھلی رفتار سے مقابلہ کریں اور ہر نشست میں تھوڑی بہتری تلاش کریں۔' }
    ];

    var TEST_SENTENCES = [
        'اردو ہماری خوب صورت زبان ہے اور اسے روانی سے ٹائپ کرنا روزمرہ کام میں بہت مدد دیتا ہے۔',
        'باقاعدہ مشق سے انگلیاں حروف کی جگہ یاد کر لیتی ہیں اور لکھنے کی رفتار آہستہ آہستہ بڑھتی ہے۔',
        'درستگی کو رفتار پر ترجیح دیں کیونکہ صحیح عادت شروع سے بنانا بعد میں غلط عادت بدلنے سے آسان ہے۔',
        'ایک پرسکون رفتار منتخب کریں، الفاظ کو غور سے دیکھیں اور غلطی ہو جائے تو اسے درست کر کے آگے بڑھیں۔',
        'طالب علم درخواستیں، مضامین اور نوٹس لکھتے وقت اچھی اردو ٹائپنگ سے اپنا وقت بچا سکتے ہیں۔',
        'روزانہ دس منٹ کی توجہ کے ساتھ مشق ہفتے میں ایک لمبی نشست سے زیادہ مفید ثابت ہو سکتی ہے۔',
        'اپنی بہترین رفتار کو یاد رکھیں مگر ہر نئی کوشش میں صاف لکھائی اور کم غلطیوں کو اصل کامیابی سمجھیں۔',
        'کمپیوٹر پر اردو لکھنے کی مہارت تعلیم، دفتر، صحافت اور تخلیقی تحریر سمیت بہت سے کاموں میں مفید ہے۔'
    ];

    var dom = {
        modeButtons: root.querySelectorAll('[data-practice-mode]'), lessonPanel: root.querySelector('[data-lesson-panel]'),
        testPanel: root.querySelector('[data-test-panel]'), lessonList: root.querySelector('[data-lesson-list]'),
        durationButtons: root.querySelectorAll('[data-test-duration]'), inputModeButtons: root.querySelectorAll('[data-input-mode]'),
        target: root.querySelector('[data-practice-target]'), entry: root.querySelector('[data-practice-entry]'),
        time: root.querySelector('[data-stat-time]'), wpm: root.querySelector('[data-stat-wpm]'),
        accuracy: root.querySelector('[data-stat-accuracy]'), errors: root.querySelector('[data-stat-errors]'),
        progressBar: root.querySelector('[data-progress-bar]'), progressTrack: root.querySelector('[data-progress-track]'),
        progressText: root.querySelector('[data-progress-text]'), title: root.querySelector('[data-current-title]'),
        description: root.querySelector('[data-current-description]'), keyboard: root.querySelector('[data-phonetic-keyboard]'),
        keyboardRows: root.querySelector('[data-keyboard-rows]'), shift: root.querySelector('[data-keyboard-shift]'),
        keyboardHint: root.querySelector('[data-keyboard-hint]'), restart: root.querySelector('[data-practice-restart]'),
        result: root.querySelector('[data-practice-result]'), resultTitle: root.querySelector('[data-result-title]'),
        resultWpm: root.querySelector('[data-result-wpm]'), resultAccuracy: root.querySelector('[data-result-accuracy]'),
        resultErrors: root.querySelector('[data-result-errors]'), resultBest: root.querySelector('[data-result-best]'),
        resultRetry: root.querySelector('[data-result-retry]'), resultNext: root.querySelector('[data-result-next]'),
        resultClose: root.querySelector('[data-result-close]'), sessions: root.querySelector('[data-progress-sessions]'),
        best: root.querySelector('[data-progress-best]'), streak: root.querySelector('[data-progress-streak]'),
        course: root.querySelector('[data-progress-course]'), live: root.querySelector('[data-practice-live]')
    };

    var coarseTouch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0);
    var state = { mode:'lesson', lessonId:LESSONS[0].id, duration:60, inputMode:coarseTouch ? 'native' : 'phonetic', shift:false,
        target:'', typed:'', startedAt:0, endedAt:0, timer:0, errorsMade:0, composing:false, complete:false };

    function track(name, detail) {
        if (window.WriteUrduTelemetry && typeof window.WriteUrduTelemetry.track === 'function') {
            window.WriteUrduTelemetry.track(name, detail || {});
        }
    }

    function notify(message) {
        if (dom.live) dom.live.textContent = message;
    }

    function lessonById(id) {
        return LESSONS.find(function (lesson) { return lesson.id === id; }) || LESSONS[0];
    }

    function loadProgress() {
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (parsed && parsed.version === 1) return parsed;
        } catch (error) { }
        return { version:1, totalSessions:0, completedLessons:[], sessions:[] };
    }

    function saveProgress(progress) {
        progress.sessions = (progress.sessions || []).slice(-40);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (error) { }
    }

    function dateKey(value) {
        var date = value ? new Date(value) : new Date();
        return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
    }

    function streakCount(progress) {
        var days = Array.from(new Set((progress.sessions || []).map(function (s) { return s.day || dateKey(s.at); }))).sort().reverse();
        if (!days.length) return 0;
        var cursor = new Date();
        var today = dateKey(cursor);
        cursor.setDate(cursor.getDate()-1);
        var yesterday = dateKey(cursor);
        if (days[0] !== today && days[0] !== yesterday) return 0;
        cursor = new Date(days[0] + 'T12:00:00');
        var count = 0;
        for (var i=0; i<days.length; i+=1) {
            if (days[i] !== dateKey(cursor)) break;
            count += 1;
            cursor.setDate(cursor.getDate()-1);
        }
        return count;
    }

    function bestFor(progress, predicate) {
        return (progress.sessions || []).filter(predicate).reduce(function (best, item) {
            return !best || Number(item.wpm) > Number(best.wpm) ? item : best;
        }, null);
    }

    function renderProgress(progress) {
        var best = bestFor(progress, function () { return true; });
        dom.sessions.textContent = String(progress.totalSessions || 0);
        dom.best.textContent = (best ? best.wpm : 0) + ' WPM';
        var streak = streakCount(progress);
        dom.streak.textContent = streak + (streak === 1 ? ' day' : ' days');
        dom.course.textContent = Math.round(((progress.completedLessons || []).length / LESSONS.length) * 100) + '%';
    }

    function renderLessonList(progress) {
        dom.lessonList.replaceChildren();
        ['Foundation','Words','Sentences','Speed'].forEach(function (group) {
            var section = document.createElement('section'); section.className = 'lesson-group';
            var h = document.createElement('h3'); h.textContent = group; section.appendChild(h);
            LESSONS.filter(function (l) { return l.group === group; }).forEach(function (lesson) {
                var button = document.createElement('button'); button.type='button'; button.className='lesson-card';
                if (lesson.id === state.lessonId) button.classList.add('is-active');
                button.setAttribute('data-lesson-id', lesson.id);
                var n = document.createElement('span'); n.className='lesson-number'; n.textContent=String(lesson.number).padStart(2,'0');
                var copy = document.createElement('span'); copy.className='lesson-copy';
                var strong = document.createElement('strong'); strong.textContent=lesson.title;
                var urdu = document.createElement('span'); urdu.lang='ur'; urdu.dir='rtl'; urdu.textContent=lesson.urdu;
                copy.append(strong, urdu);
                var status = document.createElement('span'); status.className='lesson-status';
                var best = bestFor(progress, function (s) { return s.mode === 'lesson' && s.lessonId === lesson.id; });
                status.textContent = best ? best.wpm + ' WPM' : ((progress.completedLessons || []).indexOf(lesson.id) >= 0 ? 'Done' : 'Practice');
                button.append(n,copy,status);
                button.addEventListener('click', function () { selectLesson(lesson.id); });
                section.appendChild(button);
            });
            dom.lessonList.appendChild(section);
        });
    }

    function setTarget() {
        state.target = Core.normalizeText(state.mode === 'lesson' ? lessonById(state.lessonId).target : Core.buildTimedTarget(TEST_SENTENCES, state.duration));
        state.typed = '';
        dom.entry.value = '';
    }

    function elapsedSeconds() {
        if (!state.startedAt) return 0;
        return Math.max(0, ((state.endedAt || Date.now()) - state.startedAt) / 1000);
    }

    function remainingSeconds() {
        return state.mode === 'test' ? Math.max(0, state.duration - elapsedSeconds()) : elapsedSeconds();
    }

    function formatTime(seconds) {
        var total = Math.max(0, Math.ceil(seconds));
        return String(Math.floor(total/60)).padStart(2,'0') + ':' + String(total%60).padStart(2,'0');
    }

    function renderTarget() {
        var target = Core.graphemes(state.target), typed = Core.graphemes(state.typed), length = target.length;
        var start = state.mode === 'test' ? Math.max(0, typed.length - 70) : 0;
        var end = state.mode === 'test' ? Math.min(length, start + 650) : length;
        var fragment = document.createDocumentFragment();
        if (start > 0) { var before=document.createElement('span'); before.className='practice-ellipsis'; before.textContent='… '; fragment.appendChild(before); }
        for (var i=start; i<end; i+=1) {
            var span = document.createElement('span'); span.className='practice-glyph'; span.textContent=target[i];
            if (i < typed.length) span.classList.add(typed[i] === target[i] ? 'is-correct' : 'is-wrong');
            else if (i === typed.length) span.classList.add('is-current');
            fragment.appendChild(span);
        }
        if (end < length) { var after=document.createElement('span'); after.className='practice-ellipsis'; after.textContent=' …'; fragment.appendChild(after); }
        dom.target.replaceChildren(fragment);
    }

    function updateStats() {
        var m = Core.measure(state.target, state.typed, elapsedSeconds());
        dom.wpm.textContent = String(m.wpm); dom.accuracy.textContent = m.accuracy + '%'; dom.errors.textContent = String(state.errorsMade);
        dom.time.textContent = formatTime(remainingSeconds()); dom.progressBar.style.width = m.progress + '%';
        dom.progressTrack.setAttribute('aria-valuenow', String(m.progress)); dom.progressText.textContent = m.progress + '%';
    }

    function updateCopy() {
        if (state.mode === 'lesson') {
            var lesson = lessonById(state.lessonId); dom.title.textContent='Lesson ' + lesson.number + ' · ' + lesson.title; dom.description.textContent=lesson.copy;
        } else {
            dom.title.textContent=(state.duration/60) + '-minute typing test'; dom.description.textContent='Type as much of the passage as you can before the timer ends.';
        }
    }

    function renderInputMode() {
        dom.inputModeButtons.forEach(function (button) {
            var active = button.getAttribute('data-input-mode') === state.inputMode; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active ? 'true':'false');
        });
        dom.keyboard.hidden = state.inputMode !== 'phonetic';
        dom.entry.setAttribute('inputmode', state.inputMode === 'native' ? 'text' : 'none');
        dom.entry.placeholder = state.inputMode === 'phonetic' ? 'Start typing with English keys…' : 'اپنے اردو کی بورڈ سے یہاں ٹائپ کریں';
        dom.keyboardHint.textContent = state.inputMode === 'phonetic' ? 'English keys follow the CRULP-style phonetic layout shown below.' : 'Use the Urdu keyboard already installed on your phone or computer.';
    }

    function renderKeyboard() {
        dom.keyboardRows.replaceChildren();
        KEYBOARD_ROWS.forEach(function (row) {
            var rowNode=document.createElement('div'); rowNode.className='phonetic-keyboard-row';
            row.forEach(function (key) {
                var lookup=key;
                if (state.shift) lookup = key === ',' ? '<' : key === '.' ? '>' : key === '/' ? '?' : key.toUpperCase();
                var urdu = state.shift ? Core.SHIFT_MAP[lookup] : Core.BASE_MAP[key];
                var button=document.createElement('button'); button.type='button'; button.className='phonetic-key'; button.disabled=!urdu;
                var latin=document.createElement('span'); latin.className='phonetic-key-latin'; latin.textContent=state.shift ? lookup : key.toUpperCase();
                var glyph=document.createElement('span'); glyph.className='phonetic-key-urdu'; glyph.lang='ur'; glyph.dir='rtl'; glyph.textContent=urdu || '—';
                button.append(latin,glyph); if (urdu) button.addEventListener('click', function () { insertText(urdu); }); rowNode.appendChild(button);
            });
            dom.keyboardRows.appendChild(rowNode);
        });
        dom.shift.classList.toggle('is-active', state.shift); dom.shift.setAttribute('aria-pressed', state.shift ? 'true':'false');
    }

    function countNewErrors(previous, next) {
        var before=Core.graphemes(previous), after=Core.graphemes(next), target=Core.graphemes(state.target), count=0;
        if (after.length <= before.length) return 0;
        for (var i=before.length; i<after.length; i+=1) if (i >= target.length || after[i] !== target[i]) count += 1;
        return count;
    }

    function startIfNeeded() {
        if (state.startedAt || !Core.graphemes(state.typed).length) return;
        state.startedAt=Date.now(); root.setAttribute('data-session-state','running');
        track('typing_practice_started',{ format:state.mode, input_mode:state.inputMode });
        state.timer=window.setInterval(function () {
            if (state.mode === 'test' && elapsedSeconds() >= state.duration) finishSession(); else updateStats();
        },250);
    }

    function acceptValue(value) {
        if (state.complete) return;
        var normalized=Core.normalizeText(value).replace(/[\r\n\t]+/g,' ');
        state.errorsMade += countNewErrors(state.typed, normalized); state.typed=normalized; dom.entry.value=normalized;
        startIfNeeded(); renderTarget(); updateStats();
        if (state.mode === 'lesson' && Core.graphemes(state.typed).length >= Core.graphemes(state.target).length) finishSession();
    }

    function insertText(text) {
        if (state.complete || !text) return;
        acceptValue(state.typed + text); dom.entry.focus();
    }

    function backspace() {
        var parts=Core.graphemes(state.typed); parts.pop(); state.typed=parts.join(''); dom.entry.value=state.typed; renderTarget(); updateStats();
    }

    function onKeydown(event) {
        if (state.inputMode !== 'phonetic' || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === 'Backspace') { event.preventDefault(); backspace(); return; }
        if (event.key === 'Tab' || event.key === 'Escape' || event.key.indexOf('Arrow') === 0) return;
        var mapped=Core.mapKey(event.key);
        if (!mapped && URDU_PATTERN.test(event.key)) mapped=event.key;
        if (!mapped) { if (event.key.length === 1 || event.key === 'Enter') event.preventDefault(); return; }
        event.preventDefault(); insertText(mapped);
    }

    function onInput() {
        if (state.inputMode === 'native' && !state.composing) acceptValue(dom.entry.value);
    }

    function preventPaste(event) {
        event.preventDefault(); notify('Paste is disabled during practice so your score reflects typing only.');
    }

    function bestLabel(progress, session) {
        var best = bestFor(progress, function (s) {
            return session.mode === 'lesson' ? s.mode==='lesson' && s.lessonId===session.lessonId : s.mode==='test' && Number(s.duration)===Number(session.duration);
        });
        return best ? best.wpm + ' WPM' : session.wpm + ' WPM';
    }

    function finishSession() {
        if (state.complete || !state.startedAt) return;
        state.complete=true; state.endedAt=Date.now(); if (state.timer) window.clearInterval(state.timer); state.timer=0;
        var m=Core.measure(state.target,state.typed,elapsedSeconds());
        var progress=loadProgress();
        var session={ at:new Date().toISOString(), day:dateKey(), mode:state.mode, lessonId:state.mode==='lesson'?state.lessonId:null,
            duration:state.mode==='test'?state.duration:null, wpm:m.wpm, accuracy:m.accuracy, errors:state.errorsMade, inputMode:state.inputMode };
        progress.totalSessions=Number(progress.totalSessions||0)+1; progress.sessions=(progress.sessions||[]).concat(session);
        if (state.mode==='lesson' && m.accuracy>=90 && (progress.completedLessons||[]).indexOf(state.lessonId)<0) progress.completedLessons.push(state.lessonId);
        saveProgress(progress);
        dom.resultWpm.textContent=m.wpm + ' WPM'; dom.resultAccuracy.textContent=m.accuracy + '%'; dom.resultErrors.textContent=String(state.errorsMade); dom.resultBest.textContent=bestLabel(progress,session);
        dom.resultTitle.textContent=state.mode==='lesson' ? (m.accuracy>=90 ? 'Lesson complete' : 'Finished — aim for 90% accuracy') : 'Typing test complete';
        dom.resultNext.hidden=state.mode!=='lesson' || lessonById(state.lessonId).number===LESSONS.length;
        dom.result.hidden=false; root.setAttribute('data-session-state','complete'); renderProgress(progress); renderLessonList(progress); updateStats();
        track('typing_practice_completed',{ format:state.mode, input_mode:state.inputMode, success:state.mode==='test'||m.accuracy>=90 });
        notify('Practice complete. ' + m.wpm + ' words per minute with ' + m.accuracy + ' percent accuracy.');
    }

    function resetSession(focus) {
        if (state.timer) window.clearInterval(state.timer); state.timer=0; state.startedAt=0; state.endedAt=0; state.complete=false; state.errorsMade=0;
        setTarget(); dom.result.hidden=true; root.setAttribute('data-session-state','ready'); renderTarget(); updateStats(); updateCopy(); if (focus) dom.entry.focus();
    }

    function selectMode(mode) {
        state.mode=mode==='test'?'test':'lesson'; root.setAttribute('data-active-mode',state.mode);
        dom.modeButtons.forEach(function (b) { var active=b.getAttribute('data-practice-mode')===state.mode; b.classList.toggle('is-active',active); b.setAttribute('aria-selected',active?'true':'false'); });
        dom.lessonPanel.hidden=state.mode!=='lesson'; dom.testPanel.hidden=state.mode!=='test'; resetSession(false); track('typing_practice_mode_selected',{format:state.mode});
    }

    function selectLesson(id) {
        if (!LESSONS.some(function (l) { return l.id===id; })) return; state.lessonId=id; resetSession(true); renderLessonList(loadProgress()); track('typing_practice_lesson_selected',{format:id});
    }

    function selectDuration(seconds) {
        state.duration=[60,120,300].indexOf(seconds)>=0?seconds:60;
        dom.durationButtons.forEach(function (b) { var active=Number(b.getAttribute('data-test-duration'))===state.duration; b.classList.toggle('is-active',active); b.setAttribute('aria-pressed',active?'true':'false'); });
        resetSession(true); track('typing_practice_duration_selected',{format:String(state.duration)+'s'});
    }

    function selectInputMode(mode) {
        state.inputMode=mode==='native'?'native':'phonetic'; renderInputMode(); resetSession(false); track('typing_practice_input_mode_selected',{input_mode:state.inputMode});
    }

    function nextLesson() {
        var index=LESSONS.findIndex(function (l) { return l.id===state.lessonId; }); if (index>=0 && index<LESSONS.length-1) selectLesson(LESSONS[index+1].id);
    }

    dom.modeButtons.forEach(function (b) { b.addEventListener('click',function () { selectMode(b.getAttribute('data-practice-mode')); }); });
    dom.durationButtons.forEach(function (b) { b.addEventListener('click',function () { selectDuration(Number(b.getAttribute('data-test-duration'))); }); });
    dom.inputModeButtons.forEach(function (b) { b.addEventListener('click',function () { selectInputMode(b.getAttribute('data-input-mode')); }); });
    dom.entry.addEventListener('keydown',onKeydown); dom.entry.addEventListener('input',onInput); dom.entry.addEventListener('paste',preventPaste); dom.entry.addEventListener('drop',preventPaste);
    dom.entry.addEventListener('compositionstart',function () { state.composing=true; }); dom.entry.addEventListener('compositionend',function () { state.composing=false; if (state.inputMode==='native') acceptValue(dom.entry.value); });
    dom.restart.addEventListener('click',function () { track('typing_practice_restarted',{format:state.mode}); resetSession(true); });
    dom.shift.addEventListener('click',function () { state.shift=!state.shift; renderKeyboard(); });
    dom.resultRetry.addEventListener('click',function () { track('typing_practice_restarted',{format:state.mode}); resetSession(true); });
    dom.resultNext.addEventListener('click',nextLesson); dom.resultClose.addEventListener('click',function () { dom.result.hidden=true; dom.entry.focus(); });

    var progress=loadProgress();
    renderLessonList(progress); renderProgress(progress); renderInputMode(); setTarget(); renderKeyboard(); renderTarget(); updateStats(); updateCopy();
}());
