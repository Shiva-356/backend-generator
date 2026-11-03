/**
 * Generator for Request & Response DTOs and mapper components.
 * Safely handles entity relationships by exposing target identifiers
 * rather than nesting full entity graphs, preventing infinite recursion.
 */

import { EntityConfig, ProjectConfig, RelationshipConfig } from './types';
import { capitalize } from './entityGenerator';

export function getRelationshipDtoFieldName(rel: RelationshipConfig): string {
  if (rel.type === 'ONE_TO_MANY' || rel.type === 'MANY_TO_MANY') {
    // If name is "items" -> "itemIds", "courses" -> "courseIds", otherwise "<name>Ids"
    if (rel.name.endsWith('ies')) {
      return `${rel.name.slice(0, -3)}yIds`;
    }
    if (rel.name.endsWith('s')) {
      return `${rel.name.slice(0, -1)}Ids`;
    }
    return `${rel.name}Ids`;
  }
  return `${rel.name}Id`;
}

export function generateRequestDtoClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName, options } = config;
  const entityName = entity.name.trim();
  const enableValidation = options?.enableValidation ?? true;
  const relationships = entity.relationships || [];

  const imports = new Set<string>();

  if (entity.fields.some(f => f.type === 'BigDecimal')) imports.add('java.math.BigDecimal');
  if (entity.fields.some(f => f.type === 'LocalDate')) imports.add('java.time.LocalDate');
  if (entity.fields.some(f => f.type === 'LocalDateTime')) imports.add('java.time.LocalDateTime');
  if (enableValidation) imports.add('jakarta.validation.constraints.*');

  // Check relationship ID types
  const hasCollectionRel = relationships.some(r => r.type === 'ONE_TO_MANY' || r.type === 'MANY_TO_MANY');
  if (hasCollectionRel) {
    imports.add('java.util.List');
  }

  relationships.forEach(rel => {
    const target = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdType = target?.idType || 'Long';
    if (targetIdType === 'UUID') imports.add('java.util.UUID');
  });

  const fieldDecls: string[] = [];
  const gettersAndSetters: string[] = [];

  // Regular entity fields
  entity.fields.forEach(field => {
    const annotations: string[] = [];

    if (enableValidation) {
      if (field.required) {
        if (field.type === 'String') {
          annotations.push(`    @NotBlank(message = "${field.name} must not be blank")`);
        } else {
          annotations.push(`    @NotNull(message = "${field.name} must not be null")`);
        }
      }
      if (field.type === 'String' && field.length) {
        annotations.push(`    @Size(max = ${field.length}, message = "${field.name} must not exceed ${field.length} characters")`);
      }
      if ((field.type === 'Integer' || field.type === 'Long' || field.type === 'Double' || field.type === 'BigDecimal') && field.min !== undefined) {
        annotations.push(`    @Min(value = ${field.min}, message = "${field.name} must be at least ${field.min}")`);
      }
      if ((field.type === 'Integer' || field.type === 'Long' || field.type === 'Double' || field.type === 'BigDecimal') && field.max !== undefined) {
        annotations.push(`    @Max(value = ${field.max}, message = "${field.name} must be at most ${field.max}")`);
      }
      if (field.pattern) {
        annotations.push(`    @Pattern(regexp = "${field.pattern.replace(/\\/g, '\\\\')}", message = "${field.name} format is invalid")`);
      }
    }

    fieldDecls.push(`${annotations.length > 0 ? annotations.join('\n') + '\n' : ''}    private ${field.type} ${field.name};\n`);

    const cap = capitalize(field.name);
    const getterPrefix = field.type === 'Boolean' ? (field.name.startsWith('is') ? field.name : `is${cap}`) : `get${cap}`;
    gettersAndSetters.push(`    public ${field.type} ${getterPrefix}() {\n        return ${field.name};\n    }\n`);
    if (field.type === 'Boolean' && !field.name.startsWith('is')) {
      gettersAndSetters.push(`    public ${field.type} get${cap}() {\n        return ${field.name};\n    }\n`);
    }
    gettersAndSetters.push(`    public void set${cap}(${field.type} ${field.name}) {\n        this.${field.name} = ${field.name};\n    }\n`);
  });

  // Relationship ID fields
  relationships.forEach(rel => {
    const target = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdType = target?.idType || 'Long';
    const relDtoName = getRelationshipDtoFieldName(rel);
    const cap = capitalize(relDtoName);

    if (rel.type === 'MANY_TO_ONE' || rel.type === 'ONE_TO_ONE') {
      const annotations: string[] = [];
      if (enableValidation && rel.required) {
        annotations.push(`    @NotNull(message = "${relDtoName} must not be null")`);
      }

      fieldDecls.push(`${annotations.length > 0 ? annotations.join('\n') + '\n' : ''}    private ${targetIdType} ${relDtoName};\n`);
      gettersAndSetters.push(`    public ${targetIdType} get${cap}() {\n        return ${relDtoName};\n    }\n`);
      gettersAndSetters.push(`    public void set${cap}(${targetIdType} ${relDtoName}) {\n        this.${relDtoName} = ${relDtoName};\n    }\n`);
    } else {
      // Collection relationship
      fieldDecls.push(`    private List<${targetIdType}> ${relDtoName};\n`);
      gettersAndSetters.push(`    public List<${targetIdType}> get${cap}() {\n        return ${relDtoName};\n    }\n`);
      gettersAndSetters.push(`    public void set${cap}(List<${targetIdType}> ${relDtoName}) {\n        this.${relDtoName} = ${relDtoName};\n    }\n`);
    }
  });

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');

  return `package ${packageName}.dto;

${sortedImports ? sortedImports + '\n\n' : ''}public class ${entityName}RequestDTO {

${fieldDecls.join('\n')}
    public ${entityName}RequestDTO() {
    }

${gettersAndSetters.join('\n')}}
`;
}

