"use client";

import { useState } from "react";
import { Camera, Image as ImageIcon, Send, Loader2, Barcode } from "lucide-react";
import Image from "next/image";

export default function LogPage() {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeText = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, type: "food" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log Meal</h1>
        <p className="text-gray-500 text-sm mt-1">Tell me what you ate or snap a picture.</p>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* NLP Text Input */}
        <div className="bg-white rounded-3xl p-2 flex items-center shadow-soft border border-gray-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 2 eggs and a slice of toast"
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-gray-700 placeholder:text-gray-400"
            onKeyDown={(e) => e.key === "Enter" && analyzeText()}
          />
          <button
            onClick={analyzeText}
            disabled={isAnalyzing || !input.trim()}
            className="w-12 h-12 bg-[#111827] text-white rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-gray-800"
          >
            {isAnalyzing && input ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <label className="bg-primary/10 border border-primary/20 text-primary rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-primary/20 transition-colors">
            <Camera className="w-8 h-8" />
            <span className="font-semibold text-sm">Take Photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
          </label>
          <label className="bg-white border border-gray-100 shadow-soft text-gray-700 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <ImageIcon className="w-8 h-8 text-gray-400" />
            <span className="font-semibold text-sm">Gallery</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Results Area */}
        {isAnalyzing && !input && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-gray-500 font-medium">Analyzing your food...</p>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{result.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Review and edit before saving</p>
              </div>
              <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                🔥 {result.calories} kcal
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                </div>
                <span className="font-bold text-gray-900">{result.carbs}g</span>
                <span className="text-xs text-gray-500">Carbs</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <span className="font-bold text-gray-900">{result.protein}g</span>
                <span className="text-xs text-gray-500">Protein</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <div className="w-3 h-4 bg-yellow-500 rounded-[50%]"></div>
                </div>
                <span className="font-bold text-gray-900">{result.fat}g</span>
                <span className="text-xs text-gray-500">Fat</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors">
                Edit Details
              </button>
              <button className="flex-1 bg-[#111827] text-white py-3.5 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-md">
                Add Food
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
