import { ContinuousSpeech } from './js/ContinuousSpeech.js?v=3';
import { ApiManager } from './js/ApiManager.js?v=2';
import { TranslationEngine } from './js/TranslationEngine.js?v=2';
import { HistoryManager } from './js/HistoryManager.js?v=2';
import { LANGUAGES, PATTERNS } from './js/prompts.js?v=2';
const $ = id => document.getElementById(id);
const api = new ApiManager();
const engine = new TranslationEngine(api);
let storage;
try {
    storage = localStorage;
} catch {
    storage = null;
}
const history = new HistoryManager(storage);
let timer,
    last = null,
    busy = false;
const status = text => {
    $('translation-status').textContent = text;
};
const error = text => {
    $('error').textContent = text;
    $('error').hidden = !text;
};
for (const id of ['source-language', 'target-language']) {
    for (const [code, name] of Object.entries(LANGUAGES)) {
        if (id === 'target-language' && code === 'auto') continue;
        $(id).add(new Option(name, code));
    }
}
$('target-language').value = 'vi';
function input() {
    return {
        text: $('source-text').value,
        source: $('source-language').value,
        target: $('target-language').value,
        tone: $('tone').value,
        context: $('context').value
    };
}
function controls() {
    $('translate-btn').disabled = busy || !$('source-text').value.trim();
    $('refine-btn').disabled = busy || !last;
    $('copy-translation').disabled = busy || !last;
    $('play-target').disabled = busy || !last || !window.speechSynthesis;
    $('source-char-count').textContent =
        `${$('source-text').value.length.toLocaleString()} / 4,000`;
    $('target-text').setAttribute('aria-busy', String(busy));
}
function invalidate() {
    clearTimeout(timer);
    engine.cancel();
    busy = false;
    last = null;
    window.speechSynthesis?.cancel();
    $('target-text').value = '';
    $('notes-panel').hidden = true;
    $('detected-language').textContent = '';
    $('result-meta').textContent = 'Ready when you are';
    error('');
    controls();
}
function changed() {
    invalidate();
    status('Input changed. Translate when ready.');
    if ($('live-translate').checked && $('source-text').value.trim())
        timer = setTimeout(() => translate(), 1000);
}
function renderResult(result, request, previous = '') {
    last = { ...request, ...result };
    $('target-text').value = result.translation;
    $('target-text').lang = request.target;
    $('detected-language').textContent =
        `Detected: ${LANGUAGES[result.detectedLanguage] || result.detectedLanguage}`;
    $('result-meta').textContent = `AI · ${result.model || api.model}`;
    $('notes').textContent = result.notes || 'No additional notes.';
    $('notes-panel').hidden = false;
    $('comparison').hidden = !previous;
    $('previous-draft').textContent = previous;
    $('patterns-used').textContent =
        `Applied: ${[...PATTERNS, ...(previous ? ['Iterative refinement'] : [])].join(' · ')}`;
}
async function translate(refine = false) {
    clearTimeout(timer);
    const request = input();
    if (!request.text.trim()) return;
    const previous = refine && last ? last.translation : '';
    busy = true;
    controls();
    error('');
    status(refine ? 'Reviewing the previous draft…' : 'Translating…');
    const started = performance.now();
    try {
        const result = await engine.run({ ...request, previous });
        if (!result) return;
        renderResult(result, request, previous);
        busy = false;
        controls();
        status(
            `${refine ? 'Refinement' : 'Translation'} complete · ${((performance.now() - started) / 1000).toFixed(1)}s`
        );
        if (!history.add({ ...last, time: new Date().toISOString() }))
            error('Translation complete, but history could not be saved on this device.');
        renderHistory();
    } catch (err) {
        busy = false;
        controls();
        error(err.name === 'TimeoutError' ? 'Request timed out. Please retry.' : err.message);
        status('Request failed. Check the message and retry.');
    }
}
function renderHistory() {
    const container = $('translation-history');
    container.replaceChildren();
    if (!history.items.length) {
        const p = document.createElement('p');
        p.className = 'small';
        p.textContent = 'Your translations will appear here.';
        container.append(p);
    }
    for (const item of history.items) {
        const button = document.createElement('button');
        button.className = 'history-item';
        button.textContent = `${LANGUAGES[item.source] || item.source} → ${LANGUAGES[item.target] || item.target}: ${item.text.slice(0, 100)}`;
        const preview = document.createElement('span');
        preview.textContent = item.translation.slice(0, 120);
        button.append(preview);
        button.addEventListener('click', () => {
            speech?.stop();
            invalidate();
            $('source-text').value = item.text;
            $('source-language').value = item.source;
            $('target-language').value = item.target;
            $('tone').value = item.tone || 'natural';
            $('context').value = item.context || 'general';
            renderResult(item, item);
            controls();
            status('Loaded a previous translation.');
        });
        container.append(button);
    }
}
$('translate-btn').onclick = () => translate();
$('refine-btn').onclick = () => translate(true);
$('source-text').addEventListener('input', changed);
for (const id of ['source-language', 'target-language', 'tone', 'context'])
    $(id).addEventListener('change', changed);
