import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Package, Zap, Settings, FileText, Home, Box, Layers, Globe, Copy, Upload } from 'lucide-react';
import { supabase, supabaseUrl, supabaseAnonKeyLegacy } from './supabase';
import Auth from './Auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// TRANSLATIONS
// ============================================================================

const TRANSLATIONS = {
  en: {
    // General
    configurator: 'Electrical Configurator',
    library: 'Library',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    done: 'Done',
    create: 'Create',
    duplicate: 'Duplicate',
    
    // AI Import
    aiImport: 'AI Import',
    aiImportTitle: 'Import from Architect Document',
    aiImportDescription: 'Upload a PDF with the electrical requirements and AI will create the assemblies automatically.',
    aiImportUpload: 'Choose PDF',
    aiImportProcessing: 'AI is analyzing the document...',
    aiImportSuccess: 'assemblies added. Please verify the list!',
    aiImportError: 'Error processing document',
    aiImportLimitReached: 'Monthly import limit reached (3/month)',
    aiImportColor: 'Color for imported assemblies',
    aiImportWallBox: 'Wall box type',
    aiImportStart: 'Import',
    aiImportWarnings: 'Warnings',
    yes: 'Yes',
    no: 'No',
    
    // Projects
    projects: 'Projects',
    createNewProject: 'Create New Project',
    projectName: 'Project name',
    clientName: 'Client name',
    noProjects: 'No projects yet. Create one above.',
    noClient: 'No client',
    assemblies: 'assemblies',
    backToProjects: 'Back to Projects',
    
    // Assemblies
    outlets: 'Outlets',
    switches: 'Switches',
    outlet: 'Outlet',
    switch: 'Switch',
    addOutlet: 'Add Preset',
    addSwitch: 'Add Preset',
    addEmpty: 'Add Empty',
    noOutlets: 'No outlets yet.',
    noSwitches: 'No switches yet.',
    modules: 'modules',
    noRoom: 'No room',
    used: 'used',
    overCapacity: 'OVER CAPACITY!',
    editProject: 'Edit Project',
    projectName: 'Project Name',
    clientName: 'Client Name',
    
    // Assembly Editor
    backToList: 'Back to List',
    room: 'Room',
    size: 'Size',
    color: 'Color',
    assemblyComponents: 'Assembly Components (auto-selected)',
    wallBox: 'Wall Box',
    installFace: 'Install Face',
    decorFace: 'Decor Face',
    visualAssembly: 'Visual Assembly',
    availableModules: 'Available Modules',
    remainingCapacity: 'Remaining capacity',
    installed: 'Installed',
    capacity: 'Capacity',
    free: 'free',
    dropHere: 'Drop here',
    dragHint: 'Drag modules from the list or use + button • Drag to reorder • Click × to remove',
    editHint: 'Click size/room to edit inline · Drag to reorder · Click ⚙️ to edit modules',
    editHintGrouped: 'Drag assemblies to room headers to move between rooms · Click ⚙️ to edit modules',
    groupByRoom: 'Group by room',
    
    // Room suggestions
    livingRoom: 'Living Room',
    kitchen: 'Kitchen',
    bedroom: 'Bedroom',
    bathroom: 'Bathroom',
    hallway: 'Hallway',
    entrance: 'Entrance',
    office: 'Office',
    diningRoom: 'Dining Room',
    garage: 'Garage',
    laundry: 'Laundry',
    storage: 'Storage',
    balcony: 'Balcony',
    
    // Colors
    white: 'White',
    black: 'Black',
    
    // BOQ & Quote
    boq: 'BOQ (Supplier)',
    clientQuote: 'Client Quote',
    profitAnalysis: 'Profit Analysis',
    billOfQuantities: 'Bill of Quantities',
    forSupplier: 'For Supplier',
    quoteFor: 'Quote for',
    date: 'Date',
    item: 'Item',
    sku: 'SKU',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    total: 'Total',
    subtotal: 'Subtotal',
    grandTotal: 'Grand Total',
    totalItems: 'Total items',
    wallBoxes: 'Wall Boxes',
    installFaces: 'Install Faces',
    decorFaces: 'Decor Faces',
    decorFacesTab: 'Decor Frames',
    moduleFaces: 'Module Faces',
    noAssemblies: 'No assemblies to generate',
    allPricesIncludeVat: 'All prices include VAT',
    
    // VAT
    vat: 'VAT',
    vatRate: 'VAT (21%)',
    priceWithoutVat: 'Price (excl. VAT)',
    priceWithVat: 'Price (incl. VAT)',
    totalWithoutVat: 'Total (excl. VAT)',
    totalWithVat: 'Total (incl. VAT)',
    vatAmount: 'VAT Amount',
    unitPriceExclVat: 'Unit (excl. VAT)',
    unitPriceInclVat: 'Unit (incl. VAT)',
    
    // Profit
    purchaseTotalExclVat: 'Purchase Total (excl. VAT)',
    sellingTotalExclVat: 'Selling Total (excl. VAT)',
    grossProfit: 'Gross Profit',
    profitMargin: 'Profit Margin',
    vatCollected: 'VAT Collected (from sales)',
    vatDeductible: 'VAT Deductible (from purchases)',
    vatPayable: 'VAT Payable',
    unitPurchase: 'Purchase',
    unitSelling: 'Selling',
    unitDifference: 'Unit Profit',
    unitProfit: 'Total Profit',
    
    // Presets
    presets: 'Presets',
    presetsDescription: 'Pre-configured assemblies for quick creation',
    addPreset: 'Add Preset',
    presetName: 'Preset Name',
    presetType: 'Type',
    presetModules: 'Modules',
    emptyAssembly: 'Empty Assembly',
    selectPreset: 'Select a preset or start empty',
    noPresets: 'No presets configured for this type',
    deletePresetConfirm: 'Delete this preset?',
    noModules: 'No modules',
    
    // Library
    componentLibrary: 'Component Library',
    manageSKUs: 'Manage SKUs, prices, and module definitions',
    addModule: 'Add Module',
    addNewModule: 'Add New Module',
    moduleName: 'Name',
    category: 'Category',
    moduleId: 'Module ID',
    moduleSku: 'Module SKU',
    moduleSkuWhite: 'Module SKU (White)',
    moduleSkuBlack: 'Module SKU (Black)',
    modulePrice: 'Module Price',
    modulePriceWhite: 'Price (White)',
    modulePriceBlack: 'Price (Black)',
    faceSkuWhite: 'Face SKU (White)',
    faceSkuBlack: 'Face SKU (Black)',
    facePriceWhite: 'Face Price (White)',
    facePriceBlack: 'Face Price (Black)',
    enterSku: 'Enter SKU',
    enterId: 'Enter ID',
    price: 'Price',
    priceExclVat: 'Price (excl. VAT)',
    priceInclVat: 'Price (incl. VAT)',
    purchasePrice: 'Purchase (excl. VAT)',
    markup: 'Markup %',
    sellingPrice: 'Selling (excl. VAT)',
    sellingPriceVat: 'Selling (incl. VAT)',
    other: 'Other',
    supports: 'Supports',
    coverPlates: 'Cover Plates',
    configureSKUs: 'Configure SKUs and prices for each size',
    configureSKUsColor: 'Configure SKUs and prices for each size and color',
    deleteModuleConfirm: 'Delete this module? It will be removed from the library.',
    moduleIdExists: 'A module with this ID already exists',
    enterIdAndName: 'Please enter a module ID and name',
    hasColorVariants: 'Has color variants (different SKU for white/black)',
    moduleHasColorVariants: 'Module has color variants (different module SKU per color)',
    faceHasColorVariants: 'Face/key has color variants (different face SKU per color)',
    addColor: 'Add Color',
    removeColor: 'Remove Color',
    colorId: 'Color ID',
    colorNameEn: 'Name (EN)',
    colorNameRo: 'Name (RO)',
    colorHex: 'Hex',
    manageColors: 'Manage Colors',
    confirmRemoveColor: 'Remove this color? Module fields for this color will be deleted.',
    
    // Module names
    face: 'Face',
    
    // Item names for BOQ/Quote
    wallBoxMasonryItem: 'Wall Box Masonry',
    wallBoxDrywallItem: 'Wall Box Drywall',
    supportItem: 'Support Frame',
    coverPlateItem: 'Cover Plate',
    
    // Wall Box Types
    wallBoxType: 'Wall Box Type',
    masonry: 'Masonry',
    drywall: 'Drywall (Gypsum)',
    wallBoxesMasonry: 'Wall Boxes (Masonry)',
    wallBoxesDrywall: 'Wall Boxes (Drywall)',
    system: 'System',
    selectSystem: 'Select system',
    editingSystem: 'Editing system',
    systemBticino: 'BTicino Living Now',
    systemGewiss: 'Gewiss Chorus',
    systemSchneider: 'Schneider Noua Unica',
  },
  ro: {
    // General
    configurator: 'Configurator Aparataj Electric',
    library: 'Bibliotecă',
    back: 'Înapoi',
    save: 'Salvează',
    cancel: 'Anulează',
    delete: 'Șterge',
    edit: 'Editează',
    add: 'Adaugă',
    done: 'Gata',
    create: 'Creează',
    duplicate: 'Duplică',
    
    // AI Import
    aiImport: 'Import AI',
    aiImportTitle: 'Import din Necesar Arhitect',
    aiImportDescription: 'Încarcă un PDF cu necesarul electric și AI-ul va crea configurațiile automat.',
    aiImportUpload: 'Alege PDF',
    aiImportProcessing: 'AI analizează documentul...',
    aiImportSuccess: 'configurații adăugate. Verifică lista!',
    aiImportError: 'Eroare la procesarea documentului',
    aiImportLimitReached: 'Limita lunară de importuri atinsă (3/lună)',
    aiImportColor: 'Culoare pentru configurațiile importate',
    aiImportWallBox: 'Tip doză',
    aiImportStart: 'Importă',
    aiImportWarnings: 'Avertismente',
    yes: 'Da',
    no: 'Nu',
    
    // Projects
    projects: 'Proiecte',
    createNewProject: 'Creează Proiect Nou',
    projectName: 'Nume proiect',
    clientName: 'Nume client',
    noProjects: 'Nu există proiecte încă. Creează unul mai sus.',
    noClient: 'Fără client',
    assemblies: 'ansambluri',
    backToProjects: 'Înapoi la Proiecte',
    
    // Assemblies
    outlets: 'Prize',
    switches: 'Întrerupătoare',
    outlet: 'Priză',
    switch: 'Întrerupător',
    addOutlet: 'Adaugă Preset',
    addSwitch: 'Adaugă Preset',
    addEmpty: 'Adaugă Gol',
    noOutlets: 'Nu există prize încă.',
    noSwitches: 'Nu există întrerupătoare încă.',
    modules: 'module',
    noRoom: 'Fără cameră',
    used: 'folosit',
    overCapacity: 'CAPACITATE DEPĂȘITĂ!',
    editProject: 'Editează Proiect',
    projectName: 'Nume Proiect',
    clientName: 'Nume Client',
    
    // Assembly Editor
    backToList: 'Înapoi la Listă',
    room: 'Cameră',
    size: 'Dimensiune',
    color: 'Culoare',
    assemblyComponents: 'Componente Ansamblu (auto-selectate)',
    wallBox: 'Doză',
    installFace: 'Suport',
    decorFace: 'Ramă',
    visualAssembly: 'Ansamblu Vizual',
    availableModules: 'Module Disponibile',
    remainingCapacity: 'Capacitate rămasă',
    installed: 'Instalate',
    capacity: 'Capacitate',
    free: 'liber',
    dropHere: 'Plasează aici',
    dragHint: 'Trage modulele din listă sau folosește butonul + • Trage pentru reordonare • Click × pentru ștergere',
    editHint: 'Click pe dimensiune/cameră pentru editare · Trage pentru reordonare · Click ⚙️ pentru editare module',
    editHintGrouped: 'Trage aparatajele pe header-ul camerei pentru a le muta · Click ⚙️ pentru editare module',
    groupByRoom: 'Grupează pe camere',
    
    // Room suggestions
    livingRoom: 'Living',
    kitchen: 'Bucătărie',
    bedroom: 'Dormitor',
    bathroom: 'Baie',
    hallway: 'Hol',
    entrance: 'Intrare',
    office: 'Birou',
    diningRoom: 'Sufragerie',
    garage: 'Garaj',
    laundry: 'Spălătorie',
    storage: 'Depozit',
    balcony: 'Balcon',
    
    // Colors
    white: 'Alb',
    black: 'Negru',
    
    // BOQ & Quote
    boq: 'BOQ (Furnizor)',
    clientQuote: 'Ofertă Client',
    profitAnalysis: 'Analiză Profit',
    billOfQuantities: 'Lista de Cantități',
    forSupplier: 'Pentru Furnizor',
    quoteFor: 'Ofertă pentru',
    date: 'Data',
    item: 'Articol',
    sku: 'Cod',
    qty: 'Cant.',
    unitPrice: 'Preț Unitar',
    total: 'Total',
    subtotal: 'Subtotal',
    grandTotal: 'Total General',
    totalItems: 'Total articole',
    wallBoxes: 'Doze',
    installFaces: 'Suporturi',
    decorFaces: 'Rame',
    decorFacesTab: 'Rame Decor',
    moduleFaces: 'Fețe Module',
    noAssemblies: 'Nu există ansambluri pentru generare',
    allPricesIncludeVat: 'Toate prețurile includ TVA',
    
    // VAT
    vat: 'TVA',
    vatRate: 'TVA (21%)',
    priceWithoutVat: 'Preț (fără TVA)',
    priceWithVat: 'Preț (cu TVA)',
    totalWithoutVat: 'Total (fără TVA)',
    totalWithVat: 'Total (cu TVA)',
    vatAmount: 'Valoare TVA',
    unitPriceExclVat: 'Unitar (fără TVA)',
    unitPriceInclVat: 'Unitar (cu TVA)',
    
    // Profit
    purchaseTotalExclVat: 'Total Achiziție (fără TVA)',
    sellingTotalExclVat: 'Total Vânzare (fără TVA)',
    grossProfit: 'Profit Brut',
    profitMargin: 'Marjă Profit',
    vatCollected: 'TVA Colectat (din vânzări)',
    vatDeductible: 'TVA Deductibil (din achiziții)',
    vatPayable: 'TVA de Plată',
    unitPurchase: 'Achiziție',
    unitSelling: 'Vânzare',
    unitDifference: 'Profit Unitar',
    unitProfit: 'Profit Total',
    
    // Presets
    presets: 'Preseturi',
    presetsDescription: 'Ansambluri preconfigurate pentru creare rapidă',
    addPreset: 'Adaugă Preset',
    presetName: 'Nume Preset',
    presetType: 'Tip',
    presetModules: 'Module',
    emptyAssembly: 'Ansamblu Gol',
    selectPreset: 'Selectează un preset sau începe gol',
    noPresets: 'Niciun preset configurat pentru acest tip',
    deletePresetConfirm: 'Ștergi acest preset?',
    noModules: 'Fără module',
    
    // Library
    componentLibrary: 'Bibliotecă Componente',
    manageSKUs: 'Gestionează coduri, prețuri și definiții module',
    addModule: 'Adaugă Modul',
    addNewModule: 'Adaugă Modul Nou',
    moduleName: 'Nume',
    category: 'Categorie',
    moduleId: 'ID Modul',
    moduleSku: 'Cod Modul',
    moduleSkuWhite: 'Cod Modul (Alb)',
    moduleSkuBlack: 'Cod Modul (Negru)',
    modulePrice: 'Preț Modul',
    modulePriceWhite: 'Preț (Alb)',
    modulePriceBlack: 'Preț (Negru)',
    faceSkuWhite: 'Cod Față (Alb)',
    faceSkuBlack: 'Cod Față (Negru)',
    facePriceWhite: 'Preț Față (Alb)',
    facePriceBlack: 'Preț Față (Negru)',
    enterSku: 'Introdu cod',
    enterId: 'Introdu ID',
    price: 'Preț',
    priceExclVat: 'Preț (fără TVA)',
    priceInclVat: 'Preț (cu TVA)',
    purchasePrice: 'Achiziție (fără TVA)',
    markup: 'Adaos %',
    sellingPrice: 'Vânzare (fără TVA)',
    sellingPriceVat: 'Vânzare (cu TVA)',
    other: 'Altele',
    supports: 'Suporturi',
    coverPlates: 'Rame Decorative',
    configureSKUs: 'Configurează coduri și prețuri pentru fiecare dimensiune',
    configureSKUsColor: 'Configurează coduri și prețuri pentru fiecare dimensiune și culoare',
    deleteModuleConfirm: 'Ștergi acest modul? Va fi eliminat din bibliotecă.',
    moduleIdExists: 'Un modul cu acest ID există deja',
    enterIdAndName: 'Te rugăm introdu un ID și nume pentru modul',
    hasColorVariants: 'Are variante de culoare (SKU diferit pentru alb/negru)',
    moduleHasColorVariants: 'Modulul are variante de culoare (SKU modul diferit per culoare)',
    faceHasColorVariants: 'Tasta/fața are variante de culoare (SKU față diferit per culoare)',
    addColor: 'Adaugă Culoare',
    removeColor: 'Șterge Culoare',
    colorId: 'ID Culoare',
    colorNameEn: 'Nume (EN)',
    colorNameRo: 'Nume (RO)',
    colorHex: 'Hex',
    manageColors: 'Gestionare Culori',
    confirmRemoveColor: 'Ștergi această culoare? Câmpurile modulelor pentru această culoare vor fi șterse.',
    
    // Module names
    face: 'Fata',
    
    // Item names for BOQ/Quote
    wallBoxMasonryItem: 'Doza Zidarie',
    wallBoxDrywallItem: 'Doza Gips-carton',
    supportItem: 'Rama Suport',
    coverPlateItem: 'Rama Decor',
    
    // Wall Box Types
    wallBoxType: 'Tip Doză',
    masonry: 'Zidărie',
    drywall: 'Gips-carton',
    wallBoxesMasonry: 'Doze (Zidarie)',
    wallBoxesDrywall: 'Doze (Gips-carton)',
    system: 'Sistem',
    selectSystem: 'Alege sistemul',
    editingSystem: 'Editează sistemul',
    systemBticino: 'BTicino Living Now',
    systemGewiss: 'Gewiss Chorus',
    systemSchneider: 'Schneider Noua Unica',
  },
};

// Language context
const LanguageContext = React.createContext({ lang: 'en', t: TRANSLATIONS.en, setLang: () => {} });

// Hook to use translations
const useTranslation = () => {
  const { t } = React.useContext(LanguageContext);
  return t;
};

// Hook to get current language
const useLanguage = () => {
  const { lang } = React.useContext(LanguageContext);
  return lang;
};

// ============================================================================
// BTICINO PRODUCT IMAGE URLs
// ============================================================================

// Image base URL for Bticino DAR CDN
const BTICINO_IMG_BASE = 'https://dar.bticino.it/asset/Pictures/md/';

// Product images - covers (what you see installed)
const MODULE_IMAGES = {
  // White covers
  schuko_white: `${BTICINO_IMG_BASE}BT-KW03-WEB-R.jpg`,
  italian_white: `${BTICINO_IMG_BASE}BT-KW02-WEB-R.jpg`,
  switch_white: `${BTICINO_IMG_BASE}BT-KW01-WEB-R.jpg`,
  dimmer_white: `${BTICINO_IMG_BASE}BT-KW4411-WEB-R.jpg`,
  usb_white: `${BTICINO_IMG_BASE}BT-KW4287C2-WEB-R.jpg`,
  blank_white: `${BTICINO_IMG_BASE}BT-KW00-WEB-R.jpg`,
  // Black covers
  schuko_black: `${BTICINO_IMG_BASE}BT-KG03-WEB-R.jpg`,
  italian_black: `${BTICINO_IMG_BASE}BT-KG02-WEB-R.jpg`,
  switch_black: `${BTICINO_IMG_BASE}BT-KG01-WEB-R.jpg`,
  dimmer_black: `${BTICINO_IMG_BASE}BT-KG4411-WEB-R.jpg`,
  usb_black: `${BTICINO_IMG_BASE}BT-KG4287C2-WEB-R.jpg`,
  blank_black: `${BTICINO_IMG_BASE}BT-KG00-WEB-R.jpg`,
};

// Face plate images
const FACE_PLATE_IMAGES = {
  '2_white': `${BTICINO_IMG_BASE}BT-KA4802KW-WEB-R.jpg`,
  '3_white': `${BTICINO_IMG_BASE}BT-KA4803KW-WEB-R.jpg`,
  '4_white': `${BTICINO_IMG_BASE}BT-KA4804KW-WEB-R.jpg`,
  '6_white': `${BTICINO_IMG_BASE}BT-KA4806KW-WEB-R.jpg`,
  '2_black': `${BTICINO_IMG_BASE}BT-KA4802KG-WEB-R.jpg`,
  '3_black': `${BTICINO_IMG_BASE}BT-KA4803KG-WEB-R.jpg`,
  '4_black': `${BTICINO_IMG_BASE}BT-KA4804KG-WEB-R.jpg`,
  '6_black': `${BTICINO_IMG_BASE}BT-KA4806KG-WEB-R.jpg`,
};

// Get module image URL
const getModuleImageUrl = (moduleId, color) => {
  const key = `${moduleId}_${color}`;
  return MODULE_IMAGES[key] || null;
};

// Get face plate image URL  
const getFacePlateImageUrl = (size, color) => {
  const key = `${size}_${color}`;
  return FACE_PLATE_IMAGES[key] || null;
};

// ============================================================================
// SVG MODULE GRAPHICS - Full-size, single tone, contrasting symbols
// ============================================================================

// Graphics definitions by type
// Each receives colorHex (e.g. '#C2A878') and derives all SVG fill colors from it

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
};
const rgbToHex = (r, g, b) => '#' + [r,g,b].map(c => Math.max(0,Math.min(255,Math.round(c))).toString(16).padStart(2,'0')).join('');
const adjustBrightness = (hex, amount) => {
  const {r,g,b} = hexToRgb(hex);
  return rgbToHex(r + amount, g + amount, b + amount);
};
const getLuminance = (hex) => {
  const {r,g,b} = hexToRgb(hex);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
};

const svgPalette = (colorHex = '#f5f5f5') => {
  const lum = getLuminance(colorHex);
  const dark = lum < 0.5;
  return {
    bg: colorHex,
    accent: dark ? adjustBrightness(colorHex, 20) : adjustBrightness(colorHex, -15),
    holes: dark ? adjustBrightness(colorHex, -40) : '#333',
    ground: dark ? adjustBrightness(colorHex, 50) : '#999',
    connector: dark ? adjustBrightness(colorHex, 50) : '#999',
    symbol: dark ? '#ffffff' : '#333333',
    divider: dark ? adjustBrightness(colorHex, 30) : adjustBrightness(colorHex, -20),
    port: dark ? adjustBrightness(colorHex, -40) : '#333',
    portInner: colorHex,
    contacts: dark ? '#888' : '#666',
    placeholder: dark ? adjustBrightness(colorHex, 40) : '#bbb',
    led: null, // LEDs stay fixed color
  };
};

// Resolve color prop: if hex string (#...) use directly, else map via known palette
const colorIdToHex = { white: '#f5f5f5', black: '#3a3a3a' };
const resolveColorHex = (color) => {
  if (!color) return '#f5f5f5';
  if (color.startsWith('#')) return color;
  return colorIdToHex[color] || '#f5f5f5';
};

const ModuleGraphicsByType = {
  // Schuko outlet - 2M full size
  schuko: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <circle cx="30" cy="40" r="24" fill={p.accent}/>
        <rect x="8" y="32" width="4" height="16" rx="1" fill={p.ground}/>
        <rect x="48" y="32" width="4" height="16" rx="1" fill={p.ground}/>
        <circle cx="20" cy="40" r="5" fill={p.holes}/>
        <circle cx="40" cy="40" r="5" fill={p.holes}/>
      </svg>
    );
  },
  italian: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <ellipse cx="15" cy="40" rx="10" ry="22" fill={p.accent}/>
        <circle cx="15" cy="28" r="3" fill={p.holes}/>
        <circle cx="15" cy="40" r="3" fill={p.holes}/>
        <circle cx="15" cy="52" r="3" fill={p.holes}/>
      </svg>
    );
  },
  switch: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#4ade80"/>
      </svg>
    );
  },
  switch_stair: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M9 38 L15 30 L21 38" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M9 46 L15 54 L21 46" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="15" cy="70" r="3" fill="#fbbf24"/>
      </svg>
    );
  },
  switch_cross: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <path d="M9 32 L21 52 M21 32 L9 52" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#f97316"/>
      </svg>
    );
  },
  dimmer: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <line x1="30" y1="5" x2="30" y2="75" stroke={p.divider} strokeWidth="1"/>
        <path d="M10 40 L20 40 M15 35 L15 45" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M40 40 L50 40" stroke={p.symbol} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="15" cy="70" r="3" fill="#4ade80"/>
        <circle cx="45" cy="70" r="3" fill="#4ade80"/>
      </svg>
    );
  },
  usb: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <rect x="7" y="18" width="16" height="10" rx="1" fill={p.port}/>
        <rect x="9" y="20" width="12" height="6" rx="0.5" fill={p.portInner}/>
        <rect x="7" y="38" width="16" height="10" rx="1" fill={p.port}/>
        <rect x="9" y="40" width="12" height="6" rx="0.5" fill={p.portInner}/>
        <text x="15" y="68" fontSize="8" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">USB</text>
      </svg>
    );
  },
  coax: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <circle cx="15" cy="38" r="10" fill={p.connector}/>
        <circle cx="15" cy="38" r="6" fill={p.bg}/>
        <circle cx="15" cy="38" r="2.5" fill={p.holes}/>
        <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">TV</text>
      </svg>
    );
  },
  utp: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <rect x="6" y="28" width="18" height="22" rx="1" fill={p.port}/>
        <rect x="8" y="32" width="14" height="14" rx="0.5" fill={p.bg}/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect key={i} x={9 + i * 1.5} y="33" width="1" height="8" fill={p.contacts}/>
        ))}
        <rect x="12" y="46" width="6" height="3" fill={p.bg}/>
        <text x="15" y="68" fontSize="7" fill={p.symbol} textAnchor="middle" fontFamily="Arial" fontWeight="bold">UTP</text>
      </svg>
    );
  },
  generic1m: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
        <circle cx="15" cy="36" r="12" fill="none" stroke={p.placeholder} strokeWidth="2" strokeDasharray="4 2"/>
        <text x="15" y="42" fontSize="14" fill={p.placeholder} textAnchor="middle" fontFamily="Arial" fontWeight="bold">?</text>
        <text x="15" y="68" fontSize="7" fill={p.placeholder} textAnchor="middle" fontFamily="Arial">1M</text>
      </svg>
    );
  },
  generic2m: ({ color = 'white', width = 60, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="0" y="0" width="60" height="80" fill={p.bg}/>
        <circle cx="30" cy="36" r="14" fill="none" stroke={p.placeholder} strokeWidth="2" strokeDasharray="4 2"/>
        <text x="30" y="44" fontSize="16" fill={p.placeholder} textAnchor="middle" fontFamily="Arial" fontWeight="bold">?</text>
        <text x="30" y="68" fontSize="7" fill={p.placeholder} textAnchor="middle" fontFamily="Arial">2M</text>
      </svg>
    );
  },
  blank: ({ color = 'white', width = 30, height = 80 }) => {
    const p = svgPalette(resolveColorHex(color));
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="0" y="0" width="30" height="80" fill={p.bg}/>
      </svg>
    );
  },
};

