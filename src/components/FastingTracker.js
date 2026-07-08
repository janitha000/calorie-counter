'use client'

import { useState, useEffect } from 'react'
import { Clock, Flame, Edit2, Check, X, Save } from 'lucide-react'
import { format } from 'date-fns'

export function FastingTracker({ fallbackStartTime }) {
  const [startTime, setStartTime] = useState(fallbackStartTime)
  const [endTime, setEndTime] = useState('')
  const [isEditingStart, setIsEditingStart] = useState(false)
  const [isEditingEnd, setIsEditingEnd] = useState(false)
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0 })
  const [isSaving, setIsSaving] = useState(false)

  // Initialize start time from local storage if exists
  useEffect(() => {
    const savedTime = localStorage.getItem('customFastingStartTime')
    if (savedTime) {
      if (fallbackStartTime && new Date(fallbackStartTime) > new Date(savedTime)) {
        localStorage.removeItem('customFastingStartTime')
        setStartTime(fallbackStartTime)
      } else {
        setStartTime(savedTime)
      }
    } else {
      setStartTime(fallbackStartTime)
    }
  }, [fallbackStartTime])

  // Timer logic
  useEffect(() => {
    if (!startTime) return

    const calculateElapsed = () => {
      const now = endTime ? new Date(endTime) : new Date()
      const last = new Date(startTime)
      const diffMs = Math.max(0, now - last)
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      setElapsed({ hours: diffHours, minutes: diffMins })
    }

    calculateElapsed()
    
    if (!endTime) {
      const interval = setInterval(calculateElapsed, 60000)
      return () => clearInterval(interval)
    }
  }, [startTime, endTime])

  const formatForInput = (isoString) => {
    if (!isoString) return ''
    try { return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm") } catch { return '' }
  }

  const handleSaveFastingLog = async () => {
    if (!startTime) return
    const finalEndTime = endTime || new Date().toISOString()
    
    setIsSaving(true)
    try {
      const durationMins = (new Date(finalEndTime) - new Date(startTime)) / 60000

      const res = await fetch('/api/fasting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(finalEndTime).toISOString(),
          duration: Math.floor(durationMins)
        })
      })

      if (!res.ok) throw new Error('Failed to save fast')
      
      alert('Fasting successfully logged!')
      setStartTime(finalEndTime)
      setEndTime('')
      localStorage.removeItem('customFastingStartTime')
    } catch (err) {
      console.error(err)
      alert("Failed to save fasting log.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!startTime && !isEditingStart) return null
  const isFastingZone = elapsed.hours >= 12

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative z-30">
      
      {/* Top Row: Icon + Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isFastingZone ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
            {isFastingZone ? <Flame className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-[14px] leading-tight">Fasting</h4>
            {isFastingZone && <p className="text-orange-500 text-[9px] font-bold uppercase tracking-wider">Fat Burn 🔥</p>}
          </div>
        </div>
        
        <div className="text-right flex items-baseline justify-end gap-0.5">
          <span className="text-2xl font-black text-gray-900 tracking-tight">{elapsed.hours}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">h</span>
          <span className="text-2xl font-black text-gray-900 tracking-tight">{elapsed.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">m</span>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100 my-0.5"></div>

      {/* Middle Row: Start & End Time Edit */}
      <div className="flex gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span>Start</span>
            {!isEditingStart && <button onClick={() => setIsEditingStart(true)} className="text-blue-500 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>}
          </div>
          {isEditingStart ? (
            <div className="flex items-center gap-1">
              <input type="datetime-local" value={formatForInput(startTime)} onChange={(e) => { if (e.target.value) { const newTime = new Date(e.target.value).toISOString(); setStartTime(newTime); localStorage.setItem('customFastingStartTime', newTime); } }} className="w-full text-[10px] p-1 bg-white border border-gray-200 rounded" />
              <button onClick={() => setIsEditingStart(false)} className="text-green-600"><Check className="w-3 h-3" /></button>
              <button onClick={() => { localStorage.removeItem('customFastingStartTime'); setStartTime(fallbackStartTime); setIsEditingStart(false); }} className="text-red-500"><X className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-gray-800 normal-case">{startTime ? format(new Date(startTime), 'h:mm a') : 'N/A'}</div>
          )}
        </div>

        <div className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-1">
            <span>End</span>
            {!endTime && !isEditingEnd && <button onClick={() => { setEndTime(new Date().toISOString()); setIsEditingEnd(true); }} className="text-blue-500 hover:text-blue-600">Set</button>}
          </div>
          {isEditingEnd ? (
            <div className="flex items-center gap-1">
              <input type="datetime-local" value={formatForInput(endTime)} onChange={(e) => { if (e.target.value) setEndTime(new Date(e.target.value).toISOString()); }} className="w-full text-[10px] p-1 bg-white border border-gray-200 rounded" />
              <button onClick={() => setIsEditingEnd(false)} className="text-green-600"><Check className="w-3 h-3" /></button>
              <button onClick={() => { setEndTime(''); setIsEditingEnd(false); }} className="text-red-500"><X className="w-3 h-3" /></button>
            </div>
          ) : endTime ? (
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-800 normal-case">{format(new Date(endTime), 'h:mm a')}</span>
              <button onClick={() => setIsEditingEnd(true)} className="text-gray-400 hover:text-gray-600"><Edit2 className="w-3 h-3" /></button>
            </div>
          ) : (
            <div className="text-[10px] text-gray-400 normal-case italic mt-0.5">Ongoing...</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Save */}
      <button 
        onClick={handleSaveFastingLog}
        disabled={isSaving}
        className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 text-[12px]"
      >
        <Save className="w-3.5 h-3.5" /> 
        {isSaving ? 'Saving...' : (endTime ? 'Save Fasting Log' : 'Stop & Save Fasting')}
      </button>

    </div>
  )
}
