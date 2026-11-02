import React, { useState, useMemo } from 'react';
import { GeneratedProject, GeneratedFile } from '../generator/types';
import {
  FileCode,
  FileText,
  Database,
  Shield,
  Copy,
  Check,
  Download,
  FolderArchive,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PreviewTabProps {
  generatedProject: GeneratedProject | null;
  onGenerate: () => void;
  onDownloadZip: () => void;
  isGenerating: boolean;
  isDownloading: boolean;
  isStale: boolean;
}

type FileCategory = 'all' | 'java' | 'resources' | 'security' | 'build';

export const PreviewTab: React.FC<PreviewTabProps> = ({
  generatedProject,
  onGenerate,
  onDownloadZip,
  isGenerating,
  isDownloading,
  isStale
}) => {
  const [selectedPath, setSelectedPath] = useState<string>('pom.xml');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const files = generatedProject?.files || [];

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Category filter
      if (categoryFilter === 'java') {
        if (!file.path.endsWith('.java') || file.path.includes('/security/')) return false;
      } else if (categoryFilter === 'resources') {
        if (!file.path.startsWith('src/main/resources/')) return false;
      } else if (categoryFilter === 'security') {
        if (!file.path.includes('/security/')) return false;
      } else if (categoryFilter === 'build') {
        if (file.path.endsWith('.java') || file.path.startsWith('src/main/resources/')) return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        return file.path.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });
  }, [files, categoryFilter, searchQuery]);

  const activeFile: GeneratedFile | undefined = useMemo(() => {
    return (
      files.find((f) => f.path === selectedPath) ||
      filteredFiles[0] ||
      files[0]
    );
  }, [files, selectedPath, filteredFiles]);

  const handleCopyCode = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const handleDownloadSingleFile = () => {
    if (!activeFile || typeof window === 'undefined') return;
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.path.split('/').pop() || 'file.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (!generatedProject) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-sm">
          <FolderArchive className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Ready to Synthesize Your Spring Boot Project
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Click below to validate your domain configuration and generate production-ready Spring Boot 3.x
          Java sources, Maven build specifications, JPA entities, and database migration scripts.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isGenerating ? 'Synthesizing Project Files...' : 'Generate Spring Boot Project'}</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary } = generatedProject;
  const lineCount = activeFile ? activeFile.content.split('\n').length : 0;

  return (
    <div className="space-y-6">
      {/* Top Project Summary Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-white font-mono font-semibold border border-slate-700">
            {summary.projectName}
          </span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
            Boot {summary.springBootVersion}
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            Java {summary.javaVersion}
          </span>
          <span className="px-2 py-1 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-medium capitalize">
            {summary.database}
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {summary.entityCount} {summary.entityCount === 1 ? 'Entity' : 'Entities'}
          </span>
          {summary.securityEnabled && (
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium flex items-center space-x-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              <span>Spring Security & JWT</span>
            </span>
          )}
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-500/40">
            {summary.fileCount} Files Generated
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isStale && (
            <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Settings changed</span>
              <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                className="underline hover:text-amber-300 ml-1"
              >
                Re-generate
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm disabled:opacity-50"
            aria-label="Download Complete Project ZIP"
          >
            <Download
              className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`}
              aria-hidden="true"
            />
            <span>{isDownloading ? 'Packaging ZIP...' : `Download ${summary.projectName}.zip`}</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer & Code Viewer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* File Explorer (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {/* Explorer Header & Category Filters */}
          <div className="p-3 border-b border-slate-800/80 space-y-2.5">
            <div className="relative">
              <label htmlFor="file-search-input" className="sr-only">
                Search generated files
              </label>
              <Search
                className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5"
                aria-hidden="true"
              />
              <input
                id="file-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search generated files..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1" role="toolbar" aria-label="File Category Filters">
              {[
                { id: 'all' as FileCategory, label: 'All' },
                { id: 'java' as FileCategory, label: 'Java Sources' },
                { id: 'resources' as FileCategory, label: 'Resources' },
                { id: 'security' as FileCategory, label: 'Security' },
                { id: 'build' as FileCategory, label: 'Build & Config' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                    categoryFilter === cat.id
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Tree List */}
          <div
            className="flex-1 overflow-y-auto p-2 space-y-0.5 divide-y divide-slate-800/20 max-h-[540px]"
            role="navigation"
            aria-label="Generated File Tree"
          >
            {filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No matching files found.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = activeFile?.path === file.path;
                const filename = file.path.split('/').pop() || file.path;
                const dir = file.path.substring(0, file.path.lastIndexOf('/'));
                const isJava = file.path.endsWith('.java');
                const isProperties = file.path.endsWith('.properties');
                const isSql = file.path.endsWith('.sql');
                const isXml = file.path.endsWith('.xml');

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`w-full flex items-start space-x-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition ${
                      isSelected
                        ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                    }`}
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isJava ? (
                        <FileCode className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                      ) : isSql ? (
                        <Database className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="truncate flex-1">
                      <div className="font-mono text-xs font-medium text-slate-200 truncate">
                        {filename}
                      </div>
                      {dir && (
                        <div className="font-mono text-[10px] text-slate-500 truncate">
                          {dir}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {activeFile ? (
            <>
              {/* Viewer Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="font-mono text-xs text-emerald-400 font-semibold truncate">
                    {activeFile.path}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {lineCount} lines ({new Blob([activeFile.content]).size} B)
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
                    aria-label="Copy file content to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSingleFile}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700"
                    aria-label="Download single file"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Monospace Code Display with Line Numbers */}
              <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed max-h-[550px]">
                <table className="w-full border-collapse">
                  <tbody>
                    {activeFile.content.split('\n').map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="text-slate-600 select-none text-right pr-4 align-top w-12 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="text-slate-200 whitespace-pre font-mono text-xs pl-2">
                          {line || ' '}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-500">
              Select a file from the explorer to preview source code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
