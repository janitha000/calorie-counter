import { NextResponse } from "next/server";
import { generateWithFallback, parseAIJson } from "@/lib/ai";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }

    const prompt = `
    Analyze this meal description and estimate the nutritional information.
    
    Meal description: "${name}"
    
    IMPORTANT: Derive the list of food items STRICTLY from the meal description above. Do NOT invent, add, or carry over items that are not mentioned in the description. For example, if the description says "rice, sambol and beet root curry", the items must only be rice, sambol, and beet root curry.
    
    Format the response strictly as a JSON object with the following keys:
    - name: String (keep it exactly as "${name}")
    - servings: Number (default to 1 for the total meal)
    - calories: Number (total calories of all items combined)
    - protein: Number (total protein in grams)
    - carbs: Number (total carbs in grams)
    - fat: Number (total fat in grams)
    - sugar: Number (total sugar in grams)
    - insight: String (A 30-50 character short, punchy insight evaluating the meal's nutrition, e.g. "High protein, but watch the sugar spike!")
    - items: Array of Objects. Each object must have: name (the specific food item from the description), servings, calories, protein, carbs, fat, sugar.
    
    Do not include any markdown formatting like \`\`\`json or \`\`\` in the response. Just the raw JSON object.`;

    const responseText = await generateWithFallback(prompt);
    const nutritionalInfo = parseAIJson(responseText);

    return NextResponse.json(nutritionalInfo);
  } catch (error) {
    console.error("Error analyzing meal:", error);
    return NextResponse.json({ error: "Failed to analyze meal data" }, { status: 500 });
  }
}
