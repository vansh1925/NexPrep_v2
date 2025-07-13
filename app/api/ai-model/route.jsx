import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Parse the form data from the request
        const formData = await req.json();
        
        // Construct the prompt based on form data
        const prompt = constructInterviewPrompt(formData);
        
        // Initialize the AI client
        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTERAPI_KEY,
        });
        
        // Make request to the AI model
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
                { role: "system", content: "You are an expert technical interviewer designed to create relevant interview questions based on job requirements." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // Balanced between creativity and relevance
            max_tokens: 2000, // Enough tokens for multiple detailed questions
        });
        
        const response = completion.choices[0].message;
        console.log("AI Response Object:", response);
        console.log("AI Response Content Type:", typeof response.content);
        console.log("AI Response Raw Content:", response.content);
        
        // Try to parse the response content as JSON
        let questionsData = response.content;
        try {
            // Check if the content is already in JSON format or needs to be parsed
            if (typeof response.content === 'string') {
                // Clean up the response to remove Markdown code block markers
                let cleanedContent = response.content;
                
                // Remove Markdown code block markers (```json and ```)
                cleanedContent = cleanedContent.replace(/```json\s*/g, '');
                cleanedContent = cleanedContent.replace(/```\s*$/g, '');
                cleanedContent = cleanedContent.replace(/```/g, '');
                
                console.log("Cleaned content:", cleanedContent);
                
                // Try to extract JSON from the string if it's not already pure JSON
                try {
                    // First try with the cleaned content
                    questionsData = JSON.parse(cleanedContent);
                } catch (initialError) {
                    console.log("Initial parse failed:", initialError);
                    
                    // If that fails, try to extract just the array part
                    const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        questionsData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw initialError;
                    }
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
        } catch (error) {
            console.error("Error parsing AI response:", error);
            // If parsing fails, return the raw content
            questionsData = response.content;
        }
        
        // Return the generated questions
        return NextResponse.json({ 
            success: true, 
            questions: questionsData,
            rawResponse: response.content, // Include raw response for debugging
            metadata: {
                model: completion.model,
                jobPosition: formData.jobPosition,
                interviewType: formData.interviewType,
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
        interviewType,
        difficultyLevel,
        requiredSkills,
        topicsTocover,
        interviewFormat,
        additionalNotes
    } = formData;
    
    // Convert experience level to human-readable format
    const experienceLevelText = {
        'entry': 'Entry Level (0-2 years)',
        'mid': 'Mid Level (2-5 years)',
        'senior': 'Senior Level (5-8 years)',
        'expert': 'Expert Level (8+ years)'
    }[experienceLevel] || experienceLevel;
    
    // Convert interview format to human-readable format
    const interviewFormatText = {
        'conversational': 'Conversational',
        'structured': 'Structured Q&A',
        'technical': 'Technical Assessment',
        'mixed': 'Mixed Format'
    }[interviewFormat] || interviewFormat;

    // Calculate approximate number of questions based on duration
    const durationInMinutes = parseInt(interviewDuration) || 30;
    const suggestedQuestionCount = Math.max(5, Math.floor(durationInMinutes / 5));
    
    return `
You are an experienced AI Interview Engineer at a top-tier tech company.

Your task is to generate a curated list of ${suggestedQuestionCount} high-quality interview questions designed for the role of "${jobPosition}". These questions will be used in an AI-powered mock interview platform to assess and improve candidates’ skills before actual interviews.

Use the details below to craft questions that are relevant, fair, and structured according to the role and interview strategy.

CANDIDATE PROFILE AND ROLE DETAILS:
- Job Position: ${jobPosition}
- Role Description: ${jobDescription}
- Candidate Experience Level: ${experienceLevelText}
- Required Skills: ${requiredSkills}

INTERVIEW DESIGN PARAMETERS:
- Total Interview Duration: ${interviewDuration}
- Interview Types: ${interviewType.join(', ')}
- Interview Format: ${interviewFormatText}
- Difficulty Level: ${difficultyLevel}
${topicsTocover ? `- Specific Topics to Cover: ${topicsTocover}` : ''}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ''}

OBJECTIVE:
Generate a balanced set of interview questions that reflect real-world scenarios and expectations for the role. Your questions should help assess both core competencies and soft skills based on the selected interview type(s).

GUIDELINES:
1. Use the interview types (${interviewType.join(', ')}) as the foundation to distribute question types:
   - Technical: code-related, architecture, tools, or best practices.
   - Behavioral: mindset, communication, decision-making.
   - Experience-based: past roles, responsibilities, challenges.
   - Problem Solving: analytical and creative approaches.
   - Leadership: initiative, team handling, strategic thinking.

2. Tailor your questions to suit ${experienceLevelText} level candidates and match the overall ${difficultyLevel.toLowerCase()} difficulty.

3. Focus on testing the listed skills and responsibilities from the role description. Include domain-relevant challenges.

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