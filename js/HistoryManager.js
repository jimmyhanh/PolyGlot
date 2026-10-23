const KEY = 'polyglot-history-v2';
export class HistoryManager {
    constructor(storage) {
        this.storage = storage;
        this.items = [];
        this.persist = false;
        try {
            this.persist = storage.getItem('polyglot-remember') === 'true';
            const stored = this.persist ? JSON.parse(storage.getItem(KEY) || '[]') : [];
            if (Array.isArray(stored))
                this.items = stored
                    .filter(
                        x =>
                            x &&
                            typeof x.text === 'string' &&
                            typeof x.translation === 'string' &&
                            typeof x.source === 'string' &&
                            typeof x.target === 'string'
                    )
                    .slice(0, 20);
        } catch {
            this.items = [];
        }
    }
    remember(enabled) {
        this.persist = enabled;
        try {
            this.storage.setItem('polyglot-remember', String(enabled));
            if (!enabled) this.storage.removeItem(KEY);
        } catch {
            return false;
        }
        return this.save();
    }
    add(item) {
        this.items.unshift(item);
        this.items = this.items.slice(0, 20);
        return this.save();
    }
    save() {
        try {
            if (this.persist) this.storage.setItem(KEY, JSON.stringify(this.items));
            return true;
        } catch {
            return false;
        }
    }
    clear() {
        this.items = [];
        try {
            this.storage.removeItem(KEY);
            return true;
        } catch {
            return false;
        }
    }
}
