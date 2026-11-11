import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const userId = "default_user_janitha";

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 155,
  carbs: 235,
  fat: 65,
  sugar: 35,
  water: 8,
};

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tdee: true, goal: true },
    });

    let goals = { ...DEFAULT_GOALS };
    if (user?.goal) {
      try {
        goals = { ...goals, ...JSON.parse(user.goal) };
      } catch (e) {}
    } else if (user?.tdee) {
      goals.calories = user.tdee;
    }

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const goals = {
      calories: Number(body.calories) || DEFAULT_GOALS.calories,
      protein: Number(body.protein) || DEFAULT_GOALS.protein,
      carbs: Number(body.carbs) || DEFAULT_GOALS.carbs,
      fat: Number(body.fat) || DEFAULT_GOALS.fat,
      sugar: Number(body.sugar) || DEFAULT_GOALS.sugar,
      water: Number(body.water) || DEFAULT_GOALS.water,
    };

    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        tdee: goals.calories,
        goal: JSON.stringify(goals),
      },
      create: {
        id: userId,
        name: "Janitha",
        tdee: goals.calories,
        goal: JSON.stringify(goals),
      },
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error("Error saving goals:", error);
    return NextResponse.json({ error: "Failed to save goals" }, { status: 500 });
  }
}
