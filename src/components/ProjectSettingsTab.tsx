import React from 'react';
import { ProjectConfig, JavaVersion, SpringBootVersion, DatabaseType } from '../generator/types';
import { Database, Server, Cog, Check, HelpCircle } from 'lucide-react';

interface ProjectSettingsTabProps {
  config: ProjectConfig;
  onChange: (updated: Partial<ProjectConfig>) => void;
}

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({ config, onChange }) => {
  const handleAutoDerivePackage = () => {
    const cleanGroup = config.groupId.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    const cleanArtifact = config.artifactId.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const derived = `${cleanGroup}.${cleanArtifact}`.replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    onChange({ packageName: derived });
  };

  const handleOptionChange = (key: keyof NonNullable<ProjectConfig['options']>, value: any) => {
    onChange({
      options: {
        ...config.options,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Section 1: Project Coordinates */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80 mb-5">
          <Cog className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">Project Identity & Maven Coordinates</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project Name */}
          <div>
            <label
              htmlFor="project-name"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={config.projectName}
              onChange={(e) => onChange({ projectName: e.target.value })}
              aria-describedby="project-name-desc"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="e.g. ecommerce-backend"
            />
            <p id="project-name-desc" className="text-[11px] text-slate-400 mt-1">
              Alphanumeric name used for root directory and application classes.
            </p>
          </div>

          {/* Group ID */}
          <div>
            <label
              htmlFor="group-id"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Group ID <span className="text-rose-400">*</span>
            </label>
            <input
              id="group-id"
              type="text"
              value={config.groupId}
              onChange={(e) => onChange({ groupId: e.target.value })}
              aria-describedby="group-id-desc"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="e.g. com.example"
            />
            <p id="group-id-desc" className="text-[11px] text-slate-400 mt-1">
              Standard reverse-domain Maven groupId identifier.
            </p>
          </div>

          {/* Artifact ID */}
          <div>
            <label
              htmlFor="artifact-id"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Artifact ID <span className="text-rose-400">*</span>
            </label>
            <input
              id="artifact-id"
              type="text"
              value={config.artifactId}
              onChange={(e) => onChange({ artifactId: e.target.value })}
              aria-describedby="artifact-id-desc"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="e.g. ecommerce-api"
            />
            <p id="artifact-id-desc" className="text-[11px] text-slate-400 mt-1">
              Maven artifact name (pom.xml & build output jar name).
            </p>
          </div>

          {/* Package Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="package-name"
                className="block text-xs font-medium text-slate-300"
              >
                Package Name <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoDerivePackage}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline focus:outline-none"
              >
                Sync with Group & Artifact
              </button>
            </div>
            <input
              id="package-name"
              type="text"
              value={config.packageName}
              onChange={(e) => onChange({ packageName: e.target.value })}
              aria-describedby="package-name-desc"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="e.g. com.example.ecommerce"
            />
            <p id="package-name-desc" className="text-[11px] text-slate-400 mt-1">
              Java root package where all controllers, entities, and services reside.
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="project-desc"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Project Description
            </label>
            <input
              id="project-desc"
              type="text"
              value={config.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              aria-describedby="project-desc-desc"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="e.g. High-performance RESTful API backend with JPA persistence and Spring Security"
            />
            <p id="project-desc-desc" className="text-[11px] text-slate-400 mt-1">
              Exported to pom.xml & README.md project overview.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Runtime & Framework Versions */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80 mb-5">
          <Server className="w-5 h-5 text-indigo-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">Java & Spring Boot Versions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Java Version */}
          <div>
            <fieldset>
              <legend className="text-xs font-medium text-slate-300 mb-2.5">
                Java Runtime Version <span className="text-rose-400">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Java Version">
                {(['17', '21'] as JavaVersion[]).map((v) => {
                  const isSelected = config.javaVersion === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onChange({ javaVersion: v })}
                      className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-bold text-white">Java {v}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          LTS
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">
                        {v === '21' ? 'Virtual Threads, Records, Pattern Matching' : 'Standard Enterprise Baseline'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Spring Boot Version */}
          <div>
            <label
              htmlFor="springboot-version"
              className="block text-xs font-medium text-slate-300 mb-2.5"
            >
              Spring Boot 3.x Version <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['3.2.5', '3.3.0', '3.4.0'] as SpringBootVersion[]).map((sb) => {
                const isSelected = config.springBootVersion === sb;
                return (
                  <button
                    key={sb}
                    type="button"
                    onClick={() => onChange({ springBootVersion: sb })}
                    className={`p-3 rounded-lg border text-center transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-sm">{sb}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {sb === '3.4.0' ? 'Latest' : sb === '3.3.0' ? 'Recommended' : 'Stable'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              All versions include Spring Boot Starter Data JPA, Web, and Validation.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Database & Server Settings */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80 mb-5">
          <Database className="w-5 h-5 text-sky-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">Database & Application Runtime</h2>
        </div>

        <div className="space-y-6">
          {/* Database Selector */}
          <fieldset>
            <legend className="text-xs font-medium text-slate-300 mb-2.5">
              Target Relational Database <span className="text-rose-400">*</span>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Target Database">
              {[
                {
                  id: 'postgresql' as DatabaseType,
                  title: 'PostgreSQL',
                  badge: 'Recommended',
                  driver: 'org.postgresql.Driver',
                  port: 5432,
                  dialect: 'PostgreSQLDialect',
                  desc: 'Production RDBMS with JSONB, native UUID, sequence, and serial support.'
                },
                {
                  id: 'mysql' as DatabaseType,
                  title: 'MySQL',
                  badge: 'Standard',
                  driver: 'com.mysql.cj.jdbc.Driver',
                  port: 3306,
                  dialect: 'MySQLDialect',
                  desc: 'Widely deployed relational database with AUTO_INCREMENT and backtick identifiers.'
                },
                {
                  id: 'h2' as DatabaseType,
                  title: 'H2 (In-Memory)',
                  badge: 'Zero-Setup',
                  driver: 'org.h2.Driver',
                  port: 'Embedded',
                  dialect: 'H2Dialect',
                  desc: 'Zero-configuration in-memory database with embedded web console (/h2-console).'
                }
              ].map((db) => {
                const isSelected = config.database === db.id;
                return (
                  <button
                    key={db.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onChange({ database: db.id })}
                    className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <Database className="w-4 h-4 text-sky-400" aria-hidden="true" />
                        <span>{db.title}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                        {db.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex-1 leading-relaxed">
                      {db.desc}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 w-full text-[10px] font-mono text-slate-500 flex justify-between">
                      <span>Default port: {db.port}</span>
                      <span>JDBC</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Server Port & Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label
                htmlFor="server-port"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                HTTP Server Port
              </label>
              <input
                id="server-port"
                type="number"
                min={1024}
                max={65535}
                value={config.options?.serverPort ?? 8080}
                onChange={(e) => handleOptionChange('serverPort', parseInt(e.target.value, 10) || 8080)}
                aria-describedby="server-port-desc"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono"
              />
              <p id="server-port-desc" className="text-[11px] text-slate-400 mt-1">
                Configured as <code className="text-slate-300">server.port</code> in application.properties.
              </p>
            </div>

            {/* Architecture Options */}
            <div>
              <span className="block text-xs font-medium text-slate-300 mb-2">
                Layered Architecture Components
              </span>
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.options?.enableDtos ?? true}
                    onChange={(e) => handleOptionChange('enableDtos', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <span>Generate Request & Response DTOs and Mappers</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.options?.enableValidation ?? true}
                    onChange={(e) => handleOptionChange('enableValidation', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <span>Generate Jakarta Bean Validation (@NotNull, @Size, @Valid)</span>
                </label>

                <label className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.options?.enableGlobalExceptionHandler ?? true}
                    onChange={(e) => handleOptionChange('enableGlobalExceptionHandler', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                  />
                  <span>Generate Global Exception Handler (@ControllerAdvice)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
