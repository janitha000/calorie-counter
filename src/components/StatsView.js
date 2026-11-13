'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  Flame,
  Clock,
  Sun,
  Moon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { useTactileTheme } from '@/lib/useTheme';

const MEAL_BAYS = [
  { key: 'breakfast', label: 'Breakfast', color: '#10b981' },
  { key: 'lunch', label: 'Lunch', color: '#ea580c' },
  { key: 'dinner', label: 'Dinner', color: '#eab308' },
  { key: 'snack', label: 'Snacks', color: '#fb7185' },
];

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
];

export function StatsView({
  initialDate,
  data,
  goals,
  topMeals = [],
  yesterdayLastMealAt,
  firstSugarMealAt,
}) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTactileTheme();
  const [metric, setMetric] = useState('calories');

  const currentDate = new Date(initialDate);
  const currentIsToday = isToday(currentDate);

  const navigateTo = (targetDate) => {
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    if (isToday(targetDate)) {
      router.push('/summary');
    } else {
      router.push(`/summary?date=${dateStr}`);
    }
  };

  // Global daily totals
  const totalCalories =
    data.breakfast.calories + data.lunch.calories + data.dinner.calories + data.snack.calories;
  const totalProtein =
    data.breakfast.protein + data.lunch.protein + data.dinner.protein + data.snack.protein;
  const totalCarbs =
    data.breakfast.carbs + data.lunch.carbs + data.dinner.carbs + data.snack.carbs;
  const totalFat =
    data.breakfast.fat + data.lunch.fat + data.dinner.fat + data.snack.fat;
  const totalSugar =
    data.breakfast.sugar + data.lunch.sugar + data.dinner.sugar + data.snack.sugar;

  const calLimit = goals?.calories || 2200;
  const pGoal = goals?.protein || 155;
  const cGoal = goals?.carbs || 235;
  const fGoal = goals?.fat || 65;
  const sLimit = goals?.sugar || 35;

  const remainingCalories = calLimit - totalCalories;
  const isOver = remainingCalories < 0;
  const calPercent = Math.min(100, Math.round((totalCalories / (calLimit || 1)) * 100));
  const pPercent = Math.min(100, Math.round((totalProtein / (pGoal || 1)) * 100));
  const cPercent = Math.min(100, Math.round((totalCarbs / (cGoal || 1)) * 100));
  const fPercent = Math.min(100, Math.round((totalFat / (fGoal || 1)) * 100));
  const sPercent = Math.min(100, (totalSugar / (sLimit || 35)) * 100);
  const isSugarOver = totalSugar > sLimit;

  // Macro energy split (4 / 4 / 9 kcal per gram)
  const pKcal = Math.round(totalProtein * 4);
  const cKcal = Math.round(totalCarbs * 4);
  const fKcal = Math.round(totalFat * 9);
  const totalMacroKcal = pKcal + cKcal + fKcal || 1;
  const pRatio = Math.round((pKcal / totalMacroKcal) * 100);
  const cRatio = Math.round((cKcal / totalMacroKcal) * 100);
  const fRatio = Math.max(0, 100 - pRatio - cRatio);

  // Fasting period readout
  let fastingText = 'No fasting window logged';
  if (yesterdayLastMealAt && firstSugarMealAt) {
    const start = new Date(yesterdayLastMealAt);
    const end = new Date(firstSugarMealAt);
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    fastingText = `${hrs}h ${mins}m fast (${format(start, 'h:mm a')} → ${format(end, 'h:mm a')})`;
  } else if (yesterdayLastMealAt && !firstSugarMealAt) {
    fastingText = `Fasting intact • 0g sugar (from ${format(new Date(yesterdayLastMealAt), 'h:mm a')} prev day)`;
  } else if (firstSugarMealAt) {
    fastingText = `Fast broken at ${format(new Date(firstSugarMealAt), 'h:mm a')}`;
  } else if (totalSugar === 0 && totalCalories > 0) {
    fastingText = 'Fasting intact • 0g sugar';
  }

  // Active metric distribution for SVG Donut
  const activeMetricCfg = METRICS.find((m) => m.key === metric) || METRICS[0];
  const metricTotal =
    data.breakfast[metric] + data.lunch[metric] + data.dinner[metric] + data.snack[metric];

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const donutSegments = MEAL_BAYS.map((bay) => {
    const value = data[bay.key][metric] || 0;
    const pct = metricTotal > 0 ? value / metricTotal : 0;
    const dashLength = pct * circumference;
    const segment = {
      ...bay,
      value,
      pct: Math.round(pct * 100),
      count: data[bay.key].count || 0,
      dashArray: `${dashLength} ${circumference}`,
      dashOffset: -cumulativeOffset,
    };
    cumulativeOffset += dashLength;
    return segment;
  });

  const dateLabel = currentIsToday
    ? 'Today'
    : isToday(addDays(currentDate, 1))
      ? 'Yesterday'
      : format(currentDate, 'EEE, MMM d');

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      {/* Sticky Tactile Header */}
      <header className="sticky top-0 z-30 bg-[#f7f5f0]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#e4dfd7] dark:border-[#282422] px-4 py-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          {/* Date Navigator */}
          <div className="flex items-center bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => navigateTo(subDays(currentDate, 1))}
              className="p-1.5 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5 transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => navigateTo(new Date())}
              className="px-2.5 py-0.5 font-bold text-xs text-[#1c1917] dark:text-[#ede9e6] tracking-tight hover:text-[#10b981] transition-colors"
              title={currentIsToday ? 'Today' : 'Return to Today'}
            >
              {dateLabel}
            </button>

            <button
              onClick={() => navigateTo(addDays(currentDate, 1))}
              disabled={currentIsToday}
              className="p-1.5 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:bg-black/5 dark:active:bg-white/5 transition-colors disabled:opacity-30"
              aria-label="Next day"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={currentIsToday ? '/' : `/?date=${format(currentDate, 'yyyy-MM-dd')}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[11px] font-semibold text-[#78716c] dark:text-[#8e8680] hover:text-[#10b981] transition-colors shadow-xs"
            >
              <span>Log View</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            <button
              onClick={toggleTheme}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680] active:scale-90 transition-transform shadow-xs"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-[#78716c]" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-3 space-y-3">
        {/* Daily Scorecard */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm space-y-3">
          {/* Fasting Period Strip */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[11px] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
            <span className="text-[#1c1917] dark:text-[#ede9e6] font-semibold truncate">
              {fastingText}
            </span>
          </div>

          {/* Calorie Readout */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#78716c] dark:text-[#8e8680] font-semibold flex items-center gap-1 mb-0.5">
                <Flame className="w-3 h-3 text-[#10b981]" />
                <span>Daily Summary</span>
              </div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums">
                  {Math.round(totalCalories).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#78716c] dark:text-[#8e8680]">
                  / {calLimit.toLocaleString()} kcal
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[11px] font-semibold tabular-nums ${
                  isOver
                    ? 'bg-[#fee2e2] border-[#fecaca] text-[#b91c1c] dark:bg-[#431407] dark:border-[#7c2d12] dark:text-[#ea580c]'
                    : 'bg-[#d1fae5] border-[#a7f3d0] text-[#047857] dark:bg-[#064e3b] dark:border-[#047857] dark:text-[#10b981]'
                }`}
              >
                {isOver ? `+${Math.round(Math.abs(remainingCalories))} over` : `${Math.round(remainingCalories)} left`}
              </span>
              <div className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680] mt-0.5">
                {calPercent}% of target
              </div>
            </div>
          </div>

          {/* 3 Macro Cards (Green Protein, Orange Carbs, Dark Yellow Fat) */}
          <div className="grid grid-cols-3 gap-2">
            {/* Protein */}
            <div className="rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] dark:border-[#065f46] dark:bg-[#064e3b]/60 p-2">
              <div className="flex justify-between text-[9px] font-bold uppercase text-[#047857] dark:text-[#10b981]">
                <span>Protein</span>
                <span className="font-mono">{pPercent}%</span>
              </div>
              <div className="font-mono text-xs font-bold text-[#1c1917] dark:text-[#faf7f5] mt-0.5 tabular-nums">
                {Math.round(totalProtein)}g
                <span className="text-[9px] font-normal text-[#78716c] dark:text-[#8e8680]"> /{pGoal}</span>
              </div>
              <div className="w-full bg-[#a7f3d0] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-[#059669] dark:bg-[#10b981] h-full" style={{ width: `${pPercent}%` }} />
              </div>
            </div>

            {/* Carbs */}
            <div className="rounded-lg border border-[#fed7aa] bg-[#ffedd5] dark:border-[#7c2d12] dark:bg-[#431407]/70 p-2">
              <div className="flex justify-between text-[9px] font-bold uppercase text-[#c2410c] dark:text-[#ea580c]">
                <span>Carbs</span>
                <span className="font-mono">{cPercent}%</span>
              </div>
              <div className="font-mono text-xs font-bold text-[#1c1917] dark:text-[#faf7f5] mt-0.5 tabular-nums">
                {Math.round(totalCarbs)}g
                <span className="text-[9px] font-normal text-[#78716c] dark:text-[#8e8680]"> /{cGoal}</span>
              </div>
              <div className="w-full bg-[#fed7aa] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-[#ea580c] h-full" style={{ width: `${cPercent}%` }} />
              </div>
            </div>

            {/* Fat */}
            <div className="rounded-lg border border-[#fef08a] bg-[#fefce8] dark:border-[#854d0e] dark:bg-[#422006]/70 p-2">
              <div className="flex justify-between text-[9px] font-bold uppercase text-[#a16207] dark:text-[#eab308]">
                <span>Fat</span>
                <span className="font-mono">{fPercent}%</span>
              </div>
              <div className="font-mono text-xs font-bold text-[#1c1917] dark:text-[#faf7f5] mt-0.5 tabular-nums">
                {Math.round(totalFat)}g
                <span className="text-[9px] font-normal text-[#78716c] dark:text-[#8e8680]"> /{fGoal}</span>
              </div>
              <div className="w-full bg-[#fef08a] dark:bg-[#0e0d0c] h-1 rounded-full overflow-hidden mt-1">
                <div className="bg-[#ca8a04] dark:bg-[#eab308] h-full" style={{ width: `${fPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Sugar Bar */}
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#be123c] dark:text-[#fb7185]">
              Daily Sugar
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[#fce7f3] dark:bg-[#0e0d0c] h-1.5 rounded-full overflow-hidden border border-[#fbcfe8] dark:border-[#38242c]">
                <div
                  className={`h-full ${isSugarOver ? 'bg-[#e11d48]' : 'bg-[#fb7185]'}`}
                  style={{ width: `${sPercent}%` }}
                />
              </div>
              <span className={`font-bold tabular-nums ${isSugarOver ? 'text-[#e11d48]' : ''}`}>
                {Math.round(totalSugar * 10) / 10}g
                <span className="text-[#78716c] dark:text-[#8e8680] font-normal"> / {sLimit}g</span>
              </span>
            </div>
          </div>
        </section>

        {/* Meal Distribution (SVG Donut + Horizontal Bars) */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c1917] dark:text-[#faf7f5] flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-[#10b981]" />
              Meal Distribution
            </h2>
          </div>

          {/* Metric Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2.5 mb-3 border-b border-[#f0ebe3] dark:border-[#282422]">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  metric === m.key
                    ? 'bg-[#1c1917] text-[#faf7f5] dark:bg-[#faf7f5] dark:text-[#0e0d0c]'
                    : 'bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#78716c] dark:text-[#8e8680] border border-[#e4dfd7] dark:border-[#282422]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-[#f0ebe3] dark:text-[#282422]"
                />
                {metricTotal > 0 &&
                  donutSegments.map((seg) =>
                    seg.value > 0 ? (
                      <circle
                        key={seg.key}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="14"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        className="transition-all duration-500"
                      />
                    ) : null
                  )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="font-mono text-lg font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums leading-none">
                  {Math.round(metricTotal * 10) / 10}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#78716c] dark:text-[#8e8680] mt-0.5">
                  {activeMetricCfg.unit}
                </span>
              </div>
            </div>

            {/* Horizontal Bay Contribution Bars */}
            <div className="flex-1 space-y-2 min-w-0">
              {donutSegments.map((seg) => (
                <div key={seg.key} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="font-semibold text-[#1c1917] dark:text-[#ede9e6] truncate">
                        {seg.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#78716c] dark:text-[#8e8680] tabular-nums shrink-0">
                      <strong className="text-[#1c1917] dark:text-[#faf7f5]">
                        {Math.round(seg.value * 10) / 10}
                      </strong>{' '}
                      ({seg.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#f7f5f0] dark:bg-[#0e0d0c] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Caloric Energy Mix */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c1917] dark:text-[#faf7f5]">
              Caloric Energy Mix
            </h2>
            <span className="font-mono text-[10px] text-[#78716c] dark:text-[#8e8680]">
              P {pRatio}% • C {cRatio}% • F {fRatio}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] flex overflow-hidden mb-2.5">
            {totalCalories > 0 && (
              <>
                <div className="h-full bg-[#10b981]" style={{ width: `${pRatio}%` }} />
                <div className="h-full bg-[#ea580c] border-l border-[#f7f5f0] dark:border-[#0e0d0c]" style={{ width: `${cRatio}%` }} />
                <div className="h-full bg-[#eab308] border-l border-[#f7f5f0] dark:border-[#0e0d0c]" style={{ width: `${fRatio}%` }} />
              </>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
            <div className="p-1.5 rounded bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <span className="text-[#10b981] font-bold block">Protein</span>
              <span className="text-[#1c1917] dark:text-[#faf7f5] font-semibold">{pKcal} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <span className="text-[#ea580c] font-bold block">Carbs</span>
              <span className="text-[#1c1917] dark:text-[#faf7f5] font-semibold">{cKcal} kcal</span>
            </div>
            <div className="p-1.5 rounded bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <span className="text-[#eab308] font-bold block">Fat</span>
              <span className="text-[#1c1917] dark:text-[#faf7f5] font-semibold">{fKcal} kcal</span>
            </div>
          </div>
        </section>

        {/* Top Calorie Drivers */}
        {topMeals.length > 0 && (
          <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c1917] dark:text-[#faf7f5] flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
              Top Calorie Drivers
            </h2>
            <div className="space-y-2">
              {topMeals.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-[#1c1917] dark:text-[#ede9e6] truncate">
                      {i + 1}. {m.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680] mt-0.5">
                      <span className="capitalize">{m.type}</span> •{' '}
                      <span className="text-[#10b981]">P:{Math.round(m.protein)}g</span> •{' '}
                      <span className="text-[#ea580c]">C:{Math.round(m.carbs)}g</span> •{' '}
                      <span className="text-[#eab308]">F:{Math.round(m.fat)}g</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#1c1917] dark:text-[#faf7f5] shrink-0 tabular-nums">
                    {m.calories} <span className="text-[9px] font-normal text-[#78716c]">kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
