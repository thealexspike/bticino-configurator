import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, Package, Zap, Settings, FileText, Upload, Map as MapIcon } from 'lucide-react';
import { api } from '../api';
import { AssemblyEditor } from './AssemblyEditor';
import { AssemblyList } from './AssemblyList';
import { BOQView } from './BOQView';
import { ProfitView } from './ProfitView';
import { QuoteView } from './QuoteView';
import { PlanView } from './PlanView';
import { PlanLinkContext } from '../planLink';
import { filesToPlans, PLAN_FILE_ACCEPT } from '../lib/planImport';
import { SYSTEMS } from '../data/libraries';
import { useTranslation, useLanguage } from '../i18n';
import { useReadOnly } from '../readOnly';
import { generateId, generateAssemblyCode, reorderAssembly, createAssembly, createModuleInstance } from '../lib/assemblies';
import { getAvailableColors, getSystemName, getColorName, LibraryContext } from '../lib/library';

export function ProjectDetail({ project, onBack, onUpdate, getLibraryForSystem }) {
  const [activeTab, setActiveTab] = useState('outlets');
  const [editingAssembly, setEditingAssembly] = useState(null);
  const [showPresetDialog, setShowPresetDialog] = useState(null); // 'outlet' or 'switch' or null
  const [editingProject, setEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState(project.name);
  const [editClientName, setEditClientName] = useState(project.clientName || '');
  const [editProjectSystem, setEditProjectSystem] = useState(project.system || 'bticino');
  const [fallbackColor, setFallbackColor] = useState('');
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
  const readOnly = useReadOnly();

  // Planuri (opționale): lista de aparataje rămâne ca înainte; cu un plan deschis,
  // ecranul se împarte: lista în stânga (30%), planul în dreapta.
  const planOpenKey = `configurator-aparataj-plan-open-${project.id}`;
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [planOpen, setPlanOpen] = useState(() => {
    try { return localStorage.getItem(planOpenKey) !== '0'; } catch { return true; }
  });
  const [planImportStatus, setPlanImportStatus] = useState(null);
  const planViewRef = useRef(null);
  const planFileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.listPlans(project.id)
      .then(list => {
        if (cancelled) return;
        setPlans(list);
        setActivePlanId(current => (list.some(p => p.id === current) ? current : list[0]?.id || null));
      })
      .catch(err => console.error('Error loading plans:', err));
    return () => { cancelled = true; };
  }, [project.id]);

  const setPlanPanelOpen = (open) => {
    setPlanOpen(open);
    try { localStorage.setItem(planOpenKey, open ? '1' : '0'); } catch { /* stocare indisponibilă */ }
  };

  const importPlanFiles = async (files) => {
    if (!files || files.length === 0) return;
    setPlanImportStatus(lang === 'ro' ? 'Se pregătește planul...' : 'Preparing plan...');
    if (plans.length === 0) setPlanPanelOpen(true);
    try {
      const items = await filesToPlans(files, setPlanImportStatus);
      const created = [];
      for (const item of items) {
        setPlanImportStatus((lang === 'ro' ? 'Se încarcă ' : 'Uploading ') + item.name);
        created.push(await api.createPlan(project.id, item));
      }
      if (created.length) {
        setPlans(prev => [...prev, ...created]);
        setActivePlanId(created[0].id);
        setPlanPanelOpen(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPlanImportStatus(null);
    }
  };

  const planVisible = planOpen && (plans.length > 0 || !!planImportStatus);
  const planLinkValue = {
    active: planVisible,
    locate: (assemblyId) => planViewRef.current?.focusAssembly(assemblyId),
    planNames: Object.fromEntries(plans.map(p => [p.id, p.name])),
  };

  const outlets = project.assemblies.filter(a => a.type === 'outlet');
  const switches = project.assemblies.filter(a => a.type === 'switch');

  // La schimbarea sistemului, culorile care nu există în sistemul nou se înlocuiesc
  // cu o culoare din sistemul nou (nu se inventează culori)
  const targetLibrary = getLibraryForSystem ? getLibraryForSystem(editProjectSystem) : library;
  const targetColors = getAvailableColors(targetLibrary);
  const systemChanged = editProjectSystem !== (project.system || 'bticino');
  const assembliesWithMissingColor = systemChanged
    ? project.assemblies.filter(a => !targetColors.some(c => c.id === a.color))
    : [];
  const effectiveFallbackColor = targetColors.some(c => c.id === fallbackColor)
    ? fallbackColor
    : (targetColors[0]?.id || 'white');

  const saveProjectDetails = () => {
    const assemblies = assembliesWithMissingColor.length > 0
      ? project.assemblies.map(a => (targetColors.some(c => c.id === a.color) ? a : { ...a, color: effectiveFallbackColor }))
      : project.assemblies;
    onUpdate({
      ...project,
      name: editProjectName.trim() || project.name,
      clientName: editClientName.trim(),
      system: editProjectSystem,
      assemblies,
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

  // Move an assembly between outlets and switches; it gets the next free code in the target list
  const moveAssemblyToType = (assemblyId, newType) => {
    const source = project.assemblies.find(a => a.id === assemblyId);
    if (!source || source.type === newType) return;
    const code = generateAssemblyCode(project.assemblies, newType);
    onUpdate({
      ...project,
      assemblies: project.assemblies.map(a => a.id === assemblyId ? { ...a, type: newType, code } : a),
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
      planId: null,
      planX: null,
      planY: null,
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
      
      // Apel către API-ul propriu (Cloudflare Pages Function)
      let result;
      try {
        result = await api.parseNecesar(
          pdfBase64,
          moduleCatalog,
          library?.systemName || getSystemName(project?.system, 'en'),
        );
      } catch (err) {
        setAiImportResult({ error: err.message || t.aiImportError });
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
    <PlanLinkContext.Provider value={planLinkValue}>
    <div className={planVisible ? 'p-4 flex gap-4 items-start' : 'p-6 max-w-4xl mx-auto'}>
      <div className={planVisible ? 'w-[30%] min-w-[420px] shrink-0' : ''}>
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
            {assembliesWithMissingColor.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                <p className="text-amber-800 mb-2">{t.colorsNotInSystem.replace('{n}', assembliesWithMissingColor.length)}</p>
                <select
                  value={effectiveFallbackColor}
                  onChange={(e) => setFallbackColor(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  {targetColors.map(c => (
                    <option key={c.id} value={c.id}>{getColorName(c.id, targetLibrary, lang)}</option>
                  ))}
                </select>
              </div>
            )}
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
            {!readOnly && (
            <button
              onClick={() => setEditingProject(true)}
              className="text-gray-500 hover:text-blue-600 p-2"
              title={t.editProject}
            >
              <Settings className="w-5 h-5" />
            </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {!readOnly && (
        <button
          onClick={() => { setShowAiImport(true); if (!aiImportColor) setAiImportColor(getAvailableColors(library)?.[0]?.id || 'white'); }}
          className="flex items-center gap-1 px-3 py-2 rounded text-sm bg-purple-600 text-white hover:bg-purple-700"
        >
          <Upload className="w-4 h-4" /> {t.aiImport}
        </button>
        )}
        {plans.length === 0 && !readOnly && (
          <>
            <button
              onClick={() => planFileInputRef.current?.click()}
              disabled={!!planImportStatus}
              className="flex items-center gap-1 px-3 py-2 rounded text-sm bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              title={lang === 'ro' ? 'Importă planul electric (JPEG, PNG sau PDF; un plan pe pagină)' : 'Import the electrical plan (JPEG, PNG or PDF; one plan per page)'}
            >
              <MapIcon className="w-4 h-4" /> {planImportStatus ? (lang === 'ro' ? 'Se importă...' : 'Importing...') : (lang === 'ro' ? 'Import plan' : 'Import plan')}
            </button>
            <input
              ref={planFileInputRef}
              type="file"
              accept={PLAN_FILE_ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => { importPlanFiles(e.target.files); e.target.value = ''; }}
            />
          </>
        )}
        {plans.length > 0 && (
          <button
            onClick={() => setPlanPanelOpen(!planOpen)}
            className={`flex items-center gap-1 px-3 py-2 rounded text-sm ${planOpen ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100'}`}
          >
            <MapIcon className="w-4 h-4" /> {planOpen ? (lang === 'ro' ? 'Ascunde planul' : 'Hide plan') : (lang === 'ro' ? 'Arată planul' : 'Show plan')}
          </button>
        )}
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
          onMoveToType={moveAssemblyToType}
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
          onMoveToType={moveAssemblyToType}
          existingRooms={existingRooms}
        />
      )}
      {activeTab === 'boq' && <BOQView project={project} onUpdate={onUpdate} />}
      {activeTab === 'quote' && <QuoteView project={project} onUpdate={onUpdate} />}
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

      {planVisible && (
        <div className="flex-1 min-w-0 sticky top-16" style={{ height: 'calc(100vh - 5rem)' }}>
          <PlanView
            ref={planViewRef}
            project={project}
            plans={plans}
            activePlanId={activePlanId}
            onSelectPlan={setActivePlanId}
            onPlansChange={setPlans}
            onUpdate={onUpdate}
            onAddFiles={importPlanFiles}
            importStatus={planImportStatus}
            onCollapse={() => setPlanPanelOpen(false)}
          />
        </div>
      )}
    </div>
    </PlanLinkContext.Provider>
  );
}
