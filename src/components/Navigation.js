"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, BarChart2, User } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Stats", href: "/stats", icon: BarChart2 },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:relative md:border-t md:border-gray-100 md:shadow-none">
      <div className="max-w-lg mx-auto px-6 h-16 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-green-50 text-green-600 scale-105"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? "opacity-100" : "opacity-70"}`}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