export function generateResponseDtoClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName } = config;
  const entityName = entity.name.trim();
  const idType = entity.idType || 'Long';
  const idFieldName = entity.idFieldName || 'id';
  const relationships = entity.relationships || [];

  const imports = new Set<string>([
    'java.time.LocalDateTime'
  ]);

  if (idType === 'UUID') imports.add('java.util.UUID');
  if (entity.fields.some(f => f.type === 'BigDecimal')) imports.add('java.math.BigDecimal');
  if (entity.fields.some(f => f.type === 'LocalDate')) imports.add('java.time.LocalDate');

  const hasCollectionRel = relationships.some(r => r.type === 'ONE_TO_MANY' || r.type === 'MANY_TO_MANY');
  if (hasCollectionRel) {
    imports.add('java.util.List');
  }

  relationships.forEach(rel => {
    const target = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdType = target?.idType || 'Long';
    if (targetIdType === 'UUID') imports.add('java.util.UUID');
  });

  const fieldDecls: string[] = [
    `    private ${idType} ${idFieldName};\n`
  ];
  const gettersAndSetters: string[] = [
    `    public ${idType} get${capitalize(idFieldName)}() {\n        return ${idFieldName};\n    }\n`,
    `    public void set${capitalize(idFieldName)}(${idType} ${idFieldName}) {\n        this.${idFieldName} = ${idFieldName};\n    }\n`
  ];

  entity.fields.forEach(field => {
    fieldDecls.push(`    private ${field.type} ${field.name};\n`);

    const cap = capitalize(field.name);
    const getterPrefix = field.type === 'Boolean' ? (field.name.startsWith('is') ? field.name : `is${cap}`) : `get${cap}`;
    gettersAndSetters.push(`    public ${field.type} ${getterPrefix}() {\n        return ${field.name};\n    }\n`);
    if (field.type === 'Boolean' && !field.name.startsWith('is')) {
      gettersAndSetters.push(`    public ${field.type} get${cap}() {\n        return ${field.name};\n    }\n`);
    }
    gettersAndSetters.push(`    public void set${cap}(${field.type} ${field.name}) {\n        this.${field.name} = ${field.name};\n    }\n`);
  });

  // Relationship IDs in response DTO
  relationships.forEach(rel => {
    const target = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdType = target?.idType || 'Long';
    const relDtoName = getRelationshipDtoFieldName(rel);
    const cap = capitalize(relDtoName);

    if (rel.type === 'MANY_TO_ONE' || rel.type === 'ONE_TO_ONE') {
      fieldDecls.push(`    private ${targetIdType} ${relDtoName};\n`);
      gettersAndSetters.push(`    public ${targetIdType} get${cap}() {\n        return ${relDtoName};\n    }\n`);
      gettersAndSetters.push(`    public void set${cap}(${targetIdType} ${relDtoName}) {\n        this.${relDtoName} = ${relDtoName};\n    }\n`);
    } else {
      fieldDecls.push(`    private List<${targetIdType}> ${relDtoName};\n`);
      gettersAndSetters.push(`    public List<${targetIdType}> get${cap}() {\n        return ${relDtoName};\n    }\n`);
      gettersAndSetters.push(`    public void set${cap}(List<${targetIdType}> ${relDtoName}) {\n        this.${relDtoName} = ${relDtoName};\n    }\n`);
    }
  });

  fieldDecls.push('    private LocalDateTime createdAt;\n');
  gettersAndSetters.push(
    `    public LocalDateTime getCreatedAt() {\n        return createdAt;\n    }\n\n` +
    `    public void setCreatedAt(LocalDateTime createdAt) {\n        this.createdAt = createdAt;\n    }\n`
  );

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');

  return `package ${packageName}.dto;

${sortedImports ? sortedImports + '\n\n' : ''}public class ${entityName}ResponseDTO {

${fieldDecls.join('\n')}
    public ${entityName}ResponseDTO() {
    }

${gettersAndSetters.join('\n')}}
`;
}

