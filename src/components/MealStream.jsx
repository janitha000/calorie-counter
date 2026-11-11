'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Clock, 
  Droplets 
} from 'lucide-react';
import { format } from 'date-fns';
import { MealCard } from './MealCard';

const MEAL_CONFIG = {
  breakfast: { title: 'Breakfast', defaultTime: '8:30 AM' },
  lunch:     { title: 'Lunch',     defaultTime: '1:15 PM' },
  dinner:    { title: 'Dinner',    defaultTime: '7:30 PM' },
  snack:     { title: 'Snacks & Hydration', defaultTime: 'All day' },
};

export function MealStream({
  meals = [],
  waterGlasses = 6,
  waterGoal = 8,
  onAddWater,
  onRemoveWater,
  onOpenLogModal,
  onDeleteMeal,
  onUpdateMeal,
}) {
  const [openSections, setOpenSections] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
  });

  const toggleSection = (type) => {
    setOpenSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Group meals by type
  const groupedMeals = {
    breakfast: meals.filter(m => m.type === 'breakfast'),
    lunch: meals.filter(m => m.type === 'lunch'),
    dinner: meals.filter(m => m.type === 'dinner'),
    snack: meals.filter(m => m.type === 'snack' || !['breakfast', 'lunch', 'dinner'].includes(m.type)),
  };

  // Chronologically sort all meals to track fast breaking (when and only when sugar > 0)
  const sortedChronologicalMeals = [...meals].sort(
    (a, b) => new Date(a.loggedAt) - new Date(b.loggedAt)
  );
  const fastBrokenMeal = sortedChronologicalMeals.find(
    (m) => Number(m.sugar || 0) > 0
  );

  const waterMl = waterGlasses * 250;
  const targetWaterMl = (waterGoal || 8) * 250; // default 2000-2500ml

  return (
    <div className="space-y-3.5 px-3.5 pt-3 pb-24">
      {Object.entries(MEAL_CONFIG).map(([type, cfg]) => {
        const typeMeals = groupedMeals[type] || [];
        const isOpen = !!openSections[type];

        // Totals for this bay
        const totalCals = typeMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const totalP = Math.round(typeMeals.reduce((acc, m) => acc + (m.protein || 0), 0));
        const totalC = Math.round(typeMeals.reduce((acc, m) => acc + (m.carbs || 0), 0));
        const totalF = Math.round(typeMeals.reduce((acc, m) => acc + (m.fat || 0), 0));
        const totalSugar = Math.round(typeMeals.reduce((acc, m) => acc + (m.sugar || 0), 0) * 10) / 10;

        // Earliest/Latest meal in bay for time tag
        const sortedBayMeals = [...typeMeals].sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt));
        const earliestMeal = sortedBayMeals[0];
        const latestMeal = sortedBayMeals[sortedBayMeals.length - 1];

        const timeTag = type === 'snack' 
          ? 'All day' 
          : (earliestMeal ? format(new Date(earliestMeal.loggedAt), 'h:mm a') : cfg.defaultTime);

        // Fasting status tag: ONLY when >0 sugar
        const isFastBrokenInThisBay = fastBrokenMeal && typeMeals.some(m => m.id === fastBrokenMeal.id);
        const hasZeroSugarOnly = typeMeals.length > 0 && typeMeals.every(m => Number(m.sugar || 0) <= 0);

        return (
          <div
            key={type}
            className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-xl overflow-hidden shadow-sm transition-colors"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between p-3.5 min-h-[58px]">
              {/* Left Accordion Toggle */}
              <button
                onClick={() => toggleSection(type)}
                className="flex-1 flex items-center gap-2.5 text-left active:opacity-80 min-h-[44px]"
                aria-expanded={isOpen}
              >
                {/* Chevron */}
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-[#78716c] dark:text-[#8e8680] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#1c1917] dark:text-[#faf7f5] tracking-tight">
                      {cfg.title}
                    </h3>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-[#78716c] dark:text-[#8e8680] tabular-nums bg-[#f7f5f0] dark:bg-[#0e0d0c] px-1.5 py-0.5 rounded border border-[#e4dfd7] dark:border-[#282422]">
                      <Clock className="w-2.5 h-2.5" />
                      {timeTag}
                    </span>
                  </div>

                  {/* Fasting tag: ONLY when >0 sugar */}
                  {isFastBrokenInThisBay && (
                    <div className="text-[10px] text-[#059669] dark:text-[#10b981] font-mono tracking-tight mt-0.5 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Fast broken at {format(new Date(fastBrokenMeal.loggedAt), 'h:mm a')}
                    </div>
                  )}
                  {!fastBrokenMeal && hasZeroSugarOnly && (
                    <div className="text-[10px] text-[#84cc16] font-mono tracking-tight mt-0.5 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
                      Fasting intact • 0g sugar
                    </div>
                  )}
                </div>
              </button>

              {/* Right Area: Calorie readout + Quick Add Button */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-[#1c1917] dark:text-[#faf7f5] tabular-nums">
                    {Math.round(totalCals)}
                    <span className="text-[10px] font-normal text-[#78716c] dark:text-[#8e8680] ml-1 font-sans">kcal</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680] tabular-nums">
                    {typeMeals.length} {typeMeals.length === 1 ? 'item' : 'items'}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLogModal(type);
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-[#f0ebe3] dark:bg-[#282422] text-[#1c1917] dark:text-[#ede9e6] flex items-center justify-center active:bg-[#e4ded4] dark:active:bg-[#383230] active:scale-95 transition-all border border-[#e0dad0] dark:border-[#383230] ml-1 shadow-sm"
                  aria-label={`Quick add food to ${cfg.title}`}
                  title={`Quick add food to ${cfg.title}`}
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Accordion Content */}
            {isOpen && (
              <div className="border-t border-[#e4dfd7] dark:border-[#282422] bg-[#faf8f5] dark:bg-[#12100f]">
                {/* Hydration Tracker Section if Snacks & Hydration */}
                {type === 'snack' && (
                  <div className="p-3 bg-[#f0f9ff]/70 dark:bg-[#0e0d0c]/70 border-b border-[#bae6fd] dark:border-[#282422] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#0284c7] dark:text-[#38bdf8] font-semibold">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Hydration Intake</span>
                      </div>
                      <div className="font-mono text-xs text-[#1c1917] dark:text-[#faf7f5] tabular-nums">
                        <span className="font-bold">{waterMl}</span>
                        <span className="text-[#78716c] dark:text-[#8e8680] text-[11px]"> / {targetWaterMl} ml</span>
                      </div>
                    </div>

                    {/* Water progress bar */}
                    <div className="w-full bg-[#e0f2fe] dark:bg-[#151312] h-1.5 rounded-full overflow-hidden border border-[#bae6fd] dark:border-[#282422]">
                      <div
                        className="bg-[#0284c7] dark:bg-[#38bdf8] h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (waterMl / targetWaterMl) * 100)}%` }}
                      />
                    </div>

                    {/* Water Quick-Tap Chips */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={onAddWater}
                        className="flex-1 h-9 rounded bg-white dark:bg-[#151312] border border-[#bae6fd] dark:border-[#282422] text-xs font-mono text-[#0284c7] dark:text-[#38bdf8] active:bg-[#e0f2fe] dark:active:bg-[#1c1918] transition-colors flex items-center justify-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>250ml (1 cup)</span>
                      </button>
                      <button
                        onClick={() => {
                          onAddWater();
                          onAddWater();
                        }}
                        className="flex-1 h-9 rounded bg-white dark:bg-[#151312] border border-[#bae6fd] dark:border-[#282422] text-xs font-mono text-[#0284c7] dark:text-[#38bdf8] active:bg-[#e0f2fe] dark:active:bg-[#1c1918] transition-colors flex items-center justify-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>500ml (Bottle)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* List of food items */}
                {typeMeals.length === 0 ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-[#78716c] dark:text-[#8e8680] mb-2">No foods logged for {cfg.title} yet.</p>
                    <button
                      onClick={() => onOpenLogModal(type)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-xs text-[#1c1917] dark:text-[#ede9e6] active:bg-[#f0ebe3] dark:active:bg-[#282422]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log first item</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {typeMeals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onUpdateMeal={onUpdateMeal}
                        onDeleteMeal={onDeleteMeal}
                      />
                    ))}

                    {/* Meal Card Footer Summary (Exact styling from screenshot) */}
                    <div className="px-3.5 py-2.5 bg-white/80 dark:bg-[#0e0d0c]/40 border-t border-[#e4dfd7] dark:border-[#282422]/60 flex items-center justify-between text-[11px] text-[#78716c] dark:text-[#8e8680] font-mono tabular-nums flex-wrap gap-1">
                      <span className="font-sans font-medium text-[10px] uppercase tracking-wider">
                        MEAL BREAKDOWN:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#b45309] dark:text-[#f59e0b] font-semibold">
                          P: {totalP}g
                        </span>
                        <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
                        <span className="text-[#c2410c] dark:text-[#ea580c] font-semibold">
                          C: {totalC}g
                        </span>
                        <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
                        <span className="text-[#4d7c0f] dark:text-[#84cc16] font-semibold">
                          F: {totalF}g
                        </span>
                        <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
                        <span className="text-[#be123c] dark:text-[#fb7185] font-semibold">
                          Sugar: {totalSugar}g
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
