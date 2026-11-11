'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export function GoalModal({
  isOpen,
  onClose,
  goals,
  onSaveGoals,
}) {
  const [form, setForm] = useState({
    calories: goals?.calories || 1600,
    protein: goals?.protein || 135,
    carbs: goals?.carbs || 135,
    fat: goals?.fat || 58,
    sugar: goals?.sugar || 25,
    water: goals?.water || 8,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveGoals({
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
      sugar: Number(form.sugar),
      water: Number(form.water),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e4dfd7] dark:border-[#282422]">
          <h2 className="text-sm font-bold text-[#1c1917] dark:text-[#ede9e6]">
            Daily Targets & Sugar Ceiling
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#78716c] dark:text-[#8e8680] mb-1">
              Calorie Target (kcal)
            </label>
            <input
              type="number"
              value={form.calories}
              onChange={(e) => setForm(prev => ({ ...prev, calories: e.target.value }))}
              className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#f59e0b] mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                value={form.protein}
                onChange={(e) => setForm(prev => ({ ...prev, protein: e.target.value }))}
                className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#ea580c] mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                value={form.carbs}
                onChange={(e) => setForm(prev => ({ ...prev, carbs: e.target.value }))}
                className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#84cc16] mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                value={form.fat}
                onChange={(e) => setForm(prev => ({ ...prev, fat: e.target.value }))}
                className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#fb7185] mb-1">
                Sugar Ceiling (g)
              </label>
              <input
                type="number"
                value={form.sugar}
                onChange={(e) => setForm(prev => ({ ...prev, sugar: e.target.value }))}
                className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-500 mb-1">
                Water (Glasses)
              </label>
              <input
                type="number"
                value={form.water}
                onChange={(e) => setForm(prev => ({ ...prev, water: e.target.value }))}
                className="w-full p-2 rounded-xl bg-[#f7f5f0] dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0e0d0c] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[44px] mt-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Save Targets
          </button>
        </form>
      </div>
    </div>
  );
}
