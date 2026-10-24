// Keep the user's listening intent separate from each browser recognition session.
export class ContinuousSpeech {
    constructor({
        Recognition,
        getText,
        setText,
        onState,
        onError,
        schedule = setTimeout,
        unschedule = clearTimeout,
        maxLength = 4000
    }) {
        Object.assign(this, {
            Recognition,
            getText,
            setText,
            onState,
            onError,
            schedule,
            unschedule,
            maxLength
        });
        this.active = false;
        this.session = null;
        this.restart = null;
    }
    start(language) {
        if (this.active) return;
        if (this.getText().length >= this.maxLength) {
            this.onError('Text limit reached. Clear or shorten the text before speaking.');
            return;
        }
        this.language = language;
        this.active = true;
        this.onState(true);
        this.openSession();
    }
    stop() {
        this.active = false;
        this.unschedule(this.restart);
        this.restart = null;
        const session = this.session;
        this.session = null; // Ignore results queued after Stop or Clear.
        this.onState(false);
        try {
            session?.abort();
        } catch {
            /* Already disconnected. */
        }
    }
    openSession() {
        if (!this.active) return;
        try {
            const session = new this.Recognition();
            this.session = session;
            session.lang = this.language;
            session.continuous = true;
            session.interimResults = false;
            const committed = new Set();
            session.onresult = event => {
                if (!this.active || this.session !== session) return;
                const parts = [];
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal && !committed.has(i)) {
                        committed.add(i);
                        const text = event.results[i][0].transcript.trim();
                        if (text) parts.push(text);
                    }
                }
                if (!parts.length) return;
                const current = this.getText();
                const joined =
                    current + (current && !/\s$/.test(current) ? ' ' : '') + parts.join(' ');
                this.setText(joined.slice(0, this.maxLength));
                if (joined.length >= this.maxLength) {
                    this.stop();
                    this.onError(
                        'Reached the 4,000-character limit. Listening stopped; translate or clear the text to continue.'
                    );
                }
            };
            session.onend = () => {
                if (this.session !== session) return;
                this.session = null;
                if (this.active)
                    this.restart = this.schedule(() => {
                        this.restart = null;
                        this.openSession();
                    }, 300);
            };
            session.onerror = event => {
                if (this.session !== session || !this.active) return;
                // Silence is normal in an ongoing conversation. Other failures need user action.
                if (event.error === 'no-speech') return;
                this.stop();
                this.onError(
                    `Microphone: ${event.error}. Listening stopped. Check permissions or connection, then press Speak to retry.`
                );
            };
            session.start();
        } catch {
            this.stop();
            this.onError(
                'Could not start the microphone. Check browser permissions and press Speak to retry.'
            );
        }
    }
}
