'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mic, 
  MicOff, 
  Camera, 
  Loader2, 
  Plus, 
  Check, 
  Search,
  BookOpen,
  Edit3
} from 'lucide-react';
import { STAPLE_FOODS } from '@/data/staples';

export function BottomSheet({
  isOpen,
  onClose,
  targetMeal = 'snack',
  onChangeTargetMeal,
  onLogMealSuccess,
}) {
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'staples' | 'custom'
  const [inputMealType, setInputMealType] = useState(targetMeal);

  // AI Tab states
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const fileInputRef = useRef(null);

  // Custom Form state
  const [customForm, setCustomForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
  });

  // Staples filter
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    setInputMealType(targetMeal);
  }, [targetMeal]);

  if (!isOpen) return null;

  // Handle Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in this browser. Please type your meal.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  // Handle Camera File
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Image analysis failed");
      const data = await res.json();
      setParsedResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image. Please try text description instead.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Text AI Analysis
  const handleAnalyzeText = async (e) => {
    e?.preventDefault();
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      if (!res.ok) throw new Error("Text analysis failed");
      const data = await res.json();
      setParsedResult(data);
    } catch (err) {
      console.error(err);
      alert("Could not analyze meal description. Please check your network or enter manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit parsed or custom meal to PostgreSQL
  const handleSaveMeal = async (mealPayload) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mealPayload,
          type: inputMealType,
        }),
      });

      if (!res.ok) throw new Error("Failed to save meal");
      const saved = await res.json();
      onLogMealSuccess(saved.meal);
      onClose();
      // Reset state
      setParsedResult(null);
      setTextInput('');
    } catch (err) {
      console.error(err);
      alert("Failed to save meal to database.");
    }
  };

  // Quick log a staple item
  const handleLogStaple = (food) => {
    handleSaveMeal({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      sugar: food.sugar,
      servings: 1,
    });
  };

  const filteredStaples = STAPLE_FOODS.filter(f => 
    f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#f7f5f0] dark:bg-[#151312] border-t border-[#e4dfd7] dark:border-[#282422] rounded-t-3xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-[#d6d0c4] dark:bg-[#383330] rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header: Title, Target Meal Selector, Close Button */}
        <div className="px-4 py-2 border-b border-[#e4dfd7] dark:border-[#282422] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#78716c] dark:text-[#8e8680] uppercase tracking-wider">
              Log to:
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] rounded-lg p-0.5">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setInputMealType(m);
                    onChangeTargetMeal?.(m);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-colors ${
                    inputMealType === m
                      ? 'bg-[#10b981] text-[#0e0d0c]'
                      : 'text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6] active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-4 pt-2.5 pb-1 flex border-b border-[#e4dfd7] dark:border-[#282422] gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-[#282422] text-[#10b981] shadow-xs'
                : 'text-[#78716c] dark:text-[#8e8680]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Smart Log
          </button>
          <button
            onClick={() => setActiveTab('staples')}
            className={`flex-1 py-1.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'staples'
                ? 'bg-white dark:bg-[#282422] text-[#10b981] shadow-xs'
                : 'text-[#78716c] dark:text-[#8e8680]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Staples Catalog
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-[#282422] text-[#10b981] shadow-xs'
                : 'text-[#78716c] dark:text-[#8e8680]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Custom
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: AI SMART LOG */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <form onSubmit={handleAnalyzeText} className="space-y-2">
                <div className="relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Describe your meal (e.g. 2 fried eggs, 2 slices sourdough toast, half avocado, black coffee)..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-xs text-[#1c1917] dark:text-[#ede9e6] placeholder-[#a8a29e] focus:outline-none focus:border-[#10b981] transition-colors resize-none"
                  />
                  {/* Quick Voice & Camera Action Buttons inside input */}
                  <div className="absolute right-2 bottom-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isRecording 
                          ? 'bg-red-500 text-white border-red-500 animate-pulse' 
                          : 'bg-[#f7f5f0] dark:bg-[#151312] border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680]'
                      }`}
                      title={isRecording ? "Stop listening" : "Voice dictation"}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-[#f7f5f0] dark:bg-[#151312] border border-[#e4dfd7] dark:border-[#282422] text-[#78716c] dark:text-[#8e8680] hover:text-[#10b981] transition-colors"
                      title="Scan meal photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing || !textInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[#0e0d0c] font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all min-h-[44px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing nutrition...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Decompose & Estimate Macros
                    </>
                  )}
                </button>
              </form>

              {/* Parsed Result Preview */}
              {parsedResult && (
                <div className="p-3.5 bg-white dark:bg-[#0e0d0c] border border-[#10b981]/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1c1917] dark:text-[#ede9e6]">
                      {parsedResult.name || "Identified Meal"}
                    </span>
                    <span className="font-mono font-bold text-sm text-[#10b981]">
                      {parsedResult.calories} kcal
                    </span>
                  </div>

                  {parsedResult.insight && (
                    <p className="text-[11px] text-[#78716c] dark:text-[#8e8680] italic">
                      "{parsedResult.insight}"
                    </p>
                  )}

                  {/* Macros breakdown grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#f0ebe3] dark:border-[#282422] text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981]">
                      <span className="text-[9px] uppercase block font-sans font-bold">Protein</span>
                      <span className="text-xs font-bold">{Math.round(parsedResult.protein || 0)}g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#ea580c]/10 text-[#ea580c]">
                      <span className="text-[9px] uppercase block font-sans font-bold">Carbs</span>
                      <span className="text-xs font-bold">{Math.round(parsedResult.carbs || 0)}g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#eab308]/10 text-[#eab308]">
                      <span className="text-[9px] uppercase block font-sans font-bold">Fat</span>
                      <span className="text-xs font-bold">{Math.round(parsedResult.fat || 0)}g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#fb7185]/10 text-[#fb7185]">
                      <span className="text-[9px] uppercase block font-sans font-bold">Sugar</span>
                      <span className="text-xs font-bold">{Math.round(parsedResult.sugar || 0)}g</span>
                    </div>
                  </div>

                  {/* Distinct Items breakdown if available */}
                  {Array.isArray(parsedResult.items) && parsedResult.items.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#f0ebe3] dark:border-[#282422]">
                      <span className="text-[10px] font-bold text-[#78716c] dark:text-[#8e8680] uppercase tracking-wider block">
                        Decomposed Foods
                      </span>
                      {parsedResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-[#1c1917] dark:text-[#ede9e6]">
                          <span>{item.name}</span>
                          <span className="font-mono text-[#78716c] dark:text-[#8e8680]">
                            {item.calories} kcal ({item.protein}P • {item.sugar || 0}g sugar)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveMeal(parsedResult)}
                    className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0e0d0c] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[44px]"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Confirm & Log to {inputMealType}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAPLES CATALOG */}
          {activeTab === 'staples' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#78716c] dark:text-[#8e8680]" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search staples (guava, tea, rice, chocolate, banana)..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-xs text-[#1c1917] dark:text-[#ede9e6] placeholder-[#a8a29e] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredStaples.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleLogStaple(food)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] hover:border-[#10b981] flex items-center justify-between text-left group transition-all min-h-[48px]"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] block">
                        {food.name}
                      </span>
                      <span className="text-[10px] text-[#78716c] dark:text-[#8e8680] font-mono">
                        {food.servingUnit ? `${food.servingUnit} • ` : ''}
                        <span className="text-[#10b981] font-semibold">P:{food.protein}g</span> •{' '}
                        <span className="text-[#ea580c] font-semibold">C:{food.carbs}g</span> •{' '}
                        <span className="text-[#eab308] font-semibold">F:{food.fat}g</span> •{' '}
                        <span className="text-[#fb7185] font-semibold">Sugar:{food.sugar}g</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#1c1917] dark:text-[#ede9e6]">
                        {food.calories} kcal
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#10b981]/10 text-[#10b981] group-hover:bg-[#10b981] group-hover:text-[#0e0d0c] flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM ENTRY */}
          {activeTab === 'custom' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customForm.name || !customForm.calories) return;
                handleSaveMeal({
                  name: customForm.name,
                  calories: Number(customForm.calories),
                  protein: Number(customForm.protein) || 0,
                  carbs: Number(customForm.carbs) || 0,
                  fat: Number(customForm.fat) || 0,
                  sugar: Number(customForm.sugar) || 0,
                  servings: 1,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-[#78716c] dark:text-[#8e8680] mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avocado Toast"
                  value={customForm.name}
                  onChange={(e) => setCustomForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#78716c] dark:text-[#8e8680] mb-1">
                    Calories (kcal) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={customForm.calories}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, calories: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#10b981] mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, protein: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#ea580c] mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, carbs: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#eab308] mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    placeholder="8"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, fat: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#fb7185] mb-1">
                    Sugar (g)
                  </label>
                  <input
                    type="number"
                    placeholder="4"
                    value={customForm.sugar}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, sugar: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] text-[#1c1917] dark:text-[#ede9e6] focus:outline-none focus:border-[#10b981] font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#0e0d0c] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all min-h-[44px] mt-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Log Custom Food to {inputMealType}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
