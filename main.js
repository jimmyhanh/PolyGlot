/**
 * @fileoverview Main application entry point that coordinates all modules
 * @author PolyGlot Team
 */

import { ApiManager } from './js/ApiManager.js';
import { VoiceController } from './js/VoiceController.js'; 
import { TranslationEngine } from './js/TranslationEngine.js';
import { HistoryManager } from './js/HistoryManager.js';
import { UIController } from './js/UIController.js';
import { EventManager } from './js/EventManager.js';

/**
 * Main application class that coordinates all modules
 * @class PolyGlotApp
 */
class PolyGlotApp {
    /**
     * @constructor
     * @description Initializes the application and all modules
     */
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.initializationPromise = this.#init();
    }

    /**
     * Initializes all application modules
     * @private
     * @returns {Promise<void>}
     */
    async #init() {
        try {
            // Initialize UI controller first
            this.modules.ui = new UIController();

            // Initialize API manager
            this.modules.apiManager = new ApiManager();

            // Initialize voice controller with notification callback
            this.modules.voiceController = new VoiceController((message, type) => {
                this.modules.ui.showToast(message, type);
            });

            // Initialize translation engine
            this.modules.translationEngine = new TranslationEngine(
                this.modules.apiManager,
                (message, type) => this.modules.ui.showToast(message, type)
            );

            // Initialize history manager
            this.modules.historyManager = new HistoryManager(
                this.modules.translationEngine.getLanguageNames()
            );

            // Initialize event manager (must be last)
            this.modules.eventManager = new EventManager(this.modules);

            // Load initial data
            await this.#loadInitialData();

            // Register service worker for offline functionality
            this.#registerServiceWorker();

            this.isInitialized = true;
            console.log('PolyGlot application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PolyGlot application:', error);
            this.modules.ui?.showToast('Failed to initialize application', 'error');
            throw error;
        }
    }

    /**
     * Loads initial application data and state
     * @private
     * @returns {Promise<void>}
     */
    async #loadInitialData() {
        try {
            // Load API key
            const apiKey = this.modules.apiManager.loadApiKey();
            this.modules.ui.updateApiKeyInput(apiKey);

            // Load translation history
            this.modules.historyManager.loadHistory();

            // Update initial character counts
            this.modules.ui.updateCharacterCounts();

            // Set up initial language state
            const languages = this.modules.ui.getLanguageSelections();
            this.modules.translationEngine.setLanguages(languages.source, languages.target);

            // Set up initial live translate state
            const liveTranslateEnabled = this.modules.ui.getLiveTranslateState();
            this.modules.translationEngine.setLiveTranslate(liveTranslateEnabled);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.modules.ui?.showToast('Warning: Some settings could not be loaded', 'warning');
        }
    }

    /**
     * Registers service worker for offline functionality
     * @private
     */
    #registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service workers not supported');
            return;
        }

        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('SW registered: ', registration);
            } catch (registrationError) {
                console.warn('SW registration failed: ', registrationError);
            }
        });
    }

    /**
     * Gets a specific module by name
     * @param {string} moduleName - Name of the module to retrieve
     * @returns {Object|null} The requested module or null if not found
     */
    getModule(moduleName) {
        if (!this.isInitialized) {
            console.warn('Application not yet initialized');
            return null;
        }
        return this.modules[moduleName] || null;
    }

    /**
     * Gets all initialized modules
     * @returns {Object} All modules
     */
    getAllModules() {
        return { ...this.modules };
    }

    /**
     * Waits for application initialization to complete
     * @returns {Promise<void>}
     */
    async waitForInitialization() {
        return this.initializationPromise;
    }

    /**
     * Checks if application is ready
     * @returns {boolean} True if initialized
     */
    isReady() {
        return this.isInitialized;
    }
}

/**
 * Initialize the application when the page loads
 */
let polyglotApp;
document.addEventListener('DOMContentLoaded', async () => {
    try {
        polyglotApp = new PolyGlotApp();
        await polyglotApp.waitForInitialization();
        
        // Make app instance globally available for debugging
        window.polyglotApp = polyglotApp;
        
        console.log('PolyGlot is ready!');
    } catch (error) {
        console.error('Failed to initialize PolyGlot:', error);
        document.body.innerHTML += `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px;
                        border: 1px solid #f5c6cb; z-index: 9999;">
                <h3>Application Error</h3>
                <p>Failed to initialize PolyGlot. Please refresh the page.</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px;">
                    Refresh Page
                </button>
            </div>
        `;
    }
});

// Export for potential use in other contexts
export { PolyGlotApp };