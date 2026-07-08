'use client'

import { useState, useEffect } from 'react'
import { Clock, Flame } from 'lucide-react'

export function FastingWidget({ lastMealTime }) {
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0 })

  useEffect(() => {
    if (!lastMealTime) return

    const calculateElapsed = () => {
      const now = new Date()
      const last = new Date(lastMealTime)
      const diffMs = Math.max(0, now - last)
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      setElapsed({ hours: diffHours, minutes: diffMins })
    }

    calculateElapsed()
    const interval = setInterval(calculateElapsed, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [lastMealTime])

  if (!lastMealTime) return null

  // If they have been fasting for more than 12 hours, show a fire icon!
  const isFastingZone = elapsed.hours >= 12

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isFastingZone ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
          {isFastingZone ? <Flame className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-gray-900 font-bold text-[16px]">Fasting Tracker</h4>
          <p className="text-gray-500 text-[13px] font-medium mt-0.5">Time since last meal</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-baseline justify-end gap-0.5">
          <span className="text-2xl font-extrabold text-gray-900">{elapsed.hours}</span>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mr-1">h</span>
          <span className="text-2xl font-extrabold text-gray-900">{elapsed.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">m</span>
        </div>
        {isFastingZone && (
          <p className="text-orange-500 text-[11px] font-bold uppercase tracking-wider mt-1">Fat Burn Zone 🔥</p>
        )}
      </div>
    </div>
  )
}
