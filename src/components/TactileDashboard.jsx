'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopHUD } from './TopHUD';
import { MealStream } from './MealStream';
import { BottomBar } from './BottomBar';
import { BottomSheet } from './BottomSheet';
import { GoalModal } from './GoalModal';

export function TactileDashboard({
  initialMeals = [],
  dateParam,
  consumedCalories,
  consumedProtein,
  consumedCarbs,
  consumedFat,
  consumedSugar,
  defaultTdee = 1600,
  latestMealLoggedAt,
}) {
  const router = useRouter();

  // Active state
  const [meals, setMeals] = useState(initialMeals);
  const [activeMealTarget, setActiveMealTarget] = useState('snack');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // Theme state: dark mode default, persisted in localStorage
  const [isDark, setIsDark] = useState(true);

  // Water tracking state (glasses): persisted in localStorage
  const [waterGlasses, setWaterGlasses] = useState(6);

  // Targets / Goals state
  const [goals, setGoals] = useState({
    calories: defaultTdee || 1600,
    protein: 135,
    carbs: 135,
    fat: 58,
    sugar: 25,
    water: 8,
  });

  // PWA install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstallPWA, setCanInstallPWA] = useState(false);

  // Sync meals if server props change
  useEffect(() => {
    setMeals(initialMeals);
  }, [initialMeals]);

  // Initial client effects: theme, water, pwa, target meal by time
  useEffect(() => {
    // 1. Theme initialization
    const savedTheme = localStorage.getItem('tactile_theme');
    if (savedTheme) {
      const dark = savedTheme === 'dark';
      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);
    } else {
      document.documentElement.classList.add('dark');
    }

    // 2. Water count initialization
    const dateKey = dateParam || new Date().toISOString().slice(0, 10);
    const savedWater = localStorage.getItem(`water_${dateKey}`);
    if (savedWater !== null) {
      setWaterGlasses(Number(savedWater));
    }

    // 3. Goals initialization
    const savedGoals = localStorage.getItem('macro_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {}
    }

    // 4. Auto-select meal target by current hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setActiveMealTarget('breakfast');
    else if (hour >= 11 && hour < 16) setActiveMealTarget('lunch');
    else if (hour >= 16 && hour < 21) setActiveMealTarget('dinner');
    else setActiveMealTarget('snack');

    // 5. PWA beforeinstallprompt capture
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 6. Service worker registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [dateParam]);

  // Theme toggle
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('tactile_theme', next ? 'dark' : 'light');
  };

  // Water tracking handlers
  const handleAddWater = () => {
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    const dateKey = dateParam || new Date().toISOString().slice(0, 10);
    localStorage.setItem(`water_${dateKey}`, next.toString());
  };

  const handleRemoveWater = () => {
    const next = Math.max(0, waterGlasses - 1);
    setWaterGlasses(next);
    const dateKey = dateParam || new Date().toISOString().slice(0, 10);
    localStorage.setItem(`water_${dateKey}`, next.toString());
  };

  // Goals update
  const handleSaveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem('macro_goals', JSON.stringify(newGoals));
  };

  // PWA install trigger
  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPWA(false);
    }
    setDeferredPrompt(null);
  };

  // Meal operations
  const handleOpenLogModal = (mealType) => {
    if (mealType) setActiveMealTarget(mealType);
    setIsBottomSheetOpen(true);
  };

  const handleLogMealSuccess = (newMeal) => {
    setMeals(prev => [newMeal, ...prev]);
    router.refresh();
  };

  const handleUpdateMeal = (updatedMeal) => {
    setMeals(prev => prev.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    router.refresh();
  };

  const handleDeleteMeal = async (mealId) => {
    // Optimistic remove
    setMeals(prev => prev.filter(m => m.id !== mealId));
    try {
      await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Recompute current live values based on meals state
  const liveCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const liveProtein = meals.reduce((acc, m) => acc + (m.protein || 0), 0);
  const liveCarbs = meals.reduce((acc, m) => acc + (m.carbs || 0), 0);
  const liveFat = meals.reduce((acc, m) => acc + (m.fat || 0), 0);
  const liveSugar = meals.reduce((acc, m) => acc + (m.sugar || 0), 0);

  // Chronological meals to determine fast broken (>0g sugar)
  const sortedChronologicalMeals = [...meals].sort(
    (a, b) => new Date(a.loggedAt) - new Date(b.loggedAt)
  );
  const fastBrokenMeal = sortedChronologicalMeals.find(
    (m) => Number(m.sugar || 0) > 0
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-[#0e0d0c] text-[#1c1917] dark:text-[#ede9e6] flex flex-col transition-colors pb-20">
      {/* 1. Sticky Top HUD */}
      <TopHUD
        dateParam={dateParam}
        consumedCalories={liveCalories}
        calorieLimit={goals.calories}
        protein={liveProtein}
        proteinGoal={goals.protein}
        carbs={liveCarbs}
        carbsGoal={goals.carbs}
        fat={liveFat}
        fatGoal={goals.fat}
        sugar={liveSugar}
        sugarLimit={goals.sugar}
        fastingStartTime={latestMealLoggedAt}
        fastBrokenMeal={fastBrokenMeal}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        canInstallPWA={canInstallPWA}
        onInstallPWA={handleInstallPWA}
        onOpenGoals={() => setIsGoalModalOpen(true)}
        onSelectDate={(dateStr) => router.push(dateStr ? `/?date=${dateStr}` : '/')}
      />

      {/* 2. Middle Meal Stream (4 Accordion Bays) */}
      <main className="flex-1 max-w-md mx-auto w-full">
        <MealStream
          meals={meals}
          waterGlasses={waterGlasses}
          waterGoal={goals.water}
          onAddWater={handleAddWater}
          onRemoveWater={handleRemoveWater}
          onOpenLogModal={handleOpenLogModal}
          onDeleteMeal={handleDeleteMeal}
          onUpdateMeal={handleUpdateMeal}
        />
      </main>

      {/* 3. Pinned Thumb-Zone Bottom Action Bar */}
      <BottomBar
        activeMealTarget={activeMealTarget}
        onOpenLogModal={handleOpenLogModal}
        onOpenStaples={() => {
          setIsBottomSheetOpen(true);
        }}
      />

      {/* 4. Sliding Bottom Sheet Modal (AI Natural Language + Voice/Photo + Staples Catalog + Custom) */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        targetMeal={activeMealTarget}
        onChangeTargetMeal={setActiveMealTarget}
        onLogMealSuccess={handleLogMealSuccess}
      />

      {/* 5. Targets / Goals Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goals={goals}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  );
}
