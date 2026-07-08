import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const userId = "default_user_janitha";
    const templates = await prisma.savedMeal.findMany({
      where: { userId }
    });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const userId = "default_user_janitha";

    const savedMeal = await prisma.savedMeal.create({
      data: {
        userId,
        name: data.name,
        items: data.items || null,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
        sugar: Number(data.sugar) || 0,
      }
    });

    return NextResponse.json({ success: true, savedMeal });
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}
