'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Login() {
  const [showPin, setShowPin] = useState(false)
  const [pin, setPin] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === '5454') {
      document.cookie = "auth_pin=valid; path=/; max-age=31536000"
      window.location.href = '/'
    } else {
      alert('Invalid PIN')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-center">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
        <Image 
          src="/pear.png" 
          alt="Food Assistant" 
          width={280} 
          height={280} 
          className="mb-8 drop-shadow-xl"
          priority
        />
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
          Your Personal<br />Food AI Assistant
        </h1>
        
        <p className="text-gray-500 mb-12 text-[17px] leading-relaxed px-4">
          I can suggest recipes, track calories and nutrients just from a picture!
        </p>

        {!showPin ? (
          <button 
            onClick={() => setShowPin(true)}
            className="w-full bg-gray-900 text-white rounded-full py-4 text-[17px] font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl active:scale-95"
          >
            <span className="text-xl">✨</span> Your Assistant
          </button>
        ) : (
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <input 
              type="password"
              placeholder="Enter PIN (5454)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-gray-100 bg-gray-50 rounded-full py-4 px-6 text-center text-xl font-bold text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all shadow-inner"
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-gray-900 text-white rounded-full py-4 text-[17px] font-semibold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
              Unlock Dashboard
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
