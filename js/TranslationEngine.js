// TranslationEngine.js - Core translation logic and language management

export class TranslationEngine {
    constructor(apiManager, notificationCallback) {
        this.apiManager = apiManager;
        this.showNotification = notificationCallback;
        this.currentLanguages = {
            source: 'auto',
            target: 'en'
        };
        
        this.languageNames = {
            'auto': 'Auto Detect',
            'en': 'English',
            'vi': 'Vietnamese',
            'ja': 'Japanese',
            'de': 'German',
            'zh': 'Chinese'
        };

        this.debounceTimer = null;
        this.liveTranslateEnabled = false;
    }

    getCurrentLanguages() {
        return this.currentLanguages;
    }

    setLanguages(source, target) {
        this.currentLanguages.source = source;
        this.currentLanguages.target = target;
    }

    getLanguageNames() {
        return this.languageNames;
    }

    setLiveTranslate(enabled) {
        this.liveTranslateEnabled = enabled;
    }

    async translateText() {
        const sourceText = document.getElementById('source-text').value.trim();
        const targetTextArea = document.getElementById('target-text');
        
        if (!sourceText) {
            this.showNotification('Please enter text to translate', 'warning');
            return null;
        }

        if (!this.apiManager.hasApiKey()) {
            this.showNotification('Please set your OpenAI API key first', 'error');
            return null;
        }

        this.showLoading(true);
        this.updateTranslationStatus('Translating...');

        try {
            const translation = await this.apiManager.translateText(
                sourceText,
                this.currentLanguages.source,
                this.currentLanguages.target,
                this.languageNames
            );
            
            targetTextArea.value = translation;
            this.updateCharacterCounts();
            this.updateTranslationStatus('Translation completed');
            
            // Auto-detect source language if needed
            if (this.currentLanguages.source === 'auto') {
                this.detectLanguage(sourceText);
            }

            // Dispatch translation complete event
            const event = new CustomEvent('translationComplete', {
                detail: {
                    sourceText,
                    translation,
                    sourceLanguage: this.currentLanguages.source,
                    targetLanguage: this.currentLanguages.target
                }
            });
            document.dispatchEvent(event);

            return translation;

        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification(`Translation failed: ${error.message}`, 'error');
            this.updateTranslationStatus('Translation failed');
            targetTextArea.value = '';
            return null;
        } finally {
            this.showLoading(false);
        }
    }

    async detectLanguage(text) {
        try {
            const detectedLanguage = await this.apiManager.detectLanguage(text);
            document.getElementById('detected-language').textContent = `Detected: ${detectedLanguage}`;
        } catch (error) {
            console.error('Language detection error:', error);
        }
    }

    debounceTranslate() {
        if (!this.liveTranslateEnabled) return;
        
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.translateText();
        }, 1000);
    }

    swapLanguages() {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');
        const sourceText = document.getElementById('source-text');
        const targetText = document.getElementById('target-text');

        // Don't swap if source is auto-detect
        if (sourceSelect.value === 'auto') {
            this.showNotification('Cannot swap when auto-detect is enabled', 'warning');
            return;
        }

        // Swap language selections
        const tempLang = sourceSelect.value;
        sourceSelect.value = targetSelect.value;
        targetSelect.value = tempLang;

        // Swap text content
        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        // Update current languages
        this.currentLanguages.source = sourceSelect.value;
        this.currentLanguages.target = targetSelect.value;

        this.updateCharacterCounts();
        
        // Auto-translate if live translation is enabled and there's text
        if (this.liveTranslateEnabled && sourceText.value.trim()) {
            this.translateText();
        }
    }

    clearText() {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
        document.getElementById('detected-language').textContent = '';
        this.updateCharacterCounts();
        this.updateTranslationStatus('');
        document.getElementById('source-text').focus();
    }

    updateCharacterCounts() {
        const sourceText = document.getElementById('source-text').value;
        const targetText = document.getElementById('target-text').value;
        
        document.getElementById('source-char-count').textContent = `${sourceText.length} characters`;
        document.getElementById('target-char-count').textContent = `${targetText.length} characters`;
    }

    updateTranslationStatus(status) {
        document.getElementById('translation-status').textContent = status;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}