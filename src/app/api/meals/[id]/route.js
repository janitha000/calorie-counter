import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const meal = await prisma.meal.update({
      where: { id },
      data: {
        name: data.name,
        items: data.items || null,
        servings: Number(data.servings),
        calories: Number(data.calories),
        protein: Number(data.protein),
        carbs: Number(data.carbs),
        fat: Number(data.fat),
      }
    });

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json({ error: "Failed to update meal" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    
    await prisma.meal.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
