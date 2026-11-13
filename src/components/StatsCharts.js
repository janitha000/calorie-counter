'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart2,
  Flame,
  Clock,
  Sun,
  Moon,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTactileTheme } from '@/lib/useTheme';

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#10b981', overColor: '#ea580c' },
  { key: 'protein', label: 'Protein', unit: 'g', color: '#10b981', overColor: '#10b981' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#ea580c', overColor: '#ea580c' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#eab308', overColor: '#ca8a04' },
  { key: 'sugar', label: 'Sugar', unit: 'g', color: '#fb7185', overColor: '#e11d48' },
  { key: 'fastingHours', label: 'Fasting', unit: 'h', color: '#10b981', underColor: '#eab308' },
];

export function StatsCharts({ data = [], range = '7d', limits }) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTactileTheme();
  const [activeMetric, setActiveMetric] = useState('calories');
  const [selectedIdx, setSelectedIdx] = useState(data.length > 0 ? data.length - 1 : 0);

  const handleRangeChange = (newRange) => {
    router.replace(`/stats?range=${newRange}`);
  };

  // Compute period KPIs over days that have logged meals
  const loggedDays = data.filter((d) => d.mealCount > 0);
  const loggedCount = loggedDays.length;

  const avgCalories = loggedCount > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.calories, 0) / loggedCount)
    : 0;
  const avgProtein = loggedCount > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.protein, 0) / loggedCount)
    : 0;
  const avgCarbs = loggedCount > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.carbs, 0) / loggedCount)
    : 0;
  const avgFat = loggedCount > 0
    ? Math.round(loggedDays.reduce((s, d) => s + d.fat, 0) / loggedCount)
    : 0;
  const avgSugar = loggedCount > 0
    ? Math.round((loggedDays.reduce((s, d) => s + d.sugar, 0) / loggedCount) * 10) / 10
    : 0;

  const fastingDays = data.filter((d) => d.fastingHours !== null);
  const avgFasting = fastingDays.length > 0
    ? Math.round((fastingDays.reduce((s, d) => s + d.fastingHours, 0) / fastingDays.length) * 10) / 10
    : 0;
  const fastingGoalHits = fastingDays.filter((d) => d.fastingHours >= limits.fasting).length;

  const sugarCompliantDays = loggedDays.filter((d) => d.sugar <= limits.sugar).length;
  const calDelta = avgCalories - limits.calories;
  const proteinPct = Math.round((avgProtein / (limits.protein || 1)) * 100);

  // Active metric config & scaling
  const metricCfg = METRICS.find((m) => m.key === activeMetric) || METRICS[0];
  const targetVal = activeMetric === 'fastingHours' ? limits.fasting : limits[activeMetric];
  const values = data.map((d) => (d[activeMetric] ?? 0));
  const maxDataVal = Math.max(...values, targetVal || 1, 1);
  const chartMax = Math.ceil(maxDataVal * 1.15);
  const targetPct = Math.min(100, (targetVal / chartMax) * 100);

  const selectedDay = data[selectedIdx] || data[data.length - 1];

  // Period average macro caloric split
  const totalMacroKcal = avgProtein * 4 + avgCarbs * 4 + avgFat * 9 || 1;
  const avgPRatio = Math.round(((avgProtein * 4) / totalMacroKcal) * 100);
  const avgCRatio = Math.round(((avgCarbs * 4) / totalMacroKcal) * 100);
  const avgFRatio = Math.max(0, 100 - avgPRatio - avgCRatio);

  const getBarColor = (val) => {
    if (!val || val <= 0) return 'transparent';
    if (activeMetric === 'fastingHours') {
      return val >= targetVal ? metricCfg.color : metricCfg.underColor;
    }
    if (activeMetric === 'protein') {
      return metricCfg.color;
    }
    if (activeMetric === 'calories' || activeMetric === 'sugar') {
      return val > targetVal ? metricCfg.overColor : metricCfg.color;
    }
    return metricCfg.color;
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col">
      {/* Sticky Tactile Top Header */}
      <header className="sticky top-0 z-30 bg-[#f7f5f0]/95 dark:bg-[#0e0d0c]/95 backdrop-blur-md border-b border-[#e4dfd7] dark:border-[#282422] px-4 py-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-[#1c1917] dark:text-[#faf7f5]">
                Trends & Analytics
              </h1>
              <p className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                {loggedCount}/{data.length} days logged
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Range Switcher */}
            <div className="flex items-center bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-0.5 shadow-xs">
              {[
                { id: '7d', label: '7D' },
                { id: '14d', label: '14D' },
                { id: '30d', label: '30D' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRangeChange(r.id)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                    range === r.id
                      ? 'bg-[#10b981] text-[#0e0d0c]'
                      : 'text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
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
        {/* 2x2 KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Avg Intake */}
          <div className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#78716c] dark:text-[#8e8680] mb-1">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#10b981]" /> Avg Intake
              </span>
            </div>
            <div className="font-mono text-lg font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums leading-tight">
              {avgCalories.toLocaleString()}
              <span className="text-[10px] font-normal text-[#78716c] dark:text-[#8e8680] ml-1">kcal</span>
            </div>
            <div className={`text-[10px] font-mono mt-0.5 tabular-nums ${
              calDelta > 0 ? 'text-[#ea580c]' : 'text-[#10b981]'
            }`}>
              {loggedCount === 0
                ? 'No logs yet'
                : `${calDelta > 0 ? '+' : ''}${calDelta} vs ${limits.calories}`}
            </div>
          </div>

          {/* Avg Protein (Green) */}
          <div className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] dark:border-[#065f46] dark:bg-[#064e3b]/50 p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-[#047857] dark:text-[#10b981] mb-1">
              <span>Avg Protein</span>
              <span className="font-mono tabular-nums">{proteinPct}%</span>
            </div>
            <div className="font-mono text-lg font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums leading-tight">
              {avgProtein}g
              <span className="text-[10px] font-normal text-[#78716c] dark:text-[#8e8680] ml-1">/ {limits.protein}g</span>
            </div>
            <div className="text-[10px] font-mono text-[#047857]/90 dark:text-[#10b981]/80 mt-0.5">
              {avgProtein >= limits.protein ? 'Goal met on avg' : `${Math.max(0, limits.protein - avgProtein)}g short`}
            </div>
          </div>

          {/* Avg Fasting */}
          <div className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#78716c] dark:text-[#8e8680] mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#eab308]" /> Avg Fast
              </span>
            </div>
            <div className="font-mono text-lg font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums leading-tight">
              {avgFasting}h
            </div>
            <div className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680] mt-0.5">
              {fastingDays.length > 0 ? `${fastingGoalHits}/${fastingDays.length} days ≥${limits.fasting}h` : 'Need consecutive days'}
            </div>
          </div>

          {/* Sugar Compliance */}
          <div className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-[#be123c] dark:text-[#fb7185] mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sugar Cap
              </span>
            </div>
            <div className="font-mono text-lg font-extrabold text-[#1c1917] dark:text-[#faf7f5] tabular-nums leading-tight">
              {sugarCompliantDays}/{loggedCount}
              <span className="text-[10px] font-normal text-[#78716c] dark:text-[#8e8680] ml-1">days</span>
            </div>
            <div className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680] mt-0.5 tabular-nums">
              Avg {avgSugar}g / {limits.sugar}g max
            </div>
          </div>
        </div>

        {/* Interactive Primary Trend Chart */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2.5 mb-2.5 border-b border-[#f0ebe3] dark:border-[#282422]">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeMetric === m.key
                    ? 'bg-[#1c1917] text-[#faf7f5] dark:bg-[#faf7f5] dark:text-[#0e0d0c]'
                    : 'bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#78716c] dark:text-[#8e8680] border border-[#e4dfd7] dark:border-[#282422]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Selected Day Readout Banner */}
          {selectedDay && (
            <Link
              href={`/summary?date=${selectedDay.dateStr}`}
              className="flex items-center justify-between p-2 mb-3 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] hover:border-[#10b981] transition-colors group"
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] dark:text-[#8e8680]">
                  {selectedDay.fullDate}
                </div>
                <div className="font-mono text-xs font-bold text-[#1c1917] dark:text-[#faf7f5] tabular-nums mt-0.5">
                  {selectedDay[activeMetric] !== null && selectedDay[activeMetric] !== undefined
                    ? `${selectedDay[activeMetric]} ${metricCfg.unit}`
                    : 'No data'}
                  <span className="text-[10px] font-normal text-[#78716c] dark:text-[#8e8680] ml-2">
                    (Target: {targetVal}{metricCfg.unit})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-[#10b981]">
                <span>Summary</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}

          {/* Responsive Bar Chart */}
          <div className="relative h-40 w-full pt-4 pb-1 flex items-end gap-1">
            {/* Dashed Target Line */}
            <div
              className="absolute inset-x-0 border-t border-dashed border-[#78716c]/60 dark:border-[#8e8680]/60 pointer-events-none z-10 flex items-center justify-end"
              style={{ bottom: `${targetPct}%` }}
            >
              <span className="text-[9px] font-mono bg-[#f7f5f0] dark:bg-[#151312] text-[#78716c] dark:text-[#8e8680] px-1 -mt-4 rounded border border-[#e4dfd7] dark:border-[#282422]">
                {targetVal}{metricCfg.unit}
              </span>
            </div>

            {data.map((day, idx) => {
              const rawVal = day[activeMetric];
              const val = rawVal ?? 0;
              const pct = Math.min(100, (val / chartMax) * 100);
              const barColor = getBarColor(val);
              const isSelected = idx === selectedIdx;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className="flex-1 h-full flex flex-col items-center justify-end group focus:outline-none"
                  title={`${day.shortDate}: ${val}${metricCfg.unit}`}
                >
                  <div
                    className={`w-full h-full rounded-t-sm relative flex items-end overflow-hidden transition-colors ${
                      isSelected
                        ? 'bg-[#e4dfd7]/60 dark:bg-[#282422]/70'
                        : 'bg-[#f7f5f0]/60 dark:bg-[#0e0d0c]/60'
                    }`}
                  >
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${pct}%`,
                        backgroundColor: barColor,
                        opacity: isSelected ? 1 : 0.78,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center gap-1 mt-1.5">
            {data.map((day, idx) => {
              // Show fewer labels in 30D view so they stay legible
              const showLabel = range === '7d' || range === '14d' || idx % 5 === 0 || idx === data.length - 1;
              return (
                <div
                  key={day.dateStr}
                  className={`flex-1 text-center font-mono text-[9px] tabular-nums ${
                    idx === selectedIdx
                      ? 'text-[#10b981] font-bold'
                      : 'text-[#78716c] dark:text-[#8e8680]'
                  }`}
                >
                  {showLabel ? day.label : ''}
                </div>
              );
            })}
          </div>
        </section>

        {/* Macro Split Composition Trend */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1c1917] dark:text-[#faf7f5] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
              Macro Energy Split
            </h2>
            <div className="font-mono text-[10px] text-[#78716c] dark:text-[#8e8680] tabular-nums">
              Avg: <span className="text-[#10b981] font-bold">P {avgPRatio}%</span> •{' '}
              <span className="text-[#ea580c] font-bold">C {avgCRatio}%</span> •{' '}
              <span className="text-[#eab308] font-bold">F {avgFRatio}%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {data.slice(-7).map((day) => {
              const pK = day.protein * 4;
              const cK = day.carbs * 4;
              const fK = day.fat * 9;
              const tot = pK + cK + fK;
              const pP = tot > 0 ? (pK / tot) * 100 : 0;
              const cP = tot > 0 ? (cK / tot) * 100 : 0;
              const fP = tot > 0 ? Math.max(0, 100 - pP - cP) : 0;

              return (
                <div key={day.dateStr} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="w-12 text-[#78716c] dark:text-[#8e8680] tabular-nums shrink-0">
                    {day.shortDate}
                  </span>
                  <div className="flex-1 h-2.5 rounded bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] flex overflow-hidden">
                    {tot > 0 && (
                      <>
                        <div className="h-full bg-[#10b981]" style={{ width: `${pP}%` }} title={`Protein ${Math.round(pP)}%`} />
                        <div className="h-full bg-[#ea580c]" style={{ width: `${cP}%` }} title={`Carbs ${Math.round(cP)}%`} />
                        <div className="h-full bg-[#eab308]" style={{ width: `${fP}%` }} title={`Fat ${Math.round(fP)}%`} />
                      </>
                    )}
                  </div>
                  <span className="w-14 text-right text-[#1c1917] dark:text-[#ede9e6] tabular-nums shrink-0">
                    {day.calories > 0 ? `${day.calories}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily Average Macros Summary Strip */}
        <section className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#78716c] dark:text-[#8e8680] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
            Daily Averages ({loggedCount} logged days)
          </div>
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <div className="text-[9px] text-[#047857] dark:text-[#10b981] font-bold uppercase">Protein</div>
              <div className="text-xs font-extrabold mt-0.5 tabular-nums">{avgProtein}g</div>
            </div>
            <div className="p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <div className="text-[9px] text-[#c2410c] dark:text-[#ea580c] font-bold uppercase">Carbs</div>
              <div className="text-xs font-extrabold mt-0.5 tabular-nums">{avgCarbs}g</div>
            </div>
            <div className="p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <div className="text-[9px] text-[#a16207] dark:text-[#eab308] font-bold uppercase">Fat</div>
              <div className="text-xs font-extrabold mt-0.5 tabular-nums">{avgFat}g</div>
            </div>
            <div className="p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422]">
              <div className="text-[9px] text-[#be123c] dark:text-[#fb7185] font-bold uppercase">Sugar</div>
              <div className="text-xs font-extrabold mt-0.5 tabular-nums">{avgSugar}g</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
