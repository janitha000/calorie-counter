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
      // Reset tracker to start a new fast from right now (or they can just rely on the next meal)
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
    <div className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 flex flex-col gap-6">
      
      {/* Header & Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${isFastingZone ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
            {isFastingZone ? <Flame className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
          </div>
          <div>
            <h4 className="text-gray-900 font-extrabold text-[18px]">Fasting Tracker</h4>
            {isFastingZone && <p className="text-orange-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">Fat Burn Zone 🔥</p>}
          </div>
        </div>
        
        <div className="text-right flex items-baseline justify-end gap-1">
          <span className="text-4xl font-black text-gray-900 tracking-tight">{elapsed.hours}</span>
          <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mr-1">h</span>
          <span className="text-4xl font-black text-gray-900 tracking-tight">{elapsed.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">m</span>
        </div>
      </div>

      <div className="h-px w-full bg-gray-100"></div>

      {/* Start Time Config */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Start Time</label>
          {!isEditingStart && (
            <button onClick={() => setIsEditingStart(true)} className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1 hover:text-blue-600">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
        
        {isEditingStart ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={formatForInput(startTime)}
              onChange={(e) => {
                if (e.target.value) {
                  const newTime = new Date(e.target.value).toISOString()
                  setStartTime(newTime)
                  localStorage.setItem('customFastingStartTime', newTime)
                }
              }}
              className="flex-1 text-[14px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
            />
            <button onClick={() => setIsEditingStart(false)} className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-800 transition-colors"><Check className="w-4 h-4" /></button>
            <button onClick={() => {
              localStorage.removeItem('customFastingStartTime')
              setStartTime(fallbackStartTime)
              setIsEditingStart(false)
            }} className="bg-gray-100 text-gray-500 p-2.5 rounded-xl hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-[15px] font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {startTime ? format(new Date(startTime), 'EEEE, MMM d — h:mm a') : 'Not started'}
          </div>
        )}
      </div>

      {/* End Time Config (Optional if stopping) */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">End Time</label>
          {!endTime && !isEditingEnd && (
            <button onClick={() => {
              setEndTime(new Date().toISOString())
              setIsEditingEnd(true)
            }} className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1 hover:text-blue-600">
              Set End Time
            </button>
          )}
        </div>
        
        {isEditingEnd ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={formatForInput(endTime)}
              onChange={(e) => {
                if (e.target.value) setEndTime(new Date(e.target.value).toISOString())
              }}
              className="flex-1 text-[14px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400"
            />
            <button onClick={() => setIsEditingEnd(false)} className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-gray-800 transition-colors"><Check className="w-4 h-4" /></button>
            <button onClick={() => {
              setEndTime('')
              setIsEditingEnd(false)
            }} className="bg-gray-100 text-gray-500 p-2.5 rounded-xl hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : endTime ? (
          <div className="flex justify-between items-center text-[15px] font-semibold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {format(new Date(endTime), 'EEEE, MMM d — h:mm a')}
            <button onClick={() => setIsEditingEnd(true)} className="text-gray-400 hover:text-gray-600"><Edit2 className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="text-[14px] font-medium text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
            Ongoing... (Click "Stop Fasting" below)
          </div>
        )}
      </div>

      <button 
        onClick={handleSaveFastingLog}
        disabled={isSaving}
        className="mt-2 w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-md shadow-gray-900/10 disabled:opacity-50"
      >
        <Save className="w-5 h-5" /> 
        {isSaving ? 'Saving...' : (endTime ? 'Save Fasting Log' : 'Stop Fasting & Save')}
      </button>

    </div>
  )
}
