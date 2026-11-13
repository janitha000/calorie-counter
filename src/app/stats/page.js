import prisma from "@/lib/prisma";
import { getUserGoals, DEFAULT_USER_ID } from "@/lib/goals";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { StatsCharts } from "@/components/StatsCharts";

export const dynamic = 'force-dynamic';

export default async function StatsPage({ searchParams }) {
  const userId = DEFAULT_USER_ID;
  const goals = await getUserGoals(userId);
  const limits = {
    calories: goals.calories,
    protein: goals.protein,
    carbs: goals.carbs,
    fat: goals.fat,
    sugar: goals.sugar,
    fasting: 16,
  };

  const resolvedParams = await searchParams;
  const rawRange = resolvedParams?.range;
  const range =
    rawRange === 'monthly' || rawRange === '30d'
      ? '30d'
      : rawRange === '14d'
        ? '14d'
        : '7d';
  const numDays = range === '30d' ? 30 : range === '14d' ? 14 : 7;

  const today = new Date();
  const dateRange = Array.from({ length: numDays }).map((_, i) =>
    startOfDay(subDays(today, numDays - 1 - i))
  );

  // Fetch 1 extra prior day so Day 0 can compute fasting from its previous day's last meal
  const fetchStartDate = startOfDay(subDays(dateRange[0], 1));
  const endDate = endOfDay(today);

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: fetchStartDate, lte: endDate },
    },
    orderBy: { loggedAt: 'asc' },
  });

  const aggregatedData = dateRange.map((date) => {
    const prevDate = subDays(date, 1);
    const dayMeals = meals.filter((m) => isSameDay(m.loggedAt, date));
    const prevDayMeals = meals.filter((m) => isSameDay(m.loggedAt, prevDate));

    const prevLastMeal = prevDayMeals.length > 0 ? prevDayMeals[prevDayMeals.length - 1] : null;
    const firstSugarMeal = dayMeals.find((m) => Number(m.sugar || 0) > 0) || null;

    let fastingHours = null;
    if (prevLastMeal) {
      let endRef = null;
      if (firstSugarMeal) {
        endRef = new Date(firstSugarMeal.loggedAt);
      } else if (isSameDay(date, today)) {
        endRef = new Date();
      } else {
        endRef = endOfDay(date);
      }
      const diffHrs = Math.max(0, (endRef.getTime() - new Date(prevLastMeal.loggedAt).getTime()) / 3600000);
      // Cap single-day gap at 36h for clean chart scaling
      fastingHours = Math.round(Math.min(36, diffHrs) * 10) / 10;
    }

    return {
      dateStr: format(date, 'yyyy-MM-dd'),
      label: range === '7d' ? format(date, 'EEE') : format(date, 'd'),
      shortDate: format(date, 'MMM d'),
      fullDate: format(date, 'EEE, MMM d'),
      calories: Math.round(dayMeals.reduce((acc, m) => acc + (m.calories || 0), 0)),
      protein: Math.round(dayMeals.reduce((acc, m) => acc + (m.protein || 0), 0) * 10) / 10,
      carbs: Math.round(dayMeals.reduce((acc, m) => acc + (m.carbs || 0), 0) * 10) / 10,
      fat: Math.round(dayMeals.reduce((acc, m) => acc + (m.fat || 0), 0) * 10) / 10,
      sugar: Math.round(dayMeals.reduce((acc, m) => acc + (m.sugar || 0), 0) * 10) / 10,
      mealCount: dayMeals.length,
      fastingHours,
    };
  });

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#1c1917] dark:text-[#ede9e6] flex flex-col transition-colors pb-20">
      <StatsCharts data={aggregatedData} range={range} limits={limits} />
    </div>
  );
}
