import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const { id } = await params; // params must be awaited in Next.js 15
    const userId = "default_user_janitha";

    // deleteMany lets us verify ownership (userId) alongside the id
    await prisma.savedMeal.deleteMany({
      where: {
        id: id,
        userId: userId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
