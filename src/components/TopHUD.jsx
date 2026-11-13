'use client';

import React, { useState, useEffect } from 'react';
import { Target, Flame, ChevronRight, ChevronLeft, Sun, Moon, Download, Clock } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

export function TopHUD({
  dateParam,
  consumedCalories = 0,
  calorieLimit = 2200,
  protein = 0,
  proteinGoal = 155,
  carbs = 0,
  carbsGoal = 235,
  fat = 0,
  fatGoal = 65,
  sugar = 0,
  sugarLimit = 35,
  fastingStartTime,
  yesterdayLastMealAt,
  fastBrokenMeal,
  isDark = true,
  onToggleTheme,
  canInstallPWA = false,
  onInstallPWA,
  onOpenGoals,
  onSelectDate,
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const remainingCalories = calorieLimit - consumedCalories;
  const isOver = remainingCalories < 0;
  const absRemaining = Math.abs(remainingCalories);

  // Calorie percentage
  const calPercent = Math.min(100, Math.round((consumedCalories / calorieLimit) * 100));

  // Gram percentages for macro cards
  const pPercent = Math.min(100, Math.round((protein / (proteinGoal || 1)) * 100));
  const cPercent = Math.min(100, Math.round((carbs / (carbsGoal || 1)) * 100));
  const fPercent = Math.min(100, Math.round((fat / (fatGoal || 1)) * 100));
  const sugarPercent = Math.min(100, (sugar / (sugarLimit || 35)) * 100);
  const isSugarOver = sugar > (sugarLimit || 35);

  // Total macro calories for composite ratio segment
  const pKcal = protein * 4;
  const cKcal = carbs * 4;
  const fKcal = fat * 9;
  const totalMacroKcal = pKcal + cKcal + fKcal || 1;

  const pRatio = Math.round((pKcal / totalMacroKcal) * 100);
  const cRatio = Math.round((cKcal / totalMacroKcal) * 100);
  const fRatio = Math.max(0, 100 - pRatio - cRatio);

  // Active date calculation
  let activeDate = new Date();
  if (dateParam) {
    const [y, m, d] = dateParam.split('-').map(Number);
    activeDate = new Date(y, m - 1, d);
  }
  activeDate.setHours(0, 0, 0, 0);

  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const isToday = activeDate.getTime() === realToday.getTime();
  const prevDateStr = format(subDays(activeDate, 1), 'yyyy-MM-dd');
  const nextDateStr = format(addDays(activeDate, 1), 'yyyy-MM-dd');

  let dateLabel = 'Today';
  if (!isToday) {
    const yesterday = subDays(realToday, 1);
    if (activeDate.getTime() === yesterday.getTime()) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = format(activeDate, 'MMM d');
    }
  }

  // Fasting period calculation (last meal yesterday -> first meal with sugar > 0 today)
  const formatFastingDuration = (start, end) => {
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  let fastingLabel = '16:8 Fasting Window';
  let fastingSubtext = '';
  let isFastingBroken = Boolean(fastBrokenMeal);

  if (yesterdayLastMealAt && fastBrokenMeal) {
    const start = new Date(yesterdayLastMealAt);
    const end = new Date(fastBrokenMeal.loggedAt);
    const duration = formatFastingDuration(start, end);
    fastingLabel = `Fasting Period: ${duration}`;
    fastingSubtext = `${format(start, 'h:mm a')} → ${format(end, 'h:mm a')}`;
  } else if (yesterdayLastMealAt && !fastBrokenMeal) {
    const start = new Date(yesterdayLastMealAt);
    if (isToday) {
      const duration = formatFastingDuration(start, now);
      fastingLabel = `Fasting: ${duration}`;
      fastingSubtext = `since ${format(start, 'h:mm a')} • 0g sugar`;
    } else {
      fastingLabel = 'Fasting intact • 0g sugar';
      fastingSubtext = `from ${format(start, 'h:mm a')} prev day`;
    }
  } else if (fastBrokenMeal) {
    fastingLabel = `Fast broken at ${format(new Date(fastBrokenMeal.loggedAt), 'h:mm a')}`;
  } else if (sugar === 0 && consumedCalories > 0) {
    fastingLabel = 'Fasting intact • 0g sugar';
  }

  return (
    <header className="sticky top-0 z-30 bg-[#f7f5f0]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#e4dfd7] dark:border-[#282422] px-4 pt-3 pb-3 transition-colors">
      {/* Top micro status bar with Date Navigator & Controls */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5">
          {/* Day Navigation Controls */}
          <div className="flex items-center bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => onSelectDate?.(prevDateStr)}
              className="p-1 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5 transition-colors"
              aria-label="Previous day"
              title="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSelectDate?.('')}
              className="px-2 py-0.5 font-semibold text-[11px] text-[#1c1917] dark:text-[#ede9e6] tracking-tight hover:text-[#10b981] transition-colors"
              title={isToday ? "Current day" : "Return to Today"}
            >
              {dateLabel}
            </button>

            <button
              onClick={() => onSelectDate?.(nextDateStr)}
              className="p-1 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5 transition-colors"
              aria-label="Next day"
              title="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Optional PWA Install Action */}
          {canInstallPWA && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#10b981]/15 border border-[#10b981]/30 text-[#047857] dark:text-[#10b981] active:scale-95 text-[11px] font-bold"
              title="Install App"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          )}

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680] active:scale-90 transition-transform shadow-xs"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#78716c]" />
            )}
          </button>

          {/* Goals / Targets button */}
          <button
            onClick={onOpenGoals}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680] active:scale-95 transition-transform text-[11px] font-medium shadow-xs"
            aria-label="Edit daily targets"
          >
            <Target className="w-3 h-3 text-[#10b981]" />
            <span>Targets</span>
            <ChevronRight className="w-3 h-3 text-[#a8a29e] dark:text-[#8e8680]" />
          </button>
        </div>
      </div>

      {/* Fasting Period Status Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 mb-2.5 rounded-lg bg-white/70 dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[11px] shadow-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isFastingBroken ? 'bg-[#eab308]' : 'bg-[#10b981] animate-pulse'
            }`}
          />
          <Clock className="w-3 h-3 text-[#78716c] dark:text-[#8e8680]" />
          <span className="font-mono font-bold text-[#1c1917] dark:text-[#ede9e6] tabular-nums">
            {fastingLabel}
          </span>
        </div>
        {fastingSubtext && (
          <span className="font-mono text-[10px] text-[#78716c] dark:text-[#8e8680] tabular-nums">
            {fastingSubtext}
          </span>
        )}
      </div>

      {/* Main Calorie Meter Readout */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#78716c] dark:text-[#8e8680] font-semibold mb-0.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#10b981]" />
            <span>Daily Intake</span>
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-3xl font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums tracking-tight">
              {Math.round(consumedCalories).toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-[#78716c] dark:text-[#8e8680]">
              / {calorieLimit.toLocaleString()}
            </span>
            <span className="text-xs text-[#78716c] dark:text-[#8e8680] font-medium ml-0.5">kcal</span>
          </div>
        </div>

        {/* Dynamic Remaining Badge */}
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-xs font-semibold tabular-nums shadow-xs ${
              isOver
                ? 'bg-[#fee2e2] border-[#fecaca] text-[#b91c1c] dark:bg-[#431407] dark:border-[#7c2d12] dark:text-[#ea580c]'
                : 'bg-[#d1fae5] border-[#a7f3d0] text-[#047857] dark:bg-[#064e3b] dark:border-[#047857] dark:text-[#10b981]'
            }`}
          >
            <span>{isOver ? '+' : ''}{Math.round(absRemaining)}</span>
            <span className="text-[10px] font-sans font-medium opacity-95">
              {isOver ? 'kcal over' : 'kcal left'}
            </span>
          </div>
          <div className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-mono mt-0.5 text-right tabular-nums">
            {calPercent}% of target
          </div>
        </div>
      </div>

      {/* Overall Calorie Bar */}
      <div className="w-full bg-[#e7e2da] dark:bg-[#151312] h-1.5 rounded-full overflow-hidden border border-[#d8d1c7] dark:border-[#282422] mb-2.5">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            isOver ? 'bg-[#ea580c]' : 'bg-[#10b981]'
          }`}
          style={{ width: `${Math.min(100, (consumedCalories / calorieLimit) * 100)}%` }}
        />
      </div>

      {/* 3-Segment Horizontal Progress Bar for Macros */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[11px] text-[#78716c] dark:text-[#8e8680] mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Macro Split</span>
          <span className="font-mono text-[10px] tabular-nums">
            P {pRatio}% <span className="text-[#d8d1c7] dark:text-[#383230]">|</span> C {cRatio}% <span className="text-[#d8d1c7] dark:text-[#383230]">|</span> F {fRatio}%
          </span>
        </div>

        {/* 3-Segment Progress bar */}
        <div className="w-full h-2 rounded bg-[#e7e2da] dark:bg-[#151312] border border-[#d8d1c7] dark:border-[#282422] flex overflow-hidden">
          <div
            className="h-full bg-[#10b981] transition-all duration-300"
            style={{ width: `${pRatio}%` }}
            title={`Protein: ${protein}g`}
          />
          <div
            className="h-full bg-[#ea580c] transition-all duration-300 border-l border-[#f7f5f0] dark:border-[#0e0d0c]"
            style={{ width: `${cRatio}%` }}
            title={`Carbs: ${carbs}g`}
          />
          <div
            className="h-full bg-[#ca8a04] dark:bg-[#eab308] transition-all duration-300 border-l border-[#f7f5f0] dark:border-[#0e0d0c]"
            style={{ width: `${fRatio}%` }}
            title={`Fat: ${fat}g`}
          />
        </div>
      </div>

      {/* Macro Current vs Goal Badges (Protein, Carbs, Fat) */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Protein (Fresh Green) */}
        <div className="rounded border border-[#a7f3d0] bg-[#ecfdf5] dark:border-[#065f46] dark:bg-[#064e3b]/70 px-2.5 py-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#047857] dark:text-[#10b981]">
              Protein
            </span>
            <span className="text-[10px] font-mono text-[#047857]/90 dark:text-[#10b981]/90 tabular-nums font-semibold">
              {pPercent}%
            </span>
          </div>
          <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums font-bold flex items-baseline justify-between">
            <span>{Math.round(protein)}<span className="text-[10px] font-normal text-[#047857] dark:text-[#10b981]/90">g</span></span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal font-sans">/ {proteinGoal}g</span>
          </div>
          <div className="w-full bg-[#a7f3d0] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#059669] dark:bg-[#10b981] h-full transition-all duration-300"
              style={{ width: `${pPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs (Toasted Terracotta) */}
        <div className="rounded border border-[#fed7aa] bg-[#ffedd5] dark:border-[#7c2d12] dark:bg-[#431407]/80 px-2.5 py-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#c2410c] dark:text-[#ea580c]">
              Carbs
            </span>
            <span className="text-[10px] font-mono text-[#c2410c]/90 dark:text-[#ea580c]/80 tabular-nums font-semibold">
              {cPercent}%
            </span>
          </div>
          <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums font-bold flex items-baseline justify-between">
            <span>{Math.round(carbs)}<span className="text-[10px] font-normal text-[#c2410c] dark:text-[#ea580c]/80">g</span></span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal font-sans">/ {carbsGoal}g</span>
          </div>
          <div className="w-full bg-[#fed7aa] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#ea580c] h-full transition-all duration-300"
              style={{ width: `${cPercent}%` }}
            />
          </div>
        </div>

        {/* Fats (Dark Yellow / Warm Amber) */}
        <div className="rounded border border-[#fef08a] bg-[#fefce8] dark:border-[#854d0e] dark:bg-[#422006]/80 px-2.5 py-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#a16207] dark:text-[#eab308]">
              Fats
            </span>
            <span className="text-[10px] font-mono text-[#a16207]/90 dark:text-[#eab308]/90 tabular-nums font-semibold">
              {fPercent}%
            </span>
          </div>
          <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums font-bold flex items-baseline justify-between">
            <span>{Math.round(fat)}<span className="text-[10px] font-normal text-[#a16207] dark:text-[#eab308]/90">g</span></span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal font-sans">/ {fatGoal}g</span>
          </div>
          <div className="w-full bg-[#fef08a] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#ca8a04] dark:bg-[#eab308] h-full transition-all duration-300"
              style={{ width: `${fPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Sugar Intake Meter Bar */}
      <div className="px-2.5 py-1.5 rounded-lg bg-white/70 dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fb7185]" />
          <span className="text-[11px] font-bold text-[#be123c] dark:text-[#fb7185] uppercase tracking-wide">
            Daily Sugar
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-20 bg-[#fce7f3] dark:bg-[#0e0d0c] h-1.5 rounded-full overflow-hidden border border-[#fbcfe8] dark:border-[#38242c]">
            <div
              className={`h-full transition-all duration-300 ${
                isSugarOver ? 'bg-[#e11d48]' : 'bg-[#fb7185]'
              }`}
              style={{ width: `${sugarPercent}%` }}
            />
          </div>

          <div className="font-mono text-xs tabular-nums text-[#1c1917] dark:text-[#faf7f5]">
            <span className={`font-bold ${isSugarOver ? 'text-[#e11d48]' : ''}`}>
              {Math.round(sugar * 10) / 10}g
            </span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal"> / {sugarLimit}g max</span>
          </div>
        </div>
      </div>
    </header>
  );
}
