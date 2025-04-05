/**
 * Sahayak - Main Application
 * This file contains the main application logic and event handlers
 */

// DOM Elements
const elements = {
    // Screens
    modeSelection: document.getElementById('modeSelection'),
    conversation: document.getElementById('conversation'),
    speakingIndicator: document.getElementById('speakingIndicator'),
    stopSpeakingBtn: document.getElementById('stopSpeakingBtn'),
    
    // Buttons
    modeButtons: document.querySelectorAll('.mode-btn'),
    backButton: document.getElementById('backToModes'),
    micButton: document.getElementById('micBtn'),
    sendButton: document.getElementById('sendBtn'),
    emergencyButton: document.getElementById('emergencyBtn'),
    increaseFontButton: document.getElementById('increaseFont'),
    decreaseFontButton: document.getElementById('decreaseFont'),
    contrastToggleButton: document.getElementById('toggleHighContrast'),
    
    // Content areas
    currentModeDisplay: document.getElementById('currentMode'),
    modeWelcomeDisplay: document.getElementById('modeWelcome'),
    chatHistory: document.getElementById('chatHistory'),
    userInput: document.getElementById('userInput'),
    recordingIndicator: document.getElementById('recordingIndicator')
};

// Application state
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
    userLocation: null // Will store geolocation if available
};

/**
 * Initialize the application
 */
function initApp() {
    // Check if browser supports required features
    checkBrowserCompatibility();
    
    // Add event listeners
    attachEventListeners();
    
    // Update the font size from local storage if available
    loadUserPreferences();
    
    // Initialize the API handler with the default mode
    apiHandler.setMode(appState.currentMode);
    
    // Add welcome messages for each mode
    initializeWelcomeMessages();
    
    console.log('Sahayak application initialized');
}

/**
 * Check if the browser supports required features
 */
function checkBrowserCompatibility() {
    const missingFeatures = [];
    
    // Check for Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        missingFeatures.push('Speech Recognition');
        elements.micButton.disabled = true;
        elements.micButton.title = 'Speech recognition not supported in this browser';
    }
    
    // Check for Speech Synthesis
    if (!('speechSynthesis' in window)) {
        missingFeatures.push('Speech Synthesis');
    }
    
    // Check for localStorage
    let storageAvailable = false;
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        storageAvailable = true;
    } catch (e) {
        missingFeatures.push('Local Storage');
    }
    
    // If any features are missing, show a warning
    if (missingFeatures.length > 0) {
        const warningMessage = `Warning: Your browser doesn't support ${missingFeatures.join(', ')}. Some features may not work properly. For the best experience, please use Google Chrome or Microsoft Edge.`;
        
        console.warn(warningMessage);
        
        // Add a warning banner if needed
        const warningBanner = document.createElement('div');
        warningBanner.classList.add('warning-banner');
        warningBanner.textContent = warningMessage;
        document.body.insertBefore(warningBanner, document.body.firstChild);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(warningBanner)) {
                warningBanner.remove();
            }
        }, 10000);
    }
}

/**
 * Load user preferences from localStorage
 */
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
    
    // Load last used mode (optional)
    const lastMode = localStorage.getItem('sahayak_lastMode');
    if (lastMode && CONFIG.PROMPT_PREFIXES[lastMode]) {
        appState.currentMode = lastMode;
    }
}

/**
 * Initialize welcome messages for each mode
 */
function initializeWelcomeMessages() {
    const welcomeMessages = {
        information: "Welcome to Information Mode. Ask me any general questions, and I'll provide clear and helpful answers.",
        religious: "Welcome to Religious Mode. I can discuss spiritual topics, share stories from various traditions, or answer questions about religious practices.",
        wellness: "Welcome to Wellness Mode. I can provide tips on staying healthy, suggest simple exercises, or discuss general wellbeing topics.",
        ordering: "Welcome to Ordering Mode. I can help you place orders online. I'll guide you through the process of ordering food, groceries, or other items."
    };
    
    // Store these messages for use when switching modes
    appState.welcomeMessages = welcomeMessages;
}

/**
 * Attach event listeners to UI elements
 */
