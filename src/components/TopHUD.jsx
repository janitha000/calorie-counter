'use client';

import React from 'react';
import { Target, Flame, ChevronRight, Sun, Moon, Download } from 'lucide-react';
import { format } from 'date-fns';

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
  fastBrokenMeal,
  isDark = true,
  onToggleTheme,
  canInstallPWA = false,
  onInstallPWA,
  onOpenGoals,
  onSelectDate,
}) {
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

  // Fasting window display text: only broken when sugar > 0
  let fastingLabel = '16:8 Fasting Window';
  if (fastBrokenMeal) {
    fastingLabel = `Fast broken at ${format(new Date(fastBrokenMeal.loggedAt), 'h:mm a')}`;
  } else if (sugar === 0 && consumedCalories > 0) {
    fastingLabel = 'Fasting intact • 0g sugar';
  }

  return (
    <header className="sticky top-0 z-30 bg-[#f7f5f0]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#e4dfd7] dark:border-[#282422] px-4 pt-3 pb-3 transition-colors">
      {/* Top micro status bar */}
      <div className="flex items-center justify-between text-xs mb-2.5">
        <div className="flex items-center gap-1.5 text-[#78716c] dark:text-[#8e8680]">
          <span className={`inline-block w-2 h-2 rounded-full ${fastBrokenMeal ? 'bg-[#f59e0b]' : 'bg-[#10b981] animate-pulse'}`} />
          <span className="font-semibold text-[#1c1917] dark:text-[#ede9e6] tracking-tight">Today</span>
          <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
          <span className="font-mono text-[11px] tabular-nums text-[#1c1917] dark:text-[#ede9e6]">{fastingLabel}</span>
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
            className="h-full bg-[#f59e0b] transition-all duration-300"
            style={{ width: `${pRatio}%` }}
            title={`Protein: ${protein}g`}
          />
          <div
            className="h-full bg-[#ea580c] transition-all duration-300 border-l border-[#f7f5f0] dark:border-[#0e0d0c]"
            style={{ width: `${cRatio}%` }}
            title={`Carbs: ${carbs}g`}
          />
          <div
            className="h-full bg-[#84cc16] transition-all duration-300 border-l border-[#f7f5f0] dark:border-[#0e0d0c]"
            style={{ width: `${fRatio}%` }}
            title={`Fat: ${fat}g`}
          />
        </div>
      </div>

      {/* Macro Current vs Goal Badges (Protein, Carbs, Fat) */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Protein (Yolk Gold) */}
        <div className="rounded border border-[#fde68a] bg-[#fef3c7] dark:border-[#78350f] dark:bg-[#451a03]/80 px-2.5 py-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#b45309] dark:text-[#f59e0b]">
              Protein
            </span>
            <span className="text-[10px] font-mono text-[#b45309]/90 dark:text-[#f59e0b]/80 tabular-nums font-semibold">
              {pPercent}%
            </span>
          </div>
          <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums font-bold flex items-baseline justify-between">
            <span>{Math.round(protein)}<span className="text-[10px] font-normal text-[#b45309] dark:text-[#f59e0b]/80">g</span></span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal font-sans">/ {proteinGoal}g</span>
          </div>
          <div className="w-full bg-[#fde68a] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#d97706] dark:bg-[#f59e0b] h-full transition-all duration-300"
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

        {/* Fats (Avocado Olive) */}
        <div className="rounded border border-[#d9f99d] bg-[#ecfccb] dark:border-[#365314] dark:bg-[#1a2e05]/80 px-2.5 py-1.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#4d7c0f] dark:text-[#84cc16]">
              Fats
            </span>
            <span className="text-[10px] font-mono text-[#4d7c0f]/90 dark:text-[#84cc16]/80 tabular-nums font-semibold">
              {fPercent}%
            </span>
          </div>
          <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums font-bold flex items-baseline justify-between">
            <span>{Math.round(fat)}<span className="text-[10px] font-normal text-[#4d7c0f] dark:text-[#84cc16]/80">g</span></span>
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-normal font-sans">/ {fatGoal}g</span>
          </div>
          <div className="w-full bg-[#d9f99d] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#65a30d] dark:bg-[#84cc16] h-full transition-all duration-300"
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
