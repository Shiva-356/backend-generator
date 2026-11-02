import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSpringBootProject,
  validateProjectConfig,
  ConfigValidationError,
  DOMAIN_TEMPLATES,
  ProjectConfig,
  downloadProjectZip,
  packageProjectToZip
} from './index';

describe('Phase 7: Frontend & Full Integration Pipeline Tests', () => {
  const DEFAULT_CONFIG: ProjectConfig = {
    projectName: 'demo-backend',
    groupId: 'com.example',
    artifactId: 'demo-backend',
    packageName: 'com.example.demobackend',
    description: 'Production-ready Spring Boot backend with JPA persistence, REST APIs, and Spring Security.',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    options: {
      enableDtos: true,
      enableValidation: true,
      enableGlobalExceptionHandler: true,
      serverPort: 8080
    },
    security: {
      enabled: true,
      jwtSecretEnvVar: 'JWT_SECRET',
      tokenExpirationMinutes: 1440,
      enableRegistration: true,
      corsAllowedOrigins: ['http://localhost:3000', 'http://localhost:5173']
    },
    entities: [
      {
        name: 'Product',
        tableName: 'products',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'name', type: 'String', required: true, length: 100 },
          { name: 'sku', type: 'String', required: true, unique: true, length: 50 },
          { name: 'price', type: 'BigDecimal', required: true, precision: 10, scale: 2 },
          { name: 'stockQuantity', type: 'Integer', required: true, min: 0 },
          { name: 'active', type: 'Boolean', required: true, defaultValue: 'true' }
        ],
        relationships: [
          {
            name: 'category',
            type: 'MANY_TO_ONE',
            targetEntity: 'Category',
            required: false,
            isOwningSide: true,
            joinColumnName: 'category_id'
          }
        ]
      },
      {
        name: 'Category',
        tableName: 'categories',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [
          { name: 'name', type: 'String', required: true, unique: true, length: 50 },
          { name: 'description', type: 'String', required: false, length: 255 }
        ],
        relationships: [
          {
            name: 'products',
            type: 'ONE_TO_MANY',
            targetEntity: 'Product',
            mappedBy: 'category'
          }
        ]
      }
    ]
  };

  test('1. Default frontend project configuration validates cleanly', () => {
    assert.doesNotThrow(() => {
      validateProjectConfig(DEFAULT_CONFIG);
    });
  });

  test('2. Default project generates complete source files including security, JPA, and DTOs', () => {
    const project = generateSpringBootProject(DEFAULT_CONFIG);
    assert.ok(project.files.length >= 20, 'Should generate at least 20 files');
    assert.equal(project.summary.projectName, 'demo-backend');
    assert.equal(project.summary.entityCount, 2);
    assert.equal(project.summary.securityEnabled, true);

    const paths = project.files.map((f) => f.path);
    assert.ok(paths.includes('pom.xml'));
    assert.ok(paths.includes('README.md'));
    assert.ok(paths.includes('src/main/resources/application.properties'));
    assert.ok(paths.includes('src/main/resources/schema.sql'));
    assert.ok(paths.some((p) => p.endsWith('Product.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductRepository.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductService.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductController.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductRequestDTO.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductResponseDTO.java')));
    assert.ok(paths.some((p) => p.endsWith('ProductMapper.java')));
    assert.ok(paths.some((p) => p.endsWith('SecurityConfig.java')));
    assert.ok(paths.some((p) => p.endsWith('JwtAuthenticationFilter.java')));
    assert.ok(paths.some((p) => p.endsWith('AuthController.java')));
  });

  test('3. All 7 domain templates can be applied and generated without errors', () => {
    for (const [key, tmpl] of Object.entries(DOMAIN_TEMPLATES)) {
      const cleanKey = key.toLowerCase().replace(/_/g, '-');
      const config: ProjectConfig = {
        projectName: `${cleanKey}-backend`,
        groupId: 'com.example',
        artifactId: `${cleanKey}-backend`,
        packageName: `com.example.${cleanKey.replace(/-/g, '')}`,
        javaVersion: '17',
        springBootVersion: '3.3.0',
        database: 'postgresql',
        entities: tmpl.defaultEntities
      };

      assert.doesNotThrow(() => {
        validateProjectConfig(config);
      }, `Domain template ${key} should validate cleanly`);

      const result = generateSpringBootProject(config);
      assert.ok(
        result.files.length >= tmpl.defaultEntities.length,
        `Template ${key} should generate appropriate files`
      );
    }
  });

  test('4. Custom entity with all 8 supported data types generates valid model', () => {
    const config: ProjectConfig = {
      ...DEFAULT_CONFIG,
      entities: [
        {
          name: 'AllTypesRecord',
          tableName: 'all_types_records',
          idType: 'Long',
          idGeneration: 'IDENTITY',
          fields: [
            { name: 'strField', type: 'String', required: true, length: 150 },
            { name: 'intField', type: 'Integer', required: true, min: 1, max: 100 },
            { name: 'longField', type: 'Long', required: true },
            { name: 'doubleField', type: 'Double', required: false },
            { name: 'decimalField', type: 'BigDecimal', required: true, precision: 12, scale: 4 },
            { name: 'boolField', type: 'Boolean', required: true },
            { name: 'dateField', type: 'LocalDate', required: false },
            { name: 'dateTimeField', type: 'LocalDateTime', required: true }
          ]
        }
      ]
    };

    assert.doesNotThrow(() => validateProjectConfig(config));
    const project = generateSpringBootProject(config);
    const entityFile = project.files.find((f) => f.path.endsWith('AllTypesRecord.java'));
    assert.ok(entityFile, 'Entity file should exist');

    assert.ok(entityFile.content.includes('private String strField;'));
    assert.ok(entityFile.content.includes('private Integer intField;'));
    assert.ok(entityFile.content.includes('private Long longField;'));
    assert.ok(entityFile.content.includes('private Double doubleField;'));
    assert.ok(entityFile.content.includes('import java.math.BigDecimal;'));
    assert.ok(entityFile.content.includes('private BigDecimal decimalField;'));
    assert.ok(entityFile.content.includes('private Boolean boolField;'));
    assert.ok(entityFile.content.includes('import java.time.LocalDate;'));
    assert.ok(entityFile.content.includes('private LocalDate dateField;'));
    assert.ok(entityFile.content.includes('private LocalDateTime dateTimeField;'));
  });

  test('5. Real-time validation catches invalid identifiers and produces descriptive error messages', () => {
    const invalidConfig: ProjectConfig = {
      ...DEFAULT_CONFIG,
      projectName: '123-invalid-start',
      groupId: 'invalid..group',
      packageName: 'class.int.bad',
      entities: [
        {
          name: 'class', // reserved keyword
          fields: [
            { name: 'void', type: 'String' } // reserved keyword
          ]
        }
      ]
    };

    assert.throws(
      () => validateProjectConfig(invalidConfig),
      (err: any) => {
        assert.ok(err instanceof ConfigValidationError);
        assert.ok(err.errors.length >= 3, 'Should report multiple validation errors');
        assert.ok(err.errors.some((e: string) => e.includes('reserved keyword')));
        return true;
      }
    );
  });

  test('6. In-memory ZIP packaging succeeds and creates valid archive bytes', async () => {
    const zipBytes = await packageProjectToZip(DEFAULT_CONFIG);
    assert.ok(zipBytes instanceof Uint8Array);
    assert.ok(zipBytes.byteLength > 10000, 'ZIP byte length should exceed 10KB');

    // Test downloadProjectZip wrapper
    const downloadResult = await downloadProjectZip(DEFAULT_CONFIG);
    assert.equal(downloadResult.filename, 'demo-backend.zip');
    assert.ok(downloadResult.sizeBytes > 10000);
  });

  test('7. Toggling security off dynamically purges all security classes, packages, and pom dependencies', () => {
    const disabledConfig: ProjectConfig = {
      ...DEFAULT_CONFIG,
      security: {
        enabled: false
      }
    };

    assert.doesNotThrow(() => validateProjectConfig(disabledConfig));
    const project = generateSpringBootProject(disabledConfig);

    assert.equal(project.summary.securityEnabled, false);
    const paths = project.files.map((f) => f.path);

    // Verify zero security files exist in the file collection
    assert.ok(!paths.some((p) => p.includes('/security/')), 'Zero security files should exist');
    assert.ok(!paths.some((p) => p.endsWith('AppUser.java')));
    assert.ok(!paths.some((p) => p.endsWith('SecurityConfig.java')));
    assert.ok(!paths.some((p) => p.endsWith('JwtService.java')));
    assert.ok(!paths.some((p) => p.endsWith('AuthController.java')));

    // Verify pom.xml has no security starter or JJWT
    const pom = project.files.find((f) => f.path === 'pom.xml')!;
    assert.ok(!pom.content.includes('spring-boot-starter-security'));
    assert.ok(!pom.content.includes('jjwt-api'));

    // Verify schema.sql has no app_users table
    const schema = project.files.find((f) => f.path.endsWith('schema.sql'))!;
    assert.ok(!schema.content.includes('app_users'));
  });
});

