import React, { useState, useMemo } from 'react';
import { DomainTemplate } from '../generator/types';
import { DOMAIN_TEMPLATES } from '../generator/templates/domainTemplates';
import {
  Layers,
  Search,
  CheckCircle2,
  Table,
  Shield,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code2
} from 'lucide-react';

interface TemplatesTabProps {
  onLoadTemplate: (templateKey: string) => void;
  activeTemplateKey?: string;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  onLoadTemplate,
  activeTemplateKey
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Domains (15)' },
    { id: 'FINTECH', label: 'FinTech & Payments' },
    { id: 'HEALTH', label: 'Healthcare & EHR' },
    { id: 'COMMERCE', label: 'Commerce & Food' },
    { id: 'SAAS', label: 'SaaS & Productivity' },
    { id: 'OPERATIONS', label: 'Logistics & HR' },
    { id: 'SOCIAL', label: 'Social & Media' }
  ];

  const templateList = useMemo(() => {
    return Object.values(DOMAIN_TEMPLATES);
  }, []);

  const filteredTemplates = useMemo(() => {
    return templateList.filter(tmpl => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tmpl.name.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        tmpl.modules.some(m => m.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'FINTECH') {
        return tmpl.key.includes('FINTECH') || tmpl.key.includes('PAYMENT');
      }
      if (selectedCategory === 'HEALTH') {
        return tmpl.key.includes('HEALTH');
      }
      if (selectedCategory === 'COMMERCE') {
        return (
          tmpl.key.includes('ECOMMERCE') ||
          tmpl.key.includes('FOOD') ||
          tmpl.key.includes('PROPTECH') ||
          tmpl.key.includes('BOOKING')
        );
      }
      if (selectedCategory === 'SAAS') {
        return tmpl.key.includes('PROJECT') || tmpl.key.includes('CRM') || tmpl.key.includes('EDUCATION');
      }
      if (selectedCategory === 'OPERATIONS') {
        return tmpl.key.includes('LOGISTICS') || tmpl.key.includes('HRTECH');
      }
      if (selectedCategory === 'SOCIAL') {
        return tmpl.key.includes('SOCIAL') || tmpl.key.includes('STREAMING');
      }
      return true;
    });
  }, [templateList, search, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Production Domain Templates Gallery
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  15 Full Domains
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Instantly initialize your backend with real-world schemas, relational foreign keys, JPA repositories, and REST APIs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search templates, entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(tmpl => {
          const isActive = activeTemplateKey === tmpl.key;

          return (
            <div
              key={tmpl.key}
              className={`rounded-2xl border transition flex flex-col justify-between overflow-hidden shadow-lg ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-500 ring-1 ring-cyan-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">{tmpl.name}</h3>
                    <span className="font-mono text-[10px] text-slate-500">{tmpl.key}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                    {tmpl.defaultEntities.length} Entities
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                  {tmpl.description}
                </p>

                {/* Modules Chips */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Core Entities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.modules.map(mod => (
                      <span
                        key={mod}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-750 font-mono"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Security Rules */}
                <div className="space-y-1 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Security Framework
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tmpl.securityRules.join(' • ')}
                  </div>
                </div>
              </div>

              {/* Card Footer with Load Button */}
              <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Table className="w-3 h-3 text-slate-500" />
                  {tmpl.databaseTables.length} SQL Tables
                </span>

                <button
                  type="button"
                  onClick={() => onLoadTemplate(tmpl.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  <span>{isActive ? 'Current Config' : 'Load Template'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
