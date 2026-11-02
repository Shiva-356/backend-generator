import React from 'react';
import { ProjectConfig } from '../generator/types';
import {
  Rocket,
  Database,
  Layers,
  Sparkles,
  Download,
  Shield,
  FileCode,
  ArrowRight,
  Code2,
  CheckCircle2,
  BookOpen,
  FolderArchive
} from 'lucide-react';
import { DOMAIN_TEMPLATES } from '../generator/templates/domainTemplates';

interface DashboardTabProps {
  config: ProjectConfig;
  onNavigateTab: (tab: any) => void;
  onLoadTemplate: (templateKey: string) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  config,
  onNavigateTab,
  onLoadTemplate,
  onDownload,
  isDownloading
}) => {
  const featuredTemplates = [
    DOMAIN_TEMPLATES.FINTECH_BANKING,
    DOMAIN_TEMPLATES.HEALTHTECH_EHR,
    DOMAIN_TEMPLATES.PROPTECH_REALESTATE,
    DOMAIN_TEMPLATES.LOGISTICS_SUPPLY_CHAIN
  ];

  return (
    <div className="space-y-10">
      {/* Hero Platform Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-8 sm:p-10 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer SaaS Platform</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Build & Export Production Spring Boot 3 Backends in Seconds
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Generate clean, production-ready Java 17/21 backends with Spring Boot 3, JPA/Hibernate entities,
            relational database schemas, DTOs, mappers, services, REST controllers, Spring Security 6 with JWT,
            interactive Swagger UI, and Postman collections.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('startup')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Startup Builder</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('database')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm border border-slate-700 flex items-center space-x-2 transition"
            >
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Visual ER Designer</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('templates')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm border border-slate-700 flex items-center space-x-2 transition"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>15 Domain Templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain Templates</div>
          <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            15 Full Domains
          </div>
          <div className="text-[11px] text-slate-500 mt-1">FinTech, HealthTech, PropTech, Logistics, SaaS</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry Presets</div>
          <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-emerald-400" />
            10 Industries
          </div>
          <div className="text-[11px] text-slate-500 mt-1">B2B SaaS, Marketplaces, On-Demand, Internal</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relational Drivers</div>
          <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            3 Databases
          </div>
          <div className="text-[11px] text-slate-500 mt-1">PostgreSQL, MySQL, H2 In-Memory</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Architecture</div>
          <div className="text-3xl font-black text-white mt-2 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Spring Sec 6
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stateless JWT, BCrypt, RBAC, Auth Tests</div>
        </div>
      </div>

      {/* Current Active Project Quick Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Active Workspace:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{config.projectName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              {config.database.toUpperCase()}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Java {config.javaVersion}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
              Boot {config.springBootVersion}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {config.entities.length} Entities ({config.entities.reduce((a, b) => a + b.fields.length, 0)} fields)
            </span>
            {config.security?.enabled && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                JWT Enabled
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onNavigateTab('preview')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 transition"
          >
            Inspect Code
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Building ZIP...' : 'Download ZIP Package'}</span>
          </button>
        </div>
      </div>

      {/* Recommended Real-World Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Popular Real-World Backend Blueprints
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('templates')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <span>View All 15 Templates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTemplates.map(tmpl => (
            <div
              key={tmpl.key}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{tmpl.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    {tmpl.defaultEntities.length} Ent
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onLoadTemplate(tmpl.key)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <span>Load Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
