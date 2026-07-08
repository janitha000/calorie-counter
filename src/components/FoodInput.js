'use client'

import { Search, Camera, Loader2 } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function FoodInput() {
  const fileInputRef = useRef(null)
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [mealType, setMealType] = useState('snack')

  const router = useRouter()

  useEffect(() => {
    // Auto-select meal type based on time
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) setMealType('breakfast')
    else if (hour >= 11 && hour < 15) setMealType('lunch')
    else if (hour >= 15 && hour < 18) setMealType('snack')
    else setMealType('dinner')
  }, [])

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error("Failed to analyze image")
      const aiData = await res.json()

      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiData, type: mealType })
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!textInput.trim()) return
    
    setIsProcessing(true)
    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput, type: 'food' })
      })

      if (!res.ok) throw new Error("Failed to analyze text")
      const aiData = await res.json()

      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiData, type: mealType })
      })

      setTextInput('')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-[1.5rem] p-3 shadow-lg shadow-gray-100/50 border border-gray-100 flex flex-col gap-3 relative z-30">
      
      {/* Meal Type Selector */}
      <div className="flex gap-2">
        {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setMealType(type)}
            className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${
              mealType === type ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl p-2 px-4 border border-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Describe your food..." 
            className="bg-transparent border-none outline-none w-full text-[14px] text-gray-900 placeholder:text-gray-400 font-medium"
            disabled={isProcessing}
          />
        </div>
        
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
        />

        <button 
          type="button"
          onClick={handleCameraClick}
          disabled={isProcessing}
          className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors flex-shrink-0 border border-green-100/50"
        >
          <Camera className="w-[18px] h-[18px] stroke-[2.5px]" />
        </button>

        <button 
          type="submit"
          disabled={isProcessing || !textInput.trim()}
          className="bg-gray-900 text-white px-5 py-0 rounded-xl flex items-center justify-center h-10 font-bold text-[14px] hover:bg-gray-800 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log"}
        </button>
      </form>
    </div>
  )
}
