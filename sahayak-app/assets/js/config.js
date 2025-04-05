/**
 * Sahayak - Configuration File (FINAL FIX)
 * This file contains configuration settings for the application
 */

const CONFIG = {
    // Gemini API Key
    GEMINI_API_KEY: "AIzaSyDg4RU8017EK0o5098irAp7Anu_K-GsSao",
    
    // FIXED API Endpoint - removed key from URL to prevent duplication
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    
    // Mode-specific prompt prefixes (unchanged)
    PROMPT_PREFIXES: {
        information: "You are Sahayak, a helpful AI assistant for senior citizens. Provide clear, concise, and informative answers to the following question. Use simple language and avoid technical jargon: ",
        
        religious: "You are Sahayak, a compassionate AI companion for senior citizens interested in religious and spiritual topics. Respond to the following query about religious topics, focusing on stories and teachings, in a way that is engaging and easy for a senior citizen to understand. Be respectful of all faiths and provide balanced information: ",
        
        wellness: "You are Sahayak, a supportive AI wellness companion for senior citizens. Respond to the following query about health and wellness, offering gentle, supportive, and informative advice suitable for a senior citizen. Focus on general wellbeing rather than specific medical advice, and always suggest consulting healthcare professionals for medical concerns: ",
        
        ordering: "You are Sahayak, a helpful AI shopping assistant for senior citizens. Help the user understand how to order products online. Explain the process step by step, in a clear and easy to follow manner. If they mention specific items or services, guide them on how to find and order these items on platforms like Amazon or food delivery services. Ask for their address if delivery information is needed: "
    },
    
    // Speech synthesis configuration (unchanged)
    SPEECH_CONFIG: {
        rate: 0.9,  // Slightly slower than default (1.0)
        pitch: 1.0,
        volume: 1.0
    },
    
    // Application settings (unchanged)
    APP_SETTINGS: {
        defaultFontSize: 18,
        maxFontSize: 28,
        minFontSize: 16,
        fontSizeStep: 2
    },  // <-- Added comma here
    
    // Emergency contact settings
    EMERGENCY_CONFIG: {
        // Primary emergency contact (usually a family member)
        primaryContact: {
            name: "Son/Daughter",
            phone: "9079173001",  // Replace with actual emergency contact
            relationship: "Primary caregiver"
        },
        
        // Secondary contacts
        secondaryContacts: [
            {
                name: "Neighbor",
                phone: "9065338733", // Replace with actual number
                relationship: "Neighbor"
            }
        ],
        
        // Emergency services
        emergencyServices: {
            ambulance: "108",    // India ambulance
            police: "100",       // India police 
            helpline: "112"      // India unified emergency number
        },
        
        // Emergency message template
        messageTemplate: "EMERGENCY: [NAME] needs immediate assistance at [LOCATION]. This is an automated alert from Sahayak app.",
        
        // Settings
        settings: {
            confirmBeforeCalling: true,  // Ask for confirmation before dialing
            attemptGeoLocation: true,    // Try to include location in emergency messages
            callTimeout: 30000,          // How long to wait for call to connect (30 seconds)
            useSequentialCalling: true   // Try contacts in sequence if no answer
        }
    }
};