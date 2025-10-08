import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeState, setThemeState] = useState(() => {
    // Initialize from localStorage or default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', themeState);
  }, [themeState]);

  return (
    <ThemeContext.Provider
      value={{ theme: themeState, setTheme: setThemeState }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
