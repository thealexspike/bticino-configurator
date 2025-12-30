import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Package, Zap, Settings, FileText, Home, Box, Layers, Globe } from 'lucide-react';
import { supabase } from './supabase';
import Auth from './Auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// TRANSLATIONS
// ============================================================================

const TRANSLATIONS = {
  en: {
    // General
    configurator: 'Bticino Living Now Configurator',
    library: 'Library',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    done: 'Done',
    create: 'Create',
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
    addOutlet: 'Add Outlet',
    addSwitch: 'Add Switch',
    noOutlets: 'No outlets yet.',
    noSwitches: 'No switches yet.',
    modules: 'modules',
    noRoom: 'No room',
    used: 'used',
    overCapacity: 'OVER CAPACITY!',
    
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
    unitProfit: 'Profit',
    
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
    
    // Module names
    face: 'Face',
    
    // Wall Box Types
    wallBoxType: 'Wall Box Type',
    masonry: 'Masonry',
    drywall: 'Drywall (Gypsum)',
    wallBoxesMasonry: 'Wall Boxes (Masonry)',
    wallBoxesDrywall: 'Wall Boxes (Drywall)',
  },
  ro: {
    // General
    configurator: 'Configurator Bticino Living Now',
    library: 'Bibliotecă',
    back: 'Înapoi',
    save: 'Salvează',
    cancel: 'Anulează',
    delete: 'Șterge',
    edit: 'Editează',
    add: 'Adaugă',
    done: 'Gata',
    create: 'Creează',
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
    addOutlet: 'Adaugă Priză',
    addSwitch: 'Adaugă Întrerupător',
    noOutlets: 'Nu există prize încă.',
    noSwitches: 'Nu există întrerupătoare încă.',
    modules: 'module',
    noRoom: 'Fără cameră',
    used: 'folosit',
    overCapacity: 'CAPACITATE DEPĂȘITĂ!',
    
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
    unitProfit: 'Profit',
    
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
    
    // Module names
    face: 'Față',
    
    // Wall Box Types
    wallBoxType: 'Tip Doză',
    masonry: 'Zidărie',
    drywall: 'Gips-carton',
    wallBoxesMasonry: 'Doze (Zidărie)',
    wallBoxesDrywall: 'Doze (Gips-carton)',
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
// SVG MODULE GRAPHICS (Fallback if images don't load)
// ============================================================================

// Graphics definitions by type
const ModuleGraphicsByType = {
  schuko: ({ color = 'white', width = 60, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const accent = color === 'black' ? '#444' : '#f5f5f5';
    const holes = color === 'black' ? '#0a0a0a' : '#333';
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="2" y="2" width="56" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="8" y="15" width="44" height="50" rx="22" fill={accent} stroke={border} strokeWidth="1"/>
        <circle cx="22" cy="40" r="4" fill={holes}/>
        <circle cx="38" cy="40" r="4" fill={holes}/>
        <rect x="10" y="35" width="3" height="10" rx="1" fill={border}/>
        <rect x="47" y="35" width="3" height="10" rx="1" fill={border}/>
      </svg>
    );
  },
  italian: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const accent = color === 'black' ? '#444' : '#f5f5f5';
    const holes = color === 'black' ? '#0a0a0a' : '#333';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="5" y="20" width="20" height="40" rx="10" fill={accent} stroke={border} strokeWidth="1"/>
        <circle cx="15" cy="32" r="2.5" fill={holes}/>
        <circle cx="15" cy="40" r="2.5" fill={holes}/>
        <circle cx="15" cy="48" r="2.5" fill={holes}/>
      </svg>
    );
  },
  switch: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const button = color === 'black' ? '#2a2a2a' : '#f8f8f8';
    const led = '#4ade80';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="5" y="10" width="20" height="55" rx="3" fill={button} stroke={border} strokeWidth="1"/>
        <circle cx="15" cy="70" r="2" fill={led}/>
        <path d="M12 35 L18 35 M15 32 L15 38" stroke={border} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  switch_stair: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const button = color === 'black' ? '#2a2a2a' : '#f8f8f8';
    const led = '#fbbf24';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="5" y="10" width="20" height="55" rx="3" fill={button} stroke={border} strokeWidth="1"/>
        <circle cx="15" cy="70" r="2" fill={led}/>
        <path d="M10 38 L15 32 L20 38" stroke={border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M10 44 L15 50 L20 44" stroke={border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  },
  switch_cross: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const button = color === 'black' ? '#2a2a2a' : '#f8f8f8';
    const led = '#f97316';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="5" y="10" width="20" height="55" rx="3" fill={button} stroke={border} strokeWidth="1"/>
        <circle cx="15" cy="70" r="2" fill={led}/>
        <path d="M10 32 L20 48 M20 32 L10 48" stroke={border} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  dimmer: ({ color = 'white', width = 60, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const button = color === 'black' ? '#2a2a2a' : '#f8f8f8';
    const led = '#4ade80';
    return (
      <svg width={width} height={height} viewBox="0 0 60 80">
        <rect x="2" y="2" width="56" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="6" y="10" width="22" height="55" rx="3" fill={button} stroke={border} strokeWidth="1"/>
        <rect x="32" y="10" width="22" height="55" rx="3" fill={button} stroke={border} strokeWidth="1"/>
        <circle cx="17" cy="70" r="2" fill={led}/>
        <circle cx="43" cy="70" r="2" fill={led}/>
        <path d="M14 30 L20 30 M17 27 L17 33" stroke={border} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 30 L46 30" stroke={border} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  usb: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    const port = color === 'black' ? '#0a0a0a' : '#333';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
        <rect x="8" y="25" width="14" height="8" rx="1" fill={port}/>
        <rect x="10" y="27" width="10" height="4" rx="0.5" fill={bg}/>
        <rect x="8" y="45" width="14" height="8" rx="1" fill={port}/>
        <rect x="10" y="47" width="10" height="4" rx="0.5" fill={bg}/>
        <text x="15" y="70" fontSize="6" fill={border} textAnchor="middle" fontFamily="Arial">USB</text>
      </svg>
    );
  },
  blank: ({ color = 'white', width = 30, height = 80 }) => {
    const bg = color === 'black' ? '#1a1a1a' : '#ffffff';
    const border = color === 'black' ? '#333' : '#e0e0e0';
    return (
      <svg width={width} height={height} viewBox="0 0 30 80">
        <rect x="2" y="2" width="26" height="76" rx="4" fill={bg} stroke={border} strokeWidth="2"/>
      </svg>
    );
  },
};

// Map module ID to graphic types
const getGraphicTypeFromId = (moduleId) => {
  if (!moduleId) return 'blank';
  const idLower = moduleId.toLowerCase();
  if (idLower.includes('schuko')) return 'schuko';
  if (idLower.includes('italian')) return 'italian';
  if (idLower.includes('switch_cross') || idLower.includes('cross')) return 'switch_cross';
  if (idLower.includes('switch_stair') || idLower.includes('stair')) return 'switch_stair';
  if (idLower.includes('switch')) return 'switch';
  if (idLower.includes('dimmer')) return 'dimmer';
  if (idLower.includes('usb')) return 'usb';
  if (idLower.includes('blank')) return 'blank';
  return 'blank';
};

// Get graphic component for a module ID
const getModuleGraphic = (moduleId) => {
  const type = getGraphicTypeFromId(moduleId);
  return ModuleGraphicsByType[type] || ModuleGraphicsByType.blank;
};

// Module image component
const ModuleImage = ({ moduleId, color, width = 60, height = 80, className = '' }) => {
  const graphicType = getGraphicTypeFromId(moduleId);
  const SvgComponent = ModuleGraphicsByType[graphicType] || ModuleGraphicsByType.blank;
  
  return (
    <div className={className} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SvgComponent color={color} />
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
  const bg = color === 'black' ? '#1a1a1a' : '#f5f5f5';
  const border = color === 'black' ? '#333' : '#ddd';
  const innerBg = color === 'black' ? '#222' : '#fff';
  
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

// Thumbnail for module list
const ModuleThumbnail = ({ moduleId, size = 32 }) => {
  const scale = size / 80;
  const graphicType = getGraphicTypeFromId(moduleId);
  const width = graphicType === 'schuko' || graphicType === 'dimmer' ? 60 * scale : 30 * scale;
  const Component = getModuleGraphic(moduleId);
  if (!Component) return null;
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width, height: size }}>
      <Component color="white" />
    </div>
  );
};

// ============================================================================
// DATA DEFINITIONS (Catalog)
// ============================================================================

const SIZES = [1, 2, 3, 4, 6];

const COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#1a1a1a' },
];

