/**
 * Generator for Spring REST Controllers.
 * Emits full CRUD HTTP endpoints with proper status codes, validation, and mappings.
 */

import { EntityConfig, ProjectConfig } from './types';
import { toPluralSnakeCase } from './entityGenerator';

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-');
}

export function toPluralKebabCase(str: string): string {
  return toPluralSnakeCase(str).replace(/_/g, '-');
}

export function generateControllerClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName, options } = config;
  const entityName = entity.name.trim();
  const idType = entity.idType || 'Long';
  const idFieldName = entity.idFieldName || 'id';
  const enableDtos = options?.enableDtos ?? true;
  const enableValidation = options?.enableValidation ?? true;

  const endpointPath = `/api/${toPluralKebabCase(entityName)}`;

  const imports = new Set<string>([
    'org.springframework.web.bind.annotation.*',
    'org.springframework.http.HttpStatus',
    'org.springframework.http.ResponseEntity',
    'java.util.List',
    `${packageName}.service.${entityName}Service`
  ]);

  if (idType === 'UUID') imports.add('java.util.UUID');
  if (enableValidation) imports.add('jakarta.validation.Valid');

  if (enableDtos) {
    imports.add(`${packageName}.dto.${entityName}RequestDTO`);
    imports.add(`${packageName}.dto.${entityName}ResponseDTO`);
  } else {
    imports.add(`${packageName}.entity.${entityName}`);
  }

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');
  const validAnnotation = enableValidation ? '@Valid ' : '';

  if (enableDtos) {
    return `package ${packageName}.controller;

${sortedImports}

@RestController
@RequestMapping("${endpointPath}")
public class ${entityName}Controller {

    private final ${entityName}Service service;

    public ${entityName}Controller(${entityName}Service service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ${entityName}ResponseDTO create(${validAnnotation}@RequestBody ${entityName}RequestDTO requestDTO) {
        return service.create(requestDTO);
    }

    @GetMapping
    public List<${entityName}ResponseDTO> getAll() {
        return service.findAll();
    }

    @GetMapping("/{${idFieldName}}")
    public ${entityName}ResponseDTO getById(@PathVariable("${idFieldName}") ${idType} ${idFieldName}) {
        return service.findById(${idFieldName});
    }

    @PutMapping("/{${idFieldName}}")
    public ${entityName}ResponseDTO update(
            @PathVariable("${idFieldName}") ${idType} ${idFieldName},
            ${validAnnotation}@RequestBody ${entityName}RequestDTO requestDTO) {
        return service.update(${idFieldName}, requestDTO);
    }

    @DeleteMapping("/{${idFieldName}}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("${idFieldName}") ${idType} ${idFieldName}) {
        service.deleteById(${idFieldName});
    }
}
`;
  }

  return `package ${packageName}.controller;

${sortedImports}

@RestController
@RequestMapping("${endpointPath}")
public class ${entityName}Controller {

    private final ${entityName}Service service;

    public ${entityName}Controller(${entityName}Service service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ${entityName} create(${validAnnotation}@RequestBody ${entityName} entity) {
        return service.create(entity);
    }

    @GetMapping
    public List<${entityName}> getAll() {
        return service.findAll();
    }

    @GetMapping("/{${idFieldName}}")
    public ${entityName} getById(@PathVariable("${idFieldName}") ${idType} ${idFieldName}) {
        return service.findById(${idFieldName});
    }

    @PutMapping("/{${idFieldName}}")
    public ${entityName} update(
            @PathVariable("${idFieldName}") ${idType} ${idFieldName},
            ${validAnnotation}@RequestBody ${entityName} entity) {
        return service.update(${idFieldName}, entity);
    }

    @DeleteMapping("/{${idFieldName}}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("${idFieldName}") ${idType} ${idFieldName}) {
        service.deleteById(${idFieldName});
    }
}
`;
}
