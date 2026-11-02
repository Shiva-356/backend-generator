import React, { useState, useMemo } from 'react';
import { ProjectConfig, EntityConfig, DatabaseType } from '../generator/types';
import { generateSqlSchema } from '../generator/sqlGenerator';
import {
  Database,
  Key,
  Link2,
  Table as TableIcon,
  Copy,
  Check,
  Code2,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
  Info
} from 'lucide-react';

interface DatabaseDesignerTabProps {
  config: ProjectConfig;
  onNavigateToEntities: () => void;
  onSelectEntity?: (entityName: string) => void;
}

export const DatabaseDesignerTab: React.FC<DatabaseDesignerTabProps> = ({
  config,
  onNavigateToEntities,
  onSelectEntity
}) => {
  const [selectedDialect, setSelectedDialect] = useState<DatabaseType>(config.database);
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const previewConfig = useMemo(() => {
    return {
      ...config,
      database: selectedDialect
    };
  }, [config, selectedDialect]);

  const sqlCode = useMemo(() => {
    try {
      return generateSqlSchema(previewConfig);
    } catch {
      return '-- Error generating schema for current entity definitions';
    }
  }, [previewConfig]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const filteredEntities = useMemo(() => {
    if (!searchFilter.trim()) return config.entities;
    const q = searchFilter.toLowerCase();
    return config.entities.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        (e.tableName && e.tableName.toLowerCase().includes(q)) ||
        e.fields.some(f => f.name.toLowerCase().includes(q))
    );
  }, [config.entities, searchFilter]);

  const totalFields = useMemo(() => {
    return config.entities.reduce((acc, e) => acc + e.fields.length + 1, 0); // +1 for ID
  }, [config.entities]);

  const totalRelationships = useMemo(() => {
    return config.entities.reduce((acc, e) => acc + (e.relationships?.length || 0), 0);
  }, [config.entities]);

  const relationshipList = useMemo(() => {
    const list: Array<{
      source: string;
      target: string;
      type: string;
      name: string;
      owning: boolean;
      joinCol?: string;
    }> = [];
    for (const e of config.entities) {
      if (e.relationships) {
        for (const r of e.relationships) {
          list.push({
            source: e.name,
            target: r.targetEntity,
            type: r.type,
            name: r.name,
            owning: r.isOwningSide ?? r.type !== 'ONE_TO_MANY',
            joinCol: r.joinColumnName
          });
        }
      }
    }
    return list;
  }, [config.entities]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Visual Database & ER Designer
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Relational Engine
                </span>
              </h2>
              <p className="text-sm text-slate-400">
                Inspect relational tables, primary & foreign keys, cardinality mappings, and live DDL SQL generation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onNavigateToEntities}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
          >
            Edit Entities & Fields
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tables / Entities</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-indigo-400" />
            {config.entities.length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Columns</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            {totalFields}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Relationships</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            {totalRelationships}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Dialect</div>
          <div className="text-2xl font-bold text-white mt-1 uppercase flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            {config.database}
          </div>
        </div>
      </div>

      {/* Visual ER Diagram Entity Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-indigo-400" />
            Entity Relationship Schema ({filteredEntities.length})
          </h3>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter entities or fields..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntities.map(entity => {
            const tableName = entity.tableName || entity.name.toLowerCase() + 's';
            const idType = entity.idType || 'Long';
            const idField = entity.idFieldName || 'id';

            return (
              <div
                key={entity.name}
                className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition flex flex-col"
              >
                {/* Table Header */}
                <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TableIcon className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white text-sm">{entity.name}</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {tableName}
                  </span>
                </div>

                {/* Columns List */}
                <div className="p-4 space-y-2 flex-1">
                  {/* Primary Key Row */}
                  <div className="flex items-center justify-between py-1 px-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs">
                    <div className="flex items-center space-x-2 text-indigo-300 font-mono font-medium">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{idField}</span>
                      <span className="text-[10px] px-1 py-0.2 bg-indigo-500/20 rounded text-indigo-200">PK</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{idType}</span>
                  </div>

                  {/* Field Rows */}
                  {entity.fields.map(field => (
                    <div
                      key={field.name}
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-slate-800/50 text-xs border border-transparent hover:border-slate-800 transition"
                    >
                      <div className="flex items-center space-x-2 font-mono text-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        <span>{field.name}</span>
                        {field.required && (
                          <span className="text-[9px] px-1 bg-rose-500/10 text-rose-300 rounded border border-rose-500/20">
                            REQ
                          </span>
                        )}
                        {field.unique && (
                          <span className="text-[9px] px-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                            UNQ
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {field.type}
                        {field.length ? `(${field.length})` : ''}
                      </span>
                    </div>
                  ))}

                  {/* Relationships Section */}
                  {entity.relationships && entity.relationships.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Foreign Keys & Associations
                      </div>
                      {entity.relationships.map(rel => (
                        <div
                          key={rel.name}
                          className="flex items-center justify-between py-1 px-2 rounded bg-cyan-950/30 border border-cyan-800/30 text-xs"
                        >
                          <div className="flex items-center space-x-1.5 text-cyan-300">
                            <Link2 className="w-3 h-3 text-cyan-400" />
                            <span className="font-mono text-[11px]">{rel.name}</span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            <span className="font-bold text-[11px] text-white">{rel.targetEntity}</span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-200">
                            {rel.type === 'ONE_TO_MANY'
                              ? '1:N'
                              : rel.type === 'MANY_TO_ONE'
                              ? 'N:1'
                              : rel.type === 'ONE_TO_ONE'
                              ? '1:1'
                              : 'N:M'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relationships Matrix Table */}
      {relationshipList.length > 0 && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4 text-cyan-400" />
              Relational Linkages & Cardinality Matrix
            </h3>
            <span className="text-xs text-slate-400">{relationshipList.length} defined links</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Source Entity</th>
                  <th className="px-4 py-3">Relation Field</th>
                  <th className="px-4 py-3">Cardinality</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {relationshipList.map((rel, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-2.5 font-bold text-white">{rel.source}</td>
                    <td className="px-4 py-2.5 text-cyan-300">{rel.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {rel.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-white">{rel.target}</td>
                    <td className="px-4 py-2.5">
                      {rel.owning ? (
                        <span className="text-emerald-400">Owning (Foreign Key)</span>
                      ) : (
                        <span className="text-slate-400">Mapped Inverse</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live DDL SQL Schema Preview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-white text-sm">Automated SQL Schema Preview</h3>
              <p className="text-xs text-slate-400">
                Deterministic DDL generated live for your database driver.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dialect Tabs */}
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(['postgresql', 'mysql', 'h2'] as DatabaseType[]).map(dialect => (
                <button
                  key={dialect}
                  type="button"
                  onClick={() => setSelectedDialect(dialect)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    selectedDialect === dialect
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dialect.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-96 p-4 rounded-lg bg-slate-900/60 border border-slate-800 leading-relaxed">
            {sqlCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
