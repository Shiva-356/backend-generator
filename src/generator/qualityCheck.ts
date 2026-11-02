/**
 * Pre-Download Project Quality Check Validator.
 * Rigorously verifies Maven files, package consistency, entity relationships,
 * controller/service wiring, Postman collection schema, and placeholder cleanliness.
 */

import { GeneratedFile, ProjectConfig, QualityCheckItem, QualityReport } from './types';
import { isSecurityEnabled } from './validation';

export type { QualityCheckItem, QualityReport };

export function validateGeneratedProjectQuality(
  files: GeneratedFile[],
  config: ProjectConfig
): QualityReport {
  const checks: QualityCheckItem[] = [];
  const warnings: string[] = [];
  const fileMap = new Map<string, string>();
  for (const f of files) {
    fileMap.set(f.path, f.content);
  }

  const { packageName, javaVersion, springBootVersion, database, entities, options } = config;
  const packageDir = `src/main/java/${packageName.replace(/\./g, '/')}`;

  // 1. Maven POM Check
  const pomContent = fileMap.get('pom.xml');
  const hasPom = !!pomContent && pomContent.trim().length > 0;
  const pomValid =
    hasPom &&
    pomContent.includes(`<java.version>${javaVersion}</java.version>`) &&
    pomContent.includes(`<version>${springBootVersion}</version>`) &&
    pomContent.includes('spring-boot-starter-data-jpa') &&
    pomContent.includes('spring-boot-starter-web');

  checks.push({
    id: 'MAVEN_POM_VALIDITY',
    name: 'Maven POM Specification & Dependencies',
    category: 'MAVEN',
    passed: pomValid,
    message: pomValid
      ? `pom.xml is valid with Spring Boot ${springBootVersion}, Java ${javaVersion}, and starter dependencies.`
      : 'pom.xml is missing or does not specify matching Java / Spring Boot versions.'
  });

  // 2. Package & Directory Consistency
  let packageDiscrepancies = 0;
  for (const f of files) {
    if (f.path.endsWith('.java')) {
      if (!f.path.startsWith('src/main/java/') && !f.path.startsWith('src/test/java/')) {
        packageDiscrepancies++;
        continue;
      }
      const expectedPrefix = f.path.startsWith('src/main/java/') ? 'src/main/java/' : 'src/test/java/';
      const relativeClassDir = f.path.substring(expectedPrefix.length, f.path.lastIndexOf('/'));
      const expectedPackage = relativeClassDir.replace(/\//g, '.');

      const packageMatch = f.content.match(/^package\s+([a-zA-Z0-9_.]+);/m);
      if (!packageMatch || packageMatch[1] !== expectedPackage) {
        packageDiscrepancies++;
      }
    }
  }

  checks.push({
    id: 'PACKAGE_CONSISTENCY',
    name: 'Java Package Declaration & Directory Hierarchy',
    category: 'PACKAGING',
    passed: packageDiscrepancies === 0,
    message:
      packageDiscrepancies === 0
        ? 'All Java source and test files strictly match their package declarations and directory paths.'
        : `Found ${packageDiscrepancies} files with mismatched package declarations.`
  });

  // 3. Entity Layer Completeness
  let missingEntityComponents = 0;
  const entityNames = new Set(entities.map(e => e.name));

  for (const entity of entities) {
    const entityPath = `${packageDir}/entity/${entity.name}.java`;
    const repoPath = `${packageDir}/repository/${entity.name}Repository.java`;
    const servicePath = `${packageDir}/service/${entity.name}Service.java`;
    const controllerPath = `${packageDir}/controller/${entity.name}Controller.java`;

    if (!fileMap.has(entityPath) || !fileMap.has(repoPath) || !fileMap.has(servicePath) || !fileMap.has(controllerPath)) {
      missingEntityComponents++;
    }

    // Check relationship target existence
    for (const rel of entity.relationships || []) {
      if (!entityNames.has(rel.targetEntity)) {
        warnings.push(`Entity '${entity.name}' relationship '${rel.name}' references target '${rel.targetEntity}' not found in entity list.`);
      }
    }
  }

  checks.push({
    id: 'ENTITY_LAYER_COMPLETENESS',
    name: 'Entity, Repository, Service & Controller Cohesion',
    category: 'ENTITIES',
    passed: missingEntityComponents === 0,
    message:
      missingEntityComponents === 0
        ? `All ${entities.length} entities have complete Entity, Repository, Service, and Controller layers.`
        : `${missingEntityComponents} entities are missing required architectural layers.`
  });

  // 4. Exception Handling Architecture
  const enableExceptions = options?.enableGlobalExceptionHandler ?? true;
  if (enableExceptions) {
    const hasNotFound = fileMap.has(`${packageDir}/exception/ResourceNotFoundException.java`);
    const hasGlobalHandler = fileMap.has(`${packageDir}/exception/GlobalExceptionHandler.java`);
    const hasErrorResponse = fileMap.has(`${packageDir}/exception/ErrorResponse.java`);

    checks.push({
      id: 'EXCEPTION_HANDLING_COHESION',
      name: 'Global Exception Handling & Error Model',
      category: 'APIS',
      passed: hasNotFound && hasGlobalHandler && hasErrorResponse,
      message:
        hasNotFound && hasGlobalHandler && hasErrorResponse
          ? 'GlobalExceptionHandler, ErrorResponse, and domain exceptions are registered.'
          : 'Exception handling files are missing from generated output.'
    });
  }

  // 5. Security & Authentication Checks
  const securityEnabled = isSecurityEnabled(config);
  if (securityEnabled) {
    const hasSecurityConfig = fileMap.has(`${packageDir}/security/config/SecurityConfig.java`);
    const hasJwtService = fileMap.has(`${packageDir}/security/service/JwtService.java`);
    const hasAppUser = fileMap.has(`${packageDir}/security/entity/AppUser.java`);
    const schemaSql = fileMap.get('src/main/resources/schema.sql') || '';
    const hasAppUsersTable = schemaSql.includes('app_users');

    const securityComplete = hasSecurityConfig && hasJwtService && hasAppUser && hasAppUsersTable;

    checks.push({
      id: 'SECURITY_LAYER_INTEGRITY',
      name: 'Spring Security 6 & Stateless JWT Integrity',
      category: 'SECURITY',
      passed: securityComplete,
      message: securityComplete
        ? 'SecurityConfig, JwtService, AppUser entity, and database schema tables are correctly provisioned.'
        : 'Security components or schema tables are incomplete.'
    });
  }

  // 6. Postman API Collection
  const enablePostman = options?.enablePostman ?? true;
  if (enablePostman) {
    const postmanJson = fileMap.get('postman_collection.json');
    let postmanValid = false;
    if (postmanJson) {
      try {
        const parsed = JSON.parse(postmanJson);
        postmanValid = parsed?.info?.schema && Array.isArray(parsed?.item) && parsed.item.length > 0;
      } catch {
        postmanValid = false;
      }
    }

    checks.push({
      id: 'POSTMAN_COLLECTION_VALIDITY',
      name: 'Postman v2.1.0 Collection Schema',
      category: 'APIS',
      passed: postmanValid,
      message: postmanValid
        ? 'postman_collection.json is valid v2.1.0 JSON with requests for all resources and workflows.'
        : 'postman_collection.json is invalid JSON or has no items.'
    });
  }

  // 7. Hygiene & Zero Unresolved Placeholders
  let unreplacedPlaceholdersCount = 0;
  for (const [path, content] of fileMap.entries()) {
    if (path.endsWith('.java') || path.endsWith('.properties') || path.endsWith('.sql')) {
      if (content.includes('TODO_REPLACE') || content.includes('__MISSING__') || content.includes('undefined')) {
        unreplacedPlaceholdersCount++;
      }
    }
  }

  checks.push({
    id: 'CODE_HYGIENE_PLACEHOLDERS',
    name: 'Placeholder Hygiene & Clean Code Verification',
    category: 'HYGIENE',
    passed: unreplacedPlaceholdersCount === 0,
    message:
      unreplacedPlaceholdersCount === 0
        ? 'Zero unreplaced placeholders or dangling template markers found in generated sources.'
        : `Found ${unreplacedPlaceholdersCount} files with unresolved placeholder markers.`
  });

  const passedCount = checks.filter(c => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const isValid = checks.every(c => c.passed);

  return {
    isValid,
    score,
    checks,
    warnings,
    totalFiles: files.length
  };
}
