"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, Translations, getTranslation } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [t, setT] = useState<Translations>(getTranslation("en"));

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("preferred-language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "es")) {
      setLanguageState(savedLang);
      setT(getTranslation(savedLang));
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setT(getTranslation(lang));
    localStorage.setItem("preferred-language", lang);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "es" : "en";
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

