'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BarChart2 } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  // On the home dashboard, the tactile BottomBar is used instead
  if (pathname === '/') {
    return null;
  }

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Summary', href: '/summary', icon: Calendar },
    { name: 'Stats', href: '/stats', icon: BarChart2 },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 max-w-md mx-auto h-14 bg-[#f7f5f0]/95 dark:bg-[#151312]/95 backdrop-blur-md border-t border-[#e4dfd7] dark:border-[#282422] px-6 flex items-center justify-between shadow-lg">
      <div className="w-full flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 min-h-[44px] ${
                isActive
                  ? 'text-[#10b981] font-bold bg-[#10b981]/10'
                  : 'text-[#78716c] dark:text-[#8e8680] hover:text-[#1c1917] dark:hover:text-[#ede9e6]'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