// Map module ID to graphic types
const getGraphicTypeFromId = (moduleId, moduleSize = 1) => {
  if (!moduleId) return moduleSize === 2 ? 'generic2m' : 'generic1m';
  const idLower = moduleId.toLowerCase();
  if (idLower.includes('schuko')) return 'schuko';
  if (idLower.includes('italian')) return 'italian';
  if (idLower.includes('switch_cross') || idLower.includes('cross')) return 'switch_cross';
  if (idLower.includes('switch_stair') || idLower.includes('stair')) return 'switch_stair';
  if (idLower.includes('switch')) return 'switch';
  if (idLower.includes('dimmer')) return 'dimmer';
  if (idLower.includes('usb')) return 'usb';
  if (idLower.includes('coax') || idLower.includes('tv')) return 'coax';
  if (idLower.includes('utp') || idLower.includes('rj45') || idLower.includes('ethernet') || idLower.includes('network')) return 'utp';
  if (idLower.includes('blank')) return 'blank';
  // Return generic placeholder based on size for unknown modules
  return moduleSize === 2 ? 'generic2m' : 'generic1m';
};

// Get graphic component for a module ID
const getModuleGraphic = (moduleId, moduleSize = 1) => {
  const type = getGraphicTypeFromId(moduleId, moduleSize);
  return ModuleGraphicsByType[type] || ModuleGraphicsByType.generic1m;
};

// Module image component
const ModuleImage = ({ moduleId, color, colorHex, width = 60, height = 80, className = '', moduleSize = 1 }) => {
  const graphicType = getGraphicTypeFromId(moduleId, moduleSize);
  const SvgComponent = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.generic1m;
  // If colorHex provided, pass it directly as color (SVG resolveColorHex handles #hex)
  const effectiveColor = colorHex || color;
  
  return (
    <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SvgComponent color={effectiveColor} />
    </div>
  );
};

// Face plate image component
const FacePlateImage = ({ size, color, width, height }) => {
  const [imageError, setImageError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const imageUrl = getFacePlateImageUrl(size, color);
  
  const CORS_PROXY = 'https://corsproxy.io/?';
  const finalUrl = useProxy && imageUrl ? `${CORS_PROXY}${encodeURIComponent(imageUrl)}` : imageUrl;

  if (imageError || !imageUrl) {
    return null; // Fall back to CSS styling
  }

  return (
    <img
      src={finalUrl}
      alt={`${size}M ${color} face plate`}
      style={{ 
        position: 'absolute',
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        opacity: 0.15,
        pointerEvents: 'none',
      }}
      onError={() => {
        if (!useProxy) {
          setUseProxy(true);
        } else {
          setImageError(true);
        }
      }}
    />
  );
};

// Face plate frame SVG
const FacePlateFrame = ({ size, color, children, width, height }) => {
  const hex = resolveColorHex(color);
  const dark = getLuminance(hex) < 0.5;
  const bg = dark ? adjustBrightness(hex, -20) : hex;
  const border = dark ? adjustBrightness(hex, 30) : adjustBrightness(hex, -30);
  const innerBg = dark ? adjustBrightness(hex, -10) : '#fff';
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Outer frame */}
      <rect x="0" y="0" width={width} height={height} rx="8" fill={bg} stroke={border} strokeWidth="3"/>
      {/* Inner recess */}
      <rect x="8" y="8" width={width - 16} height={height - 16} rx="4" fill={innerBg} stroke={border} strokeWidth="1"/>
      {/* Module area */}
      <g transform="translate(12, 12)">
        {children}
      </g>
    </svg>
  );
};

// Thumbnail for module list in Library
const ModuleThumbnail = ({ moduleId, size = 40, moduleSize = 1 }) => {
  const graphicType = getGraphicTypeFromId(moduleId, moduleSize);
  // Real BTicino proportions: 1M = 8.5 x 31, 2M = 17 x 31
  const is2M = graphicType === 'schuko' || graphicType === 'dimmer' || graphicType === 'generic2m' || moduleSize === 2;
  const aspectRatio = is2M ? (17 / 31) : (8.5 / 31);
  const height = size;
  const width = height * aspectRatio;
  
  const Component = getModuleGraphic(moduleId, moduleSize);
  if (!Component) return null;
  
  return (
    <div 
      className="border border-gray-400 bg-gray-100"
      style={{ 
        width: width, 
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Component color="white" width={width} height={height} />
    </div>
  );
};

// Assembly Thumbnail - static preview of an assembly
// Real BTicino proportions: 1M module = 8.5 x 31, side parts = 10.5 x 31
const AssemblyThumbnail = ({ assembly, library, scale = 0.4 }) => {
  if (!assembly) return null;
  
  const MODULE_CATALOG = library?.modules || [];
  
  // Base unit for scaling (1M width = 8.5, height = 31)
  const baseScale = 3 * scale; // Multiplier to get reasonable pixel sizes
  const moduleWidth1M = 8.5 * baseScale;  // Width of 1M module
  const faceHeight = 31 * baseScale;       // Height (same for all)
  const sideMargin = 10.5 * baseScale;     // Fixed side parts width
  
  const moduleAreaWidth = assembly.size * moduleWidth1M;
  const totalWidth = moduleAreaWidth + (sideMargin * 2);
  
  // Colors - dynamic based on assembly color hex
  const _dark = isDarkColor(assembly.color, library);
  const colorHex = (library?.availableColors || []).find(c => c.id === assembly.color)?.hex;
  const faceBgColor = colorHex || (_dark ? '#3a3a3a' : '#f5f5f5');
  const frameBorderColor = _dark ? '#888' : '#999';
  const moduleBorderColor = _dark ? '#666' : '#aaa';
  
  // Calculate module slots
  const getModuleSlots = () => {
    const slots = [];
    let currentPos = 0;
    (assembly.modules || []).forEach((mod, index) => {
      const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
      const size = catalogItem?.size || 1;
      slots.push({
        ...mod,
        index,
        startPos: currentPos,
        size,
        catalogItem,
      });
      currentPos += size;
    });
    return slots;
  };
  
  const moduleSlots = getModuleSlots();
  
  return (
    <div
      className="relative"
      style={{
        width: totalWidth,
        height: faceHeight,
        backgroundColor: faceBgColor,
        border: `1px solid ${frameBorderColor}`,
      }}
    >
      {/* Installed modules */}
      <div 
        className="absolute flex"
        style={{ 
          left: sideMargin,
          top: 0,
          width: moduleAreaWidth,
          height: faceHeight,
        }}
      >
        {moduleSlots.map((slot, idx) => {
          const ModuleGraphic = slot.catalogItem ? getModuleGraphic(slot.catalogItem.id, slot.size) : null;
          
          return (
            <div
              key={slot.id || idx}
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{
                width: slot.size * moduleWidth1M,
                height: '100%',
                borderLeft: idx === 0 ? `1px solid ${moduleBorderColor}` : 'none',
                borderRight: `1px solid ${moduleBorderColor}`,
              }}
            >
              {ModuleGraphic && (
                <ModuleGraphic color={colorHex || assembly.color} width={slot.size * moduleWidth1M - 2} height={faceHeight} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// DATA DEFINITIONS (Catalog)
// ============================================================================

const SIZES = [1, 2, 3, 4, 6];
const FRAME_SIZES = [2, 3, 4, 6]; // For wall boxes, install faces, decor faces (min 2M)

const COLORS = [
  { id: 'white', name: 'White', nameEn: 'White', nameRo: 'Alb', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', nameEn: 'Black', nameRo: 'Negru', hex: '#1a1a1a' },
];

// Available systems registry
const SYSTEMS = [
  { id: 'bticino', nameEn: 'BTicino Living Now', nameRo: 'BTicino Living Now' },
  { id: 'gewiss', nameEn: 'Gewiss Chorus', nameRo: 'Gewiss Chorus' },
  { id: 'schneider', nameEn: 'Schneider Noua Unica', nameRo: 'Schneider Noua Unica' },
];

// Helpers for dynamic colors/sizes from library
const getAvailableColors = (library) => library?.availableColors || COLORS;
const getAvailableSizes = (library) => library?.availableSizes || FRAME_SIZES;
const getSystemName = (systemId, lang) => {
  const sys = SYSTEMS.find(s => s.id === systemId);
  if (!sys) return systemId || 'BTicino Living Now';
  return lang === 'ro' ? sys.nameRo : sys.nameEn;
};
// Build an object with a key for each color, optionally from a template
const buildColorObj = (colors, defaultVal = '', template = null) => {
  const obj = {};
  colors.forEach(c => { obj[c.id] = template ? (template[c.id] ?? defaultVal) : defaultVal; });
  return obj;
};

// Check if a color is dark based on hex luminance
const isDarkColor = (colorId, library) => {
  const colorObj = (library?.availableColors || []).find(c => c.id === colorId);
  if (!colorObj?.hex) return colorId === 'black'; // fallback
  const hex = colorObj.hex;
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  return (0.299*r + 0.587*g + 0.114*b) < 0.5;
};

const getColorName = (colorId, library, lang) => {
  const colors = getAvailableColors(library);
  const c = colors.find(col => col.id === colorId);
  if (!c) return colorId;
  return lang === 'ro' ? (c.nameRo || c.nameEn || c.name || colorId) : (c.nameEn || c.name || colorId);
};

// Default library data - will be overridden by localStorage
const DEFAULT_LIBRARY = {
  systemId: 'bticino',
  systemName: 'BTicino Living Now',
  availableColors: [
    { id: 'white', name: 'White', nameEn: 'White', nameRo: 'Alb', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', nameEn: 'Black', nameRo: 'Negru', hex: '#1a1a1a' },
  ],
  availableSizes: [2, 3, 4, 6],
  wallBoxesMasonry: {
    2: { sku: '504E', purchasePrice: 10, markup: 25, price: 15.13 },
    3: { sku: '506E', purchasePrice: 12, markup: 25, price: 18.15 },
    4: { sku: '508E', purchasePrice: 15, markup: 25, price: 22.69 },
    6: { sku: '510E', purchasePrice: 19, markup: 25, price: 28.74 },
  },
  wallBoxesDrywall: {
    2: { sku: 'PB504', purchasePrice: 12, markup: 25, price: 18.15 },
    3: { sku: 'PB506', purchasePrice: 14, markup: 25, price: 21.18 },
    4: { sku: 'PB508', purchasePrice: 17, markup: 25, price: 25.71 },
    6: { sku: 'PB510', purchasePrice: 22, markup: 25, price: 33.28 },
  },
  installFaces: {
    2: { sku: 'KG2202', purchasePrice: 7, markup: 25, price: 10.59 },
    3: { sku: 'KG2203', purchasePrice: 8, markup: 25, price: 12.1 },
    4: { sku: 'KG2204', purchasePrice: 10, markup: 25, price: 15.13 },
    6: { sku: 'KG2206', purchasePrice: 14, markup: 25, price: 21.18 },
  },
  decorFaces: {
    '2-white': { sku: 'KA4802M2', purchasePrice: 10, markup: 25, price: 15.13 }, 
    '2-black': { sku: 'KG4802M2', purchasePrice: 12, markup: 25, price: 18.15 },
    '3-white': { sku: 'KA4802M3', purchasePrice: 12, markup: 25, price: 18.15 }, 
    '3-black': { sku: 'KG4802M3', purchasePrice: 15, markup: 25, price: 22.69 },
    '4-white': { sku: 'KA4802M4', purchasePrice: 15, markup: 25, price: 22.69 }, 
    '4-black': { sku: 'KG4802M4', purchasePrice: 18, markup: 25, price: 27.23 },
    '6-white': { sku: 'KA4802M6', purchasePrice: 19, markup: 25, price: 28.74 }, 
    '6-black': { sku: 'KG4802M6', purchasePrice: 22, markup: 25, price: 33.28 },
  },
  modules: [
    { 
      id: 'schuko',
      standardType: 'schuko',
      moduleHasColorVariants: true,
      faceHasColorVariants: true,
      moduleSku: { white: 'K4802', black: 'KG4802' },
      nameEn: 'Schuko Outlet',
      nameRo: 'Priză Schuko',
      size: 2, 
      category: 'outlet',
      faceSku: { white: 'KW4702', black: 'KG4702' },
      modulePurchasePrice: { white: 30, black: 32 },
      moduleMarkup: { white: 25, black: 25 },
      modulePrice: { white: 45.38, black: 48.4 },
      facePurchasePrice: { white: 5, black: 7 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 7.56, black: 10.59 },
    },
    { 
      id: 'italian',
      standardType: 'italian',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4801',
      nameEn: 'Italian Outlet',
      nameRo: 'Priză Italiană',
      size: 1, 
      category: 'outlet',
      faceSku: { white: 'KW4701', black: 'KG4701' },
      modulePurchasePrice: 24,
      moduleMarkup: 25,
      modulePrice: 36.3,
      facePurchasePrice: { white: 4, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 6.05, black: 7.56 },
    },
    { 
      id: 'usb',
      standardType: 'usb',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4285C2',
      nameEn: 'USB Outlet',
      nameRo: 'Priză USB',
      size: 1, 
      category: 'outlet',
      faceSku: { white: 'KW4285', black: 'KG4285' },
      modulePurchasePrice: 44,
      moduleMarkup: 25,
      modulePrice: 66.55,
      facePurchasePrice: { white: 4, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 6.05, black: 7.56 },
    },
    { 
      id: 'switch_simple',
      standardType: 'switch_simple',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4001AS',
      nameEn: 'Simple Switch',
      nameRo: 'Întrerupător Simplu',
      size: 1, 
      category: 'switch',
      faceSku: { white: 'KW01', black: 'KG01' },
      modulePurchasePrice: 19,
      moduleMarkup: 25,
      modulePrice: 28.74,
      facePurchasePrice: { white: 3, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 4.54, black: 7.56 },
    },
    { 
      id: 'switch_stair',
      standardType: 'switch_stair',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4003AS',
      nameEn: 'Stair Switch',
      nameRo: 'Întrerupător Cap Scară',
      size: 1, 
      category: 'switch',
      faceSku: { white: 'KW01', black: 'KG01' },
      modulePurchasePrice: 22,
      moduleMarkup: 25,
      modulePrice: 33.28,
      facePurchasePrice: { white: 3, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 4.54, black: 7.56 },
    },
    { 
      id: 'switch_cross',
      standardType: 'switch_cross',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4004AS',
      nameEn: 'Cross Switch',
      nameRo: 'Întrerupător Cap Cruce',
      size: 1, 
      category: 'switch',
      faceSku: { white: 'KW01', black: 'KG01' },
      modulePurchasePrice: 26,
      moduleMarkup: 25,
      modulePrice: 39.33,
      facePurchasePrice: { white: 3, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 4.54, black: 7.56 },
    },
    { 
      id: 'dimmer',
      standardType: 'dimmer',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'K4401',
      nameEn: 'Dimmer / Potentiometer',
      nameRo: 'Potențiometru',
      size: 2, 
      category: 'switch',
      faceSku: { white: 'KW4401', black: 'KG4401' },
      modulePurchasePrice: 58,
      moduleMarkup: 25,
      modulePrice: 87.73,
      facePurchasePrice: { white: 7, black: 8 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 10.59, black: 12.1 },
    },
    { 
      id: 'blank',
      standardType: 'blank',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: 'KW01M',
      nameEn: 'Blank Cover',
      nameRo: 'Tastă Falsă',
      size: 1, 
      category: 'other',
      faceSku: { white: 'KW01', black: 'KG01' },
      modulePurchasePrice: 3,
      moduleMarkup: 25,
      modulePrice: 4.54,
      facePurchasePrice: { white: 3, black: 5 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 4.54, black: 7.56 },
    },
  ],
  presets: [
    {
      id: 'double_schuko',
      nameEn: 'Double Schuko Outlet',
      nameRo: 'Priză Dublă Schuko',
      type: 'outlet',
      size: 4,
      modules: ['schuko', 'schuko'],
    },
    {
      id: 'single_schuko',
      nameEn: 'Single Schuko Outlet',
      nameRo: 'Priză Simplă Schuko',
      type: 'outlet',
      size: 2,
      modules: ['schuko'],
    },
    {
      id: 'schuko_usb',
      nameEn: 'Schuko + USB',
      nameRo: 'Schuko + USB',
      type: 'outlet',
      size: 3,
      modules: ['schuko', 'usb'],
    },
    {
      id: 'double_switch',
      nameEn: 'Double Switch',
      nameRo: 'Întrerupător Dublu',
      type: 'switch',
      size: 2,
      modules: ['switch_simple', 'switch_simple'],
    },
    {
      id: 'single_switch',
      nameEn: 'Single Switch',
      nameRo: 'Întrerupător Simplu',
      type: 'switch',
      size: 2,
      modules: ['switch_simple', 'blank'],
    },
    {
      id: 'triple_switch',
      nameEn: 'Triple Switch',
      nameRo: 'Întrerupător Triplu',
      type: 'switch',
      size: 3,
      modules: ['switch_simple', 'switch_simple', 'switch_simple'],
    },
    {
      id: 'stair_switch',
      nameEn: 'Stair Switch (Cap-Scară)',
      nameRo: 'Întrerupător Cap Scară',
      type: 'switch',
      size: 2,
      modules: ['switch_stair', 'blank'],
    },
    {
      id: 'dimmer_single',
      nameEn: 'Dimmer',
      nameRo: 'Variator (Dimmer)',
      type: 'switch',
      size: 2,
      modules: ['dimmer'],
    },
  ],
};

// Gewiss Chorus default library
const DEFAULT_LIBRARY_GEWISS = {
  systemId: 'gewiss',
  systemName: 'Gewiss Chorus',
  availableColors: [
    { id: 'white', name: 'White', nameEn: 'White', nameRo: 'Alb', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', nameEn: 'Black', nameRo: 'Negru', hex: '#333333' },
    { id: 'titanium', name: 'Titanium', nameEn: 'Titanium', nameRo: 'Titan', hex: '#8C8C8C' },
  ],
  availableSizes: [2, 3, 4, 6],
  wallBoxesMasonry: {
    2: { sku: 'GW24402', purchasePrice: 8, markup: 25, price: 12.1 },
    3: { sku: 'GW24403', purchasePrice: 10, markup: 25, price: 15.13 },
    4: { sku: 'GW24404', purchasePrice: 13, markup: 25, price: 19.66 },
    6: { sku: 'GW24406', purchasePrice: 17, markup: 25, price: 25.71 },
  },
  wallBoxesDrywall: {
    2: { sku: 'GW24402PM', purchasePrice: 10, markup: 25, price: 15.13 },
    3: { sku: 'GW24403PM', purchasePrice: 12, markup: 25, price: 18.15 },
    4: { sku: 'GW24404PM', purchasePrice: 15, markup: 25, price: 22.69 },
    6: { sku: 'GW24406PM', purchasePrice: 20, markup: 25, price: 30.25 },
  },
  installFaces: {
    2: { sku: 'GW16822', purchasePrice: 5, markup: 25, price: 7.56 },
    3: { sku: 'GW16823', purchasePrice: 6, markup: 25, price: 9.08 },
    4: { sku: 'GW16824', purchasePrice: 8, markup: 25, price: 12.1 },
    6: { sku: 'GW16826', purchasePrice: 11, markup: 25, price: 16.64 },
  },
  decorFaces: {
    '2-white': { sku: 'GW16102TB', purchasePrice: 8, markup: 25, price: 12.1 },
    '2-black': { sku: 'GW16102TN', purchasePrice: 10, markup: 25, price: 15.13 },
    '2-titanium': { sku: 'GW16102VT', purchasePrice: 10, markup: 25, price: 15.13 },
    '3-white': { sku: 'GW16103TB', purchasePrice: 10, markup: 25, price: 15.13 },
    '3-black': { sku: 'GW16103TN', purchasePrice: 12, markup: 25, price: 18.15 },
    '3-titanium': { sku: 'GW16103VT', purchasePrice: 12, markup: 25, price: 18.15 },
    '4-white': { sku: 'GW16104TB', purchasePrice: 12, markup: 25, price: 18.15 },
    '4-black': { sku: 'GW16104TN', purchasePrice: 15, markup: 25, price: 22.69 },
    '4-titanium': { sku: 'GW16104VT', purchasePrice: 15, markup: 25, price: 22.69 },
    '6-white': { sku: 'GW16106TB', purchasePrice: 16, markup: 25, price: 24.2 },
    '6-black': { sku: 'GW16106TN', purchasePrice: 19, markup: 25, price: 28.74 },
    '6-titanium': { sku: 'GW16106VT', purchasePrice: 19, markup: 25, price: 28.74 },
  },
  modules: [
    { id: 'schuko', standardType: 'schuko', hasColorVariants: false, moduleSku: 'GW10241', nameEn: 'Schuko Outlet', nameRo: 'Priză Schuko', size: 2, category: 'outlet', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 18, moduleMarkup: 25, modulePrice: 27.23, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'italian', standardType: 'italian', hasColorVariants: false, moduleSku: 'GW10203', nameEn: 'Italian Outlet (Bivalent)', nameRo: 'Priză Bivalentă', size: 1, category: 'outlet', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 12, moduleMarkup: 25, modulePrice: 18.15, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'usb', standardType: 'usb', hasColorVariants: false, moduleSku: 'GW10449', nameEn: 'USB Outlet (A+C)', nameRo: 'Priză USB (A+C)', size: 1, category: 'outlet', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 45, moduleMarkup: 25, modulePrice: 68.06, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'switch_simple', standardType: 'switch_simple', hasColorVariants: false, moduleSku: 'GW10001', nameEn: 'Simple Switch', nameRo: 'Întrerupător Simplu', size: 1, category: 'switch', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 10, moduleMarkup: 25, modulePrice: 15.13, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'switch_stair', standardType: 'switch_stair', hasColorVariants: false, moduleSku: 'GW10071', nameEn: 'Stair Switch', nameRo: 'Întrerupător Cap Scară', size: 2, category: 'switch', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 14, moduleMarkup: 25, modulePrice: 21.18, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'switch_cross', standardType: 'switch_cross', hasColorVariants: false, moduleSku: 'GW10101', nameEn: 'Cross Switch', nameRo: 'Întrerupător Cap Cruce', size: 2, category: 'switch', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 18, moduleMarkup: 25, modulePrice: 27.23, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'dimmer', standardType: 'dimmer', hasColorVariants: false, moduleSku: 'GW10673', nameEn: 'Dimmer (LED)', nameRo: 'Variator (Dimmer LED)', size: 1, category: 'switch', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 55, moduleMarkup: 25, modulePrice: 83.19, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'blank', standardType: 'blank', hasColorVariants: false, moduleSku: 'GW10195', nameEn: 'Blank Cover', nameRo: 'Obturator', size: 1, category: 'other', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 3, moduleMarkup: 25, modulePrice: 4.54, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'coax', standardType: 'coax', hasColorVariants: false, moduleSku: 'GW10361', nameEn: 'TV Coaxial Outlet', nameRo: 'Priză TV Coaxial', size: 1, category: 'outlet', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 20, moduleMarkup: 25, modulePrice: 30.25, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
    { id: 'rj45', standardType: 'rj45', hasColorVariants: false, moduleSku: 'GW10421', nameEn: 'RJ45 Cat.5e UTP', nameRo: 'Priză RJ45 Cat.5e UTP', size: 1, category: 'outlet', faceSku: { white: '', black: '', titanium: '' }, modulePurchasePrice: 22, moduleMarkup: 25, modulePrice: 33.28, facePurchasePrice: { white: 0, black: 0, titanium: 0 }, faceMarkup: { white: 25, black: 25, titanium: 25 }, facePrice: { white: 0, black: 0, titanium: 0 } },
  ],
  presets: [
    { id: 'double_schuko', nameEn: 'Double Schuko Outlet', nameRo: 'Priză Dublă Schuko', type: 'outlet', size: 4, modules: ['schuko', 'schuko'] },
    { id: 'single_schuko', nameEn: 'Single Schuko Outlet', nameRo: 'Priză Simplă Schuko', type: 'outlet', size: 2, modules: ['schuko'] },
    { id: 'schuko_usb', nameEn: 'Schuko + USB', nameRo: 'Schuko + USB', type: 'outlet', size: 3, modules: ['schuko', 'usb'] },
    { id: 'double_switch', nameEn: 'Double Switch', nameRo: 'Întrerupător Dublu', type: 'switch', size: 2, modules: ['switch_simple', 'switch_simple'] },
    { id: 'single_switch', nameEn: 'Single Switch', nameRo: 'Întrerupător Simplu', type: 'switch', size: 2, modules: ['switch_simple', 'blank'] },
    { id: 'triple_switch', nameEn: 'Triple Switch', nameRo: 'Întrerupător Triplu', type: 'switch', size: 3, modules: ['switch_simple', 'switch_simple', 'switch_simple'] },
  ],
};

// Schneider Noua Unica default library
const DEFAULT_LIBRARY_SCHNEIDER = {
  systemId: 'schneider',
  systemName: 'Schneider Noua Unica',
  availableColors: [
    { id: 'white', name: 'White', nameEn: 'White', nameRo: 'Alb', hex: '#FFFFFF' },
    { id: 'anthracite', name: 'Anthracite', nameEn: 'Anthracite', nameRo: 'Antracit', hex: '#383838' },
  ],
  availableSizes: [2, 3, 4, 6],
  wallBoxesMasonry: {
    2: { sku: 'NU7002', purchasePrice: 8, markup: 25, price: 12.1 },
    3: { sku: 'NU7003', purchasePrice: 10, markup: 25, price: 15.13 },
    4: { sku: 'NU7004', purchasePrice: 13, markup: 25, price: 19.66 },
    6: { sku: 'NU7006', purchasePrice: 17, markup: 25, price: 25.71 },
  },
  wallBoxesDrywall: {
    2: { sku: 'NU7002P', purchasePrice: 10, markup: 25, price: 15.13 },
    3: { sku: 'NU7003P', purchasePrice: 12, markup: 25, price: 18.15 },
    4: { sku: 'NU7004P', purchasePrice: 15, markup: 25, price: 22.69 },
    6: { sku: 'NU7006P', purchasePrice: 20, markup: 25, price: 30.25 },
  },
  installFaces: {
    2: { sku: 'NU7102', purchasePrice: 5, markup: 25, price: 7.56 },
    3: { sku: 'NU7103P', purchasePrice: 6, markup: 25, price: 9.08 },
    4: { sku: 'NU7104P', purchasePrice: 8, markup: 25, price: 12.1 },
    6: { sku: 'NU7106P', purchasePrice: 11, markup: 25, price: 16.64 },
  },
  decorFaces: {
    '2-white': { sku: 'NU200218', purchasePrice: 8, markup: 25, price: 12.1 },
    '2-anthracite': { sku: 'NU200254', purchasePrice: 10, markup: 25, price: 15.13 },
    '3-white': { sku: 'NU200318', purchasePrice: 10, markup: 25, price: 15.13 },
    '3-anthracite': { sku: 'NU200354', purchasePrice: 12, markup: 25, price: 18.15 },
    '4-white': { sku: 'NU200418', purchasePrice: 12, markup: 25, price: 18.15 },
    '4-anthracite': { sku: 'NU200454', purchasePrice: 15, markup: 25, price: 22.69 },
    '6-white': { sku: 'NU200618', purchasePrice: 16, markup: 25, price: 24.2 },
    '6-anthracite': { sku: 'NU200654', purchasePrice: 19, markup: 25, price: 28.74 },
  },
  modules: [
    { id: 'schuko', standardType: 'schuko', hasColorVariants: false, moduleSku: 'NU303618', nameEn: 'Schuko Outlet 2P+E', nameRo: 'Priză Schuko 2P+E', size: 2, category: 'outlet', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 20, moduleMarkup: 25, modulePrice: 30.25, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'italian', standardType: 'italian', hasColorVariants: false, moduleSku: 'NU303118', nameEn: 'Simple Outlet 2P', nameRo: 'Priză Simplă 2P', size: 1, category: 'outlet', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 10, moduleMarkup: 25, modulePrice: 15.13, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'usb', standardType: 'usb', hasColorVariants: false, moduleSku: 'NU301818', nameEn: 'USB Outlet A+C', nameRo: 'Priză USB A+C', size: 2, category: 'outlet', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 50, moduleMarkup: 25, modulePrice: 75.63, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'switch_simple', standardType: 'switch_simple', hasColorVariants: false, moduleSku: 'NU310118', nameEn: 'Simple Switch 1M', nameRo: 'Întrerupător Simplu 1M', size: 1, category: 'switch', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 12, moduleMarkup: 25, modulePrice: 18.15, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'switch_stair', standardType: 'switch_stair', hasColorVariants: false, moduleSku: 'NU310318', nameEn: 'Stair Switch 1M', nameRo: 'Întrerupător Cap Scară 1M', size: 1, category: 'switch', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 14, moduleMarkup: 25, modulePrice: 21.18, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'switch_cross', standardType: 'switch_cross', hasColorVariants: false, moduleSku: 'NU320518', nameEn: 'Cross Switch 2M', nameRo: 'Întrerupător Cap Cruce 2M', size: 2, category: 'switch', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 18, moduleMarkup: 25, modulePrice: 27.23, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'dimmer', standardType: 'dimmer', hasColorVariants: false, moduleSku: 'NU351418', nameEn: 'LED Dimmer 2M', nameRo: 'Variator LED 2M', size: 2, category: 'switch', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 60, moduleMarkup: 25, modulePrice: 90.75, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
    { id: 'blank', standardType: 'blank', hasColorVariants: false, moduleSku: 'NU986518', nameEn: 'Blank Cover', nameRo: 'Tastă Falsă', size: 1, category: 'other', faceSku: { white: '', anthracite: '' }, modulePurchasePrice: 3, moduleMarkup: 25, modulePrice: 4.54, facePurchasePrice: { white: 0, anthracite: 0 }, faceMarkup: { white: 25, anthracite: 25 }, facePrice: { white: 0, anthracite: 0 } },
  ],
  presets: [
    { id: 'double_schuko', nameEn: 'Double Schuko Outlet', nameRo: 'Priză Dublă Schuko', type: 'outlet', size: 4, modules: ['schuko', 'schuko'] },
    { id: 'single_schuko', nameEn: 'Single Schuko Outlet', nameRo: 'Priză Simplă Schuko', type: 'outlet', size: 2, modules: ['schuko'] },
    { id: 'double_switch', nameEn: 'Double Switch', nameRo: 'Întrerupător Dublu', type: 'switch', size: 2, modules: ['switch_simple', 'switch_simple'] },
    { id: 'single_switch', nameEn: 'Single Switch', nameRo: 'Întrerupător Simplu', type: 'switch', size: 2, modules: ['switch_simple', 'blank'] },
  ],
};

const DEFAULT_LIBRARIES = {
  bticino: DEFAULT_LIBRARY,
  gewiss: DEFAULT_LIBRARY_GEWISS,
  schneider: DEFAULT_LIBRARY_SCHNEIDER,
};

// Library storage functions
const LIBRARY_KEY = 'bticino-library';

const loadLibrary = () => {
  try {
    const stored = localStorage.getItem(LIBRARY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migrate old wallBoxes to new structure if needed
      let wallBoxesMasonry = parsed.wallBoxesMasonry;
      let wallBoxesDrywall = parsed.wallBoxesDrywall;
      
      // If old format exists, migrate it
      if (parsed.wallBoxes && !parsed.wallBoxesMasonry) {
        wallBoxesMasonry = parsed.wallBoxes;
        wallBoxesDrywall = DEFAULT_LIBRARY.wallBoxesDrywall;
      }
      
      return {
        systemId: parsed.systemId || DEFAULT_LIBRARY.systemId,
        systemName: parsed.systemName || DEFAULT_LIBRARY.systemName,
        availableColors: parsed.availableColors || DEFAULT_LIBRARY.availableColors,
        availableSizes: parsed.availableSizes || DEFAULT_LIBRARY.availableSizes,
        wallBoxesMasonry: { ...DEFAULT_LIBRARY.wallBoxesMasonry, ...wallBoxesMasonry },
        wallBoxesDrywall: { ...DEFAULT_LIBRARY.wallBoxesDrywall, ...wallBoxesDrywall },
        installFaces: { ...DEFAULT_LIBRARY.installFaces, ...parsed.installFaces },
        decorFaces: { ...DEFAULT_LIBRARY.decorFaces, ...parsed.decorFaces },
        modules: parsed.modules || DEFAULT_LIBRARY.modules,
        presets: parsed.presets || DEFAULT_LIBRARY.presets,
      };
    }
  } catch (e) {
    console.error('Failed to load library:', e);
  }
  return DEFAULT_LIBRARY;
};

const saveLibrary = (library) => {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save library:', e);
  }
};

// Price calculation helpers
const VAT_RATE = 0.21;

// Calculate selling price with VAT from purchase price and markup
const calcPriceWithVat = (purchasePrice, markup) => {
  const sellingWithoutVat = purchasePrice * (1 + (markup / 100));
  return sellingWithoutVat * (1 + VAT_RATE);
};

// Calculate markup from purchase price and selling price with VAT
const calcMarkupFromPriceWithVat = (purchasePrice, priceWithVat) => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
  return ((sellingWithoutVat / purchasePrice) - 1) * 100;
};

// Calculate markup from purchase price and selling price without VAT
const calcMarkupFromPriceWithoutVat = (purchasePrice, priceWithoutVat) => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  return ((priceWithoutVat / purchasePrice) - 1) * 100;
};

// Calculate selling price without VAT from price with VAT
const calcPriceWithoutVat = (priceWithVat) => priceWithVat / (1 + VAT_RATE);

// Calculate selling price with VAT from price without VAT
const calcPriceWithVatFromWithout = (priceWithoutVat) => priceWithoutVat * (1 + VAT_RATE);

// Reusable price input component that doesn't format while typing
const PriceInput = ({ value, onChange, step = "0.01", className = "", decimals = 2 }) => {
  const [localValue, setLocalValue] = useState(value.toFixed(decimals));
  const [isFocused, setIsFocused] = useState(false);
  
  // Update local value when external value changes (but not while focused)
  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(decimals));
    }
  }, [value, isFocused, decimals]);
  
  return (
    <input
      type="number"
      step={step}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        const parsed = parseFloat(e.target.value);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed)) {
          setLocalValue(parsed.toFixed(decimals));
        }
      }}
      className={className}
    />
  );
};

// Create a context for library data
const LibraryContext = React.createContext(null);

// ============================================================================
// SKU LOOKUP FUNCTIONS (now use library context)
// ============================================================================

const getWallBoxSku = (size, wallBoxType, library) => {
  if (wallBoxType === 'drywall') {
    return library?.wallBoxesDrywall?.[size]?.sku || '';
  }
  return library?.wallBoxesMasonry?.[size]?.sku || '';
};
const getInstallFaceSku = (size, library) => library?.installFaces?.[size]?.sku || '';
const getDecorFaceSku = (size, color, library) => library?.decorFaces?.[`${size}-${color}`]?.sku || '';

// Module lookup by ID (id is the stable identifier, moduleSku varies by color)
const getModuleById = (moduleId, library) => {
  return library?.modules?.find(m => m.id === moduleId);
};

// Get module SKU for specific color
const getModuleSku = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return '';
  if (typeof mod.moduleSku === 'string') return mod.moduleSku;
  if (typeof mod.moduleSku === 'object') return mod.moduleSku?.[color] || Object.values(mod.moduleSku)[0] || '';
  return '';
};

// Get module face SKU
const getModuleFaceSku = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return '';
  if (typeof mod.faceSku === 'string') return mod.faceSku;
  if (typeof mod.faceSku === 'object') return mod.faceSku?.[color] || Object.values(mod.faceSku)[0] || '';
  return '';
};

// Price lookup functions
const getWallBoxPrice = (size, wallBoxType, library) => {
  if (wallBoxType === 'drywall') {
    return library?.wallBoxesDrywall?.[size]?.price || 0;
  }
  return library?.wallBoxesMasonry?.[size]?.price || 0;
};
const getInstallFacePrice = (size, library) => library?.installFaces?.[size]?.price || 0;
const getDecorFacePrice = (size, color, library) => library?.decorFaces?.[`${size}-${color}`]?.price || 0;

// Get module price for specific color
const getModulePrice = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return 0;
  if (typeof mod.modulePrice === 'number') return mod.modulePrice;
  if (typeof mod.modulePrice === 'object') return mod.modulePrice?.[color] || Object.values(mod.modulePrice)[0] || 0;
  return 0;
};

