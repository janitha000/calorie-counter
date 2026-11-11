'use client';

import React from 'react';
import { 
  Sun, 
  Moon, 
  Download, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export function TopHUD({
  dateParam,
  consumedCalories,
  calorieLimit,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  sugar,
  sugarLimit,
  fastingStartTime,
  isDark,
  onToggleTheme,
  canInstallPWA,
  onInstallPWA,
  onOpenGoals,
  onSelectDate,
}) {
  const calorieDiff = calorieLimit - consumedCalories;
  const isOver = calorieDiff < 0;
  const caloriePct = Math.min(100, Math.round((consumedCalories / calorieLimit) * 100));

  // Date manipulation
  const currentDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
  const isToday = !dateParam || format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // Fasting elapsed calculation
  let fastingText = 'Not active';
  if (fastingStartTime) {
    const start = new Date(fastingStartTime);
    const diffMs = Math.max(0, Date.now() - start.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    fastingText = `${hours}h ${mins}m fast`;
  }

  // Macro percentages for the 3-segment bar
  const totalMacroGrams = Math.max(1, protein + carbs + fat);
  const pWidth = ((protein * 4) / Math.max(1, consumedCalories)) * 100;
  const cWidth = ((carbs * 4) / Math.max(1, consumedCalories)) * 100;
  const fWidth = ((fat * 9) / Math.max(1, consumedCalories)) * 100;

  return (
    <header className="sticky top-0 z-30 bg-[#f7f5f0]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#e4dfd7] dark:border-[#282422] transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 space-y-3">
        {/* Top Control Bar: Date switcher, Fasting tag, Theme toggle, Install */}
        <div className="flex items-center justify-between text-xs">
          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => onSelectDate(format(subDays(currentDate, 1), 'yyyy-MM-dd'))}
              className="p-1 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-semibold text-[#1c1917] dark:text-[#ede9e6] min-w-[70px] text-center">
              {isToday ? 'Today' : format(currentDate, 'MMM d')}
            </span>
            <button
              onClick={() => onSelectDate(format(addDays(currentDate, 1), 'yyyy-MM-dd'))}
              className="p-1 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5"
              aria-label="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fasting Elapsed Pill */}
          {fastingStartTime && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151312]/5 dark:bg-[#282422] text-[#78716c] dark:text-[#8e8680] border border-[#e4dfd7] dark:border-[#282422] font-mono text-[11px]">
              <Clock className="w-3 h-3 text-[#10b981]" />
              <span>{fastingText}</span>
            </div>
          )}

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {canInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="p-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20 active:scale-95 transition-all"
                title="Install App"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] shadow-sm active:scale-95 transition-all"
              aria-label="Toggle dark/light mode"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#f59e0b]" /> : <Moon className="w-3.5 h-3.5 text-[#ea580c]" />}
            </button>
            <button
              onClick={onOpenGoals}
              className="p-1.5 rounded-lg text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] shadow-sm active:scale-95 transition-all"
              aria-label="Adjust Goals"
              title="Adjust Target Goals"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Calorie HUD Card */}
        <div className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] uppercase tracking-widest">
                Daily Calories
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black tracking-tight text-[#1c1917] dark:text-[#ede9e6]">
                  {consumedCalories}
                </span>
                <span className="text-xs font-bold text-[#78716c] dark:text-[#8e8680]">
                  / {calorieLimit} kcal
                </span>
              </div>
            </div>

            {/* Remaining Pill */}
            <div className={`px-3 py-1.5 rounded-xl border text-right ${
              isOver 
                ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                : 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]'
            }`}>
              <div className="text-lg font-black tracking-tight leading-none">
                {Math.abs(calorieDiff)}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                {isOver ? 'kcal over' : 'kcal left'}
              </div>
            </div>
          </div>

          {/* Calorie Progress Line */}
          <div className="mt-3">
            <div className="h-2 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOver ? 'bg-red-500' : 'bg-[#10b981]'
                }`}
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>

          {/* 3-Segment Macro Distribution + Daily Sugar Limit */}
          <div className="mt-4 pt-3 border-t border-[#f0ebe3] dark:border-[#282422] grid grid-cols-4 gap-2">
            {/* Protein (Yolk Gold) */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                <span className="text-[#f59e0b] uppercase">Protein</span>
                <span className="text-[#1c1917] dark:text-[#ede9e6]">
                  {Math.round(protein)}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f59e0b] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((protein / proteinGoal) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] mt-0.5 block font-mono">
                / {proteinGoal}g
              </span>
            </div>

            {/* Carbs (Toasted Terracotta) */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                <span className="text-[#ea580c] uppercase">Carbs</span>
                <span className="text-[#1c1917] dark:text-[#ede9e6]">
                  {Math.round(carbs)}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ea580c] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((carbs / carbsGoal) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] mt-0.5 block font-mono">
                / {carbsGoal}g
              </span>
            </div>

            {/* Fat (Avocado Olive) */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                <span className="text-[#84cc16] uppercase">Fat</span>
                <span className="text-[#1c1917] dark:text-[#ede9e6]">
                  {Math.round(fat)}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#84cc16] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((fat / fatGoal) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] mt-0.5 block font-mono">
                / {fatGoal}g
              </span>
            </div>

            {/* Sugar (Cane Rose) */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
                <span className="text-[#fb7185] uppercase">Sugar</span>
                <span className={`font-bold ${sugar > sugarLimit ? 'text-[#fb7185]' : 'text-[#1c1917] dark:text-[#ede9e6]'}`}>
                  {Math.round(sugar)}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${sugar > sugarLimit ? 'bg-red-500' : 'bg-[#fb7185]'}`}
                  style={{ width: `${Math.min(100, Math.round((sugar / sugarLimit) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] mt-0.5 block font-mono">
                max {sugarLimit}g
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
