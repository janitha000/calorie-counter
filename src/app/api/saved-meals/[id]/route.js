import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const userId = "default_user_janitha"; // hardcoded default user

    // Verify ownership and delete
    await prisma.savedMeal.delete({
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
