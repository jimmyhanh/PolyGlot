// EventManager.js - Handles all event listeners and keyboard shortcuts

export class EventManager {
    constructor(modules) {
        this.modules = modules;
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupCustomEventListeners();
    }

    setupEventListeners() {
        // API Key management
        const saveKeyBtn = document.getElementById('save-key');
        const apiKeyInput = document.getElementById('api-key');
        
        if (saveKeyBtn) {
            saveKeyBtn.addEventListener('click', () => this.handleSaveApiKey());
        }
        
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSaveApiKey();
            });
        }

        // Translation controls
        const translateBtn = document.getElementById('translate-btn');
        const clearBtn = document.getElementById('clear-btn');
        const swapBtn = document.getElementById('swap-languages');
        
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.handleTranslate());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClear());
        }
        
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.handleSwapLanguages());
        }

        // Voice controls
        const voiceBtn = document.getElementById('voice-input');
        const playSourceBtn = document.getElementById('play-source');
        const playTargetBtn = document.getElementById('play-target');
        const copyBtn = document.getElementById('copy-translation');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.handleVoiceInput());
        }
        
        if (playSourceBtn) {
            playSourceBtn.addEventListener('click', () => this.handlePlayText('source'));
        }
        
        if (playTargetBtn) {
            playTargetBtn.addEventListener('click', () => this.handlePlayText('target'));
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopyTranslation());
        }

        // Text area events
        const sourceTextArea = document.getElementById('source-text');
        if (sourceTextArea) {
            sourceTextArea.addEventListener('input', () => this.handleSourceTextInput());
        }

        // Language selection
        const sourceLanguageSelect = document.getElementById('source-language');
        const targetLanguageSelect = document.getElementById('target-language');
        
        if (sourceLanguageSelect) {
            sourceLanguageSelect.addEventListener('change', (e) => {
                this.handleLanguageChange('source', e.target.value);
            });
        }
        
        if (targetLanguageSelect) {
            targetLanguageSelect.addEventListener('change', (e) => {
                this.handleLanguageChange('target', e.target.value);
            });
        }

        // Live translation toggle
        const liveTranslateToggle = document.getElementById('live-translate');
        if (liveTranslateToggle) {
            liveTranslateToggle.addEventListener('change', (e) => {
                this.handleLiveTranslateToggle(e.target.checked);
            });
        }

        // History management
        const clearHistoryBtn = document.getElementById('clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.handleTranslate();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.handleClear();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.handleVoiceInput();
                        break;
                }
            }
        });
    }

    setupCustomEventListeners() {
        // Listen for voice input completion
        document.addEventListener('voiceInputComplete', (e) => {
            this.modules.ui.updateCharacterCounts();
            if (this.modules.ui.getLiveTranslateState()) {
                this.modules.translationEngine.debounceTranslate();
            }
        });

        // Listen for translation completion
        document.addEventListener('translationComplete', (e) => {
            const { sourceText, translation, sourceLanguage, targetLanguage } = e.detail;
            this.modules.historyManager.addToHistory(
                sourceText, 
                translation, 
                sourceLanguage, 
                targetLanguage
            );
        });

        // Listen for history item loading
        document.addEventListener('historyItemLoaded', (e) => {
            this.modules.ui.updateCharacterCounts();
        });
    }

    // Event handlers
    handleSaveApiKey() {
        const apiKey = this.modules.ui.getApiKeyFromInput();
        try {
            this.modules.apiManager.saveApiKey(apiKey);
            this.modules.ui.showToast('API key saved successfully', 'success');
        } catch (error) {
            this.modules.ui.showToast(error.message, 'error');
        }
    }

    handleTranslate() {
        this.modules.translationEngine.translateText();
    }

    handleClear() {
        this.modules.translationEngine.clearText();
    }

    handleSwapLanguages() {
        this.modules.translationEngine.swapLanguages();
    }

    handleVoiceInput() {
        const languages = this.modules.ui.getLanguageSelections();
        this.modules.voiceController.toggleVoiceInput(languages.source);
    }

    async handlePlayText(type) {
        const text = type === 'source' ? this.modules.ui.getSourceText() : this.modules.ui.getTargetText();
        const languages = this.modules.ui.getLanguageSelections();
        const language = type === 'source' ? languages.source : languages.target;
        const buttonId = type === 'source' ? 'play-source' : 'play-target';
        
        if (!text) {
            this.modules.ui.showToast(`No ${type} text to play`, 'warning');
            return;
        }

        try {
            this.modules.ui.updatePlayButtonIcon(buttonId, true);
            await this.modules.voiceController.playText(text, language);
        } catch (error) {
            this.modules.ui.showToast('Speech synthesis failed', 'error');
        } finally {
            this.modules.ui.updatePlayButtonIcon(buttonId, false);
        }
    }

    handleCopyTranslation() {
        const targetText = this.modules.ui.getTargetText();
        this.modules.ui.copyToClipboard(targetText);
    }

    handleSourceTextInput() {
        this.modules.ui.updateCharacterCounts();
        if (this.modules.ui.getLiveTranslateState()) {
            this.modules.translationEngine.debounceTranslate();
        }
    }

    handleLanguageChange(type, value) {
        const currentLanguages = this.modules.translationEngine.getCurrentLanguages();
        
        if (type === 'source') {
            this.modules.translationEngine.setLanguages(value, currentLanguages.target);
        } else {
            this.modules.translationEngine.setLanguages(currentLanguages.source, value);
        }

        if (this.modules.ui.getLiveTranslateState() && this.modules.ui.getSourceText()) {
            this.modules.translationEngine.translateText();
        }
    }

    handleLiveTranslateToggle(enabled) {
        this.modules.translationEngine.setLiveTranslate(enabled);
        if (enabled && this.modules.ui.getSourceText()) {
            this.modules.translationEngine.translateText();
        }
    }

    handleClearHistory() {
        const cleared = this.modules.historyManager.clearHistory();
        if (cleared) {
            this.modules.ui.showToast('History cleared', 'success');
        }
    }
}