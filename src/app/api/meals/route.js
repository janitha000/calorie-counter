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

    // Support logging for a specific dateParam (YYYY-MM-DD) while keeping current time of day
    let loggedAt = new Date();
    if (data.dateParam && /^\d{4}-\d{2}-\d{2}$/.test(data.dateParam)) {
      const [y, m, d] = data.dateParam.split('-').map(Number);
      loggedAt = new Date(
        y,
        m - 1,
        d,
        loggedAt.getHours(),
        loggedAt.getMinutes(),
        loggedAt.getSeconds()
      );
    }

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
        insight: data.insight || null,
        type: data.type || type,
        loggedAt,
      }
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("Error saving meal:", error);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
