"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, Flame, Droplets, Target } from "lucide-react";

const macroData = [
  { name: "Mon", calories: 2100 },
  { name: "Tue", calories: 1950 },
  { name: "Wed", calories: 2400 },
  { name: "Thu", calories: 2000 },
  { name: "Fri", calories: 2200 },
  { name: "Sat", calories: 2800 },
  { name: "Sun", calories: 2100 },
];

const fastingData = [
  { name: "Mon", hours: 14 },
  { name: "Tue", hours: 16 },
  { name: "Wed", hours: 15.5 },
  { name: "Thu", hours: 16 },
  { name: "Fri", hours: 12 },
  { name: "Sat", hours: 10 },
  { name: "Sun", hours: 16 },
];

export default function StatsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 text-sm mt-1">Weekly overview and fasting tracking.</p>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* Weekly Calories Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Calorie Intake</h2>
              <p className="text-xs text-gray-500 mt-1">Past 7 days</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={macroData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                <Tooltip 
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="calories" fill="#22c55e" radius={[6, 6, 6, 6]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fasting Tracker Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900">Intermittent Fasting</h2>
              <p className="text-xs text-gray-500 mt-1">Hours fasted (Goal: 16h)</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fastingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                <YAxis domain={[0, 24]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 20px -2px rgba(0,0,0,0.1)" }}
                />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 flex flex-col justify-between h-32">
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center mb-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">6<span className="text-sm text-gray-500 font-medium"> / 8</span></p>
              <p className="text-xs text-gray-500 mt-1">Water Glasses</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-gray-100 flex flex-col justify-between h-32">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5<span className="text-sm text-gray-500 font-medium"> days</span></p>
              <p className="text-xs text-gray-500 mt-1">Current Streak</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
