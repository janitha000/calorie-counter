'use client'

import { useState } from 'react'
import { Clock, Trash2, Edit2, Check, X, AlertTriangle, Plus, Heart, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export function MealCard({ meal }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  
  const [editData, setEditData] = useState({
    name: meal.name,
    servings: meal.servings,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    sugar: meal.sugar || 0,
    insight: meal.insight || null,
    items: meal.items || []
  })

  // displayData is the source-of-truth for the read-only view.
  // It's updated immediately after a successful save so the card
  // reflects changes without waiting for a full server round-trip.
  const [displayData, setDisplayData] = useState({
    name: meal.name,
    servings: meal.servings,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    sugar: meal.sugar || 0,
    insight: meal.insight || null,
    items: meal.items || []
  })

  // Default daily goals for percentages
  const GOALS = {
    calories: 1600,
    carbs: 135,
    protein: 135,
    fat: 58
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err) {
      alert("Failed to delete meal")
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/meals/${meal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      if (!res.ok) throw new Error('Failed to update')
      
      // Immediately update the display view so the user sees
      // their changes without waiting for the server round-trip.
      setDisplayData({ ...editData })
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      alert("Failed to update meal")
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...editData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto recalculate totals if items exist
    const totalCals = newItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const totalProtein = newItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const totalCarbs = newItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
    const totalFat = newItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);
    const totalSugar = newItems.reduce((sum, item) => sum + (Number(item.sugar) || 0), 0);

    setEditData({
      ...editData,
      items: newItems,
      calories: totalCals,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      sugar: totalSugar
    });
  }

  const removeItem = (index) => {
    const newItems = editData.items.filter((_, i) => i !== index);
    
    const totalCals = newItems.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const totalProtein = newItems.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const totalCarbs = newItems.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0);
    const totalFat = newItems.reduce((sum, item) => sum + (Number(item.fat) || 0), 0);
    const totalSugar = newItems.reduce((sum, item) => sum + (Number(item.sugar) || 0), 0);

    setEditData({
      ...editData,
      items: newItems,
      calories: totalCals,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      sugar: totalSugar
    });
  }

  const addItem = () => {
    setEditData({
      ...editData,
      items: [...editData.items, { name: "New Item", servings: 1, calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }]
    })
  }

  const handleSaveTemplate = async () => {
    setIsSavingTemplate(true)
    try {
      const res = await fetch('/api/saved-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
      })
      if (!res.ok) throw new Error("Failed to save template")
      alert("Saved as Template!")
      window.location.reload() // Refresh to update FoodInput templates
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleReanalyze = async () => {
    setIsReanalyzing(true)
    try {
      // Build items list: use existing items array, or fall back to the meal name itself
      const itemsToSend = (editData.items && editData.items.length > 0)
        ? editData.items
        : [{ name: editData.name, servings: editData.servings || 1 }]

      const res = await fetch('/api/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editData.name, items: itemsToSend })
      })
      if (!res.ok) throw new Error("Failed to reanalyze")
      
      const newMetrics = await res.json()

      // Ensure returned items are properly formed before replacing
      const updatedItems = (newMetrics.items && newMetrics.items.length > 0)
        ? newMetrics.items
        : editData.items

      setEditData(prev => ({
        ...prev,
        name: newMetrics.name || prev.name,
        calories: newMetrics.calories,
        protein: newMetrics.protein,
        carbs: newMetrics.carbs,
        fat: newMetrics.fat,
        sugar: newMetrics.sugar,
        insight: newMetrics.insight,
        items: updatedItems,
      }))
    } catch (err) {
      console.error(err)
      alert("Failed to re-analyze with AI.")
    } finally {
      setIsReanalyzing(false)
    }
  }

  const emoji = meal.type === 'breakfast' ? '🍳' : meal.type === 'lunch' ? '🥗' : meal.type === 'dinner' ? '🍲' : '🥨'

  const MacroColumn = ({ label, value, unit, goal }) => {
    const percentage = Math.min(100, Math.round((value / goal) * 100))
    return (
      <div className="flex flex-col">
        <span className="text-[12px] text-gray-500 mb-1">{label}</span>
        <div className="flex items-baseline gap-0.5 mb-1.5">
          <span className="text-[16px] font-bold text-gray-900 leading-none">{value}</span>
          {unit && <span className="text-[12px] font-bold text-gray-900">{unit}</span>}
        </div>
        <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden mb-1.5">
          <div 
            className="h-full bg-[#99b7db] rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[11px] text-gray-500 font-medium">{percentage}%</span>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 transition-all">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
            <span className="text-xl">{emoji}</span>
          </div>
          <textarea 
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            className="flex-1 font-bold text-base text-gray-900 border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-1 transition-colors bg-transparent resize-none leading-snug"
            rows={2}
          />
        </div>

        {editData.items && editData.items.length > 0 ? (
          <div className="mb-5 border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider grid grid-cols-12 gap-1 text-center">
              <div className="col-span-3 text-left">Item</div>
              <div className="col-span-2 text-green-600">Cal</div>
              <div className="col-span-1 text-red-500">P</div>
              <div className="col-span-1 text-blue-500">C</div>
              <div className="col-span-1 text-orange-500">F</div>
              <div className="col-span-2 text-pink-500">Sug</div>
              <div className="col-span-2"></div>
            </div>
            {editData.items.map((item, index) => (
              <div key={index} className="px-3 py-2 border-t border-gray-100 grid grid-cols-12 gap-1 items-center">
                <input 
                  className="col-span-3 font-semibold text-[11px] text-gray-900 bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.name}
                  onChange={e => handleItemChange(index, 'name', e.target.value)}
                />
                <input 
                  type="number"
                  className="col-span-2 text-center font-bold text-green-600 text-[11px] bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.calories}
                  onChange={e => handleItemChange(index, 'calories', e.target.value)}
                />
                <input 
                  type="number"
                  className="col-span-1 text-center font-bold text-red-500 text-[11px] bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.protein}
                  onChange={e => handleItemChange(index, 'protein', e.target.value)}
                />
                <input 
                  type="number"
                  className="col-span-1 text-center font-bold text-blue-500 text-[11px] bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.carbs}
                  onChange={e => handleItemChange(index, 'carbs', e.target.value)}
                />
                <input 
                  type="number"
                  className="col-span-1 text-center font-bold text-orange-500 text-[11px] bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.fat}
                  onChange={e => handleItemChange(index, 'fat', e.target.value)}
                />
                <input 
                  type="number"
                  className="col-span-2 text-center font-bold text-pink-500 text-[11px] bg-transparent outline-none w-full border-b border-transparent focus:border-gray-300"
                  value={item.sugar || 0}
                  onChange={e => handleItemChange(index, 'sugar', e.target.value)}
                />
                <button onClick={() => removeItem(index)} className="col-span-2 text-gray-400 hover:text-red-500 p-1 mx-auto">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button onClick={addItem} className="w-full text-[12px] font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 py-2 flex justify-center items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Servings</label>
              <input type="number" step="0.1" value={editData.servings} onChange={e => setEditData({...editData, servings: e.target.value})} className="w-full bg-transparent font-bold text-gray-900 outline-none" />
            </div>
            <div className="bg-green-50 p-2.5 rounded-xl border border-green-100/50">
              <label className="text-[10px] text-green-600 font-bold uppercase tracking-wider block mb-1">Calories</label>
              <input type="number" value={editData.calories} onChange={e => setEditData({...editData, calories: e.target.value})} className="w-full bg-transparent font-bold text-green-700 outline-none" />
            </div>
            <div className="bg-red-50 p-2.5 rounded-xl border border-red-100/50">
              <label className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mb-1">Protein (g)</label>
              <input type="number" value={editData.protein} onChange={e => setEditData({...editData, protein: e.target.value})} className="w-full bg-transparent font-bold text-red-700 outline-none" />
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100/50">
              <label className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mb-1">Carbs (g)</label>
              <input type="number" value={editData.carbs} onChange={e => setEditData({...editData, carbs: e.target.value})} className="w-full bg-transparent font-bold text-blue-700 outline-none" />
            </div>
            <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100/50">
              <label className="text-[10px] text-orange-500 font-bold uppercase tracking-wider block mb-1">Fat (g)</label>
              <input type="number" value={editData.fat} onChange={e => setEditData({...editData, fat: e.target.value})} className="w-full bg-transparent font-bold text-orange-700 outline-none" />
            </div>
            <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-100/50 col-span-2">
              <label className="text-[10px] text-pink-500 font-bold uppercase tracking-wider block mb-1">Sugar (g)</label>
              <input type="number" value={editData.sugar} onChange={e => setEditData({...editData, sugar: e.target.value})} className="w-full bg-transparent font-bold text-pink-700 outline-none" />
            </div>
          </div>
        )}

        <button 
          onClick={handleReanalyze} 
          disabled={isReanalyzing}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors mb-3 border border-indigo-100 disabled:opacity-50"
        >
          {isReanalyzing ? (
            <span className="flex items-center gap-2"><span className="animate-spin text-lg">⚙️</span> Analyzing...</span>
          ) : (
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 fill-indigo-500" /> Re-Analyze with AI</span>
          )}
        </button>

        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/10">
            <Check className="w-4 h-4 stroke-[3px]" /> Save Changes
          </button>
          <button onClick={() => setIsEditing(false)} className="px-5 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    )
  }

  if (showDeleteConfirm) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-[0_2px_10px_-2px_rgba(255,0,0,0.05)] transition-all flex flex-col justify-center items-center text-center gap-3">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-1">
          <Trash2 className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-lg">Delete {meal.name}?</h4>
          <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
        </div>
        <div className="flex w-full gap-3 mt-4">
          <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/20 disabled:opacity-50">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2.5 relative">
      {/* Top Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100 shadow-sm">
          <span className="text-xl">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-[15px] text-gray-900 truncate leading-tight">{displayData.name}</h4>
            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded">
              {displayData.servings} {displayData.servings === 1 ? 'srv' : 'srvs'}
            </span>
          </div>
          {displayData.insight && (
            <p className="text-[10px] text-indigo-500 font-medium italic mt-1 leading-tight flex items-start gap-1 bg-indigo-50/50 p-1 rounded pr-2">
              <Sparkles className="w-3 h-3 shrink-0 mt-[1px]" />
              {displayData.insight}
            </p>
          )}
        </div>
      </div>

      {/* Optional Items Breakdown */}
      {displayData.items && displayData.items.length > 0 && (
        <>
          <div className="flex flex-col">
            {displayData.items.map((item, i) => (
              <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[14px] font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="flex gap-4 text-[11px] font-medium text-gray-500">
                  <span className="flex items-center gap-1">Calories: <span className="font-bold text-gray-700">{item.calories}</span></span>
                  <span className="flex items-center gap-1">Carbs: <span className="font-bold text-gray-700">{item.carbs}g</span></span>
                  <span className="flex items-center gap-1">Protein: <span className="font-bold text-gray-700">{item.protein}g</span></span>
                  <span className="flex items-center gap-1">Fat: <span className="font-bold text-gray-700">{item.fat}g</span></span>
                  <span className="flex items-center gap-1">Sugar: <span className="font-bold text-pink-500">{item.sugar || 0}g</span></span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Macros Section */}
      <div className="grid grid-cols-4 gap-4 px-1">
        <MacroColumn label="Calories" value={displayData.calories} unit="" goal={GOALS.calories} />
        <MacroColumn label="Carbs" value={Math.round(displayData.carbs)} unit="g" goal={GOALS.carbs} />
        <MacroColumn label="Protein" value={Math.round(displayData.protein)} unit="g" goal={GOALS.protein} />
        <MacroColumn label="Fat" value={Math.round(displayData.fat)} unit="g" goal={GOALS.fat} />
      </div>



      {/* Sugar Meter */}
      <div className="bg-gray-50 rounded-xl p-2 border border-gray-100/50 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-pink-500" /> Sugar <span className="text-gray-900 ml-1">{Math.round(displayData.sugar || 0)}g</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex relative">
          <div className="h-full bg-green-400" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-yellow-400" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-red-400" style={{ width: '33.33%' }}></div>
          
          {/* Indicator Marker */}
          <div 
            className="absolute h-2.5 w-1 bg-gray-900 rounded-full shadow-sm -mt-[2px] transition-all" 
            style={{ 
              marginLeft: `${Math.min(100, ((displayData.sugar || 0) / 20) * 100)}%`,
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-bold text-gray-400">
          <span>Safe (&lt;5g)</span>
          <span>Mod</span>
          <span>High (&gt;15g)</span>
        </div>
      </div>



      {/* Footer Section */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-[11px] text-gray-400 font-bold tracking-wide">
          <Clock className="w-3 h-3 inline mr-1 text-gray-300" />
          {format(new Date(meal.loggedAt), 'h:mm a')}
        </span>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={handleSaveTemplate}
            disabled={isSavingTemplate}
            className="p-2 text-pink-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-all disabled:opacity-50"
            title="Save as Template"
          >
            <Heart className={`w-4 h-4 ${isSavingTemplate ? 'animate-pulse fill-pink-400' : ''}`} />
          </button>
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