export function generateMapperClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName } = config;
  const entityName = entity.name.trim();
  const idFieldName = entity.idFieldName || 'id';
  const relationships = entity.relationships || [];

  const toEntitySets = entity.fields.map(field => {
    const cap = capitalize(field.name);
    const getter = field.type === 'Boolean' && field.name.startsWith('is') ? field.name : `get${cap}`;
    return `        entity.set${cap}(dto.${getter}());`;
  }).join('\n');

  const toDtoSets = entity.fields.map(field => {
    const cap = capitalize(field.name);
    const getter = field.type === 'Boolean' && field.name.startsWith('is') ? field.name : `get${cap}`;
    return `        dto.set${cap}(entity.${getter}());`;
  }).join('\n');

  // Relationship mappings for Response DTO
  const relDtoSets: string[] = [];
  const needsCollectors = relationships.some(r => r.type === 'ONE_TO_MANY' || r.type === 'MANY_TO_MANY');

  relationships.forEach(rel => {
    const target = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdName = target?.idFieldName || 'id';
    const relNameCap = capitalize(rel.name);
    const targetIdCap = capitalize(targetIdName);
    const relDtoName = getRelationshipDtoFieldName(rel);
    const relDtoCap = capitalize(relDtoName);

    if (rel.type === 'MANY_TO_ONE' || rel.type === 'ONE_TO_ONE') {
      relDtoSets.push(
        `        if (entity.get${relNameCap}() != null) {\n` +
        `            dto.set${relDtoCap}(entity.get${relNameCap}().get${targetIdCap}());\n` +
        `        }`
      );
    } else {
      relDtoSets.push(
        `        if (entity.get${relNameCap}() != null) {\n` +
        `            dto.set${relDtoCap}(entity.get${relNameCap}().stream()\n` +
        `                    .map(${rel.targetEntity}::get${targetIdCap})\n` +
        `                    .collect(Collectors.toList()));\n` +
        `        }`
      );
    }
  });

  const mapperImports = [
    `import ${packageName}.dto.${entityName}RequestDTO;`,
    `import ${packageName}.dto.${entityName}ResponseDTO;`,
    `import ${packageName}.entity.${entityName};`
  ];

  // Import target entities if used in mapper streams
  relationships.forEach(rel => {
    if (rel.type === 'ONE_TO_MANY' || rel.type === 'MANY_TO_MANY') {
      mapperImports.push(`import ${packageName}.entity.${rel.targetEntity};`);
    }
  });

  if (needsCollectors) {
    mapperImports.push('import java.util.stream.Collectors;');
  }
  mapperImports.push('import org.springframework.stereotype.Component;');

  const sortedMapperImports = Array.from(new Set(mapperImports)).sort().join('\n');

  return `package ${packageName}.mapper;

${sortedMapperImports}

@Component
public class ${entityName}Mapper {

    public ${entityName} toEntity(${entityName}RequestDTO dto) {
        if (dto == null) {
            return null;
        }
        ${entityName} entity = new ${entityName}();
${toEntitySets}
        return entity;
    }

    public ${entityName}ResponseDTO toResponseDTO(${entityName} entity) {
        if (entity == null) {
            return null;
        }
        ${entityName}ResponseDTO dto = new ${entityName}ResponseDTO();
        dto.set${capitalize(idFieldName)}(entity.get${capitalize(idFieldName)}());
${toDtoSets}
${relDtoSets.length > 0 ? '\n' + relDtoSets.join('\n') : ''}
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public void updateEntityFromDTO(${entityName}RequestDTO dto, ${entityName} entity) {
        if (dto == null || entity == null) {
            return;
        }
${toEntitySets}
    }
}
`;
}
