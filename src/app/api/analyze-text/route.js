export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { generateWithFallback, parseAIJson } from "@/lib/ai";

export async function POST(req) {
  try {
    const { text, type } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

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
      - sugar: Number (estimated total sugar in grams)
      - insight: String (A 30-50 character short, punchy insight evaluating the meal's nutrition, e.g. "High protein, but watch the sugar spike!" or "Great source of healthy fats!")
      - items: Array of Objects (Optional. If the meal consists of multiple distinct foods, break them down here. Each object must have: name, calories, protein, carbs, fat, sugar, servings.)
      
      Do not include any markdown formatting like \`\`\`json or \`\`\` in the response. Just the raw JSON object.`;
    }

    const responseText = await generateWithFallback(prompt);
    const parsedInfo = parseAIJson(responseText);

    return NextResponse.json(parsedInfo);
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}
