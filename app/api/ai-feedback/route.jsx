import OpenAI from "openai";
import { NextResponse } from "next/server";

function constructInterviewPrompt() {
    return `You are an AI Interview Evaluator.

Based on the following interview conversation between the AI assistant and the user (provided as {{conversation}}), analyze the user's performance.

Give me a structured feedback in **JSON format** that includes:

1. **rating** (out of 10) for:
- technicalSkills
- communication
- problemSolving
- experience

2. **summary**: A concise **3-line overview** of the candidate’s performance. Mention strengths, weaknesses, and tone (confidence, clarity, etc.).

3. **recommendation**: A one-word output — either "Hire" or "Reject".

4. **recommendationMsg**: A **short one-liner** to justify the recommendation decision clearly and professionally.

Only return a valid JSON object with these 4 keys. Be objective, insightful, and avoid any fluff.

Example:
{
  "feedback": {
    "rating": {
      "technicalSkills": 7,
      "communication": 8,
      "problemSolving": 6,
      "experience": 7
    },
    "summary": "The candidate demonstrated good experience and clear communication. Some technical areas showed hesitation. Problem-solving skills were average with room for deeper logic handling.",
    "recommendation": "Hire",
    "recommendationMsg": "Strong communication and experience make the candidate a good fit."
  }
}`;
}
export async function POST(req) {
  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTERAPI_KEY,
    });

    const body = await req.json(); // Parse the request body
    if (!body?.conversation) {
      return NextResponse.json({ error: "Conversation data is required" }, { status: 400 });
    }

    const prompt = constructInterviewPrompt();
    
    const conversationString = typeof body.conversation === 'object' 
      ? JSON.stringify(body.conversation) 
      : body.conversation;  
    const finalprompt = prompt.replace("{{conversation}}", conversationString);
    console.log("Final Prompt:", finalprompt);
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical interviewer designed to review candidates based on the job requirements and their responses.",
        },
        { role: "user", content: finalprompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let cleanedContent = completion.choices[0].message.content;
    cleanedContent = cleanedContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*$/g, "")
      .replace(/```/g, "");
    try {
      const parsedJson = JSON.parse(cleanedContent);
      return NextResponse.json(parsedJson);
    } catch (e) {
      console.log("Failed to parse as JSON:", e);
      return NextResponse.json({ cleanedContent });
    }

  } catch (error) {
    console.error("Error during AI feedback generation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  
}