function attachEventListeners() {
    // Mode selection buttons
    elements.modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            selectMode(mode);
        });
    });
    
    // Back button
    elements.backButton.addEventListener('click', () => {
        showModeSelection();
    });
    
    // Microphone button
    elements.micButton.addEventListener('click', () => {
        toggleSpeechInput();
    });
    
    // Recording indicator (to stop recording)
    elements.recordingIndicator.addEventListener('click', () => {
        stopSpeechInput();
    });
    
    // Send button
    elements.sendButton.addEventListener('click', () => {
        sendUserInput();
    });
    
    // User input (Enter key to send)
    elements.userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendUserInput();
        }
    });
    
    // Emergency button
    elements.emergencyButton.addEventListener('click', () => {
        handleEmergencyRequest();
    });
    
    // Font size controls
    elements.increaseFontButton.addEventListener('click', () => {
        changeFontSize(CONFIG.APP_SETTINGS.fontSizeStep);
    });
    
    elements.decreaseFontButton.addEventListener('click', () => {
        changeFontSize(-CONFIG.APP_SETTINGS.fontSizeStep);
    });
    
    // Contrast toggle
    elements.contrastToggleButton.addEventListener('click', () => {
        toggleHighContrast();
    });
    
    // Handle window resize to adjust UI
    window.addEventListener('resize', () => {
        // Adjust UI for smaller screens if needed
        updateResponsiveLayout();
    });
    
    // Stop speech when user starts typing
    elements.userInput.addEventListener('input', () => {
        if (appState.isSpeaking) {
            stopSpeaking();
        }
    });
    
    // Add this - Stop speaking button
    elements.stopSpeakingBtn.addEventListener('click', () => {
        stopSpeaking();
    });
    
    // Add these - Global speech events
    document.addEventListener('speechStarted', () => {
        showSpeakingIndicator();
    });

    document.addEventListener('speechEnded', () => {
        hideSpeakingIndicator();
    });
}

/**
 * Update the layout for responsive design
 */
function updateResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    
    // Adjust UI elements for mobile if needed
    if (isMobile) {
        // Simplify UI for small screens
        elements.sendButton.querySelector('span').textContent = '';
        elements.micButton.querySelector('span').textContent = '';
    } else {
        // Restore text labels on larger screens
        elements.sendButton.querySelector('span').textContent = 'Send';
        elements.micButton.querySelector('span').textContent = 'Speak';
    }
}

/**
 * Select a conversation mode and switch to conversation screen
 * @param {string} mode - The selected mode
 */
function selectMode(mode) {
    // Don't do anything if mode is already selected
    if (mode === appState.currentMode && !elements.conversation.classList.contains('hidden')) {
        return;
    }
    
    // Update application state
    appState.currentMode = mode;
    
    // Save the last used mode
    localStorage.setItem('sahayak_lastMode', mode);
    
    // Set mode in API handler
    apiHandler.setMode(mode);
    
    // Update UI elements
    elements.currentModeDisplay.textContent = `Mode: ${capitalizeFirst(mode)}`;
    elements.modeWelcomeDisplay.textContent = capitalizeFirst(mode);
    
    // Show conversation screen
    elements.modeSelection.classList.add('hidden');
    elements.conversation.classList.remove('hidden');
    
    // Clear previous conversation and add welcome message
    clearChatHistory();
    
    // Add welcome message for this mode
    const welcomeMessage = elements.chatHistory.querySelector('.welcome-message p');
    if (welcomeMessage) {
        welcomeMessage.textContent = appState.welcomeMessages[mode] || 
            `Welcome to ${capitalizeFirst(mode)} Mode. How may I help you?`;
    }
    
    // Restore previous conversation for this mode if available
    if (appState.conversationHistory[mode] && appState.conversationHistory[mode].length > 0) {
        restoreConversation(mode);
    }
    
    // Focus on input field
    elements.userInput.focus();
    
    console.log(`Mode selected: ${mode}`);
}

/**
 * Restore previous conversation messages for the selected mode
 * @param {string} mode - The selected mode
 */
function restoreConversation(mode) {
    const history = appState.conversationHistory[mode];
    
    // Add each message from history
    history.forEach(msg => {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', msg.className);
        
        // Add sender if not user
        if (msg.sender !== 'You') {
            const senderSpan = document.createElement('div');
            senderSpan.classList.add('message-sender');
            senderSpan.textContent = msg.sender;
            messageDiv.appendChild(senderSpan);
        }
        
        // Add message text
        const textPara = document.createElement('p');
        textPara.classList.add('message-text');
        textPara.textContent = msg.text;
        messageDiv.appendChild(textPara);
        
        // Add timestamp
        const timestampSpan = document.createElement('div');
        timestampSpan.classList.add('message-timestamp');
        timestampSpan.textContent = msg.timestamp;
        messageDiv.appendChild(timestampSpan);
        
        // Add to chat history
        elements.chatHistory.appendChild(messageDiv);
    });
    
    // Scroll to the bottom
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
}

