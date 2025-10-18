/**
 * Locale Context for managing user locale preferences
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserLocale, LocaleConfig } from '../utils/locale';

interface LocaleContextType {
  locale: LocaleConfig;
  setLocale: (locale: Partial<LocaleConfig>) => void;
  updateLanguage: (language: string) => void;
  updateRegion: (region: string) => void;
  updateTimeZone: (timeZone: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleConfig>(() => {
    // Try to load saved locale preferences from localStorage
    const savedLocale = localStorage.getItem('userLocale');
    if (savedLocale) {
      try {
        return JSON.parse(savedLocale);
      } catch {
        // Fallback to browser locale if invalid
        return getUserLocale();
      }
    }
    return getUserLocale();
  });

  // Save locale changes to localStorage
  useEffect(() => {
    localStorage.setItem('userLocale', JSON.stringify(locale));
  }, [locale]);

  const setLocale = (newLocale: Partial<LocaleConfig>) => {
    setLocaleState(prev => ({ ...prev, ...newLocale }));
  };

  const updateLanguage = (language: string) => {
    setLocaleState(prev => ({ ...prev, language }));
  };

  const updateRegion = (region: string) => {
    setLocaleState(prev => ({ ...prev, region }));
  };

  const updateTimeZone = (timeZone: string) => {
    setLocaleState(prev => ({ ...prev, timeZone }));
  };

  const value: LocaleContextType = {
    locale,
    setLocale,
    updateLanguage,
    updateRegion,
    updateTimeZone
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Hook to get formatted locale string for Intl APIs
export const useLocaleString = (): string => {
  const { locale } = useLocale();
  return `${locale.language}-${locale.region}`;
};