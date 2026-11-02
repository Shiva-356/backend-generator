/**
 * Generator for JPA @Entity model classes.
 * Emits full Java classes with fields, relationships, getters, setters, constructors,
 * JPA annotations, column mappings, and lifecycle fields.
 */

import { EntityConfig, FieldConfig, RelationshipConfig, ProjectConfig, CascadeType } from './types';

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
}

export function toPluralSnakeCase(str: string): string {
  const snake = toSnakeCase(str);
  if (snake.endsWith('y') && !/[aeiou]y$/.test(snake)) {
    return snake.slice(0, -1) + 'ies';
  }
  if (snake.endsWith('s') || snake.endsWith('x') || snake.endsWith('z') || snake.endsWith('ch') || snake.endsWith('sh')) {
    return snake + 'es';
  }
  return snake + 's';
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildCascadeString(cascades?: CascadeType[]): string {
  if (!cascades || cascades.length === 0) return '';
  if (cascades.length === 1) {
    return `, cascade = CascadeType.${cascades[0]}`;
  }
  return `, cascade = {${cascades.map(c => `CascadeType.${c}`).join(', ')}}`;
}

export function generateEntityClass(entity: EntityConfig, config: ProjectConfig): string {
  const { packageName, options } = config;
  const enableValidation = options?.enableValidation ?? true;

  const entityName = entity.name.trim();
  const tableName = entity.tableName || toPluralSnakeCase(entityName);
  const idType = entity.idType || 'Long';
  const idFieldName = entity.idFieldName || 'id';
  const idGen = entity.idGeneration || (idType === 'UUID' ? 'AUTO' : idType === 'String' ? 'NONE' : 'IDENTITY');

  // Collect needed imports
  const imports = new Set<string>([
    'jakarta.persistence.*',
    'java.time.LocalDateTime',
    'java.util.Objects'
  ]);

  if (idType === 'UUID') {
    imports.add('java.util.UUID');
  }

  const needsBigDecimal = entity.fields.some(f => f.type === 'BigDecimal');
  if (needsBigDecimal) imports.add('java.math.BigDecimal');

  const needsLocalDate = entity.fields.some(f => f.type === 'LocalDate');
  if (needsLocalDate) imports.add('java.time.LocalDate');

  if (enableValidation) {
    imports.add('jakarta.validation.constraints.*');
  }

  const relationships = entity.relationships || [];
  const hasCollectionRelationships = relationships.some(r => r.type === 'ONE_TO_MANY' || r.type === 'MANY_TO_MANY');
  if (hasCollectionRelationships) {
    imports.add('java.util.List');
    imports.add('java.util.ArrayList');
  }

  // Field declarations
  const fieldDeclarations: string[] = [];
  const constructorParams: string[] = [];
  const constructorAssignments: string[] = [];
  const gettersAndSetters: string[] = [];

  // ID Field
  let idAnnotations = '    @Id\n';
  if (idGen === 'IDENTITY') {
    idAnnotations += '    @GeneratedValue(strategy = GenerationType.IDENTITY)\n';
  } else if (idGen === 'AUTO') {
    idAnnotations += '    @GeneratedValue(strategy = GenerationType.AUTO)\n';
  } else if (idGen === 'SEQUENCE') {
    idAnnotations += `    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "${tableName}_seq")\n`;
    idAnnotations += `    @SequenceGenerator(name = "${tableName}_seq", sequenceName = "${tableName}_sequence", allocationSize = 1)\n`;
  }
  idAnnotations += `    @Column(name = "${toSnakeCase(idFieldName)}", updatable = false, nullable = false)`;

  fieldDeclarations.push(`${idAnnotations}\n    private ${idType} ${idFieldName};\n`);

  // ID getter & setter
  gettersAndSetters.push(`    public ${idType} get${capitalize(idFieldName)}() {\n        return ${idFieldName};\n    }\n`);
  gettersAndSetters.push(`    public void set${capitalize(idFieldName)}(${idType} ${idFieldName}) {\n        this.${idFieldName} = ${idFieldName};\n    }\n`);

  // Regular entity fields
  entity.fields.forEach(field => {
    const colName = field.columnName || toSnakeCase(field.name);
    const annotations: string[] = [];

    // Column annotation
    const colParts: string[] = [`name = "${colName}"`];
    if (field.required) colParts.push('nullable = false');
    if (field.unique) colParts.push('unique = true');
    if (field.type === 'String' && field.length) colParts.push(`length = ${field.length}`);
    if (field.type === 'BigDecimal') {
      const precision = field.precision || 19;
      const scale = field.scale !== undefined ? field.scale : 4;
      colParts.push(`precision = ${precision}, scale = ${scale}`);
    }

    annotations.push(`    @Column(${colParts.join(', ')})`);

    // Validation annotations
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

    fieldDeclarations.push(`${annotations.join('\n')}\n    private ${field.type} ${field.name};\n`);

    constructorParams.push(`${field.type} ${field.name}`);
    constructorAssignments.push(`        this.${field.name} = ${field.name};`);

    // Getter & Setter
    const cap = capitalize(field.name);
    const getterPrefix = field.type === 'Boolean' ? (field.name.startsWith('is') ? field.name : `is${cap}`) : `get${cap}`;
    gettersAndSetters.push(`    public ${field.type} ${getterPrefix}() {\n        return ${field.name};\n    }\n`);
    gettersAndSetters.push(`    public void set${cap}(${field.type} ${field.name}) {\n        this.${field.name} = ${field.name};\n    }\n`);
  });

  // Relationships declarations
  relationships.forEach(rel => {
    const targetEntity = config.entities.find(e => e.name === rel.targetEntity);
    const targetIdName = targetEntity?.idFieldName || 'id';
    const relCap = capitalize(rel.name);
    const cascadeStr = buildCascadeString(rel.cascade);
    const orphanRemovalStr = rel.orphanRemoval ? ', orphanRemoval = true' : '';
    const fetchStr = rel.fetch ? `fetch = FetchType.${rel.fetch}` : 'fetch = FetchType.LAZY';

    if (rel.type === 'MANY_TO_ONE') {
      const joinCol = rel.joinColumnName || `${toSnakeCase(rel.name)}_${toSnakeCase(targetIdName)}`;
      const optionalStr = rel.required ? ', optional = false' : '';
      const nullableStr = rel.required ? ', nullable = false' : '';

      fieldDeclarations.push(
        `    @ManyToOne(${fetchStr}${optionalStr}${cascadeStr})\n` +
        `    @JoinColumn(name = "${joinCol}"${nullableStr})\n` +
        `    private ${rel.targetEntity} ${rel.name};\n`
      );

      gettersAndSetters.push(
        `    public ${rel.targetEntity} get${relCap}() {\n        return ${rel.name};\n    }\n\n` +
        `    public void set${relCap}(${rel.targetEntity} ${rel.name}) {\n        this.${rel.name} = ${rel.name};\n    }\n`
      );
    } else if (rel.type === 'ONE_TO_MANY') {
      if (rel.mappedBy) {
        fieldDeclarations.push(
          `    @OneToMany(mappedBy = "${rel.mappedBy}", ${fetchStr}${cascadeStr}${orphanRemovalStr})\n` +
          `    private List<${rel.targetEntity}> ${rel.name} = new ArrayList<>();\n`
        );
      } else {
        const joinCol = rel.joinColumnName || `${toSnakeCase(entityName)}_${toSnakeCase(idFieldName)}`;
        fieldDeclarations.push(
          `    @OneToMany(${fetchStr}${cascadeStr}${orphanRemovalStr})\n` +
          `    @JoinColumn(name = "${joinCol}")\n` +
          `    private List<${rel.targetEntity}> ${rel.name} = new ArrayList<>();\n`
        );
      }

      gettersAndSetters.push(
        `    public List<${rel.targetEntity}> get${relCap}() {\n        return ${rel.name};\n    }\n\n` +
        `    public void set${relCap}(List<${rel.targetEntity}> ${rel.name}) {\n        this.${rel.name} = ${rel.name};\n    }\n`
      );
    } else if (rel.type === 'ONE_TO_ONE') {
      if (rel.mappedBy) {
        fieldDeclarations.push(
          `    @OneToOne(mappedBy = "${rel.mappedBy}", ${fetchStr}${cascadeStr}${orphanRemovalStr})\n` +
          `    private ${rel.targetEntity} ${rel.name};\n`
        );
      } else {
        const joinCol = rel.joinColumnName || `${toSnakeCase(rel.name)}_${toSnakeCase(targetIdName)}`;
        const optionalStr = rel.required ? ', optional = false' : '';
        const nullableStr = rel.required ? ', nullable = false' : '';

        fieldDeclarations.push(
          `    @OneToOne(${fetchStr}${optionalStr}${cascadeStr}${orphanRemovalStr})\n` +
          `    @JoinColumn(name = "${joinCol}", unique = true${nullableStr})\n` +
          `    private ${rel.targetEntity} ${rel.name};\n`
        );
      }

      gettersAndSetters.push(
        `    public ${rel.targetEntity} get${relCap}() {\n        return ${rel.name};\n    }\n\n` +
        `    public void set${relCap}(${rel.targetEntity} ${rel.name}) {\n        this.${rel.name} = ${rel.name};\n    }\n`
      );
    } else if (rel.type === 'MANY_TO_MANY') {
      if (rel.mappedBy) {
        fieldDeclarations.push(
          `    @ManyToMany(mappedBy = "${rel.mappedBy}", ${fetchStr}${cascadeStr})\n` +
          `    private List<${rel.targetEntity}> ${rel.name} = new ArrayList<>();\n`
        );
      } else {
        const joinTable = rel.joinTableName || `${tableName}_${toPluralSnakeCase(rel.targetEntity)}`;
        const joinCol = rel.joinColumnName || `${toSnakeCase(entityName)}_${toSnakeCase(idFieldName)}`;
        const invJoinCol = rel.joinTableInverseColumnName || `${toSnakeCase(rel.targetEntity)}_${toSnakeCase(targetIdName)}`;

        fieldDeclarations.push(
          `    @ManyToMany(${fetchStr}${cascadeStr})\n` +
          `    @JoinTable(\n` +
          `        name = "${joinTable}",\n` +
          `        joinColumns = @JoinColumn(name = "${joinCol}"),\n` +
          `        inverseJoinColumns = @JoinColumn(name = "${invJoinCol}")\n` +
          `    )\n` +
          `    private List<${rel.targetEntity}> ${rel.name} = new ArrayList<>();\n`
        );
      }

      gettersAndSetters.push(
        `    public List<${rel.targetEntity}> get${relCap}() {\n        return ${rel.name};\n    }\n\n` +
        `    public void set${relCap}(List<${rel.targetEntity}> ${rel.name}) {\n        this.${rel.name} = ${rel.name};\n    }\n`
      );
    }
  });

  // Audit field: createdAt
  fieldDeclarations.push(
    `    @Column(name = "created_at", nullable = false, updatable = false)\n` +
    `    private LocalDateTime createdAt = LocalDateTime.now();\n`
  );
  gettersAndSetters.push(
    `    public LocalDateTime getCreatedAt() {\n        return createdAt;\n    }\n\n` +
    `    public void setCreatedAt(LocalDateTime createdAt) {\n        this.createdAt = createdAt;\n    }\n`
  );

  const sortedImports = Array.from(imports).sort().map(i => `import ${i};`).join('\n');

  return `package ${packageName}.entity;

${sortedImports}

@Entity
@Table(name = "${tableName}")
public class ${entityName} {

${fieldDeclarations.join('\n')}
    public ${entityName}() {
    }

    public ${entityName}(${constructorParams.join(', ')}) {
${constructorAssignments.join('\n')}
        this.createdAt = LocalDateTime.now();
    }

${gettersAndSetters.join('\n')}
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ${entityName} that = (${entityName}) o;
        return ${idFieldName} != null && Objects.equals(${idFieldName}, that.${idFieldName});
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
`;
}