/**
 * Show the mode selection screen
 */
function showModeSelection() {
    // Hide conversation screen and show mode selection
    elements.conversation.classList.add('hidden');
    elements.modeSelection.classList.remove('hidden');
    
    // Stop any ongoing speech
    if (appState.isSpeaking) {
        stopSpeaking();
    }
}

/**
 * Toggle speech input (start/stop listening)
 */
function toggleSpeechInput() {
    if (speechHandler.isListening) {
        stopSpeechInput();
    } else {
        startSpeechInput();
    }
}

/**
 * Start speech recognition
 */
function startSpeechInput() {
    // Don't start if already processing a request
    if (appState.isProcessing) {
        return;
    }
    
    // Stop any ongoing speech
    if (appState.isSpeaking) {
        stopSpeaking();
    }
    
    // Show recording indicator
    elements.recordingIndicator.classList.remove('hidden');
    elements.micButton.disabled = true;
    
    // Start listening for speech
    speechHandler.startListening(
        // Success callback
        (transcript) => {
            elements.userInput.value = transcript;
            stopSpeechInput();
            // Small delay before sending to allow user to see what was transcribed
            setTimeout(() => sendUserInput(), 500);
        },
        // Error callback
        (error) => {
            addMessage('System', `Speech recognition error: ${error}. Please try again or type your message.`, 'error-message');
            stopSpeechInput();
        }
    );
}

/**
 * Stop speech recognition
 */
function stopSpeechInput() {
    // Hide recording indicator
    elements.recordingIndicator.classList.add('hidden');
    elements.micButton.disabled = false;
    
    // Stop listening
    speechHandler.stopListening();
}

/**
 * Send user input to the API and process response
 */
async function sendUserInput() {
    const userText = elements.userInput.value.trim();
    
    // Validate input
    if (!userText || appState.isProcessing) {
        return;
    }
    
    // Set processing state
    appState.isProcessing = true;
    elements.sendButton.disabled = true;
    elements.micButton.disabled = true;
    
    try {
        // Format and display timestamp
        const now = new Date();
        const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Add user message to chat and history
        const messageObj = {
            sender: 'You',
            text: userText,
            className: 'user-message',
            timestamp: timestamp
        };
        
        // Add to UI
        addMessage(messageObj.sender, messageObj.text, messageObj.className);
        
        // Store in conversation history
        appState.conversationHistory[appState.currentMode].push(messageObj);
        
        // Clear input field
        elements.userInput.value = '';
        
        // Add typing indicator
        const typingIndicator = addTypingIndicator();
        
        // Send request to API
        const response = await apiHandler.sendRequest(userText);
        
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add AI response to chat and history
        const responseObj = {
            sender: 'Sahayak',
            text: response,
            className: 'ai-message',
            timestamp: timestamp
        };
        
        // Add to UI
        addMessage(responseObj.sender, responseObj.text, responseObj.className);
        
        // Store in conversation history
        appState.conversationHistory[appState.currentMode].push(responseObj);
        
        // Speak the response
        appState.isSpeaking = true;
        speechHandler.speak(response, () => {
            // On speech end
            appState.isSpeaking = false;
        });
        
    } catch (error) {
        console.error('Error processing input:', error);
        
        // Remove typing indicator if it exists
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Add error message
        addMessage(
            'System', 
            'Sorry, I encountered an error while processing your request. Please try again.', 
            'error-message'
        );
        
        // If API key error, add more specific message
        if (error.message && error.message.includes('API key')) {
            addMessage(
                'System',
                'There seems to be an issue with the API key. Please check your configuration.',
                'error-message'
            );
        }
    } finally {
        // Reset processing state
        appState.isProcessing = false;
        elements.sendButton.disabled = false;
        elements.micButton.disabled = false;
    }
}

