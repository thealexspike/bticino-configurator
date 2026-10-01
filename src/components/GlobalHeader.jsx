import React from 'react';
import { Package } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

// Bara fixă de sus: titlu, email utilizator, acces admin, limbă, logout
export function GlobalHeader({ lang, email, isAdmin, onOpenUsers, onLogout }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b px-4 py-2 flex justify-between items-center">
      <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <Package className="w-5 h-5" />
        <span className="hidden sm:inline">{lang === 'ro' ? 'Configurator Aparataj' : 'Electrical Configurator'}</span>
        <span className="sm:hidden">Config</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 hidden sm:inline">{email}</span>
        {isAdmin && (
          <button
            onClick={onOpenUsers}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
          >
            {lang === 'ro' ? 'Conturi' : 'Users'}
          </button>
        )}
        <LanguageSwitcher />
        <button
          onClick={onLogout}
          className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
