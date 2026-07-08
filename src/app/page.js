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
        
        {/* Daily Summary Card */}
        <div className="bg-[#111827] text-white rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1 mr-6">
              <p className="text-gray-400 font-semibold text-[11px] uppercase tracking-widest mb-4">Calories</p>
              
              <div className="flex justify-between items-center text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold tracking-tight">{consumedCalories}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Food</div>
                </div>
                
                <div className="text-gray-600 font-bold">-</div>
                
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold tracking-tight">0</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Exercise</div>
                </div>
                
                <div className="text-gray-600 font-bold">=</div>
                
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-extrabold text-green-400 tracking-tight">{remainingCalories}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Remaining</div>
                </div>
              </div>
            </div>
            
            {/* Circular Progress (CSS based) */}
            <div className="relative w-[76px] h-[76px] flex items-center justify-center shrink-0">
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
                <Flame className="w-5 h-5 text-green-400 fill-green-400/20" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 relative z-10">
            {/* Protein Ring */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(100, (consumedProtein/150)*100)) / 100} className="text-red-400 transition-all" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-bold text-red-400 uppercase">Pro</span></div>
              </div>
              <div className="flex flex-col">
                <p className="font-extrabold text-[15px] leading-none">{Math.round(consumedProtein)}<span className="text-[10px] text-gray-400 ml-0.5">g</span></p>
              </div>
            </div>
            
            {/* Carbs Ring */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(100, (consumedCarbs/250)*100)) / 100} className="text-blue-400 transition-all" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-bold text-blue-400 uppercase">Car</span></div>
              </div>
              <div className="flex flex-col">
                <p className="font-extrabold text-[15px] leading-none">{Math.round(consumedCarbs)}<span className="text-[10px] text-gray-400 ml-0.5">g</span></p>
              </div>
            </div>

            {/* Fat Ring */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(100, (consumedFat/65)*100)) / 100} className="text-orange-400 transition-all" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[9px] font-bold text-orange-400 uppercase">Fat</span></div>
              </div>
              <div className="flex flex-col">
                <p className="font-extrabold text-[15px] leading-none">{Math.round(consumedFat)}<span className="text-[10px] text-gray-400 ml-0.5">g</span></p>
              </div>
            </div>
          </div>

          {/* Decorative background gradients */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-500/20 rounded-full blur-[60px]"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]">          </div>
        </div>

        {/* Fasting Widget */}
        <FastingWidget defaultLastMealTime={latestMeal ? latestMeal.loggedAt.toISOString() : null} />

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
