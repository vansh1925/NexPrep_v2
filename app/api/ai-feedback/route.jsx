
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"

function constructInterviewPrompt() {
    return `You are an AI Interview Evaluator.

Analyze the following interview conversation between the candidate and the interviewer (provided as {{conversation}}). Evaluate the candidate's performance across technical and soft skills.

Return your evaluation in this exact JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": X,
      "communication": Y,
      "problemSolving": Z,
      "experience": W
    },
    "summary": "Realistic 3-line overview of the candidate’s performance. Mention specific strengths, weaknesses, technical depth, and the tone (e.g. confident, unsure, generic, articulate).",
    "recommendation": "Hire" or "Reject",
    "recommendationMsg": "A sharp, one-line explanation for your decision, based on actual performance."
  }
}
Scoring Guidance:
0–3: Weak or no understanding

4–5: Basic, needs improvement

6–7: Average to good, but incomplete

8–9: Strong, confident grasp

10: Exceptional and in-depth

Critical Instructions:
If the candidate gives poor or vague answers, reflect it with low scores and a constructive summary.

Avoid default high ratings or fluff. Be brutally honest but fair.

Summarize in clear, interviewer-style language, as if giving post-interview notes to a hiring manager.

Only output a valid JSON object with the structure above. Do not include explanations or any extra text outside the JSON.`;
}
export async function POST(req) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

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
    const completion =  await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            // maxOutputTokens: 1000,
            // temperature: 0.7
        });

    let cleanedContent = completion.text;
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