// Default library data - will be overridden by localStorage
const DEFAULT_LIBRARY = {
  wallBoxesMasonry: {
    1: { sku: '503E', purchasePrice: 8, markup: 25, price: 12.1 },
    2: { sku: '504E', purchasePrice: 10, markup: 25, price: 15.13 },
    3: { sku: '506E', purchasePrice: 12, markup: 25, price: 18.15 },
    4: { sku: '508E', purchasePrice: 15, markup: 25, price: 22.69 },
    6: { sku: '510E', purchasePrice: 19, markup: 25, price: 28.74 },
  },
  wallBoxesDrywall: {
    1: { sku: 'PB503', purchasePrice: 10, markup: 25, price: 15.13 },
    2: { sku: 'PB504', purchasePrice: 12, markup: 25, price: 18.15 },
    3: { sku: 'PB506', purchasePrice: 14, markup: 25, price: 21.18 },
    4: { sku: 'PB508', purchasePrice: 17, markup: 25, price: 25.71 },
    6: { sku: 'PB510', purchasePrice: 22, markup: 25, price: 33.28 },
  },
  installFaces: {
    1: { sku: 'KG2201', purchasePrice: 5, markup: 25, price: 7.56 },
    2: { sku: 'KG2202', purchasePrice: 7, markup: 25, price: 10.59 },
    3: { sku: 'KG2203', purchasePrice: 8, markup: 25, price: 12.1 },
    4: { sku: 'KG2204', purchasePrice: 10, markup: 25, price: 15.13 },
    6: { sku: 'KG2206', purchasePrice: 14, markup: 25, price: 21.18 },
  },
  decorFaces: {
    '1-white': { sku: 'KA4802M1', purchasePrice: 8, markup: 25, price: 12.1 }, 
    '1-black': { sku: 'KG4802M1', purchasePrice: 10, markup: 25, price: 15.13 },
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
      hasColorVariants: true,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
      hasColorVariants: false,
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
        wallBoxesMasonry: { ...DEFAULT_LIBRARY.wallBoxesMasonry, ...wallBoxesMasonry },
        wallBoxesDrywall: { ...DEFAULT_LIBRARY.wallBoxesDrywall, ...wallBoxesDrywall },
        installFaces: { ...DEFAULT_LIBRARY.installFaces, ...parsed.installFaces },
        decorFaces: { ...DEFAULT_LIBRARY.decorFaces, ...parsed.decorFaces },
        modules: parsed.modules || DEFAULT_LIBRARY.modules,
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
  // Support both old format (string) and new format (object)
  if (typeof mod.moduleSku === 'string') return mod.moduleSku;
  return mod.moduleSku?.[color] || mod.moduleSku?.white || '';
};

// Get module face SKU
const getModuleFaceSku = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  return mod?.faceSku?.[color] || '';
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
  // Support both old format (number) and new format (object)
  if (typeof mod.modulePrice === 'number') return mod.modulePrice;
  return mod.modulePrice?.[color] || mod.modulePrice?.white || 0;
};

