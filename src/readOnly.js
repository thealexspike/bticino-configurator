import React from 'react';

// true când adminul vizualizează proiectele altui utilizator.
// Componentele ascund sau dezactivează controalele de editare; exportul PDF,
// tab-urile și deschiderea editorului (pentru vizualizare) rămân active.
export const ReadOnlyContext = React.createContext(false);

export const useReadOnly = () => React.useContext(ReadOnlyContext);
