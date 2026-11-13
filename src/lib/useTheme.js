'use client';

import { useState, useEffect } from 'react';

export function useTactileTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('tactile_theme');
    const dark = savedTheme ? savedTheme === 'dark' : true;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('tactile_theme', next ? 'dark' : 'light');
  };

  return { isDark, toggleTheme };
}
