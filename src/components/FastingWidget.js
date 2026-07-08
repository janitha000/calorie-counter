'use client'

import { useState, useEffect } from 'react'
import { Clock, Flame, Edit2, Check, X } from 'lucide-react'
import { format } from 'date-fns'

export function FastingWidget({ defaultLastMealTime }) {
  const [startTime, setStartTime] = useState(defaultLastMealTime)
  const [isEditing, setIsEditing] = useState(false)
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0 })

  useEffect(() => {
    const savedTime = localStorage.getItem('customFastingStartTime')
    
    // If a custom time is saved and it's newer than the default (or if we always want to respect it until cleared)
    // Actually, if they log a new meal, the defaultLastMealTime becomes newer. 
    // Let's clear the custom time if a newly logged meal is newer than the custom time.
    if (savedTime) {
      if (defaultLastMealTime && new Date(defaultLastMealTime) > new Date(savedTime)) {
        localStorage.removeItem('customFastingStartTime')
        setStartTime(defaultLastMealTime)
      } else {
        setStartTime(savedTime)
      }
    } else {
      setStartTime(defaultLastMealTime)
    }
  }, [defaultLastMealTime])

  useEffect(() => {
    if (!startTime) return

    const calculateElapsed = () => {
      const now = new Date()
      const last = new Date(startTime)
      const diffMs = Math.max(0, now - last)
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      setElapsed({ hours: diffHours, minutes: diffMins })
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [startTime])

  const handleSave = () => {
    localStorage.setItem('customFastingStartTime', startTime)
    setIsEditing(false)
  }

  const handleClearCustom = () => {
    localStorage.removeItem('customFastingStartTime')
    setStartTime(defaultLastMealTime)
    setIsEditing(false)
  }

  // Format date for datetime-local input
  const formatForInput = (isoString) => {
    if (!isoString) return ''
    try {
      return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm")
    } catch {
      return ''
    }
  }

  if (!startTime && !isEditing) return null

  const isFastingZone = elapsed.hours >= 12

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isFastingZone ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
            {isFastingZone ? <Flame className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-[16px]">Fasting Tracker</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-gray-500 text-[12px] font-medium">Started: {startTime ? format(new Date(startTime), 'MMM d, h:mm a') : 'Not started'}</p>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="p-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {!isEditing && (
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{elapsed.hours}</span>
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mr-1">h</span>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{elapsed.minutes.toString().padStart(2, '0')}</span>
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">m</span>
            </div>
            {isFastingZone && (
              <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider mt-1">Fat Burn Zone 🔥</p>
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 pt-3 border-t border-gray-100 flex items-center gap-2">
          <input
            type="datetime-local"
            value={formatForInput(startTime)}
            onChange={(e) => {
              if (e.target.value) {
                setStartTime(new Date(e.target.value).toISOString())
              }
            }}
            className="flex-1 text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
          />
          <button onClick={handleSave} className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={handleClearCustom} className="bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200 transition-colors" title="Reset to last logged meal">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
