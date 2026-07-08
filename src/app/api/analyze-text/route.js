export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {

    const { text, type } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";
    if (type === "exercise") {
      prompt = `Analyze this exercise description and estimate the calories burned. 
      Input: "${text}"
      Format the response strictly as a JSON object with the following keys:
      - name: string (best guess of the exercise name)
      - caloriesBurned: number
      - durationMinutes: number
      Do not include any markdown formatting like \`\`\`json or \`\`\` in the response. Just the raw JSON object.`;
    } else {
      prompt = `Analyze this food item: "${text}". 
      Format the response strictly as a JSON object with the following keys:
      - name: String (name of the food)
      - servings: Number (estimated number of servings, default to 1)
      - calories: Number (estimated total calories)
      - protein: Number (estimated total protein in grams)
      - carbs: Number (estimated total carbs in grams)
      - fat: Number (estimated total fat in grams)
      - items: Array of Objects (Optional. If the meal consists of multiple distinct foods, break them down here. Each object must have: name, calories, protein, carbs, fat, servings.)
      
      Do not include any markdown formatting like \`\`\`json or \`\`\` in the response. Just the raw JSON object.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON (clean up any possible markdown if the model hallucinated it)
    const cleanedText = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const parsedInfo = JSON.parse(cleanedText);

    return NextResponse.json(parsedInfo);
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}
