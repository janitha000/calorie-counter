export const dynamic = 'force-dynamic';

import { Bell, Flame, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { FoodInput } from "@/components/FoodInput";
import { MealCard } from "@/components/MealCard";
import { FastingWidget } from "@/components/FastingWidget";
import { format } from "date-fns";

export default async function Dashboard() {
  const userId = "default_user_janitha";
  const defaultTdee = 1600;

  // Auto-create or fetch user
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: "Janitha",
      tdee: defaultTdee,
    }
  });

  // Get today's start and end date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's meals
  const todayMeals = await prisma.meal.findMany({
    where: {
      userId: userId,
      loggedAt: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: {
      loggedAt: 'desc'
    }
  });

  // Calculate stats
  const consumedCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const consumedProtein = todayMeals.reduce((acc, meal) => acc + meal.protein, 0);
  const consumedCarbs = todayMeals.reduce((acc, meal) => acc + meal.carbs, 0);
  const consumedFat = todayMeals.reduce((acc, meal) => acc + meal.fat, 0);
  const remainingCalories = Math.max(0, defaultTdee - consumedCalories);

  // Fetch absolutely latest meal for fasting tracker
  const latestMeal = await prisma.meal.findFirst({
    where: { userId: userId },
    orderBy: { loggedAt: 'desc' }
  });

  // Progress percentage for the ring
  const progressPercent = Math.min(100, Math.round((consumedCalories / defaultTdee) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      {/* Removed Header for cleaner look */}

      <main className="flex-1 px-4 pt-6 space-y-6">
        
        {/* Top Spacer */}
        <div className="pt-2"></div>

        {/* Input Area */}
        <section className="relative z-20">
          <FoodInput />
        </section>

        {/* Today's Entries */}
        <section className="relative z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-extrabold text-gray-900 tracking-tight">Today's Entries</h3>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-full uppercase tracking-wider">{todayMeals.length} items</span>
          </div>

          <div className="space-y-3.5">
            {todayMeals.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-gray-900 font-bold text-lg">No meals logged yet</p>
                <p className="text-gray-500 font-medium mt-1">Use the camera to snap your first meal!</p>
              </div>
            ) : (
              todayMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
