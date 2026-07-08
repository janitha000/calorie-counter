import prisma from "@/lib/prisma";
import { FastingTracker } from "@/components/FastingTracker";

export const dynamic = 'force-dynamic';

export default async function TrackerPage() {
  const userId = "default_user_janitha";
  const defaultTdee = 1600;

  // Get today's start and end date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's meals for Calorie Summary
  const todayMeals = await prisma.meal.findMany({
    where: {
      userId: userId,
      loggedAt: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const consumedCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const remainingCalories = Math.max(0, defaultTdee - consumedCalories);

  // Fetch latest meal as fallback for Fasting
  const latestMeal = await prisma.meal.findFirst({
    where: { userId: userId },
    orderBy: { loggedAt: 'desc' }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <main className="flex-1 px-4 pt-6 space-y-6">
        
        {/* Daily Summary Card */}
        <div className="bg-[#111827] text-white rounded-[24px] p-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-400 font-semibold text-[11px] uppercase tracking-widest mb-4">Daily Calories</p>
              
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
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-green-500/20 rounded-full blur-[60px]"></div>
        </div>

        {/* Advanced Fasting Tracker */}
        <FastingTracker fallbackStartTime={latestMeal ? latestMeal.loggedAt.toISOString() : null} />

      </main>
    </div>
  );
}
