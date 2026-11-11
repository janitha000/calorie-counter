import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const data = await req.json();

    const updateData = {
      name: data.name,
      items: data.items || null,
      servings: Number(data.servings) || 1,
      calories: Number(data.calories) || 0,
      protein: Number(data.protein) || 0,
      carbs: Number(data.carbs) || 0,
      fat: Number(data.fat) || 0,
      sugar: Number(data.sugar) || 0,
      insight: data.insight || null,
    };

    if (data.loggedAt) {
      updateData.loggedAt = new Date(data.loggedAt);
    }
    if (data.type) {
      updateData.type = data.type;
    }

    const meal = await prisma.meal.update({
      where: { id },
      data: updateData,
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
