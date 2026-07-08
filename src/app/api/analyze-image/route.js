export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {

    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Determine mime type from file, fallback to jpeg
    const mimeType = image.type || "image/jpeg";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze this food image and provide the nutritional information. 
    Format the response strictly as a JSON object with the following keys:
    - name: String (name of the food)
    - servings: Number (estimated number of servings shown, default to 1)
    - calories: Number (estimated total calories)
    - protein: Number (estimated total protein in grams)
    - carbs: Number (estimated total carbs in grams)
    - fat: Number (estimated total fat in grams)
    - sugar: Number (estimated total sugar in grams)
    - insight: String (A 30-50 character short, punchy insight evaluating the meal's nutrition, e.g. "High protein, but watch the sugar spike!" or "Great source of healthy fats!")
    - items: Array of Objects (Optional. If the meal consists of multiple distinct foods, break them down here. Each object must have: name, calories, protein, carbs, fat, sugar, servings.)
    
    Do not include markdown blocks or extra text, just the raw JSON object.`;

    const imageParts = [
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType
        },
      },
    ];

    let result;
    try {
      result = await model.generateContent([prompt, ...imageParts]);
    } catch (apiError) {
      console.warn("Primary AI failed (likely rate limit). Falling back to flash...", apiError);
      const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await flashModel.generateContent([prompt, ...imageParts]);
    }

    const responseText = result.response.text();
    
    // Parse the JSON (clean up any possible markdown if the model hallucinated it)
    const cleanedText = responseText.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    const nutritionalInfo = JSON.parse(cleanedText);

    return NextResponse.json(nutritionalInfo);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
