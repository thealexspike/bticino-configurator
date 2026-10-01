import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useReadOnly } from '../readOnly';
import { PHOTO_ACCEPT } from '../lib/photoImport';
import { PhotoPasteInput, clipboardImages } from './PhotoPasteInput';

export const photoUrl = (projectId, photoId, thumb = false) =>
  `/api/projects/${projectId}/photos/${photoId}/image${thumb ? '?size=thumb' : ''}`;

// Pozele de șantier ale unui aparataj (ce e notat pe perete, mărimea dozei etc.).
// Se adaugă lipind din clipboard (Ctrl+V, oriunde în fereastră), trăgând fișiere
// peste fereastră sau cu „Urcă poză".
export function AssemblyPhotos({ projectId, assembly, photos, uploadStatus, onUpload, onDelete, onClose }) {
  const lang = useLanguage();
  const readOnly = useReadOnly();
  const L = (ro, en) => (lang === 'ro' ? ro : en);
  const [viewIndex, setViewIndex] = useState(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Ctrl+V oriunde în fereastră (câmpul de lipire oprește propagarea, deci nu se dublează)
  useEffect(() => {
    if (readOnly) return undefined;
    const onPaste = (e) => {
      const imgs = clipboardImages(e.clipboardData);
      if (!imgs.length || uploadStatus) return;
      e.preventDefault();
      onUpload(imgs);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [readOnly, uploadStatus, onUpload]);

  const dropFiles = (e) => {
    e.preventDefault();
    setDragging(false);
    if (readOnly || uploadStatus) return;
    const files = [...(e.dataTransfer.files || [])].filter(f => f.type.startsWith('image/'));
    if (files.length) onUpload(files);
  };

  const viewing = viewIndex != null ? photos[viewIndex] : null;
  const step = (d) => setViewIndex(i => (i + d + photos.length) % photos.length);

  const pick = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length) onUpload(files);
  };

  const remove = (photo) => {
    if (!window.confirm(L('Ștergi această poză?', 'Delete this photo?'))) return;
    onDelete(photo);
    setViewIndex(null);
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col ${dragging ? 'ring-4 ring-blue-400' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => { if (!readOnly && e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={() => setDragging(false)}
        onDrop={dropFiles}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Camera className="w-5 h-5" /> {L('Poze de pe șantier', 'Site photos')} · {assembly.code}
            </h2>
            <p className="text-sm text-gray-500">{assembly.room || L('Fără cameră', 'No room')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b bg-gray-50">
            <PhotoPasteInput
              className="flex-1 min-w-[220px]"
              autoFocus
              disabled={!!uploadStatus}
              onImages={onUpload}
              placeholder={L('Lipește poza aici (Ctrl+V)', 'Paste the photo here (Ctrl+V)')}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={!!uploadStatus}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-sm bg-white border hover:bg-gray-100 disabled:opacity-50"
              title={L('Urcă poze de pe calculator', 'Upload photos from your computer')}
            >
              <Upload className="w-4 h-4" /> {L('Urcă poză', 'Upload photo')}
            </button>
            <input ref={fileRef} type="file" accept={PHOTO_ACCEPT} multiple className="hidden" onChange={pick} />
            {uploadStatus && <span className="self-center text-sm text-gray-600">⏳ {uploadStatus}</span>}
          </div>
        )}

        <div className="p-4 overflow-y-auto">
          {photos.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              {readOnly
                ? L('Nicio poză pentru acest aparat.', 'No photos for this assembly.')
                : L('Nicio poză încă. Copiază poza peretelui cu notițele de pe șantier și lipește-o aici (Ctrl+V), sau trage fișierul peste fereastră.', 'No photos yet. Copy the photo of the wall with your site notes and paste it here (Ctrl+V), or drag the file onto this window.')}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => setViewIndex(i)}
                    className="block w-full aspect-square rounded overflow-hidden bg-gray-100 border hover:ring-2 hover:ring-blue-400"
                  >
                    <img src={photoUrl(projectId, p.id, true)} alt={assembly.code} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                  <div className="text-[11px] text-gray-500 mt-1">{formatDate(p.created_at)}</div>
                  {!readOnly && (
                    <button
                      onClick={() => remove(p)}
                      className="absolute top-1 right-1 bg-white/90 rounded p-1 text-red-600 opacity-0 group-hover:opacity-100 hover:bg-white"
                      title={L('Șterge poza', 'Delete photo')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vizualizare mare */}
      {viewing && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center" style={{ zIndex: 60 }} onClick={(e) => { e.stopPropagation(); setViewIndex(null); }}>
          <img
            src={photoUrl(projectId, viewing.id)}
            alt={assembly.code}
            className="max-w-[95vw] max-h-[88vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute top-3 right-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {!readOnly && (
              <button onClick={() => remove(viewing)} className="bg-white/10 hover:bg-white/20 text-white rounded p-2" title={L('Șterge poza', 'Delete photo')}>
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={() => setViewIndex(null)} className="bg-white/10 hover:bg-white/20 text-white rounded p-2"><X className="w-5 h-5" /></button>
          </div>
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {assembly.code} · {viewIndex + 1}/{photos.length} · {formatDate(viewing.created_at)}
          </div>
        </div>
      )}
    </div>
  );
}
