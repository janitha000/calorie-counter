import prisma from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { BarChart2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const userId = "default_user_janitha";
  const defaultTdee = 1600;

  const today = new Date();
  const past7Days = Array.from({ length: 7 }).map((_, i) => startOfDay(subDays(today, 6 - i)));

  const startDate = past7Days[0];
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

  // Aggregate Calories by Day
  const calorieData = past7Days.map(date => {
    const dayMeals = meals.filter(m => startOfDay(m.loggedAt).getTime() === date.getTime());
    const cals = dayMeals.reduce((acc, m) => acc + m.calories, 0);
    return {
      date: format(date, 'EEE'), // e.g. Mon, Tue
      calories: cals,
      heightPercent: Math.min(100, (cals / (defaultTdee * 1.5)) * 100) // Scale so 100% height is 1.5x TDEE
    };
  });

  // Aggregate Fasting by Day
  const fastingData = past7Days.map(date => {
    const dayFasts = fasts.filter(f => startOfDay(f.startTime).getTime() === date.getTime());
    const totalDurationMins = dayFasts.reduce((acc, f) => acc + (f.duration || 0), 0);
    const hours = totalDurationMins / 60;
    return {
      date: format(date, 'EEE'),
      hours: hours,
      heightPercent: Math.min(100, (hours / 24) * 100) // Scale so 100% height is 24 hours
    };
  });

  // Calculate target line percentage for calories
  const targetPercent = (defaultTdee / (defaultTdee * 1.5)) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-8 h-8 text-blue-500" /> Stats
        </h1>
        <p className="text-gray-500 font-medium text-[15px] mt-1">Your 7-day historical trends</p>
      </header>

      <main className="flex-1 px-4 space-y-6">
        
        {/* Calorie Bar Chart */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[16px] text-gray-900">Daily Calories</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">Target: {defaultTdee}</div>
          </div>

          <div className="relative h-48 w-full flex items-end justify-between pt-4">
            {/* Target Line */}
            <div 
              className="absolute w-full border-t-2 border-dashed border-gray-300 z-0 flex items-center justify-end"
              style={{ bottom: `${targetPercent}%` }}
            >
              <span className="text-[10px] text-gray-400 font-bold bg-white px-1 -mt-3 absolute -right-2">Target</span>
            </div>

            {calorieData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 relative z-10 w-[10%]">
                <div className="text-[9px] font-bold text-gray-400">{day.calories > 0 ? day.calories : ''}</div>
                <div className="w-full bg-gray-100 rounded-t-md relative overflow-hidden" style={{ height: '120px' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-1000 ${day.calories > defaultTdee ? 'bg-red-400' : 'bg-blue-500'}`}
                    style={{ height: `${day.heightPercent}%` }}
                  ></div>
                </div>
                <div className="text-[11px] font-bold text-gray-600">{day.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Fasting Bar Chart */}
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[16px] text-gray-900">Fasting Hours</h2>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded">Max: 24h</div>
          </div>

          <div className="relative h-48 w-full flex items-end justify-between pt-4">
            {/* 16h Target Line */}
            <div 
              className="absolute w-full border-t-2 border-dashed border-orange-200 z-0 flex items-center justify-end"
              style={{ bottom: `${(16/24)*100}%` }}
            >
              <span className="text-[10px] text-orange-400 font-bold bg-white px-1 -mt-3 absolute -right-2">16h</span>
            </div>

            {fastingData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 relative z-10 w-[10%]">
                <div className="text-[9px] font-bold text-gray-400">{day.hours > 0 ? day.hours.toFixed(1) : ''}</div>
                <div className="w-full bg-gray-100 rounded-t-md relative overflow-hidden" style={{ height: '120px' }}>
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-md transition-all duration-1000 ${day.hours >= 16 ? 'bg-orange-400' : 'bg-green-400'}`}
                    style={{ height: `${day.heightPercent}%` }}
                  ></div>
                </div>
                <div className="text-[11px] font-bold text-gray-600">{day.date}</div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
