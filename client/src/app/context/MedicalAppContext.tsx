import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';
type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface MedicalAppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isRTL: boolean;
}

const MedicalAppContext = createContext<MedicalAppContextType | undefined>(undefined);

export function MedicalAppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // Apply RTL direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <MedicalAppContext.Provider value={{ language, setLanguage, theme, setTheme, userRole, setUserRole, isRTL }}>
      {children}
    </MedicalAppContext.Provider>
  );
}

export function useMedicalApp() {
  const context = useContext(MedicalAppContext);
  if (!context) {
    throw new Error('useMedicalApp must be used within MedicalAppProvider');
  }
  return context;
}
