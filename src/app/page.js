export const dynamic = 'force-dynamic';

import { Bell, Flame, Clock } from "lucide-react";
import prisma from "@/lib/prisma";
import { FoodInput } from "@/components/FoodInput";
import { MealCard } from "@/components/MealCard";
import { format } from "date-fns";

export default async function Dashboard() {
  const userId = "default_user_janitha";
  const defaultTdee = 2000;

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

  // Progress percentage for the ring
  const progressPercent = Math.min(100, Math.round((consumedCalories / defaultTdee) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight leading-tight">Hello Janitha</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Let's crush your goals today</p>
        </div>
        <button className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 relative transition-transform active:scale-95">
          <Bell className="w-[22px] h-[22px] text-gray-600 stroke-[2.5px]" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <main className="flex-1 px-6 space-y-8">
        
        {/* Daily Summary Card */}
        <div className="bg-[#111827] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-semibold text-[13px] uppercase tracking-wider mb-2">Calories Remaining</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight">{remainingCalories}</span>
                <span className="text-gray-400 font-semibold">/ {defaultTdee} kcal</span>
              </div>
            </div>
            
            {/* Circular Progress (CSS based) */}
            <div className="relative w-[88px] h-[88px] flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                  className="text-green-400 transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Flame className="w-[26px] h-[26px] text-green-400 mb-0.5 fill-green-400/20" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 relative z-10">
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
              <p className="text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wide">Protein</p>
              <p className="font-extrabold text-lg">{Math.round(consumedProtein)}<span className="text-[13px] text-gray-400 font-semibold ml-0.5">g</span></p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
              <p className="text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wide">Carbs</p>
              <p className="font-extrabold text-lg">{Math.round(consumedCarbs)}<span className="text-[13px] text-gray-400 font-semibold ml-0.5">g</span></p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
              <p className="text-[11px] text-gray-400 mb-1 font-bold uppercase tracking-wide">Fat</p>
              <p className="font-extrabold text-lg">{Math.round(consumedFat)}<span className="text-[13px] text-gray-400 font-semibold ml-0.5">g</span></p>
            </div>
          </div>

          {/* Decorative background gradients */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-500/20 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]"></div>
        </div>

        {/* Input Area */}
        <section className="relative z-20">
          <FoodInput />
        </section>

        {/* Today's Entries */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Today's Entries</h3>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-200/60 px-3 py-1.5 rounded-full uppercase tracking-wider">{todayMeals.length} items</span>
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
