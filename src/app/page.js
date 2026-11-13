export const dynamic = 'force-dynamic';

import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { TactileDashboard } from "@/components/TactileDashboard";

export default async function Dashboard(props) {
  const searchParams = await props.searchParams;
  const dateParam = searchParams?.date;
  const userId = "default_user_janitha";
  const defaultGoals = {
    calories: 2200,
    protein: 155,
    carbs: 235,
    fat: 65,
    sugar: 35,
    water: 8,
  };

  // Auto-create or fetch user with persisted goals
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: "Janitha",
      tdee: defaultGoals.calories,
      goal: JSON.stringify(defaultGoals),
    }
  });

  let initialGoals = { ...defaultGoals };
  if (user?.goal) {
    try {
      initialGoals = { ...initialGoals, ...JSON.parse(user.goal) };
    } catch (e) {}
  } else if (user?.tdee) {
    initialGoals.calories = user.tdee;
  }

  // Calculate day range
  let today = new Date();
  if (dateParam) {
    const [year, month, day] = dateParam.split('-');
    today = new Date(year, month - 1, day);
  }
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch meals for current date
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

  // Calculate daily totals
  const consumedCalories = todayMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const consumedProtein = todayMeals.reduce((acc, meal) => acc + meal.protein, 0);
  const consumedCarbs = todayMeals.reduce((acc, meal) => acc + meal.carbs, 0);
  const consumedFat = todayMeals.reduce((acc, meal) => acc + meal.fat, 0);
  const consumedSugar = todayMeals.reduce((acc, meal) => acc + meal.sugar, 0);

  // Fetch latest meal for fasting tracker (Life Ops Hub anchor)
  const latestMeal = await prisma.meal.findFirst({
    where: { userId: userId },
    orderBy: { loggedAt: 'desc' }
  });

  // Fetch last meal recorded yesterday for fasting period calculation
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayLastMeal = await prisma.meal.findFirst({
    where: {
      userId: userId,
      loggedAt: {
        gte: yesterdayStart,
        lt: today,
      },
    },
    orderBy: { loggedAt: 'desc' },
  });

  const fallbackStartTime = latestMeal ? latestMeal.loggedAt.toISOString() : null;
  const yesterdayLastMealAt = yesterdayLastMeal ? yesterdayLastMeal.loggedAt.toISOString() : null;

  return (
    <>
      {/* 
        Life Operations Hub RSC Compatibility Anchor 
        Preserves regex extraction in life-ops-dashboard/src/lib/connectors/calorieCounter.ts:
        - "Daily Calories"
        - "text-3xl font-black tracking-tight"
        - "/ {limit} kcal"
        - "Protein" ... [consumed, "g"]
        - "Carbs" ... [consumed, "g"]
        - "Fat" ... [consumed, "g"]
        - "fallbackStartTime": "..."
      */}
      <div className="sr-only" aria-hidden="true" data-testid="life-ops-rsc-sync">
        <span>Daily Calories</span>
        <span className="text-3xl font-black tracking-tight">{consumedCalories}</span>
        <span>/ {initialGoals.calories} kcal</span>
        <span>Protein</span>
        <span>{consumedProtein}g</span>
        <span>Carbs</span>
        <span>{consumedCarbs}g</span>
        <span>Fat</span>
        <span>{consumedFat}g</span>
        <span data-fasting={fallbackStartTime} data-meta={JSON.stringify({ fallbackStartTime })} />
      </div>

      {/* Tactile Mobile Interface */}
      <TactileDashboard
        initialMeals={todayMeals}
        initialGoals={initialGoals}
        dateParam={dateParam}
        consumedCalories={consumedCalories}
        consumedProtein={consumedProtein}
        consumedCarbs={consumedCarbs}
        consumedFat={consumedFat}
        consumedSugar={consumedSugar}
        defaultTdee={initialGoals.calories}
        latestMealLoggedAt={fallbackStartTime}
        yesterdayLastMealAt={yesterdayLastMealAt}
      />
    </>
  );
}
