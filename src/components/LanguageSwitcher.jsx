import React from 'react';
import { Globe } from 'lucide-react';
import { LanguageContext } from '../i18n';

export function LanguageSwitcher() {
  const { lang, setLang } = React.useContext(LanguageContext);
  
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ro' : 'en')}
      className="flex items-center gap-2 px-3 py-2 rounded border bg-white hover:bg-gray-50 text-sm font-medium"
      title={lang === 'en' ? 'Switch to Romanian' : 'Schimbă în Engleză'}
    >
      <Globe className="w-4 h-4" />
      {lang === 'en' ? '🇬🇧 EN' : '🇷🇴 RO'}
    </button>
  );
}