/**
 * Add a message to the chat history
 * @param {string} sender - The sender of the message
 * @param {string} text - The message content
 * @param {string} className - CSS class for styling
 */
function addMessage(sender, text, className) {
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className, 'fade-in');
    
    // Add sender name (if not user)
    if (sender !== 'You') {
        const senderSpan = document.createElement('div');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = sender;
        messageDiv.appendChild(senderSpan);
    }
    
    // Add message text
    const textPara = document.createElement('p');
    textPara.classList.add('message-text');
    textPara.textContent = text;
    messageDiv.appendChild(textPara);
    
    // Add timestamp
    const timestampSpan = document.createElement('div');
    timestampSpan.classList.add('message-timestamp');
    const now = new Date();
    timestampSpan.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    messageDiv.appendChild(timestampSpan);
    
    // Add to chat history
    elements.chatHistory.appendChild(messageDiv);
    
    // Scroll to the bottom
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
    
    return messageDiv;
}

/**
 * Add a typing indicator to show AI is processing
 */
function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'ai-message', 'typing-indicator');
    
    const dots = document.createElement('div');
    dots.classList.add('typing-dots');
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dots.appendChild(dot);
    }
    
    indicator.appendChild(dots);
    elements.chatHistory.appendChild(indicator);
    
    // Scroll to the bottom
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
    
    return indicator;
}

/**
 * Remove the typing indicator
 * @param {HTMLElement} indicator - The indicator element to remove
 */
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

/**
 * Clear the chat history
 * @param {boolean} keepWelcome - Whether to keep the welcome message
 */
function clearChatHistory(keepWelcome = true) {
    if (keepWelcome) {
        // Keep only the welcome message
        const welcomeMessage = elements.chatHistory.querySelector('.welcome-message');
        elements.chatHistory.innerHTML = '';
        if (welcomeMessage) {
            elements.chatHistory.appendChild(welcomeMessage);
        } else {
            // Create new welcome message if none exists
            const welcomeDiv = document.createElement('div');
            welcomeDiv.classList.add('welcome-message');
            
            const welcomeText = document.createElement('p');
            welcomeText.textContent = appState.welcomeMessages[appState.currentMode] || 
                `Welcome to ${capitalizeFirst(appState.currentMode)} Mode. How may I help you?`;
            
            welcomeDiv.appendChild(welcomeText);
            elements.chatHistory.appendChild(welcomeDiv);
        }
    } else {
        // Clear everything
        elements.chatHistory.innerHTML = '';
    }
}

/**
 * Handle the emergency button press
 */
function handleEmergencyRequest() {
    // Stop any ongoing speech
    if (appState.isSpeaking) {
        stopSpeaking();
    }
    
    // Reset user location before attempting to get new location
    appState.userLocation = null;

    // Explicitly request geolocation
    if (CONFIG.EMERGENCY_CONFIG.settings.attemptGeoLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Store detailed location information
                appState.userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                console.log("Location successfully obtained:", appState.userLocation);

                // Create and show emergency dialog after location is retrieved
                createEmergencyDialog();
            },
            (error) => {
                // Handle geolocation errors
                console.error("Geolocation error:", error);
                
                // Create dialog even if location fails
                createEmergencyDialog();

                // Optionally, show a notification about location access
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location access was denied. Emergency contacts won't receive precise location.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("Location request timed out.");
                        break;
                }
            },
            {
                // Enhanced location options
                enableHighAccuracy: true, // Most accurate location
                timeout: 10000,           // 10 seconds to get location
                maximumAge: 0             // Don't use cached location
            }
        );
    } else {
        // If geolocation is not supported or disabled
        createEmergencyDialog();
        console.warn("Geolocation not supported or disabled");
    }
}

