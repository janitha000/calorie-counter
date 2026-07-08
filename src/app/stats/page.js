import prisma from "@/lib/prisma";
import { StatsView } from "@/components/StatsView";

export const dynamic = 'force-dynamic';

export default async function StatsPage({ searchParams }) {
  const userId = "default_user_janitha"; // Hardcoded for MVP
  const defaultTdee = 1600;
  
  // Parse date from searchParams, or default to today
  let selectedDate = new Date();
  if (searchParams?.date) {
    const parsed = new Date(searchParams.date);
    if (!isNaN(parsed)) {
      selectedDate = parsed;
    }
  }

  // Set start and end of the selected date
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Fetch meals for the selected date
  const meals = await prisma.meal.findMany({
    where: {
      userId: userId,
      loggedAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });

  // Calculate totals by meal type
  const data = {
    breakfast: { calories: 0, carbs: 0, protein: 0, fat: 0 },
    lunch: { calories: 0, carbs: 0, protein: 0, fat: 0 },
    dinner: { calories: 0, carbs: 0, protein: 0, fat: 0 },
    snack: { calories: 0, carbs: 0, protein: 0, fat: 0 }
  };

  meals.forEach(meal => {
    if (data[meal.type]) {
      data[meal.type].calories += meal.calories;
      data[meal.type].carbs += meal.carbs;
      data[meal.type].protein += meal.protein;
      data[meal.type].fat += meal.fat;
    } else {
      // Fallback if type is missing or unknown
      data.snack.calories += meal.calories;
      data.snack.carbs += meal.carbs;
      data.snack.protein += meal.protein;
      data.snack.fat += meal.fat;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <main className="flex-1 px-4 pt-6 space-y-6">
        <StatsView 
          initialDate={startOfDay.toISOString()} 
          data={data} 
          tdee={defaultTdee} 
        />
      </main>
    </div>
  );
}
