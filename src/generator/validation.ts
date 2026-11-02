/**
 * Configuration validation engine for the Spring Boot generator.
 * Strictly verifies identifiers, package paths, types, database compatibility,
 * and entity relationships, throwing descriptive errors instead of silently defaulting.
 */

import {
  ProjectConfig,
  EntityConfig,
  FieldConfig,
  RelationshipConfig,
  FieldDataType,
  DatabaseType,
  JavaVersion,
  SpringBootVersion,
  IdType,
  IdGenerationStrategy,
  RelationshipType,
  CascadeType,
  FetchType
} from './types';

export class ConfigValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`Project configuration validation failed:\n - ${errors.join('\n - ')}`);
    this.name = 'ConfigValidationError';
    this.errors = errors;
  }
}

const JAVA_RESERVED_KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
  'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'false',
  'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
  'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
  'this', 'throw', 'throws', 'transient', 'true', 'try', 'void', 'volatile', 'while',
  'record', 'sealed', 'permits', 'var', 'yield'
]);

const VALID_JAVA_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const VALID_ARTIFACT_OR_PROJECT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const VALID_SQL_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function isValidJavaIdentifier(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  if (JAVA_RESERVED_KEYWORDS.has(name)) return false;
  return VALID_JAVA_IDENTIFIER_REGEX.test(name);
}

export function isValidJavaPackage(packageName: string): boolean {
  if (!packageName || typeof packageName !== 'string') return false;
  const segments = packageName.split('.');
  if (segments.length === 0) return false;
  for (const seg of segments) {
    if (!isValidJavaIdentifier(seg)) {
      return false;
    }
  }
  return true;
}

const SUPPORTED_FIELD_TYPES: Set<FieldDataType> = new Set([
  'String',
  'Integer',
  'Long',
  'Double',
  'BigDecimal',
  'Boolean',
  'LocalDate',
  'LocalDateTime'
]);

const SUPPORTED_ID_TYPES: Set<IdType> = new Set(['Long', 'Integer', 'UUID', 'String']);
const SUPPORTED_ID_STRATEGIES: Set<IdGenerationStrategy> = new Set(['IDENTITY', 'AUTO', 'SEQUENCE', 'UUID', 'NONE']);
const SUPPORTED_DATABASES: Set<DatabaseType> = new Set(['postgresql', 'mysql', 'h2']);
const SUPPORTED_JAVA_VERSIONS: Set<JavaVersion> = new Set(['17', '21']);
const SUPPORTED_SPRING_BOOT_VERSIONS: Set<SpringBootVersion> = new Set(['3.2.5', '3.3.0', '3.4.0']);
const SUPPORTED_RELATIONSHIP_TYPES: Set<RelationshipType> = new Set(['MANY_TO_ONE', 'ONE_TO_MANY', 'ONE_TO_ONE', 'MANY_TO_MANY']);
const SUPPORTED_CASCADE_TYPES: Set<CascadeType> = new Set(['ALL', 'PERSIST', 'MERGE', 'REMOVE', 'REFRESH', 'DETACH']);
const SUPPORTED_FETCH_TYPES: Set<FetchType> = new Set(['LAZY', 'EAGER']);

