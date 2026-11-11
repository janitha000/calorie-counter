'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Edit3, 
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

  // Time handling
  const mealDate = new Date(meal.loggedAt || Date.now());
  const initialTimeStr = format(mealDate, 'HH:mm');
  const [timeInput, setTimeInput] = useState(initialTimeStr);

  // Edit form state
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

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
        { name: 'New Component', calories: 100, protein: 5, carbs: 10, fat: 2, sugar: 0 },
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
      alert('Could not update meal.');
    } finally {
      setIsSaving(false);
    }
  };

  const itemsList = Array.isArray(meal.items) ? meal.items : [];
  const itemSugar = meal.sugar !== undefined ? Math.round(meal.sugar * 10) / 10 : 0;

  // Only show decomposed sub-items if there are multiple items or the item name differs from meal name
  const hasMultipleDistinctComponents = itemsList.length > 1 || (
    itemsList.length === 1 && 
    itemsList[0]?.name && 
    itemsList[0].name.trim().toLowerCase() !== meal.name.trim().toLowerCase()
  );

  // Portion label
  const portionLabel = meal.servings && meal.servings !== 1 
    ? `${meal.servings} servings` 
    : (itemsList.length > 1 ? `${itemsList.length} components` : '1 standard serving');

  // ================= EDIT MODE =================
  if (isEditing) {
    return (
      <form
        onSubmit={handleSave}
        className="p-3 bg-white dark:bg-[#12100f] border-2 border-[#10b981]/50 rounded-lg space-y-3 text-xs my-2"
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-[#e4dfd7] dark:border-[#282422]">
          <span className="font-bold text-[#1c1917] dark:text-[#ede9e6] uppercase tracking-wider text-[10px]">
            Edit Food Entry
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-1 text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Name & Time */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
              Food Name
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full p-2 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-semibold focus:outline-none focus:border-[#10b981]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
              Log Time
            </label>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full p-2 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-mono font-bold focus:outline-none focus:border-[#10b981]"
            />
          </div>
        </div>

        {/* Category Switcher */}
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
                className={`flex-1 py-1 rounded text-[10px] font-bold capitalize transition-colors ${
                  editData.type === cat
                    ? 'bg-[#10b981] text-[#0e0d0c]'
                    : 'bg-[#f7f5f0] dark:bg-[#1c1918] text-[#78716c] dark:text-[#8e8680] border border-[#e4dfd7] dark:border-[#282422]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight Note */}
        <div>
          <label className="block text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] mb-0.5">
            AI Description / Insight
          </label>
          <input
            type="text"
            value={editData.insight}
            onChange={(e) => setEditData({ ...editData, insight: e.target.value })}
            placeholder="e.g. Good protein & fiber, but high carbs"
            className="w-full p-1.5 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-[11px] focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* Decomposed Components or Direct Macro Edit */}
        {editData.items && editData.items.length > 0 ? (
          <div className="space-y-1.5 border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-2 bg-[#f7f5f0]/50 dark:bg-[#151312]/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] dark:text-[#8e8680]">
                Decomposed Components ({editData.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-bold text-[#10b981] flex items-center gap-0.5 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add component
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {editData.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Component name"
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
                className="w-full p-1.5 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#f59e0b] uppercase">Protein</label>
              <input
                type="number"
                value={editData.protein}
                onChange={(e) => setEditData({ ...editData, protein: e.target.value })}
                className="w-full p-1.5 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#ea580c] uppercase">Carbs</label>
              <input
                type="number"
                value={editData.carbs}
                onChange={(e) => setEditData({ ...editData, carbs: e.target.value })}
                className="w-full p-1.5 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
            <div>
              <label className="block text-[8px] font-bold text-[#fb7185] uppercase">Sugar</label>
              <input
                type="number"
                value={editData.sugar}
                onChange={(e) => setEditData({ ...editData, sugar: e.target.value })}
                className="w-full p-1.5 rounded bg-[#f7f5f0] dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] text-center"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#0e0d0c] font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[38px]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-lg bg-[#f7f5f0] dark:bg-[#1c1918] text-[#78716c] dark:text-[#8e8680] font-bold hover:text-[#1c1917] dark:hover:text-[#ede9e6] border border-[#e4dfd7] dark:border-[#282422]"
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
      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2 text-xs my-2">
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>Remove "{meal.name}"?</span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onDeleteMeal(meal.id)}
            className="flex-1 py-1.5 rounded bg-red-500 text-white font-bold text-center active:scale-95"
          >
            Confirm Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1.5 rounded bg-white dark:bg-[#1c1918] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ================= EXACT TACTILE ROW VIEW =================
  return (
    <div className="relative border-b border-[#e4dfd7]/80 dark:border-[#282422]/70 last:border-b-0 py-3 px-3.5 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Food name & macro breakdown */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h4 className="font-semibold text-sm text-[#1c1917] dark:text-[#ede9e6] truncate leading-tight">
              {meal.name}
            </h4>
          </div>

          {/* Portion weight / serving badge */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#78716c] dark:text-[#8e8680] tabular-nums bg-[#f7f5f0] dark:bg-[#0e0d0c] px-1.5 py-0.5 rounded border border-[#e4dfd7] dark:border-[#282422]">
              {portionLabel}
            </span>

            {/* Micro macro tags (Protein, Carbs, Fat, Sugar) */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono tabular-nums">
              <span className="text-[#b45309] dark:text-[#f59e0b] font-semibold">
                P:{Math.round(meal.protein || 0)}g
              </span>
              <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
              <span className="text-[#c2410c] dark:text-[#ea580c] font-semibold">
                C:{Math.round(meal.carbs || 0)}g
              </span>
              <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
              <span className="text-[#4d7c0f] dark:text-[#84cc16] font-semibold">
                F:{Math.round(meal.fat || 0)}g
              </span>
              <span className="text-[#d8d1c7] dark:text-[#383230]">•</span>
              <span className="text-[#be123c] dark:text-[#fb7185] font-semibold">
                Sugar:{itemSugar}g
              </span>
            </div>
          </div>

          {/* AI Insight Badge if available */}
          {meal.insight && (
            <div className="mt-2 p-1.5 rounded-md bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/40 dark:border-indigo-800/30 flex items-start gap-1.5 text-[10.5px] text-indigo-700 dark:text-indigo-300 italic">
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
              <span>{meal.insight}</span>
            </div>
          )}

          {/* Decomposed Components if available (only for multi-component meals) */}
          {hasMultipleDistinctComponents && (
            <div className="mt-2.5 pt-2 border-t border-[#f0ebe3] dark:border-[#282422]/60 space-y-1.5">
              {itemsList.map((it, idx) => (
                <div key={idx} className="text-xs">
                  <div className="font-medium text-[#1c1917] dark:text-[#ede9e6]">
                    {it.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#78716c] dark:text-[#8e8680]">
                    <span>Calories: <strong className="text-[#1c1917] dark:text-[#ede9e6]">{it.calories}</strong></span>
                    <span>•</span>
                    <span className="text-[#f59e0b]">P:{it.protein || 0}g</span>
                    <span>•</span>
                    <span className="text-[#ea580c]">C:{it.carbs || 0}g</span>
                    <span>•</span>
                    <span className="text-[#84cc16]">F:{it.fat || 0}g</span>
                    <span>•</span>
                    <span className="text-[#fb7185]">Sugar:{it.sugar || 0}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Calories + Touch Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-[#1c1917] dark:text-[#faf7f5] tabular-nums">
              {Math.round(meal.calories)}
            </div>
            <div className="text-[10px] text-[#78716c] dark:text-[#8e8680] uppercase tracking-wider font-semibold">
              KCAL
            </div>
          </div>

          {/* Actions: Edit & Delete buttons */}
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#78716c] dark:text-[#8e8680] active:text-[#1c1917] dark:active:text-[#ede9e6] active:bg-[#e4dfd7] dark:active:bg-[#282422] transition-colors"
              title="Edit meal and time"
              aria-label={`Edit ${meal.name}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-[#78716c] dark:text-[#8e8680] active:text-[#b91c1c] dark:active:text-[#ea580c] active:bg-[#fee2e2] dark:active:bg-[#431407]/60 transition-colors"
              title="Delete food entry"
              aria-label={`Delete ${meal.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
