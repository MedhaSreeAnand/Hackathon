/**
 * Sahayak - API Handler
 * This file contains functions for interacting with the Gemini API
 */

class ApiHandler {
    constructor(apiKey, apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.currentMode = 'information'; // Default mode
    }

    /**
     * Set the current conversation mode
     * @param {string} mode - The mode to set (information, religious, wellness, ordering)
     */
    setMode(mode) {
        if (CONFIG.PROMPT_PREFIXES[mode]) {
            this.currentMode = mode;
            console.log(`Mode set to: ${mode}`);
            return true;
        }
        console.error(`Invalid mode: ${mode}`);
        return false;
    }

    /**
     * Generate a prompt based on user input and current mode
     * @param {string} userInput - The user's input text or transcribed speech
     * @returns {string} - The complete prompt to send to the API
     */
    generatePrompt(userInput) {
        // Get the appropriate prefix for the current mode
        const prefix = CONFIG.PROMPT_PREFIXES[this.currentMode];
        
        // For ordering mode, add a reminder about location information
        if (this.currentMode === 'ordering' && 
            !userInput.toLowerCase().includes('address') && 
            !userInput.toLowerCase().includes('location')) {
            return `${prefix}${userInput} Note: Remember to ask for the user's address or location if needed for delivery.`;
        }
        
        return `${prefix}${userInput}`;
    }

    /**
     * Send a request to the Gemini API
     * @param {string} userInput - The user's input
     * @returns {Promise<string>} - The API response text
     */
    /**
 * Updated sendRequest method for apiHandler.js
 * This fixes the API request format to match the current Gemini API
 */

async sendRequest(userInput) {
    try {
        // Generate the appropriate prompt based on mode
        const prompt = this.generatePrompt(userInput);
        
        // Updated request data structure for Gemini API v1
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
        
        console.log("Sending request to Gemini API:", this.apiUrl);
        
        // Send the request to the Gemini API
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        // Log response status
        console.log("API response status:", response.status);
        
        // Handle API errors
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        // Parse the response
        const data = await response.json();
        console.log("API response received");
        
        // Extract and return the text response (updated path for v1 API)
        if (data.candidates && data.candidates[0]?.content?.parts && 
            data.candidates[0].content.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected API response format:", data);
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Error in sendRequest:', error);
        throw error; // Re-throw to be handled by the caller
    }
}
    
    /**
     * Alternative implementation for OpenAI GPT if needed
     * @param {string} userInput - The user's input
     * @returns {Promise<string>} - The API response
     */
    async sendRequestGPT(userInput) {
        // This is just a placeholder to show how you could swap in GPT
        // You would need to adjust this to match OpenAI's API requirements
        try {
            // Using OpenAI's API (would need the OpenAI SDK or fetch implementation)
            const prompt = this.generatePrompt(userInput);
            
            /* OpenAI implementation would look something like:
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: CONFIG.PROMPT_PREFIXES[this.currentMode] },
                        { role: 'user', content: userInput }
                    ]
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content;
            */
            
            // For this example, we're just returning a placeholder
            return "This is a placeholder for GPT API integration. Replace with actual OpenAI API calls.";
        } catch (error) {
            console.error('Error in sendRequestGPT:', error);
            throw error;
        }
    }
}

// Create a global instance of the API handler
const apiHandler = new ApiHandler(CONFIG.GEMINI_API_KEY, CONFIG.GEMINI_API_URL);