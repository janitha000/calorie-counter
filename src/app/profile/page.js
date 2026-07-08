"use client";

import { User, Settings, LogOut, ChevronRight, Calculator, Trophy } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
            <Image 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Floyd" 
              alt="User" 
              width={64} 
              height={64} 
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Floyd Miles</h2>
            <p className="text-sm text-gray-500">floyd@example.com</p>
          </div>
        </div>

        {/* TDEE & Goals */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Daily Goals</h3>
              <p className="text-xs text-gray-500">TDEE: 2,400 kcal</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Calorie Target</span>
                <span className="font-bold text-gray-900">2,000 kcal</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-2xl text-center">
                <span className="block text-xs text-gray-500">Protein</span>
                <span className="block font-bold text-gray-900 mt-1">150g</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center">
                <span className="block text-xs text-gray-500">Carbs</span>
                <span className="block font-bold text-gray-900 mt-1">200g</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-center">
                <span className="block text-xs text-gray-500">Fat</span>
                <span className="block font-bold text-gray-900 mt-1">65g</span>
              </div>
            </div>
            <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors">
              Recalculate TDEE
            </button>
          </div>
        </div>

        {/* Settings Links */}
        <div className="bg-white rounded-3xl p-2 shadow-soft border border-gray-100">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-medium text-gray-900">Achievements</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <button className="w-full bg-red-50 text-red-600 py-4 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors shadow-sm">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </main>
    </div>
  );
}
