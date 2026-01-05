// List available Gemini models
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
    
    try {
        // Try different model names
        const modelNames = [
            "gemini-pro",
            "gemini-1.5-pro-latest",
            "models/gemini-pro",
            "models/gemini-1.5-pro-latest"
        ];
        
        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say hello");
                const response = await result.response;
                console.log(`✓ ${modelName} works!`);
                console.log(`  Response: ${response.text()}`);
                break;
            } catch (error) {
                console.log(`✗ ${modelName} failed: ${error.message}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
