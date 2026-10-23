import { DEFAULT_MODEL, requestBody, parseCompletion, providerError } from './prompts.js?v=2';
export class ApiManager {
    constructor() {
        this.key = '';
        this.token = '';
        this.server = false;
        this.model = DEFAULT_MODEL;
    }
    async connect() {
        // Remove the older app's persistent secret without reading or transmitting it.
        try {
            localStorage.removeItem('openai-api-key');
        } catch {
            /* Storage may be unavailable. */
        }
        try {
            const response = await fetch('./api/health', {
                signal: AbortSignal.timeout(4000),
                cache: 'no-store'
            });
            if (!response.ok) throw new Error('Static host');
            const data = await response.json();
            if (typeof data.configured !== 'boolean') throw new Error('Static host');
            this.server = true;
            this.model = data.model;
            return data;
        } catch {
            return null;
        }
    }
    async translate(input, signal) {
        if (!this.server && !this.key)
            throw new Error(
                'Open Connection settings and enter a personal API key, or run the local server.'
            );
        const response = await fetch(
            this.server ? './api/translate' : 'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.server
                        ? this.token
                            ? { Authorization: `Bearer ${this.token}` }
                            : {}
                        : { Authorization: `Bearer ${this.key}` })
                },
                body: JSON.stringify(this.server ? input : requestBody(input, this.model))
            }
        );
        if (!response.ok) {
            if (this.server) {
                const data = await response.json();
                throw new Error(data.error || 'Server request failed.');
            }
            throw new Error(providerError(response.status));
        }
        const data = await response.json();
        return this.server ? data : { ...parseCompletion(data), model: this.model };
    }
}
