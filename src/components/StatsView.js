'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, PieChart } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';

export function StatsView({ initialDate, data, tdee }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [metric, setMetric] = useState('calories'); // 'calories', 'carbs', 'protein', 'fat'

  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    router.push(`/stats?date=${newDate.toISOString()}`);
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    router.push(`/stats?date=${newDate.toISOString()}`);
  };

  // Calculate totals for the selected metric
  const total = data.breakfast[metric] + data.lunch[metric] + data.dinner[metric] + data.snack[metric];

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
      <div className="bg-white p-2 rounded-2xl flex gap-1 shadow-sm border border-gray-100">
        {['calories', 'protein', 'carbs', 'fat', 'sugar'].map(m => (
          <button 
            key={m}
            onClick={() => setMetric(m)}
            className={`flex-1 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all ${metric === m ? 'bg-gray-900 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Pie Chart Card */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-full mb-8 shadow-inner" style={{ background: pieGradient }}>
          {/* Inner cutout for donut shape */}
          <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total</span>
            <span className="text-3xl font-extrabold text-gray-900 leading-none">
              {Math.round(total)}
            </span>
            <span className="text-[11px] font-semibold text-gray-400 mt-1">
              {metric === 'calories' ? 'kcal' : 'g'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full grid grid-cols-2 gap-4">
          <LegendItem label="Breakfast" value={data.breakfast[metric]} percentage={pBreakfast} color={colors.breakfast} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Lunch" value={data.lunch[metric]} percentage={pLunch} color={colors.lunch} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Dinner" value={data.dinner[metric]} percentage={pDinner} color={colors.dinner} unit={metric === 'calories' ? 'kcal' : 'g'} />
          <LegendItem label="Snacks" value={data.snack[metric]} percentage={pSnack} color={colors.snack} unit={metric === 'calories' ? 'kcal' : 'g'} />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, value, percentage, color, unit }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold text-gray-900">{Math.round(value)}</span>
          <span className="text-[10px] font-semibold text-gray-400">{unit}</span>
        </div>
      </div>
      <div className="text-[11px] font-bold" style={{ color }}>
        {Math.round(percentage)}%
      </div>
    </div>
  )
}