export function validateProjectConfig(config: ProjectConfig): void {
  const errors: string[] = [];

  if (!config) {
    throw new ConfigValidationError(['Project configuration object is required.']);
  }

  // 1. Project name
  if (!config.projectName || config.projectName.trim() === '') {
    errors.push('Project name is required.');
  } else if (!VALID_ARTIFACT_OR_PROJECT_REGEX.test(config.projectName.trim())) {
    errors.push(`Project name "${config.projectName}" is invalid. Must start with a letter and contain only alphanumeric characters, dashes, or underscores.`);
  }

  // 2. Group ID
  if (!config.groupId || config.groupId.trim() === '') {
    errors.push('Group ID is required (e.g. "com.example").');
  } else if (!isValidJavaPackage(config.groupId.trim())) {
    errors.push(`Group ID "${config.groupId}" is not a valid Java package format.`);
  }

  // 3. Artifact ID
  if (!config.artifactId || config.artifactId.trim() === '') {
    errors.push('Artifact ID is required (e.g. "backend-service").');
  } else if (!VALID_ARTIFACT_OR_PROJECT_REGEX.test(config.artifactId.trim())) {
    errors.push(`Artifact ID "${config.artifactId}" is invalid. Must start with a letter and contain only alphanumeric characters, dashes, or underscores.`);
  }

  // 4. Base package name
  if (!config.packageName || config.packageName.trim() === '') {
    errors.push('Base package name is required (e.g. "com.example.service").');
  } else if (!isValidJavaPackage(config.packageName.trim())) {
    errors.push(`Base package name "${config.packageName}" is not a valid Java package identifier.`);
  }

  // 5. Java version
  if (!SUPPORTED_JAVA_VERSIONS.has(config.javaVersion)) {
    errors.push(`Unsupported Java version "${config.javaVersion}". Supported versions: 17, 21.`);
  }

  // 6. Spring Boot version
  if (!SUPPORTED_SPRING_BOOT_VERSIONS.has(config.springBootVersion)) {
    errors.push(`Unsupported Spring Boot version "${config.springBootVersion}". Supported versions: 3.2.5, 3.3.0, 3.4.0.`);
  }

  // 7. Database
  if (!SUPPORTED_DATABASES.has(config.database)) {
    errors.push(`Unsupported database type "${config.database}". Supported databases: postgresql, mysql, h2.`);
  }

  // 8. Entities check
  if (!Array.isArray(config.entities) || config.entities.length === 0) {
    errors.push('At least one entity must be configured for the backend project.');
  } else {
    const seenEntityNames = new Set<string>();
    const entityMap = new Map<string, EntityConfig>();

    // Pass 1: Entity Names, IDs, and Fields
    config.entities.forEach((entity, entityIndex) => {
      const entityNum = entityIndex + 1;

      if (!entity.name || entity.name.trim() === '') {
        errors.push(`Entity #${entityNum} has no name specified.`);
        return;
      }

      const entityName = entity.name.trim();

      if (!isValidJavaIdentifier(entityName)) {
        errors.push(`Entity name "${entityName}" is not a valid Java identifier or is a reserved keyword.`);
      }

      const lowerName = entityName.toLowerCase();
      if (seenEntityNames.has(lowerName)) {
        errors.push(`Duplicate entity name found: "${entityName}". Entity names must be unique (case-insensitive).`);
      }
      seenEntityNames.add(lowerName);
      entityMap.set(entityName, entity);

      // Validate ID type
      const idType = entity.idType || 'Long';
      if (!SUPPORTED_ID_TYPES.has(idType)) {
        errors.push(`Entity "${entityName}" has unsupported ID type "${idType}". Supported ID types: Long, Integer, UUID, String.`);
      }

      // Validate ID generation strategy
      if (entity.idGeneration) {
        if (!SUPPORTED_ID_STRATEGIES.has(entity.idGeneration)) {
          errors.push(`Entity "${entityName}" has unsupported ID generation strategy "${entity.idGeneration}".`);
        } else {
          // Compatibility checks
          if (entity.idGeneration === 'IDENTITY' && (idType === 'UUID' || idType === 'String')) {
            errors.push(`Entity "${entityName}" cannot use IDENTITY generation with ${idType} identifier.`);
          }
          if (entity.idGeneration === 'SEQUENCE') {
            if (idType === 'UUID' || idType === 'String') {
              errors.push(`Entity "${entityName}" cannot use SEQUENCE generation with ${idType} identifier.`);
            }
            if (config.database === 'mysql') {
              errors.push(`Entity "${entityName}" cannot use SEQUENCE generation with MySQL database (MySQL does not support standard sequences).`);
            }
          }
        }
      }

      // Validate custom idFieldName if specified
      const idFieldName = (entity.idFieldName || 'id').trim();
      if (!isValidJavaIdentifier(idFieldName)) {
        errors.push(`Entity "${entityName}" has an invalid ID field name "${idFieldName}".`);
      }

      // Validate fields
      if (!Array.isArray(entity.fields)) {
        errors.push(`Entity "${entityName}" fields must be an array.`);
      } else {
        const seenFieldNames = new Set<string>([idFieldName.toLowerCase()]);

        entity.fields.forEach((field, fieldIndex) => {
          const fieldNum = fieldIndex + 1;

          if (!field.name || field.name.trim() === '') {
            errors.push(`Entity "${entityName}", Field #${fieldNum} has an empty name.`);
            return;
          }

          const fieldName = field.name.trim();

          if (!isValidJavaIdentifier(fieldName)) {
            errors.push(`Entity "${entityName}", field "${fieldName}" is not a valid Java identifier or is a reserved keyword.`);
          }

          const lowerFieldName = fieldName.toLowerCase();
          if (seenFieldNames.has(lowerFieldName)) {
            errors.push(`Entity "${entityName}" has duplicate field name "${fieldName}" (or conflicts with ID field).`);
          }
          seenFieldNames.add(lowerFieldName);

          if (!SUPPORTED_FIELD_TYPES.has(field.type)) {
            errors.push(`Entity "${entityName}", field "${fieldName}" has unsupported data type "${field.type}". Supported types: ${Array.from(SUPPORTED_FIELD_TYPES).join(', ')}.`);
          }

          // Length check
          if (field.length !== undefined && (field.length <= 0 || !Number.isInteger(field.length))) {
            errors.push(`Entity "${entityName}", field "${fieldName}" length must be a positive integer.`);
          }

          // Precision / Scale check
          if (field.precision !== undefined && (field.precision <= 0 || !Number.isInteger(field.precision))) {
            errors.push(`Entity "${entityName}", field "${fieldName}" precision must be a positive integer.`);
          }
          if (field.scale !== undefined && (field.scale < 0 || !Number.isInteger(field.scale))) {
            errors.push(`Entity "${entityName}", field "${fieldName}" scale must be a non-negative integer.`);
          }
          if (field.precision !== undefined && field.scale !== undefined && field.scale > field.precision) {
            errors.push(`Entity "${entityName}", field "${fieldName}" scale (${field.scale}) cannot exceed precision (${field.precision}).`);
          }

          // Min/Max numeric check
          if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
            errors.push(`Entity "${entityName}", field "${fieldName}" min value (${field.min}) cannot be greater than max value (${field.max}).`);
          }
        });
      }
    });

    // Pass 2: Relationship Cross-Entity Validation
    config.entities.forEach(entity => {
      if (!entity.relationships || !Array.isArray(entity.relationships)) return;

      const entityName = entity.name.trim();
      const existingFieldNames = new Set<string>([
        (entity.idFieldName || 'id').toLowerCase(),
        ...entity.fields.map(f => f.name.toLowerCase())
      ]);
      const seenRelNames = new Set<string>();

      entity.relationships.forEach((rel, relIndex) => {
        const relNum = relIndex + 1;

        if (!rel.name || rel.name.trim() === '') {
          errors.push(`Entity "${entityName}", Relationship #${relNum} has no property name specified.`);
          return;
        }

        const relName = rel.name.trim();

        if (!isValidJavaIdentifier(relName)) {
          errors.push(`Entity "${entityName}", relationship "${relName}" is not a valid Java identifier or is a reserved keyword.`);
        }

        const lowerRelName = relName.toLowerCase();
        if (existingFieldNames.has(lowerRelName)) {
          errors.push(`Entity "${entityName}" relationship "${relName}" collides with an existing field or ID property.`);
        }
        if (seenRelNames.has(lowerRelName)) {
          errors.push(`Entity "${entityName}" has duplicate relationship name "${relName}".`);
        }
        seenRelNames.add(lowerRelName);

        // Target Entity existence check
        if (!rel.targetEntity || rel.targetEntity.trim() === '') {
          errors.push(`Entity "${entityName}", relationship "${relName}" has no target entity specified.`);
          return;
        }

        const targetEntityName = rel.targetEntity.trim();
        const targetEntity = entityMap.get(targetEntityName);
        if (!targetEntity) {
          errors.push(`Entity "${entityName}", relationship "${relName}" references nonexistent target entity "${targetEntityName}".`);
          return;
        }

        // Relationship type check
        if (!SUPPORTED_RELATIONSHIP_TYPES.has(rel.type)) {
          errors.push(`Entity "${entityName}", relationship "${relName}" has unsupported type "${rel.type}". Supported types: MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE, MANY_TO_MANY.`);
          return;
        }

        // Fetch type check
        if (rel.fetch && !SUPPORTED_FETCH_TYPES.has(rel.fetch)) {
          errors.push(`Entity "${entityName}", relationship "${relName}" has unsupported fetch type "${rel.fetch}". Supported: LAZY, EAGER.`);
        }

        // Cascade check
        if (rel.cascade && Array.isArray(rel.cascade)) {
          for (const c of rel.cascade) {
            if (!SUPPORTED_CASCADE_TYPES.has(c)) {
              errors.push(`Entity "${entityName}", relationship "${relName}" has unsupported cascade type "${c}".`);
            }
          }
        }

        // Orphan removal validation
        if (rel.orphanRemoval) {
          if (rel.type === 'MANY_TO_ONE' || rel.type === 'MANY_TO_MANY') {
            errors.push(`Entity "${entityName}", relationship "${relName}" cannot have orphanRemoval=true with ${rel.type} (only valid for ONE_TO_MANY or ONE_TO_ONE).`);
          }
        }

        // Custom joinColumn / joinTable name validation
        if (rel.joinColumnName && !VALID_SQL_IDENTIFIER_REGEX.test(rel.joinColumnName)) {
          errors.push(`Entity "${entityName}", relationship "${relName}" has invalid joinColumnName "${rel.joinColumnName}".`);
        }
        if (rel.joinTableName && !VALID_SQL_IDENTIFIER_REGEX.test(rel.joinTableName)) {
          errors.push(`Entity "${entityName}", relationship "${relName}" has invalid joinTableName "${rel.joinTableName}".`);
        }

        // Bidirectional mappedBy checks
        if (rel.mappedBy) {
          if (rel.type === 'MANY_TO_ONE') {
            errors.push(`Entity "${entityName}", relationship "${relName}" of type MANY_TO_ONE cannot declare mappedBy (ManyToOne is always the owning side in JPA).`);
          } else {
            // Check that target entity has the matching reverse relationship
            const targetRels = targetEntity.relationships || [];
            const matchingReverseRel = targetRels.find(tr => tr.name === rel.mappedBy);

            if (!matchingReverseRel) {
              errors.push(`Entity "${entityName}", relationship "${relName}" declares mappedBy="${rel.mappedBy}", but target entity "${targetEntityName}" has no relationship named "${rel.mappedBy}".`);
            } else {
              // Verify reverse points back to this entity
              if (matchingReverseRel.targetEntity !== entityName) {
                errors.push(`Entity "${entityName}", relationship "${relName}" mappedBy="${rel.mappedBy}" points to relationship on "${targetEntityName}" which targets "${matchingReverseRel.targetEntity}" instead of "${entityName}".`);
              }

              // Verify cardinality compatibility
              if (rel.type === 'ONE_TO_MANY' && matchingReverseRel.type !== 'MANY_TO_ONE') {
                errors.push(`Entity "${entityName}" ONE_TO_MANY relationship "${relName}" mappedBy="${rel.mappedBy}" requires target relationship to be MANY_TO_ONE, but found ${matchingReverseRel.type}.`);
              }
              if (rel.type === 'ONE_TO_ONE' && matchingReverseRel.type !== 'ONE_TO_ONE') {
                errors.push(`Entity "${entityName}" ONE_TO_ONE relationship "${relName}" mappedBy="${rel.mappedBy}" requires target relationship to be ONE_TO_ONE, but found ${matchingReverseRel.type}.`);
              }
              if (rel.type === 'MANY_TO_MANY' && matchingReverseRel.type !== 'MANY_TO_MANY') {
                errors.push(`Entity "${entityName}" MANY_TO_MANY relationship "${relName}" mappedBy="${rel.mappedBy}" requires target relationship to be MANY_TO_MANY, but found ${matchingReverseRel.type}.`);
              }
            }
          }
        }
      });
    });
  }

  // Optional serverPort check
  if (config.options?.serverPort !== undefined) {
    const port = config.options.serverPort;
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      errors.push(`Server port ${port} is invalid. Must be between 1024 and 65535.`);
    }
  }

  // Security configuration validation
  const security = config.security ?? config.options?.security;
  if (security && security.enabled) {
    // Check for entity name collision with security AppUser
    const hasAppUserCollision = config.entities?.some(
      e => e.name.toLowerCase() === 'appuser' || (e.tableName && e.tableName.toLowerCase() === 'app_users')
    );
    if (hasAppUserCollision) {
      errors.push('Entity name "AppUser" or table name "app_users" conflicts with the built-in Spring Security authentication entity. Please rename your business entity (e.g. "UserProfile", "Customer", or "Member") or disable security.');
    }

    if (security.jwtSecretEnvVar !== undefined) {
      if (typeof security.jwtSecretEnvVar !== 'string' || security.jwtSecretEnvVar.trim() === '') {
        errors.push('Security jwtSecretEnvVar must be a non-empty string.');
      } else if (!/^[A-Z_][A-Z0-9_]*$/.test(security.jwtSecretEnvVar.trim())) {
        errors.push(`Security jwtSecretEnvVar "${security.jwtSecretEnvVar}" is invalid. Must follow standard ENV_VAR uppercase naming conventions (e.g. "JWT_SECRET").`);
      }
    }

    if (security.tokenExpirationMinutes !== undefined) {
      const exp = security.tokenExpirationMinutes;
      if (!Number.isInteger(exp) || exp < 1 || exp > 525600) {
        errors.push(`Security tokenExpirationMinutes (${exp}) is invalid. Must be an integer between 1 and 525600 minutes (up to 1 year).`);
      }
    }

    if (security.corsAllowedOrigins !== undefined) {
      if (!Array.isArray(security.corsAllowedOrigins)) {
        errors.push('Security corsAllowedOrigins must be an array of origin strings.');
      } else {
        for (const origin of security.corsAllowedOrigins) {
          if (typeof origin !== 'string' || origin.trim() === '') {
            errors.push('Security corsAllowedOrigins must not contain empty or blank strings.');
          } else if (origin === '*') {
            errors.push('Wildcard origin "*" is prohibited for authenticated APIs using authorization headers.');
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ConfigValidationError(errors);
  }
}

/**
 * Returns true if Spring Security & JWT is enabled in either config.security or config.options.security.
 */
export function isSecurityEnabled(config: ProjectConfig): boolean {
  return Boolean(config.security?.enabled || config.options?.security?.enabled);
}

/**
 * Resolves the active SecurityConfig with defaults.
 */
export function resolveSecurityConfig(config: ProjectConfig) {
  const raw = config.security ?? config.options?.security;
  if (!raw || !raw.enabled) {
    return {
      enabled: false,
      jwtSecretEnvVar: 'JWT_SECRET',
      tokenExpirationMinutes: 60,
      enableRegistration: true,
      corsAllowedOrigins: []
    };
  }

  return {
    enabled: true,
    jwtSecretEnvVar: raw.jwtSecretEnvVar?.trim() || 'JWT_SECRET',
    tokenExpirationMinutes: raw.tokenExpirationMinutes ?? 60,
    enableRegistration: raw.enableRegistration !== false,
    corsAllowedOrigins: raw.corsAllowedOrigins ?? ['http://localhost:3000', 'http://localhost:5173']
  };
}
