# Sahayak Technical Documentation

## Overview

Sahayak is a web-based AI companion application designed specifically for senior citizens. The application leverages modern web technologies to provide an accessible, easy-to-use interface that allows seniors to interact with an AI assistant through multiple modes. This document provides a comprehensive technical overview of the application's architecture, components, and implementation details.

## Tech Stack

### Frontend
- **HTML5**: Semantic markup for structure
- **CSS3**: Advanced styling with CSS variables and responsive design
- **JavaScript (ES6+)**: Core application logic and event handling
- **Web APIs**: SpeechRecognition, SpeechSynthesis, Geolocation, LocalStorage

### External Services
- **Google Gemini AI**: AI model for natural language processing and response generation
- **Font Awesome**: Icon library for intuitive visual cues
- **Google Fonts**: Web fonts for improved readability

## Application Architecture

Sahayak follows a modular architecture pattern with clear separation of concerns:

### Components

1. **UI Layer** (`index.html`, `styles.css`)
   - Responsible for presenting information to users
   - Implements responsive design principles
   - Contains accessibility features

2. **Application Logic** (`app.js`)
   - Core functionality management
   - Event handling
   - State management
   - UI updates

3. **API Integration** (`apiHandler.js`)
   - Communicates with Gemini AI API
   - Formats and sends requests
   - Processes responses

4. **Speech Processing** (`speechHandler.js`)
   - Handles speech-to-text conversion
   - Manages text-to-speech output
   - Controls speech recognition events

5. **Configuration** (`config.js`)
   - Centralizes application settings
   - Contains API keys and endpoints
   - Stores static content like prompt templates

## Technical Implementation Details

### Responsive Design

The application uses a mobile-first responsive design approach:

- **Flexbox and Grid**: For modern, flexible layouts
- **Media Queries**: Adapt UI components based on screen size
- **Relative Units**: Using `rem` and percentage-based sizing for scalability
- **CSS Variables**: Centralized control of theme properties

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --font-size-base: 18px;
    /* Additional variables */
}

@media (max-width: 768px) {
    :root {
        --font-size-base: 16px;
        --padding-standard: 15px;
    }
    /* Additional responsive adjustments */
}
```

### Accessibility Features

Sahayak incorporates several accessibility-focused features:

1. **Dynamic Font Sizing**:
   - User-controlled font size adjustment
   - Persistent settings via localStorage

```javascript
function changeFontSize(delta) {
    const newSize = appState.currentFontSize + delta;
    if (newSize < CONFIG.APP_SETTINGS.minFontSize || 
        newSize > CONFIG.APP_SETTINGS.maxFontSize) {
        return;
    }
    appState.currentFontSize = newSize;
    localStorage.setItem('sahayak_fontSize', newSize.toString());
    updateFontSize();
}
```

2. **High Contrast Mode**:
   - Toggle between standard and high-contrast UI
   - CSS variable override for consistent application

```css
body.high-contrast {
    --primary-color: #000000;
    --secondary-color: #0066cc;
    --text-color: #000000;
    --light-text: #ffffff;
    /* Additional contrast variables */
}
```

3. **Speech Interaction**:
   - Full voice input via Web Speech API
   - Text-to-speech output for all responses

### Speech Recognition Implementation

The application leverages the Web Speech API for voice interaction:

```javascript
initSpeechRecognition() {
    // Check browser compatibility
    if (!('webkitSpeechRecognition' in window) && 
        !('SpeechRecognition' in window)) {
        console.error('Speech recognition not supported');
        return false;
    }

    // Initialize with browser-specific implementation
    const SpeechRecognition = window.SpeechRecognition || 
                             window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure speech recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    return true;
}
```

Key features:
- Non-continuous mode for command-based interaction
- Error handling for unsupported browsers
- Language configuration options

### AI Integration with Gemini API

The application communicates with Google's Gemini AI model:

```javascript
async sendRequest(userInput) {
    try {
        // Generate contextual prompt
        const prompt = this.generatePrompt(userInput);
        
        // Format request for Gemini API
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        
        // Send the request
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        // Process response
        // ...
    } catch (error) {
        console.error('Error in sendRequest:', error);
        throw error;
    }
}
```

Implementation details:
- Contextual prompts based on interaction mode
- Async/await pattern for API communication
- Error handling and fallbacks
- Generation parameter customization (temperature, token limits)

### Mode-Specific Prompting

The application uses different prompt prefixes based on selected modes:

```javascript
PROMPT_PREFIXES: {
    information: "You are Sahayak, a helpful AI assistant for senior citizens. Provide clear, concise, and informative answers to the following question. Use simple language and avoid technical jargon: ",
    
    religious: "You are Sahayak, a compassionate AI companion for senior citizens interested in religious and spiritual topics. Respond to the following query about religious topics, focusing on stories and teachings, in a way that is engaging and easy for a senior citizen to understand. Be respectful of all faiths and provide balanced information: ",
    
    // Additional modes...
}
```

This technique:
- Creates consistent AI personality
- Provides mode-specific guidance to the AI
- Ensures appropriate response style for seniors

### Emergency Feature Implementation

The emergency help system incorporates several technical elements:

1. **Geolocation API Integration**:

```javascript
if (CONFIG.EMERGENCY_CONFIG.settings.attemptGeoLocation && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Store location data
            appState.userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            // Create dialog with location data
            createEmergencyDialog();
        },
        (error) => {
            // Handle geolocation errors
            // ...
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}
```

2. **Deep Linking for Communication**:
   - Uses URI schemes for phone, SMS, and WhatsApp
   - Dynamically generates message content with location

```javascript
// Phone call deep linking
window.location.href = `tel:${phoneNumber}`;

