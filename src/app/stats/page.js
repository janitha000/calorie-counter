import prisma from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { BarChart2 } from "lucide-react";
import { StatsCharts } from "@/components/StatsCharts";

export const dynamic = 'force-dynamic';

export default async function StatsPage({ searchParams }) {
  const userId = "default_user_janitha";
  
  // Limits
  const LIMITS = {
    calories: 1600,
    protein: 135,
    carbs: 135,
    fat: 58,
    sugar: 25,
    fasting: 16
  };

  // searchParams must be awaited in Next.js 15
  const resolvedParams = await searchParams;
  const range = resolvedParams?.range === 'monthly' ? 'monthly' : 'weekly';
  const numDays = range === 'monthly' ? 30 : 7;

  const today = new Date();
  const dateRange = Array.from({ length: numDays }).map((_, i) => startOfDay(subDays(today, (numDays - 1) - i)));

  const startDate = dateRange[0];
  const endDate = endOfDay(today);

  // Fetch meals
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: startDate, lte: endDate }
    }
  });

  // Fetch fasting logs
  const fasts = await prisma.fastingLog.findMany({
    where: {
      userId,
      startTime: { gte: startDate, lte: endDate }
    }
  });

  // Aggregate by Day
  const aggregatedData = dateRange.map(date => {
    const dayMeals = meals.filter(m => startOfDay(m.loggedAt).getTime() === date.getTime());
    const dayFasts = fasts.filter(f => startOfDay(f.startTime).getTime() === date.getTime());
    
    return {
      // Use short day for weekly (Mon), day of month for monthly (15)
      label: range === 'monthly' ? format(date, 'd') : format(date, 'EEE'),
      fullDate: format(date, 'MMM d, yyyy'),
      calories: dayMeals.reduce((acc, m) => acc + m.calories, 0),
      protein: dayMeals.reduce((acc, m) => acc + m.protein, 0),
      carbs: dayMeals.reduce((acc, m) => acc + m.carbs, 0),
      fat: dayMeals.reduce((acc, m) => acc + m.fat, 0),
      sugar: dayMeals.reduce((acc, m) => acc + (m.sugar || 0), 0),
      fasting: dayFasts.reduce((acc, f) => acc + (f.duration || 0), 0) / 60
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-blue-500" /> Stats
        </h1>
        <p className="text-gray-500 font-medium text-[15px] mt-1">
          Your historical trends
        </p>
      </header>

      <main className="flex-1 px-4 space-y-6">
        <StatsCharts data={aggregatedData} range={range} limits={LIMITS} />
      </main>
    </div>
  );
}
