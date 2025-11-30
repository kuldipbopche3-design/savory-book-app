import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { translations, Language } from '../services/translations';
import { StorageService } from '../services/storageService';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for persistent auth
    const storedUser = localStorage.getItem('savory_current_user');
    if (storedUser) setUserState(JSON.parse(storedUser));
    
    // Theme init
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       // setIsDarkMode(true); // Default to light for warm theme preference
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('savory_current_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('savory_current_user');
    }
  };

  const logout = () => {
    localStorage.removeItem('savory_current_user');
    setUserState(null);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const t = translations[language];

  return (
    <AppContext.Provider value={{ user, setUser, logout, language, setLanguage, t, isDarkMode, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};