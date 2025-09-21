/**
 * @fileoverview ApiManager - Handles API key management and OpenAI API calls
 * @author PolyGlot Team
 */

/**
 * Manages OpenAI API integration and key storage
 * @class ApiManager
 */
export class ApiManager {
    /**
     * @constructor
     * @description Initializes the API manager with stored API key
     */
    constructor() {
        this.apiKey = this.#getStoredApiKey();
        this.baseUrl = 'https://api.openai.com/v1';
        this.requestTimeout = 30000; // 30 seconds
        this.maxRetries = 3;
    }

    /**
     * Retrieves API key from localStorage safely
     * @private
     * @returns {string} The stored API key or empty string
     */
    #getStoredApiKey() {
        try {
            return localStorage.getItem('openai-api-key') || '';
        } catch (error) {
            console.warn('Failed to access localStorage:', error);
            return '';
        }
    }

    /**
     * Gets the current API key
     * @returns {string} The API key
     */
    getApiKey() {
        return this.apiKey;
    }

    /**
     * Validates and saves the API key
     * @param {string} apiKey - The API key to save
     * @throws {Error} If API key is invalid
     * @returns {boolean} True if saved successfully
     */
    saveApiKey(apiKey) {
        if (!this.#validateApiKey(apiKey)) {
            throw new Error('Please enter a valid API key');
        }
        
        this.apiKey = apiKey.trim();
        try {
            localStorage.setItem('openai-api-key', this.apiKey);
            return true;
        } catch (error) {
            throw new Error('Failed to save API key: ' + error.message);
        }
    }

    /**
     * Validates API key format
     * @private
     * @param {string} apiKey - The API key to validate
     * @returns {boolean} True if valid
     */
    #validateApiKey(apiKey) {
        return apiKey && 
               typeof apiKey === 'string' && 
               apiKey.trim().length > 0 &&
               apiKey.trim().startsWith('sk-');
    }

    /**
     * Loads the API key (alias for getApiKey for backward compatibility)
     * @returns {string} The API key
     */
    loadApiKey() {
        return this.apiKey;
    }

    /**
     * Checks if API key exists and is valid
     * @returns {boolean} True if API key is available
     */
    hasApiKey() {
        return !!this.apiKey && this.#validateApiKey(this.apiKey);
    }

    /**
     * Translates text using OpenAI API with retry logic
     * @param {string} sourceText - Text to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @param {Object} languageNames - Language code to name mapping
     * @returns {Promise<string>} Translated text
     * @throws {Error} If translation fails
     */
    async translateText(sourceText, sourceLanguage, targetLanguage, languageNames) {
        if (!this.hasApiKey()) {
            throw new Error('API key not set or invalid');
        }

        if (!sourceText?.trim()) {
            throw new Error('Source text is required');
        }

        const prompt = this.#buildTranslationPrompt(
            sourceText, 
            sourceLanguage, 
            targetLanguage, 
            languageNames
        );

        return this.#makeApiRequest('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional translator. Translate the given text 
                             accurately while preserving the meaning and tone. Only return 
                             the translation without any additional text or explanations.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: Math.min(1000, Math.max(100, sourceText.length * 2)),
            temperature: 0.3
        }).then(data => data.choices[0]?.message?.content?.trim() || '');
    }

    /**
     * Builds translation prompt based on language settings
     * @private
     * @param {string} sourceText - Text to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @param {Object} languageNames - Language code to name mapping
     * @returns {string} Translation prompt
     */
    #buildTranslationPrompt(sourceText, sourceLanguage, targetLanguage, languageNames) {
        const targetLangName = languageNames[targetLanguage] || targetLanguage;
        
        if (sourceLanguage === 'auto') {
            return `Translate the following text to ${targetLangName}. If the source 
                   language is already ${targetLangName}, just return the original text. 
                   Only return the translation, nothing else:\n\n${sourceText}`;
        }
        
        const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
        return `Translate the following ${sourceLangName} text to ${targetLangName}. 
               Only return the translation, nothing else:\n\n${sourceText}`;
    }

    /**
     * Detects the language of the given text
     * @param {string} text - Text to analyze
     * @returns {Promise<string>} Detected language name
     * @throws {Error} If detection fails
     */
    async detectLanguage(text) {
        if (!this.hasApiKey()) {
            throw new Error('API key not set or invalid');
        }

        if (!text?.trim()) {
            throw new Error('Text is required for language detection');
        }

        return this.#makeApiRequest('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `You are a language detection expert. Identify the language 
                             of the given text and respond with only the language name 
                             in English (e.g., "English", "Vietnamese", "Japanese", 
                             "German", "Chinese").`
                },
                {
                    role: 'user',
                    content: text.substring(0, 500) // Limit text for detection
                }
            ],
            max_tokens: 10,
            temperature: 0
        }).then(data => data.choices[0]?.message?.content?.trim() || 'Unknown');
    }

    /**
     * Makes an API request with retry logic and proper error handling
     * @private
     * @param {string} endpoint - API endpoint path
     * @param {Object} payload - Request payload
     * @param {number} retryCount - Current retry attempt
     * @returns {Promise<Object>} API response data
     * @throws {Error} If request fails after all retries
     */
    async #makeApiRequest(endpoint, payload, retryCount = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || 
                                   `HTTP error! status: ${response.status}`;
                
                // Retry on server errors (5xx) but not client errors (4xx)
                if (response.status >= 500 && retryCount < this.maxRetries) {
                    await this.#delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
                    return this.#makeApiRequest(endpoint, payload, retryCount + 1);
                }
                
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            
            // Retry on network errors
            if (retryCount < this.maxRetries && !error.message.includes('HTTP error')) {
                await this.#delay(Math.pow(2, retryCount) * 1000);
                return this.#makeApiRequest(endpoint, payload, retryCount + 1);
            }
            
            throw error;
        }
    }

    /**
     * Utility function for creating delays
     * @private
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}