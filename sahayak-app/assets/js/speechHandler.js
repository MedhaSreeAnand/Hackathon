/**
 * Sahayak - Speech Handler
 * This file contains functions for handling speech recognition and synthesis
 */

class SpeechHandler {
    constructor(speechConfig) {
        this.speechConfig = speechConfig;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.initSpeechRecognition();
    }

    /**
     * Initialize the speech recognition functionality
     */
    initSpeechRecognition() {
        // Check browser compatibility
        if (!('webkitSpeechRecognition' in window) && 
            !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return false;
        }

        // Create speech recognition object
        const SpeechRecognition = window.SpeechRecognition || 
                                 window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure speech recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US'; // Default to English, can be changed
        
        return true;
    }

    /**
     * Start listening for speech input
     * @param {Function} onResultCallback - Callback function to handle the recognized speech
     * @param {Function} onErrorCallback - Callback function to handle errors
     */
    startListening(onResultCallback, onErrorCallback) {
        if (!this.recognition) {
            onErrorCallback('Speech recognition not supported');
            return false;
        }

        // Set up event handlers
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Recognized speech:', transcript);
            onResultCallback(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            onErrorCallback(`Error: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // Callback is handled in onresult or onerror
        };

        // Start recognition
        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            onErrorCallback(`Error starting: ${error.message}`);
            return false;
        }
    }

    /**
     * Stop listening for speech input
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            return true;
        }
        return false;
    }

    /**
     * Speak the provided text using speech synthesis
     * @param {string} text - The text to be spoken
     * @param {Function} onEndCallback - Callback function when speech ends
     */
    speak(text, onEndCallback = null) {
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Check browser compatibility
        if (!this.synthesis) {
            console.error('Speech synthesis not supported in this browser');
            return false;
        }
        
        // Create utterance with the provided text
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply speech configuration
        utterance.rate = this.speechConfig.rate;
        utterance.pitch = this.speechConfig.pitch;
        utterance.volume = this.speechConfig.volume;
        
        // Set up end callback if provided
        if (onEndCallback) {
            utterance.onend = () => {
                // First dispatch a custom event to notify that speech has ended
                document.dispatchEvent(new CustomEvent('speechEnded'));
                // Then call the provided callback
                onEndCallback();
            };
        } else {
            // If no callback provided, at least dispatch the event
            utterance.onend = () => {
                document.dispatchEvent(new CustomEvent('speechEnded'));
            };
        }
        
        // Also handle speech errors
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            document.dispatchEvent(new CustomEvent('speechEnded'));
            if (onEndCallback) onEndCallback();
        };
        
        // Dispatch an event to notify that speech has started
        document.dispatchEvent(new CustomEvent('speechStarted'));
        
        // Start speaking
        this.synthesis.speak(utterance);
        return true;
    }

    /**
     * Stop any ongoing speech
     */
    stopSpeaking() {
        if (this.synthesis) {
            if (this.synthesis.speaking) {
                // Dispatch an event to notify that speech has been stopped
                document.dispatchEvent(new CustomEvent('speechEnded'));
            }
            this.synthesis.cancel();
            return true;
        }
        return false;
    }

    /**
     * Set the speech language
     * @param {string} languageCode - Language code (e.g., 'en-US', 'hi-IN')
     */
    setLanguage(languageCode) {
        if (this.recognition) {
            this.recognition.lang = languageCode;
            return true;
        }
        return false;
    }
}

// Create a global instance of the speech handler
const speechHandler = new SpeechHandler(CONFIG.SPEECH_CONFIG);