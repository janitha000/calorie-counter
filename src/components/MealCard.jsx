'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export function MealCard({ meal, onUpdateMeal, onDeleteMeal }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse initial time for HTML <input type="time">
  const mealDate = new Date(meal.loggedAt || Date.now());
  const initialTimeStr = format(mealDate, 'HH:mm');

  // Edit form state
  const [timeInput, setTimeInput] = useState(initialTimeStr);
  const [editData, setEditData] = useState({
    name: meal.name,
    servings: meal.servings || 1,
    calories: meal.calories || 0,
    protein: meal.protein || 0,
    carbs: meal.carbs || 0,
    fat: meal.fat || 0,
    sugar: meal.sugar || 0,
    type: meal.type || 'snack',
    insight: meal.insight || '',
    items: Array.isArray(meal.items) ? meal.items : [],
  });

  // Calculate new loggedAt ISO string when time input changes
  const getUpdatedLoggedAt = () => {
    try {
      const [hours, minutes] = timeInput.split(':').map(Number);
      const updatedDate = new Date(meal.loggedAt || Date.now());
      updatedDate.setHours(hours, minutes, 0, 0);
      return updatedDate.toISOString();
    } catch {
      return meal.loggedAt;
    }
  };

  // Handle changes to individual decomposed items
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-recalculate totals across items
    const totalCals = updatedItems.reduce((sum, it) => sum + (Number(it.calories) || 0), 0);
    const totalP = updatedItems.reduce((sum, it) => sum + (Number(it.protein) || 0), 0);
    const totalC = updatedItems.reduce((sum, it) => sum + (Number(it.carbs) || 0), 0);
    const totalF = updatedItems.reduce((sum, it) => sum + (Number(it.fat) || 0), 0);
    const totalSugar = updatedItems.reduce((sum, it) => sum + (Number(it.sugar) || 0), 0);

    setEditData({
      ...editData,
      items: updatedItems,
      calories: totalCals,
      protein: totalP,
      carbs: totalC,
      fat: totalF,
      sugar: totalSugar,
    });
  };

  const handleAddItem = () => {
    setEditData({
      ...editData,
      items: [
        ...editData.items,
        { name: 'New Food', calories: 100, protein: 5, carbs: 10, fat: 2, sugar: 0 },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = editData.items.filter((_, i) => i !== index);
    const totalCals = updatedItems.reduce((sum, it) => sum + (Number(it.calories) || 0), 0);
    const totalP = updatedItems.reduce((sum, it) => sum + (Number(it.protein) || 0), 0);
    const totalC = updatedItems.reduce((sum, it) => sum + (Number(it.carbs) || 0), 0);
    const totalF = updatedItems.reduce((sum, it) => sum + (Number(it.fat) || 0), 0);
    const totalSugar = updatedItems.reduce((sum, it) => sum + (Number(it.sugar) || 0), 0);

    setEditData({
      ...editData,
      items: updatedItems,
      calories: totalCals,
      protein: totalP,
      carbs: totalC,
      fat: totalF,
      sugar: totalSugar,
    });
  };

  // Submit PUT to /api/meals/[id]
  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...editData,
        servings: Number(editData.servings) || 1,
        calories: Number(editData.calories) || 0,
        protein: Number(editData.protein) || 0,
        carbs: Number(editData.carbs) || 0,
        fat: Number(editData.fat) || 0,
        sugar: Number(editData.sugar) || 0,
        loggedAt: getUpdatedLoggedAt(),
      };

      const res = await fetch(`/api/meals/${meal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update meal');
      const data = await res.json();
      setIsEditing(false);
      onUpdateMeal?.(data.meal || { ...meal, ...payload });
    } catch (err) {
      console.error(err);
      alert('Could not update meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Daily target percentages
  const targetCalories = 1600;
  const calPercent = Math.min(100, Math.round(((meal.calories || 0) / targetCalories) * 100));
  const carbPercent = Math.min(100, Math.round(((meal.carbs || 0) / 135) * 100));
  const proteinPercent = Math.min(100, Math.round(((meal.protein || 0) / 135) * 100));
  const fatPercent = Math.min(100, Math.round(((meal.fat || 0) / 58) * 100));

  const itemsList = Array.isArray(meal.items) ? meal.items : [];

  // ================= EDIT MODE =================
  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="p-3.5 bg-white dark:bg-[#0e0d0c] border-2 border-[#10b981]/50 rounded-xl space-y-3 text-xs"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e4dfd7] dark:border-[#282422]">
          <span className="font-bold text-[#1c1917] dark:text-[#ede9e6]">
            Edit Food & Time
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1 text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Name & Time input */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
              Meal Name
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-semibold focus:outline-none focus:border-[#10b981]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
              Time (Logged At)
            </label>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono font-bold focus:outline-none focus:border-[#10b981]"
            />
          </div>
        </div>

        {/* Meal Category / Type Switcher */}
        <div>
          <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-1">
            Category
          </label>
          <div className="flex gap-1">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setEditData({ ...editData, type: cat })}
                className={`flex-1 py-1 rounded-md text-[10px] font-bold capitalize transition-colors ${
                  editData.type === cat
                    ? 'bg-[#10b981] text-[#0e0d0c]'
                    : 'bg-[#f7f5f0] dark:bg-[#151312] text-[#78716c] dark:text-[#8e8680] border border-[#e4dfd7] dark:border-[#282422]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Optional AI Insight Field */}
        <div>
          <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
            AI Insight Note
          </label>
          <input
            type="text"
            value={editData.insight}
            onChange={(e) => setEditData({ ...editData, insight: e.target.value })}
            placeholder="e.g. Good protein & fiber, but high carbs"
            className="w-full p-2 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-[11px] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* Decomposed Items Table or Direct Macro inputs */}
        {editData.items && editData.items.length > 0 ? (
          <div className="space-y-1.5 border border-[#e4dfd7] dark:border-[#282422] rounded-xl p-2 bg-[#f7f5f0]/50 dark:bg-[#151312]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] dark:text-[#8e8680]">
                Decomposed Items ({editData.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-bold text-[#10b981] flex items-center gap-0.5 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {editData.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1 p-1 rounded bg-transparent font-semibold text-[11px] text-[#1c1917] dark:text-[#ede9e6] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-[#78716c] hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                    <div>
                      <span className="text-[#78716c] block text-[8px]">CAL</span>
                      <input
                        type="number"
                        value={it.calories}
                        onChange={(e) => handleItemChange(idx, 'calories', e.target.value)}
                        className="w-full p-1 rounded bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[#f59e0b] block text-[8px]">PRO</span>
                      <input
                        type="number"
                        value={it.protein}
                        onChange={(e) => handleItemChange(idx, 'protein', e.target.value)}
                        className="w-full p-1 rounded bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[#ea580c] block text-[8px]">CARB</span>
                      <input
                        type="number"
                        value={it.carbs}
                        onChange={(e) => handleItemChange(idx, 'carbs', e.target.value)}
                        className="w-full p-1 rounded bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[#84cc16] block text-[8px]">FAT</span>
                      <input
                        type="number"
                        value={it.fat}
                        onChange={(e) => handleItemChange(idx, 'fat', e.target.value)}
                        className="w-full p-1 rounded bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[#fb7185] block text-[8px]">SUG</span>
                      <input
                        type="number"
                        value={it.sugar || 0}
                        onChange={(e) => handleItemChange(idx, 'sugar', e.target.value)}
                        className="w-full p-1 rounded bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
            <div>
              <label className="block text-[8px] font-bold text-[#78716c] uppercase">Calories</label>
              <input
                type="number"
                value={editData.calories}
                onChange={(e) => setEditData({ ...editData, calories: e.target.value })}
                className="w-full p-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#f59e0b] uppercase">Protein</label>
              <input
                type="number"
                value={editData.protein}
                onChange={(e) => setEditData({ ...editData, protein: e.target.value })}
                className="w-full p-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#ea580c] uppercase">Carbs</label>
              <input
                type="number"
                value={editData.carbs}
                onChange={(e) => setEditData({ ...editData, carbs: e.target.value })}
                className="w-full p-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#fb7185] uppercase">Sugar</label>
              <input
                type="number"
                value={editData.sugar}
                onChange={(e) => setEditData({ ...editData, sugar: e.target.value })}
                className="w-full p-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0e0d0c] font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[40px]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl bg-[#f7f5f0] dark:bg-[#151312] text-[#78716c] dark:text-[#8e8680] font-bold hover:text-[#1c1917] dark:hover:text-[#ede9e6] border border-[#e4dfd7] dark:border-[#282422]"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // ================= DELETE CONFIRMATION =================
  if (showDeleteConfirm) {
    return (
      <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>Delete "{meal.name}"?</span>
        </div>
        <p className="text-[11px] text-[#78716c] dark:text-[#8e8680]">
          This meal log will be permanently removed.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onDeleteMeal(meal.id)}
            className="flex-1 py-1.5 rounded-lg bg-red-500 text-white font-bold text-center active:scale-95"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ================= READ-ONLY DISPLAY VIEW =================
  return (
    <article className="p-3.5 rounded-xl bg-white dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] space-y-3 shadow-xs transition-colors">
      {/* 1. Header: Emoji, Title, Servings, Sugar Dot */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">
              {meal.type === 'breakfast' ? '🍳' : meal.type === 'lunch' ? '🥗' : meal.type === 'dinner' ? '🍲' : '🥨'}
            </span>
            <h3 className="font-bold text-xs text-[#1c1917] dark:text-[#ede9e6] truncate leading-tight">
              {meal.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={`w-2 h-2 rounded-full ${
                (meal.sugar || 0) > 15 ? 'bg-red-400' : (meal.sugar || 0) > 0 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
              }`}
              title={`Sugar: ${meal.sugar || 0}g`}
            />
            <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-mono bg-[#f7f5f0] dark:bg-[#0e0d0c] px-1.5 py-0.5 rounded border border-[#e4dfd7] dark:border-[#282422]">
              {meal.servings || 1} srv
            </span>
          </div>
        </div>

        {/* 2. AI Description / Insight Pill if available */}
        {meal.insight && (
          <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-start gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-300 italic">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>{meal.insight}</span>
          </div>
        )}
      </div>

      {/* 3. Decomposed Items Breakdown (Per Category / Component) */}
      {itemsList.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-[#f0ebe3] dark:border-[#282422]">
          {itemsList.map((item, idx) => (
            <div key={idx} className="space-y-0.5 text-xs">
              <span className="font-semibold text-[#1c1917] dark:text-[#ede9e6] block">
                {item.name}
              </span>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                <span>Calories: <strong className="text-[#1c1917] dark:text-[#ede9e6]">{item.calories}</strong></span>
                <span>Carbs: <strong className="text-[#ea580c]">{item.carbs || 0}g</strong></span>
                <span>Protein: <strong className="text-[#f59e0b]">{item.protein || 0}g</strong></span>
                <span>Fat: <strong className="text-[#84cc16]">{item.fat || 0}g</strong></span>
                <span>Sugar: <strong className="text-[#fb7185]">{item.sugar || 0}g</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Total Macro Progress Bars */}
      <div className="pt-2 border-t border-[#f0ebe3] dark:border-[#282422] grid grid-cols-4 gap-2 text-left">
        <div>
          <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] block font-semibold">Calories</span>
          <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] font-mono block">
            {meal.calories}
          </span>
          <div className="h-1 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#10b981]" style={{ width: `${calPercent}%` }} />
          </div>
          <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] font-mono mt-0.5 block">{calPercent}%</span>
        </div>

        <div>
          <span className="text-[10px] text-[#ea580c] block font-semibold">Carbs</span>
          <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] font-mono block">
            {Math.round(meal.carbs || 0)}g
          </span>
          <div className="h-1 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#ea580c]" style={{ width: `${carbPercent}%` }} />
          </div>
          <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] font-mono mt-0.5 block">{carbPercent}%</span>
        </div>

        <div>
          <span className="text-[10px] text-[#f59e0b] block font-semibold">Protein</span>
          <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] font-mono block">
            {Math.round(meal.protein || 0)}g
          </span>
          <div className="h-1 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#f59e0b]" style={{ width: `${proteinPercent}%` }} />
          </div>
          <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] font-mono mt-0.5 block">{proteinPercent}%</span>
        </div>

        <div>
          <span className="text-[10px] text-[#84cc16] block font-semibold">Fat</span>
          <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] font-mono block">
            {Math.round(meal.fat || 0)}g
          </span>
          <div className="h-1 w-full bg-[#f0ebe3] dark:bg-[#282422] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#84cc16]" style={{ width: `${fatPercent}%` }} />
          </div>
          <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] font-mono mt-0.5 block">{fatPercent}%</span>
        </div>
      </div>

      {/* 5. Footer: Time, Edit & Delete Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[#f0ebe3] dark:border-[#282422] text-xs">
        <span className="text-[11px] font-mono text-[#78716c] dark:text-[#8e8680] flex items-center gap-1 font-semibold">
          <Clock className="w-3.5 h-3.5" />
          {format(mealDate, 'h:mm a')}
        </span>

        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-[#78716c] dark:text-[#8e8680] hover:text-[#10b981] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit meal and time"
            aria-label="Edit meal and time"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 rounded-lg text-[#78716c] dark:text-[#8e8680] hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Delete meal"
            aria-label="Delete meal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
