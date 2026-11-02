/**
 * Generator for Spring @Service classes with complete CRUD logic.
 */

import { EntityConfig, ProjectConfig } from './types';
import { capitalize } from './entityGenerator';

export function generateServiceClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName, options } = config;
  const entityName = entity.name.trim();
  const idType = entity.idType || 'Long';
  const idFieldName = entity.idFieldName || 'id';
  const enableDtos = options?.enableDtos ?? true;
  const enableExceptions = options?.enableGlobalExceptionHandler ?? true;

  const imports = new Set<string>([
    'org.springframework.stereotype.Service',
    'org.springframework.transaction.annotation.Transactional',
    'java.util.List',
    `${packageName}.repository.${entityName}Repository`,
    `${packageName}.entity.${entityName}`
  ]);

  if (idType === 'UUID') imports.add('java.util.UUID');

  if (enableDtos) {
    imports.add(`${packageName}.dto.${entityName}RequestDTO`);
    imports.add(`${packageName}.dto.${entityName}ResponseDTO`);
    imports.add(`${packageName}.mapper.${entityName}Mapper`);
    imports.add('java.util.stream.Collectors');
  }

  if (enableExceptions) {
    imports.add(`${packageName}.exception.ResourceNotFoundException`);
  }

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');

  if (enableDtos) {
    return `package ${packageName}.service;

${sortedImports}

@Service
@Transactional
public class ${entityName}Service {

    private final ${entityName}Repository repository;
    private final ${entityName}Mapper mapper;

    public ${entityName}Service(${entityName}Repository repository, ${entityName}Mapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ${entityName}ResponseDTO create(${entityName}RequestDTO requestDTO) {
        ${entityName} entity = mapper.toEntity(requestDTO);
        ${entityName} saved = repository.save(entity);
        return mapper.toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<${entityName}ResponseDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ${entityName}ResponseDTO findById(${idType} ${idFieldName}) {
        ${entityName} entity = repository.findById(${idFieldName})
                .orElseThrow(() -> new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName}));
        return mapper.toResponseDTO(entity);
    }

    public ${entityName}ResponseDTO update(${idType} ${idFieldName}, ${entityName}RequestDTO requestDTO) {
        ${entityName} existing = repository.findById(${idFieldName})
                .orElseThrow(() -> new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName}));
        mapper.updateEntityFromDTO(requestDTO, existing);
        ${entityName} updated = repository.save(existing);
        return mapper.toResponseDTO(updated);
    }

    public void deleteById(${idType} ${idFieldName}) {
        if (!repository.existsById(${idFieldName})) {
            throw new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName});
        }
        repository.deleteById(${idFieldName});
    }
}
`;
  }

  // Non-DTO direct entity mode
  const updateFieldAssignments = [
    ...entity.fields.map(field => {
      const cap = capitalize(field.name);
      const getter = field.type === 'Boolean' && field.name.startsWith('is') ? field.name : `get${cap}`;
      return `        existing.set${cap}(updated.${getter}());`;
    }),
    ...(entity.relationships || [])
      .filter(rel => rel.type === 'MANY_TO_ONE' || (rel.type === 'ONE_TO_ONE' && rel.isOwningSide !== false && !rel.mappedBy))
      .map(rel => {
        const cap = capitalize(rel.name);
        return `        existing.set${cap}(updated.get${cap}());`;
      })
  ].join('\n');

  return `package ${packageName}.service;

${sortedImports}

@Service
@Transactional
public class ${entityName}Service {

    private final ${entityName}Repository repository;

    public ${entityName}Service(${entityName}Repository repository) {
        this.repository = repository;
    }

    public ${entityName} create(${entityName} entity) {
        return repository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<${entityName}> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public ${entityName} findById(${idType} ${idFieldName}) {
        return repository.findById(${idFieldName})
                .orElseThrow(() -> new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName}));
    }

    public ${entityName} update(${idType} ${idFieldName}, ${entityName} updated) {
        ${entityName} existing = repository.findById(${idFieldName})
                .orElseThrow(() -> new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName}));
${updateFieldAssignments}
        return repository.save(existing);
    }

    public void deleteById(${idType} ${idFieldName}) {
        if (!repository.existsById(${idFieldName})) {
            throw new ${enableExceptions ? 'ResourceNotFoundException' : 'RuntimeException'}("${entityName} not found with id: " + ${idFieldName});
        }
        repository.deleteById(${idFieldName});
    }
}
`;
}
