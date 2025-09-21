// UIController.js - Handles UI interactions and notifications

export class UIController {
    constructor() {
        this.setupToastContainer();
    }

    setupToastContainer() {
        // Ensure toast container exists
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
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

    async copyToClipboard(text) {
        if (!text.trim()) {
            this.showToast('No text to copy', 'warning');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard', 'success');
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard', 'success');
            return true;
        }
    }

    updateApiKeyInput(apiKey) {
        const input = document.getElementById('api-key');
        if (input && apiKey) {
            input.value = apiKey;
        }
    }

    getApiKeyFromInput() {
        const input = document.getElementById('api-key');
        return input ? input.value.trim() : '';
    }

    updateLanguageSelects(sourceLanguage, targetLanguage) {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');
        
        if (sourceSelect) sourceSelect.value = sourceLanguage;
        if (targetSelect) targetSelect.value = targetLanguage;
    }

    getLanguageSelections() {
        const sourceSelect = document.getElementById('source-language');
        const targetSelect = document.getElementById('target-language');
        
        return {
            source: sourceSelect ? sourceSelect.value : 'auto',
            target: targetSelect ? targetSelect.value : 'en'
        };
    }

    getLiveTranslateState() {
        const checkbox = document.getElementById('live-translate');
        return checkbox ? checkbox.checked : false;
    }

    setLiveTranslateState(enabled) {
        const checkbox = document.getElementById('live-translate');
        if (checkbox) {
            checkbox.checked = enabled;
        }
    }

    getSourceText() {
        const textarea = document.getElementById('source-text');
        return textarea ? textarea.value.trim() : '';
    }

    getTargetText() {
        const textarea = document.getElementById('target-text');
        return textarea ? textarea.value.trim() : '';
    }

    setSourceText(text) {
        const textarea = document.getElementById('source-text');
        if (textarea) {
            textarea.value = text;
        }
    }

    setTargetText(text) {
        const textarea = document.getElementById('target-text');
        if (textarea) {
            textarea.value = text;
        }
    }

    focusSourceText() {
        const textarea = document.getElementById('source-text');
        if (textarea) {
            textarea.focus();
        }
    }

    setDetectedLanguage(language) {
        const element = document.getElementById('detected-language');
        if (element) {
            element.textContent = language ? `Detected: ${language}` : '';
        }
    }

    updateCharacterCounts() {
        const sourceText = this.getSourceText();
        const targetText = this.getTargetText();
        
        const sourceCount = document.getElementById('source-char-count');
        const targetCount = document.getElementById('target-char-count');
        
        if (sourceCount) sourceCount.textContent = `${sourceText.length} characters`;
        if (targetCount) targetCount.textContent = `${targetText.length} characters`;
    }

    updateTranslationStatus(status) {
        const element = document.getElementById('translation-status');
        if (element) {
            element.textContent = status;
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            if (show) {
                loading.classList.remove('hidden');
            } else {
                loading.classList.add('hidden');
            }
        }
    }

    // UI state management
    disableTranslateButton() {
        const button = document.getElementById('translate-btn');
        if (button) {
            button.disabled = true;
        }
    }

    enableTranslateButton() {
        const button = document.getElementById('translate-btn');
        if (button) {
            button.disabled = false;
        }
    }

    updatePlayButtonIcon(buttonId, isPlaying) {
        const button = document.getElementById(buttonId);
        if (button) {
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    }

    updateVoiceButtonState(isListening) {
        const voiceButton = document.getElementById('voice-input');
        if (voiceButton) {
            const icon = voiceButton.querySelector('i');
            
            if (isListening) {
                voiceButton.classList.add('recording');
                if (icon) icon.className = 'fas fa-stop';
                voiceButton.title = 'Stop Recording';
            } else {
                voiceButton.classList.remove('recording');
                if (icon) icon.className = 'fas fa-microphone';
                voiceButton.title = 'Voice Input';
            }
        }
    }
}