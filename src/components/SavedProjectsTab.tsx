import React, { useState, useEffect } from 'react';
import { ProjectConfig } from '../generator/types';
import { createProjectConfigFromTemplate } from '../generator/templates/domainTemplates';
import {
  FolderArchive,
  Save,
  Trash2,
  Copy,
  Download,
  Upload,
  Check,
  Clock,
  Database,
  Shield,
  Layers,
  ArrowRight,
  FolderPlus,
  AlertCircle
} from 'lucide-react';

interface StoredProjectItem {
  id: string;
  name: string;
  updatedAt: string;
  config: ProjectConfig;
}

const STORAGE_KEY = 'sb_backend_generator_projects';

interface SavedProjectsTabProps {
  currentConfig: ProjectConfig;
  onLoadProject: (config: ProjectConfig) => void;
}

export const SavedProjectsTab: React.FC<SavedProjectsTabProps> = ({
  currentConfig,
  onLoadProject
}) => {
  const [savedProjects, setSavedProjects] = useState<StoredProjectItem[]>([]);
  const [saveName, setSaveName] = useState(currentConfig.projectName || '');
  const [notice, setNotice] = useState<string | null>(null);

  // Initialize from localStorage or seed initial starter projects
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedProjects(parsed);
          return;
        }
      }

      // Seed 2 default projects
      const seed1: StoredProjectItem = {
        id: 'seed-fintech-core',
        name: 'FinTech Banking & Ledger MVP',
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        config: createProjectConfigFromTemplate('FINTECH_BANKING', {
          projectName: 'fintech-core-banking',
          database: 'postgresql',
          security: { enabled: true }
        })
      };

      const seed2: StoredProjectItem = {
        id: 'seed-saas-pm',
        name: 'B2B Task Tracker SaaS',
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        config: createProjectConfigFromTemplate('PROJECT_MANAGEMENT_SAAS', {
          projectName: 'project-tracker-backend',
          database: 'postgresql',
          security: { enabled: true }
        })
      };

      const defaults = [seed1, seed2];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      setSavedProjects(defaults);
    } catch {
      // Fallback
    }
  }, []);

  const persistProjects = (items: StoredProjectItem[]) => {
    setSavedProjects(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  };

  const handleSaveCurrent = () => {
    const trimmed = saveName.trim() || currentConfig.projectName || 'My Spring Boot Project';
    const newId = `proj-${Date.now()}`;
    const newItem: StoredProjectItem = {
      id: newId,
      name: trimmed,
      updatedAt: new Date().toISOString(),
      config: JSON.parse(JSON.stringify(currentConfig))
    };

    const updated = [newItem, ...savedProjects.filter(p => p.name !== trimmed)];
    persistProjects(updated);
    setNotice(`Saved "${trimmed}" to local projects!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    persistProjects(updated);
  };

  const handleClone = (item: StoredProjectItem) => {
    const clonedConfig: ProjectConfig = JSON.parse(JSON.stringify(item.config));
    clonedConfig.projectName = `${clonedConfig.projectName}-copy`;
    clonedConfig.artifactId = `${clonedConfig.artifactId}-copy`;

    const newItem: StoredProjectItem = {
      id: `proj-${Date.now()}`,
      name: `${item.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      config: clonedConfig
    };

    persistProjects([newItem, ...savedProjects]);
    setNotice(`Cloned "${item.name}"!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleExportJson = (item: StoredProjectItem) => {
    const blob = new Blob([JSON.stringify(item.config, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.config.projectName || 'project'}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text) as ProjectConfig;
        if (!parsed.projectName || !Array.isArray(parsed.entities)) {
          alert('Invalid project configuration JSON.');
          return;
        }

        const newItem: StoredProjectItem = {
          id: `proj-${Date.now()}`,
          name: parsed.projectName,
          updatedAt: new Date().toISOString(),
          config: parsed
        };

        persistProjects([newItem, ...savedProjects]);
        onLoadProject(parsed);
        setNotice(`Imported & loaded "${parsed.projectName}"!`);
        setTimeout(() => setNotice(null), 3000);
      } catch {
        alert('Failed to parse uploaded JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Saved Projects & Workspaces
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Local Storage
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Manage, clone, export, and switch between your backend architectures.
              </p>
            </div>
          </div>
        </div>

        {/* Import JSON */}
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Save Current Project Box */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-purple-400" />
            Save Current Active Project
          </h4>
          <p className="text-xs text-slate-400">
            Snapshot your current configuration ({currentConfig.entities.length} entities, {currentConfig.database.toUpperCase()}) to your browser storage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Project display name..."
            className="px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-56"
          />
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-slate-400">
          Stored Configurations ({savedProjects.length})
        </h3>

        {savedProjects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <FolderArchive className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No saved projects found in browser storage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProjects.map(item => {
              const formattedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <span className="font-mono text-[10px] text-slate-500">
                          {item.config.projectName}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono border border-slate-700">
                        {item.config.database.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Java {item.config.javaVersion}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Boot {item.config.springBootVersion}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        {item.config.entities.length} Entities
                      </span>
                      {item.config.security?.enabled && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          JWT
                        </span>
                      )}
                    </div>

                    {/* Entities list */}
                    <div className="flex flex-wrap gap-1">
                      {item.config.entities.slice(0, 5).map(e => (
                        <span
                          key={e.name}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400"
                        >
                          {e.name}
                        </span>
                      ))}
                      {item.config.entities.length > 5 && (
                        <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-500">
                          +{item.config.entities.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleClone(item)}
                        title="Clone configuration"
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportJson(item)}
                        title="Export JSON configuration"
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Delete saved project"
                        className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadProject(item.config);
                        setNotice(`Loaded "${item.name}" into editor!`);
                        setTimeout(() => setNotice(null), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Load Project</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
