import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { CHANGELOG } from '../data/changelog';
import { useLanguage } from '../i18n';

// Pe ecrane late (marginea liberă are loc de panou) stă fix în stânga jos;
// pe ecrane înguste rămâne în pagină, deasupra formularului de proiect nou.
const PLACEMENT = 'min-[1600px]:fixed min-[1600px]:left-4 min-[1600px]:bottom-4 min-[1600px]:w-80 min-[1600px]:mb-0 min-[1600px]:z-30';

const SEEN_KEY = 'configurator-aparataj-changelog-seen';
const COLLAPSED_KEY = 'configurator-aparataj-changelog-collapsed';

const readStorage = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* stocare indisponibilă */ }
};

const formatDate = (iso, lang) => {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return iso;
  }
};

// Panoul „Noutăți" de pe pagina principală. Ultima notă e deschisă; cele vechi
// se văd la cerere. Eticheta „Nou" apare până când utilizatorul închide panoul
// după ce a apărut o notă nouă.
export function WhatsNew() {
  const lang = useLanguage();
  const latest = CHANGELOG[0];
  const [seenId, setSeenId] = useState(() => readStorage(SEEN_KEY));
  const [collapsed, setCollapsed] = useState(() => readStorage(COLLAPSED_KEY) === latest?.id);
  const [showAll, setShowAll] = useState(false);

  if (!latest) return null;

  const isNew = seenId !== latest.id;
  const L = (obj) => obj?.[lang] || obj?.ro || obj?.en;
  const entries = showAll ? CHANGELOG : [latest];

  const collapse = () => {
    setCollapsed(true);
    setSeenId(latest.id);
    writeStorage(COLLAPSED_KEY, latest.id);
    writeStorage(SEEN_KEY, latest.id);
  };
  const expand = () => {
    setCollapsed(false);
    writeStorage(COLLAPSED_KEY, '');
  };

  if (collapsed) {
    return (
      <button
        onClick={expand}
        className={`mb-6 w-full bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 ${PLACEMENT}`}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {lang === 'ro' ? 'Noutăți' : "What's new"}
          <span className="text-gray-400">· {formatDate(latest.date, lang)}</span>
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow mb-6 border-l-4 border-amber-400 min-[1600px]:max-h-[70vh] min-[1600px]:overflow-y-auto ${PLACEMENT}`}>
      <div className="flex items-center justify-between px-4 pt-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {lang === 'ro' ? 'Noutăți' : "What's new"}
          {isNew && (
            <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
              {lang === 'ro' ? 'Nou' : 'New'}
            </span>
          )}
        </h2>
        <button
          onClick={collapse}
          className="text-gray-400 hover:text-gray-600 p-1"
          title={lang === 'ro' ? 'Ascunde' : 'Hide'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pb-4">
        {entries.map((entry, idx) => (
          <div key={entry.id} className={idx > 0 ? 'mt-4 pt-4 border-t' : 'mt-2'}>
            <div className="text-sm">
              <span className="font-medium text-gray-800">{L(entry.title)}</span>
              <span className="text-gray-400"> · {formatDate(entry.date, lang)}</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc pl-5">
              {(L(entry.items) || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {CHANGELOG.length > 1 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            {showAll
              ? <>{lang === 'ro' ? 'Doar ultimele noutăți' : 'Latest only'} <ChevronUp className="w-4 h-4" /></>
              : <>{lang === 'ro' ? 'Vezi toate actualizările' : 'See all updates'} <ChevronDown className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