// Separate function to create emergency dialog
function createEmergencyDialog() {
    // Create HTML for secondary contacts
    let secondaryContactsHTML = '';
    if (CONFIG.EMERGENCY_CONFIG.secondaryContacts && 
        CONFIG.EMERGENCY_CONFIG.secondaryContacts.length > 0) {
        
        CONFIG.EMERGENCY_CONFIG.secondaryContacts.forEach(contact => {
            secondaryContactsHTML += `
                <button class="emergency-contact-btn" data-phone="${contact.phone}">
                    <i class="fas fa-user-friends"></i>
                    <div class="contact-info">
                        <span class="contact-name">${contact.name}</span>
                        <span class="contact-relationship">${contact.relationship}</span>
                    </div>
                    <i class="fas fa-phone"></i>
                </button>
            `;
        });
    }
    
    // Create dialog with correct content
    const dialog = document.createElement('div');
    dialog.classList.add('emergency-dialog');
    dialog.innerHTML = `
        <div class="emergency-dialog-content">
            <h3>Emergency Help</h3>
            <p>Who would you like to contact for help?</p>
            
            <div class="emergency-contacts">
                <!-- Primary contact -->
                <button class="emergency-contact-btn primary-contact" data-phone="${CONFIG.EMERGENCY_CONFIG.primaryContact.phone}">
                    <i class="fas fa-user-circle"></i>
                    <div class="contact-info">
                        <span class="contact-name">${CONFIG.EMERGENCY_CONFIG.primaryContact.name}</span>
                        <span class="contact-relationship">${CONFIG.EMERGENCY_CONFIG.primaryContact.relationship}</span>
                    </div>
                    <i class="fas fa-phone"></i>
                </button>
                
                ${secondaryContactsHTML}
                
                <!-- Emergency services -->
                <button class="emergency-contact-btn emergency-service" data-phone="${CONFIG.EMERGENCY_CONFIG.emergencyServices.ambulance}">
                    <i class="fas fa-ambulance"></i>
                    <div class="contact-info">
                        <span class="contact-name">Ambulance</span>
                        <span class="contact-relationship">Emergency Medical Service</span>
                    </div>
                    <i class="fas fa-phone"></i>
                </button>
                
                <button class="emergency-contact-btn emergency-service" data-phone="${CONFIG.EMERGENCY_CONFIG.emergencyServices.helpline}">
                    <i class="fas fa-first-aid"></i>
                    <div class="contact-info">
                        <span class="contact-name">Emergency Helpline</span>
                        <span class="contact-relationship">General Emergency</span>
                    </div>
                    <i class="fas fa-phone"></i>
                </button>
            </div>
            
            <div class="emergency-actions">
                <button id="cancelEmergency" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(dialog);
    
    // Add event listeners for contact buttons
    const contactButtons = dialog.querySelectorAll('.emergency-contact-btn');
    contactButtons.forEach(button => {
        button.addEventListener('click', () => {
            const phoneNumber = button.getAttribute('data-phone');
            const contactName = button.querySelector('.contact-name').textContent;
            initiateEmergencyCall(phoneNumber, contactName);
            dialog.remove();
        });
    });
    
    // Add cancel button handler
    const cancelButton = dialog.querySelector('#cancelEmergency');
    cancelButton.addEventListener('click', () => {
        dialog.remove();
    });
}

/**
 * Initiate an emergency phone call
 * @param {string} phoneNumber - The phone number to call
 * @param {string} contactName - The name of the contact being called
 */
function initiateEmergencyCall(phoneNumber, contactName) {
    // Prepare emergency message
    let emergencyMessage = CONFIG.EMERGENCY_CONFIG.messageTemplate
        .replace('[NAME]', contactName)
        .replace('[LOCATION]', 'Location');
    
    // Add location information if available
    if (appState.userLocation) {
        const mapsUrl = `https://www.google.com/maps?q=${appState.userLocation.latitude},${appState.userLocation.longitude}`;
        emergencyMessage += `\n\nMy Location:\n${mapsUrl}`;
        
        emergencyMessage += `\n\nLocation Details:
- Latitude: ${appState.userLocation.latitude}
- Longitude: ${appState.userLocation.longitude}
- Accuracy: ${appState.userLocation.accuracy} meters
- Timestamp: ${new Date().toLocaleString()}`;
    } else {
        emergencyMessage += "\n\nLocation could not be determined.";
    }

    // Create call overlay
    const callOverlay = document.createElement('div');
    callOverlay.classList.add('call-overlay');
    callOverlay.innerHTML = `
        <div class="call-content">
            <div class="call-options">
                <button class="call-option" id="phoneCall">
                    <i class="fas fa-phone"></i> Phone Call
                </button>
                <button class="call-option" id="whatsAppMessage">
                    <i class="fab fa-whatsapp"></i> WhatsApp Message
                </button>
                <button class="call-option" id="smsMessage">
                    <i class="fas fa-sms"></i> SMS Message
                </button>
                <button class="call-option" id="cancelEmergency">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(callOverlay);
    
    // Phone Call handler
    const phoneCallBtn = callOverlay.querySelector('#phoneCall');
    phoneCallBtn.addEventListener('click', () => {
        try {
            window.location.href = `tel:${phoneNumber}`;
            callOverlay.remove();
        } catch (error) {
            console.error("Error initiating call:", error);
        }
    });
    
    // WhatsApp Message handler
    const whatsAppBtn = callOverlay.querySelector('#whatsAppMessage');
    whatsAppBtn.addEventListener('click', () => {
        try {
            // Clean phone number (remove +, spaces, dashes)
            const cleanedNumber = phoneNumber.replace(/[\s+\-]/g, '');
            
            // Construct WhatsApp URL with full international format
            const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(emergencyMessage)}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            callOverlay.remove();
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
        }
    });
    
    // SMS Message handler
    const smsBtn = callOverlay.querySelector('#smsMessage');
    smsBtn.addEventListener('click', () => {
        try {
            // Attempt to open SMS app
            window.location.href = `sms:${phoneNumber}?body=${encodeURIComponent(emergencyMessage)}`;
            callOverlay.remove();
        } catch (error) {
            console.error("Error sending SMS:", error);
        }
    });
    
    // Cancel button handler
    const cancelBtn = callOverlay.querySelector('#cancelEmergency');
    cancelBtn.addEventListener('click', () => {
        callOverlay.remove();
    });
}

/**
 * Send an emergency SMS with location information
 * @param {string} phoneNumber - The phone number to send SMS to
 * @param {string} contactName - The name of the contact
 * @param {string} message - The emergency message to send
 */
function sendEmergencySMS(phoneNumber, contactName, message) {
    // This is a simulation - in a real app, you would use an SMS API
    try {
        const smsLink = document.createElement('a');
        smsLink.href = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        smsLink.style.display = 'none';
        document.body.appendChild(smsLink);
        
        // Only trigger on mobile devices
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            smsLink.click();
        }
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(smsLink);
        }, 1000);
    } catch (error) {
        console.error("Error initiating SMS:", error);
    }
}

/**
 * Change the font size
 * @param {number} delta - The amount to change (positive or negative)
 */
function changeFontSize(delta) {
    // Calculate new font size
    const newSize = appState.currentFontSize + delta;
    
    // Check bounds
    if (newSize < CONFIG.APP_SETTINGS.minFontSize || 
        newSize > CONFIG.APP_SETTINGS.maxFontSize) {
        return;
    }
    
    // Update state
    appState.currentFontSize = newSize;
    
    // Save preference
    localStorage.setItem('sahayak_fontSize', newSize.toString());
    
    // Apply change
    updateFontSize();
}

/**
 * Update the font size based on current state
 */
function updateFontSize() {
    // Set new font size as CSS variable
    document.documentElement.style.setProperty(
        '--font-size-base', 
        `${appState.currentFontSize}px`
    );
    document.documentElement.style.setProperty(
        '--font-size-large', 
        `${appState.currentFontSize * 1.25}px`
    );
    document.documentElement.style.setProperty(
        '--font-size-xlarge', 
        `${appState.currentFontSize * 1.5}px`
    );
}

/**
 * Toggle high contrast mode
 */
function toggleHighContrast() {
    appState.highContrastMode = !appState.highContrastMode;
    
    // Toggle class on body
    document.body.classList.toggle('high-contrast', appState.highContrastMode);
    
    // Save preference
    localStorage.setItem('sahayak_highContrast', appState.highContrastMode.toString());
}

/**
 * Show the speaking indicator when AI is speaking
 */
function showSpeakingIndicator() {
    elements.speakingIndicator.classList.remove('hidden');
    appState.isSpeaking = true;
}

/**
 * Hide the speaking indicator when AI stops speaking
 */
function hideSpeakingIndicator() {
    elements.speakingIndicator.classList.add('hidden');
    appState.isSpeaking = false;
}

/**
 * Stop the AI from speaking
 */
function stopSpeaking() {
    if (appState.isSpeaking) {
        speechHandler.stopSpeaking();
        hideSpeakingIndicator();
        appState.isSpeaking = false;
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Creates a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 * @param {number} duration - How long to show the notification (ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`, 'fade-in');
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 500);
    }, duration);
}

// Start the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);