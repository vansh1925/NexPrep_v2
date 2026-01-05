// Test file to check correct @google/genai API usage
import { GoogleGenAI } from "@google/genai";

async function testAPI() {
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GOOGLE_GENAI_API_KEY 
    });

    try {
        // Test the API call
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash-latest",
            contents: {
                role: "user",
                parts: [{ text: "Say hello" }]
            }
        });
        
        console.log("Success!", response.text);
    } catch (error) {
        console.error("Error:", error.message);
        console.error("Status:", error.status);
    }
}

testAPI();
