'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Utensils, BarChart2, Calendar } from 'lucide-react';

export function BottomBar({
  activeMealTarget = 'snack',
  onOpenLogModal,
  onOpenStaples,
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 max-w-md mx-auto h-14 bg-[#f7f5f0]/95 dark:bg-[#151312]/95 backdrop-blur-md border-t border-[#e4dfd7] dark:border-[#282422] px-4 flex items-center justify-between shadow-lg">
      {/* Target Meal indicator & Quick Staples trigger */}
      <button
        onClick={onOpenStaples}
        className="flex items-center gap-2 p-1.5 -ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-left min-h-[44px]"
        title="View Food Staples Catalog"
        aria-label="Target meal and staples"
      >
        <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0e0d0c] border border-[#e4dfd7] dark:border-[#282422] flex items-center justify-center text-[#10b981] shadow-sm">
          <Utensils className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <span className="text-[9px] text-[#78716c] dark:text-[#8e8680] uppercase tracking-wider block font-semibold">
            Target Meal
          </span>
          <span className="text-xs font-bold text-[#1c1917] dark:text-[#ede9e6] capitalize">
            {activeMealTarget}
          </span>
        </div>
      </button>

      {/* Center Navigation Shortcuts */}
      <div className="flex items-center gap-1 bg-white/60 dark:bg-[#0e0d0c]/60 p-1 rounded-xl border border-[#e4dfd7] dark:border-[#282422]">
        <Link
          href="/stats"
          className={`p-2 rounded-lg transition-colors ${
            pathname === '/stats' 
              ? 'bg-[#10b981]/15 text-[#10b981]' 
              : 'text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]'
          }`}
          title="View Weekly / Monthly Stats"
        >
          <BarChart2 className="w-4 h-4" />
        </Link>
        <Link
          href="/summary"
          className={`p-2 rounded-lg transition-colors ${
            pathname === '/summary' 
              ? 'bg-[#10b981]/15 text-[#10b981]' 
              : 'text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]'
          }`}
          title="Daily Summary Breakdown"
        >
          <Calendar className="w-4 h-4" />
        </Link>
      </div>

      {/* Primary Log Action: Clean + Logo Button (Touch target 48px, NO reset button, NO text) */}
      <button
        onClick={() => onOpenLogModal(activeMealTarget)}
        className="w-11 h-11 rounded-xl bg-[#10b981] text-[#0e0d0c] flex items-center justify-center active:bg-[#059669] active:scale-95 transition-all shadow-md"
        aria-label="Add and log food"
        title="Add and log food"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>
    </nav>
  );
}
