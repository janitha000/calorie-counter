'use client'

import { Search, Camera, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export function FoodInput() {
  const fileInputRef = useRef(null)
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const router = useRouter()

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
        body: JSON.stringify(aiData)
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
        body: JSON.stringify(aiData)
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
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-2 flex items-center shadow-lg shadow-gray-100 border border-gray-100 relative">
      <div className="pl-4 flex-1 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Describe your food..." 
          className="bg-transparent border-none outline-none w-full text-[15px] text-gray-900 placeholder:text-gray-400 font-medium"
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
        className="w-11 h-11 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors mr-2 flex-shrink-0"
      >
        <Camera className="w-[22px] h-[22px] stroke-[2.5px]" />
      </button>

      <button 
        type="submit"
        disabled={isProcessing || !textInput.trim()}
        className="bg-gray-900 text-white px-6 py-0 rounded-full flex items-center justify-center h-11 font-semibold text-[15px] hover:bg-gray-800 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log"}
      </button>
    </form>
  )
}
