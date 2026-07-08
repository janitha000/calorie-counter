import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Default user since we removed NextAuth
    const userId = "default_user_janitha";

    // Determine meal type based on current time to show a cute emoji on the frontend
    const hour = new Date().getHours();
    let type = "snack";
    if (hour >= 5 && hour < 11) type = "breakfast";
    else if (hour >= 11 && hour < 16) type = "lunch";
    else if (hour >= 16 && hour < 22) type = "dinner";

    const meal = await prisma.meal.create({
      data: {
        userId,
        name: data.name || "Unknown Food",
        items: data.items || null,
        servings: Number(data.servings) || 1,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        sugar: Number(data.sugar) || 0,
        type: data.type || type,
      }
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("Error saving meal:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