// Get module face price
const getModuleFacePrice = (moduleId, color, library) => {
  const mod = getModuleById(moduleId, library);
  return mod?.facePrice?.[color] || 0;
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

const createAssembly = (type, code, room = '') => ({
  id: generateId(),
  type,
  code,
  room,
  size: 2,
  color: 'white',
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
  const t = useTranslation();

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim(), newClient.trim());
      setNewName('');
      setNewClient('');
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
                  <div className="text-sm text-gray-500">
                    {project.clientName || t.noClient} · {project.assemblies.length} {t.assemblies}
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
  const t = useTranslation();

  const outlets = project.assemblies.filter(a => a.type === 'outlet');
  const switches = project.assemblies.filter(a => a.type === 'switch');

  const addAssembly = (type) => {
    const code = generateAssemblyCode(project.assemblies, type);
    const assembly = createAssembly(type, code);
    onUpdate({
      ...project,
      assemblies: [...project.assemblies, assembly],
    });
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
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-gray-600">{project.clientName || t.noClient}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('outlets')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeTab === 'outlets' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <Package className="w-4 h-4" /> {t.outlets} (P##)
          <span className="bg-white/20 px-2 rounded text-sm">{outlets.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('switches')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeTab === 'switches' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" /> {t.switches} (I##)
          <span className="bg-white/20 px-2 rounded text-sm">{switches.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('boq')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeTab === 'boq' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {t.boq}
        </button>
        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeTab === 'quote' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" /> {t.clientQuote}
        </button>
        <button
          onClick={() => setActiveTab('profit')}
          className={`flex items-center gap-2 px-4 py-2 rounded ${
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
          onAdd={() => addAssembly('outlet')}
          onEdit={setEditingAssembly}
          onDelete={deleteAssembly}
          onReorder={handleReorder}
          onUpdate={updateAssembly}
          existingRooms={existingRooms}
        />
      )}
      {activeTab === 'switches' && (
        <AssemblyList
          assemblies={switches}
          type="switch"
          onAdd={() => addAssembly('switch')}
          onEdit={setEditingAssembly}
          onDelete={deleteAssembly}
          onReorder={handleReorder}
          onUpdate={updateAssembly}
          existingRooms={existingRooms}
        />
      )}
      {activeTab === 'boq' && <BOQView project={project} />}
      {activeTab === 'quote' && <QuoteView project={project} />}
      {activeTab === 'profit' && <ProfitView project={project} />}
    </div>
  );
}

// --- Assembly List ---
function AssemblyList({ assemblies, type, onAdd, onEdit, onDelete, onReorder, onUpdate, existingRooms = [] }) {
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingCodeId, setEditingCodeId] = useState(null);
  const [editingCodeValue, setEditingCodeValue] = useState('');
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingRoomValue, setEditingRoomValue] = useState('');
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  // Get library and translations from context
  const library = React.useContext(LibraryContext);
  const t = useTranslation();

  const sortedAssemblies = [...assemblies].sort((a, b) => a.code.localeCompare(b.code));
  const typeName = type === 'outlet' ? t.outlet : t.switch;
  const addLabel = type === 'outlet' ? t.addOutlet : t.addSwitch;
  const noItemsLabel = type === 'outlet' ? t.noOutlets : t.noSwitches;
  const prefix = type === 'outlet' ? 'P' : 'I';

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold">{type === 'outlet' ? t.outlets : t.switches}</h2>
        <button
          onClick={onAdd}
          className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>

      {sortedAssemblies.length === 0 ? (
        <p className="p-4 text-gray-500">{noItemsLabel}</p>
      ) : (
        <ul>
          {sortedAssemblies.map((assembly, index) => {
            const usedSize = calculateModulesSize(assembly.modules, library);
            const colorInfo = COLORS.find(c => c.id === assembly.color);
            const isDragging = draggedId === assembly.id;
            const isDragOver = dragOverIndex === index && draggedId !== assembly.id;

            return (
              <li
                key={assembly.id}
                draggable
                onDragStart={(e) => handleDragStart(e, assembly)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-all ${
                  isDragging ? 'opacity-50 bg-blue-50' : ''
                } ${isDragOver ? 'border-t-2 border-t-blue-500' : ''}`}
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
                      {SIZES.map(s => (
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
                        color: assembly.color === 'black' ? '#fff' : '#333'
                      }}
                      title="Change color"
                    >
                      {COLORS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    {/* Capacity indicator */}
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      usedSize > assembly.size ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {usedSize}/{assembly.size}M
                    </span>
                  </div>

                  {/* Room editor */}
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
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
                    <span>{assembly.modules.length} {t.modules}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(assembly); }}
                    className="text-blue-500 hover:text-blue-700 p-2"
                    title={t.edit + ' ' + t.modules}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(assembly.id); }}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
        💡 {t.editHint}
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

  // Visual dimensions
  const slotWidth = 60;
  const faceWidth = assembly.size * slotWidth;
  const faceHeight = 120;

  const colorInfo = COLORS.find(c => c.id === assembly.color);
  const faceBgColor = assembly.color === 'black' ? '#1a1a1a' : '#f5f5f5';
  const faceTextColor = assembly.color === 'black' ? '#ffffff' : '#333333';

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
              {SIZES.map(s => (
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
              {COLORS.map(c => (
                <option key={c.id} value={c.id}>{c.id === 'white' ? t.white : t.black}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.wallBoxType}</label>
            <select
              value={assembly.wallBoxType || 'masonry'}
              onChange={(e) => updateField('wallBoxType', e.target.value)}
              className="w-full border rounded px-3 py-2"
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
              <span className="text-gray-600">{t.decorFace} {assembly.size}M {assembly.color === 'white' ? t.white : t.black}</span>
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
            style={{ 
              backgroundColor: '#e8e4e0',
              backgroundImage: 'linear-gradient(45deg, #e0dcd8 25%, transparent 25%), linear-gradient(-45deg, #e0dcd8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0dcd8 75%), linear-gradient(-45deg, transparent 75%, #e0dcd8 75%)',
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
            }}
          >
            {/* Face plate container */}
            <div
              className={`relative border-4 rounded-lg transition-all ${
                dragOverFace ? 'ring-2 ring-blue-400 ring-offset-2' : ''
              }`}
              style={{
                width: faceWidth + 24,
                height: faceHeight + 24,
                backgroundColor: faceBgColor,
                borderColor: assembly.color === 'black' ? '#333' : '#ddd',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, null)}
            >
              {/* Slot grid background */}
              <div 
                className="absolute inset-3 flex"
                style={{ gap: 0 }}
              >
                {Array.from({ length: assembly.size }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-dashed flex-shrink-0"
                    style={{
                      width: slotWidth,
                      height: faceHeight - 2,
                      borderColor: assembly.color === 'black' ? '#444' : '#ccc',
                    }}
                  />
                ))}
              </div>

              {/* Installed modules */}
              <div className="absolute inset-3 flex">
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
                      className={`relative flex-shrink-0 rounded cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? 'opacity-40 scale-95' : ''
                      } ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                      style={{
                        width: slot.size * slotWidth,
                        height: faceHeight - 2,
                        backgroundColor: assembly.color === 'black' ? '#2a2a2a' : '#fff',
                        border: `2px solid ${assembly.color === 'black' ? '#555' : '#bbb'}`,
                      }}
                    >
                      {/* Module image with real Bticino graphics */}
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded">
                        <ModuleImage 
                          moduleId={slot.moduleId} 
                          color={assembly.color}
                          width={slot.size * slotWidth - 8}
                          height={faceHeight - 12}
                        />
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveModule(idx);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
                      >
                        <span className="text-xs">×</span>
                      </button>
                    </div>
                  );
                })}

                {/* Empty drop zone indicator */}
                {remainingSize > 0 && (
                  <div
                    className={`flex-shrink-0 border-2 border-dashed rounded flex items-center justify-center transition-all ${
                      draggedModule ? 'border-blue-400 bg-blue-100/30' : 'border-gray-300'
                    }`}
                    style={{
                      width: remainingSize * slotWidth,
                      height: faceHeight - 2,
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
                    <div className="w-10 h-14 rounded bg-gray-50 flex items-center justify-center overflow-hidden border">
                      <ModuleImage 
                        moduleId={mod.id} 
                        color="white"
                        width={36}
                        height={50}
                      />
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

          {/* Installed modules list */}
          {assembly.modules.length > 0 && (
            <div className="mt-6 pt-4 border-t">
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
      const colorName = COLORS.find(c => c.id === assembly.color)?.name || assembly.color;
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Wall Box / Doza - separate by type
      const wbKey = `${assembly.size}M`;
      const wbSku = getWallBoxSku(assembly.size, wallBoxType, library);
      
      if (wallBoxType === 'drywall') {
        items.wallBoxesDrywall[wbKey] = items.wallBoxesDrywall[wbKey] || { 
          name: `Doza Gips-carton / Wall Box Drywall ${assembly.size}M`, 
          sku: wbSku,
          color: '—',
          qty: 0 
        };
        items.wallBoxesDrywall[wbKey].qty++;
      } else {
        items.wallBoxesMasonry[wbKey] = items.wallBoxesMasonry[wbKey] || { 
          name: `Doza Zidarie / Wall Box Masonry ${assembly.size}M`, 
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
        name: `Rama Montaj / Support ${assembly.size}M`, 
        sku: ifSku,
        color: '—',
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face / Rama Decor
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfSku = getDecorFaceSku(assembly.size, assembly.color, library);
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `Rama Decor / Cover Plate ${assembly.size}M`, 
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
            name: `${translatedName} - Fata / Face`, 
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
    
    // Function to remove diacritics - defined first
    const removeDiacritics = (str) => {
      if (!str) return str;
      return str
        .replace(/ă/g, 'a').replace(/Ă/g, 'A')
        .replace(/â/g, 'a').replace(/Â/g, 'A')
        .replace(/î/g, 'i').replace(/Î/g, 'I')
        .replace(/ș/g, 's').replace(/Ș/g, 'S')
        .replace(/ț/g, 't').replace(/Ț/g, 'T');
    };
    
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill of Quantities / Lista de Cantitati', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('For Supplier / Pentru Furnizor', pageWidth / 2, 28, { align: 'center' });
    
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
    doc.text('Project / Proiect:', 18, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.name) || '—', 60, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.clientName) || '—', 60, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date / Data:', 120, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('ro-RO'), 155, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Total items / Articole:', 120, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(totalItems.toString(), 170, 55);
    
    let yPos = 78;
    
    const sectionTitles = {
      wallBoxesMasonry: 'Wall Boxes Masonry / Doze Zidarie',
      wallBoxesDrywall: 'Wall Boxes Drywall / Doze Gips-carton',
      installFaces: 'Supports / Rame Montaj', 
      decorFaces: 'Cover Plates / Rame Decor',
      modules: 'Modules / Module',
      moduleFaces: 'Module Faces / Fete Module',
    };
    
    sections.forEach(({ key, title }) => {
      const items = Object.values(boqData[key]);
      if (items.length === 0) return;
      
      // Estimate space needed: header (12) + table header (10) + rows (8 each) + padding (15)
      const estimatedHeight = 12 + 10 + (items.length * 8) + 15;
      
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
      doc.rect(14, yPos, totalTableWidth, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(sectionTitles[key] || title, 18, yPos + 6);
      doc.setTextColor(0, 0, 0);
      
      // Move position AFTER the header
      yPos += 8;
      
      // Table with fixed column widths
      autoTable(doc, {
        startY: yPos,
        head: [['Item / Articol', 'Color / Culoare', 'SKU / Cod', 'Qty / Cant.']],
        body: items.map(item => [
          removeDiacritics(item.name) || '—', 
          removeDiacritics(item.color) || '—', 
          item.sku || '—', 
          item.qty.toString()
        ]),
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
          1: { cellWidth: col2Width, halign: 'left' },
          2: { cellWidth: col3Width, halign: 'left', fontStyle: 'italic', textColor: [100, 100, 100] },
          3: { cellWidth: col4Width, halign: 'center', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });
      
      // Update position for next section
      if (doc.previousAutoTable) {
        yPos = doc.previousAutoTable.finalY + 12;
      } else {
        yPos += 30;
      }
    });
    
    // Add padding after last table
    yPos += 20;
    
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${totalItems} items / articole`, pageWidth - 14, yPos, { align: 'right' });
    
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
    
    doc.setTextColor(0, 0, 0);
    doc.save(`BOQ_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const colorName = assembly.color === 'white' ? t.white : t.black;
      const wallBoxType = assembly.wallBoxType || 'masonry';

      // Wall Box - separate by type
      const wbKey = `${assembly.size}M`;
      const wbPrice = getWallBoxPrice(assembly.size, wallBoxType, library);
      
      if (wallBoxType === 'drywall') {
        items.wallBoxesDrywall[wbKey] = items.wallBoxesDrywall[wbKey] || { 
          name: `Doza Gips-carton / Wall Box Drywall ${assembly.size}M`, 
          color: '—',
          unitPrice: wbPrice,
          qty: 0 
        };
        items.wallBoxesDrywall[wbKey].qty++;
      } else {
        items.wallBoxesMasonry[wbKey] = items.wallBoxesMasonry[wbKey] || { 
          name: `Doza Zidarie / Wall Box Masonry ${assembly.size}M`, 
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
        name: `Rama Montaj / Support ${assembly.size}M`, 
        color: '—',
        unitPrice: ifPrice,
        qty: 0 
      };
      items.installFaces[ifKey].qty++;

      // Decor Face
      const dfKey = `${assembly.size}M-${assembly.color}`;
      const dfPrice = getDecorFacePrice(assembly.size, assembly.color, library);
      items.decorFaces[dfKey] = items.decorFaces[dfKey] || { 
        name: `Rama Decor / Cover Plate ${assembly.size}M`, 
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
            name: `${translatedName} - Fata / Face`, 
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
    
    // Function to remove diacritics - defined first
    const removeDiacritics = (str) => {
      if (!str) return str;
      return str
        .replace(/ă/g, 'a').replace(/Ă/g, 'A')
        .replace(/â/g, 'a').replace(/Â/g, 'A')
        .replace(/î/g, 'i').replace(/Î/g, 'I')
        .replace(/ș/g, 's').replace(/Ș/g, 'S')
        .replace(/ț/g, 't').replace(/Ț/g, 'T');
    };
    
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Quote / Oferta Client', pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('All prices include VAT 21% / Toate preturile includ TVA 21%', pageWidth / 2, 28, { align: 'center' });
    
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
    doc.text('Project / Proiect:', 18, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.name) || '—', 55, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 18, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(project.clientName) || '—', 55, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date / Data:', 110, 47);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('ro-RO'), 145, 47);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Items / Articole:', 110, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(totalItems.toString(), 145, 55);
    
    let yPos = 78;
    
    const sectionTitles = {
      wallBoxesMasonry: 'Wall Boxes Masonry / Doze Zidarie',
      wallBoxesDrywall: 'Wall Boxes Drywall / Doze Gips-carton',
      installFaces: 'Supports / Rame Montaj', 
      decorFaces: 'Cover Plates / Rame Decor',
      modules: 'Modules / Module',
      moduleFaces: 'Module Faces / Fete Module',
    };
    
    // Fixed column widths for quote (6 columns)
    const col1Width = 55;  // Item / Articol
    const col2Width = 25;  // Color / Culoare
    const col3Width = 28;  // Unit (excl. VAT)
    const col4Width = 28;  // Unit (incl. VAT)
    const col5Width = 18;  // Qty
    const col6Width = 28;  // Total
    const totalTableWidth = col1Width + col2Width + col3Width + col4Width + col5Width + col6Width;
    
    sections.forEach(({ key, title }) => {
      const items = Object.values(quoteData[key]);
      if (items.length === 0) return;
      
      const sectionTotalWithVat = calculateSectionTotal(quoteData[key]);
      
      // Estimate space needed
      const estimatedHeight = 12 + 10 + (items.length * 8) + 10 + 15;
      
      if (yPos + estimatedHeight > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      // Section header with gray background
      doc.setFillColor(80, 80, 80);
      doc.rect(14, yPos, totalTableWidth, 8, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(sectionTitles[key] || title, 18, yPos + 6);
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
          formatPrice(totalWithVat)
        ];
      });
      
      // Add subtotal row
      tableBody.push([
        { content: 'Subtotal:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } },
        { content: formatPrice(sectionTotalWithVat), styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } }
      ]);
      
      // Table with fixed column widths
      autoTable(doc, {
        startY: yPos,
        head: [['Item / Articol', 'Color', 'Unit (fara TVA)', 'Unit (cu TVA)', 'Cant.', 'Total']],
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
          1: { cellWidth: col2Width, halign: 'left' },
          2: { cellWidth: col3Width, halign: 'right', textColor: [100, 100, 100] },
          3: { cellWidth: col4Width, halign: 'right' },
          4: { cellWidth: col5Width, halign: 'center' },
          5: { cellWidth: col6Width, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: 14, right: 14 },
      });
      
      // Update position for next section - more padding
      if (doc.previousAutoTable) {
        yPos = doc.previousAutoTable.finalY + 18;
      } else {
        yPos += 35;
      }
    });
    
    // Add more padding after last table before grand total
    yPos += 20;
    
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
    doc.text(formatPrice(grandTotalWithoutVat) + ' RON', pageWidth - 18, yPos + 10, { align: 'right' });
    
    // VAT Amount
    doc.text('TVA (21%):', pageWidth - 96, yPos + 20);
    doc.text(formatPrice(vatAmount) + ' RON', pageWidth - 18, yPos + 20, { align: 'right' });
    
    // Total with VAT
    doc.setDrawColor(150, 150, 150);
    doc.line(pageWidth - 96, yPos + 25, pageWidth - 18, yPos + 25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 96, yPos + 35);
    doc.text(formatPrice(grandTotalWithVat) + ' RON', pageWidth - 18, yPos + 35, { align: 'right' });
    
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
    doc.save(`Quote_${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <div className="p-6 bg-gray-100 border-t">
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
      const colorName = assembly.color === 'white' ? t.white : t.black;
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
        ? `Doza Gips-carton / Wall Box Drywall ${assembly.size}M`
        : `Doza Zidarie / Wall Box Masonry ${assembly.size}M`;
      
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
        name: `Rama Montaj / Support ${assembly.size}M`,
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
        name: `Rama Decor / Cover Plate ${assembly.size}M`,
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
            name: `${translatedName} - Fata / Face`,
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
                        <th className="p-2 border-b w-[30%]">{t.item}</th>
                        <th className="p-2 border-b w-[12%]">{t.color}</th>
                        <th className="p-2 border-b text-right w-[15%]">{t.unitPurchase}</th>
                        <th className="p-2 border-b text-right w-[15%]">{t.unitSelling}</th>
                        <th className="p-2 border-b text-center w-[10%]">{t.qty}</th>
                        <th className="p-2 border-b text-right w-[18%]">{t.unitProfit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const lineProfit = (item.sellingPrice - item.purchasePrice) * item.qty;
                        return (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-gray-600">{item.color}</td>
                            <td className="p-2 text-right font-mono text-gray-500">{formatPrice(item.purchasePrice)}</td>
                            <td className="p-2 text-right font-mono">{formatPrice(item.sellingPrice)}</td>
                            <td className="p-2 text-center font-mono">{item.qty}</td>
                            <td className={`p-2 text-right font-mono font-bold ${lineProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPrice(lineProfit)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100">
                        <td colSpan={5} className="p-2 text-right font-bold">{t.subtotal}:</td>
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

function LibraryPage({ library, onUpdate, onBack }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [editingModule, setEditingModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const t = useTranslation();
  const lang = useLanguage();

  // New module form state
  const [newModule, setNewModule] = useState({
    id: '',
    hasColorVariants: false,
    moduleSku: '',
    nameEn: '',
    nameRo: '',
    size: 1,
    category: 'outlet',
    faceSku: { white: '', black: '' },
    modulePrice: 0,
    facePrice: { white: 0, black: 0 },
  });

  const updateWallBoxMasonry = (size, field, value) => {
    onUpdate({
      ...library,
      wallBoxesMasonry: {
        ...library.wallBoxesMasonry,
        [size]: {
          ...library.wallBoxesMasonry[size],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateWallBoxDrywall = (size, field, value) => {
    onUpdate({
      ...library,
      wallBoxesDrywall: {
        ...library.wallBoxesDrywall,
        [size]: {
          ...library.wallBoxesDrywall[size],
          [field]: field === 'price' ? parseFloat(value) || 0 : value,
        },
      },
    });
  };

  const updateInstallFace = (size, field, value) => {
    onUpdate({
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
    onUpdate({
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
    onUpdate({
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
    onUpdate({
      ...library,
      modules: [...library.modules, { ...newModule }],
    });
    setNewModule({
      id: '',
      hasColorVariants: false,
      moduleSku: '',
      nameEn: '',
      nameRo: '',
      size: 1,
      category: 'outlet',
      faceSku: { white: '', black: '' },
      modulePrice: 0,
      facePrice: { white: 0, black: 0 },
    });
    setShowAddModule(false);
  };

  const deleteModule = (moduleId) => {
    onUpdate({
      ...library,
      modules: library.modules.filter(m => m.id !== moduleId),
    });
    setConfirmDeleteId(null);
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" /> {t.componentLibrary}
        </h1>
        <p className="text-gray-600">{t.manageSKUs}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
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
          {t.decorFaces}
        </button>
      </div>

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-semibold">{t.modules}</h2>
            <button
              onClick={() => setShowAddModule(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded flex items-center gap-1 text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> {t.addModule}
            </button>
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
              
              {/* Color variants checkbox */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newModule.hasColorVariants}
                    onChange={(e) => {
                      const hasVariants = e.target.checked;
                      setNewModule({
                        ...newModule,
                        hasColorVariants: hasVariants,
                        moduleSku: hasVariants ? { white: '', black: '' } : '',
                        modulePrice: hasVariants ? { white: 0, black: 0 } : 0,
                      });
                    }}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{t.hasColorVariants}</span>
                </label>
              </div>
              
              {/* SKU & Price Table */}
              <table className="w-full text-sm mb-4 border rounded bg-white">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="p-2 border-b">{t.item}</th>
                    <th className="p-2 border-b">{t.sku}</th>
                    <th className="p-2 border-b">{t.priceInclVat}</th>
                    <th className="p-2 border-b text-gray-400">{t.priceExclVat}</th>
                  </tr>
                </thead>
                <tbody>
                  {newModule.hasColorVariants ? (
                    <>
                      {/* Module White Row */}
                      <tr className="border-b">
                        <td className="p-2">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded border bg-white"></span>
                            {t.modules} ({t.white})
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={newModule.moduleSku?.white || ''}
                            onChange={(e) => setNewModule({ ...newModule, moduleSku: { ...newModule.moduleSku, white: e.target.value.toUpperCase() } })}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newModule.modulePrice?.white || 0}
                            onChange={(e) => setNewModule({ ...newModule, modulePrice: { ...newModule.modulePrice, white: parseFloat(e.target.value) || 0 } })}
                            className="w-24 border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2 text-gray-400 font-mono">
                          {((newModule.modulePrice?.white || 0) / 1.21).toFixed(2)}
                        </td>
                      </tr>
                      {/* Module Black Row */}
                      <tr className="border-b bg-gray-50">
                        <td className="p-2">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded border bg-gray-800"></span>
                            {t.modules} ({t.black})
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={newModule.moduleSku?.black || ''}
                            onChange={(e) => setNewModule({ ...newModule, moduleSku: { ...newModule.moduleSku, black: e.target.value.toUpperCase() } })}
                            placeholder={t.enterSku}
                            className="w-full border rounded px-2 py-1 text-sm font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={newModule.modulePrice?.black || 0}
                            onChange={(e) => setNewModule({ ...newModule, modulePrice: { ...newModule.modulePrice, black: parseFloat(e.target.value) || 0 } })}
                            className="w-24 border rounded px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="p-2 text-gray-400 font-mono">
                          {((newModule.modulePrice?.black || 0) / 1.21).toFixed(2)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    /* Single Module Row */
                    <tr className="border-b">
                      <td className="p-2 font-medium">{t.modules}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={typeof newModule.moduleSku === 'string' ? newModule.moduleSku : ''}
                          onChange={(e) => setNewModule({ ...newModule, moduleSku: e.target.value.toUpperCase() })}
                          placeholder={t.enterSku}
                          className="w-full border rounded px-2 py-1 text-sm font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          value={typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0}
                          onChange={(e) => setNewModule({ ...newModule, modulePrice: parseFloat(e.target.value) || 0 })}
                          className="w-24 border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="p-2 text-gray-400 font-mono">
                        {((typeof newModule.modulePrice === 'number' ? newModule.modulePrice : 0) / 1.21).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {/* Face White Row */}
                  <tr className="border-b">
                    <td className="p-2">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded border bg-white"></span>
                        {t.face} ({t.white})
                      </span>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={newModule.faceSku?.white || ''}
                        onChange={(e) => setNewModule({ ...newModule, faceSku: { ...newModule.faceSku, white: e.target.value.toUpperCase() } })}
                        placeholder={t.enterSku}
                        className="w-full border rounded px-2 py-1 text-sm font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={newModule.facePrice?.white || 0}
                        onChange={(e) => setNewModule({ ...newModule, facePrice: { ...newModule.facePrice, white: parseFloat(e.target.value) || 0 } })}
                        className="w-24 border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="p-2 text-gray-400 font-mono">
                      {((newModule.facePrice?.white || 0) / 1.21).toFixed(2)}
                    </td>
                  </tr>
                  {/* Face Black Row */}
                  <tr className="bg-gray-50">
                    <td className="p-2">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded border bg-gray-800"></span>
                        {t.face} ({t.black})
                      </span>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={newModule.faceSku?.black || ''}
                        onChange={(e) => setNewModule({ ...newModule, faceSku: { ...newModule.faceSku, black: e.target.value.toUpperCase() } })}
                        placeholder={t.enterSku}
                        className="w-full border rounded px-2 py-1 text-sm font-mono"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={newModule.facePrice?.black || 0}
                        onChange={(e) => setNewModule({ ...newModule, facePrice: { ...newModule.facePrice, black: parseFloat(e.target.value) || 0 } })}
                        className="w-24 border rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="p-2 text-gray-400 font-mono">
                      {((newModule.facePrice?.black || 0) / 1.21).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              
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
              const GraphicComponent = getModuleGraphic(mod.id);
              return (
              <div key={mod.id} className="p-4">
                {editingModule === mod.id ? (
                  // Edit mode - Table format
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {GraphicComponent && (
                          <div style={{ transform: 'scale(0.5)', transformOrigin: 'center center' }}>
                            {React.createElement(GraphicComponent, { color: 'white' })}
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
                    
                    {/* Color variants checkbox */}
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mod.hasColorVariants || false}
                          onChange={(e) => {
                            const hasVariants = e.target.checked;
                            if (hasVariants) {
                              // Convert to color variants
                              const currentSku = typeof mod.moduleSku === 'string' ? mod.moduleSku : '';
                              const currentPrice = typeof mod.modulePrice === 'number' ? mod.modulePrice : 0;
                              updateModule(mod.id, {
                                hasColorVariants: true,
                                moduleSku: { white: currentSku, black: '' },
                                modulePrice: { white: currentPrice, black: currentPrice },
                              });
                            } else {
                              // Convert to single variant
                              const whiteSku = typeof mod.moduleSku === 'object' ? mod.moduleSku?.white || '' : mod.moduleSku || '';
                              const whitePrice = typeof mod.modulePrice === 'object' ? mod.modulePrice?.white || 0 : mod.modulePrice || 0;
                              updateModule(mod.id, {
                                hasColorVariants: false,
                                moduleSku: whiteSku,
                                modulePrice: whitePrice,
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{t.hasColorVariants}</span>
                      </label>
                    </div>
                    
                    {/* SKU & Price Table - dynamic based on hasColorVariants */}
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
                          {mod.hasColorVariants ? (
                            <>
                              {/* Module White Row */}
                              <tr className="border-b">
                                <td className="p-2">
                                  <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded border bg-white"></span>
                                    {t.modules} ({t.white})
                                  </span>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={typeof mod.moduleSku === 'object' ? mod.moduleSku?.white || '' : ''}
                                    onChange={(e) => updateModule(mod.id, { moduleSku: { ...(typeof mod.moduleSku === 'object' ? mod.moduleSku : {}), white: e.target.value.toUpperCase() } })}
                                    placeholder={t.enterSku}
                                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.white || 0 : 0}
                                    onChange={(e) => {
                                      const newPurchase = parseFloat(e.target.value) || 0;
                                      const currentMarkup = typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup?.white || 0 : 0;
                                      const newPrice = calcPriceWithVat(newPurchase, currentMarkup);
                                      updateModule(mod.id, { 
                                        modulePurchasePrice: { ...(typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice : {}), white: newPurchase },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), white: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup?.white || 0 : 0}
                                    onChange={(newMarkup) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.white || 0 : 0;
                                      const newPrice = calcPriceWithVat(currentPurchase, newMarkup);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), white: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), white: newPrice }
                                      });
                                    }}
                                    step="1"
                                    decimals={0}
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={(typeof mod.modulePrice === 'object' ? mod.modulePrice?.white || 0 : 0) / (1 + VAT_RATE)}
                                    onChange={(newSellingWithoutVat) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.white || 0 : 0;
                                      const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                                      const newMarkup = calcMarkupFromPriceWithoutVat(currentPurchase, newSellingWithoutVat);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), white: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), white: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={typeof mod.modulePrice === 'object' ? mod.modulePrice?.white || 0 : 0}
                                    onChange={(newPrice) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.white || 0 : 0;
                                      const newMarkup = calcMarkupFromPriceWithVat(currentPurchase, newPrice);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), white: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), white: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm font-medium"
                                  />
                                </td>
                              </tr>
                              {/* Module Black Row */}
                              <tr className="border-b bg-gray-50">
                                <td className="p-2">
                                  <span className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded border bg-gray-800"></span>
                                    {t.modules} ({t.black})
                                  </span>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="text"
                                    value={typeof mod.moduleSku === 'object' ? mod.moduleSku?.black || '' : ''}
                                    onChange={(e) => updateModule(mod.id, { moduleSku: { ...(typeof mod.moduleSku === 'object' ? mod.moduleSku : {}), black: e.target.value.toUpperCase() } })}
                                    placeholder={t.enterSku}
                                    className="w-full border rounded px-2 py-1 text-sm font-mono"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.black || 0 : 0}
                                    onChange={(e) => {
                                      const newPurchase = parseFloat(e.target.value) || 0;
                                      const currentMarkup = typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup?.black || 0 : 0;
                                      const newPrice = calcPriceWithVat(newPurchase, currentMarkup);
                                      updateModule(mod.id, { 
                                        modulePurchasePrice: { ...(typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice : {}), black: newPurchase },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), black: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup?.black || 0 : 0}
                                    onChange={(newMarkup) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.black || 0 : 0;
                                      const newPrice = calcPriceWithVat(currentPurchase, newMarkup);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), black: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), black: newPrice }
                                      });
                                    }}
                                    step="1"
                                    decimals={0}
                                    className="w-16 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={(typeof mod.modulePrice === 'object' ? mod.modulePrice?.black || 0 : 0) / (1 + VAT_RATE)}
                                    onChange={(newSellingWithoutVat) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.black || 0 : 0;
                                      const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                                      const newMarkup = calcMarkupFromPriceWithoutVat(currentPurchase, newSellingWithoutVat);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), black: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), black: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="p-2">
                                  <PriceInput
                                    value={typeof mod.modulePrice === 'object' ? mod.modulePrice?.black || 0 : 0}
                                    onChange={(newPrice) => {
                                      const currentPurchase = typeof mod.modulePurchasePrice === 'object' ? mod.modulePurchasePrice?.black || 0 : 0;
                                      const newMarkup = calcMarkupFromPriceWithVat(currentPurchase, newPrice);
                                      updateModule(mod.id, { 
                                        moduleMarkup: { ...(typeof mod.moduleMarkup === 'object' ? mod.moduleMarkup : {}), black: newMarkup },
                                        modulePrice: { ...(typeof mod.modulePrice === 'object' ? mod.modulePrice : {}), black: newPrice }
                                      });
                                    }}
                                    className="w-20 border rounded px-2 py-1 text-sm font-medium"
                                  />
                                </td>
                              </tr>
                            </>
                          ) : (
                            /* Single Module Row */
                            <tr className="border-b">
                              <td className="p-2 font-medium">{t.modules}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={typeof mod.moduleSku === 'string' ? mod.moduleSku : ''}
                                  onChange={(e) => updateModule(mod.id, { moduleSku: e.target.value.toUpperCase() })}
                                  placeholder={t.enterSku}
                                  className="w-full border rounded px-2 py-1 text-sm font-mono"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0}
                                  onChange={(e) => {
                                    const newPurchase = parseFloat(e.target.value) || 0;
                                    const currentMarkup = typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 0;
                                    const newPrice = calcPriceWithVat(newPurchase, currentMarkup);
                                    updateModule(mod.id, { modulePurchasePrice: newPurchase, modulePrice: newPrice });
                                  }}
                                  className="w-20 border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <PriceInput
                                  value={typeof mod.moduleMarkup === 'number' ? mod.moduleMarkup : 0}
                                  onChange={(newMarkup) => {
                                    const currentPurchase = typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0;
                                    const newPrice = calcPriceWithVat(currentPurchase, newMarkup);
                                    updateModule(mod.id, { moduleMarkup: newMarkup, modulePrice: newPrice });
                                  }}
                                  step="1"
                                  decimals={0}
                                  className="w-16 border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <PriceInput
                                  value={(typeof mod.modulePrice === 'number' ? mod.modulePrice : 0) / (1 + VAT_RATE)}
                                  onChange={(newSellingWithoutVat) => {
                                    const currentPurchase = typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0;
                                    const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                                    const newMarkup = calcMarkupFromPriceWithoutVat(currentPurchase, newSellingWithoutVat);
                                    updateModule(mod.id, { moduleMarkup: newMarkup, modulePrice: newPrice });
                                  }}
                                  className="w-20 border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="p-2">
                                <PriceInput
                                  value={typeof mod.modulePrice === 'number' ? mod.modulePrice : 0}
                                  onChange={(newPrice) => {
                                    const currentPurchase = typeof mod.modulePurchasePrice === 'number' ? mod.modulePurchasePrice : 0;
                                    const newMarkup = calcMarkupFromPriceWithVat(currentPurchase, newPrice);
                                    updateModule(mod.id, { moduleMarkup: newMarkup, modulePrice: newPrice });
                                  }}
                                  className="w-20 border rounded px-2 py-1 text-sm font-medium"
                                />
                              </td>
                            </tr>
                          )}
                          {/* Face White Row */}
                          <tr className="border-b">
                            <td className="p-2">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded border bg-white"></span>
                                {t.face} ({t.white})
                              </span>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={mod.faceSku?.white || ''}
                                onChange={(e) => updateModule(mod.id, { faceSku: { ...mod.faceSku, white: e.target.value.toUpperCase() } })}
                                placeholder={t.enterSku}
                                className="w-full border rounded px-2 py-1 text-sm font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={mod.facePurchasePrice?.white || 0}
                                onChange={(e) => {
                                  const newPurchase = parseFloat(e.target.value) || 0;
                                  const currentMarkup = mod.faceMarkup?.white || 0;
                                  const newPrice = calcPriceWithVat(newPurchase, currentMarkup);
                                  updateModule(mod.id, { 
                                    facePurchasePrice: { ...mod.facePurchasePrice, white: newPurchase },
                                    facePrice: { ...mod.facePrice, white: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={mod.faceMarkup?.white || 0}
                                onChange={(newMarkup) => {
                                  const currentPurchase = mod.facePurchasePrice?.white || 0;
                                  const newPrice = calcPriceWithVat(currentPurchase, newMarkup);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, white: newMarkup },
                                    facePrice: { ...mod.facePrice, white: newPrice }
                                  });
                                }}
                                step="1"
                                decimals={0}
                                className="w-16 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={(mod.facePrice?.white || 0) / (1 + VAT_RATE)}
                                onChange={(newSellingWithoutVat) => {
                                  const currentPurchase = mod.facePurchasePrice?.white || 0;
                                  const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                                  const newMarkup = calcMarkupFromPriceWithoutVat(currentPurchase, newSellingWithoutVat);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, white: newMarkup },
                                    facePrice: { ...mod.facePrice, white: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={mod.facePrice?.white || 0}
                                onChange={(newPrice) => {
                                  const currentPurchase = mod.facePurchasePrice?.white || 0;
                                  const newMarkup = calcMarkupFromPriceWithVat(currentPurchase, newPrice);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, white: newMarkup },
                                    facePrice: { ...mod.facePrice, white: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm font-medium"
                              />
                            </td>
                          </tr>
                          {/* Face Black Row */}
                          <tr className="bg-gray-50">
                            <td className="p-2">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded border bg-gray-800"></span>
                                {t.face} ({t.black})
                              </span>
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={mod.faceSku?.black || ''}
                                onChange={(e) => updateModule(mod.id, { faceSku: { ...mod.faceSku, black: e.target.value.toUpperCase() } })}
                                placeholder={t.enterSku}
                                className="w-full border rounded px-2 py-1 text-sm font-mono"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                value={mod.facePurchasePrice?.black || 0}
                                onChange={(e) => {
                                  const newPurchase = parseFloat(e.target.value) || 0;
                                  const currentMarkup = mod.faceMarkup?.black || 0;
                                  const newPrice = calcPriceWithVat(newPurchase, currentMarkup);
                                  updateModule(mod.id, { 
                                    facePurchasePrice: { ...mod.facePurchasePrice, black: newPurchase },
                                    facePrice: { ...mod.facePrice, black: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={mod.faceMarkup?.black || 0}
                                onChange={(newMarkup) => {
                                  const currentPurchase = mod.facePurchasePrice?.black || 0;
                                  const newPrice = calcPriceWithVat(currentPurchase, newMarkup);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, black: newMarkup },
                                    facePrice: { ...mod.facePrice, black: newPrice }
                                  });
                                }}
                                step="1"
                                decimals={0}
                                className="w-16 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={(mod.facePrice?.black || 0) / (1 + VAT_RATE)}
                                onChange={(newSellingWithoutVat) => {
                                  const currentPurchase = mod.facePurchasePrice?.black || 0;
                                  const newPrice = calcPriceWithVatFromWithout(newSellingWithoutVat);
                                  const newMarkup = calcMarkupFromPriceWithoutVat(currentPurchase, newSellingWithoutVat);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, black: newMarkup },
                                    facePrice: { ...mod.facePrice, black: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm"
                              />
                            </td>
                            <td className="p-2">
                              <PriceInput
                                value={mod.facePrice?.black || 0}
                                onChange={(newPrice) => {
                                  const currentPurchase = mod.facePurchasePrice?.black || 0;
                                  const newMarkup = calcMarkupFromPriceWithVat(currentPurchase, newPrice);
                                  updateModule(mod.id, { 
                                    faceMarkup: { ...mod.faceMarkup, black: newMarkup },
                                    facePrice: { ...mod.facePrice, black: newPrice }
                                  });
                                }}
                                className="w-20 border rounded px-2 py-1 text-sm font-medium"
                              />
                            </td>
                          </tr>
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
                      <div className="w-12 h-14 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {GraphicComponent && (
                          <div style={{ transform: 'scale(0.5)', transformOrigin: 'center center' }}>
                            {React.createElement(GraphicComponent, { color: 'white' })}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{getModuleName(mod, lang)}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono">{typeof mod.moduleSku === 'object' ? `${mod.moduleSku?.white || '?'} / ${mod.moduleSku?.black || '?'}` : mod.moduleSku}</span> · {mod.size}M · {mod.category === 'outlet' ? t.outlet : mod.category === 'switch' ? t.switch : t.other}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {t.priceInclVat}: {typeof mod.modulePrice === 'object' ? `${mod.modulePrice?.white || 0} / ${mod.modulePrice?.black || 0}` : mod.modulePrice || 0} RON
                        </div>
                      </div>
                    </div>
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
                  </div>
                )}
              </div>
              );
            })}
          </div>
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
                  {SIZES.map((size) => {
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
                  {SIZES.map((size) => {
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
                {SIZES.map((size) => {
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
                            onUpdate({
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
                            onUpdate({
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
                            onUpdate({
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
                            onUpdate({
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
                {SIZES.map((size) => (
                  COLORS.map((color, colorIdx) => {
                    const key = `${size}-${color.id}`;
                    const item = library.decorFaces[key] || {};
                    const purchasePrice = item.purchasePrice || 0;
                    const markup = item.markup || 0;
                    const priceWithVat = item.price || 0;
                    const sellingWithoutVat = priceWithVat / (1 + VAT_RATE);
                    
                    return (
                      <tr key={key} className={colorIdx === 0 ? 'border-t' : ''}>
                        {colorIdx === 0 && (
                          <td className="p-2 font-medium" rowSpan={COLORS.length}>{size}M</td>
                        )}
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex }}
                            />
                            {color.id === 'white' ? t.white : t.black}
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
                              onUpdate({
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
          createdAt: project.created_at,
          assemblies: (assemblies || []).map(a => ({
            id: a.id,
            type: a.type,
            code: a.code,
            room: a.room,
            size: a.size,
            color: a.color,
            modules: a.modules || [],
          })),
        };
      })
    );

    setData({ projects: projectsWithAssemblies });
  };

  const loadLibraryFromSupabase = async () => {
    const { data, error } = await supabase
      .from('user_library')
      .select('library_data')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.log('No library in Supabase, using default/local');
      const localLib = loadLibrary();
      setLibrary(localLib);
    } else if (data?.library_data) {
      setLibrary(data.library_data);
    }
    setLibraryLoaded(true);
  };

  const saveLibraryToSupabase = async (libraryData) => {
    const { error } = await supabase
      .from('user_library')
      .upsert({
        user_id: session.user.id,
        library_data: libraryData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving library:', error);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadProjects();
      loadLibraryFromSupabase();
    }
  }, [session]);

  const saveProject = async (project) => {
  const { error } = await supabase
    .from('projects')
    .update({
      name: project.name,
      client_name: project.clientName,
      client_contact: project.clientContact,
    })
    .eq('id', project.id);

  if (error) {
    console.error('Error saving project:', error);
    return;
  }

  // Salvează ansamblurile
  for (const assembly of project.assemblies) {
    // Verifică dacă assembly.id e UUID valid sau nu
    const assemblyData = {
      project_id: project.id,
      type: assembly.type,
      code: assembly.code,
      room: assembly.room,
      size: assembly.size,
      color: assembly.color,
      modules: assembly.modules,
    };

    // Încearcă update, dacă nu există face insert
    const { data: existing } = await supabase
      .from('assemblies')
      .select('id')
      .eq('id', assembly.id)
      .single();

    if (existing) {
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
      
      // Actualizează ID-ul local
      if (newAssembly) {
        assembly.id = newAssembly.id;
      }
    }
  }
};

useEffect(() => {
  if (session?.user && libraryLoaded) {
    saveLibrary(library); // păstrează și local ca backup
    saveLibraryToSupabase(library);
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

  const createProject = async (name, client) => {
  // Inserăm în Supabase și lăsăm să genereze ID-ul
  const { data: savedProject, error } = await supabase
    .from('projects')
    .insert({
      user_id: session.user.id,
      name: name,
      client_name: client,
      client_contact: '',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return;
  }

  const newProject = {
    id: savedProject.id,
    name: savedProject.name,
    clientName: savedProject.client_name,
    clientContact: savedProject.client_contact,
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
        BTicino Living Now
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{session.user.email}</span>
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
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={library}>
          <div className="min-h-screen bg-gray-100">
            <GlobalHeader />
            <div className="pt-14">
              <LibraryPage
                library={library}
                onUpdate={setLibrary}
                onBack={() => setShowLibrary(false)}
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
    return (
      <LanguageContext.Provider value={languageContextValue}>
        <LibraryContext.Provider value={library}>
          <div className="min-h-screen bg-gray-100">
            <GlobalHeader />
            <div className="pt-14">
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
          <div className="pt-14">
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