// Get module face price
const getModuleFacePrice = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  if (!mod) return 0;
  if (typeof mod.facePrice === 'number') return mod.facePrice;
  if (typeof mod.facePrice === 'object') return mod.facePrice?.[color] || Object.values(mod.facePrice)[0] || 0;
  return 0;
};

// Helper to get translated module name based on language
// Now uses nameEn/nameRo fields stored in module
const getModuleName = (mod, lang) => {
  if (!mod) return '';
  if (lang === 'ro') {
    return mod.nameRo || mod.nameEn || '';
  }
  return mod.nameEn || '';
};

// Helper to get MODULE_CATALOG from library
const getModuleCatalog = (library) => library?.modules || [];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateAssemblyCode = (assemblies, type) => {
  const prefix = type === 'outlet' ? 'P' : 'I';
  const existing = assemblies
    .filter(a => a.type === type)
    .map(a => parseInt(a.code.slice(1)))
    .filter(n => !isNaN(n));
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(2, '0')}`;
};

// Renumber assemblies of a given type sequentially
const renumberAssemblies = (assemblies, type) => {
  const prefix = type === 'outlet' ? 'P' : 'I';
  let counter = 1;
  return assemblies.map(a => {
    if (a.type === type) {
      return { ...a, code: `${prefix}${String(counter++).padStart(2, '0')}` };
    }
    return a;
  });
};

// Move assembly to a new position (0-indexed within its type)
const reorderAssembly = (assemblies, assemblyId, newIndex, type) => {
  const typeAssemblies = assemblies.filter(a => a.type === type);
  const otherAssemblies = assemblies.filter(a => a.type !== type);
  
  const currentIndex = typeAssemblies.findIndex(a => a.id === assemblyId);
  if (currentIndex === -1 || currentIndex === newIndex) return assemblies;
  
  // Remove from current position
  const [moved] = typeAssemblies.splice(currentIndex, 1);
  // Insert at new position
  typeAssemblies.splice(newIndex, 0, moved);
  
  // Combine and renumber
  const combined = [...otherAssemblies, ...typeAssemblies];
  return renumberAssemblies(combined, type);
};

const calculateModulesSize = (modules, library) => {
  const catalog = getModuleCatalog(library);
  return modules.reduce((sum, m) => {
    const catalogItem = catalog.find(c => c.id === m.moduleId);
    return sum + (catalogItem?.size || 0);
  }, 0);
};

// ============================================================================
// DATA FACTORIES
// ============================================================================

const createAssembly = (type, code, room = '', library = null) => ({
  id: generateId(),
  type,
  code,
  room,
  size: 2,
  color: library?.availableColors?.[0]?.id || 'white',
  wallBoxType: 'masonry',
  modules: [],
});

// Module instance now stores moduleId (stable) instead of moduleSku (color-dependent)
const createModuleInstance = (moduleId) => ({
  id: generateId(),
  moduleId,
});

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'bticino-configurator-data';

const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { projects: [] };
  } catch {
    return { projects: [] };
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// ============================================================================
// COMPONENTS
// ============================================================================

// --- Language Switcher ---
function LanguageSwitcher() {
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

// --- Project List ---
function ProjectList({ projects, onSelect, onCreate, onDelete, onOpenLibrary }) {
  const [newName, setNewName] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newSystem, setNewSystem] = useState('bticino');
  const t = useTranslation();
  const lang = useLanguage();

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim(), newClient.trim(), newSystem);
      setNewName('');
      setNewClient('');
      setNewSystem('bticino');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="w-6 h-6" />
          {t.configurator}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLibrary}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" /> {t.library}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">{t.createNewProject}</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder={t.projectName}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border rounded px-3 py-2 flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <input
            type="text"
            placeholder={t.clientName}
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            className="border rounded px-3 py-2 flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <select
            value={newSystem}
            onChange={(e) => setNewSystem(e.target.value)}
            className="border rounded px-3 py-2 min-w-[180px] bg-white"
            title={t.selectSystem}
          >
            {SYSTEMS.map(sys => (
              <option key={sys.id} value={sys.id}>{lang === 'ro' ? sys.nameRo : sys.nameEn}</option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> {t.create}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="font-semibold p-4 border-b">{t.projects}</h2>
        {projects.length === 0 ? (
          <p className="p-4 text-gray-500">{t.noProjects}</p>
        ) : (
          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelect(project)}
                >
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                    <span>{project.clientName || t.noClient}</span>
                    <span>·</span>
                    <span>{project.assemblies.length} {t.assemblies}</span>
                    {project.system && (
                      <>
                        <span>·</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">{getSystemName(project.system, lang)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDelete(project.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Project Detail ---
function ProjectDetail({ project, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('outlets');
  const [editingAssembly, setEditingAssembly] = useState(null);
  const [showPresetDialog, setShowPresetDialog] = useState(null); // 'outlet' or 'switch' or null
  const [editingProject, setEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editClientName, setEditClientName] = useState(project.clientName || '');
  const [editProjectSystem, setEditProjectSystem] = useState(project.system || 'bticino');
  const [confirmDuplicateId, setConfirmDuplicateId] = useState(null);
  const [duplicateTimestamps, setDuplicateTimestamps] = useState([]);
  const [showAiImport, setShowAiImport] = useState(false);
  const [aiImportFile, setAiImportFile] = useState(null);
  const [aiImportColor, setAiImportColor] = useState(null);
  const [aiImportWallBox, setAiImportWallBox] = useState('masonry');
  const [aiImportLoading, setAiImportLoading] = useState(false);
  const [aiImportResult, setAiImportResult] = useState(null);
  const t = useTranslation();
  const lang = useLanguage();
  const library = React.useContext(LibraryContext);

  const outlets = project.assemblies.filter(a => a.type === 'outlet');
  const switches = project.assemblies.filter(a => a.type === 'switch');

  const saveProjectDetails = () => {
    onUpdate({
      ...project,
      name: editProjectName.trim() || project.name,
      clientName: editClientName.trim(),
      system: editProjectSystem,
    });
    setEditingProject(false);
  };

  const cancelProjectEdit = () => {
    setEditProjectName(project.name);
    setEditClientName(project.clientName || '');
    setEditProjectSystem(project.system || 'bticino');
    setEditingProject(false);
  };

  const addAssembly = (type, presetId = null) => {
    const code = generateAssemblyCode(project.assemblies, type);
    let assembly = createAssembly(type, code, '', library);
    
    // If preset selected, apply it
    if (presetId && library?.presets) {
      const preset = library.presets.find(p => p.id === presetId);
      if (preset) {
        assembly.size = preset.size;
        assembly.modules = preset.modules.map(moduleId => createModuleInstance(moduleId));
      }
    }
    
    onUpdate({
      ...project,
      assemblies: [...project.assemblies, assembly],
    });
    setShowPresetDialog(null);
  };

  const handleAddClick = (type) => {
    setShowPresetDialog(type);
  };

  const updateAssembly = (updated) => {
    onUpdate({
      ...project,
      assemblies: project.assemblies.map(a => a.id === updated.id ? updated : a),
    });
  };

  const deleteAssembly = (id) => {
    onUpdate({
      ...project,
      assemblies: project.assemblies.filter(a => a.id !== id),
    });
  };

  const duplicateAssembly = (assemblyId) => {
    // Rate limit: max 5 duplicates in 30 seconds
    const now = Date.now();
    const recent = duplicateTimestamps.filter(ts => now - ts < 30000);
    if (recent.length >= 5) {
      return; // silently block
    }

    const source = project.assemblies.find(a => a.id === assemblyId);
    if (!source) return;
    
    const code = generateAssemblyCode(project.assemblies, source.type);
    const duplicate = {
      ...source,
      id: generateId(),
      code,
      modules: source.modules.map(m => ({
        ...m,
        id: generateId(),
      })),
    };
    
    setDuplicateTimestamps([...recent, now]);
    setConfirmDuplicateId(null);
    
    onUpdate({
      ...project,
      assemblies: [...project.assemblies, duplicate],
    });
  };

  const requestDuplicate = (assemblyId) => {
    setConfirmDuplicateId(assemblyId);
  };

  const cancelDuplicate = () => {
    setConfirmDuplicateId(null);
  };

  const handleAiImport = async () => {
    if (!aiImportFile) return;
    
    setAiImportLoading(true);
    setAiImportResult(null);
    
    try {
      // Convert PDF to base64
      const buffer = await aiImportFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const pdfBase64 = btoa(binary);
      
      // Build module catalog for the prompt
      const moduleCatalog = (library?.modules || []).map(m => ({
        id: m.id,
        nameEn: m.nameEn,
        nameRo: m.nameRo,
        size: m.size,
        category: m.category,
      }));
      
      // Get fresh session token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !freshSession) {
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        if (!fallbackSession) {
          setAiImportResult({ error: 'Not authenticated' });
          setAiImportLoading(false);
          return;
        }
        var accessToken = fallbackSession.access_token;
      } else {
        var accessToken = freshSession.access_token;
      }
      
      // Call Edge Function
      const response = await fetch(
        `${supabaseUrl}/functions/v1/parse-necesar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': supabaseAnonKeyLegacy,
          },
          body: JSON.stringify({
            pdfBase64,
            modules: moduleCatalog,
            system: library?.systemName || getSystemName(project?.system, 'en'),
          }),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        setAiImportResult({ error: result.error || t.aiImportError });
        setAiImportLoading(false);
        return;
      }
      
      // Create assemblies from AI result
      const newAssemblies = [];
      let outletCount = project.assemblies.filter(a => a.type === 'outlet').length;
      let switchCount = project.assemblies.filter(a => a.type === 'switch').length;
      
      (result.assemblies || []).forEach(item => {
        const type = item.type === 'switch' ? 'switch' : 'outlet';
        const prefix = type === 'outlet' ? 'P' : 'I';
        const num = type === 'outlet' ? ++outletCount : ++switchCount;
        const code = `${prefix}${String(num).padStart(2, '0')}`;
        
        const assembly = {
          id: generateId(),
          type,
          code,
          room: item.room || '',
          size: item.size || 2,
          color: aiImportColor,
          wallBoxType: aiImportWallBox,
          modules: (item.modules || []).map(moduleId => ({
            id: generateId(),
            moduleId,
          })),
        };
        
        newAssemblies.push(assembly);
      });
      
      if (newAssemblies.length > 0) {
        onUpdate({
          ...project,
          assemblies: [...project.assemblies, ...newAssemblies],
        });
      }
      
      setAiImportResult({
        success: true,
        count: newAssemblies.length,
        warnings: result.warnings || [],
        summary: result.summary,
      });
      
      // Close dialog after 3 seconds on success
      setTimeout(() => {
        setShowAiImport(false);
        setAiImportFile(null);
        setAiImportResult(null);
      }, 5000);
      
    } catch (err) {
      console.error('AI Import error:', err);
      setAiImportResult({ error: t.aiImportError });
    }
    
    setAiImportLoading(false);
  };

  const handleReorder = (assemblyId, newIndex, type) => {
    const reordered = reorderAssembly(project.assemblies, assemblyId, newIndex, type);
    onUpdate({
      ...project,
      assemblies: reordered,
    });
  };

  // Collect all unique rooms from the project for suggestions
  const existingRooms = useMemo(() => {
    const rooms = project.assemblies
      .map(a => a.room)
      .filter(r => r && r.trim());
    return [...new Set(rooms)];
  }, [project.assemblies]);

  // Preset selection dialog
  const PresetDialog = ({ type, onSelect, onClose }) => {
    const lang = useLanguage();
    const presets = library?.presets?.filter(p => p.type === type) || [];
    const modules = library?.modules || [];
    
    const getPresetName = (preset) => lang === 'ro' ? preset.nameRo : preset.nameEn;
    const getModuleName = (moduleId) => {
      const mod = modules.find(m => m.id === moduleId);
      if (!mod) return moduleId;
      return lang === 'ro' ? (mod.nameRo || mod.nameEn) : mod.nameEn;
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">{t.selectPreset}</h3>
          </div>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {/* Empty option */}
            <button
              onClick={() => onSelect(null)}
              className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 mb-3 transition-colors"
            >
              <div className="font-medium text-gray-600">{t.emptyAssembly}</div>
              <div className="text-sm text-gray-400">2M · {t.noModules || 'No modules'}</div>
            </button>
            
            {/* Presets */}
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset.id)}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 mb-2 transition-colors"
              >
                <div className="font-medium">{getPresetName(preset)}</div>
                <div className="text-sm text-gray-500">
                  {preset.size}M · {preset.modules.map(m => getModuleName(m)).join(' + ')}
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (editingAssembly) {
    const currentAssembly = project.assemblies.find(a => a.id === editingAssembly.id) || editingAssembly;
    return (
      <AssemblyEditor
        assembly={currentAssembly}
        onBack={() => setEditingAssembly(null)}
        onUpdate={(updated) => {
          updateAssembly(updated);
          setEditingAssembly(updated);
        }}
        existingRooms={existingRooms}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-800"
      >
        <ChevronLeft className="w-4 h-4" /> {t.backToProjects}
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {editingProject ? (
          // Edit mode
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.projectName}</label>
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.clientName}</label>
              <input
                type="text"
                value={editClientName}
                onChange={(e) => setEditClientName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder={t.noClient}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.system}</label>
              <select
                value={editProjectSystem}
                onChange={(e) => setEditProjectSystem(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                {SYSTEMS.map(sys => (
                  <option key={sys.id} value={sys.id}>{lang === 'ro' ? sys.nameRo : sys.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={saveProjectDetails}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t.save}
              </button>
              <button
                onClick={cancelProjectEdit}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          // View mode
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.system && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-200">
                    {getSystemName(project.system, lang)}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{project.clientName || t.noClient}</p>
            </div>
            <button
              onClick={() => setEditingProject(true)}
              className="text-gray-500 hover:text-blue-600 p-2"
              title={t.editProject}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => { setShowAiImport(true); if (!aiImportColor) setAiImportColor(getAvailableColors(library)?.[0]?.id || 'white'); }}
          className="flex items-center gap-1 px-3 py-2 rounded text-sm bg-purple-600 text-white hover:bg-purple-700"
        >
          <Upload className="w-4 h-4" /> {t.aiImport}
        </button>
        <button
          onClick={() => setActiveTab('outlets')}
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
            activeTab === 'outlets' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <Package className="w-4 h-4" /> {t.outlets}
          <span className="bg-white/20 px-1.5 rounded text-xs font-bold">{outlets.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('switches')}
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
            activeTab === 'switches' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" /> {t.switches}
          <span className="bg-white/20 px-1.5 rounded text-xs font-bold">{switches.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
            activeTab === 'boq' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {t.boq}
        </button>
        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
            activeTab === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {t.clientQuote}
        </button>
        <button
          onClick={() => setActiveTab('profit')}
          className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${
            activeTab === 'profit' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {t.profitAnalysis}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'outlets' && (
        <AssemblyList
          assemblies={outlets}
          type="outlet"
          project={project}
          onAdd={() => handleAddClick('outlet')}
          onAddEmpty={() => addAssembly('outlet')}
          onEdit={setEditingAssembly}
          onDelete={deleteAssembly}
          onDuplicate={requestDuplicate}
          onConfirmDuplicate={duplicateAssembly}
          onCancelDuplicate={cancelDuplicate}
          confirmDuplicateId={confirmDuplicateId}
          onReorder={handleReorder}
          onUpdate={updateAssembly}
          existingRooms={existingRooms}
        />
      )}
      {activeTab === 'switches' && (
        <AssemblyList
          assemblies={switches}
          type="switch"
          project={project}
          onAdd={() => handleAddClick('switch')}
          onAddEmpty={() => addAssembly('switch')}
          onEdit={setEditingAssembly}
          onDelete={deleteAssembly}
          onDuplicate={requestDuplicate}
          onConfirmDuplicate={duplicateAssembly}
          onCancelDuplicate={cancelDuplicate}
          confirmDuplicateId={confirmDuplicateId}
          onReorder={handleReorder}
          onUpdate={updateAssembly}
          existingRooms={existingRooms}
        />
      )}
      {activeTab === 'boq' && <BOQView project={project} />}
      {activeTab === 'quote' && <QuoteView project={project} />}
      {activeTab === 'profit' && <ProfitView project={project} />}
      
      {/* Preset Selection Dialog */}
      {showPresetDialog && (
        <PresetDialog
          type={showPresetDialog}
          onSelect={(presetId) => addAssembly(showPresetDialog, presetId)}
          onClose={() => setShowPresetDialog(null)}
        />
      )}

      {/* AI Import Dialog */}
      {showAiImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !aiImportLoading && setShowAiImport(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-600" />
              {t.aiImportTitle}
              {project.system && (
                <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                  {getSystemName(project.system, lang)}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-600 mb-4">{t.aiImportDescription}</p>
            
            {/* File upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.aiImportUpload}</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setAiImportFile(e.target.files?.[0] || null)}
                className="w-full border rounded px-3 py-2 text-sm"
                disabled={aiImportLoading}
              />
            </div>
            
            {/* Color selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.aiImportColor}</label>
              <div className="flex gap-2 flex-wrap">
                {getAvailableColors(library).map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAiImportColor(c.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border ${aiImportColor === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <span className="w-4 h-4 rounded border" style={{ backgroundColor: c.hex }}></span> {getColorName(c.id, library, lang)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Wall box type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.aiImportWallBox}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAiImportWallBox('masonry')}
                  className={`px-3 py-2 rounded border text-sm ${aiImportWallBox === 'masonry' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  {t.masonry}
                </button>
                <button
                  onClick={() => setAiImportWallBox('drywall')}
                  className={`px-3 py-2 rounded border text-sm ${aiImportWallBox === 'drywall' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  {t.drywall}
                </button>
              </div>
            </div>
            
            {/* Result messages */}
            {aiImportResult && (
              <div className={`mb-4 p-3 rounded text-sm ${aiImportResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {aiImportResult.error ? (
                  <p>❌ {aiImportResult.error}</p>
                ) : (
                  <>
                    <p className="font-medium">✅ {aiImportResult.count} {t.aiImportSuccess}</p>
                    {aiImportResult.summary && (
                      <p className="mt-1">{t.outlets}: {aiImportResult.summary.outlets || 0} · {t.switches}: {aiImportResult.summary.switches || 0}</p>
                    )}
                    {aiImportResult.warnings?.length > 0 && (
                      <div className="mt-2 border-t border-yellow-200 pt-2">
                        <p className="font-medium text-yellow-700">⚠️ {t.aiImportWarnings}:</p>
                        {aiImportResult.warnings.map((w, i) => (
                          <p key={i} className="text-yellow-600 text-xs mt-0.5">• {w}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAiImport(false); setAiImportFile(null); setAiImportResult(null); }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                disabled={aiImportLoading}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleAiImport}
                disabled={!aiImportFile || aiImportLoading}
                className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {aiImportLoading ? (
                  <>
                    <span className="animate-spin">⏳</span> {t.aiImportProcessing}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> {t.aiImportStart}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Assembly List ---
function AssemblyList({ assemblies, type, project, onAdd, onAddEmpty, onEdit, onDelete, onDuplicate, onConfirmDuplicate, onCancelDuplicate, confirmDuplicateId, onReorder, onUpdate, existingRooms = [] }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverRoom, setDragOverRoom] = useState(null);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingCodeValue, setEditingCodeValue] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingRoomValue, setEditingRoomValue] = useState('');
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [groupByRoom, setGroupByRoom] = useState(false);

  // Get library and translations from context
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const sortedAssemblies = [...assemblies].sort((a, b) => a.code.localeCompare(b.code));
  const typeName = type === 'outlet' ? t.outlet : t.switch;
  const addLabel = type === 'outlet' ? t.addOutlet : t.addSwitch;
  const noItemsLabel = type === 'outlet' ? t.noOutlets : t.noSwitches;
  const prefix = type === 'outlet' ? 'P' : 'I';

  // Group assemblies by room
  const groupedByRoom = useMemo(() => {
    const groups = {};
    sortedAssemblies.forEach(assembly => {
      const room = assembly.room || t.noRoom;
      if (!groups[room]) {
        groups[room] = [];
      }
      groups[room].push(assembly);
    });
    // Sort rooms alphabetically, but put "No room" at the end
    const sortedRooms = Object.keys(groups).sort((a, b) => {
      if (a === t.noRoom) return 1;
      if (b === t.noRoom) return -1;
      return a.localeCompare(b);
    });
    return { groups, sortedRooms };
  }, [sortedAssemblies, t.noRoom]);

  // Common room suggestions (translated)
  const defaultRooms = [
    t.livingRoom, t.kitchen, `${t.bedroom} 1`, `${t.bedroom} 2`, `${t.bedroom} 3`,
    `${t.bathroom} 1`, `${t.bathroom} 2`, t.hallway, t.entrance, t.office,
    t.diningRoom, t.garage, t.laundry, t.storage, t.balcony
  ];

  const allRoomSuggestions = useMemo(() => {
    const existing = existingRooms.filter(r => r && r.trim());
    return [...new Set([...existing, ...defaultRooms])];
  }, [existingRooms, defaultRooms]);

  const filteredRoomSuggestions = useMemo(() => {
    if (!editingRoomValue.trim()) return allRoomSuggestions;
    const lower = editingRoomValue.toLowerCase();
    return allRoomSuggestions.filter(room => room.toLowerCase().includes(lower));
  }, [editingRoomValue, allRoomSuggestions]);

  const handleDragStart = (e, assembly) => {
    setDraggedId(assembly.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedId && onReorder) {
      onReorder(draggedId, targetIndex, type);
    }
    setDraggedId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverIndex(null);
    setDragOverRoom(null);
  };

  // Room drag handlers for grouped view
  const handleRoomDragOver = (e, room) => {
    e.preventDefault();
    setDragOverRoom(room);
  };

  const handleRoomDragLeave = () => {
    setDragOverRoom(null);
  };

  const handleRoomDrop = (e, targetRoom) => {
    e.preventDefault();
    if (draggedId && onUpdate) {
      const assembly = assemblies.find(a => a.id === draggedId);
      if (assembly) {
        // Convert "Fără cameră" / "No room" back to empty string
        const newRoom = targetRoom === t.noRoom ? '' : targetRoom;
        if (assembly.room !== newRoom) {
          onUpdate({ ...assembly, room: newRoom });
        }
      }
    }
    setDraggedId(null);
    setDragOverRoom(null);
  };

  const startEditingCode = (assembly, e) => {
    e.stopPropagation();
    setEditingCodeId(assembly.id);
    const num = parseInt(assembly.code.slice(1));
    setEditingCodeValue(String(num));
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setEditingCodeValue(val);
  };

  const handleCodeSubmit = (assemblyId) => {
    const newNum = parseInt(editingCodeValue);
    if (!isNaN(newNum) && newNum >= 1 && onReorder) {
      const targetIndex = Math.min(newNum - 1, sortedAssemblies.length - 1);
      onReorder(assemblyId, Math.max(0, targetIndex), type);
    }
    setEditingCodeId(null);
    setEditingCodeValue('');
  };

  const handleCodeKeyDown = (e, assemblyId) => {
    if (e.key === 'Enter') {
      handleCodeSubmit(assemblyId);
    } else if (e.key === 'Escape') {
      setEditingCodeId(null);
      setEditingCodeValue('');
    }
  };

  // Size change handler
  const handleSizeChange = (assembly, newSize) => {
    if (onUpdate) {
      onUpdate({ ...assembly, size: parseInt(newSize) });
    }
  };

  // Room editing handlers
  const startEditingRoom = (assembly, e) => {
    e.stopPropagation();
    setEditingRoomId(assembly.id);
    setEditingRoomValue(assembly.room || '');
    setRoomDropdownOpen(true);
  };

  const handleRoomChange = (e) => {
    setEditingRoomValue(e.target.value);
    setRoomDropdownOpen(true);
  };

  const handleRoomSelect = (assembly, room) => {
    if (onUpdate) {
      onUpdate({ ...assembly, room });
    }
    setEditingRoomId(null);
    setEditingRoomValue('');
    setRoomDropdownOpen(false);
  };

  const handleRoomSubmit = (assembly) => {
    if (onUpdate) {
      onUpdate({ ...assembly, room: editingRoomValue });
    }
    setEditingRoomId(null);
    setEditingRoomValue('');
    setRoomDropdownOpen(false);
  };

  const handleRoomKeyDown = (e, assembly) => {
    if (e.key === 'Enter') {
      handleRoomSubmit(assembly);
    } else if (e.key === 'Escape') {
      setEditingRoomId(null);
      setEditingRoomValue('');
      setRoomDropdownOpen(false);
    }
  };

  const handleRoomBlur = (assembly) => {
    setTimeout(() => {
      handleRoomSubmit(assembly);
    }, 150);
  };

  // Render a single assembly item
  const renderAssemblyItem = (assembly, index, showRoom = true) => {
    const usedSize = calculateModulesSize(assembly.modules, library);
    const availableColors = getAvailableColors(library);
    const colorInfo = availableColors.find(c => c.id === assembly.color);
    const isDragging = draggedId === assembly.id;
    const isDragOver = !groupByRoom && dragOverIndex === index && draggedId !== assembly.id;

    const wbIsMasonry = (assembly.wallBoxType || 'masonry') === 'masonry';
    const wbBg = wbIsMasonry ? '#fde8e8' : '#fdf6ec';

    return (
      <li
        key={assembly.id}
        draggable
        onDragStart={(e) => handleDragStart(e, assembly)}
        onDragOver={(e) => !groupByRoom && handleDragOver(e, index)}
        onDragLeave={!groupByRoom ? handleDragLeave : undefined}
        onDrop={(e) => !groupByRoom && handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        className={`flex items-center justify-between p-4 border-b last:border-b-0 cursor-grab active:cursor-grabbing transition-all ${
          isDragging ? 'opacity-50 bg-blue-50' : ''
        } ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}`}
        style={{ backgroundColor: isDragging ? undefined : wbBg }}
      >
        <div className="flex items-center gap-3 mr-3">
          <div className="text-gray-300 hover:text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Code (position) editor */}
            {editingCodeId === assembly.id ? (
              <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono font-bold text-lg">{prefix}</span>
                <input
                  type="text"
                  value={editingCodeValue}
                  onChange={handleCodeChange}
                  onBlur={() => handleCodeSubmit(assembly.id)}
                  onKeyDown={(e) => handleCodeKeyDown(e, assembly.id)}
                  className="w-12 font-mono font-bold text-lg border rounded px-1 ml-0.5"
                  autoFocus
                  maxLength={2}
                />
              </div>
            ) : (
              <span 
                className="font-mono font-bold text-lg hover:bg-blue-100 px-1 rounded cursor-text"
                onClick={(e) => startEditingCode(assembly, e)}
                title="Click to change position"
              >
                {assembly.code}
              </span>
            )}

            {/* Size selector */}
            <select
              value={assembly.size}
              onChange={(e) => {
                e.stopPropagation();
                handleSizeChange(assembly, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm bg-gray-100 px-2 py-0.5 rounded border-0 cursor-pointer hover:bg-gray-200"
              title="Change size"
            >
              {getAvailableSizes(library).map(s => (
                <option key={s} value={s}>{s}M</option>
              ))}
            </select>

            {/* Color selector */}
            <select
              value={assembly.color}
              onChange={(e) => {
                e.stopPropagation();
                if (onUpdate) {
                  onUpdate({ ...assembly, color: e.target.value });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm px-2 py-0.5 rounded border-0 cursor-pointer hover:opacity-80"
              style={{ 
                backgroundColor: colorInfo?.hex,
                color: isDarkColor(assembly.color, library) ? '#fff' : '#333'
              }}
              title="Change color"
            >
              {availableColors.map(c => (
                <option key={c.id} value={c.id}>{c.nameEn || c.name}</option>
              ))}
            </select>

            {/* Wall box type selector */}
            <select
              value={assembly.wallBoxType || 'masonry'}
              onChange={(e) => {
                e.stopPropagation();
                if (onUpdate) {
                  onUpdate({ ...assembly, wallBoxType: e.target.value });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm px-2 py-0.5 rounded border-0 cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: (assembly.wallBoxType || 'masonry') === 'masonry' ? '#fee2e2' : '#fef3c7',
                color: (assembly.wallBoxType || 'masonry') === 'masonry' ? '#991b1b' : '#92400e',
              }}
              title={t.wallBoxType}
            >
              <option value="masonry">{t.masonry}</option>
              <option value="drywall">{t.drywall}</option>
            </select>

            {/* Capacity indicator */}
            <span className={`text-sm px-2 py-0.5 rounded ${
              usedSize > assembly.size ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {usedSize}/{assembly.size}M
            </span>
          </div>

          {/* Room editor - only show if not grouped */}
          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1 flex-wrap">
            {showRoom && (
              <>
                <Home className="w-3 h-3" />
                {editingRoomId === assembly.id ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingRoomValue}
                      onChange={handleRoomChange}
                      onBlur={() => handleRoomBlur(assembly)}
                      onKeyDown={(e) => handleRoomKeyDown(e, assembly)}
                      onFocus={() => setRoomDropdownOpen(true)}
                      placeholder={t.room + '...'}
                      className="border rounded px-2 py-0.5 text-sm w-40"
                      autoFocus
                    />
                    {roomDropdownOpen && filteredRoomSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-48 mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-auto">
                        {filteredRoomSuggestions.map((room, idx) => {
                          const isExisting = existingRooms.includes(room);
                          return (
                            <li
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleRoomSelect(assembly, room);
                              }}
                              className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-sm"
                            >
                              <span>{room}</span>
                              {isExisting && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                                  {t.used}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <span
                    className="hover:bg-blue-100 px-1 rounded cursor-text"
                    onClick={(e) => startEditingRoom(assembly, e)}
                    title={t.room}
                  >
                    {assembly.room || t.noRoom}
                  </span>
                )}
                <span className="text-gray-400">·</span>
              </>
            )}
            <span>{assembly.modules.length} {t.modules}</span>
            {/* Module quick view */}
            {assembly.modules.length > 0 && (
              <div className="flex items-center gap-1 ml-2">
                {assembly.modules.map((mod, idx) => {
                  const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
                  const moduleName = catalogItem ? getModuleName(catalogItem, lang) : mod.moduleId;
                  const moduleSize = catalogItem?.size || 1;
                  return (
                    <span
                      key={mod.id || idx}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded"
                      title={moduleName}
                    >
                      {moduleName.length > 12 ? moduleName.substring(0, 10) + '...' : moduleName}
                      <span className="text-blue-400 text-[10px]">{moduleSize}M</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Assembly Preview Thumbnail */}
          <div className="hidden sm:block">
            <AssemblyThumbnail assembly={assembly} library={library} scale={0.5} />
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(assembly); }}
              className="text-blue-500 hover:text-blue-700 p-2"
              title={t.edit + ' ' + t.modules}
            >
              <Settings className="w-4 h-4" />
            </button>
            {confirmDuplicateId === assembly.id ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onConfirmDuplicate(assembly.id)}
                  className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                >
                  {t.duplicate}?
                </button>
                <button
                  onClick={() => onCancelDuplicate()}
                  className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(assembly.id);
                }}
                className="text-green-500 hover:text-green-700 p-2"
                title={t.duplicate}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(assembly.id); }}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </li>
    );
  };

  // Export PDF for electrician
  const exportElectricianPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Function to remove diacritics
    const removeDiacritics = (str) => {
      if (!str) return str;
      return str
        .replace(/[ăÄƒ]/g, 'a').replace(/[ĂÄ‚]/g, 'A')
        .replace(/[âÃ¢]/g, 'a').replace(/[ÂÃ‚]/g, 'A')
        .replace(/[îÃ®]/g, 'i').replace(/[ÎÃŽ]/g, 'I')
        .replace(/[șşÈ™]/g, 's').replace(/[ȘŞÈ˜]/g, 'S')
        .replace(/[țţÈ›]/g, 't').replace(/[ȚŢÈš]/g, 'T');
    };
    
    // Function to generate SVG string for an assembly
    const generateAssemblySVG = (assembly, scale = 1.5) => {
      const moduleWidth1M = 8.5 * scale;
      const faceHeight = 31 * scale;
      const sideMargin = 10.5 * scale;
      const supportBarHeight = 5 * scale;
      const supportBarOffset = 4 * scale;
      
      const moduleAreaWidth = assembly.size * moduleWidth1M;
      const totalWidth = moduleAreaWidth + (sideMargin * 2);
      
      const isDark = isDarkColor(assembly.color, library);
      const frameBg = isDark ? '#3a3a3a' : '#f5f5f5';
      const supportBarColor = '#4a4a4a';
      const moduleBg = isDark ? '#3a3a3a' : '#ffffff';
      const moduleBorder = isDark ? '#555' : '#ddd';
      const frameBorderOuter = isDark ? '#555' : '#ddd';
      
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${faceHeight}" viewBox="0 0 ${totalWidth} ${faceHeight}">`;
      
      // Outer border for visibility
      svg += `<rect x="0" y="0" width="${totalWidth}" height="${faceHeight}" fill="${frameBg}" stroke="${frameBorderOuter}" stroke-width="0.5"/>`;
      
      // Support bars
      svg += `<rect x="${sideMargin}" y="${supportBarOffset}" width="${moduleAreaWidth}" height="${supportBarHeight}" fill="${supportBarColor}"/>`;
      svg += `<rect x="${sideMargin}" y="${faceHeight - supportBarOffset - supportBarHeight}" width="${moduleAreaWidth}" height="${supportBarHeight}" fill="${supportBarColor}"/>`;
      
      // Modules
      let moduleX = sideMargin;
      (assembly.modules || []).forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        const size = catalogItem?.size || 1;
        const modWidth = size * moduleWidth1M;
        const centerX = moduleX + modWidth / 2;
        const centerY = faceHeight / 2;
        
        // Module background with border
        svg += `<rect x="${moduleX}" y="0" width="${modWidth}" height="${faceHeight}" fill="${moduleBg}" stroke="${moduleBorder}" stroke-width="0.5"/>`;
        
        if (catalogItem) {
          const modId = catalogItem.id.toLowerCase();
          const symbolColor = isBlack ? '#ffffff' : '#333333';
          const accentColor = isBlack ? '#555555' : '#e8e8e8';
          const holeColor = isBlack ? '#ffffff' : '#333333';
          const sw = 0.95; // stroke-width for PDF clarity
          
          if (modId.includes('schuko')) {
            // Schuko outlet
            svg += `<circle cx="${centerX}" cy="${centerY}" r="${8 * scale}" fill="${accentColor}"/>`;
            svg += `<circle cx="${centerX - 3.5 * scale}" cy="${centerY}" r="${1.8 * scale}" fill="${holeColor}"/>`;
            svg += `<circle cx="${centerX + 3.5 * scale}" cy="${centerY}" r="${1.8 * scale}" fill="${holeColor}"/>`;
          } else if (modId.includes('italian')) {
            // Italian outlet
            svg += `<ellipse cx="${centerX}" cy="${centerY}" rx="${3.5 * scale}" ry="${8 * scale}" fill="${accentColor}"/>`;
            svg += `<circle cx="${centerX}" cy="${centerY - 4 * scale}" r="${1.2 * scale}" fill="${holeColor}"/>`;
            svg += `<circle cx="${centerX}" cy="${centerY}" r="${1.2 * scale}" fill="${holeColor}"/>`;
            svg += `<circle cx="${centerX}" cy="${centerY + 4 * scale}" r="${1.2 * scale}" fill="${holeColor}"/>`;
          } else if (modId.includes('usb')) {
            // USB ports - scaled smaller to fit inside key
            svg += `<rect x="${centerX - 3 * scale}" y="${centerY - 5.5 * scale}" width="${6 * scale}" height="${3.2 * scale}" rx="0.5" fill="${holeColor}"/>`;
            svg += `<rect x="${centerX - 3 * scale}" y="${centerY + 0.8 * scale}" width="${6 * scale}" height="${3.2 * scale}" rx="0.5" fill="${holeColor}"/>`;
          } else if (modId.includes('switch') || modId.includes('intrerupator')) {
            // Switch with + and LED
            svg += `<line x1="${centerX - 4 * scale}" y1="${centerY}" x2="${centerX + 4 * scale}" y2="${centerY}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
            svg += `<line x1="${centerX}" y1="${centerY - 4 * scale}" x2="${centerX}" y2="${centerY + 4 * scale}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
            svg += `<circle cx="${centerX}" cy="${centerY + 10 * scale}" r="${1.5 * scale}" fill="#4ade80"/>`;
          } else if (modId.includes('dimmer') || modId.includes('potentiometru')) {
            // Dimmer +/-
            svg += `<line x1="${centerX - 8 * scale}" y1="${centerY - 3 * scale}" x2="${centerX - 2 * scale}" y2="${centerY - 3 * scale}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
            svg += `<line x1="${centerX - 5 * scale}" y1="${centerY - 6 * scale}" x2="${centerX - 5 * scale}" y2="${centerY}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
            svg += `<line x1="${centerX + 2 * scale}" y1="${centerY + 3 * scale}" x2="${centerX + 8 * scale}" y2="${centerY + 3 * scale}" stroke="${symbolColor}" stroke-width="${sw}" stroke-linecap="round"/>`;
          } else if (modId.includes('coax') || modId.includes('tv')) {
            // COAX
            svg += `<circle cx="${centerX}" cy="${centerY}" r="${5 * scale}" fill="none" stroke="${symbolColor}" stroke-width="${sw}"/>`;
            svg += `<circle cx="${centerX}" cy="${centerY}" r="${1.5 * scale}" fill="${symbolColor}"/>`;
          } else if (modId.includes('utp') || modId.includes('rj45') || modId.includes('data')) {
            // UTP/RJ45
            svg += `<rect x="${centerX - 4 * scale}" y="${centerY - 3 * scale}" width="${8 * scale}" height="${6 * scale}" rx="1" fill="none" stroke="${symbolColor}" stroke-width="${sw}"/>`;
            svg += `<line x1="${centerX - 2 * scale}" y1="${centerY - 3 * scale}" x2="${centerX - 2 * scale}" y2="${centerY + 3 * scale}" stroke="${symbolColor}" stroke-width="${sw * 0.7}"/>`;
            svg += `<line x1="${centerX + 2 * scale}" y1="${centerY - 3 * scale}" x2="${centerX + 2 * scale}" y2="${centerY + 3 * scale}" stroke="${symbolColor}" stroke-width="${sw * 0.7}"/>`;
          } else if (modId.includes('blank') || modId.includes('tasta')) {
            // Blank - just the background, no symbol
          } else {
            // Generic module
            svg += `<rect x="${centerX - 3 * scale}" y="${centerY - 3 * scale}" width="${6 * scale}" height="${6 * scale}" fill="${holeColor}"/>`;
          }
        }
        
        moduleX += modWidth;
      });
      
      // Empty slots
      const usedSize = (assembly.modules || []).reduce((sum, mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        return sum + (catalogItem?.size || 1);
      }, 0);
      
      if (usedSize < assembly.size) {
        const emptyWidth = (assembly.size - usedSize) * moduleWidth1M;
        svg += `<rect x="${moduleX}" y="0" width="${emptyWidth}" height="${faceHeight}" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="3,2"/>`;
      }
      
      svg += '</svg>';
      return { svg, width: totalWidth, height: faceHeight };
    };
    
    // Convert SVG to image data URL
    const svgToImage = (svgString, width, height) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = width * 2; // 2x for better quality
        canvas.height = height * 2;
        ctx.scale(2, 2);
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
          resolve(null);
        };
        
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        img.src = URL.createObjectURL(svgBlob);
      });
    };
    
    const typeTitle = type === 'outlet' 
      ? (lang === 'ro' ? 'Lista Prize' : 'Outlets List')
      : (lang === 'ro' ? 'Lista Intrerupatoare' : 'Switches List');
    const projectName = project?.name || (lang === 'ro' ? 'Proiect' : 'Project');
    const clientName = project?.clientName || (lang === 'ro' ? 'Client' : 'Client');
    const dateStr = new Date().toLocaleDateString('ro-RO');
    
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(typeTitle, pageWidth / 2, 14, { align: 'center' });
    
    // Project name
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(removeDiacritics(projectName), pageWidth / 2, 21, { align: 'center' });
    
    // Client name
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(clientName), pageWidth / 2, 27, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 31, pageWidth - 10, 31);
    
    // Date on the right
    doc.setFontSize(9);
    doc.text(dateStr, pageWidth - 10, 38, { align: 'right' });
    
    let yPos = 44;
    
    // Group by room for better organization
    const groupedData = {};
    sortedAssemblies.forEach(assembly => {
      const room = assembly.room || (lang === 'ro' ? 'Fara camera' : 'No room');
      if (!groupedData[room]) {
        groupedData[room] = [];
      }
      groupedData[room].push(assembly);
    });
    
    const rooms = Object.keys(groupedData).sort((a, b) => {
      const noRoom = lang === 'ro' ? 'Fara camera' : 'No room';
      if (a === noRoom) return 1;
      if (b === noRoom) return -1;
      return a.localeCompare(b);
    });
    
    const cardHeight = 28; // Reduced height
    const roomHeaderHeight = 7;
    
    for (const room of rooms) {
      const roomAssemblies = groupedData[room];
      
      // Check if room header + at least one card fits on current page
      if (yPos + roomHeaderHeight + cardHeight > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      // Room header
      doc.setFillColor(70, 70, 70);
      doc.rect(10, yPos, pageWidth - 20, 6, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(removeDiacritics(room), 13, yPos + 4.5);
      doc.setTextColor(0, 0, 0);
      yPos += roomHeaderHeight;
      
      for (const assembly of roomAssemblies) {
        if (yPos + cardHeight > 280) {
          doc.addPage();
          yPos = 20;
        }
        
        const wallBoxType = assembly.wallBoxType || 'masonry';
        const wallBoxLabel = wallBoxType === 'drywall' 
          ? (lang === 'ro' ? 'Gips-carton' : 'Drywall')
          : (lang === 'ro' ? 'Zidarie' : 'Masonry');
        const colorLabel = getColorName(assembly.color, library, lang);
        
        // Card background
        doc.setFillColor(252, 252, 252);
        doc.setDrawColor(230, 230, 230);
        doc.rect(10, yPos, pageWidth - 20, cardHeight - 1, 'FD');
        
        // Code
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(assembly.code, 13, yPos + 6);
        
        // Info line 1
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(90, 90, 90);
        doc.text(`${assembly.size}M | ${wallBoxLabel} | ${colorLabel}`, 13, yPos + 12);
        
        // Info line 2: Modules
        const moduleNames = assembly.modules.map(mod => {
          const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
          return catalogItem ? removeDiacritics(getModuleName(catalogItem, lang)) : mod.moduleId;
        }).join(', ') || (lang === 'ro' ? 'Gol' : 'Empty');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 120);
        const truncatedModules = moduleNames.length > 60 ? moduleNames.substring(0, 57) + '...' : moduleNames;
        doc.text(truncatedModules, 13, yPos + 18);
        
        // Generate and add SVG sketch (smaller)
        const { svg, width, height } = generateAssemblySVG(assembly, 0.8);
        const imageData = await svgToImage(svg, width, height);
        
        if (imageData) {
          const imgWidth = width * 0.5;
          const imgHeight = height * 0.5;
          const imgX = pageWidth - 12 - imgWidth;
          const imgY = yPos + (cardHeight - 1 - imgHeight) / 2;
          doc.addImage(imageData, 'PNG', imgX, imgY, imgWidth, imgHeight);
        }
        
        yPos += cardHeight;
      }
      
      yPos += 2;
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    const pageLabel = lang === 'ro' ? 'Pagina' : 'Page';
    const ofLabel = lang === 'ro' ? 'din' : 'of';
    const footerInfo = `${removeDiacritics(projectName)} - ${removeDiacritics(clientName)}`;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      // Client info on left
      doc.text(footerInfo, 10, doc.internal.pageSize.getHeight() - 10);
      // Page number on right
      doc.text(
        `${pageLabel} ${i} ${ofLabel} ${pageCount}`,
        pageWidth - 10,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }
    
    doc.setTextColor(0, 0, 0);
    const fileType = type === 'outlet' ? (lang === 'ro' ? 'Lista_Prize' : 'Outlets_List') : (lang === 'ro' ? 'Lista_Intrerupatoare' : 'Switches_List');
    const fileClientName = removeDiacritics(project?.clientName || 'Client').replace(/\s+/g, '_');
    const fileDateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
    doc.save(`${fileType}_${fileClientName}_${fileDateStr}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">{type === 'outlet' ? t.outlets : t.switches}</h2>
          {/* Group by room toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByRoom}
              onChange={(e) => setGroupByRoom(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Home className="w-4 h-4" />
            {t.groupByRoom}
          </label>
        </div>
        <div className="flex items-center gap-2">
          {sortedAssemblies.length > 0 && (
            <button
              onClick={exportElectricianPDF}
              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-gray-200 border"
              title={lang === 'ro' ? 'Export pentru electrician' : 'Export for electrician'}
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          )}
          <button
            onClick={onAddEmpty}
            className="bg-gray-500 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" /> {t.addEmpty}
          </button>
          <button
            onClick={onAdd}
            className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
          >
            <Plus className="w-4 h-4" /> {addLabel}
          </button>
        </div>
      </div>

      {sortedAssemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{noItemsLabel}</p>
      ) : groupByRoom ? (
        // Grouped by room view
        <div>
          {groupedByRoom.sortedRooms.map(room => {
            const isDropTarget = dragOverRoom === room && draggedId;
            const draggedAssembly = draggedId ? assemblies.find(a => a.id === draggedId) : null;
            const draggedFromSameRoom = draggedAssembly && (draggedAssembly.room || t.noRoom) === room;
            
            return (
              <div 
                key={room}
                onDragOver={(e) => handleRoomDragOver(e, room)}
                onDragLeave={handleRoomDragLeave}
                onDrop={(e) => handleRoomDrop(e, room)}
                className={`transition-all ${
                  isDropTarget && !draggedFromSameRoom
                    ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' 
                    : ''
                }`}
              >
                <div 
                  className={`px-4 py-2 border-b flex items-center gap-2 transition-all ${
                    isDropTarget && !draggedFromSameRoom
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}
                >
                  <Home className={`w-4 h-4 ${isDropTarget && !draggedFromSameRoom ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isDropTarget && !draggedFromSameRoom ? 'text-blue-700' : 'text-gray-700'}`}>
                    {room}
                  </span>
                  <span className="text-sm text-gray-500">({groupedByRoom.groups[room].length})</span>
                  {isDropTarget && !draggedFromSameRoom && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded ml-auto animate-pulse">
                      {t.dropHere}
                    </span>
                  )}
                </div>
                <ul>
                  {groupedByRoom.groups[room].map((assembly, index) => 
                    renderAssemblyItem(assembly, index, false)
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        // Regular list view
        <ul>
          {sortedAssemblies.map((assembly, index) => renderAssemblyItem(assembly, index, true))}
        </ul>
      )}
      
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
        💡 {groupByRoom ? t.editHintGrouped : t.editHint}
      </div>
    </div>
  );
}

// --- Room Selector ---
function RoomSelector({ value, onChange, existingRooms }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = React.useRef(null);
  const t = useTranslation();

  // Common room suggestions as fallback (translated)
  const defaultRooms = [
    t.livingRoom, t.kitchen, `${t.bedroom} 1`, `${t.bedroom} 2`, `${t.bedroom} 3`,
    `${t.bathroom} 1`, `${t.bathroom} 2`, t.hallway, t.entrance, t.office,
    t.diningRoom, t.garage, t.laundry, t.storage, t.balcony
  ];

  // Combine existing rooms with defaults, existing first
  const allSuggestions = useMemo(() => {
    const existing = existingRooms.filter(r => r && r.trim());
    const combined = [...new Set([...existing, ...defaultRooms])];
    return combined;
  }, [existingRooms, defaultRooms]);

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return allSuggestions;
    const lower = inputValue.toLowerCase();
    return allSuggestions.filter(room => 
      room.toLowerCase().includes(lower)
    );
  }, [inputValue, allSuggestions]);

  const handleSelect = (room) => {
    setInputValue(room);
    onChange(room);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={t.room + '...'}
        className="w-full border rounded px-3 py-2"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredSuggestions.map((room, idx) => {
            const isExisting = existingRooms.includes(room);
            return (
              <li
                key={idx}
                onClick={() => handleSelect(room)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
              >
                <span>{room}</span>
                {isExisting && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    {t.used}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// --- Assembly Editor ---
function AssemblyEditor({ assembly, onBack, onUpdate, existingRooms = [] }) {
  const [draggedModule, setDraggedModule] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [dragOverFace, setDragOverFace] = useState(false);

  // Get library and translations from context
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const usedSize = calculateModulesSize(assembly.modules, library);
  const remainingSize = assembly.size - usedSize;
  const isOverCapacity = remainingSize < 0;

  const updateField = (field, value) => {
    onUpdate({ ...assembly, [field]: value });
  };

  // Quick add module
  const addModule = (moduleId) => {
    const catalogItem = MODULE_CATALOG.find(c => c.id === moduleId);
    if (catalogItem && catalogItem.size <= remainingSize) {
      const newModule = createModuleInstance(moduleId);
      onUpdate({ ...assembly, modules: [...assembly.modules, newModule] });
    }
  };

  // Calculate slot positions for modules
  const getModuleSlots = () => {
    const slots = [];
    let currentPos = 0;
    assembly.modules.forEach((mod, index) => {
      const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
      const size = catalogItem?.size || 1;
      slots.push({
        ...mod,
        index,
        startPos: currentPos,
        size,
        catalogItem,
      });
      currentPos += size;
    });
    return slots;
  };

  const moduleSlots = getModuleSlots();

  // Drag from catalog
  const handleCatalogDragStart = (e, moduleId) => {
    const catalogItem = MODULE_CATALOG.find(c => c.id === moduleId);
    if (catalogItem && catalogItem.size <= remainingSize) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'catalog', moduleId }));
      e.dataTransfer.effectAllowed = 'copy';
      
      // Find the ModuleImage container in the dragged row and use it as drag image
      const moduleImageContainer = e.currentTarget.querySelector('.module-drag-preview');
      if (moduleImageContainer) {
        const rect = moduleImageContainer.getBoundingClientRect();
        e.dataTransfer.setDragImage(moduleImageContainer, rect.width / 2, rect.height / 2);
      }
      
      setDraggedModule({ type: 'catalog', moduleId });
    }
  };

  // Drag from installed slot
  const handleSlotDragStart = (e, slotIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'installed', index: slotIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedModule({ type: 'installed', index: slotIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFace(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverFace(false);
    setDragOverSlot(null);
  };

  const handleSlotDragOver = (e, slotIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(slotIndex);
    setDragOverFace(true);
  };

  const handleDrop = (e, dropIndex = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    let dragData = draggedModule;
    
    // Try to get data from dataTransfer if state is lost
    if (!dragData) {
      try {
        const data = e.dataTransfer.getData('text/plain');
        if (data) {
          dragData = JSON.parse(data);
        }
      } catch (err) {
        console.log('Could not parse drag data');
      }
    }

    if (!dragData) {
      resetDragState();
      return;
    }

    if (dragData.type === 'catalog') {
      // Add new module from catalog
      const catalogItem = MODULE_CATALOG.find(c => c.id === dragData.moduleId);
      if (catalogItem && catalogItem.size <= remainingSize) {
        const newModule = createModuleInstance(dragData.moduleId);
        let newModules = [...assembly.modules];
        
        if (dropIndex !== null && dropIndex >= 0) {
          newModules.splice(dropIndex, 0, newModule);
        } else {
          newModules.push(newModule);
        }
        
        onUpdate({ ...assembly, modules: newModules });
      }
    } else if (dragData.type === 'installed') {
      // Reorder existing module
      const fromIndex = dragData.index;
      let toIndex = dropIndex !== null ? dropIndex : assembly.modules.length - 1;
      
      if (fromIndex !== toIndex && fromIndex >= 0 && fromIndex < assembly.modules.length) {
        const newModules = [...assembly.modules];
        const [moved] = newModules.splice(fromIndex, 1);
        // Adjust index if moving forward
        if (toIndex > fromIndex) {
          toIndex--;
        }
        newModules.splice(Math.max(0, toIndex), 0, moved);
        onUpdate({ ...assembly, modules: newModules });
      }
    }

    resetDragState();
  };

  const handleRemoveModule = (index) => {
    const newModules = assembly.modules.filter((_, i) => i !== index);
    onUpdate({ ...assembly, modules: newModules });
  };

  const resetDragState = () => {
    setDraggedModule(null);
    setDragOverSlot(null);
    setDragOverFace(false);
  };

  // Get derived SKUs
  const wallBoxSku = getWallBoxSku(assembly.size, assembly.wallBoxType || 'masonry', library);
  const installFaceSku = getInstallFaceSku(assembly.size, library);
  const decorFaceSku = getDecorFaceSku(assembly.size, assembly.color, library);
  const wallBoxTypeLabel = (assembly.wallBoxType || 'masonry') === 'drywall' ? t.drywall : t.masonry;

  // Visual dimensions - Real BTicino proportions: 1M = 8.5 x 31, side parts = 10.5 x 31
  const baseScale = 4; // Multiplier for reasonable pixel sizes in editor
  const moduleWidth1M = 8.5 * baseScale;  // Width of 1M module (34px)
  const sideMargin = 10.5 * baseScale;     // Fixed side parts width (42px)
  const faceHeight = 31 * baseScale;       // Height (124px)
  const moduleAreaWidth = assembly.size * moduleWidth1M;
  const faceWidth = moduleAreaWidth + (sideMargin * 2);

  const availableColors = getAvailableColors(library);
  const colorInfo = availableColors.find(c => c.id === assembly.color);
  const _detailDark = isDarkColor(assembly.color, library);
  const faceBgColor = colorInfo?.hex || (_detailDark ? '#454545' : '#f0f0f0');
  const faceTextColor = _detailDark ? '#ffffff' : '#333333';

  const _wbMasonry = (assembly.wallBoxType || 'masonry') === 'masonry';
  const _wbCardBg = _wbMasonry ? 'rgba(254, 226, 226, 0.3)' : 'rgba(253, 246, 236, 0.35)';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-800"
      >
        <ChevronLeft className="w-4 h-4" /> {t.backToList}
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold font-mono">{assembly.code}</h1>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            isOverCapacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {usedSize}/{assembly.size}M {t.used}
            {isOverCapacity && ` (${t.overCapacity})`}
          </span>
        </div>

        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.room}</label>
            <RoomSelector
              value={assembly.room}
              onChange={(room) => updateField('room', room)}
              existingRooms={existingRooms}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.size}</label>
            <select
              value={assembly.size}
              onChange={(e) => updateField('size', parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {getAvailableSizes(library).map(s => (
                <option key={s} value={s}>{s}M</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.color}</label>
            <select
              value={assembly.color}
              onChange={(e) => updateField('color', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {availableColors.map(c => (
                <option key={c.id} value={c.id}>{getColorName(c.id, library, lang)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.wallBoxType}</label>
            <select
              value={assembly.wallBoxType || 'masonry'}
              onChange={(e) => updateField('wallBoxType', e.target.value)}
              className="w-full border rounded px-3 py-2"
              style={{
                backgroundColor: _wbMasonry ? '#fee2e2' : '#fef3c7',
                color: _wbMasonry ? '#991b1b' : '#92400e',
              }}
            >
              <option value="masonry">{t.masonry}</option>
              <option value="drywall">{t.drywall}</option>
            </select>
          </div>
        </div>

        {/* Auto-derived SKUs */}
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Box className="w-4 h-4" /> {t.assemblyComponents}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{t.wallBox} {assembly.size}M ({wallBoxTypeLabel})</span>
              <span className="font-mono text-gray-400">{wallBoxSku || '—'}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{t.installFace} {assembly.size}M</span>
              <span className="font-mono text-gray-400">{installFaceSku || '—'}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border">
              <span className="text-gray-600">{t.decorFace} {assembly.size}M {getColorName(assembly.color, library, lang)}</span>
              <span className="font-mono text-gray-400">{decorFaceSku || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Assembly Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Face Plate */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4" /> {t.visualAssembly}
          </h2>
          
          <div 
            className="flex justify-center mb-4 p-6 rounded-lg"
            style={_wbMasonry ? { 
              backgroundColor: '#e8e4e0',
              backgroundImage: 'linear-gradient(45deg, #e0dcd8 25%, transparent 25%), linear-gradient(-45deg, #e0dcd8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0dcd8 75%), linear-gradient(-45deg, transparent 75%, #e0dcd8 75%)',
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
            } : {
              backgroundColor: '#f5f0e8',
              backgroundImage: 'none',
            }}
          >
            {/* Face plate container - with padding for delete buttons */}
            <div
              className={`relative transition-all ${
                dragOverFace ? 'ring-2 ring-blue-400 ring-offset-2' : ''
              }`}
              style={{
                width: faceWidth,
                height: faceHeight,
                backgroundColor: 'transparent',
                margin: '10px', // Space for delete buttons
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              {/* Side margins (face plate edges) */}
              <div 
                className="absolute top-0 bottom-0 left-0"
                style={{ 
                  width: sideMargin,
                  backgroundColor: faceBgColor,
                }}
              />
              <div 
                className="absolute top-0 bottom-0 right-0"
                style={{ 
                  width: sideMargin,
                  backgroundColor: faceBgColor,
                }}
              />
              
              {/* Support frame bars - top and bottom connecting side margins (in background) */}
              <div 
                className="absolute"
                style={{ 
                  left: sideMargin,
                  right: sideMargin,
                  top: 10,
                  height: 16,
                  backgroundColor: '#4a4a4a',
                  zIndex: 0,
                }}
              />
              <div 
                className="absolute"
                style={{ 
                  left: sideMargin,
                  right: sideMargin,
                  bottom: 10,
                  height: 16,
                  backgroundColor: '#4a4a4a',
                  zIndex: 0,
                }}
              />
              
              {/* Slot grid background - centered between side margins */}
              <div 
                className="absolute flex"
                style={{ 
                  left: sideMargin,
                  right: sideMargin,
                  top: 0,
                  bottom: 0,
                  gap: 0,
                  zIndex: 1,
                }}
              >
                {Array.from({ length: assembly.size }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-dashed flex-shrink-0"
                    style={{
                      width: moduleWidth1M,
                      height: faceHeight,
                      borderColor: _detailDark ? '#555' : '#ccc',
                    }}
                  />
                ))}
              </div>

              {/* Installed modules - centered between side margins */}
              <div 
                className="absolute flex"
                style={{ 
                  left: sideMargin,
                  right: sideMargin,
                  top: 0,
                  bottom: 0,
                  zIndex: 2,
                }}
              >
                {moduleSlots.map((slot, idx) => {
                  const isDragging = draggedModule?.type === 'installed' && draggedModule?.index === idx;
                  const isDragOver = dragOverSlot === idx;
                  
                  return (
                    <div
                      key={slot.id}
                      draggable
                      onDragStart={(e) => handleSlotDragStart(e, idx)}
                      onDragEnd={resetDragState}
                      onDragOver={(e) => handleSlotDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`relative flex-shrink-0 cursor-grab active:cursor-grabbing transition-all duration-150 group ${
                        isDragging ? 'opacity-40 scale-95' : 'hover:scale-110 hover:z-20 hover:shadow-xl'
                      } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      style={{
                        width: slot.size * moduleWidth1M,
                        height: faceHeight,
                        backgroundColor: colorInfo?.hex || (_detailDark ? '#3a3a3a' : '#f5f5f5'),
                        border: `2px solid ${_detailDark ? '#555' : '#bbb'}`,
                      }}
                    >
                      {/* Module image with real Bticino graphics - fills entire module */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ModuleImage 
                          moduleId={slot.moduleId} 
                          color={assembly.color}
                          colorHex={colorInfo?.hex}
                          width={slot.size * moduleWidth1M}
                          height={faceHeight}
                        />
                      </div>
                      
                      {/* Hover overlay - on top of module image */}
                      <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none z-10" />
                      
                      {/* Remove button - visible on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModule(idx);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow z-50 opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  );
                })}

                {/* Empty drop zone indicator */}
                {remainingSize > 0 && (
                  <div
                    className={`flex-shrink-0 border-2 border-dashed flex items-center justify-center transition-all ${
                      draggedModule ? 'border-blue-400 bg-blue-100/30' : 'border-gray-300'
                    }`}
                    style={{
                      width: remainingSize * moduleWidth1M,
                      height: faceHeight,
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, assembly.modules.length)}
                  >
                    {draggedModule ? (
                      <span className="text-xs text-blue-600 font-medium">{t.dropHere}</span>
                    ) : (
                      <span className="text-xs text-gray-400">{remainingSize}M {t.free}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t.capacity}</span>
              <span>{usedSize}/{assembly.size}M ({remainingSize}M {t.free})</span>
            </div>
            <div className="h-3 bg-gray-200 rounded overflow-hidden flex">
              {moduleSlots.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="h-full bg-blue-500 border-r border-blue-600 last:border-r-0"
                  style={{ width: `${(slot.size / assembly.size) * 100}%` }}
                  title={getModuleName(slot.catalogItem, lang)}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            💡 {t.dragHint}
          </p>

          {/* Installed modules list */}
          {assembly.modules.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">{t.installed} ({assembly.modules.length})</h3>
              <ul className="space-y-1 text-sm">
                {assembly.modules.map((mod, idx) => {
                  const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
                  const moduleSku = getModuleSku(mod.moduleId, assembly.color, library);
                  const faceSku = getModuleFaceSku(mod.moduleId, assembly.color, library);
                  return (
                    <li key={mod.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{idx + 1}. {getModuleName(catalogItem, lang)} ({catalogItem?.size}M)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">
                          {moduleSku || '—'} / {faceSku || '—'}
                        </span>
                        <button
                          onClick={() => handleRemoveModule(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Module Catalog */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t.availableModules}</h2>
          <p className="text-sm text-gray-500 mb-3">
            {t.remainingCapacity}: <span className="font-medium">{Math.max(0, remainingSize)}M</span>
          </p>
          <div className="space-y-2">
            {MODULE_CATALOG.map((mod) => {
              const canAdd = mod.size <= remainingSize;
              return (
                <div
                  key={mod.id}
                  draggable={canAdd}
                  onDragStart={(e) => handleCatalogDragStart(e, mod.id)}
                  onDragEnd={resetDragState}
                  className={`p-3 rounded border flex justify-between items-center transition-all ${
                    canAdd
                      ? 'hover:bg-blue-50 hover:border-blue-300 cursor-grab active:cursor-grabbing'
                      : 'opacity-50 cursor-not-allowed bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center"
                      style={{
                        width: 40, // Fixed container width for text alignment
                        height: 56,
                      }}
                    >
                      <div 
                        className="module-drag-preview rounded bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-300"
                        style={{
                          // BTicino proportions: 1M = 8.5x31, 2M = 17x31
                          width: mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31),
                          height: 52,
                        }}
                      >
                        <ModuleImage 
                          moduleId={mod.id} 
                          color="white"
                          width={mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31)}
                          height={52}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">{getModuleName(mod, lang)}</span>
                      <span className="text-xs text-gray-400 ml-2">+ {t.face}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {mod.size}M
                    </span>
                    <button
                      onClick={() => addModule(mod.id)}
                      disabled={!canAdd}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        canAdd
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title={canAdd ? `${t.add} ${getModuleName(mod, lang)}` : t.overCapacity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


// --- BOQ View ---
function BOQView({ project }) {
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const boqData = useMemo(() => {
    const items = {
      wallBoxesMasonry: {},
      wallBoxesDrywall: {},
      installFaces: {},
      decorFaces: {},
      modules: {},
      moduleFaces: {},
    };

    project.assemblies.forEach((assembly) => {
      const colorName = getColorName(assembly.color, library, lang);
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Wall Box / Doza - separate by type
      const wbKey = `${assembly.size}M`;
      const wbSku = getWallBoxSku(assembly.size, wallBoxType, library);
      
      if (wallBoxType === 'drywall') {
        items.wallBoxesDrywall[wbKey] = items.wallBoxesDrywall[wbKey] || { 
          name: `${t.wallBoxDrywallItem} ${assembly.size}M`, 
          sku: wbSku,
          color: '—',
          qty: 0 
        };
        items.wallBoxesDrywall[wbKey].qty++;
      } else {
        items.wallBoxesMasonry[wbKey] = items.wallBoxesMasonry[wbKey] || { 
          name: `${t.wallBoxMasonryItem} ${assembly.size}M`, 
          sku: wbSku,
          color: '—',
          qty: 0 
        };
        items.wallBoxesMasonry[wbKey].qty++;
      }

      // Install Face / Rama Montaj
      const ifKey = `${assembly.size}M`;
      const ifSku = getInstallFaceSku(assembly.size, library);
      items.installFaces[ifKey] = items.installFaces[ifKey] || { 
        name: `${t.supportItem} ${assembly.size}M`, 
        sku: ifSku,
        color: '—',
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face / Rama Decor
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfSku = getDecorFaceSku(assembly.size, assembly.color, library);
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `${t.coverPlateItem} ${assembly.size}M`, 
        sku: dfSku,
        color: colorName,
        qty: 0 
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          const modSku = getModuleSku(mod.moduleId, assembly.color, library);
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const translatedName = getModuleName(catalogItem, lang);
          items.modules[modKey] = items.modules[modKey] || { 
            name: translatedName, 
            sku: modSku,
            color: colorName,
            qty: 0 
          };
          items.modules[modKey].qty++;

          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfSku = getModuleFaceSku(mod.moduleId, assembly.color, library);
          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || { 
            name: `${translatedName} - ${t.face}`, 
            sku: mfSku,
            color: colorName,
            qty: 0 
          };
          items.moduleFaces[mfKey].qty++;
        }
      });
    });

    return items;
  }, [project, library, MODULE_CATALOG, t, lang]);

  const sections = [
    { key: 'wallBoxesMasonry', title: t.wallBoxesMasonry || 'Wall Boxes (Masonry)' },
    { key: 'wallBoxesDrywall', title: t.wallBoxesDrywall || 'Wall Boxes (Drywall)' },
    { key: 'installFaces', title: t.installFaces },
    { key: 'decorFaces', title: t.decorFaces },
    { key: 'modules', title: t.modules },
    { key: 'moduleFaces', title: t.moduleFaces },
  ];

  const totalItems = Object.values(boqData).reduce(
    (sum, category) => sum + Object.values(category).reduce((s, item) => s + item.qty, 0),
    0
  );

  // Export PDF function
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Function to remove diacritics - handles both comma and cedilla variants
    const removeDiacritics = (str) => {
      if (!str) return str;
      return str
        .replace(/[ăÄƒ]/g, 'a').replace(/[ĂÄ‚]/g, 'A')
        .replace(/[âÃ¢]/g, 'a').replace(/[ÂÃ‚]/g, 'A')
        .replace(/[îÃ®]/g, 'i').replace(/[ÎÃŽ]/g, 'I')
        .replace(/[șşÈ™]/g, 's').replace(/[ȘŞÈ˜]/g, 'S')
        .replace(/[țţÈ›]/g, 't').replace(/[ȚŢÈš]/g, 'T');
    };
    
    doc.setFont('helvetica');
    
    // Localized labels
    const pdfTitle = lang === 'ro' ? 'Lista de Cantitati' : 'Bill of Quantities';
    const pdfSubtitle = lang === 'ro' ? 'Pentru Furnizor' : 'For Supplier';
    const pdfProject = lang === 'ro' ? 'Proiect:' : 'Project:';
    const pdfClient = lang === 'ro' ? 'Client:' : 'Client:';
    const pdfDate = lang === 'ro' ? 'Data:' : 'Date:';
    const pdfTotalItems = lang === 'ro' ? 'Total articole:' : 'Total items:';
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfTitle, pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(pdfSubtitle, pageWidth / 2, 28, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 33, pageWidth - 14, 33);
    
    // Project info box
    doc.setFillColor(248, 249, 250);
    doc.rect(14, 38, pageWidth - 28, 28, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 38, pageWidth - 28, 28, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfProject, 18, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.name) || '—', 50, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfClient, 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.clientName) || '—', 50, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfDate, 120, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('ro-RO'), 145, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfTotalItems, 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(totalItems.toString(), 160, 55);
    
    let yPos = 78;
    
    // Section titles from translations
    const sectionTitles = {
      wallBoxesMasonry: t.wallBoxesMasonry,
      wallBoxesDrywall: t.wallBoxesDrywall,
      installFaces: t.supports || t.installFaces,
      decorFaces: t.coverPlates || t.decorFaces,
      modules: t.modules,
      moduleFaces: t.moduleFaces,
    };
    
    sections.forEach(({ key, title }) => {
      const items = Object.values(boqData[key]);
      if (items.length === 0) return;
      
      // Calculate section total qty
      const sectionTotalQty = items.reduce((sum, item) => sum + item.qty, 0);
      
      // Estimate space needed: header (12) + table header (10) + rows (8 each) + subtotal (10) + padding (15)
      const estimatedHeight = 12 + 10 + (items.length * 8) + 10 + 15;
      
      if (yPos + estimatedHeight > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      // Fixed column widths for consistent alignment
      const col1Width = 75;  // Item / Articol
      const col2Width = 40;  // Color / Culoare
      const col3Width = 40;  // SKU / Cod
      const col4Width = 27;  // Qty / Cant.
      const totalTableWidth = col1Width + col2Width + col3Width + col4Width;
      
      // Section header with gray background - same width as table
      doc.setFillColor(80, 80, 80);
      doc.rect(10, yPos, totalTableWidth, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(removeDiacritics(sectionTitles[key] || title), 14, yPos + 6);
      doc.setTextColor(0, 0, 0);
      
      // Move position AFTER the header
      yPos += 8;
      
      // Localized table headers
      const tableHeaders = lang === 'ro' 
        ? [
            { content: 'Articol', styles: { halign: 'left' } },
            { content: 'Culoare', styles: { halign: 'right' } },
            { content: 'Cod', styles: { halign: 'right' } },
            { content: 'Cant.', styles: { halign: 'center' } }
          ]
        : [
            { content: 'Item', styles: { halign: 'left' } },
            { content: 'Color', styles: { halign: 'right' } },
            { content: 'SKU', styles: { halign: 'right' } },
            { content: 'Qty', styles: { halign: 'center' } }
          ];
      
      // Build table body with subtotal row
      const tableBody = items.map(item => [
        removeDiacritics(item.name) || '—', 
        removeDiacritics(item.color) || '—', 
        item.sku || '—', 
        item.qty.toString()
      ]);
      
      // Add subtotal row
      tableBody.push([
        { content: 'Subtotal:', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: sectionTotalQty.toString(), styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] } }
      ]);
      
      // Create independent table for this section
      autoTable(doc, {
        startY: yPos,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 9,
        },
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [50, 50, 50],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: col1Width, halign: 'left' },
          1: { cellWidth: col2Width, halign: 'right' },
          2: { cellWidth: col3Width, halign: 'right', fontStyle: 'italic', textColor: [100, 100, 100] },
          3: { cellWidth: col4Width, halign: 'center', fontStyle: 'bold' },
        },
        margin: { left: 10, right: 10 },
        tableId: key, // Unique ID for each table
      });
      
      // Get the final Y position immediately after this table
      const thisTableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos + 50);
      
      // Set position for next section with minimal padding
      yPos = thisTableFinalY + 5;
    });
    
    // Total needs consistent spacing from last table's finalY
    const lastTableEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos);
    yPos = lastTableEndY + 15; // 15px padding after last table
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const totalLabel = lang === 'ro' ? `TOTAL: ${totalItems} articole` : `TOTAL: ${totalItems} items`;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(totalLabel, pageWidth - 14, yPos, { align: 'right' });
    
    const pageCount = doc.internal.getNumberOfPages();
    const pageLabel = lang === 'ro' ? 'Pagina' : 'Page';
    const ofLabel = lang === 'ro' ? 'din' : 'of';
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `BTicino Living Now Configurator - ${pageLabel} ${i} ${ofLabel} ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.setTextColor(0, 0, 0);
    const filePrefix = lang === 'ro' ? 'BOQ_Furnizor' : 'BOQ_Supplier';
    const clientName = project.clientName ? removeDiacritics(project.clientName).replace(/\s+/g, '_') : 'Client';
    const dateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
    doc.save(`${filePrefix}_${clientName}_${dateStr}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="font-semibold">{t.billOfQuantities} ({t.forSupplier})</h2>
          <p className="text-sm text-gray-500">
            {project.name} · {project.assemblies.length} {t.assemblies} · {totalItems} {t.totalItems}
          </p>
        </div>
        {project.assemblies.length > 0 && (
          <button
            onClick={exportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <div className="divide-y">
          {sections.map(({ key, title }) => {
            const items = Object.values(boqData[key]);
            if (items.length === 0) return null;
            return (
              <div key={key} className="p-4">
                <h3 className="font-medium text-white bg-gray-600 px-3 py-2 rounded-t">{title}</h3>
                <table className="w-full text-sm border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-600">
                      <th className="p-2 border-b w-[40%]">{t.item}</th>
                      <th className="p-2 border-b w-[20%]">{t.color}</th>
                      <th className="p-2 border-b w-[25%]">{t.sku}</th>
                      <th className="p-2 border-b text-center w-[15%]">{t.qty}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 text-gray-600">{item.color}</td>
                        <td className="p-2 font-mono text-gray-400 italic">{item.sku || '—'}</td>
                        <td className="p-2 text-center font-mono font-bold">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function QuoteView({ project }) {
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const quoteData = useMemo(() => {
    const items = {
      wallBoxesMasonry: {},
      wallBoxesDrywall: {},
      installFaces: {},
      decorFaces: {},
      modules: {},
      moduleFaces: {},
    };

    project.assemblies.forEach((assembly) => {
      const colorName = getColorName(assembly.color, library, lang);
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Wall Box - separate by type
      const wbKey = `${assembly.size}M`;
      const wbPrice = getWallBoxPrice(assembly.size, wallBoxType, library);
      
      if (wallBoxType === 'drywall') {
        items.wallBoxesDrywall[wbKey] = items.wallBoxesDrywall[wbKey] || { 
          name: `${t.wallBoxDrywallItem} ${assembly.size}M`, 
          color: '—',
          unitPrice: wbPrice,
          qty: 0 
        };
        items.wallBoxesDrywall[wbKey].qty++;
      } else {
        items.wallBoxesMasonry[wbKey] = items.wallBoxesMasonry[wbKey] || { 
          name: `${t.wallBoxMasonryItem} ${assembly.size}M`, 
          color: '—',
          unitPrice: wbPrice,
          qty: 0 
        };
        items.wallBoxesMasonry[wbKey].qty++;
      }

      // Install Face
      const ifKey = `${assembly.size}M`;
      const ifPrice = getInstallFacePrice(assembly.size, library);
      items.installFaces[ifKey] = items.installFaces[ifKey] || { 
        name: `${t.supportItem} ${assembly.size}M`, 
        color: '—',
        unitPrice: ifPrice,
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfPrice = getDecorFacePrice(assembly.size, assembly.color, library);
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `${t.coverPlateItem} ${assembly.size}M`, 
        color: colorName,
        unitPrice: dfPrice,
        qty: 0 
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          // Module - use color-specific price
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const modPrice = getModulePrice(mod.moduleId, assembly.color, library);
          const translatedName = getModuleName(catalogItem, lang);
          items.modules[modKey] = items.modules[modKey] || { 
            name: translatedName, 
            color: colorName,
            unitPrice: modPrice,
            qty: 0 
          };
          items.modules[modKey].qty++;

          // Module Face
          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfPrice = getModuleFacePrice(mod.moduleId, assembly.color, library);
          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || { 
            name: `${translatedName} - ${t.face}`, 
            color: colorName,
            unitPrice: mfPrice,
            qty: 0 
          };
          items.moduleFaces[mfKey].qty++;
        }
      });
    });

    return items;
  }, [project, library, MODULE_CATALOG, t, lang]);

  const sections = [
    { key: 'wallBoxesMasonry', title: t.wallBoxesMasonry || 'Wall Boxes (Masonry)' },
    { key: 'wallBoxesDrywall', title: t.wallBoxesDrywall || 'Wall Boxes (Drywall)' },
    { key: 'installFaces', title: t.installFaces },
    { key: 'decorFaces', title: t.decorFaces },
    { key: 'modules', title: t.modules },
    { key: 'moduleFaces', title: t.moduleFaces },
  ];

  // Calculate totals
  const VAT_RATE = 0.21; // 21% TVA in Romania
  
  const calculateSectionTotal = (items) => {
    return Object.values(items).reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
  };

  const grandTotalWithVat = Object.values(quoteData).reduce(
    (sum, category) => sum + calculateSectionTotal(category),
    0
  );
  
  // Prices in library are stored WITH VAT, so we calculate backwards
  const grandTotalWithoutVat = grandTotalWithVat / (1 + VAT_RATE);
  const vatAmount = grandTotalWithVat - grandTotalWithoutVat;

  const totalItems = Object.values(quoteData).reduce(
    (sum, category) => sum + Object.values(category).reduce((s, item) => s + item.qty, 0),
    0
  );

  const formatPrice = (price) => {
    return price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Calculate price without VAT from price with VAT
  const priceWithoutVat = (priceWithVat) => priceWithVat / (1 + VAT_RATE);

  // Export PDF function for Quote
  const exportQuotePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Function to remove diacritics - handles both comma and cedilla variants
    const removeDiacritics = (str) => {
      if (!str) return str;
      return str
        .replace(/[ăÄƒ]/g, 'a').replace(/[ĂÄ‚]/g, 'A')
        .replace(/[âÃ¢]/g, 'a').replace(/[ÂÃ‚]/g, 'A')
        .replace(/[îÃ®]/g, 'i').replace(/[ÎÃŽ]/g, 'I')
        .replace(/[șşÈ™]/g, 's').replace(/[ȘŞÈ˜]/g, 'S')
        .replace(/[țţÈ›]/g, 't').replace(/[ȚŢÈš]/g, 'T');
    };
    
    doc.setFont('helvetica');
    
    // Localized labels
    const pdfTitle = lang === 'ro' ? 'Oferta Client' : 'Client Quote';
    const pdfSubtitle = lang === 'ro' ? 'Toate preturile includ TVA 21%' : 'All prices include VAT 21%';
    const pdfProject = lang === 'ro' ? 'Proiect:' : 'Project:';
    const pdfClient = lang === 'ro' ? 'Client:' : 'Client:';
    const pdfDate = lang === 'ro' ? 'Data:' : 'Date:';
    const pdfItems = lang === 'ro' ? 'Articole:' : 'Items:';
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfTitle, pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(pdfSubtitle, pageWidth / 2, 28, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 33, pageWidth - 14, 33);
    
    // Project info box
    doc.setFillColor(248, 249, 250);
    doc.rect(14, 38, pageWidth - 28, 28, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(14, 38, pageWidth - 28, 28, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfProject, 18, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.name) || '—', 50, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfClient, 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.clientName) || '—', 50, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfDate, 110, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('ro-RO'), 135, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text(pdfItems, 110, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(totalItems.toString(), 135, 55);
    
    let yPos = 78;
    
    // Section titles from translations
    const sectionTitles = {
      wallBoxesMasonry: t.wallBoxesMasonry,
      wallBoxesDrywall: t.wallBoxesDrywall,
      installFaces: t.supports || t.installFaces,
      decorFaces: t.coverPlates || t.decorFaces,
      modules: t.modules,
      moduleFaces: t.moduleFaces,
    };
    
    // Fixed column widths for quote (6 columns) - adjusted for smaller margins
    const col1Width = 60;  // Item / Articol
    const col2Width = 25;  // Color / Culoare
    const col3Width = 28;  // Unit (excl. VAT)
    const col4Width = 28;  // Unit (incl. VAT)
    const col5Width = 18;  // Qty
    const col6Width = 30;  // Total (with "lei")
    const totalTableWidth = col1Width + col2Width + col3Width + col4Width + col5Width + col6Width;
    
    sections.forEach(({ key, title }) => {
      const items = Object.values(quoteData[key]);
      if (items.length === 0) return;
      
      const sectionTotalWithVat = calculateSectionTotal(quoteData[key]);
      const sectionTotalQty = items.reduce((sum, item) => sum + item.qty, 0);
      
      // Estimate space needed
      const estimatedHeight = 12 + 10 + (items.length * 8) + 10 + 15;
      
      if (yPos + estimatedHeight > 285) {
        doc.addPage();
        yPos = 12;
      }
      
      // Section header with gray background
      doc.setFillColor(80, 80, 80);
      doc.rect(10, yPos, totalTableWidth, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(removeDiacritics(sectionTitles[key] || title), 14, yPos + 6);
      doc.setTextColor(0, 0, 0);
      
      // Move position AFTER the header
      yPos += 8;
      
      // Build table body with items + subtotal row
      const tableBody = items.map(item => {
        const unitWithoutVat = priceWithoutVat(item.unitPrice);
        const totalWithVat = item.unitPrice * item.qty;
        return [
          removeDiacritics(item.name) || '—', 
          removeDiacritics(item.color) || '—', 
          formatPrice(unitWithoutVat),
          formatPrice(item.unitPrice),
          item.qty.toString(),
          formatPrice(totalWithVat) + ' lei'
        ];
      });
      
      // Add subtotal row to table body with qty and price
      tableBody.push([
        { content: 'Subtotal:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: sectionTotalQty.toString(), styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: formatPrice(sectionTotalWithVat) + ' lei', styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } }
      ]);
      
      // Localized table headers
      const tableHeaders = lang === 'ro' ? [
        { content: 'Articol', styles: { halign: 'left' } },
        { content: 'Culoare', styles: { halign: 'right' } },
        { content: 'Unitar (fara TVA)', styles: { halign: 'right' } },
        { content: 'Unitar (cu TVA)', styles: { halign: 'right' } },
        { content: 'Cant.', styles: { halign: 'center' } },
        { content: 'Total', styles: { halign: 'right' } }
      ] : [
        { content: 'Item', styles: { halign: 'left' } },
        { content: 'Color', styles: { halign: 'right' } },
        { content: 'Unit (excl. VAT)', styles: { halign: 'right' } },
        { content: 'Unit (incl. VAT)', styles: { halign: 'right' } },
        { content: 'Qty', styles: { halign: 'center' } },
        { content: 'Total', styles: { halign: 'right' } }
      ];
      
      // Create independent table for this section
      autoTable(doc, {
        startY: yPos,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        styles: {
          fontSize: 8,
        },
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [50, 50, 50],
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: col1Width, halign: 'left' },
          1: { cellWidth: col2Width, halign: 'right' },
          2: { cellWidth: col3Width, halign: 'right', textColor: [100, 100, 100] },
          3: { cellWidth: col4Width, halign: 'right' },
          4: { cellWidth: col5Width, halign: 'center' },
          5: { cellWidth: col6Width, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 10, right: 10 },
        tableId: key, // Unique ID for each table
      });
      
      // Get the final Y position immediately after this table
      const thisTableFinalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos + 50);
      
      // Set position for next section with padding
      yPos = thisTableFinalY + 10;
    });
    
    // Grand total box - use last table's final position
    const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY : (doc.previousAutoTable ? doc.previousAutoTable.finalY : yPos);
    yPos = lastY + 15;
    
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    // Grand Total Box
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - 100, yPos, 86, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(pageWidth - 100, yPos, 86, 40, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Total without VAT
    doc.text('Total (fara TVA):', pageWidth - 96, yPos + 10);
    doc.text(formatPrice(grandTotalWithoutVat) + ' lei', pageWidth - 18, yPos + 10, { align: 'right' });
    
    // VAT Amount
    doc.text('TVA (21%):', pageWidth - 96, yPos + 20);
    doc.text(formatPrice(vatAmount) + ' lei', pageWidth - 18, yPos + 20, { align: 'right' });
    
    // Total with VAT
    doc.setDrawColor(150, 150, 150);
    doc.line(pageWidth - 96, yPos + 25, pageWidth - 18, yPos + 25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 96, yPos + 35);
    doc.text(formatPrice(grandTotalWithVat) + ' lei', pageWidth - 18, yPos + 35, { align: 'right' });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(
        `BTicino Living Now Configurator - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Reset text color and save
    doc.setTextColor(0, 0, 0);
    const filePrefix = lang === 'ro' ? 'Oferta' : 'Quote';
    const clientName = project.clientName ? removeDiacritics(project.clientName).replace(/\s+/g, '_') : 'Client';
    const dateStr = new Date().toLocaleDateString('ro-RO').replace(/\./g, '-');
    doc.save(`${filePrefix}_${clientName}_${dateStr}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{t.clientQuote}</h2>
            <p className="text-gray-600 mt-1">{project.name}</p>
            {project.clientName && (
              <p className="text-gray-500">{t.quoteFor}: {project.clientName}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-gray-500">
              <p>{t.date}: {new Date().toLocaleDateString()}</p>
              <p>{project.assemblies.length} {t.assemblies}</p>
              <p>{totalItems} {t.totalItems}</p>
            </div>
            {project.assemblies.length > 0 && (
              <button
                onClick={exportQuotePDF}
                className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <>
          <div className="divide-y">
            {sections.map(({ key, title }) => {
              const items = Object.values(quoteData[key]);
              if (items.length === 0) return null;
              const sectionTotalWithVat = calculateSectionTotal(quoteData[key]);
              const sectionTotalWithoutVat = sectionTotalWithVat / (1 + VAT_RATE);
              return (
                <div key={key} className="p-4">
                  <h3 className="font-medium text-white bg-gray-600 px-3 py-2 rounded-t">{title}</h3>
                  <table className="w-full text-sm border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600">
                        <th className="p-2 border-b w-[30%]">{t.item}</th>
                        <th className="p-2 border-b w-[12%]">{t.color}</th>
                        <th className="p-2 border-b text-right w-[15%]">{t.unitPriceExclVat}</th>
                        <th className="p-2 border-b text-right w-[15%]">{t.unitPriceInclVat}</th>
                        <th className="p-2 border-b text-center w-[10%]">{t.qty}</th>
                        <th className="p-2 border-b text-right w-[18%]">{t.total}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const unitWithoutVat = priceWithoutVat(item.unitPrice);
                        const totalWithVat = item.unitPrice * item.qty;
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-gray-600">{item.color}</td>
                            <td className="p-2 text-right font-mono text-gray-400">{formatPrice(unitWithoutVat)}</td>
                            <td className="p-2 text-right font-mono">{formatPrice(item.unitPrice)}</td>
                            <td className="p-2 text-center font-mono">{item.qty}</td>
                            <td className="p-2 text-right font-mono font-bold">
                              {formatPrice(totalWithVat)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan={5} className="p-2 text-right font-bold">{t.subtotal}:</td>
                        <td className="p-2 text-right font-mono font-bold">{formatPrice(sectionTotalWithVat)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Grand Total with VAT breakdown */}
          <div className="p-6 bg-gray-100 border-t mt-8">
            <div className="flex justify-between items-start">
              <div className="text-sm text-gray-600">
                <p className="mb-1">{t.vatRate}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">{t.totalWithoutVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotalWithoutVat)}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-600">{t.vatAmount}:</span>
                    <span className="font-mono">{formatPrice(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between gap-8 pt-2 border-t border-gray-300">
                    <span className="font-semibold">{t.totalWithVat}:</span>
                    <span className="font-mono font-bold text-lg">{formatPrice(grandTotalWithVat)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Profit View ---
function ProfitView({ project }) {
  const library = React.useContext(LibraryContext);
  const t = useTranslation();
  const lang = useLanguage();
  const MODULE_CATALOG = getModuleCatalog(library);

  const profitData = useMemo(() => {
    const items = {
      wallBoxesMasonry: {},
      wallBoxesDrywall: {},
      installFaces: {},
      decorFaces: {},
      modules: {},
      moduleFaces: {},
    };

    project.assemblies.forEach((assembly) => {
      const colorName = getColorName(assembly.color, library, lang);
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Wall Box
      const wbKey = `${assembly.size}M`;
      const wbData = wallBoxType === 'drywall' 
        ? library.wallBoxesDrywall?.[assembly.size] 
        : library.wallBoxesMasonry?.[assembly.size];
      const wbPurchase = wbData?.purchasePrice || 0;
      const wbPrice = wbData?.price || 0;
      const wbSellingWithoutVat = wbPrice / (1 + VAT_RATE);
      
      const wbCategory = wallBoxType === 'drywall' ? 'wallBoxesDrywall' : 'wallBoxesMasonry';
      const wbName = wallBoxType === 'drywall' 
        ? `${t.wallBoxDrywallItem} ${assembly.size}M`
        : `${t.wallBoxMasonryItem} ${assembly.size}M`;
      
      items[wbCategory][wbKey] = items[wbCategory][wbKey] || { 
        name: wbName,
        color: '—',
        purchasePrice: wbPurchase,
        sellingPrice: wbSellingWithoutVat,
        qty: 0 
      };
      items[wbCategory][wbKey].qty++;

      // Install Face
      const ifKey = `${assembly.size}M`;
      const ifData = library.installFaces?.[assembly.size];
      const ifPurchase = ifData?.purchasePrice || 0;
      const ifPrice = ifData?.price || 0;
      const ifSellingWithoutVat = ifPrice / (1 + VAT_RATE);
      
      items.installFaces[ifKey] = items.installFaces[ifKey] || { 
        name: `${t.supportItem} ${assembly.size}M`,
        color: '—',
        purchasePrice: ifPurchase,
        sellingPrice: ifSellingWithoutVat,
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfData = library.decorFaces?.[`${assembly.size}-${assembly.color}`];
      const dfPurchase = dfData?.purchasePrice || 0;
      const dfPrice = dfData?.price || 0;
      const dfSellingWithoutVat = dfPrice / (1 + VAT_RATE);
      
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `${t.coverPlateItem} ${assembly.size}M`,
        color: colorName,
        purchasePrice: dfPurchase,
        sellingPrice: dfSellingWithoutVat,
        qty: 0 
      };
      items.decorFaces[dfKey].qty++;

      // Modules and their faces
      assembly.modules.forEach((mod) => {
        const catalogItem = MODULE_CATALOG.find(c => c.id === mod.moduleId);
        if (catalogItem) {
          const translatedName = getModuleName(catalogItem, lang);
          
          // Module
          const modKey = `${mod.moduleId}-${assembly.color}`;
          const modPurchase = typeof catalogItem.modulePurchasePrice === 'object' 
            ? catalogItem.modulePurchasePrice?.[assembly.color] || 0 
            : catalogItem.modulePurchasePrice || 0;
          const modPrice = typeof catalogItem.modulePrice === 'object'
            ? catalogItem.modulePrice?.[assembly.color] || 0
            : catalogItem.modulePrice || 0;
          const modSellingWithoutVat = modPrice / (1 + VAT_RATE);
          
          items.modules[modKey] = items.modules[modKey] || { 
            name: translatedName,
            color: colorName,
            purchasePrice: modPurchase,
            sellingPrice: modSellingWithoutVat,
            qty: 0 
          };
          items.modules[modKey].qty++;

          // Module Face
          const mfKey = `${mod.moduleId}-${assembly.color}-face`;
          const mfPurchase = catalogItem.facePurchasePrice?.[assembly.color] || 0;
          const mfPrice = catalogItem.facePrice?.[assembly.color] || 0;
          const mfSellingWithoutVat = mfPrice / (1 + VAT_RATE);
          
          items.moduleFaces[mfKey] = items.moduleFaces[mfKey] || { 
            name: `${translatedName} - ${t.face}`,
            color: colorName,
            purchasePrice: mfPurchase,
            sellingPrice: mfSellingWithoutVat,
            qty: 0 
          };
          items.moduleFaces[mfKey].qty++;
        }
      });
    });

    return items;
  }, [project, library, MODULE_CATALOG, t, lang]);

  const sections = [
    { key: 'wallBoxesMasonry', title: t.wallBoxesMasonry || 'Wall Boxes (Masonry)' },
    { key: 'wallBoxesDrywall', title: t.wallBoxesDrywall || 'Wall Boxes (Drywall)' },
    { key: 'installFaces', title: t.installFaces },
    { key: 'decorFaces', title: t.decorFaces },
    { key: 'modules', title: t.modules },
    { key: 'moduleFaces', title: t.moduleFaces },
  ];

  // Calculate totals
  const calculateSectionTotals = (items) => {
    let totalPurchase = 0;
    let totalSelling = 0;
    Object.values(items).forEach(item => {
      totalPurchase += item.purchasePrice * item.qty;
      totalSelling += item.sellingPrice * item.qty;
    });
    return { totalPurchase, totalSelling, profit: totalSelling - totalPurchase };
  };

  const grandTotals = useMemo(() => {
    let totalPurchase = 0;
    let totalSelling = 0;
    
    Object.values(profitData).forEach(category => {
      Object.values(category).forEach(item => {
        totalPurchase += item.purchasePrice * item.qty;
        totalSelling += item.sellingPrice * item.qty;
      });
    });
    
    const grossProfit = totalSelling - totalPurchase;
    const profitMargin = totalSelling > 0 ? (grossProfit / totalSelling) * 100 : 0;
    
    // VAT calculations
    const vatCollected = totalSelling * VAT_RATE; // TVA colectat din vânzări
    const vatDeductible = totalPurchase * VAT_RATE; // TVA deductibil din achiziții
    const vatPayable = vatCollected - vatDeductible; // TVA de plată
    
    return {
      totalPurchase,
      totalSelling,
      grossProfit,
      profitMargin,
      vatCollected,
      vatDeductible,
      vatPayable
    };
  }, [profitData]);

  const totalItems = Object.values(profitData).reduce(
    (sum, category) => sum + Object.values(category).reduce((s, item) => s + item.qty, 0),
    0
  );

  const formatPrice = (price) => {
    return price.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="font-semibold text-lg">{t.profitAnalysis}</h2>
          <p className="text-sm text-gray-500">{project.name} · {totalItems} {t.totalItems?.toLowerCase()}</p>
        </div>
      </div>

      {project.assemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{t.noAssemblies}</p>
      ) : (
        <>
          <div className="divide-y">
            {sections.map(({ key, title }) => {
              const items = Object.values(profitData[key]);
              if (items.length === 0) return null;
              const sectionTotals = calculateSectionTotals(profitData[key]);
              
              return (
                <div key={key} className="p-4">
                  <h3 className="font-medium text-white bg-gray-600 px-3 py-2 rounded-t">{title}</h3>
                  <table className="w-full text-sm border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-600">
                        <th className="p-2 border-b w-[26%]">{t.item}</th>
                        <th className="p-2 border-b w-[10%]">{t.color}</th>
                        <th className="p-2 border-b text-right w-[12%]">{t.unitPurchase}</th>
                        <th className="p-2 border-b text-right w-[12%]">{t.unitSelling}</th>
                        <th className="p-2 border-b text-right w-[10%]">{t.unitDifference}</th>
                        <th className="p-2 border-b text-center w-[8%]">{t.qty}</th>
                        <th className="p-2 border-b text-right w-[14%]">{t.unitProfit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const unitDiff = item.sellingPrice - item.purchasePrice;
                        const lineProfit = unitDiff * item.qty;
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-gray-600">{item.color}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{formatPrice(item.purchasePrice)}</td>
                            <td className="p-2 text-right font-mono">{formatPrice(item.sellingPrice)}</td>
                            <td className={`p-2 text-right font-mono ${unitDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPrice(unitDiff)}</td>
                            <td className="p-2 text-center font-mono">{item.qty}</td>
                            <td className={`p-2 text-right font-mono font-bold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPrice(lineProfit)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan={6} className="p-2 text-right font-bold">{t.subtotal}:</td>
                        <td className={`p-2 text-right font-mono font-bold ${sectionTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPrice(sectionTotals.profit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Grand Totals - Profit Summary */}
          <div className="p-6 bg-green-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profit Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{t.grossProfit}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.purchaseTotalExclVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.totalPurchase)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.sellingTotalExclVat}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.totalSelling)} RON</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">{t.grossProfit}:</span>
                    <span className={`font-mono font-bold text-lg ${grandTotals.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(grandTotals.grossProfit)} RON
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t.profitMargin}:</span>
                    <span className="font-mono">{grandTotals.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* VAT Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">{t.vatPayable}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vatCollected}:</span>
                    <span className="font-mono">{formatPrice(grandTotals.vatCollected)} RON</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.vatDeductible}:</span>
                    <span className="font-mono">-{formatPrice(grandTotals.vatDeductible)} RON</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold">{t.vatPayable}:</span>
                    <span className={`font-mono font-bold text-lg ${grandTotals.vatPayable >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatPrice(grandTotals.vatPayable)} RON
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// LIBRARY PAGE
// ============================================================================

function LibraryPage({ library, onUpdate, onBack, isAdmin = false, onSwitchSystem }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [editingModule, setEditingModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const t = useTranslation();
  const lang = useLanguage();

  // Protect updates - non-admins cannot modify
  const safeOnUpdate = isAdmin ? onUpdate : () => {};

  // New module form state
  const [newModule, setNewModule] = useState({
    id: '',
    moduleHasColorVariants: false,
    faceHasColorVariants: true,
    moduleSku: '',
    nameEn: '',
    nameRo: '',
    size: 1,
    category: 'outlet',
    faceSku: {},
    modulePurchasePrice: 0,
    moduleMarkup: 25,
    modulePrice: 0,
    facePurchasePrice: {},
    faceMarkup: {},
    facePrice: {},
  });

  // New preset form state
  const [newPreset, setNewPreset] = useState({
    id: '',
    nameEn: '',
    nameRo: '',
    type: 'outlet',
    size: 2,
    modules: [],
  });

  const updateWallBoxMasonry = (size, field, value) => {
    const currentItem = library.wallBoxesMasonry?.[size] || {};
    safeOnUpdate({
      ...library,
      wallBoxesMasonry: {
        ...library.wallBoxesMasonry,
        [size]: {
          ...currentItem,
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateWallBoxDrywall = (size, field, value) => {
    const currentItem = library.wallBoxesDrywall?.[size] || {};
    safeOnUpdate({
      ...library,
      wallBoxesDrywall: {
        ...library.wallBoxesDrywall,
        [size]: {
          ...currentItem,
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateInstallFace = (size, field, value) => {
    safeOnUpdate({
      ...library,
      installFaces: {
        ...library.installFaces,
        [size]: {
          ...library.installFaces[size],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateDecorFace = (key, field, value) => {
    safeOnUpdate({
      ...library,
      decorFaces: {
        ...library.decorFaces,
        [key]: {
          ...library.decorFaces[key],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateModule = (moduleId, updates) => {
    safeOnUpdate({
      ...library,
      modules: library.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      ),
    });
  };

  const addModule = () => {
    if (!newModule.id.trim() || !newModule.nameEn.trim()) {
      alert(t.enterIdAndName);
      return;
    }
    if (library.modules.some(m => m.id === newModule.id)) {
      alert(t.moduleIdExists);
      return;
    }
    safeOnUpdate({
      ...library,
      modules: [...library.modules, { ...newModule }],
    });
    setNewModule({
      id: '',
      moduleHasColorVariants: false,
      faceHasColorVariants: true,
      moduleSku: '',
      nameEn: '',
      nameRo: '',
      size: 1,
      category: 'outlet',
      faceSku: { white: '', black: '' },
      modulePurchasePrice: 0,
      moduleMarkup: 25,
      modulePrice: 0,
      facePurchasePrice: { white: 0, black: 0 },
      faceMarkup: { white: 25, black: 25 },
      facePrice: { white: 0, black: 0 },
    });
    setShowAddModule(false);
  };

  const deleteModule = (moduleId) => {
    safeOnUpdate({
      ...library,
      modules: library.modules.filter(m => m.id !== moduleId),
    });
    setConfirmDeleteId(null);
  };

  // Preset functions
  const addPreset = () => {
    if (!newPreset.id.trim() || !newPreset.nameEn.trim()) {
      alert(t.enterIdAndName);
      return;
    }
    if (library.presets?.some(p => p.id === newPreset.id)) {
      alert('A preset with this ID already exists');
      return;
    }
    safeOnUpdate({
      ...library,
      presets: [...(library.presets || []), { ...newPreset }],
    });
    setNewPreset({
      id: '',
      nameEn: '',
      nameRo: '',
      type: 'outlet',
      size: 2,
      modules: [],
    });
    setShowAddPreset(false);
  };

  const updatePreset = (presetId, updates) => {
    safeOnUpdate({
      ...library,
      presets: (library.presets || []).map(p => 
        p.id === presetId ? { ...p, ...updates } : p
      ),
    });
  };

  const deletePreset = (presetId) => {
    safeOnUpdate({
      ...library,
      presets: (library.presets || []).filter(p => p.id !== presetId),
    });
    setConfirmDeleteId(null);
  };

  const getPresetName = (preset) => lang === 'ro' ? (preset.nameRo || preset.nameEn) : preset.nameEn;
  const getModuleNameById = (moduleId) => {
    const mod = library.modules?.find(m => m.id === moduleId);
    if (!mod) return moduleId;
    return lang === 'ro' ? (mod.nameRo || mod.nameEn) : mod.nameEn;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 mb-4 hover:text-blue-800"
      >
        <ChevronLeft className="w-4 h-4" /> {t.backToProjects}
      </button>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" /> {t.componentLibrary}
            </h1>
            <p className="text-gray-600">{t.manageSKUs}</p>
          </div>
          {isAdmin && onSwitchSystem && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t.editingSystem}:</label>
              <select
                value={library.systemId || 'bticino'}
                onChange={(e) => onSwitchSystem(e.target.value)}
                className="border rounded px-3 py-2 bg-white font-medium"
              >
                {SYSTEMS.map(sys => (
                  <option key={sys.id} value={sys.id}>{lang === 'ro' ? sys.nameRo : sys.nameEn}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {!isAdmin && (
          <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-sm">
            🔒 {lang === 'ro' ? 'Vizualizare doar. Doar conturile @atelierazimut.com pot edita biblioteca.' : 'View only. Only @atelierazimut.com accounts can edit the library.'}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded ${activeTab === 'colors' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          🎨 {t.manageColors}
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded ${activeTab === 'modules' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.modules}
        </button>
        <button
          onClick={() => setActiveTab('wallboxes')}
          className={`px-4 py-2 rounded ${activeTab === 'wallboxes' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.wallBoxes}
        </button>
        <button
          onClick={() => setActiveTab('installfaces')}
          className={`px-4 py-2 rounded ${activeTab === 'installfaces' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.installFaces}
        </button>
        <button
          onClick={() => setActiveTab('decorfaces')}
          className={`px-4 py-2 rounded ${activeTab === 'decorfaces' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {t.decorFacesTab}
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded ${activeTab === 'presets' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          {t.presets}
        </button>
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="font-semibold">{t.presets}</h2>
              <p className="text-sm text-gray-500">{t.presetsDescription}</p>
            </div>
            {isAdmin && (
            <button
              onClick={() => setShowAddPreset(true)}
              className="bg-purple-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" /> {t.addPreset}
            </button>
            )}
          </div>

          {/* Add Preset Form */}
          {showAddPreset && (
            <div className="p-4 bg-purple-50 border-b">
              <h3 className="font-medium mb-3">{t.addPreset}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">ID</label>
                  <input
                    type="text"
                    value={newPreset.id}
                    onChange={(e) => setNewPreset({ ...newPreset, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="e.g., triple_outlet"
                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.presetName} (EN)</label>
                  <input
                    type="text"
                    value={newPreset.nameEn}
                    onChange={(e) => setNewPreset({ ...newPreset, nameEn: e.target.value })}
                    placeholder="e.g., Triple Outlet"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.presetName} (RO)</label>
                  <input
                    type="text"
                    value={newPreset.nameRo}
                    onChange={(e) => setNewPreset({ ...newPreset, nameRo: e.target.value })}
                    placeholder="ex: Priză Triplă"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.presetType}</label>
                    <select
                      value={newPreset.type}
                      onChange={(e) => setNewPreset({ ...newPreset, type: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="outlet">{t.outlet}</option>
                      <option value="switch">{t.switch}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.size}</label>
                    <select
                      value={newPreset.size}
                      onChange={(e) => setNewPreset({ ...newPreset, size: parseInt(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      {FRAME_SIZES.map(s => (
                        <option key={s} value={s}>{s}M</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Module selection */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">{t.presetModules}</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPreset.modules.map((moduleId, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                      {getModuleNameById(moduleId)}
                      <button
                        onClick={() => setNewPreset({
                          ...newPreset,
                          modules: newPreset.modules.filter((_, i) => i !== idx)
                        })}
                        className="text-purple-600 hover:text-purple-800"
                      >×</button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setNewPreset({
                        ...newPreset,
                        modules: [...newPreset.modules, e.target.value]
                      });
                      e.target.value = '';
                    }
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">+ Add module...</option>
                  {library.modules?.map(mod => (
                    <option key={mod.id} value={mod.id}>
                      {getModuleNameById(mod.id)} ({mod.size}M)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addPreset}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm hover:bg-purple-700"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setShowAddPreset(false);
                    setNewPreset({ id: '', nameEn: '', nameRo: '', type: 'outlet', size: 2, modules: [] });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* Preset List */}
          <div className="divide-y">
            {/* Outlet Presets */}
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> {t.outlets}
              </h3>
              {(library.presets || []).filter(p => p.type === 'outlet').length === 0 ? (
                <p className="text-gray-400 text-sm">{t.noPresets}</p>
              ) : (
                <div className="space-y-2">
                  {(library.presets || []).filter(p => p.type === 'outlet').map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{getPresetName(preset)}</div>
                        <div className="text-sm text-gray-500">
                          {preset.size}M · {preset.modules.map(m => getModuleNameById(m)).join(' + ')}
                        </div>
                      </div>
                      {isAdmin && (
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === preset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t.delete}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(preset.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Switch Presets */}
            <div className="p-4">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {t.switches}
              </h3>
              {(library.presets || []).filter(p => p.type === 'switch').length === 0 ? (
                <p className="text-gray-400 text-sm">{t.noPresets}</p>
              ) : (
                <div className="space-y-2">
                  {(library.presets || []).filter(p => p.type === 'switch').map(preset => (
                    <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{getPresetName(preset)}</div>
                        <div className="text-sm text-gray-500">
                          {preset.size}M · {preset.modules.map(m => getModuleNameById(m)).join(' + ')}
                        </div>
                      </div>
                      {isAdmin && (
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === preset.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                            >
                              {t.delete}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                            >
                              {t.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(preset.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">{t.modules}</h2>
            {isAdmin && (
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> {t.addModule}
            </button>
            )}
          </div>

          {/* Add Module Form */}
          {showAddModule && (
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="font-medium mb-3">{t.addNewModule}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t.moduleId}</label>
                  <input
                    type="text"
                    value={newModule.id}
                    onChange={(e) => setNewModule({ ...newModule, id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="e.g., switch_double"
                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.moduleName} (EN)</label>
                  <input
                    type="text"
                    value={newModule.nameEn}
                    onChange={(e) => setNewModule({ ...newModule, nameEn: e.target.value })}
                    placeholder="e.g., Double Switch"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.moduleName} (RO)</label>
                  <input
                    type="text"
                    value={newModule.nameRo}
                    onChange={(e) => setNewModule({ ...newModule, nameRo: e.target.value })}
                    placeholder="ex: Întrerupător Dublu"
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.size}</label>
                    <select
                      value={newModule.size}
                      onChange={(e) => setNewModule({ ...newModule, size: parseInt(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4].map(s => (
                        <option key={s} value={s}>{s}M</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t.category}</label>
                    <select
                      value={newModule.category}
                      onChange={(e) => setNewModule({ ...newModule, category: e.target.value })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="outlet">{t.outlet}</option>
                      <option value="switch">{t.switch}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Module color variants checkbox */}
              <div className="mb-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.moduleHasColorVariants || false}
                    onChange={(e) => {
                      const has = e.target.checked;
                      const colors = getAvailableColors(library);
                      setNewModule({
                        ...newModule,
                        moduleHasColorVariants: has,
                        moduleSku: has ? buildColorObj(colors, '') : '',
                        modulePurchasePrice: has ? buildColorObj(colors, 0) : 0,
                        moduleMarkup: has ? buildColorObj(colors, 25) : 25,
                        modulePrice: has ? buildColorObj(colors, 0) : 0,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t.moduleHasColorVariants}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.faceHasColorVariants !== false}
                    onChange={(e) => {
                      const has = e.target.checked;
                      const colors = getAvailableColors(library);
                      setNewModule({
                        ...newModule,
                        faceHasColorVariants: has,
                        faceSku: has ? buildColorObj(colors, '') : '',
                        facePurchasePrice: has ? buildColorObj(colors, 0) : 0,
                        faceMarkup: has ? buildColorObj(colors, 25) : 25,
                        facePrice: has ? buildColorObj(colors, 0) : 0,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t.faceHasColorVariants}</span>
                </label>
              </div>
              
              {/* SKU & Price Table - dynamic colors */}
              <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4 border rounded bg-white">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 border-b">{t.item}</th>
                    <th className="p-2 border-b">{t.sku}</th>
                    <th className="p-2 border-b">{t.purchasePrice}</th>
                    <th className="p-2 border-b">{t.markup}</th>
                    <th className="p-2 border-b">{t.sellingPrice}</th>
                    <th className="p-2 border-b">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {newModule.moduleHasColorVariants ? (
                    getAvailableColors(library).map((color, idx) => (
                      <tr key={`mod-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                        <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.modules} ({getColorName(color.id, library, lang)})</span></td>
                        <td className="p-2"><input type="text" value={newModule.moduleSku?.[color.id] || ''} onChange={(e) => setNewModule({...newModule, moduleSku: {...(typeof newModule.moduleSku === 'object' ? newModule.moduleSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                        <td className="p-2"><input type="number" step="0.01" value={newModule.modulePurchasePrice?.[color.id] || 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = newModule.moduleMarkup?.[color.id]||25; setNewModule({...newModule, modulePurchasePrice: {...newModule.modulePurchasePrice, [color.id]: pp}, modulePrice: {...newModule.modulePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2"><PriceInput value={newModule.moduleMarkup?.[color.id]||25} onChange={(mk) => { const pp = newModule.modulePurchasePrice?.[color.id]||0; setNewModule({...newModule, moduleMarkup: {...newModule.moduleMarkup, [color.id]: mk}, modulePrice: {...newModule.modulePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2 text-gray-500 font-mono text-sm">{((newModule.modulePrice?.[color.id]||0)/(1+VAT_RATE)).toFixed(2)}</td>
                        <td className="p-2"><PriceInput value={newModule.modulePrice?.[color.id]||0} onChange={(np) => { const pp = newModule.modulePurchasePrice?.[color.id]||0; setNewModule({...newModule, moduleMarkup: {...newModule.moduleMarkup, [color.id]: calcMarkupFromPriceWithVat(pp, np)}, modulePrice: {...newModule.modulePrice, [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b">
                      <td className="p-2 font-medium">{t.modules}</td>
                      <td className="p-2"><input type="text" value={typeof newModule.moduleSku === 'string' ? newModule.moduleSku : ''} onChange={(e) => setNewModule({...newModule, moduleSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                      <td className="p-2"><input type="number" step="0.01" value={typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof newModule.moduleMarkup === 'number' ? newModule.moduleMarkup : 25; setNewModule({...newModule, modulePurchasePrice: pp, modulePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2"><PriceInput value={typeof newModule.moduleMarkup === 'number' ? newModule.moduleMarkup : 25} onChange={(mk) => { const pp = typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0; setNewModule({...newModule, moduleMarkup: mk, modulePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2 text-gray-500 font-mono text-sm">{((typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0)/(1+VAT_RATE)).toFixed(2)}</td>
                      <td className="p-2"><PriceInput value={typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0} onChange={(np) => { const pp = typeof newModule.modulePurchasePrice === 'number' ? newModule.modulePurchasePrice : 0; setNewModule({...newModule, moduleMarkup: calcMarkupFromPriceWithVat(pp, np), modulePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                    </tr>
                  )}
                  {/* Face rows - dynamic per color */}
                  {(newModule.faceHasColorVariants !== false) ? (
                    getAvailableColors(library).map((color, idx) => (
                      <tr key={`face-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                        <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.face} ({getColorName(color.id, library, lang)})</span></td>
                        <td className="p-2"><input type="text" value={newModule.faceSku?.[color.id] || ''} onChange={(e) => setNewModule({...newModule, faceSku: {...(typeof newModule.faceSku === 'object' ? newModule.faceSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                        <td className="p-2"><input type="number" step="0.01" value={newModule.facePurchasePrice?.[color.id] || 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = newModule.faceMarkup?.[color.id]||25; setNewModule({...newModule, facePurchasePrice: {...newModule.facePurchasePrice, [color.id]: pp}, facePrice: {...newModule.facePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2"><PriceInput value={newModule.faceMarkup?.[color.id]||25} onChange={(mk) => { const pp = newModule.facePurchasePrice?.[color.id]||0; setNewModule({...newModule, faceMarkup: {...newModule.faceMarkup, [color.id]: mk}, facePrice: {...newModule.facePrice, [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                        <td className="p-2 text-gray-500 font-mono text-sm">{((newModule.facePrice?.[color.id]||0)/(1+VAT_RATE)).toFixed(2)}</td>
                        <td className="p-2"><PriceInput value={newModule.facePrice?.[color.id]||0} onChange={(np) => { const pp = newModule.facePurchasePrice?.[color.id]||0; setNewModule({...newModule, faceMarkup: {...newModule.faceMarkup, [color.id]: calcMarkupFromPriceWithVat(pp, np)}, facePrice: {...newModule.facePrice, [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b">
                      <td className="p-2 font-medium">{t.face}</td>
                      <td className="p-2"><input type="text" value={typeof newModule.faceSku === 'string' ? newModule.faceSku : ''} onChange={(e) => setNewModule({...newModule, faceSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                      <td className="p-2"><input type="number" step="0.01" value={typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof newModule.faceMarkup === 'number' ? newModule.faceMarkup : 25; setNewModule({...newModule, facePurchasePrice: pp, facePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2"><PriceInput value={typeof newModule.faceMarkup === 'number' ? newModule.faceMarkup : 25} onChange={(mk) => { const pp = typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0; setNewModule({...newModule, faceMarkup: mk, facePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                      <td className="p-2 text-gray-500 font-mono text-sm">{((typeof newModule.facePrice === 'number' ? newModule.facePrice : 0)/(1+VAT_RATE)).toFixed(2)}</td>
                      <td className="p-2"><PriceInput value={typeof newModule.facePrice === 'number' ? newModule.facePrice : 0} onChange={(np) => { const pp = typeof newModule.facePurchasePrice === 'number' ? newModule.facePurchasePrice : 0; setNewModule({...newModule, faceMarkup: calcMarkupFromPriceWithVat(pp, np), facePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={addModule}
                  className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
                >
                  {t.addModule}
                </button>
                <button
                  onClick={() => setShowAddModule(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-400"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          )}

          {/* Module List */}
          <div className="divide-y">
            {library.modules.map((mod) => {
              const displayName = getModuleName(mod, lang);
              const GraphicComponent = getModuleGraphic(mod.id, mod.size);
              return (
              <div key={mod.id} className="p-4">
                {editingModule === mod.id ? (
                  // Edit mode - Table format
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="flex items-center justify-center"
                        style={{
                          width: 56, // Fixed width for alignment
                          height: 56,
                        }}
                      >
                        {GraphicComponent && (
                          <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                            {React.createElement(GraphicComponent, { 
                              color: 'white', 
                              // BTicino proportions: 1M = 8.5x31, 2M = 17x31
                              width: mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31), 
                              height: 52 
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{displayName}</div>
                        <div className="text-sm text-gray-500 font-mono">{t.moduleId}: {mod.id}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">🇬🇧 {t.moduleName} (EN)</label>
                        <input
                          type="text"
                          value={mod.nameEn || ''}
                          onChange={(e) => updateModule(mod.id, { nameEn: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">🇷🇴 {t.moduleName} (RO)</label>
                        <input
                          type="text"
                          value={mod.nameRo || ''}
                          onChange={(e) => updateModule(mod.id, { nameRo: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.size} (M)</label>
                        <select
                          value={mod.size}
                          onChange={(e) => updateModule(mod.id, { size: parseInt(e.target.value) })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          {[1, 2, 3, 4].map(s => (
                            <option key={s} value={s}>{s}M</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">{t.category}</label>
                        <select
                          value={mod.category}
                          onChange={(e) => updateModule(mod.id, { category: e.target.value })}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="outlet">{t.outlet}</option>
                          <option value="switch">{t.switch}</option>
                          <option value="other">{t.other}</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Module/face color variants checkboxes */}
                    <div className="mb-4 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={mod.moduleHasColorVariants || mod.hasColorVariants || false}
                          onChange={(e) => {
                            const has = e.target.checked;
                            const colors = getAvailableColors(library);
                            if (has) {
                              const curSku = typeof mod.moduleSku === 'string' ? mod.moduleSku : '';
                              const curPrice = typeof mod.modulePrice === 'number' ? mod.modulePrice : 0;
                              const curPP = typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0;
                              const curMk = typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 25;
                              updateModule(mod.id, { moduleHasColorVariants: true, hasColorVariants: undefined,
                                moduleSku: buildColorObj(colors, curSku, typeof mod.moduleSku === 'object' ? mod.moduleSku : null),
                                modulePurchasePrice: buildColorObj(colors, curPP, typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice : null),
                                moduleMarkup: buildColorObj(colors, curMk, typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : null),
                                modulePrice: buildColorObj(colors, curPrice, typeof mod.modulePrice === 'object' ? mod.modulePrice : null),
                              });
                            } else {
                              const firstColor = colors[0]?.id || 'white';
                              updateModule(mod.id, { moduleHasColorVariants: false, hasColorVariants: undefined,
                                moduleSku: typeof mod.moduleSku === 'object' ? (mod.moduleSku?.[firstColor] || '') : (mod.moduleSku || ''),
                                modulePurchasePrice: typeof mod.modulePurchasePrice === 'object' ? (mod.modulePurchasePrice?.[firstColor] || 0) : (mod.modulePurchasePrice || 0),
                                moduleMarkup: typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[firstColor] || 25) : (mod.moduleMarkup || 25),
                                modulePrice: typeof mod.modulePrice === 'object' ? (mod.modulePrice?.[firstColor] || 0) : (mod.modulePrice || 0),
                              });
                            }
                          }} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{t.moduleHasColorVariants}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={mod.faceHasColorVariants !== false}
                          onChange={(e) => {
                            const has = e.target.checked;
                            const colors = getAvailableColors(library);
                            if (has) {
                              updateModule(mod.id, { faceHasColorVariants: true,
                                faceSku: buildColorObj(colors, '', typeof mod.faceSku === 'object' ? mod.faceSku : null),
                                facePurchasePrice: buildColorObj(colors, 0, typeof mod.facePurchasePrice === 'object' ? mod.facePurchasePrice : null),
                                faceMarkup: buildColorObj(colors, 25, typeof mod.faceMarkup === 'object' ? mod.faceMarkup : null),
                                facePrice: buildColorObj(colors, 0, typeof mod.facePrice === 'object' ? mod.facePrice : null),
                              });
                            } else {
                              const firstColor = colors[0]?.id || 'white';
                              updateModule(mod.id, { faceHasColorVariants: false,
                                faceSku: typeof mod.faceSku === 'object' ? (mod.faceSku?.[firstColor] || '') : (mod.faceSku || ''),
                                facePurchasePrice: typeof mod.facePurchasePrice === 'object' ? (mod.facePurchasePrice?.[firstColor] || 0) : (mod.facePurchasePrice || 0),
                                faceMarkup: typeof mod.faceMarkup === 'object' ? (mod.faceMarkup?.[firstColor] || 25) : (mod.faceMarkup || 25),
                                facePrice: typeof mod.facePrice === 'object' ? (mod.facePrice?.[firstColor] || 0) : (mod.facePrice || 0),
                              });
                            }
                          }} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{t.faceHasColorVariants}</span>
                      </label>
                    </div>
                    
                    {/* SKU & Price Table - dynamic colors */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4 border rounded">
                        <thead>
                          <tr className="bg-gray-50 text-left text-gray-600">
                            <th className="p-2 border-b">{t.item}</th>
                            <th className="p-2 border-b">{t.sku}</th>
                            <th className="p-2 border-b">{t.purchasePrice}</th>
                            <th className="p-2 border-b">{t.markup}</th>
                            <th className="p-2 border-b">{t.sellingPrice}</th>
                            <th className="p-2 border-b">{t.sellingPriceVat}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(mod.moduleHasColorVariants || mod.hasColorVariants) ? (
                            getAvailableColors(library).map((color, idx) => (
                              <tr key={`emod-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                                <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.modules} ({getColorName(color.id, library, lang)})</span></td>
                                <td className="p-2"><input type="text" value={typeof mod.moduleSku === 'object' ? (mod.moduleSku?.[color.id]||'') : ''} onChange={(e) => updateModule(mod.id, {moduleSku: {...(typeof mod.moduleSku === 'object' ? mod.moduleSku : {}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                                <td className="p-2"><input type="number" step="0.01" value={typeof mod.modulePurchasePrice === 'object' ? (mod.modulePurchasePrice?.[color.id]||0) : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[color.id]||0) : 0; updateModule(mod.id, {modulePurchasePrice: {...(typeof mod.modulePurchasePrice==='object'?mod.modulePurchasePrice:{}), [color.id]: pp}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.moduleMarkup === 'object' ? (mod.moduleMarkup?.[color.id]||0) : 0} onChange={(mk) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: mk}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={(typeof mod.modulePrice==='object'?(mod.modulePrice?.[color.id]||0):0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; const np = calcPriceWithVatFromWithout(nwv); updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: calcMarkupFromPriceWithoutVat(pp, nwv)}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.modulePrice==='object'?(mod.modulePrice?.[color.id]||0):0} onChange={(np) => { const pp = typeof mod.modulePurchasePrice==='object'?(mod.modulePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {moduleMarkup: {...(typeof mod.moduleMarkup==='object'?mod.moduleMarkup:{}), [color.id]: calcMarkupFromPriceWithVat(pp, np)}, modulePrice: {...(typeof mod.modulePrice==='object'?mod.modulePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td className="p-2 font-medium">{t.modules}</td>
                              <td className="p-2"><input type="text" value={typeof mod.moduleSku === 'string' ? mod.moduleSku : ''} onChange={(e) => updateModule(mod.id, {moduleSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                              <td className="p-2"><input type="number" step="0.01" value={typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.moduleMarkup==='number'?mod.moduleMarkup:0; updateModule(mod.id, {modulePurchasePrice: pp, modulePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 0} onChange={(mk) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: mk, modulePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={(typeof mod.modulePrice==='number'?mod.modulePrice:0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: calcMarkupFromPriceWithoutVat(pp, nwv), modulePrice: calcPriceWithVatFromWithout(nwv)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.modulePrice === 'number' ? mod.modulePrice : 0} onChange={(np) => { const pp = typeof mod.modulePurchasePrice==='number'?mod.modulePurchasePrice:0; updateModule(mod.id, {moduleMarkup: calcMarkupFromPriceWithVat(pp, np), modulePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                            </tr>
                          )}
                          {/* Face rows */}
                          {(mod.faceHasColorVariants !== false) ? (
                            getAvailableColors(library).map((color, idx) => (
                              <tr key={`eface-${color.id}`} className={`border-b ${idx % 2 ? 'bg-gray-50' : ''}`}>
                                <td className="p-2"><span className="flex items-center gap-2"><span className="w-3 h-3 rounded border" style={{backgroundColor: color.hex}}></span>{t.face} ({getColorName(color.id, library, lang)})</span></td>
                                <td className="p-2"><input type="text" value={typeof mod.faceSku==='object'?(mod.faceSku?.[color.id]||''):''} onChange={(e) => updateModule(mod.id, {faceSku: {...(typeof mod.faceSku==='object'?mod.faceSku:{}), [color.id]: e.target.value.toUpperCase()}})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                                <td className="p-2"><input type="number" step="0.01" value={typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.faceMarkup==='object'?(mod.faceMarkup?.[color.id]||0):0; updateModule(mod.id, {facePurchasePrice: {...(typeof mod.facePurchasePrice==='object'?mod.facePurchasePrice:{}), [color.id]: pp}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.faceMarkup==='object'?(mod.faceMarkup?.[color.id]||0):0} onChange={(mk) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: mk}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVat(pp, mk)}}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={(typeof mod.facePrice==='object'?(mod.facePrice?.[color.id]||0):0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: calcMarkupFromPriceWithoutVat(pp, nwv)}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: calcPriceWithVatFromWithout(nwv)}}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                                <td className="p-2"><PriceInput value={typeof mod.facePrice==='object'?(mod.facePrice?.[color.id]||0):0} onChange={(np) => { const pp = typeof mod.facePurchasePrice==='object'?(mod.facePurchasePrice?.[color.id]||0):0; updateModule(mod.id, {faceMarkup: {...(typeof mod.faceMarkup==='object'?mod.faceMarkup:{}), [color.id]: calcMarkupFromPriceWithVat(pp, np)}, facePrice: {...(typeof mod.facePrice==='object'?mod.facePrice:{}), [color.id]: np}}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-b">
                              <td className="p-2 font-medium">{t.face}</td>
                              <td className="p-2"><input type="text" value={typeof mod.faceSku==='string'?mod.faceSku:''} onChange={(e) => updateModule(mod.id, {faceSku: e.target.value.toUpperCase()})} placeholder={t.enterSku} className="w-full border rounded px-2 py-1 text-sm font-mono" /></td>
                              <td className="p-2"><input type="number" step="0.01" value={typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0} onChange={(e) => { const pp = parseFloat(e.target.value)||0; const mk = typeof mod.faceMarkup==='number'?mod.faceMarkup:0; updateModule(mod.id, {facePurchasePrice: pp, facePrice: calcPriceWithVat(pp, mk)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.faceMarkup==='number'?mod.faceMarkup:0} onChange={(mk) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: mk, facePrice: calcPriceWithVat(pp, mk)}); }} step="1" decimals={0} className="w-16 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={(typeof mod.facePrice==='number'?mod.facePrice:0)/(1+VAT_RATE)} onChange={(nwv) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: calcMarkupFromPriceWithoutVat(pp, nwv), facePrice: calcPriceWithVatFromWithout(nwv)}); }} className="w-20 border rounded px-2 py-1 text-sm" /></td>
                              <td className="p-2"><PriceInput value={typeof mod.facePrice==='number'?mod.facePrice:0} onChange={(np) => { const pp = typeof mod.facePurchasePrice==='number'?mod.facePurchasePrice:0; updateModule(mod.id, {faceMarkup: calcMarkupFromPriceWithVat(pp, np), facePrice: np}); }} className="w-20 border rounded px-2 py-1 text-sm font-medium" /></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <button
                      onClick={() => setEditingModule(null)}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      {t.done}
                    </button>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex items-center justify-center"
                        style={{
                          width: 56, // Fixed width for alignment
                          height: 56,
                        }}
                      >
                        {GraphicComponent && (
                          <div className="border border-gray-300" style={{ lineHeight: 0 }}>
                            {React.createElement(GraphicComponent, { 
                              color: 'white', 
                              // BTicino proportions: 1M = 8.5x31, 2M = 17x31
                              width: mod.size === 2 ? Math.round(52 * 17 / 31) : Math.round(52 * 8.5 / 31), 
                              height: 52 
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{getModuleName(mod, lang)}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono">{typeof mod.moduleSku === 'object' ? Object.values(mod.moduleSku).filter(Boolean).join(' / ') : mod.moduleSku}</span> · {mod.size}M · {mod.category === 'outlet' ? t.outlet : mod.category === 'switch' ? t.switch : t.other}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {t.priceInclVat}: {typeof mod.modulePrice === 'object' 
                            ? Object.values(mod.modulePrice).map(p => (p || 0).toFixed(2)).join(' / ')
                            : (mod.modulePrice || 0).toFixed(2)} RON
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingModule(mod.id)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      {confirmDeleteId === mod.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteModule(mod.id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                          >
                            {t.delete}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-400"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(mod.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-4">🎨 {t.manageColors}</h2>
          <div className="space-y-2 mb-4">
            {getAvailableColors(library).map((color, idx) => (
              <div key={color.id} className="flex items-center gap-3 p-2 border rounded">
                <span className="w-8 h-8 rounded border" style={{ backgroundColor: color.hex }}></span>
                <span className="font-medium w-24">{color.id}</span>
                <span className="text-sm text-gray-600 w-32">{color.nameEn}</span>
                <span className="text-sm text-gray-600 w-32">{color.nameRo}</span>
                <span className="text-xs font-mono text-gray-400">{color.hex}</span>
                {isAdmin && getAvailableColors(library).length > 1 && (
                  <button
                    onClick={() => {
                      if (!confirm(t.confirmRemoveColor)) return;
                      const newColors = library.availableColors.filter(c => c.id !== color.id);
                      // Remove color keys from all modules
                      const newModules = (library.modules || []).map(mod => {
                        const updated = { ...mod };
                        ['moduleSku','modulePurchasePrice','moduleMarkup','modulePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            const copy = { ...updated[field] };
                            delete copy[color.id];
                            updated[field] = copy;
                          }
                        });
                        ['faceSku','facePurchasePrice','faceMarkup','facePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            const copy = { ...updated[field] };
                            delete copy[color.id];
                            updated[field] = copy;
                          }
                        });
                        return updated;
                      });
                      // Remove decorFaces for this color
                      const newDecor = { ...library.decorFaces };
                      Object.keys(newDecor).forEach(key => {
                        if (key.endsWith('-' + color.id)) delete newDecor[key];
                      });
                      safeOnUpdate({ ...library, availableColors: newColors, modules: newModules, decorFaces: newDecor });
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 text-sm"
                    title={t.removeColor}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">{t.addColor}</h3>
              <div className="flex gap-2 items-end flex-wrap">
                <div>
                  <label className="block text-xs text-gray-600">{t.colorId}</label>
                  <input id="newColorId" type="text" placeholder="sand" className="border rounded px-2 py-1 text-sm w-24" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorNameEn}</label>
                  <input id="newColorNameEn" type="text" placeholder="Sand" className="border rounded px-2 py-1 text-sm w-28" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorNameRo}</label>
                  <input id="newColorNameRo" type="text" placeholder="Nisip" className="border rounded px-2 py-1 text-sm w-28" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">{t.colorHex}</label>
                  <div className="flex items-center gap-1">
                    <input id="newColorHex" type="color" defaultValue="#C2A878" onInput={(e) => { const lbl = document.getElementById('newColorHexLabel'); if (lbl) lbl.textContent = e.target.value; }} className="w-10 h-8 rounded border cursor-pointer p-0" />
                    <span id="newColorHexLabel" className="text-xs font-mono text-gray-400">#C2A878</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const id = document.getElementById('newColorId').value.trim().toLowerCase();
                    const nameEn = document.getElementById('newColorNameEn').value.trim();
                    const nameRo = document.getElementById('newColorNameRo').value.trim();
                    const hex = document.getElementById('newColorHex').value.trim();
                    if (!id || !nameEn || !hex) return;
                    if (getAvailableColors(library).some(c => c.id === id)) return alert('Color ID already exists');
                    const newColor = { id, name: nameEn, nameEn, nameRo: nameRo || nameEn, hex };
                    const newColors = [...(library.availableColors || []), newColor];
                    // Add color keys to modules that have color variants
                    const newModules = (library.modules || []).map(mod => {
                      const updated = { ...mod };
                      if (updated.moduleHasColorVariants || updated.hasColorVariants) {
                        ['moduleSku','modulePurchasePrice','moduleMarkup','modulePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            updated[field] = { ...updated[field], [id]: field.includes('Markup') ? 25 : (field.includes('Sku') ? '' : 0) };
                          }
                        });
                      }
                      if (updated.faceHasColorVariants !== false) {
                        ['faceSku','facePurchasePrice','faceMarkup','facePrice'].forEach(field => {
                          if (typeof updated[field] === 'object' && updated[field] !== null) {
                            updated[field] = { ...updated[field], [id]: field.includes('Markup') ? 25 : (field.includes('Sku') ? '' : 0) };
                          }
                        });
                      }
                      return updated;
                    });
                    // Add decorFaces for new color
                    const newDecor = { ...library.decorFaces };
                    getAvailableSizes(library).forEach(size => {
                      if (!newDecor[`${size}-${id}`]) {
                        newDecor[`${size}-${id}`] = { sku: '', purchasePrice: 0, markup: 25, price: 0 };
                      }
                    });
                    safeOnUpdate({ ...library, availableColors: newColors, modules: newModules, decorFaces: newDecor });
                    document.getElementById('newColorId').value = '';
                    document.getElementById('newColorNameEn').value = '';
                    document.getElementById('newColorNameRo').value = '';
                    document.getElementById('newColorHex').value = '#C2A878';
                    const lbl = document.getElementById('newColorHexLabel'); if (lbl) lbl.textContent = '#C2A878';
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  + {t.addColor}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wall Boxes Tab */}
      {activeTab === 'wallboxes' && (
        <div className="space-y-6">
          {/* Masonry Wall Boxes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{t.wallBoxesMasonry || 'Wall Boxes (Masonry)'}</h2>
              <p className="text-sm text-gray-500">{t.masonry} - {t.configureSKUs}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 w-16">{t.size}</th>
                    <th className="p-2 w-28">{t.sku}</th>
                    <th className="p-2 w-28">{t.purchasePrice}</th>
                    <th className="p-2 w-20">{t.markup}</th>
                    <th className="p-2 w-28">{t.sellingPrice}</th>
                    <th className="p-2 w-28">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableSizes(library).map((size) => {
                    const item = library.wallBoxesMasonry?.[size] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={size} className="border-t">
                        <td className="p-2 font-medium">{size}M</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateWallBoxMasonry(size, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                wallBoxesMasonry: {
                                  ...library.wallBoxesMasonry,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drywall Wall Boxes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{t.wallBoxesDrywall || 'Wall Boxes (Drywall)'}</h2>
              <p className="text-sm text-gray-500">{t.drywall} - {t.configureSKUs}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 w-16">{t.size}</th>
                    <th className="p-2 w-28">{t.sku}</th>
                    <th className="p-2 w-28">{t.purchasePrice}</th>
                    <th className="p-2 w-20">{t.markup}</th>
                    <th className="p-2 w-28">{t.sellingPrice}</th>
                    <th className="p-2 w-28">{t.sellingPriceVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {getAvailableSizes(library).map((size) => {
                    const item = library.wallBoxesDrywall?.[size] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={size} className="border-t">
                        <td className="p-2 font-medium">{size}M</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateWallBoxDrywall(size, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                wallBoxesDrywall: {
                                  ...library.wallBoxesDrywall,
                                  [size]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Install Faces Tab */}
      {activeTab === 'installfaces' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{t.installFaces} ({t.supports})</h2>
            <p className="text-sm text-gray-500">{t.configureSKUs}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="p-2 w-16">{t.size}</th>
                  <th className="p-2 w-28">{t.sku}</th>
                  <th className="p-2 w-28">{t.purchasePrice}</th>
                  <th className="p-2 w-20">{t.markup}</th>
                  <th className="p-2 w-28">{t.sellingPrice}</th>
                  <th className="p-2 w-28">{t.sellingPriceVat}</th>
                </tr>
              </thead>
              <tbody>
                {getAvailableSizes(library).map((size) => {
                  const item = library.installFaces[size] || {};
                  const purchasePrice = item.purchasePrice || 0;
                  const markup = item.markup || 0;
                  const priceWithVat = item.price || 0;
                  const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                  
                  return (
                    <tr key={size} className="border-t">
                      <td className="p-2 font-medium">{size}M</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => updateInstallFace(size, 'sku', e.target.value)}
                          placeholder={t.enterSku}
                          className="w-full border rounded px-2 py-1 text-sm font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={purchasePrice}
                          onChange={(e) => {
                            const newPurchase = parseFloat(e.target.value) || 0;
                            const newPrice = calcPriceWithVat(newPurchase, markup);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, purchasePrice: newPurchase, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={markup}
                          onChange={(newMarkup) => {
                            const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          step="1"
                          decimals={0}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={sellingWithoutVat}
                          onChange={(newSellingWithoutVat) => {
                            const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                            const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <PriceInput
                          value={priceWithVat}
                          onChange={(newPrice) => {
                            const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                            safeOnUpdate({
                              ...library,
                              installFaces: {
                                ...library.installFaces,
                                [size]: { ...item, markup: newMarkup, price: newPrice }
                              }
                            });
                          }}
                          className="w-full border rounded px-2 py-1 text-sm font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Decor Faces Tab */}
      {activeTab === 'decorfaces' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{t.decorFaces} ({t.coverPlates})</h2>
            <p className="text-sm text-gray-500">{t.configureSKUsColor}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="p-2 w-16">{t.size}</th>
                  <th className="p-2 w-20">{t.color}</th>
                  <th className="p-2 w-28">{t.sku}</th>
                  <th className="p-2 w-24">{t.purchasePrice}</th>
                  <th className="p-2 w-16">{t.markup}</th>
                  <th className="p-2 w-24">{t.sellingPrice}</th>
                  <th className="p-2 w-24">{t.sellingPriceVat}</th>
                </tr>
              </thead>
              <tbody>
                {getAvailableSizes(library).map((size) => (
                  getAvailableColors(library).map((color, colorIdx) => {
                    const key = `${size}-${color.id}`;
                    const item = library.decorFaces[key] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={key} className={colorIdx === 0 ? 'border-t' : ''}>
                        {colorIdx === 0 && (
                          <td className="p-2 font-medium" rowSpan={getAvailableColors(library).length}>{size}M</td>
                        )}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {getColorName(color.id, library, lang)}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.sku || ''}
                            onChange={(e) => updateDecorFace(key, 'sku', e.target.value)}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => {
                              const newPurchase = parseFloat(e.target.value) || 0;
                              const newPrice = calcPriceWithVat(newPurchase, markup);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, purchasePrice: newPurchase, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={markup}
                            onChange={(newMarkup) => {
                              const newPrice = calcPriceWithVat(purchasePrice, newMarkup);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            step="1"
                            decimals={0}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={sellingWithoutVat}
                            onChange={(newSellingWithoutVat) => {
                              const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                              const newMarkup = calcMarkupFromPriceWithoutVat(purchasePrice, newSellingWithoutVat);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2">
                          <PriceInput
                            value={priceWithVat}
                            onChange={(newPrice) => {
                              const newMarkup = calcMarkupFromPriceWithVat(purchasePrice, newPrice);
                              safeOnUpdate({
                                ...library,
                                decorFaces: {
                                  ...library.decorFaces,
                                  [key]: { ...item, markup: newMarkup, price: newPrice }
                                }
                              });
                            }}
                            className="w-full border rounded px-2 py-1 text-sm font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ projects: [] });
const [library, setLibrary] = useState(DEFAULT_LIBRARY);
const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('bticino-lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Admin check - @atelierazimut.com emails are admins
  const isAdmin = session?.user?.email?.endsWith('@atelierazimut.com') || false;

  // Verifică sesiunea la start
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProjects = async () => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
      return;
    }

    // Încarcă ansamblurile pentru fiecare proiect
    const projectsWithAssemblies = await Promise.all(
      projects.map(async (project) => {
        const { data: assemblies } = await supabase
          .from('assemblies')
          .select('*')
          .eq('project_id', project.id);

        return {
          ...project,
          id: project.id,
          name: project.name,
          clientName: project.client_name,
          clientContact: project.client_contact,
          system: project.system || 'bticino',
          createdAt: project.created_at,
          assemblies: (assemblies || []).map(a => ({
            id: a.id,
            type: a.type,
            code: a.code,
            room: a.room,
            size: a.size,
            color: a.color,
            wallBoxType: a.wall_box_type || 'masonry',
            modules: a.modules || [],
          })),
        };
      })
    );

    setData({ projects: projectsWithAssemblies });
  };

  // All system libraries in state
  const [libraries, setLibraries] = useState({});

  const loadLibraryFromSupabase = async () => {
    // Start with ALL default libraries pre-populated
    const libs = {
      bticino: { ...DEFAULT_LIBRARY },
      gewiss: { ...DEFAULT_LIBRARY_GEWISS },
      schneider: { ...DEFAULT_LIBRARY_SCHNEIDER },
    };

    // Load from Supabase — overlay defaults with saved data
    const { data: rows, error } = await supabase
      .from('global_library')
      .select('id, library_data');

    if (!error && rows && rows.length > 0) {
      rows.forEach(row => {
        const libData = row.library_data || {};
        const systemId = row.id === 'main' ? 'bticino' : row.id;
        const defaults = DEFAULT_LIBRARIES[systemId] || DEFAULT_LIBRARY;
        if (!libData.availableColors) libData.availableColors = defaults.availableColors;
        if (!libData.availableSizes) libData.availableSizes = defaults.availableSizes;
        if (!libData.systemId) libData.systemId = systemId;
        if (!libData.systemName) libData.systemName = defaults.systemName;
        libs[systemId] = libData;
      });
    }

    setLibraries(libs);
    setLibrary(libs.bticino);
    setLibraryLoaded(true);
  };

  const getLibraryForSystem = (systemId) => {
    return libraries[systemId] || DEFAULT_LIBRARIES[systemId] || library;
  };

  const saveLibraryToSupabase = async (libraryData, systemId) => {
    if (!isAdmin) return;
    const sysId = systemId || libraryData?.systemId || 'bticino';
    const rowId = sysId === 'bticino' ? 'main' : sysId;

    const { error } = await supabase
      .from('global_library')
      .upsert({
        id: rowId,
        library_data: libraryData,
        updated_at: new Date().toISOString(),
        updated_by: session.user.email,
      }, { onConflict: 'id' });

    if (error) console.error('Error saving library:', error);
  };

  useEffect(() => {
    if (session?.user) {
      loadProjects();
      loadLibraryFromSupabase();
    }
  }, [session]);

  const saveProject = async (project) => {
  let { error } = await supabase.from('projects').update({
    name: project.name, client_name: project.clientName,
    client_contact: project.clientContact, system: project.system || 'bticino',
  }).eq('id', project.id);

  if (error && error.message?.includes('system')) {
    const fallback = await supabase.from('projects').update({
      name: project.name, client_name: project.clientName, client_contact: project.clientContact,
    }).eq('id', project.id);
    error = fallback.error;
  }

  if (error) {
    console.error('Error saving project:', error);
    return;
  }

  // Obține ansamblurile existente din Supabase
  const { data: existingAssemblies } = await supabase
    .from('assemblies')
    .select('id')
    .eq('project_id', project.id);

  const existingIds = (existingAssemblies || []).map(a => a.id);
  const currentIds = project.assemblies.map(a => a.id).filter(id => existingIds.includes(id));
  
  // Șterge ansamblurile care nu mai există în proiect
  const idsToDelete = existingIds.filter(id => !project.assemblies.some(a => a.id === id));
  if (idsToDelete.length > 0) {
    await supabase
      .from('assemblies')
      .delete()
      .in('id', idsToDelete);
  }

  // Salvează ansamblurile
  for (const assembly of project.assemblies) {
    const assemblyData = {
      project_id: project.id,
      type: assembly.type,
      code: assembly.code,
      room: assembly.room,
      size: assembly.size,
      color: assembly.color,
      wall_box_type: assembly.wallBoxType || 'masonry',
      modules: assembly.modules,
    };

    // Verifică dacă assembly există deja în Supabase
    const isExisting = existingIds.includes(assembly.id);

    if (isExisting) {
      await supabase
        .from('assemblies')
        .update(assemblyData)
        .eq('id', assembly.id);
    } else {
      const { data: newAssembly } = await supabase
        .from('assemblies')
        .insert(assemblyData)
        .select()
        .single();
      
      // Actualizează ID-ul local cu cel din Supabase
      if (newAssembly) {
        assembly.id = newAssembly.id;
      }
    }
  }
};

useEffect(() => {
  if (session?.user && libraryLoaded && library?.systemId) {
    if (library.systemId === 'bticino') saveLibrary(library);
    saveLibraryToSupabase(library, library.systemId);
    setLibraries(prev => ({ ...prev, [library.systemId]: library }));
  }
}, [library, session, libraryLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem('bticino-lang', lang);
    } catch {}
  }, [lang]);

  const updateProject = async (updated) => {
    setData({
      ...data,
      projects: data.projects.map(p => p.id === updated.id ? updated : p),
    });
    if (selectedProject?.id === updated.id) {
      setSelectedProject(updated);
    }
    await saveProject(updated);
  };

  const createProject = async (name, client, system = 'bticino') => {
  let result = await supabase.from('projects').insert({
    user_id: session.user.id, name, client_name: client, client_contact: '', system,
  }).select().single();

  // Fallback if system column doesn't exist yet
  if (result.error && result.error.message?.includes('system')) {
    result = await supabase.from('projects').insert({
      user_id: session.user.id, name, client_name: client, client_contact: '',
    }).select().single();
  }

  if (result.error) { console.error('Error creating project:', result.error); return; }
  const savedProject = result.data;

  const newProject = {
    id: savedProject.id,
    name: savedProject.name,
    clientName: savedProject.client_name,
    clientContact: savedProject.client_contact,
    system: savedProject.system || system,
    createdAt: savedProject.created_at,
    assemblies: [],
  };

  setData({ ...data, projects: [...data.projects, newProject] });
};

const deleteProject = async (id) => {
  // Șterge ansamblurile asociate
  await supabase.from('assemblies').delete().eq('project_id', id);
  // Șterge proiectul
  await supabase.from('projects').delete().eq('id', id);
  
  setData({
    ...data,
    projects: data.projects.filter(p => p.id !== id),
  });
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setData({ projects: [] });
    setSelectedProject(null);
  };

  const languageContextValue = { lang, t, setLang };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <Auth />;
  }

  // Global header component with language switcher and logout
  const GlobalHeader = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b px-4 py-2 flex justify-between items-center">
      <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
        <Package className="w-5 h-5" />
        <span className="hidden sm:inline">{lang === 'ro' ? 'Configurator Aparataj' : 'Electrical Configurator'}</span>
        <span className="sm:hidden">Config</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 hidden sm:inline">{session.user.email}</span>
        <LanguageSwitcher />
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 px-2 py-1"
        >
          Logout
        </button>
      </div>
    </div>
  );

  // Show Library page
  if (showLibrary) {
    const handleSwitchLibrarySystem = (systemId) => {
      if (library.systemId && library.systemId !== systemId) {
        saveLibraryToSupabase(library, library.systemId);
      }
      const targetLib = libraries[systemId] || DEFAULT_LIBRARIES[systemId] || DEFAULT_LIBRARY;
      setLibrary(targetLib);
    };

    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={library}>
          <div className="min-h-screen bg-gray-100">
            <GlobalHeader />
            <div className="pt-16">
              <LibraryPage
                library={library}
                onUpdate={setLibrary}
                onBack={() => setShowLibrary(false)}
                isAdmin={isAdmin}
                onSwitchSystem={handleSwitchLibrarySystem}
              />
            </div>
          </div>
        </LibraryContext.Provider>
      </LanguageContext.Provider>
    );
  }

  // Show Project Detail
  if (selectedProject) {
    const currentProject = data.projects.find(p => p.id === selectedProject.id);
    const projectLibrary = getLibraryForSystem(currentProject?.system || selectedProject?.system || 'bticino');
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={projectLibrary}>
          <div className="min-h-screen bg-gray-100">
            <GlobalHeader />
            <div className="pt-16">
              <ProjectDetail
                project={currentProject || selectedProject}
                onBack={() => setSelectedProject(null)}
                onUpdate={updateProject}
              />
            </div>
          </div>
        </LibraryContext.Provider>
      </LanguageContext.Provider>
    );
  }

  // Show Project List
  return (
    <LanguageContext.Provider value={languageContextValue}>
      <LibraryContext.Provider value={library}>
        <div className="min-h-screen bg-gray-100">
          <GlobalHeader />
          <div className="pt-16">
            <ProjectList
              projects={data.projects}
              onSelect={setSelectedProject}
              onCreate={createProject}
              onDelete={deleteProject}
              onOpenLibrary={() => setShowLibrary(true)}
            />
          </div>
        </div>
      </LibraryContext.Provider>
    </LanguageContext.Provider>
  );
}