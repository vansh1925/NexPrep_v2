
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"

export async function POST(req) {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })
    try {
        // Parse the form data from the request
        const formData = await req.json();
        
        // Construct the prompt based on form data
        const prompt = constructInterviewPrompt(formData);
        
        // Initialize the AI client
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
            // maxOutputTokens: 1000,
            // temperature: 0.7
        });
        
        let questionsData;
        
        try {
            // Get the response text
            let responseText = response.text;
            
            // Clean the raw text to ensure it is a valid JSON array from beginning to end
            const cleanText = responseText.replace(/^```json\s*/, "") // remove starting ```json
                                         .replace(/```$/, "") // remove ending ```
                                         .trim(); // trim whitespace
            
            // Parse the cleaned text as JSON
            questionsData = JSON.parse(cleanText);
            
        } catch (initialError) {
            console.log("Initial parse failed:", initialError);
            
            // If that fails, try to extract just the array part
            const jsonMatch = response.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questionsData = JSON.parse(jsonMatch[0]);
            } else {
                throw initialError;
            }
        }
        
        // Validate the parsed questions to ensure they have the expected structure
        if (Array.isArray(questionsData)) {
            questionsData = questionsData.map(q => ({
                question: q.question || "Question text missing",
                tests: q.tests || "Evaluation criteria not provided",
                sampleAnswer: q.sampleAnswer || "Sample answer not provided",
                followUps: Array.isArray(q.followUps) ? q.followUps : []
            }));
        }
        
        // Return the generated questions
        return NextResponse.json({ 
            success: true, 
            questions: questionsData,
            rawResponse: response.text, // Include raw response for debugging
            metadata: {
                model: "gemini-2.0-flash-lite",
                jobPosition: formData.jobPosition,
                difficultyLevel: formData.difficultyLevel
            }
        });
        
    } catch (error) {
        console.error("Error generating interview questions:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Constructs a detailed prompt for the AI based on the interview form data
 */
function constructInterviewPrompt(formData) {
    const {
        jobPosition,
        jobDescription,
        experienceLevel,
        interviewDuration,
        difficultyLevel
    } = formData;
    
    // Convert experience level to human-readable format
    const experienceLevelText = {
        'entry': 'Entry Level (0-2 years)',
        'mid': 'Mid Level (2-5 years)',
        'senior': 'Senior Level (5-8 years)',
        'expert': 'Expert Level (8+ years)'
    }[experienceLevel] || experienceLevel;

    // Calculate approximate number of questions based on duration
    const durationMatch = interviewDuration.match(/(\d+)/);
    const durationInMinutes = durationMatch ? parseInt(durationMatch[1]) : 30;
    const suggestedQuestionCount = Math.max(5, Math.floor(durationInMinutes / 5));
    
    return `
You are an experienced AI Interview Engineer at a top-tier tech company.

Your task is to generate a curated list of ${suggestedQuestionCount} high-quality interview questions designed for the role of "${jobPosition}". These questions will be used in an AI-powered mock interview platform to assess and improve candidates’ skills before actual interviews.

Use the details below to craft questions that are relevant, fair, and structured according to the role and interview strategy.

CANDIDATE PROFILE AND ROLE DETAILS:
- Job Position: ${jobPosition}
- Role Description: ${jobDescription}
- Candidate Experience Level: ${experienceLevelText}

INTERVIEW DESIGN PARAMETERS:
- Total Interview Duration: ${interviewDuration}
- Difficulty Level: ${difficultyLevel}

OBJECTIVE:
Generate a balanced set of interview questions that reflect real-world scenarios and expectations for the role. Your questions should help assess both core competencies and soft skills relevant to the position.

GUIDELINES:
1. Create a mix of question types appropriate for the role:
   - Technical: code-related, architecture, tools, or best practices.
   - Behavioral: mindset, communication, decision-making.
   - Experience-based: past roles, responsibilities, challenges.
   - Problem Solving: analytical and creative approaches.
   - Leadership: initiative, team handling, strategic thinking.

2. Tailor your questions to suit ${experienceLevelText} level candidates and match the overall ${difficultyLevel.toLowerCase()} difficulty.

3. Focus on testing skills and responsibilities relevant to the role based on the job description provided.

4. For each question, return an object with the following structure:
   {
     "question": "Write the question text here.",
     "tests": "Clearly explain what skill or knowledge this question evaluates.",
     "sampleAnswer": "Provide a sample answer or describe what a strong response should include.",
     "followUps": ["Optional follow-up question 1", "Optional follow-up 2"]
   }

OUTPUT FORMAT:
Return a JSON array of question objects. Do not include any extra commentary or explanations outside the array.
`;
}