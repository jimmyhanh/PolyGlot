// Every input edit invalidates the current generation, even if abort arrives late.
export class TranslationEngine {
    constructor(api) {
        this.api = api;
        this.generation = 0;
        this.controller = null;
    }
    cancel() {
        this.generation++;
        this.controller?.abort();
        this.controller = null;
    }
    async run(input) {
        this.cancel();
        const generation = this.generation;
        this.controller = new AbortController();
        const signal = AbortSignal.any([this.controller.signal, AbortSignal.timeout(50000)]);
        try {
            const result = await this.api.translate(input, signal);
            return generation === this.generation ? result : null;
        } catch (error) {
            if (generation !== this.generation) return null;
            throw error;
        }
    }
}