// WhatsApp integration
const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(emergencyMessage)}`;
window.open(whatsappUrl, '_blank');

// SMS messaging
window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(emergencyMessage)}`;
```

### State Management

The application uses a centralized state object for managing application state:

```javascript
const appState = {
    currentMode: 'information',
    isSpeaking: false,
    currentFontSize: CONFIG.APP_SETTINGS.defaultFontSize,
    highContrastMode: false,
    conversationHistory: {
        information: [],
        religious: [],
        wellness: [],
        ordering: []
    },
    isProcessing: false,
    userLocation: null
};
```

This approach provides:
- Centralized state tracking
- Clean state transitions
- Simplified debugging
- Separation of state from UI

### Persistent Storage

The application leverages localStorage for persistent user preferences:

```javascript
function loadUserPreferences() {
    // Load font size preference
    const savedFontSize = localStorage.getItem('sahayak_fontSize');
    if (savedFontSize) {
        appState.currentFontSize = parseInt(savedFontSize);
        updateFontSize();
    }
    
    // Load contrast preference
    const highContrast = localStorage.getItem('sahayak_highContrast') === 'true';
    if (highContrast) {
        appState.highContrastMode = true;
        document.body.classList.add('high-contrast');
    }
    
    // Load last used mode
    const lastMode = localStorage.getItem('sahayak_lastMode');
    if (lastMode && CONFIG.PROMPT_PREFIXES[lastMode]) {
        appState.currentMode = lastMode;
    }
}
```

Benefits:
- Session persistence across page reloads
- User preference retention
- Improved user experience for returning visitors

## User Experience Considerations

### Progressive Enhancement

The application implements progressive enhancement principles:

1. **Feature Detection**:
   - Checks for API availability before using
   - Provides fallbacks for unsupported features

```javascript
function checkBrowserCompatibility() {
    const missingFeatures = [];
    
    // Check for Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        missingFeatures.push('Speech Recognition');
        elements.micButton.disabled = true;
        elements.micButton.title = 'Speech recognition not supported in this browser';
    }
    
    // Additional feature checks...
}
```

2. **Graceful Degradation**:
   - Core functionality works without advanced features
   - UI adapts based on available capabilities

### Animation and Visual Feedback

The application uses subtle animations and visual indicators:

```css
@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
    }
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
}

.fade-in {
    animation: fadeIn 0.5s ease-in-out;
}
```

These animations provide:
- Feedback for user actions
- Status indicators for ongoing processes
- Improved overall UX without overwhelming users

## Security Considerations

### API Key Management

The application stores the Gemini API key in the configuration file:

```javascript
const CONFIG = {
    // Gemini API Key
    GEMINI_API_KEY: "AIzaSyDg4RU8017EK0o5098irAp7Anu_K-GsSao",
    
    // API Endpoint
    GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    
    // Additional configuration...
};
```

**Security Implications**:
- Client-side API key storage is inherently insecure
- In a production environment, API requests should be proxied through a server-side component
- Rate limiting and domain restrictions should be applied to the API key

### Data Privacy

The application handles several types of sensitive data:

1. **Conversation History**:
   - Stored in browser memory and localStorage
   - Not encrypted in the current implementation

2. **Location Data**:
   - Only collected when emergency feature is used
   - Stored temporarily in application state

3. **Emergency Contact Information**:
   - Hard-coded in configuration file
   - Accessible in client-side code

**Recommendations for Production**:
- Implement encryption for stored conversations
- Add user authentication for persistent data
- Move sensitive configuration to server-side environment

## Browser Compatibility

The application targets modern browsers with specific API requirements:

- **Speech Recognition**: Chrome, Edge, Safari (with prefixes)
- **Speech Synthesis**: Widely supported in modern browsers
- **Geolocation API**: Standard in all modern browsers
- **localStorage**: Universal support except in private browsing modes

Fallback strategies include:
- Feature detection before API usage
- Disabling functionality when not supported
- Visual indicators for unavailable features

## Performance Optimization

The application implements several performance best practices:

1. **Event Delegation**:
   - Centralized event handling
   - Reduced memory footprint

2. **Debounced Operations**:
   - Prevents excessive API calls
   - Improves UI responsiveness

3. **Asynchronous Operations**:
   - Non-blocking API requests
   - Smooth UI during processing

## Potential Improvements

1. **Backend Integration**:
   - Move API communication to server-side
   - Add user accounts and data persistence
   - Implement proper security measures

2. **Offline Functionality**:
   - Service Worker implementation
   - Cached responses for common queries
   - Offline mode for emergency features

3. **Accessibility Enhancements**:
   - ARIA attributes for screen readers
   - Keyboard navigation improvements
   - Color blindness considerations

4. **Additional Features**:
   - Medication reminders
   - Calendar integration
   - Family portal for remote monitoring

## Conclusion

Sahayak represents a thoughtful application of modern web technologies to address the specific needs of senior citizens. Its architecture balances technical sophistication with user-centered design principles, creating an accessible, helpful companion for elderly users. The modular design and clean separation of concerns provide a solid foundation for future enhancements and feature additions.
