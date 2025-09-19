// PolyGlot - Live Translator App
// Main JavaScript functionality

class PolyGlotTranslator {
    constructor() {
        this.apiKey = localStorage.getItem('openai-api-key') || '';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.liveTranslateEnabled = false;
        this.translationHistory = JSON.parse(localStorage.getItem('translation-history')) || [];
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

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadApiKey();
        this.loadTranslationHistory();
        this.updateCharacterCounts();
    }

    setupEventListeners() {
        // API Key management
        document.getElementById('save-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('api-key').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });

        // Translation controls
        document.getElementById('translate-btn').addEventListener('click', () => this.translateText());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearText());
        document.getElementById('swap-languages').addEventListener('click', () => this.swapLanguages());

        // Voice controls
        document.getElementById('voice-input').addEventListener('click', () => this.toggleVoiceInput());
        document.getElementById('play-source').addEventListener('click', () => this.playText('source'));
        document.getElementById('play-target').addEventListener('click', () => this.playText('target'));
        document.getElementById('copy-translation').addEventListener('click', () => this.copyTranslation());

        // Text area events
        document.getElementById('source-text').addEventListener('input', (e) => {
            this.updateCharacterCounts();
            if (this.liveTranslateEnabled) {
                this.debounceTranslate();
            }
        });

        // Language selection
        document.getElementById('source-language').addEventListener('change', (e) => {
            this.currentLanguages.source = e.target.value;
            if (this.liveTranslateEnabled && document.getElementById('source-text').value.trim()) {
                this.translateText();
            }
        });

        document.getElementById('target-language').addEventListener('change', (e) => {
            this.currentLanguages.target = e.target.value;
            if (this.liveTranslateEnabled && document.getElementById('source-text').value.trim()) {
                this.translateText();
            }
        });

        // Live translation toggle
        document.getElementById('live-translate').addEventListener('change', (e) => {
            this.liveTranslateEnabled = e.target.checked;
            if (this.liveTranslateEnabled && document.getElementById('source-text').value.trim()) {
                this.translateText();
            }
        });

        // History management
        document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.translateText();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearText();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleVoiceInput();
                        break;
                }
            }
        });
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButtonState();
                this.showToast('Listening...', 'info');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                const sourceText = document.getElementById('source-text');
                if (finalTranscript) {
                    sourceText.value = finalTranscript;
                    this.updateCharacterCounts();
                    if (this.liveTranslateEnabled) {
                        this.translateText();
                    }
                }
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.updateVoiceButtonState();
                this.showToast(`Voice recognition error: ${event.error}`, 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButtonState();
            };
        } else {
            this.showToast('Speech recognition not supported in this browser', 'warning');
        }
    }

    loadApiKey() {
        if (this.apiKey) {
            document.getElementById('api-key').value = this.apiKey;
        }
    }

    saveApiKey() {
        const apiKeyInput = document.getElementById('api-key');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            this.showToast('Please enter a valid API key', 'error');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('openai-api-key', apiKey);
        this.showToast('API key saved successfully', 'success');
    }

    async translateText() {
        const sourceText = document.getElementById('source-text').value.trim();
        const targetTextArea = document.getElementById('target-text');
        
        if (!sourceText) {
            this.showToast('Please enter text to translate', 'warning');
            return;
        }

        if (!this.apiKey) {
            this.showToast('Please set your OpenAI API key first', 'error');
            return;
        }

        this.showLoading(true);
        this.updateTranslationStatus('Translating...');

        try {
            const sourceLanguage = this.currentLanguages.source;
            const targetLanguage = this.currentLanguages.target;
            
            // Prepare the prompt for OpenAI
            let prompt;
            if (sourceLanguage === 'auto') {
                prompt = `Translate the following text to ${this.languageNames[targetLanguage]}. If the source language is already ${this.languageNames[targetLanguage]}, just return the original text. Only return the translation, nothing else:\n\n${sourceText}`;
            } else {
                prompt = `Translate the following ${this.languageNames[sourceLanguage]} text to ${this.languageNames[targetLanguage]}. Only return the translation, nothing else:\n\n${sourceText}`;
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional translator. Translate the given text accurately while preserving the meaning and tone. Only return the translation without any additional text or explanations.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const translation = data.choices[0].message.content.trim();
            
            targetTextArea.value = translation;
            this.updateCharacterCounts();
            this.updateTranslationStatus('Translation completed');
            
            // Add to history
            this.addToHistory(sourceText, translation, sourceLanguage, targetLanguage);
            
            // Auto-detect source language if needed
            if (sourceLanguage === 'auto') {
                this.detectLanguage(sourceText);
            }

        } catch (error) {
            console.error('Translation error:', error);
            this.showToast(`Translation failed: ${error.message}`, 'error');
            this.updateTranslationStatus('Translation failed');
            targetTextArea.value = '';
        } finally {
            this.showLoading(false);
        }
    }

    async detectLanguage(text) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a language detection expert. Identify the language of the given text and respond with only the language name in English (e.g., "English", "Vietnamese", "Japanese", "German", "Chinese").'
                        },
                        {
                            role: 'user',
                            content: text
                        }
                    ],
                    max_tokens: 10,
                    temperature: 0
                })
            });

            if (response.ok) {
                const data = await response.json();
                const detectedLanguage = data.choices[0].message.content.trim();
                document.getElementById('detected-language').textContent = `Detected: ${detectedLanguage}`;
            }
        } catch (error) {
            console.error('Language detection error:', error);
        }
    }

    debounceTranslate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.translateText();
        }, 1000);
    }

    clearText() {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
        document.getElementById('detected-language').textContent = '';
        this.updateCharacterCounts();
        this.updateTranslationStatus('');
        document.getElementById('source-text').focus();
    }

    swapLanguages() {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');
        const sourceText = document.getElementById('source-text');
        const targetText = document.getElementById('target-text');

        // Don't swap if source is auto-detect
        if (sourceSelect.value === 'auto') {
            this.showToast('Cannot swap when auto-detect is enabled', 'warning');
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

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showToast('Speech recognition not supported', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            // Set recognition language based on source language selection
            const sourceLang = this.currentLanguages.source;
            if (sourceLang !== 'auto') {
                const langMap = {
                    'en': 'en-US',
                    'vi': 'vi-VN',
                    'ja': 'ja-JP',
                    'de': 'de-DE',
                    'zh': 'zh-CN'
                };
                this.recognition.lang = langMap[sourceLang] || 'en-US';
            } else {
                this.recognition.lang = 'en-US';
            }
            
            this.recognition.start();
        }
    }

    updateVoiceButtonState() {
        const voiceButton = document.getElementById('voice-input');
        const icon = voiceButton.querySelector('i');
        
        if (this.isListening) {
            voiceButton.classList.add('recording');
            icon.className = 'fas fa-stop';
            voiceButton.title = 'Stop Recording';
        } else {
            voiceButton.classList.remove('recording');
            icon.className = 'fas fa-microphone';
            voiceButton.title = 'Voice Input';
        }
    }

    playText(type) {
        const textArea = document.getElementById(type === 'source' ? 'source-text' : 'target-text');
        const text = textArea.value.trim();
        
        if (!text) {
            this.showToast(`No ${type} text to play`, 'warning');
            return;
        }

        // Stop any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language for speech synthesis
        const langMap = {
            'en': 'en-US',
            'vi': 'vi-VN',
            'ja': 'ja-JP',
            'de': 'de-DE',
            'zh': 'zh-CN'
        };

        const language = type === 'source' ? this.currentLanguages.source : this.currentLanguages.target;
        if (language !== 'auto') {
            utterance.lang = langMap[language] || 'en-US';
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            const button = document.getElementById(type === 'source' ? 'play-source' : 'play-target');
            button.querySelector('i').className = 'fas fa-pause';
        };

        utterance.onend = () => {
            const button = document.getElementById(type === 'source' ? 'play-source' : 'play-target');
            button.querySelector('i').className = 'fas fa-play';
        };

        utterance.onerror = () => {
            this.showToast('Speech synthesis failed', 'error');
            const button = document.getElementById(type === 'source' ? 'play-source' : 'play-target');
            button.querySelector('i').className = 'fas fa-play';
        };

        this.synthesis.speak(utterance);
    }

    async copyTranslation() {
        const targetText = document.getElementById('target-text').value.trim();
        
        if (!targetText) {
            this.showToast('No translation to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(targetText);
            this.showToast('Translation copied to clipboard', 'success');
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = targetText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Translation copied to clipboard', 'success');
        }
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

    addToHistory(sourceText, translation, sourceLang, targetLang) {
        const historyItem = {
            id: Date.now(),
            sourceText: sourceText.substring(0, 100),
            translation: translation.substring(0, 100),
            sourceLang: this.languageNames[sourceLang],
            targetLang: this.languageNames[targetLang],
            timestamp: new Date().toLocaleString()
        };

        this.translationHistory.unshift(historyItem);
        
        // Keep only last 20 translations
        if (this.translationHistory.length > 20) {
            this.translationHistory = this.translationHistory.slice(0, 20);
        }

        localStorage.setItem('translation-history', JSON.stringify(this.translationHistory));
        this.renderHistory();
    }

    loadTranslationHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const historyContainer = document.getElementById('translation-history');
        
        if (this.translationHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">No translations yet</p>';
            return;
        }

        historyContainer.innerHTML = this.translationHistory.map(item => `
            <div class="history-item" onclick="translator.loadHistoryItem('${item.id}')">
                <div class="history-source">${item.sourceLang}: ${item.sourceText}${item.sourceText.length === 100 ? '...' : ''}</div>
                <div class="history-target">${item.targetLang}: ${item.translation}${item.translation.length === 100 ? '...' : ''}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');
    }

    loadHistoryItem(id) {
        const item = this.translationHistory.find(h => h.id == id);
        if (item) {
            // This would load the full translation, but we'd need to store full text
            this.showToast('History item selected', 'info');
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear the translation history?')) {
            this.translationHistory = [];
            localStorage.removeItem('translation-history');
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize the translator when the page loads
let translator;
document.addEventListener('DOMContentLoaded', () => {
    translator = new PolyGlotTranslator();
});

// Service Worker for offline functionality (basic)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}