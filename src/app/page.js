export const dynamic = 'force-dynamic';

import { Bell, Flame, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { FoodInput } from "@/components/FoodInput";
import { MealCard } from "@/components/MealCard";
import { FastingTracker } from "@/components/FastingTracker";
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
  const calorieDiff = defaultTdee - consumedCalories;
  
  // Progress percentage for the ring/bar
  const progressPercent = Math.min(100, Math.round((consumedCalories / defaultTdee) * 100));

  const getCalorieColor = (prefix = 'bg') => {
    if (consumedCalories <= defaultTdee) return `${prefix}-green-400`;
    if (consumedCalories <= defaultTdee * 1.2) return `${prefix}-orange-400`;
    return `${prefix}-red-400`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      {/* Removed Header for cleaner look */}

      <main className="flex-1 px-4 pt-6 space-y-6">
        
        {/* Daily Summary Card */}
        <div className="bg-[#111827] text-white rounded-[24px] p-5 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 font-semibold text-[10px] uppercase tracking-widest">Daily Calories</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black tracking-tight">{consumedCalories}</span>
                  <span className="text-gray-500 font-bold text-sm">/ {defaultTdee} kcal</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-2xl font-black tracking-tight ${getCalorieColor('text')}`}>
                  {Math.abs(calorieDiff)}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${calorieDiff < 0 ? getCalorieColor('text') : 'text-gray-400'}`}>
                  {calorieDiff >= 0 ? 'kcal left' : 'kcal over'}
                </span>
              </div>
            </div>

            {/* Calorie progress bar */}
            <div className="mb-4">
              <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getCalorieColor('bg')}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-gray-500 font-bold">0</span>
                <span className={`text-[9px] font-bold ${calorieDiff < 0 ? getCalorieColor('text') : 'text-gray-500'}`}>
                  {Math.round((consumedCalories / defaultTdee) * 100)}%
                </span>
                <span className="text-[9px] text-gray-500 font-bold">{defaultTdee}</span>
              </div>
            </div>

            {/* Macros row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Protein', consumed: Math.round(consumedProtein), goal: 135 },
                { label: 'Carbs',   consumed: Math.round(consumedCarbs),   goal: 135 },
                { label: 'Fat',     consumed: Math.round(consumedFat),     goal: 58 },
              ].map(({ label, consumed, goal }) => {
                const pct = Math.min(100, Math.round((consumed / goal) * 100));
                const diff = goal - consumed;
                const statusText = diff >= 0 ? `${diff}g left` : `${Math.abs(diff)}g over`;
                
                let color = 'bg-gray-400';
                let textColor = 'text-gray-400';
                if (label === 'Protein') {
                  if (consumed >= goal) { color = 'bg-green-400'; textColor = 'text-green-400'; }
                  else if (consumed >= goal * 0.8) { color = 'bg-orange-400'; textColor = 'text-orange-400'; }
                  else { color = 'bg-red-400'; textColor = 'text-red-400'; }
                } else {
                  if (consumed <= goal) { color = 'bg-green-400'; textColor = 'text-green-400'; }
                  else if (consumed <= goal * 1.2) { color = 'bg-orange-400'; textColor = 'text-orange-400'; }
                  else { color = 'bg-red-400'; textColor = 'text-red-400'; }
                }

                return (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{label}</span>
                      <span className="text-[10px] font-bold text-gray-300">{consumed}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-[9px] font-bold mt-0.5 ${diff < 0 ? textColor : 'text-gray-500'}`}>{statusText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decorative background gradients */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-500/20 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]"></div>
        </div>

        {/* Compact Fasting Tracker */}
        <FastingTracker fallbackStartTime={latestMeal ? latestMeal.loggedAt.toISOString() : null} />

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
