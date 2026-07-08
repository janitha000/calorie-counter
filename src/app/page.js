import Image from "next/image";
import Link from "next/link";
import { Bell, Sparkles, Search, ChevronRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-sm border border-white">
            <Image 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Floyd" 
              alt="User" 
              width={48} 
              height={48} 
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Hello</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Floyd Miles</h1>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {/* Search & Assistant */}
        <div className="bg-white rounded-full p-2 flex items-center shadow-soft border border-gray-100">
          <div className="pl-4 flex-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Describe Your Food" 
              className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <Link href="/log" className="bg-[#111827] text-white px-5 py-3 rounded-full flex items-center gap-2 font-medium text-sm hover:bg-gray-800 transition-colors">
            Assistant <Sparkles className="w-4 h-4" />
          </Link>
        </div>

        {/* Pro Banner */}
        <div className="bg-[#1c211f] rounded-3xl p-6 relative overflow-hidden text-white shadow-lg">
          <div className="relative z-10 w-2/3">
            <h2 className="text-xl font-bold mb-2">Get Pro Access</h2>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Get 1 month free and unlock all pro features
            </p>
            <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            4.9 out of 5 <span className="text-sm">🔥</span>
          </div>
          {/* We'd place a pear image here natively, skipping for now to keep it clean */}
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Categories</h3>
            <button className="text-xs text-gray-500 font-medium hover:text-gray-900">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {["Vegan", "Carb", "Protein", "Snacks", "Drink"].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                <div className="w-16 h-16 rounded-full bg-white shadow-soft border border-gray-50 flex items-center justify-center p-3">
                  {/* Placeholder for category icons */}
                  <div className="w-full h-full bg-gray-100 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-600">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Meals (Food Cards) */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Meals</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {/* Card 1 */}
            <div className="min-w-[200px] bg-white rounded-3xl p-3 shadow-soft border border-gray-100 flex flex-col">
              <div className="px-2 pt-2">
                <h4 className="font-bold text-gray-900">Chicken Salad</h4>
                <p className="text-xs text-gray-500 mt-1 mb-3">480 kcal</p>
              </div>
              <div className="w-full h-32 bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                {/* Image Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
              </div>
              <button className="bg-[#111827] text-white w-full py-3 rounded-2xl flex justify-center items-center gap-2 text-sm font-medium mt-auto">
                <span className="opacity-70">🍲</span> Tell me Recipe
              </button>
            </div>
            
            {/* Card 2 */}
            <div className="min-w-[200px] bg-white rounded-3xl p-3 shadow-soft border border-gray-100 flex flex-col">
              <div className="px-2 pt-2">
                <h4 className="font-bold text-gray-900">Herb Omelette</h4>
                <p className="text-xs text-gray-500 mt-1 mb-3">300 kcal</p>
              </div>
              <div className="w-full h-32 bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                {/* Image Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
              </div>
              <button className="bg-[#111827] text-white w-full py-3 rounded-2xl flex justify-center items-center gap-2 text-sm font-medium mt-auto">
                <span className="opacity-70">🍳</span> Tell me Recipe
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
