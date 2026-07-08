import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { name, items } = await req.json();

    if (!name || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }

    const itemsListString = items.map(i => `${i.servings} serving(s) of ${i.name}`).join(", ");

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

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    let response;
    try {
      response = await model.generateContent(prompt);
    } catch (apiError) {
      console.warn("Primary AI failed (likely rate limit). Falling back to flash lite...", apiError);
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
      response = await fallbackModel.generateContent(prompt);
    }

    let responseText = response.response.text();
    
    // Parse the JSON (clean up any possible markdown if the model hallucinated it)
    const cleanedText = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const nutritionalInfo = JSON.parse(cleanedText);

    return NextResponse.json(nutritionalInfo);
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json({ error: "Failed to analyze meal data" }, { status: 500 });
  }
}
