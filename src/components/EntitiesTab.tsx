import React, { useState } from 'react';
import {
  ProjectConfig,
  EntityConfig,
  FieldConfig,
  RelationshipConfig,
  FieldDataType,
  IdType,
  IdGenerationStrategy,
  RelationshipType
} from '../generator/types';
import {
  Layers,
  Plus,
  Trash2,
  Key,
  Database,
  ArrowRightLeft,
  AlertCircle,
  Copy,
  ChevronRight
} from 'lucide-react';

interface EntitiesTabProps {
  config: ProjectConfig;
  onChange: (updatedEntities: EntityConfig[]) => void;
}

const SUPPORTED_FIELD_TYPES: { type: FieldDataType; label: string; desc: string }[] = [
  { type: 'String', label: 'String', desc: 'Text / VARCHAR' },
  { type: 'Integer', label: 'Integer', desc: '32-bit signed integer' },
  { type: 'Long', label: 'Long', desc: '64-bit integer / BIGINT' },
  { type: 'Double', label: 'Double', desc: 'Floating point number' },
  { type: 'BigDecimal', label: 'BigDecimal', desc: 'Exact precision monetary values' },
  { type: 'Boolean', label: 'Boolean', desc: 'True/False flag' },
  { type: 'LocalDate', label: 'LocalDate', desc: 'Calendar date (YYYY-MM-DD)' },
  { type: 'LocalDateTime', label: 'LocalDateTime', desc: 'Date and time (timestamp)' }
];

