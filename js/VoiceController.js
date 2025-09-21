/**
 * @fileoverview VoiceController - Handles speech recognition and synthesis
 * @author PolyGlot Team
 */

/**
 * Manages speech recognition and text-to-speech functionality
 * @class VoiceController
 */
export class VoiceController {
    /**
     * @constructor
     * @param {Function} notificationCallback - Function to show notifications
     */
    constructor(notificationCallback) {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.showNotification = notificationCallback;
        this.currentUtterance = null;
        this.supportedLanguages = new Map();
        
        this.#setupSpeechRecognition();
        this.#loadAvailableVoices();
    }

    /**
     * Sets up speech recognition if supported by browser
     * @private
     */
    #setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButtonState();
                this.showNotification('Listening...', 'info');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    const sourceText = document.getElementById('source-text');
                    sourceText.value = finalTranscript;
                    
                    // Dispatch custom event for other modules
                    const event = new CustomEvent('voiceInputComplete', {
                        detail: { text: finalTranscript }
                    });
                    document.dispatchEvent(event);
                }
            };

            this.recognition.onerror = (event) => {
                this.isListening = false;
                this.updateVoiceButtonState();
                this.showNotification(`Voice recognition error: ${event.error}`, 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButtonState();
            };
        } else {
            this.showNotification('Speech recognition not supported in this browser', 'warning');
        }
    }

    /**
     * Loads available voices for text-to-speech
     * @private
     */
    #loadAvailableVoices() {
        const voices = this.synthesis.getVoices();
        voices.forEach(voice => {
            this.supportedLanguages.set(voice.lang, voice);
        });

        // Load voices when they become available (async in some browsers)
        if (voices.length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.#loadAvailableVoices();
            }, { once: true });
        }
    }

    /**
     * Toggles voice input on/off
     * @param {string} sourceLanguage - Source language code for recognition
     */
    toggleVoiceInput(sourceLanguage) {
        if (!this.recognition) {
            this.showNotification('Speech recognition not supported', 'error');
            return;
        }

        if (this.isListening) {
            this.#stopListening();
        } else {
            this.#startListening(sourceLanguage);
        }
    }

    /**
     * Starts voice recognition
     * @private
     * @param {string} sourceLanguage - Source language code
     */
    #startListening(sourceLanguage) {
        try {
            // Set recognition language based on source language selection
            const recognitionLang = this.#getRecognitionLanguage(sourceLanguage);
            this.recognition.lang = recognitionLang;
            this.recognition.start();
        } catch (error) {
            this.showNotification('Failed to start voice recognition', 'error');
            console.error('Voice recognition error:', error);
        }
    }

    /**
     * Stops voice recognition
     * @private
     */
    #stopListening() {
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    }

    /**
     * Maps language codes to recognition language codes
     * @private
     * @param {string} sourceLanguage - Source language code
     * @returns {string} Recognition language code
     */
    #getRecognitionLanguage(sourceLanguage) {
        const langMap = {
            'en': 'en-US',
            'vi': 'vi-VN', 
            'ja': 'ja-JP',
            'de': 'de-DE',
            'zh': 'zh-CN'
        };
        return sourceLanguage === 'auto' ? 'en-US' : (langMap[sourceLanguage] || 'en-US');
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

    /**
     * Plays text using text-to-speech
     * @param {string} text - Text to speak
     * @param {string} language - Language code for speech
     * @returns {Promise<void>} Promise that resolves when speech ends
     */
    async playText(text, language) {
        if (!text?.trim()) {
            this.showNotification('No text to play', 'warning');
            return;
        }

        // Stop any ongoing speech
        this.#stopCurrentSpeech();

        try {
            const utterance = this.#createUtterance(text, language);
            this.currentUtterance = utterance;
            
            return new Promise((resolve, reject) => {
                utterance.onend = () => {
                    this.currentUtterance = null;
                    resolve();
                };
                utterance.onerror = (event) => {
                    this.currentUtterance = null;
                    reject(new Error(`Speech synthesis failed: ${event.error}`));
                };
                
                this.synthesis.speak(utterance);
            });
        } catch (error) {
            this.showNotification('Speech synthesis failed', 'error');
            throw error;
        }
    }

    /**
     * Creates a speech utterance with optimal settings
     * @private
     * @param {string} text - Text to speak
     * @param {string} language - Language code
     * @returns {SpeechSynthesisUtterance} Configured utterance
     */
    #createUtterance(text, language) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language for speech synthesis
        const synthesisLang = this.#getSynthesisLanguage(language);
        utterance.lang = synthesisLang;
        
        // Optimize speech settings
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to use a better voice if available
        const preferredVoice = this.supportedLanguages.get(synthesisLang);
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        return utterance;
    }

    /**
     * Maps language codes to synthesis language codes
     * @private
     * @param {string} language - Language code
     * @returns {string} Synthesis language code
     */
    #getSynthesisLanguage(language) {
        const langMap = {
            'en': 'en-US',
            'vi': 'vi-VN',
            'ja': 'ja-JP', 
            'de': 'de-DE',
            'zh': 'zh-CN'
        };
        return language === 'auto' ? 'en-US' : (langMap[language] || 'en-US');
    }

    /**
     * Stops current speech synthesis
     * @private
     */
    #stopCurrentSpeech() {
        if (this.currentUtterance) {
            this.synthesis.cancel();
            this.currentUtterance = null;
        }
    }

    updatePlayButtonState(buttonId, isPlaying) {
        const button = document.getElementById(buttonId);
        const icon = button.querySelector('i');
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}