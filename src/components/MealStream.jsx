'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Droplet,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

const MEAL_CONFIG = {
  breakfast: { title: 'Breakfast', emoji: '🍳', defaultOpen: true },
  lunch:     { title: 'Lunch',     emoji: '🥗', defaultOpen: true },
  dinner:    { title: 'Dinner',    emoji: '🍲', defaultOpen: true },
  snack:     { title: 'Snacks & Hydration', emoji: '💧', defaultOpen: true },
};

export function MealStream({
  meals = [],
  waterGlasses = 6,
  waterGoal = 8,
  onAddWater,
  onRemoveWater,
  onOpenLogModal,
  onDeleteMeal,
  onUpdatePortion,
}) {
  const [openSections, setOpenSections] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true,
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

  // Sort all today's meals chronologically to find the exact meal that broke the fast (>0g sugar)
  const sortedChronologicalMeals = [...meals].sort(
    (a, b) => new Date(a.loggedAt) - new Date(b.loggedAt)
  );
  const fastBrokenMeal = sortedChronologicalMeals.find(
    (m) => Number(m.sugar || 0) > 0
  );

  return (
    <div className="space-y-4 px-4 py-2">
      {Object.entries(MEAL_CONFIG).map(([type, cfg]) => {
        const typeMeals = groupedMeals[type] || [];
        const isOpen = !!openSections[type];

        // Totals for this bay
        const totalCals = typeMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
        const totalP = Math.round(typeMeals.reduce((acc, m) => acc + (m.protein || 0), 0));
        const totalC = Math.round(typeMeals.reduce((acc, m) => acc + (m.carbs || 0), 0));
        const totalF = Math.round(typeMeals.reduce((acc, m) => acc + (m.fat || 0), 0));
        const totalSugar = Math.round(typeMeals.reduce((acc, m) => acc + (m.sugar || 0), 0));

        // Latest meal in bay for time reference
        const earliestMeal = typeMeals.length > 0 
          ? [...typeMeals].sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt))[0] 
          : null;
        const latestMeal = typeMeals.length > 0 
          ? [...typeMeals].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))[0] 
          : null;

        // Check if fast was broken in this specific bay (>0 sugar)
        const isFastBrokenInThisBay = fastBrokenMeal && typeMeals.some(m => m.id === fastBrokenMeal.id);
        const hasZeroSugarOnly = typeMeals.length > 0 && typeMeals.every(m => Number(m.sugar || 0) <= 0);

        return (
          <section
            key={type}
            className="bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-2xl overflow-hidden shadow-sm transition-all"
          >
            {/* Bay Header */}
            <div className="p-3.5 flex items-center justify-between gap-2 border-b border-transparent dark:border-transparent select-none">
              <button
                onClick={() => toggleSection(type)}
                className="flex items-center gap-2.5 flex-1 text-left min-h-[44px]"
                aria-expanded={isOpen}
              >
                <span className="text-xl">{cfg.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#1c1917] dark:text-[#ede9e6]">
                      {cfg.title}
                    </h2>
                    <span className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                      ({typeMeals.length})
                    </span>
                  </div>
                  {/* Fasting status tag: ONLY when >0 sugar */}
                  {isFastBrokenInThisBay && (
                    <span className="text-[10px] text-[#10b981] font-mono block">
                      Fast broken at {format(new Date(fastBrokenMeal.loggedAt), 'h:mm a')}
                    </span>
                  )}
                  {!fastBrokenMeal && hasZeroSugarOnly && (
                    <span className="text-[10px] text-[#84cc16] font-mono block">
                      Fasting intact • 0g sugar
                    </span>
                  )}
                  {type === 'dinner' && latestMeal && !isFastBrokenInThisBay && (
                    <span className="text-[10px] text-[#ea580c] font-mono block">
                      Last bite at {format(new Date(latestMeal.loggedAt), 'h:mm a')}
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-2">
                {/* Total calories tag */}
                {totalCals > 0 && (
                  <span className="text-xs font-mono font-bold text-[#1c1917] dark:text-[#ede9e6] bg-[#f7f5f0] dark:bg-[#282422] px-2 py-1 rounded-md border border-[#e4dfd7] dark:border-[#383330]">
                    {totalCals} kcal
                  </span>
                )}

                {/* Quick + Add to this specific meal */}
                <button
                  onClick={() => onOpenLogModal(type)}
                  className="w-8 h-8 rounded-lg bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20 active:scale-95 flex items-center justify-center transition-all min-h-[32px] min-w-[32px]"
                  title={`Add to ${cfg.title}`}
                  aria-label={`Add food to ${cfg.title}`}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Accordion toggle arrow */}
                <button
                  onClick={() => toggleSection(type)}
                  className="p-1 rounded text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]"
                  aria-label="Toggle section"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bay Content */}
            {isOpen && (
              <div className="px-3 pb-3 pt-1 border-t border-[#f0ebe3] dark:border-[#282422] space-y-2">
                {/* Snack Bay: Hydration Sub-Tracker */}
                {type === 'snack' && (
                  <div className="bg-[#f7f5f0]/70 dark:bg-[#0e0d0c]/50 border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-3 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Droplet className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] block">
                          Hydration
                        </span>
                        <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-mono">
                          {waterGlasses} of {waterGoal} glasses (~{waterGlasses * 250} ml)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={onRemoveWater}
                        disabled={waterGlasses <= 0}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680] disabled:opacity-40 flex items-center justify-center font-bold text-sm active:scale-95"
                        aria-label="Decrease water"
                      >
                        -
                      </button>
                      <button
                        onClick={onAddWater}
                        className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm active:scale-95 shadow-sm"
                        aria-label="Add glass of water"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {typeMeals.length === 0 ? (
                  <div className="text-center py-4 text-xs text-[#78716c] dark:text-[#8e8680]">
                    No foods logged for {cfg.title.toLowerCase()} yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {typeMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-2.5 rounded-xl bg-[#f7f5f0]/80 dark:bg-[#0e0d0c]/60 border border-[#e4dfd7] dark:border-[#282422] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1c1917] dark:text-[#ede9e6] truncate">
                              {meal.name}
                            </span>
                            {meal.servings && meal.servings !== 1 && (
                              <span className="text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                                {meal.servings}x
                              </span>
                            )}
                          </div>

                          {/* Nutrition row: Macros + Sugar */}
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                            <span className="text-[#f59e0b]">{Math.round(meal.protein || 0)}P</span>
                            <span>•</span>
                            <span className="text-[#ea580c]">{Math.round(meal.carbs || 0)}C</span>
                            <span>•</span>
                            <span className="text-[#84cc16]">{Math.round(meal.fat || 0)}F</span>
                            <span>•</span>
                            <span className="text-[#fb7185] font-semibold">{Math.round(meal.sugar || 0)}g sugar</span>
                          </div>
                        </div>

                        {/* Calories & Delete Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-[#1c1917] dark:text-[#ede9e6] text-sm">
                            {meal.calories} kcal
                          </span>
                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            className="p-1.5 text-[#78716c] dark:text-[#8e8680] hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-colors rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                            aria-label={`Delete ${meal.name}`}
                            title="Delete food entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
