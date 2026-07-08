'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';

export function StatsView({ initialDate, data, tdee }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [metric, setMetric] = useState('calories'); // 'calories', 'carbs', 'protein', 'fat', 'sugar'

  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    router.replace(`/stats?date=${newDate.toISOString()}`);
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    router.replace(`/stats?date=${newDate.toISOString()}`);
  };

  // Calculate totals for the selected metric
  const total = data.breakfast[metric] + data.lunch[metric] + data.dinner[metric] + data.snack[metric];

  // Calculate global totals for all macros for the macro split and progress bars
  const totalCalories = data.breakfast.calories + data.lunch.calories + data.dinner.calories + data.snack.calories;
  const totalProtein = data.breakfast.protein + data.lunch.protein + data.dinner.protein + data.snack.protein;
  const totalCarbs = data.breakfast.carbs + data.lunch.carbs + data.dinner.carbs + data.snack.carbs;
  const totalFat = data.breakfast.fat + data.lunch.fat + data.dinner.fat + data.snack.fat;
  const totalSugar = data.breakfast.sugar + data.lunch.sugar + data.dinner.sugar + data.snack.sugar;

  // Calculate percentages for the pie chart
  const pBreakfast = total > 0 ? (data.breakfast[metric] / total) * 100 : 0;
  const pLunch = total > 0 ? (data.lunch[metric] / total) * 100 : 0;
  const pDinner = total > 0 ? (data.dinner[metric] / total) * 100 : 0;
  const pSnack = total > 0 ? (data.snack[metric] / total) * 100 : 0;

  // Colors for the meal types
  const colors = {
    breakfast: '#f87171', // Red
    lunch: '#4ade80',     // Green
    dinner: '#60a5fa',    // Blue
    snack: '#fbbf24'      // Yellow
  };

  const pieGradient = total === 0 
    ? 'conic-gradient(#f3f4f6 0% 100%)' 
    : `conic-gradient(
        ${colors.breakfast} 0% ${pBreakfast}%, 
        ${colors.lunch} ${pBreakfast}% ${pBreakfast + pLunch}%, 
        ${colors.dinner} ${pBreakfast + pLunch}% ${pBreakfast + pLunch + pDinner}%, 
        ${colors.snack} ${pBreakfast + pLunch + pDinner}% 100%
      )`;

  // Goals
  const GOALS = {
    calories: tdee,
    protein: 150,
    carbs: 250,
    fat: 65,
    sugar: 25
  };

  // Macro split percentages based on calories
  const pCalProtein = totalCalories > 0 ? ((totalProtein * 4) / totalCalories) * 100 : 0;
  const pCalCarbs = totalCalories > 0 ? ((totalCarbs * 4) / totalCalories) * 100 : 0;
  const pCalFat = totalCalories > 0 ? ((totalFat * 9) / totalCalories) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Date Navigator */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-bold text-gray-800 text-[15px]">
          {isToday(currentDate) ? 'Today' : format(currentDate, 'EEEE, MMM d')}
        </span>
        <button onClick={handleNextDay} disabled={isToday(currentDate)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-30">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Metric Toggles */}
      <div className="bg-white p-2 rounded-2xl flex gap-1 shadow-sm border border-gray-100 overflow-x-auto hide-scrollbar">
        {['calories', 'protein', 'carbs', 'fat', 'sugar'].map(m => (
          <button 
            key={m}
            onClick={() => setMetric(m)}
            className={`flex-1 min-w-[70px] py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${metric === m ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 1. Pie Chart Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
        <h3 className="w-full text-left font-bold text-gray-900 mb-6 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-indigo-500" />
          Meal Distribution
        </h3>
        <div className="relative w-48 h-48 rounded-full mb-8 shadow-inner" style={{ background: pieGradient }}>
          {/* Inner cutout for donut shape */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total</span>
            <span className="text-3xl font-extrabold text-gray-900 leading-none">
              {Math.round(total)}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-1 uppercase">
              {metric}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
          <LegendItem label="Breakfast" value={data.breakfast[metric]} percentage={pBreakfast} color={colors.breakfast} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Lunch" value={data.lunch[metric]} percentage={pLunch} color={colors.lunch} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Dinner" value={data.dinner[metric]} percentage={pDinner} color={colors.dinner} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Snacks" value={data.snack[metric]} percentage={pSnack} color={colors.snack} unit={metric === 'calories' ? 'kcal' : 'g'} />
        </div>
      </div>

      {/* 2. Meal Breakdown Bar Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-500" />
          {metric.charAt(0).toUpperCase() + metric.slice(1)} per Meal
        </h3>
        <div className="h-48 flex items-end justify-around gap-2 mt-4 pt-4 border-t border-gray-50 relative">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
            <div className="w-full h-px bg-gray-100"></div>
            <div className="w-full h-px bg-gray-100"></div>
            <div className="w-full h-px bg-gray-100"></div>
          </div>
          
          {[
            { label: 'Brkfast', value: data.breakfast[metric], color: colors.breakfast },
            { label: 'Lunch', value: data.lunch[metric], color: colors.lunch },
            { label: 'Dinner', value: data.dinner[metric], color: colors.dinner },
            { label: 'Snacks', value: data.snack[metric], color: colors.snack },
          ].map(meal => {
            const maxVal = Math.max(data.breakfast[metric], data.lunch[metric], data.dinner[metric], data.snack[metric]) || 1;
            const heightPct = (meal.value / maxVal) * 100;
            return (
              <div key={meal.label} className="flex flex-col items-center gap-2 w-16 relative z-10">
                <div className="text-[10px] font-bold text-gray-600 bg-white/80 px-1 rounded">
                  {Math.round(meal.value)}
                </div>
                <div className="w-full bg-gray-100 rounded-t-xl h-36 relative overflow-hidden flex items-end">
                  <div 
                    className="w-full rounded-t-xl transition-all duration-700 ease-out" 
                    style={{ height: `${heightPct}%`, backgroundColor: meal.color }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{meal.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Goals Progress Bars */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-bold text-gray-900 mb-2">Daily Goals</h3>
        <ProgressBar label="Calories" value={totalCalories} goal={GOALS.calories} color="bg-green-400" unit="kcal" />
        <ProgressBar label="Protein" value={totalProtein} goal={GOALS.protein} color="bg-red-400" unit="g" />
        <ProgressBar label="Carbs" value={totalCarbs} goal={GOALS.carbs} color="bg-blue-400" unit="g" />
        <ProgressBar label="Fat" value={totalFat} goal={GOALS.fat} color="bg-orange-400" unit="g" />
        <ProgressBar label="Sugar" value={totalSugar} goal={GOALS.sugar} color="bg-pink-400" unit="g" />
      </div>

      {/* 4. Macro Split (Nutrient Balance) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6">Nutrient Balance</h3>
        <div className="h-4 w-full bg-gray-100 rounded-full flex overflow-hidden mb-5">
          <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${pCalProtein}%` }}></div>
          <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${pCalCarbs}%` }}></div>
          <div className="h-full bg-orange-400 transition-all duration-700" style={{ width: `${pCalFat}%` }}></div>
        </div>
        
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Protein</span>
            <span className="font-bold text-gray-900 text-lg">{Math.round(pCalProtein)}%</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Carbs</span>
            <span className="font-bold text-gray-900 text-lg">{Math.round(pCalCarbs)}%</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Fat</span>
            <span className="font-bold text-gray-900 text-lg">{Math.round(pCalFat)}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function LegendItem({ label, value, percentage, color, unit }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-2.5 sm:p-3 rounded-2xl border border-gray-100/50">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-gray-900 text-sm sm:text-base">{Math.round(value)}</span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400">{unit}</span>
        </div>
      </div>
      <div className="text-[10px] sm:text-[11px] font-bold" style={{ color }}>
        {Math.round(percentage)}%
      </div>
    </div>
  )
}

function ProgressBar({ label, value, goal, color, unit }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{label}</span>
        <div className="flex gap-1 items-baseline">
          <span className="font-bold text-gray-900">{Math.round(value)}</span>
          <span className="text-[10px] text-gray-400 font-bold">/ {goal}{unit}</span>
        </div>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
