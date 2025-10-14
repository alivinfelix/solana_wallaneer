import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if localStorage is available (for SSR compatibility)
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
  
  // Get initial theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (isLocalStorageAvailable) {
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      return savedTheme || 'dark'; // Default to dark theme
    }
    return 'dark'; // Default to dark theme
  });

  // Update the HTML class and localStorage when theme changes
  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem('theme', theme);
    }
    
    // Update the HTML class for global styling
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isLocalStorageAvailable]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
