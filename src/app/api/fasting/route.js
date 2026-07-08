import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();
    const userId = "default_user_janitha"; // MVP

    const fastingLog = await prisma.fastingLog.create({
      data: {
        userId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
      }
    });

    return NextResponse.json({ success: true, fastingLog });
  } catch (error) {
    console.error("Error saving fasting log:", error);
    return NextResponse.json({ error: "Failed to save fast" }, { status: 500 });
  }
}