export const EntitiesTab: React.FC<EntitiesTabProps> = ({ config, onChange }) => {
  const [selectedEntityIndex, setSelectedEntityIndex] = useState<number>(0);
  const entities = config.entities || [];
  const activeEntity = entities[selectedEntityIndex] || entities[0];

  const updateActiveEntity = (partial: Partial<EntityConfig>) => {
    if (!activeEntity) return;
    const next = [...entities];
    next[selectedEntityIndex] = {
      ...activeEntity,
      ...partial
    };
    onChange(next);
  };

  const handleAddEntity = () => {
    let baseName = 'NewEntity';
    let counter = 1;
    while (entities.some((e) => e.name.toLowerCase() === baseName.toLowerCase())) {
      counter++;
      baseName = `NewEntity${counter}`;
    }

    const newEntity: EntityConfig = {
      name: baseName,
      tableName: baseName.toLowerCase() + 's',
      idType: 'Long',
      idGeneration: 'IDENTITY',
      idFieldName: 'id',
      fields: [
        { name: 'name', type: 'String', required: true, length: 100 }
      ],
      relationships: []
    };

    const next = [...entities, newEntity];
    onChange(next);
    setSelectedEntityIndex(next.length - 1);
  };

  const handleRemoveEntity = (index: number) => {
    if (entities.length <= 1) {
      alert('At least one entity is required for project generation.');
      return;
    }
    const next = entities.filter((_, i) => i !== index);
    onChange(next);
    setSelectedEntityIndex(Math.max(0, index - 1));
  };

  const handleAddField = () => {
    if (!activeEntity) return;
    let fieldBase = 'field';
    let counter = 1;
    while (activeEntity.fields.some((f) => f.name.toLowerCase() === `${fieldBase}${counter}`)) {
      counter++;
    }

    const newField: FieldConfig = {
      name: `${fieldBase}${counter}`,
      type: 'String',
      required: false,
      length: 100
    };

    updateActiveEntity({
      fields: [...activeEntity.fields, newField]
    });
  };

  const handleUpdateField = (fieldIndex: number, partial: Partial<FieldConfig>) => {
    if (!activeEntity) return;
    const updatedFields = [...activeEntity.fields];
    updatedFields[fieldIndex] = {
      ...updatedFields[fieldIndex],
      ...partial
    };
    updateActiveEntity({ fields: updatedFields });
  };

  const handleRemoveField = (fieldIndex: number) => {
    if (!activeEntity) return;
    const updatedFields = activeEntity.fields.filter((_, i) => i !== fieldIndex);
    updateActiveEntity({ fields: updatedFields });
  };

  const handleAddRelationship = () => {
    if (!activeEntity) return;
    const availableTargets = entities.filter((e) => e.name !== activeEntity.name);
    const target = availableTargets[0]?.name || activeEntity.name;

    const newRel: RelationshipConfig = {
      name: target.charAt(0).toLowerCase() + target.slice(1),
      type: 'MANY_TO_ONE',
      targetEntity: target,
      isOwningSide: true,
      joinColumnName: `${target.toLowerCase()}_id`
    };

    updateActiveEntity({
      relationships: [...(activeEntity.relationships || []), newRel]
    });
  };

  const handleUpdateRelationship = (relIndex: number, partial: Partial<RelationshipConfig>) => {
    if (!activeEntity || !activeEntity.relationships) return;
    const updatedRels = [...activeEntity.relationships];
    updatedRels[relIndex] = {
      ...updatedRels[relIndex],
      ...partial
    };
    updateActiveEntity({ relationships: updatedRels });
  };

  const handleRemoveRelationship = (relIndex: number) => {
    if (!activeEntity || !activeEntity.relationships) return;
    const updatedRels = activeEntity.relationships.filter((_, i) => i !== relIndex);
    updateActiveEntity({ relationships: updatedRels });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar / Entity List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-white">Entities ({entities.length})</h2>
            </div>
            <button
              type="button"
              onClick={handleAddEntity}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-sm"
              aria-label="Add new entity"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          <nav className="space-y-1" aria-label="Project Entities">
            {entities.map((entity, idx) => {
              const isSelected = idx === selectedEntityIndex;
              const relCount = entity.relationships?.length || 0;
              return (
                <button
                  key={entity.name + idx}
                  type="button"
                  onClick={() => setSelectedEntityIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition ${
                    isSelected
                      ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono font-semibold">{entity.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0 text-[10px]">
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/80">
                      {entity.fields.length}f
                    </span>
                    {relCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-500/30">
                        {relCount}r
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Details Panel for Active Entity */}
      {activeEntity ? (
        <div className="lg:col-span-3 space-y-6">
          {/* Entity Top Header & Primary Key Settings */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Entity Configuration
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-base font-bold text-white font-mono">{activeEntity.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveEntity(selectedEntityIndex)}
                disabled={entities.length <= 1}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={`Delete entity ${activeEntity.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete Entity</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Entity Name */}
              <div>
                <label
                  htmlFor="entity-name"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Class Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="entity-name"
                  type="text"
                  value={activeEntity.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateActiveEntity({
                      name: val,
                      tableName: activeEntity.tableName || val.toLowerCase() + 's'
                    });
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="e.g. CustomerOrder"
                />
              </div>

              {/* Table Name */}
              <div>
                <label
                  htmlFor="entity-table-name"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  SQL Table Name
                </label>
                <input
                  id="entity-table-name"
                  type="text"
                  value={activeEntity.tableName || ''}
                  onChange={(e) => updateActiveEntity({ tableName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="e.g. customer_orders"
                />
              </div>

              {/* Primary Key Type */}
              <div>
                <label
                  htmlFor="entity-id-type"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Primary Key Type
                </label>
                <select
                  id="entity-id-type"
                  value={activeEntity.idType || 'Long'}
                  onChange={(e) => updateActiveEntity({ idType: e.target.value as IdType })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-mono"
                >
                  <option value="Long">Long (BIGINT)</option>
                  <option value="Integer">Integer (INT)</option>
                  <option value="UUID">UUID</option>
                  <option value="String">String (VARCHAR)</option>
                </select>
              </div>

              {/* Primary Key Strategy */}
              <div>
                <label
                  htmlFor="entity-id-strategy"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Generation Strategy
                </label>
                <select
                  id="entity-id-strategy"
                  value={activeEntity.idGeneration || 'IDENTITY'}
                  onChange={(e) =>
                    updateActiveEntity({ idGeneration: e.target.value as IdGenerationStrategy })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-mono"
                >
                  <option value="IDENTITY">IDENTITY (Auto-increment)</option>
                  <option value="AUTO">AUTO (Hibernate default)</option>
                  <option value="SEQUENCE">SEQUENCE</option>
                  <option value="UUID">UUID (Random GUID)</option>
                  <option value="NONE">NONE (Manually assigned)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Fields Editor */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">
                  Fields ({activeEntity.fields.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium transition"
                aria-label={`Add field to ${activeEntity.name}`}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Field</span>
              </button>
            </div>

            {activeEntity.fields.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No custom fields defined yet. Click "Add Field" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-2 px-3">Field Name</th>
                      <th scope="col" className="py-2 px-3">Type</th>
                      <th scope="col" className="py-2 px-2 text-center">Required</th>
                      <th scope="col" className="py-2 px-2 text-center">Unique</th>
                      <th scope="col" className="py-2 px-3">Constraints & Modifiers</th>
                      <th scope="col" className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeEntity.fields.map((field, fIdx) => (
                      <tr key={fIdx} className="hover:bg-slate-800/30">
                        {/* Name */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleUpdateField(fIdx, { name: e.target.value })}
                            aria-label={`Field ${fIdx + 1} Name`}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            placeholder="fieldName"
                          />
                        </td>

                        {/* Type */}
                        <td className="py-2.5 px-3">
                          <select
                            value={field.type}
                            onChange={(e) =>
                              handleUpdateField(fIdx, { type: e.target.value as FieldDataType })
                            }
                            aria-label={`Field ${field.name || fIdx + 1} Type`}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          >
                            {SUPPORTED_FIELD_TYPES.map((t) => (
                              <option key={t.type} value={t.type}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Required */}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!field.required}
                            onChange={(e) => handleUpdateField(fIdx, { required: e.target.checked })}
                            aria-label={`Field ${field.name} Required`}
                            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                          />
                        </td>

                        {/* Unique */}
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!field.unique}
                            onChange={(e) => handleUpdateField(fIdx, { unique: e.target.checked })}
                            aria-label={`Field ${field.name} Unique`}
                            className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                          />
                        </td>

                        {/* Type-Specific Modifiers */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2">
                            {field.type === 'String' && (
                              <div className="flex items-center space-x-1">
                                <label
                                  htmlFor={`f-len-${fIdx}`}
                                  className="text-[10px] text-slate-500"
                                >
                                  Len:
                                </label>
                                <input
                                  id={`f-len-${fIdx}`}
                                  type="number"
                                  min={1}
                                  max={10000}
                                  value={field.length ?? 255}
                                  onChange={(e) =>
                                    handleUpdateField(fIdx, {
                                      length: parseInt(e.target.value, 10) || 255
                                    })
                                  }
                                  className="w-16 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                />
                              </div>
                            )}

                            {field.type === 'BigDecimal' && (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <label
                                    htmlFor={`f-prec-${fIdx}`}
                                    className="text-[10px] text-slate-500"
                                  >
                                    Prec:
                                  </label>
                                  <input
                                    id={`f-prec-${fIdx}`}
                                    type="number"
                                    min={1}
                                    max={65}
                                    value={field.precision ?? 10}
                                    onChange={(e) =>
                                      handleUpdateField(fIdx, {
                                        precision: parseInt(e.target.value, 10) || 10
                                      })
                                    }
                                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <label
                                    htmlFor={`f-scale-${fIdx}`}
                                    className="text-[10px] text-slate-500"
                                  >
                                    Scale:
                                  </label>
                                  <input
                                    id={`f-scale-${fIdx}`}
                                    type="number"
                                    min={0}
                                    max={30}
                                    value={field.scale ?? 2}
                                    onChange={(e) =>
                                      handleUpdateField(fIdx, {
                                        scale: parseInt(e.target.value, 10) || 2
                                      })
                                    }
                                    className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                  />
                                </div>
                              </div>
                            )}

                            {(field.type === 'Integer' || field.type === 'Long' || field.type === 'Double') && (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <label
                                    htmlFor={`f-min-${fIdx}`}
                                    className="text-[10px] text-slate-500"
                                  >
                                    Min:
                                  </label>
                                  <input
                                    id={`f-min-${fIdx}`}
                                    type="number"
                                    value={field.min ?? ''}
                                    onChange={(e) =>
                                      handleUpdateField(fIdx, {
                                        min: e.target.value !== '' ? Number(e.target.value) : undefined
                                      })
                                    }
                                    className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                  />
                                </div>
                                <div className="flex items-center space-x-1">
                                  <label
                                    htmlFor={`f-max-${fIdx}`}
                                    className="text-[10px] text-slate-500"
                                  >
                                    Max:
                                  </label>
                                  <input
                                    id={`f-max-${fIdx}`}
                                    type="number"
                                    value={field.max ?? ''}
                                    onChange={(e) =>
                                      handleUpdateField(fIdx, {
                                        max: e.target.value !== '' ? Number(e.target.value) : undefined
                                      })
                                    }
                                    className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                                  />
                                </div>
                              </div>
                            )}

                            {field.type === 'Boolean' && (
                              <span className="text-[11px] text-slate-500 italic">
                                true / false column
                              </span>
                            )}

                            {(field.type === 'LocalDate' || field.type === 'LocalDateTime') && (
                              <span className="text-[11px] text-slate-500 italic">
                                Temporal ISO-8601
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveField(fIdx)}
                            className="text-slate-500 hover:text-rose-400 transition p-1"
                            aria-label={`Remove field ${field.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Relationships Editor */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">
                  JPA Entity Relationships ({activeEntity.relationships?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddRelationship}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 text-xs font-medium transition"
                aria-label={`Add relationship to ${activeEntity.name}`}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Relationship</span>
              </button>
            </div>

            {(!activeEntity.relationships || activeEntity.relationships.length === 0) ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No relationships configured for this entity. Click "Add Relationship" to link to other entities.
              </div>
            ) : (
              <div className="space-y-3">
                {activeEntity.relationships.map((rel, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Relationship Name */}
                      <div>
                        <label
                          htmlFor={`rel-name-${rIdx}`}
                          className="block text-[11px] font-medium text-slate-400 mb-1"
                        >
                          Property Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id={`rel-name-${rIdx}`}
                          type="text"
                          value={rel.name}
                          onChange={(e) => handleUpdateRelationship(rIdx, { name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          placeholder="e.g. category"
                        />
                      </div>

                      {/* Relationship Type */}
                      <div>
                        <label
                          htmlFor={`rel-type-${rIdx}`}
                          className="block text-[11px] font-medium text-slate-400 mb-1"
                        >
                          Relationship Type <span className="text-rose-400">*</span>
                        </label>
                        <select
                          id={`rel-type-${rIdx}`}
                          value={rel.type}
                          onChange={(e) => {
                            const newType = e.target.value as RelationshipType;
                            const isOwning = newType === 'MANY_TO_ONE' || newType === 'MANY_TO_MANY';
                            handleUpdateRelationship(rIdx, {
                              type: newType,
                              isOwningSide: isOwning,
                              mappedBy: isOwning ? undefined : activeEntity.name.toLowerCase()
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono cursor-pointer"
                        >
                          <option value="MANY_TO_ONE">MANY_TO_ONE (N:1)</option>
                          <option value="ONE_TO_MANY">ONE_TO_MANY (1:N)</option>
                          <option value="ONE_TO_ONE">ONE_TO_ONE (1:1)</option>
                          <option value="MANY_TO_MANY">MANY_TO_MANY (M:N)</option>
                        </select>
                      </div>

                      {/* Target Entity */}
                      <div>
                        <label
                          htmlFor={`rel-target-${rIdx}`}
                          className="block text-[11px] font-medium text-slate-400 mb-1"
                        >
                          Target Entity <span className="text-rose-400">*</span>
                        </label>
                        <select
                          id={`rel-target-${rIdx}`}
                          value={rel.targetEntity}
                          onChange={(e) =>
                            handleUpdateRelationship(rIdx, { targetEntity: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono cursor-pointer"
                        >
                          {entities.map((e) => (
                            <option key={e.name} value={e.name}>
                              {e.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Remove Button */}
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveRelationship(rIdx)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 pb-1"
                          aria-label={`Remove relationship ${rel.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Mapping Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60 text-xs">
                      {/* Owning Side vs Inverse */}
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          id={`rel-owning-${rIdx}`}
                          type="checkbox"
                          checked={rel.isOwningSide ?? (rel.type === 'MANY_TO_ONE')}
                          onChange={(e) =>
                            handleUpdateRelationship(rIdx, { isOwningSide: e.target.checked })
                          }
                          className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500/50"
                        />
                        <label
                          htmlFor={`rel-owning-${rIdx}`}
                          className="text-[11px] text-slate-300 cursor-pointer"
                        >
                          Owning Side (manages foreign key)
                        </label>
                      </div>

                      {/* mappedBy (if inverse) */}
                      {!rel.isOwningSide && (
                        <div>
                          <label
                            htmlFor={`rel-mappedby-${rIdx}`}
                            className="block text-[10px] text-slate-400 mb-0.5"
                          >
                            mappedBy Property
                          </label>
                          <input
                            id={`rel-mappedby-${rIdx}`}
                            type="text"
                            value={rel.mappedBy || ''}
                            onChange={(e) =>
                              handleUpdateRelationship(rIdx, { mappedBy: e.target.value })
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            placeholder="e.g. order"
                          />
                        </div>
                      )}

                      {/* joinColumnName (if owning) */}
                      {rel.isOwningSide && (
                        <div>
                          <label
                            htmlFor={`rel-joincol-${rIdx}`}
                            className="block text-[10px] text-slate-400 mb-0.5"
                          >
                            Join Column Name
                          </label>
                          <input
                            id={`rel-joincol-${rIdx}`}
                            type="text"
                            value={rel.joinColumnName || ''}
                            onChange={(e) =>
                              handleUpdateRelationship(rIdx, { joinColumnName: e.target.value })
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                            placeholder={`e.g. ${rel.targetEntity.toLowerCase()}_id`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
};
