import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const langs: { code: Language; label: string }[] = [
    { code: 'EN', label: 'EN' },
    { code: 'TH', label: 'TH' },
    { code: 'JP', label: 'JP' },
  ];

  return (
    <div className="flex bg-slate-800 rounded-lg p-1">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
            language === lang.code
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
