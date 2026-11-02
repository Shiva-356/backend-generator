import React from 'react';
import {
  Download,
  FolderArchive,
  Layers,
  Shield,
  Database,
  Sparkles,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertCircle,
  Rocket,
  BookOpen,
  Save,
  LayoutDashboard,
  Sliders
} from 'lucide-react';
import { ProjectConfig, GeneratedProject } from '../generator/types';
import { DOMAIN_TEMPLATES } from '../generator/templates/domainTemplates';

export type AppTabType =
  | 'dashboard'
  | 'settings'
  | 'entities'
  | 'security'
  | 'preview'
  | 'startup'
  | 'database'
  | 'templates'
  | 'saved'
  | 'docs';

interface NavbarProps {
  config: ProjectConfig;
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  onApplyTemplate: (templateKey: string) => void;
  onGenerate: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
  generatedProject: GeneratedProject | null;
  isStale: boolean;
  validationErrorsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  activeTab,
  setActiveTab,
  onApplyTemplate,
  onGenerate,
  onDownload,
  isGenerating,
  isDownloading,
  generatedProject,
  isStale,
  validationErrorsCount
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-105 transition"
              aria-label="Go to Dashboard"
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
                <Code2 className="w-5 h-5" aria-hidden="true" />
              </div>
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <h1
                  onClick={() => setActiveTab('dashboard')}
                  className="text-base sm:text-lg font-black tracking-tight text-white cursor-pointer hover:text-emerald-300 transition"
                >
                  Backend Generator
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Boot 3.x
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Java {config.javaVersion}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                SaaS Spring Boot 3 Engine • PostgreSQL, MySQL & H2 • Spring Security 6 & JWT
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Template Picker */}
            <div className="relative inline-block text-left hidden lg:block">
              <label htmlFor="domain-template-select" className="sr-only">
                Load Domain Template
              </label>
              <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                <span className="font-medium text-slate-300">Preset:</span>
                <select
                  id="domain-template-select"
                  aria-label="Load Predefined Domain Template"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onApplyTemplate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate"
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    Choose Template...
                  </option>
                  {Object.entries(DOMAIN_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key} className="bg-slate-900 text-white">
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                isStale
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Generate Spring Boot Project Files"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{isGenerating ? 'Synthesizing...' : isStale ? 'Re-generate' : 'Generate'}</span>
            </button>

            {/* Download ZIP Action Button */}
            <button
              type="button"
              onClick={onDownload}
              disabled={!generatedProject || isDownloading || validationErrorsCount > 0}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm ${
                generatedProject && !isStale
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/60'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label="Download Generated Project as ZIP archive"
            >
              <Download
                className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`}
                aria-hidden="true"
              />
              <span>{isDownloading ? 'Packaging...' : 'Download ZIP'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5 pb-2 overflow-x-auto scrollbar-none">
          <nav className="flex items-center space-x-1" aria-label="Platform Sections">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Dashboard</span>
            </button>

            {/* Startup Builder */}
            <button
              type="button"
              onClick={() => setActiveTab('startup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'startup'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'startup' ? 'page' : undefined}
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Startup Builder</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                NEW
              </span>
            </button>

            {/* Database & ER Designer */}
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'database' ? 'page' : undefined}
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>ER Designer</span>
            </button>

            {/* Templates Gallery */}
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'templates' ? 'page' : undefined}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Templates</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                15
              </span>
            </button>

            <span className="w-px h-4 bg-slate-800 mx-1"></span>

            {/* Project Settings */}
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Settings</span>
            </button>

            {/* Entities & Fields */}
            <button
              type="button"
              onClick={() => setActiveTab('entities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'entities'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'entities' ? 'page' : undefined}
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Entities</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-300">
                {config.entities.length}
              </span>
            </button>

            {/* Security */}
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'security' ? 'page' : undefined}
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Security</span>
              <span
                className={`ml-1 w-2 h-2 rounded-full ${
                  config.security?.enabled ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
                title={config.security?.enabled ? 'Security Enabled' : 'Security Disabled'}
              />
            </button>

            {/* Source Preview */}
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'preview' ? 'page' : undefined}
            >
              <FolderArchive className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Code Preview</span>
              {generatedProject && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {generatedProject.files.length}
                </span>
              )}
            </button>

            <span className="w-px h-4 bg-slate-800 mx-1"></span>

            {/* Saved Projects */}
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'saved' ? 'page' : undefined}
            >
              <Save className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
              <span>Saved</span>
            </button>

            {/* Docs */}
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              aria-current={activeTab === 'docs' ? 'page' : undefined}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Docs</span>
            </button>
          </nav>

          {/* Quick Status indicators */}
          <div className="hidden xl:flex items-center space-x-3 text-xs text-slate-400 shrink-0 pl-3">
            <span className="flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span className="capitalize">{config.database}</span>
            </span>

            {isStale && generatedProject && (
              <span className="flex items-center space-x-1 text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
                <span>Modified</span>
              </span>
            )}

            {!isStale && generatedProject && (
              <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                <span>Ready ({generatedProject.files.length} files)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
