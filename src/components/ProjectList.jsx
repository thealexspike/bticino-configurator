import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, Package, Settings } from 'lucide-react';
import { SYSTEMS } from '../data/libraries';
import { useTranslation, useLanguage } from '../i18n';
import { getSystemName } from '../lib/library';
import { useReadOnly } from '../readOnly';

export function ProjectList({ projects, onSelect, onCreate, onDelete, onOpenLibrary, title }) {
  const readOnly = useReadOnly();
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
          {title || t.configurator}
        </h1>
        {!readOnly && (
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLibrary}
            className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" /> {t.library}
          </button>
        </div>
        )}
      </div>

      {!readOnly && (
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
      )}

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
                  {!readOnly && (
                  <button
                    onClick={() => onDelete(project.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  )}
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
