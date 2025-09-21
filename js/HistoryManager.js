// HistoryManager.js - Manages translation history

export class HistoryManager {
    constructor(languageNames) {
        this.translationHistory = JSON.parse(localStorage.getItem('translation-history')) || [];
        this.languageNames = languageNames;
        this.maxHistoryItems = 20;
    }

    addToHistory(sourceText, translation, sourceLang, targetLang) {
        const historyItem = {
            id: Date.now(),
            sourceText: sourceText.substring(0, 100),
            translation: translation.substring(0, 100),
            fullSourceText: sourceText,
            fullTranslation: translation,
            sourceLang: this.languageNames[sourceLang] || sourceLang,
            targetLang: this.languageNames[targetLang] || targetLang,
            timestamp: new Date().toLocaleString()
        };

        this.translationHistory.unshift(historyItem);
        
        // Keep only last 20 translations
        if (this.translationHistory.length > this.maxHistoryItems) {
            this.translationHistory = this.translationHistory.slice(0, this.maxHistoryItems);
        }

        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('translation-history', JSON.stringify(this.translationHistory));
    }

    loadHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const historyContainer = document.getElementById('translation-history');
        
        if (this.translationHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">No translations yet</p>';
            return;
        }

        historyContainer.innerHTML = this.translationHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-source">${item.sourceLang}: ${item.sourceText}${item.sourceText.length === 100 ? '...' : ''}</div>
                <div class="history-target">${item.targetLang}: ${item.translation}${item.translation.length === 100 ? '...' : ''}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');

        // Add click event listeners to history items
        historyContainer.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                this.loadHistoryItem(id);
            });
        });
    }

    loadHistoryItem(id) {
        const item = this.translationHistory.find(h => h.id == id);
        if (item) {
            document.getElementById('source-text').value = item.fullSourceText;
            document.getElementById('target-text').value = item.fullTranslation;
            
            // Dispatch event for other modules to update
            const event = new CustomEvent('historyItemLoaded', {
                detail: { item }
            });
            document.dispatchEvent(event);
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the translation history?')) {
            this.translationHistory = [];
            localStorage.removeItem('translation-history');
            this.renderHistory();
            return true;
        }
        return false;
    }

    getHistory() {
        return this.translationHistory;
    }

    getHistoryItem(id) {
        return this.translationHistory.find(h => h.id == id);
    }
}