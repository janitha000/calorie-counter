import prisma from "@/lib/prisma";
import { getUserGoals, DEFAULT_USER_ID } from "@/lib/goals";
import { StatsView } from "@/components/StatsView";

export const dynamic = 'force-dynamic';

export default async function SummaryPage({ searchParams }) {
  const userId = DEFAULT_USER_ID;
  const goals = await getUserGoals(userId);

  const resolvedParams = await searchParams;

  let selectedDate = new Date();
  if (resolvedParams?.date) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(resolvedParams.date)) {
      const [y, m, d] = resolvedParams.date.split('-').map(Number);
      selectedDate = new Date(y, m - 1, d);
    } else {
      const parsed = new Date(resolvedParams.date);
      if (!isNaN(parsed)) {
        selectedDate = parsed;
      }
    }
  }

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const yesterdayStart = new Date(startOfDay);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const [meals, yesterdayLastMeal] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId,
        loggedAt: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { loggedAt: 'asc' },
    }),
    prisma.meal.findFirst({
      where: {
        userId,
        loggedAt: { gte: yesterdayStart, lt: startOfDay },
      },
      orderBy: { loggedAt: 'desc' },
    }),
  ]);

  const data = {
    breakfast: { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, count: 0 },
    lunch: { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, count: 0 },
    dinner: { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, count: 0 },
    snack: { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, count: 0 },
  };

  meals.forEach((meal) => {
    const type = data[meal.type] ? meal.type : 'snack';
    data[type].calories += meal.calories || 0;
    data[type].carbs += meal.carbs || 0;
    data[type].protein += meal.protein || 0;
    data[type].fat += meal.fat || 0;
    data[type].sugar += meal.sugar || 0;
    data[type].count += 1;
  });

  const firstSugarMeal = meals.find((m) => Number(m.sugar || 0) > 0) || null;
  const topMeals = [...meals]
    .sort((a, b) => (b.calories || 0) - (a.calories || 0))
    .slice(0, 3)
    .map((m) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      sugar: m.sugar || 0,
    }));

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#1c1917] dark:text-[#ede9e6] flex flex-col transition-colors pb-20">
      <StatsView
        initialDate={startOfDay.toISOString()}
        data={data}
        goals={goals}
        topMeals={topMeals}
        yesterdayLastMealAt={yesterdayLastMeal ? yesterdayLastMeal.loggedAt.toISOString() : null}
        firstSugarMealAt={firstSugarMeal ? firstSugarMeal.loggedAt.toISOString() : null}
      />
    </div>
  );
}
