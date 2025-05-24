import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import '../styles/darkMode.css';
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for user's preference or system preference on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark-mode');
    } else {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark-mode');
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle-btn bg-gray-100 dark:bg-gray-800 rounded-full p-2 flex items-center justify-center relative overflow-hidden border-0"
      style={{
        width: '44px',
        height: '44px',
        transition: 'all 0.3s ease'
      }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div 
        className="toggle-icons-container relative"
        style={{
          width: '24px',
          height: '24px'
        }}
      >
        <Sun 
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: isDarkMode ? 0 : 1,
            transform: isDarkMode ? 'rotate(-45deg) scale(0.5)' : 'rotate(0) scale(1)',
            color: '#f59e0b'
          }}
          size={24}
        />
        <Moon
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode ? 'rotate(0) scale(1)' : 'rotate(45deg) scale(0.5)',
            color: '#60a5fa'
          }}
          size={24}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;