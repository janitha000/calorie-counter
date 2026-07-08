'use client'

import { useState } from 'react'
import { Clock, Trash2, Edit2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export function MealCard({ meal }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [editData, setEditData] = useState({
    name: meal.name,
    servings: meal.servings,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
  })

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${meal.name}?`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/meals/${meal.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch (err) {
      alert("Failed to delete meal")
      setIsDeleting(false)
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
      
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      alert("Failed to update meal")
    }
  }

  const emoji = meal.type === 'breakfast' ? '🍳' : meal.type === 'lunch' ? '🥗' : meal.type === 'dinner' ? '🍲' : '🥨'

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-[24px] shadow-lg border border-gray-200 transition-all">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
            <span className="text-xl">{emoji}</span>
          </div>
          <input 
            type="text" 
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            className="flex-1 font-bold text-lg text-gray-900 border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-1 transition-colors bg-transparent"
          />
        </div>

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
          <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100/50 col-span-2">
            <label className="text-[10px] text-orange-500 font-bold uppercase tracking-wider block mb-1">Fat (g)</label>
            <input type="number" value={editData.fat} onChange={e => setEditData({...editData, fat: e.target.value})} className="w-full bg-transparent font-bold text-orange-700 outline-none" />
          </div>
        </div>

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

  return (
    <div className={`bg-white p-4 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex gap-4 transition-all relative group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="w-[52px] h-[52px] bg-gray-50 rounded-[18px] flex flex-col items-center justify-center shrink-0 border border-gray-100 shadow-inner mt-1">
        <span className="text-[22px]">{emoji}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="min-w-0 pr-2">
            <h4 className="font-bold text-[16px] text-gray-900 truncate leading-tight">{meal.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 shadow-sm">
                {meal.calories} kcal
              </span>
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-1 shrink-0 bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-sm">
            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Prominent Macros Section */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <div className="bg-red-50/50 rounded-xl p-2 flex flex-col items-center border border-red-50">
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Protein</span>
            <span className="text-[13px] font-extrabold text-red-600">{Math.round(meal.protein)}<span className="text-[10px] text-red-400 font-bold ml-0.5">g</span></span>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-2 flex flex-col items-center border border-blue-50">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Carbs</span>
            <span className="text-[13px] font-extrabold text-blue-600">{Math.round(meal.carbs)}<span className="text-[10px] text-blue-400 font-bold ml-0.5">g</span></span>
          </div>
          <div className="bg-orange-50/50 rounded-xl p-2 flex flex-col items-center border border-orange-50">
            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">Fat</span>
            <span className="text-[13px] font-extrabold text-orange-600">{Math.round(meal.fat)}<span className="text-[10px] text-orange-400 font-bold ml-0.5">g</span></span>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3 stroke-[2.5px]" /> {format(new Date(meal.loggedAt), 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  )
}
