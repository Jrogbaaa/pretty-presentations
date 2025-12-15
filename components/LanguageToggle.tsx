"use client";

import { useLanguage } from "@/lib/language-context";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  variant?: "button" | "minimal" | "dropdown";
  className?: string;
}

const LanguageToggle = ({ variant = "button", className = "" }: LanguageToggleProps) => {
  const { language, toggleLanguage } = useLanguage();

  if (variant === "minimal") {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${className}`}
        aria-label={`Switch to ${language === "en" ? "Spanish" : "English"}`}
        tabIndex={0}
      >
        <Globe className="w-4 h-4" />
        <span className="uppercase">{language}</span>
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm"
          aria-label={`Switch to ${language === "en" ? "Spanish" : "English"}`}
          tabIndex={0}
        >
          <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === "en" ? "English" : "Español"}
          </span>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">
            {language === "en" ? "ES" : "EN"}
          </span>
        </button>
      </div>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggleLanguage}
      className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md ${className}`}
      aria-label={`Switch to ${language === "en" ? "Spanish" : "English"}`}
      tabIndex={0}
    >
      <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
      <div className="flex items-center gap-1.5">
        <span
          className={`text-sm font-semibold transition-colors ${
            language === "en"
              ? "text-purple-600 dark:text-purple-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          EN
        </span>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span
          className={`text-sm font-semibold transition-colors ${
            language === "es"
              ? "text-purple-600 dark:text-purple-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          ES
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;

