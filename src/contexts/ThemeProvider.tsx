import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext, ThemeMode } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Initialize from localStorage or default to 'system'
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Function to get system preference
  const getSystemPreference = (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Function to determine if dark mode should be active
  const shouldBeDark = useCallback((currentTheme: ThemeMode): boolean => {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    return getSystemPreference(); // system
  }, []);

  // Update dark mode state and apply to document
  useEffect(() => {
    const dark = shouldBeDark(theme);
    setIsDark(dark);

    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, shouldBeDark]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const dark = shouldBeDark(theme);
      setIsDark(dark);

      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, shouldBeDark]);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