$('live-translate').onchange = () => {
    clearTimeout(timer);
    if ($('live-translate').checked) changed();
};
$('clear-btn').onclick = () => {
    speech?.stop();
    invalidate();
    $('source-text').value = '';
    controls();
    status('Cleared.');
    $('source-text').focus();
};
$('swap-languages').onclick = () => {
    speech?.stop();
    const from =
        $('source-language').value === 'auto' ? last?.detectedLanguage : $('source-language').value;
    if (!from || from === 'auto' || !Object.hasOwn(LANGUAGES, from) || !last)
        return error('Translate first, or choose a supported source language before swapping.');
    const text = last.translation;
    const to = $('target-language').value;
    invalidate();
    $('source-language').value = to;
    $('target-language').value = from;
    $('source-text').value = text;
    changed();
};
$('copy-translation').onclick = async () => {
    try {
        await navigator.clipboard.writeText($('target-text').value);
        status('Translation copied.');
    } catch {
        error('Clipboard unavailable. Select the translation and copy it manually.');
    }
};
$('save-history').checked = history.persist;
$('save-history').onchange = () => {
    if (!history.remember($('save-history').checked))
        error('Device storage is unavailable. History remains in this page only.');
};
$('clear-history').onclick = () => {
    if (!history.clear())
        error('Could not remove saved history. Clear this site’s data in browser settings.');
    renderHistory();
};
function example(text, target, context, tone) {
    speech?.stop();
    invalidate();
    $('source-text').value = text;
    $('source-language').value = 'en';
    $('target-language').value = target;
    $('context').value = context;
    $('tone').value = tone;
    changed();
    $('source-text').focus();
}
$('example-idiom').onclick = () =>
    example('We need to break the ice before the meeting.', 'vi', 'work', 'natural');
$('example-work').onclick = () =>
    example(
        'Could we move our meeting to Thursday at 2 PM? Please keep the budget at $250.',
        'de',
        'work',
        'formal'
    );
$('connection-form').onsubmit = e => {
    e.preventDefault();
    const credential = $('credential').value.trim();
    if (!credential) return error('Enter a credential first.');
    invalidate();
    if (api.server) api.token = credential;
    else api.key = credential;
    $('credential').value = '';
    $('connection-status').textContent = 'Session credential set · not yet verified';
    status('Ready to translate.');
};
$('forget-key').onclick = () => {
    invalidate();
    api.key = '';
    api.token = '';
    $('credential').value = '';
    $('connection-status').textContent = api.server
        ? 'Server mode · session token cleared'
        : 'Personal key required';
    status('Session credential forgotten.');
};
const locale = {
    en: 'en-US',
    vi: 'vi-VN',
    de: 'de-DE',
    ja: 'ja-JP',
    zh: 'zh-CN',
    fr: 'fr-FR',
    es: 'es-ES',
    ko: 'ko-KR'
};
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let speech = null;
if (Recognition) {
    speech = new ContinuousSpeech({
        Recognition,
        getText: () => $('source-text').value,
        setText: text => {
            $('source-text').value = text;
            changed();
        },
        onState: active => {
            $('voice-input').textContent = active ? 'Stop' : 'Speak';
            $('voice-input').setAttribute('aria-pressed', String(active));
            $('voice-input').title = active ? 'Stop listening' : 'Listen until you press Stop';
            status(active ? 'Listening until you press Stop…' : 'Listening stopped.');
        },
        onError: error
    });
    $('voice-input').onclick = () => {
        if (speech.active) return speech.stop();
        if ($('source-language').value === 'auto')
            return error(
                'Choose the language you will speak first. Auto detect works for typed text.'
            );
        error('');
        window.speechSynthesis?.cancel();
        speech.start(locale[$('source-language').value]);
    };
    window.addEventListener('pagehide', () => speech.stop());
    $('source-language').addEventListener('change', () => speech.stop());
} else {
    $('voice-input').disabled = true;
    $('voice-input').title =
        'Voice recognition unavailable in this browser. Type your text instead.';
}
$('play-target').onclick = () => {
    if (!last || !window.speechSynthesis) return;
    speech?.stop();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(last.translation);
    utterance.lang = locale[last.target];
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith(last.target));
    if (!voice)
        return error(
            'No voice is installed for this language. Add a voice in your device settings.'
        );
    utterance.voice = voice;
    utterance.onerror = () => error('Audio playback failed. Please try again.');
    window.speechSynthesis.speak(utterance);
};
document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!busy) translate();
    }
});
renderHistory();
controls();
const health = await api.connect();
$('connection-status').textContent = health
    ? health.configured
        ? `Server ready · ${health.model}`
        : 'Server needs OPENAI_API_KEY'
    : 'GitHub Pages / static mode · personal key required';
$('connection-help').textContent = health
    ? 'Your OpenAI key stays on the server. If the server requires an access token, enter it below. Restart the server after changing .env.'
    : 'For a personal demo, enter your own OpenAI key. It is sent directly to OpenAI and kept only in page memory until refresh. Browser scripts can access it during use. Recommended for class: run npm start locally with a server-side .env key. Never enter a shared production key here.';
$('credential-label').textContent = health
    ? 'Server access token (if configured)'
    : 'Personal OpenAI API key (memory only)';
if (!health || !health.configured || health.requiresToken) $('connection-panel').open = true;
// Update only this application's legacy worker; do not affect unrelated sites.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .getRegistrations()
        .then(registrations => {
            for (const registration of registrations)
                if (registration.scope === new URL('./', location.href).href)
                    registration.update().catch(() => {});
        })
        .catch(() => {});
}
