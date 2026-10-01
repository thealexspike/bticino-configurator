import React from 'react';
import { ClipboardPaste } from 'lucide-react';

// Pozele din clipboard (captură de ecran, „Copy image" etc.). Unele browsere pun
// poza doar în `items`, nu și în `files`.
export function clipboardImages(dt) {
  if (!dt) return [];
  const files = [...(dt.files || [])].filter(f => f.type.startsWith('image/'));
  if (files.length) return files;
  return [...(dt.items || [])]
    .filter(it => it.kind === 'file' && it.type.startsWith('image/'))
    .map(it => it.getAsFile())
    .filter(Boolean);
}

// Câmp în care Ctrl+V cu o poză o urcă direct (ca în Azimut Proiecte).
// Textul lipit nu face nimic; câmpul rămâne gol.
export function PhotoPasteInput({ onImages, disabled, placeholder, autoFocus = false, className = '' }) {
  const handlePaste = (e) => {
    const imgs = clipboardImages(e.clipboardData);
    e.preventDefault();
    e.stopPropagation();
    if (imgs.length && !disabled) onImages(imgs);
  };

  return (
    <div className={`relative ${className}`}>
      <ClipboardPaste className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        value=""
        onChange={() => {}}
        onPaste={handlePaste}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full border border-dashed border-gray-300 rounded pl-8 pr-2 py-2 text-sm bg-white focus:border-blue-400 focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
