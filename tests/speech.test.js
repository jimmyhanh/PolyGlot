import test from 'node:test';
import assert from 'node:assert/strict';
import { ContinuousSpeech } from '../js/ContinuousSpeech.js';
function fixture(initial = '') {
    const sessions = [],
        tasks = new Map(),
        errors = [],
        states = [];
    let text = initial,
        next = 0;
    class Recognition {
        constructor() {
            sessions.push(this);
        }
        start() {
            this.started = true;
        }
        abort() {
            this.aborted = true;
            this.onend?.();
        }
        result(words, resultIndex = 0) {
            this.onresult({
                resultIndex,
                results: words.map(word => Object.assign([{ transcript: word }], { isFinal: true }))
            });
        }
    }
    const speech = new ContinuousSpeech({
        Recognition,
        getText: () => text,
        setText: value => {
            text = value;
        },
        onState: value => states.push(value),
        onError: value => errors.push(value),
        schedule: callback => {
            tasks.set(++next, callback);
            return next;
        },
        unschedule: id => tasks.delete(id)
    });
    return {
        speech,
        sessions,
        tasks,
        errors,
        states,
        text: () => text,
        flush: () => {
            for (const [id, callback] of tasks) {
                tasks.delete(id);
                callback();
            }
        }
    };
}
test('speech appends final sentences without duplicating cumulative results', () => {
    const f = fixture('Existing text.');
    f.speech.start('en-US');
    const session = f.sessions[0];
    assert.equal(session.continuous, true);
    session.result(['First sentence.']);
    session.result(['First sentence.', 'Second sentence.'], 1);
    session.result(['First sentence.', 'Second sentence.']);
    assert.equal(f.text(), 'Existing text. First sentence. Second sentence.');
    assert.equal(f.speech.active, true);
});
test('silence and browser session endings restart with the selected language', () => {
    const f = fixture();
    f.speech.start('vi-VN');
    f.sessions[0].onerror({ error: 'no-speech' });
    f.sessions[0].onend();
    assert.equal(f.speech.active, true);
    f.flush();
    assert.equal(f.sessions.length, 2);
    assert.equal(f.sessions[1].lang, 'vi-VN');
    f.sessions[1].result(['Xin chào.']);
    assert.equal(f.text(), 'Xin chào.');
});
test('Stop during a restart gap prevents automatic reopening', () => {
    const f = fixture();
    f.speech.start('en-US');
    f.sessions[0].onend();
    f.speech.stop();
    f.flush();
    assert.equal(f.sessions.length, 1);
    assert.equal(f.speech.active, false);
});
test('Stop during startup ignores late results and old session endings', () => {
    const f = fixture();
    f.speech.start('en-US');
    const old = f.sessions[0];
    f.speech.stop();
    f.speech.start('de-DE');
    old.result(['Late text']);
    old.onend();
    assert.equal(f.text(), '');
    assert.equal(f.tasks.size, 0);
    assert.equal(f.speech.active, true);
    f.sessions[1].result(['Hallo']);
    assert.equal(f.text(), 'Hallo');
});
test('permission and network failures stop without a retry loop', () => {
    for (const code of ['not-allowed', 'audio-capture', 'network', 'service-not-allowed']) {
        const f = fixture();
        f.speech.start('en-US');
        f.sessions[0].onerror({ error: code });
        f.flush();
        assert.equal(f.speech.active, false);
        assert.equal(f.sessions.length, 1);
        assert.equal(f.errors.length, 1);
    }
});
test('text limit preserves text, stops capture and reports the limit', () => {
    const f = fixture('x'.repeat(3998));
    f.speech.start('en-US');
    f.sessions[0].result(['hello']);
    assert.equal(f.text().length, 4000);
    assert.equal(f.speech.active, false);
    assert.match(f.errors[0], /limit/);
    f.speech.start('en-US');
    assert.equal(f.sessions.length, 1);
});
test('start failure restores stopped state', () => {
    const errors = [];
    const speech = new ContinuousSpeech({
        Recognition: class {
            start() {
                throw new Error('blocked');
            }
            abort() {}
        },
        getText: () => '',
        setText: () => {},
        onState: () => {},
        onError: e => errors.push(e)
    });
    speech.start('en-US');
    assert.equal(speech.active, false);
    assert.equal(errors.length, 1);
});
