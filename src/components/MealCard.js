'use client'

import { useState } from 'react'
import { Clock, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export function MealCard({ meal }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [editData, setEditData] = useState({
    name: meal.name,
    servings: meal.servings,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
  })

  // Default daily goals for percentages
  const GOALS = {
    calories: 2000,
    carbs: 250,
    protein: 150,
    fat: 65
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
      
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      alert("Failed to update meal")
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
    <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4">
      {/* Top Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100 shadow-sm">
          <span className="text-2xl">{emoji}</span>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="font-medium text-[16px] text-gray-900 truncate">{meal.name}</h4>
          <p className="text-[13px] text-gray-500 mt-0.5 truncate font-medium">
            {meal.servings} {meal.servings === 1 ? 'serving' : 'servings'}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100 my-1"></div>

      {/* Macros Section */}
      <div className="grid grid-cols-4 gap-4 px-1">
        <MacroColumn label="Calories" value={meal.calories} unit="" goal={GOALS.calories} />
        <MacroColumn label="Carbs" value={Math.round(meal.carbs)} unit="g" goal={GOALS.carbs} />
        <MacroColumn label="Protein" value={Math.round(meal.protein)} unit="g" goal={GOALS.protein} />
        <MacroColumn label="Fat" value={Math.round(meal.fat)} unit="g" goal={GOALS.fat} />
      </div>

      <div className="h-px w-full bg-gray-100 my-1"></div>

      {/* Footer Section */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-gray-400 font-medium tracking-wide">
          {format(new Date(meal.loggedAt), 'HH:mm')}
        </span>
        
        <div className="flex gap-2">
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
