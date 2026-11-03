/**
 * Automated Verification Pipeline for Generated Spring Boot Projects.
 *
 * Generates projects across the representative configuration matrix,
 * packages them into production ZIP archives, extracts them into isolated
 * temporary directories, validates project structure, and attempts native
 * Maven compilation and testing if JDK and Maven are installed.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync, spawnSync } from 'node:child_process';
import JSZip from 'jszip';
import {
  ProjectConfig,
  generateSpringBootProject,
  packageProjectToZip,
  isSecurityEnabled
} from '../src/generator/index';

export type CheckStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT RUN' | 'NOT VERIFIED';

export interface MatrixResult {
  id: string;
  name: string;
  database: string;
  securityEnabled: boolean;
  generation: CheckStatus;
  zipPackaging: CheckStatus;
  extractionAndStructure: CheckStatus;
  mavenCommand: string;
  mavenExitCode: number | null;
  compilation: CheckStatus;
  tests: CheckStatus;
  errorSummary?: string;
}

// -----------------------------------------------------------------------------
// Representative Configuration Matrix (Configurations A through H)
// -----------------------------------------------------------------------------

export const REPRESENTATIVE_MATRIX: { id: string; name: string; config: ProjectConfig }[] = [
  {
    id: 'CONFIG_A',
    name: 'Minimal Project (H2, Single Entity, No Security)',
    config: {
      projectName: 'minimal-service',
      groupId: 'com.example.minimal',
      artifactId: 'minimal-service',
      packageName: 'com.example.minimal',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      security: { enabled: false },
      entities: [
        {
          name: 'Task',
          fields: [
            { name: 'title', type: 'String', required: true },
            { name: 'completed', type: 'Boolean', defaultValue: 'false' }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_B',
    name: 'Multiple Entities (MySQL, DTOs & Validation, No Security)',
    config: {
      projectName: 'inventory-service',
      groupId: 'com.example.inventory',
      artifactId: 'inventory-service',
      packageName: 'com.example.inventory',
      javaVersion: '21',
      springBootVersion: '3.4.0',
      database: 'mysql',
      security: { enabled: false },
      options: {
        enableDtos: true,
        enableValidation: true,
        enableGlobalExceptionHandler: true
      },
      entities: [
        {
          name: 'Category',
          fields: [
            { name: 'name', type: 'String', required: true, unique: true },
            { name: 'description', type: 'String', length: 500 }
          ]
        },
        {
          name: 'Warehouse',
          fields: [
            { name: 'code', type: 'String', required: true, unique: true },
            { name: 'location', type: 'String' },
            { name: 'capacity', type: 'Integer' }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_C',
    name: 'Entity Relationships (PostgreSQL, 1:1, 1:M, M:1, M:M)',
    config: {
      projectName: 'ecommerce-service',
      groupId: 'com.example.ecommerce',
      artifactId: 'ecommerce-service',
      packageName: 'com.example.ecommerce',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'postgresql',
      security: { enabled: false },
      entities: [
        {
          name: 'Customer',
          fields: [
            { name: 'name', type: 'String', required: true },
            { name: 'email', type: 'String', required: true, unique: true }
          ],
          relationships: [
            {
              name: 'orders',
              type: 'ONE_TO_MANY',
              targetEntity: 'Order',
              mappedBy: 'customer'
            },
            {
              name: 'profile',
              type: 'ONE_TO_ONE',
              targetEntity: 'CustomerProfile',
              isOwningSide: true,
              joinColumnName: 'profile_id'
            }
          ]
        },
        {
          name: 'CustomerProfile',
          fields: [
            { name: 'bio', type: 'String' },
            { name: 'loyaltyPoints', type: 'Integer' }
          ],
          relationships: [
            {
              name: 'customer',
              type: 'ONE_TO_ONE',
              targetEntity: 'Customer',
              isOwningSide: false,
              mappedBy: 'profile'
            }
          ]
        },
        {
          name: 'Order',
          fields: [
            { name: 'orderNumber', type: 'String', required: true, unique: true },
            { name: 'totalAmount', type: 'BigDecimal', precision: 12, scale: 2 }
          ],
          relationships: [
            {
              name: 'customer',
              type: 'MANY_TO_ONE',
              targetEntity: 'Customer',
              required: true,
              joinColumnName: 'customer_id'
            },
            {
              name: 'tags',
              type: 'MANY_TO_MANY',
              targetEntity: 'Tag',
              isOwningSide: true,
              joinTableName: 'order_tags',
              joinColumnName: 'order_id',
              joinTableInverseColumnName: 'tag_id'
            }
          ]
        },
        {
          name: 'Tag',
          fields: [
            { name: 'label', type: 'String', required: true, unique: true }
          ],
          relationships: [
            {
              name: 'orders',
              type: 'MANY_TO_MANY',
              targetEntity: 'Order',
              isOwningSide: false,
              mappedBy: 'tags'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_D',
    name: 'PostgreSQL Datasource Configuration',
    config: {
      projectName: 'pg-backend',
      groupId: 'com.example.pg',
      artifactId: 'pg-backend',
      packageName: 'com.example.pg',
      javaVersion: '17',
      springBootVersion: '3.2.5',
      database: 'postgresql',
      security: { enabled: false },
      entities: [
        {
          name: 'SensorData',
          fields: [
            { name: 'reading', type: 'Double', required: true },
            { name: 'recordedAt', type: 'LocalDateTime' }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_E',
    name: 'MySQL Datasource Configuration',
    config: {
      projectName: 'mysql-backend',
      groupId: 'com.example.mysql',
      artifactId: 'mysql-backend',
      packageName: 'com.example.mysql',
      javaVersion: '21',
      springBootVersion: '3.3.0',
      database: 'mysql',
      security: { enabled: false },
      entities: [
        {
          name: 'Invoice',
          fields: [
            { name: 'invoiceCode', type: 'String', required: true },
            { name: 'amount', type: 'BigDecimal', precision: 10, scale: 2 },
            { name: 'issueDate', type: 'LocalDate' }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_F',
    name: 'H2 In-Memory Configuration with Console',
    config: {
      projectName: 'h2-backend',
      groupId: 'com.example.h2',
      artifactId: 'h2-backend',
      packageName: 'com.example.h2',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      security: { enabled: false },
      entities: [
        {
          name: 'Note',
          fields: [
            { name: 'content', type: 'String', required: true }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_G',
    name: 'Spring Security 6 & JWT Enabled (Full Auth + Tests)',
    config: {
      projectName: 'secure-app',
      groupId: 'com.example.secure',
      artifactId: 'secure-app',
      packageName: 'com.example.secure',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'postgresql',
      security: {
        enabled: true,
        jwtSecretEnvVar: 'JWT_SECRET',
        tokenExpirationMinutes: 60
      },
      entities: [
        {
          name: 'Document',
          fields: [
            { name: 'title', type: 'String', required: true },
            { name: 'content', type: 'String' }
          ]
        }
      ]
    }
  },
  {
    id: 'CONFIG_H',
    name: 'Spring Security Explicitly Disabled',
    config: {
      projectName: 'open-app',
      groupId: 'com.example.open',
      artifactId: 'open-app',
      packageName: 'com.example.open',
      javaVersion: '21',
      springBootVersion: '3.4.0',
      database: 'mysql',
      security: { enabled: false },
      entities: [
        {
          name: 'PublicAnnouncement',
          fields: [
            { name: 'headline', type: 'String', required: true },
            { name: 'publishedAt', type: 'LocalDate' }
          ]
        }
      ]
    }
  }
];

// -----------------------------------------------------------------------------
// Toolchain Detection (JDK & Maven)
// -----------------------------------------------------------------------------

export function isToolchainAvailable(): { available: boolean; javaVersion?: string; javaMajorVersion?: number; mavenVersion?: string; reason?: string } {
  try {
    const javaCheck = spawnSync('java', ['-version'], { stdio: 'pipe', encoding: 'utf8' });
    if (javaCheck.error || javaCheck.status !== 0) {
      return { available: false, reason: 'Java JDK executable "java" not found in PATH' };
    }

    const mvnCheck = spawnSync('mvn', ['-v'], { stdio: 'pipe', encoding: 'utf8' });
    if (mvnCheck.error || mvnCheck.status !== 0) {
      return { available: false, reason: 'Maven executable "mvn" not found in PATH' };
    }

    const javaVer = (javaCheck.stderr || javaCheck.stdout || '').split('\n')[0];
    const mvnVer = (mvnCheck.stdout || '').split('\n')[0];
    const match = javaVer.match(/(?:version\s+"(\d+)|openjdk\s+(\d+)|java\s+(\d+))/i);
    const javaMajorVersion = match ? parseInt(match[1] || match[2] || match[3], 10) : undefined;

    return { available: true, javaVersion: javaVer, javaMajorVersion, mavenVersion: mvnVer };
  } catch (err) {
    return { available: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

// -----------------------------------------------------------------------------
// Extraction & Structural Validation
// -----------------------------------------------------------------------------

export async function extractAndValidateZip(
  zipBytes: Uint8Array,
  config: ProjectConfig,
  targetDir: string
): Promise<{ rootDir: string; filePaths: string[] }> {
  const zip = await JSZip.loadAsync(zipBytes);
  const filePaths: string[] = [];

  const expectedRoot = config.projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '') || 'spring-boot-project';

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;

    // Check forward slashes and root prefix
    if (!relativePath.startsWith(`${expectedRoot}/`)) {
      throw new Error(`File in ZIP does not start with expected root directory "${expectedRoot}/": ${relativePath}`);
    }

    const diskPath = path.join(targetDir, relativePath);
    fs.mkdirSync(path.dirname(diskPath), { recursive: true });

    const content = await zipEntry.async('nodebuffer');
    fs.writeFileSync(diskPath, content);
    filePaths.push(relativePath);
  }

  const projectRoot = path.join(targetDir, expectedRoot);
  if (!fs.existsSync(projectRoot)) {
    throw new Error(`Extracted root directory not found at ${projectRoot}`);
  }

  // Required file validation
  const requiredFiles = [
    'pom.xml',
    '.gitignore',
    'README.md',
    'src/main/resources/application.properties',
    'src/main/resources/schema.sql'
  ];

  for (const req of requiredFiles) {
    const fullPath = path.join(projectRoot, req);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Required file "${req}" is missing from extracted project.`);
    }
    const stat = fs.statSync(fullPath);
    if (stat.size === 0) {
      throw new Error(`Required file "${req}" is empty (0 bytes).`);
    }
  }

  // Security files validation
  const securityOn = isSecurityEnabled(config);
  const pkgPath = config.packageName.replace(/\./g, '/');

  if (securityOn) {
    const requiredSecFiles = [
      `src/main/java/${pkgPath}/security/entity/AppUser.java`,
      `src/main/java/${pkgPath}/security/repository/AppUserRepository.java`,
      `src/main/java/${pkgPath}/security/service/JwtService.java`,
      `src/main/java/${pkgPath}/security/config/SecurityConfig.java`,
      `src/test/java/${pkgPath}/security/JwtServiceTest.java`
    ];
    for (const secFile of requiredSecFiles) {
      const fullPath = path.join(projectRoot, secFile);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Security-enabled project missing file: ${secFile}`);
      }
    }

    // Verify schema contains app_users
    const schemaContent = fs.readFileSync(path.join(projectRoot, 'src/main/resources/schema.sql'), 'utf8');
    if (!schemaContent.includes('app_users')) {
      throw new Error('Security-enabled project missing "app_users" table in schema.sql');
    }
  } else {
    // Security disabled: ensure NO security files exist
    const secDir = path.join(projectRoot, `src/main/java/${pkgPath}/security`);
    if (fs.existsSync(secDir)) {
      throw new Error('Security-disabled project unexpectedly contains security package directory.');
    }
    const schemaContent = fs.readFileSync(path.join(projectRoot, 'src/main/resources/schema.sql'), 'utf8');
    if (schemaContent.includes('app_users')) {
      throw new Error('Security-disabled project unexpectedly contains "app_users" in schema.sql');
    }
  }

  return { rootDir: projectRoot, filePaths };
}

// -----------------------------------------------------------------------------
// Verification Runner for a Single Configuration
// -----------------------------------------------------------------------------

export async function verifyConfiguration(
  entry: { id: string; name: string; config: ProjectConfig },
  toolchain: { available: boolean; javaMajorVersion?: number; reason?: string }
): Promise<MatrixResult> {
  // Determine effective Java version based on environment override or host JDK ceiling
  let effectiveJavaVersion = entry.config.javaVersion;
  if (process.env.TARGET_JAVA_VERSION === '17' || process.env.TARGET_JAVA_VERSION === '21') {
    effectiveJavaVersion = process.env.TARGET_JAVA_VERSION;
  } else if (toolchain.javaMajorVersion && parseInt(entry.config.javaVersion, 10) > toolchain.javaMajorVersion) {
    effectiveJavaVersion = toolchain.javaMajorVersion >= 21 ? '21' : '17';
  }

  const effectiveConfig: ProjectConfig = {
    ...entry.config,
    javaVersion: effectiveJavaVersion
  };

  const result: MatrixResult = {
    id: entry.id,
    name: entry.name,
    database: effectiveConfig.database,
    securityEnabled: isSecurityEnabled(effectiveConfig),
    generation: 'NOT RUN',
    zipPackaging: 'NOT RUN',
    extractionAndStructure: 'NOT RUN',
    mavenCommand: 'mvn -B -ntp test-compile test',
    mavenExitCode: null,
    compilation: 'NOT RUN',
    tests: 'NOT RUN'
  };

  const tempBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), `sb-verify-${entry.id}-`));

  try {
    // Step 1: In-Memory Project Generation
    let project;
    try {
      project = generateSpringBootProject(effectiveConfig);
      result.generation = 'PASS';
    } catch (genErr) {
      result.generation = 'FAIL';
      result.errorSummary = `Generation failed: ${genErr instanceof Error ? genErr.message : String(genErr)}`;
      return result;
    }

    // Step 2: ZIP Packaging
    let zipBytes: Uint8Array;
    try {
      zipBytes = await packageProjectToZip(project);
      result.zipPackaging = 'PASS';
    } catch (zipErr) {
      result.zipPackaging = 'FAIL';
      result.errorSummary = `ZIP packaging failed: ${zipErr instanceof Error ? zipErr.message : String(zipErr)}`;
      return result;
    }

    // Step 3: Extraction and Structural Validation
    let projectRoot: string;
    try {
      const extracted = await extractAndValidateZip(zipBytes, effectiveConfig, tempBaseDir);
      projectRoot = extracted.rootDir;
      result.extractionAndStructure = 'PASS';
    } catch (structErr) {
      result.extractionAndStructure = 'FAIL';
      result.errorSummary = `Extraction/Structure validation failed: ${structErr instanceof Error ? structErr.message : String(structErr)}`;
      return result;
    }

    // Step 4: Real Maven Compilation and Test (if toolchain available)
    if (!toolchain.available) {
      result.compilation = 'BLOCKED';
      result.tests = 'BLOCKED';
      result.errorSummary = `Native verification blocked: ${toolchain.reason}`;
      return result;
    }

    // Run Maven inside the extracted project root with isolated timeout
    try {
      const mvnRes = spawnSync('mvn', ['-B', '-ntp', 'test-compile', 'test'], {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 180000 // 3 minutes timeout
      });

      result.mavenExitCode = mvnRes.status;

      if (mvnRes.status === 0) {
        result.compilation = 'PASS';
        result.tests = 'PASS';
      } else {
        const fullOutput = (mvnRes.stdout || '') + '\n' + (mvnRes.stderr || '');
        // Preserve build output to disk for CI diagnostics
        try {
          fs.writeFileSync(path.join(tempBaseDir, 'maven-failure.log'), fullOutput, 'utf8');
        } catch (_) {}

        if (fullOutput.includes('[ERROR] COMPILATION ERROR') || fullOutput.includes('Compilation failure')) {
          result.compilation = 'FAIL';
          result.tests = 'NOT RUN';
          result.errorSummary = 'Maven Java compilation failure.';
        } else if (fullOutput.includes('There are test failures') || fullOutput.includes('Failed tests:')) {
          result.compilation = 'PASS';
          result.tests = 'FAIL';
          result.errorSummary = 'Generated Java tests failed.';
        } else {
          result.compilation = 'FAIL';
          result.tests = 'NOT RUN';
          result.errorSummary = `Maven execution failed with exit code ${mvnRes.status}.`;
        }
      }
    } catch (mvnErr) {
      result.compilation = 'FAIL';
      result.tests = 'NOT RUN';
      result.errorSummary = `Failed to invoke Maven: ${mvnErr instanceof Error ? mvnErr.message : String(mvnErr)}`;
      try {
        fs.writeFileSync(path.join(tempBaseDir, 'maven-failure.log'), String(mvnErr), 'utf8');
      } catch (_) {}
    }

  } finally {
    // Clean up temporary directory ONLY on success; preserve on failure for CI diagnostic upload
    try {
      const isFailed =
        result.generation === 'FAIL' ||
        result.zipPackaging === 'FAIL' ||
        result.extractionAndStructure === 'FAIL' ||
        result.compilation === 'FAIL' ||
        result.tests === 'FAIL';

      if (!isFailed && fs.existsSync(tempBaseDir)) {
        fs.rmSync(tempBaseDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn(`Warning: Could not remove temporary directory ${tempBaseDir}:`, cleanupErr);
    }
  }

  return result;
}

// -----------------------------------------------------------------------------
// Main CLI Execution
// -----------------------------------------------------------------------------

export async function runAllVerifications(): Promise<{ results: MatrixResult[]; allPassed: boolean }> {
  console.log('======================================================================');
  console.log('Automated Verification Pipeline: Representative Spring Boot Matrix');
  console.log('======================================================================\n');

  const toolchain = isToolchainAvailable();
  if (toolchain.available) {
    console.log(`Toolchain detected:`);
    console.log(` - ${toolchain.javaVersion}`);
    console.log(` - ${toolchain.mavenVersion}\n`);
  } else {
    console.log(`Toolchain Notice:`);
    console.log(` - Java/Maven native execution: BLOCKED (${toolchain.reason})`);
    console.log(` - Verification will thoroughly test Generation, Packaging, and File Structure.\n`);
  }

  const results: MatrixResult[] = [];
  let anyFailure = false;

  for (const item of REPRESENTATIVE_MATRIX) {
    process.stdout.write(`Verifying [${item.id}] ${item.name}... `);
    const result = await verifyConfiguration(item, toolchain);
    results.push(result);

    const isSuccess =
      result.generation === 'PASS' &&
      result.zipPackaging === 'PASS' &&
      result.extractionAndStructure === 'PASS' &&
      (result.compilation === 'PASS' || result.compilation === 'BLOCKED') &&
      (result.tests === 'PASS' || result.tests === 'BLOCKED');

    if (isSuccess) {
      console.log(`[PASS]`);
    } else {
      console.log(`[FAIL]`);
      anyFailure = true;
    }
  }

  console.log('\n======================================================================');
  console.log('Verification Matrix Summary');
  console.log('======================================================================');
  console.table(
    results.map(r => ({
      ID: r.id,
      Database: r.database,
      Security: r.securityEnabled ? 'ENABLED' : 'DISABLED',
      Generation: r.generation,
      Packaging: r.zipPackaging,
      Structure: r.extractionAndStructure,
      Compilation: r.compilation,
      Tests: r.tests
    }))
  );

  return { results, allPassed: !anyFailure };
}

// If executed directly from CLI (e.g. `tsx scripts/verify-generated-projects.ts`)
if (process.argv[1] && (process.argv[1].endsWith('verify-generated-projects.ts') || process.argv[1].endsWith('verify-generated-projects.js'))) {
  runAllVerifications()
    .then(({ allPassed }) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal verification runner error:', err);
      process.exit(1);
    });
}
