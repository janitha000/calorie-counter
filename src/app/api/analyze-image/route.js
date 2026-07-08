export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Determine mime type from file, fallback to jpeg
    const mimeType = image.type || "image/jpeg";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this food image and provide the nutritional information. 
    Format the response strictly as a JSON object with the following keys:
    - name: string (best guess of the food name)
    - calories: number
    - protein: number (in grams)
    - carbs: number (in grams)
    - fat: number (in grams)
    Do not include any markdown formatting like \`\`\`json or \`\`\` in the response. Just the raw JSON object.`;

    const imageParts = [
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
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
