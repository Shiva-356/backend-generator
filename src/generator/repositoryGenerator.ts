/**
 * Generator for Spring Data JPA Repository interfaces.
 * Emits type-safe query methods based on unique fields, foreign keys, and multi-field domain lookups.
 */

import { EntityConfig, ProjectConfig, RelationshipConfig } from './types';
import { capitalize } from './entityGenerator';

export function generateRepositoryInterface(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName, entities } = config;
  const entityName = entity.name.trim();
  const idType = entity.idType || 'Long';

  const imports = new Set<string>([
    `${packageName}.entity.${entityName}`,
    'org.springframework.data.jpa.repository.JpaRepository',
    'org.springframework.stereotype.Repository'
  ]);

  if (idType === 'UUID') {
    imports.add('java.util.UUID');
  }

  const finders: string[] = [];
  const uniqueFields = entity.fields.filter(f => f.unique);

  if (uniqueFields.length > 0) {
    imports.add('java.util.Optional');
    uniqueFields.forEach(field => {
      if (field.type === 'BigDecimal') imports.add('java.math.BigDecimal');
      if (field.type === 'LocalDate') imports.add('java.time.LocalDate');
      finders.push(`    Optional<${entityName}> findBy${capitalize(field.name)}(${field.type} ${field.name});`);
    });
  }

  // Helper to find target entity ID type
  const getTargetIdType = (targetName: string): string => {
    const target = entities.find(e => e.name === targetName);
    return target?.idType || 'Long';
  };

  const manyToOnes = (entity.relationships || []).filter(r => r.type === 'MANY_TO_ONE');
  const oneToOnes = (entity.relationships || []).filter(r => r.type === 'ONE_TO_ONE');

  if (manyToOnes.length > 0 || oneToOnes.length > 0) {
    imports.add('java.util.List');
    imports.add('java.util.Optional');

    // Single relationship finders
    manyToOnes.forEach(rel => {
      const targetIdType = getTargetIdType(rel.targetEntity);
      if (targetIdType === 'UUID') imports.add('java.util.UUID');
      const paramName = `${rel.name}Id`;
      finders.push(`    List<${entityName}> findBy${capitalize(rel.name)}Id(${targetIdType} ${paramName});`);
    });

    oneToOnes.forEach(rel => {
      const targetIdType = getTargetIdType(rel.targetEntity);
      if (targetIdType === 'UUID') imports.add('java.util.UUID');
      const paramName = `${rel.name}Id`;
      finders.push(`    Optional<${entityName}> findBy${capitalize(rel.name)}Id(${targetIdType} ${paramName});`);
    });

    // Composite relationship finders when 2 ManyToOnes exist (e.g., student + course, cart + product, user + org)
    if (manyToOnes.length >= 2) {
      const r1 = manyToOnes[0];
      const r2 = manyToOnes[1];
      const t1IdType = getTargetIdType(r1.targetEntity);
      const t2IdType = getTargetIdType(r2.targetEntity);
      finders.push(`    Optional<${entityName}> findBy${capitalize(r1.name)}IdAnd${capitalize(r2.name)}Id(${t1IdType} ${r1.name}Id, ${t2IdType} ${r2.name}Id);`);
    }
  }

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');

  return `package ${packageName}.repository;

${sortedImports}

@Repository
public interface ${entityName}Repository extends JpaRepository<${entityName}, ${idType}> {
${finders.length > 0 ? '\n' + finders.join('\n') + '\n' : ''}}
`;
}
