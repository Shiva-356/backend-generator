import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSpringBootProject,
  exportProjectToZip,
  ProjectConfig,
  ConfigValidationError,
  getDomainTemplate,
  createProjectConfigFromTemplate,
  resolveTemplateKey
} from './index';
import { REPRESENTATIVE_MATRIX } from '../../scripts/verify-generated-projects';

// Helper to find a generated file by exact or partial path
function findFile(files: { path: string; content: string }[], pathPattern: string) {
  return files.find(f => f.path === pathPattern || f.path.endsWith(pathPattern));
}

test('1. Minimal project generation creates all required structure', () => {
  const config: ProjectConfig = {
    projectName: 'mini-service',
    groupId: 'com.acme',
    artifactId: 'mini-service',
    packageName: 'com.acme.mini',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [
      {
        name: 'Item',
        fields: [
          { name: 'title', type: 'String', required: true }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  assert.ok(project.files.length >= 10, 'Expected at least 10 generated files');
  assert.equal(project.summary.projectName, 'mini-service');
  assert.equal(project.summary.database, 'h2');
  assert.deepEqual(project.summary.entities, ['Item']);

  // Required root files
  assert.ok(findFile(project.files, 'pom.xml'), 'Missing pom.xml');
  assert.ok(findFile(project.files, 'README.md'), 'Missing README.md');
  assert.ok(findFile(project.files, '.gitignore'), 'Missing .gitignore');
  assert.ok(findFile(project.files, 'src/main/resources/application.properties'), 'Missing application.properties');
  assert.ok(findFile(project.files, 'src/main/resources/schema.sql'), 'Missing schema.sql');

  // Main application class
  const appFile = findFile(project.files, 'src/main/java/com/acme/mini/MiniServiceApplication.java');
  assert.ok(appFile, 'Missing Main Application class');
  assert.match(appFile.content, /@SpringBootApplication/);
  assert.match(appFile.content, /public class MiniServiceApplication/);
  assert.match(appFile.content, /SpringApplication\.run\(MiniServiceApplication\.class, args\);/);

  // Entity files
  assert.ok(findFile(project.files, 'src/main/java/com/acme/mini/entity/Item.java'));
  assert.ok(findFile(project.files, 'src/main/java/com/acme/mini/repository/ItemRepository.java'));
  assert.ok(findFile(project.files, 'src/main/java/com/acme/mini/service/ItemService.java'));
  assert.ok(findFile(project.files, 'src/main/java/com/acme/mini/controller/ItemController.java'));
});

test('2. Multiple entities are generated with correct package paths and names', () => {
  const config: ProjectConfig = {
    projectName: 'inventory-system',
    groupId: 'org.corp',
    artifactId: 'inventory',
    packageName: 'org.corp.inventory',
    javaVersion: '21',
    springBootVersion: '3.4.0',
    database: 'postgresql',
    entities: [
      {
        name: 'Warehouse',
        fields: [{ name: 'location', type: 'String', required: true }]
      },
      {
        name: 'Product',
        fields: [{ name: 'sku', type: 'String', required: true }]
      },
      {
        name: 'Supplier',
        fields: [{ name: 'companyName', type: 'String', required: true }]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  assert.equal(project.summary.entityCount, 3);

  for (const name of ['Warehouse', 'Product', 'Supplier']) {
    const entity = findFile(project.files, `src/main/java/org/corp/inventory/entity/${name}.java`);
    const repo = findFile(project.files, `src/main/java/org/corp/inventory/repository/${name}Repository.java`);
    const service = findFile(project.files, `src/main/java/org/corp/inventory/service/${name}Service.java`);
    const controller = findFile(project.files, `src/main/java/org/corp/inventory/controller/${name}Controller.java`);

    assert.ok(entity, `Missing entity for ${name}`);
    assert.ok(repo, `Missing repository for ${name}`);
    assert.ok(service, `Missing service for ${name}`);
    assert.ok(controller, `Missing controller for ${name}`);

    assert.match(entity.content, new RegExp(`public class ${name}`));
    assert.match(repo.content, new RegExp(`public interface ${name}Repository extends JpaRepository<${name}, Long>`));
    assert.match(service.content, new RegExp(`public class ${name}Service`));
    assert.match(controller.content, new RegExp(`public class ${name}Controller`));
  }
});

test('3. Supported field types generate correct Java types, imports, accessors, and SQL columns', () => {
  const config: ProjectConfig = {
    projectName: 'types-demo',
    groupId: 'com.demo',
    artifactId: 'types-demo',
    packageName: 'com.demo.types',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    entities: [
      {
        name: 'AllTypesEntity',
        fields: [
          { name: 'strField', type: 'String', length: 120, required: true },
          { name: 'intField', type: 'Integer', min: 1, max: 100 },
          { name: 'longField', type: 'Long' },
          { name: 'doubleField', type: 'Double' },
          { name: 'decimalField', type: 'BigDecimal', required: true },
          { name: 'boolField', type: 'Boolean', required: true },
          { name: 'dateField', type: 'LocalDate' },
          { name: 'dateTimeField', type: 'LocalDateTime' }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const entityFile = findFile(project.files, 'src/main/java/com/demo/types/entity/AllTypesEntity.java')!;
  assert.ok(entityFile);

  // Check imports
  assert.match(entityFile.content, /import java\.math\.BigDecimal;/);
  assert.match(entityFile.content, /import java\.time\.LocalDate;/);
  assert.match(entityFile.content, /import java\.time\.LocalDateTime;/);

  // Check field declarations & annotations
  assert.match(entityFile.content, /private String strField;/);
  assert.match(entityFile.content, /@Size\(max = 120/);
  assert.match(entityFile.content, /private Integer intField;/);
  assert.match(entityFile.content, /@Min\(value = 1/);
  assert.match(entityFile.content, /@Max\(value = 100/);
  assert.match(entityFile.content, /private Long longField;/);
  assert.match(entityFile.content, /private Double doubleField;/);
  assert.match(entityFile.content, /private BigDecimal decimalField;/);
  assert.match(entityFile.content, /private Boolean boolField;/);
  assert.match(entityFile.content, /private LocalDate dateField;/);
  assert.match(entityFile.content, /private LocalDateTime dateTimeField;/);

  // Check accessors
  assert.match(entityFile.content, /public String getStrField\(\)/);
  assert.match(entityFile.content, /public void setStrField\(String strField\)/);
  assert.match(entityFile.content, /public Boolean isBoolField\(\)/);
  assert.match(entityFile.content, /public void setBoolField\(Boolean boolField\)/);

  // Check schema.sql
  const sqlFile = findFile(project.files, 'src/main/resources/schema.sql')!;
  assert.match(sqlFile.content, /str_field VARCHAR\(120\) NOT NULL/);
  assert.match(sqlFile.content, /int_field INTEGER/);
  assert.match(sqlFile.content, /long_field BIGINT/);
  assert.match(sqlFile.content, /double_field DOUBLE PRECISION/);
  assert.match(sqlFile.content, /decimal_field DECIMAL\(19, 4\) NOT NULL/);
  assert.match(sqlFile.content, /bool_field BOOLEAN NOT NULL/);
  assert.match(sqlFile.content, /date_field DATE/);
  assert.match(sqlFile.content, /date_time_field TIMESTAMP/);
});

test('4. Different identifier types (Long, Integer, UUID, String) are properly handled', () => {
  const config: ProjectConfig = {
    projectName: 'id-test',
    groupId: 'com.demo',
    artifactId: 'id-test',
    packageName: 'com.demo.ids',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'mysql',
    entities: [
      {
        name: 'LongEntity',
        idType: 'Long',
        idGeneration: 'IDENTITY',
        fields: [{ name: 'name', type: 'String' }]
      },
      {
        name: 'UuidEntity',
        idType: 'UUID',
        idGeneration: 'AUTO',
        fields: [{ name: 'title', type: 'String' }]
      },
      {
        name: 'StringEntity',
        idType: 'String',
        idGeneration: 'NONE',
        fields: [{ name: 'code', type: 'String' }]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  // Long entity repo
  const longRepo = findFile(project.files, 'src/main/java/com/demo/ids/repository/LongEntityRepository.java')!;
  assert.match(longRepo.content, /JpaRepository<LongEntity, Long>/);

  // UUID entity
  const uuidEntity = findFile(project.files, 'src/main/java/com/demo/ids/entity/UuidEntity.java')!;
  assert.match(uuidEntity.content, /import java\.util\.UUID;/);
  assert.match(uuidEntity.content, /private UUID id;/);
  assert.match(uuidEntity.content, /public UUID getId\(\)/);

  const uuidRepo = findFile(project.files, 'src/main/java/com/demo/ids/repository/UuidEntityRepository.java')!;
  assert.match(uuidRepo.content, /import java\.util\.UUID;/);
  assert.match(uuidRepo.content, /JpaRepository<UuidEntity, UUID>/);

  const uuidController = findFile(project.files, 'src/main/java/com/demo/ids/controller/UuidEntityController.java')!;
  assert.match(uuidController.content, /@PathVariable\("id"\) UUID id/);

  // String entity
  const strRepo = findFile(project.files, 'src/main/java/com/demo/ids/repository/StringEntityRepository.java')!;
  assert.match(strRepo.content, /JpaRepository<StringEntity, String>/);
});

test('5. Invalid configuration is rejected with descriptive errors', () => {
  // Empty configuration
  assert.throws(() => {
    generateSpringBootProject(null as unknown as ProjectConfig);
  }, ConfigValidationError);

  // Malformed package name
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'bad-pkg-project',
      groupId: 'com.example',
      artifactId: 'bad-pkg-project',
      packageName: 'com.example.123bad-package',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [{ name: 'Item', fields: [{ name: 'f', type: 'String' }] }]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /Base package name/);
    return true;
  });

  // Reserved keyword as entity name
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'keyword-project',
      groupId: 'com.example',
      artifactId: 'keyword-project',
      packageName: 'com.example.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [{ name: 'class', fields: [{ name: 'f', type: 'String' }] }]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /not a valid Java identifier or is a reserved keyword/);
    return true;
  });

  // Empty entities array
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'no-entities',
      groupId: 'com.example',
      artifactId: 'no-entities',
      packageName: 'com.example.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: []
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /At least one entity must be configured/);
    return true;
  });
});

test('6. Duplicate entity and field names are strictly rejected', () => {
  // Duplicate entities (case-insensitive)
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'dup-entities',
      groupId: 'com.example',
      artifactId: 'dup-entities',
      packageName: 'com.example.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        { name: 'Customer', fields: [{ name: 'name', type: 'String' }] },
        { name: 'customer', fields: [{ name: 'email', type: 'String' }] }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /Duplicate entity name found: "customer"/);
    return true;
  });

  // Duplicate fields within single entity
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'dup-fields',
      groupId: 'com.example',
      artifactId: 'dup-fields',
      packageName: 'com.example.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Account',
          fields: [
            { name: 'balance', type: 'BigDecimal' },
            { name: 'balance', type: 'BigDecimal' }
          ]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /duplicate field name "balance"/);
    return true;
  });
});

test('7. Java package and directory consistency is verified for every file', () => {
  const config = createProjectConfigFromTemplate('FOOD_DELIVERY', {
    projectName: 'order-api',
    packageName: 'org.food.delivery.service'
  });

  const project = generateSpringBootProject(config);
  const expectedPrefix = 'src/main/java/org/food/delivery/service/';

  const javaFiles = project.files.filter(f => f.path.endsWith('.java'));
  assert.ok(javaFiles.length >= 10);

  for (const f of javaFiles) {
    assert.ok(f.path.startsWith(expectedPrefix), `File ${f.path} is not under ${expectedPrefix}`);

    // Extract first package statement from file
    const match = f.content.match(/^package\s+([a-zA-Z0-9_.]+);/m);
    assert.ok(match, `File ${f.path} missing package declaration`);

    const declaredPackage = match[1];
    const expectedDirFromPackage = 'src/main/java/' + declaredPackage.replace(/\./g, '/');

    assert.ok(
      f.path.startsWith(expectedDirFromPackage),
      `Package "${declaredPackage}" in ${f.path} does not match directory "${expectedDirFromPackage}"`
    );
  }
});

test('8. Required Maven files and configuration are complete', () => {
  const config: ProjectConfig = {
    projectName: 'maven-test',
    groupId: 'com.test',
    artifactId: 'maven-test',
    packageName: 'com.test.app',
    javaVersion: '21',
    springBootVersion: '3.4.0',
    database: 'postgresql',
    entities: [{ name: 'Thing', fields: [{ name: 'val', type: 'String' }] }]
  };

  const project = generateSpringBootProject(config);
  const pom = findFile(project.files, 'pom.xml')!;
  assert.ok(pom);

  assert.match(pom.content, /<groupId>org\.springframework\.boot<\/groupId>/);
  assert.match(pom.content, /<artifactId>spring-boot-starter-parent<\/artifactId>/);
  assert.match(pom.content, /<version>3\.4\.0<\/version>/);
  assert.match(pom.content, /<java\.version>21<\/java\.version>/);
  assert.match(pom.content, /<artifactId>spring-boot-starter-web<\/artifactId>/);
  assert.match(pom.content, /<artifactId>spring-boot-starter-data-jpa<\/artifactId>/);
  assert.match(pom.content, /<artifactId>postgresql<\/artifactId>/);
  assert.match(pom.content, /<artifactId>spring-boot-maven-plugin<\/artifactId>/);
});

test('9. Required Spring Boot entry point is valid', () => {
  const config: ProjectConfig = {
    projectName: 'hotel-reservation-service',
    groupId: 'com.travel',
    artifactId: 'hotel-reservation-service',
    packageName: 'com.travel.hotel',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'mysql',
    entities: [{ name: 'Room', fields: [{ name: 'roomNumber', type: 'String' }] }]
  };

  const project = generateSpringBootProject(config);
  const appFile = findFile(project.files, 'src/main/java/com/travel/hotel/HotelReservationServiceApplication.java')!;
  assert.ok(appFile);

  assert.match(appFile.content, /package com\.travel\.hotel;/);
  assert.match(appFile.content, /import org\.springframework\.boot\.SpringApplication;/);
  assert.match(appFile.content, /import org\.springframework\.boot\.autoconfigure\.SpringBootApplication;/);
  assert.match(appFile.content, /@SpringBootApplication/);
  assert.match(appFile.content, /public class HotelReservationServiceApplication/);
  assert.match(appFile.content, /public static void main\(String\[\] args\) \{/);
  assert.match(appFile.content, /SpringApplication\.run\(HotelReservationServiceApplication\.class, args\);/);
});

test('10. Repository, service, controller, and DTO consistency', () => {
  const config = createProjectConfigFromTemplate('CUSTOM', {
    projectName: 'customer-mgr',
    packageName: 'com.example.customer',
    entities: [
      {
        name: 'Customer',
        idType: 'Long',
        fields: [
          { name: 'email', type: 'String', required: true, unique: true },
          { name: 'score', type: 'Integer', min: 0 }
        ]
      }
    ]
  });

  const project = generateSpringBootProject(config);

  const controller = findFile(project.files, 'src/main/java/com/example/customer/controller/CustomerController.java')!;
  const service = findFile(project.files, 'src/main/java/com/example/customer/service/CustomerService.java')!;
  const mapper = findFile(project.files, 'src/main/java/com/example/customer/mapper/CustomerMapper.java')!;
  const reqDto = findFile(project.files, 'src/main/java/com/example/customer/dto/CustomerRequestDTO.java')!;
  const resDto = findFile(project.files, 'src/main/java/com/example/customer/dto/CustomerResponseDTO.java')!;

  assert.ok(controller && service && mapper && reqDto && resDto);

  // Controller calls service methods
  assert.match(controller.content, /service\.create\(requestDTO\)/);
  assert.match(controller.content, /service\.findAll\(\)/);
  assert.match(controller.content, /service\.findById\(id\)/);
  assert.match(controller.content, /service\.update\(id, requestDTO\)/);
  assert.match(controller.content, /service\.deleteById\(id\)/);

  // Service injects repo and mapper
  assert.match(service.content, /private final CustomerRepository repository;/);
  assert.match(service.content, /private final CustomerMapper mapper;/);
  assert.match(service.content, /mapper\.toEntity\(requestDTO\)/);
  assert.match(service.content, /mapper\.toResponseDTO\(saved\)/);

  // Mapper converts fields
  assert.match(mapper.content, /entity\.setEmail\(dto\.getEmail\(\)\);/);
  assert.match(mapper.content, /entity\.setScore\(dto\.getScore\(\)\);/);
  assert.match(mapper.content, /dto\.setEmail\(entity\.getEmail\(\)\);/);
});

test('11. Optional features can be enabled and disabled cleanly', () => {
  const configWithoutExtras: ProjectConfig = {
    projectName: 'bare-bones',
    groupId: 'com.simple',
    artifactId: 'bare-bones',
    packageName: 'com.simple.app',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [{ name: 'Note', fields: [{ name: 'text', type: 'String' }] }],
    options: {
      enableDtos: false,
      enableValidation: false,
      enableGlobalExceptionHandler: false
    }
  };

  const project = generateSpringBootProject(configWithoutExtras);

  // No DTO or Mapper files
  assert.equal(findFile(project.files, 'NoteRequestDTO.java'), undefined);
  assert.equal(findFile(project.files, 'NoteResponseDTO.java'), undefined);
  assert.equal(findFile(project.files, 'NoteMapper.java'), undefined);

  // No exception files
  assert.equal(findFile(project.files, 'GlobalExceptionHandler.java'), undefined);

  // Service uses Note entity directly
  const service = findFile(project.files, 'src/main/java/com/simple/app/service/NoteService.java')!;
  assert.match(service.content, /public Note create\(Note entity\)/);
  assert.match(service.content, /public List<Note> findAll\(\)/);

  // Controller uses Note entity directly
  const controller = findFile(project.files, 'src/main/java/com/simple/app/controller/NoteController.java')!;
  assert.match(controller.content, /public Note create\(@RequestBody Note entity\)/);
  assert.doesNotMatch(controller.content, /@Valid/);
});

test('12. Existing templates mapping and legacy aliases work seamlessly', () => {
  const templates = ['FOOD_DELIVERY', 'ECOMMERCE', 'BOOKING', 'STREAMING', 'PAYMENT', 'EDUCATION_ERP', 'CUSTOM'];

  for (const tKey of templates) {
    const t = getDomainTemplate(tKey);
    assert.equal(t.key, tKey);
    assert.ok(t.defaultEntities.length > 0, `Template ${tKey} should have default entities`);

    const cfg = createProjectConfigFromTemplate(tKey);
    const p = generateSpringBootProject(cfg);
    assert.ok(p.files.length > 10, `Template ${tKey} generated too few files`);
  }

  // Alias checks (from createProject.jsp and TemplateEngine.java)
  assert.equal(resolveTemplateKey('EDUCATION'), 'EDUCATION_ERP');
  assert.equal(resolveTemplateKey('EDUCATION_SYSTEM'), 'EDUCATION_ERP');
  assert.equal(resolveTemplateKey('education_erp'), 'EDUCATION_ERP');
});

test('13. File generation is deterministic', () => {
  const config = createProjectConfigFromTemplate('ECOMMERCE', {
    projectName: 'shop-api'
  });

  const run1 = generateSpringBootProject(config);
  const run2 = generateSpringBootProject(config);

  assert.equal(run1.files.length, run2.files.length);

  for (let i = 0; i < run1.files.length; i++) {
    assert.equal(run1.files[i].path, run2.files[i].path);
    // Ignore dynamic timestamps in comment headers if any
    const c1 = run1.files[i].content.replace(/Generated on: .*/, '');
    const c2 = run2.files[i].content.replace(/Generated on: .*/, '');
    assert.equal(c1, c2, `Mismatch in content for ${run1.files[i].path}`);
  }
});

test('14. ZIP export produces valid ZIP archive in memory', async () => {
  const config: ProjectConfig = {
    projectName: 'zip-test-service',
    groupId: 'com.zip',
    artifactId: 'zip-test',
    packageName: 'com.zip.test',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [{ name: 'Doc', fields: [{ name: 'content', type: 'String' }] }]
  };

  const zipBytes = await exportProjectToZip(config);
  assert.ok(zipBytes instanceof Uint8Array, 'Output must be Uint8Array');
  assert.ok(zipBytes.byteLength > 1000, 'Zip archive should be non-trivial size');

  // Verify ZIP magic bytes (PK\x03\x04 = 0x50, 0x4B, 0x03, 0x04)
  assert.equal(zipBytes[0], 0x50, 'ZIP magic byte 0');
  assert.equal(zipBytes[1], 0x4b, 'ZIP magic byte 1');
  assert.equal(zipBytes[2], 0x03, 'ZIP magic byte 2');
  assert.equal(zipBytes[3], 0x04, 'ZIP magic byte 3');
});

test('15. Database configurations, drivers, and safe environment variable placeholders (PostgreSQL, MySQL, H2)', () => {
  for (const db of ['postgresql', 'mysql', 'h2'] as const) {
    const config: ProjectConfig = {
      projectName: `${db}-demo`,
      groupId: 'com.dbtest',
      artifactId: `${db}-demo`,
      packageName: `com.dbtest.${db}`,
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: db,
      entities: [{ name: 'Record', fields: [{ name: 'name', type: 'String' }] }]
    };

    const project = generateSpringBootProject(config);
    const pom = findFile(project.files, 'pom.xml')!;
    const props = findFile(project.files, 'src/main/resources/application.properties')!;
    const readme = findFile(project.files, 'README.md')!;

    // Check environment variable placeholders in application.properties
    assert.match(props.content, /spring\.datasource\.url=\$\{SPRING_DATASOURCE_URL:/);
    assert.match(props.content, /spring\.datasource\.username=\$\{SPRING_DATASOURCE_USERNAME:/);
    assert.match(props.content, /spring\.datasource\.password=\$\{SPRING_DATASOURCE_PASSWORD:/);
    assert.match(props.content, /spring\.jpa\.hibernate\.ddl-auto=\$\{SPRING_JPA_HIBERNATE_DDL_AUTO:update\}/);

    // Verify driver dependency in pom.xml
    if (db === 'postgresql') {
      assert.match(pom.content, /<artifactId>postgresql<\/artifactId>/);
      assert.match(props.content, /org\.postgresql\.Driver/);
    } else if (db === 'mysql') {
      assert.match(pom.content, /<artifactId>mysql-connector-j<\/artifactId>/);
      assert.match(props.content, /com\.mysql\.cj\.jdbc\.Driver/);
    } else {
      assert.match(pom.content, /<artifactId>h2<\/artifactId>/);
      assert.match(props.content, /org\.h2\.Driver/);
      assert.match(props.content, /spring\.h2\.console\.enabled=true/);
    }

    // Verify README documents environment variables
    assert.match(readme.content, /SPRING_DATASOURCE_URL/);
    assert.match(readme.content, /SPRING_JPA_HIBERNATE_DDL_AUTO/);
  }
});

test('16. Decimal precision, scale, and string length in JPA & SQL', () => {
  const config: ProjectConfig = {
    projectName: 'precision-test',
    groupId: 'com.math',
    artifactId: 'precision-test',
    packageName: 'com.math.test',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    entities: [
      {
        name: 'FinancialRecord',
        fields: [
          { name: 'code', type: 'String', length: 16, required: true },
          { name: 'amount', type: 'BigDecimal', precision: 18, scale: 6, required: true }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const entity = findFile(project.files, 'src/main/java/com/math/test/entity/FinancialRecord.java')!;
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  assert.match(entity.content, /@Column\(name = "amount", nullable = false, precision = 18, scale = 6\)/);
  assert.match(entity.content, /@Size\(max = 16/);
  assert.match(sql.content, /code VARCHAR\(16\) NOT NULL/);
  assert.match(sql.content, /amount DECIMAL\(18, 6\) NOT NULL/);
});

test('17. Identifier strategy and database validation rejection', () => {
  // Reject UUID with IDENTITY
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'bad-uuid-id',
      groupId: 'com.test',
      artifactId: 'bad-uuid-id',
      packageName: 'com.test.uuid',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'postgresql',
      entities: [
        {
          name: 'Device',
          idType: 'UUID',
          idGeneration: 'IDENTITY',
          fields: [{ name: 'name', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /cannot use IDENTITY generation with UUID identifier/);
    return true;
  });

  // Reject String with SEQUENCE
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'bad-str-seq',
      groupId: 'com.test',
      artifactId: 'bad-str-seq',
      packageName: 'com.test.str',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'postgresql',
      entities: [
        {
          name: 'CodeEntity',
          idType: 'String',
          idGeneration: 'SEQUENCE',
          fields: [{ name: 'name', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /cannot use SEQUENCE generation with String identifier/);
    return true;
  });

  // Reject MySQL with SEQUENCE
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'mysql-seq',
      groupId: 'com.test',
      artifactId: 'mysql-seq',
      packageName: 'com.test.mysql',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'mysql',
      entities: [
        {
          name: 'Counter',
          idType: 'Long',
          idGeneration: 'SEQUENCE',
          fields: [{ name: 'name', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /cannot use SEQUENCE generation with MySQL database/);
    return true;
  });
});

test('18. Many-to-One and One-to-Many bidirectional relationship generation', () => {
  const config: ProjectConfig = {
    projectName: 'store-service',
    groupId: 'com.store',
    artifactId: 'store-service',
    packageName: 'com.store.api',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    entities: [
      {
        name: 'Author',
        tableName: 'authors',
        idType: 'Long',
        fields: [{ name: 'name', type: 'String', required: true }],
        relationships: [
          {
            name: 'books',
            type: 'ONE_TO_MANY',
            targetEntity: 'Book',
            mappedBy: 'author'
          }
        ]
      },
      {
        name: 'Book',
        tableName: 'books',
        idType: 'Long',
        fields: [{ name: 'title', type: 'String', required: true }],
        relationships: [
          {
            name: 'author',
            type: 'MANY_TO_ONE',
            targetEntity: 'Author',
            required: true
          }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  const authorEntity = findFile(project.files, 'src/main/java/com/store/api/entity/Author.java')!;
  const bookEntity = findFile(project.files, 'src/main/java/com/store/api/entity/Book.java')!;
  const bookReqDto = findFile(project.files, 'src/main/java/com/store/api/dto/BookRequestDTO.java')!;
  const bookResDto = findFile(project.files, 'src/main/java/com/store/api/dto/BookResponseDTO.java')!;
  const authorResDto = findFile(project.files, 'src/main/java/com/store/api/dto/AuthorResponseDTO.java')!;
  const bookMapper = findFile(project.files, 'src/main/java/com/store/api/mapper/BookMapper.java')!;
  const authorMapper = findFile(project.files, 'src/main/java/com/store/api/mapper/AuthorMapper.java')!;
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  // Author Entity has @OneToMany(mappedBy = "author")
  assert.match(authorEntity.content, /@OneToMany\(mappedBy = "author", fetch = FetchType\.LAZY\)/);
  assert.match(authorEntity.content, /private List<Book> books = new ArrayList<>\(\);/);
  assert.match(authorEntity.content, /public List<Book> getBooks\(\)/);

  // Book Entity has @ManyToOne and @JoinColumn
  assert.match(bookEntity.content, /@ManyToOne\(fetch = FetchType\.LAZY, optional = false\)/);
  assert.match(bookEntity.content, /@JoinColumn\(name = "author_id", nullable = false\)/);
  assert.match(bookEntity.content, /private Author author;/);
  assert.match(bookEntity.content, /public Author getAuthor\(\)/);

  // Book DTOs expose authorId
  assert.match(bookReqDto.content, /private Long authorId;/);
  assert.match(bookReqDto.content, /@NotNull\(message = "authorId must not be null"\)/);
  assert.match(bookResDto.content, /private Long authorId;/);

  // Author Response DTO exposes bookIds without recursive nesting
  assert.match(authorResDto.content, /private List<Long> bookIds;/);
  assert.match(authorResDto.content, /public List<Long> getBookIds\(\)/);

  // Mappers map IDs safely
  assert.match(bookMapper.content, /if \(entity\.getAuthor\(\) != null\) \{/);
  assert.match(bookMapper.content, /dto\.setAuthorId\(entity\.getAuthor\(\)\.getId\(\)\);/);

  assert.match(authorMapper.content, /if \(entity\.getBooks\(\) != null\) \{/);
  assert.match(authorMapper.content, /dto\.setBookIds\(entity\.getBooks\(\)\.stream\(\)/);
  assert.match(authorMapper.content, /\(Book::getId\)/);

  // SQL schema includes foreign key on books table
  assert.match(sql.content, /author_id BIGINT NOT NULL/);
  assert.match(sql.content, /CONSTRAINT fk_books_author FOREIGN KEY \(author_id\) REFERENCES authors\(id\)/);
});

test('19. One-to-One owning and inverse side with uniqueness constraints', () => {
  const config: ProjectConfig = {
    projectName: 'profile-service',
    groupId: 'com.auth',
    artifactId: 'profile-service',
    packageName: 'com.auth.service',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    entities: [
      {
        name: 'UserAccount',
        tableName: 'user_accounts',
        idType: 'Long',
        fields: [{ name: 'username', type: 'String', required: true }]
      },
      {
        name: 'UserProfile',
        tableName: 'user_profiles',
        idType: 'Long',
        fields: [{ name: 'bio', type: 'String' }],
        relationships: [
          {
            name: 'user',
            type: 'ONE_TO_ONE',
            targetEntity: 'UserAccount',
            required: true,
            isOwningSide: true,
            joinColumnName: 'user_account_id'
          }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const profileEntity = findFile(project.files, 'src/main/java/com/auth/service/entity/UserProfile.java')!;
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  // Unique constraint on 1:1 join column in JPA
  assert.match(profileEntity.content, /@OneToOne\(fetch = FetchType\.LAZY, optional = false\)/);
  assert.match(profileEntity.content, /@JoinColumn\(name = "user_account_id", unique = true, nullable = false\)/);

  // Unique constraint and foreign key in SQL
  assert.match(sql.content, /user_account_id BIGINT UNIQUE NOT NULL/);
  assert.match(sql.content, /CONSTRAINT fk_user_profiles_user FOREIGN KEY \(user_account_id\) REFERENCES user_accounts\(id\)/);
});

test('20. Many-to-Many join table generation and composite keys', () => {
  const config: ProjectConfig = {
    projectName: 'school-service',
    groupId: 'com.school',
    artifactId: 'school-service',
    packageName: 'com.school.edu',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'mysql',
    entities: [
      {
        name: 'Student',
        tableName: 'students',
        idType: 'Long',
        fields: [{ name: 'name', type: 'String', required: true }],
        relationships: [
          {
            name: 'courses',
            type: 'MANY_TO_MANY',
            targetEntity: 'Course',
            joinTableName: 'student_course_enrollments',
            isOwningSide: true
          }
        ]
      },
      {
        name: 'Course',
        tableName: 'courses',
        idType: 'Long',
        fields: [{ name: 'title', type: 'String', required: true }],
        relationships: [
          {
            name: 'students',
            type: 'MANY_TO_MANY',
            targetEntity: 'Student',
            mappedBy: 'courses'
          }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  const studentEntity = findFile(project.files, 'src/main/java/com/school/edu/entity/Student.java')!;
  const courseEntity = findFile(project.files, 'src/main/java/com/school/edu/entity/Course.java')!;
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  // Student is owning side with @JoinTable
  assert.match(studentEntity.content, /@ManyToMany\(fetch = FetchType\.LAZY\)/);
  assert.match(studentEntity.content, /@JoinTable\(\s*name = "student_course_enrollments"/);

  // Course is inverse side with mappedBy
  assert.match(courseEntity.content, /@ManyToMany\(mappedBy = "courses", fetch = FetchType\.LAZY\)/);

  // Schema defines join table with composite PK and foreign keys ON DELETE CASCADE
  assert.match(sql.content, /CREATE TABLE IF NOT EXISTS student_course_enrollments/);
  assert.match(sql.content, /student_id BIGINT NOT NULL/);
  assert.match(sql.content, /course_id BIGINT NOT NULL/);
  assert.match(sql.content, /PRIMARY KEY \(student_id, course_id\)/);
  assert.match(sql.content, /REFERENCES students\(id\) ON DELETE CASCADE/);
  assert.match(sql.content, /REFERENCES courses\(id\) ON DELETE CASCADE/);
});

test('21. Unidirectional One-to-Many relationship', () => {
  const config: ProjectConfig = {
    projectName: 'log-service',
    groupId: 'com.audit',
    artifactId: 'log-service',
    packageName: 'com.audit.log',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [
      {
        name: 'AuditBatch',
        fields: [{ name: 'batchName', type: 'String' }],
        relationships: [
          {
            name: 'entries',
            type: 'ONE_TO_MANY',
            targetEntity: 'LogEntry'
          }
        ]
      },
      {
        name: 'LogEntry',
        fields: [{ name: 'message', type: 'String' }]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const batchEntity = findFile(project.files, 'src/main/java/com/audit/log/entity/AuditBatch.java')!;

  assert.match(batchEntity.content, /@OneToMany\(fetch = FetchType\.LAZY\)/);
  assert.match(batchEntity.content, /@JoinColumn\(name = "audit_batch_id"\)/);
  assert.match(batchEntity.content, /private List<LogEntry> entries = new ArrayList<>\(\);/);
});

test('22. Comprehensive relationship validation errors', () => {
  // 1. Missing target entity
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'bad-target',
      groupId: 'com.test',
      artifactId: 'bad-target',
      packageName: 'com.test.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Person',
          fields: [{ name: 'name', type: 'String' }],
          relationships: [
            { name: 'address', type: 'MANY_TO_ONE', targetEntity: 'NonExistentAddress' }
          ]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /references nonexistent target entity "NonExistentAddress"/);
    return true;
  });

  // 2. mappedBy pointing to nonexistent property
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'bad-mappedby',
      groupId: 'com.test',
      artifactId: 'bad-mappedby',
      packageName: 'com.test.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Dept',
          fields: [{ name: 'name', type: 'String' }],
          relationships: [
            { name: 'employees', type: 'ONE_TO_MANY', targetEntity: 'Emp', mappedBy: 'dept' }
          ]
        },
        {
          name: 'Emp',
          fields: [{ name: 'name', type: 'String' }]
          // Missing reverse relationship named "dept"
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /declares mappedBy="dept", but target entity "Emp" has no relationship named "dept"/);
    return true;
  });

  // 3. ManyToOne declaring mappedBy (invalid in JPA)
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'many-to-one-mappedby',
      groupId: 'com.test',
      artifactId: 'many-to-one-mappedby',
      packageName: 'com.test.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Child',
          fields: [{ name: 'name', type: 'String' }],
          relationships: [
            { name: 'parent', type: 'MANY_TO_ONE', targetEntity: 'Parent', mappedBy: 'children' }
          ]
        },
        {
          name: 'Parent',
          fields: [{ name: 'name', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /cannot declare mappedBy \(ManyToOne is always the owning side in JPA\)/);
    return true;
  });

  // 4. orphanRemoval on ManyToOne (invalid in JPA)
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'orphan-manytoone',
      groupId: 'com.test',
      artifactId: 'orphan-manytoone',
      packageName: 'com.test.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Child',
          fields: [{ name: 'name', type: 'String' }],
          relationships: [
            { name: 'parent', type: 'MANY_TO_ONE', targetEntity: 'Parent', orphanRemoval: true }
          ]
        },
        {
          name: 'Parent',
          fields: [{ name: 'name', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /cannot have orphanRemoval=true with MANY_TO_ONE/);
    return true;
  });

  // 5. Relationship name collision with field
  assert.throws(() => {
    generateSpringBootProject({
      projectName: 'collision',
      groupId: 'com.test',
      artifactId: 'collision',
      packageName: 'com.test.app',
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: 'h2',
      entities: [
        {
          name: 'Order',
          fields: [{ name: 'user', type: 'String' }],
          relationships: [
            { name: 'user', type: 'MANY_TO_ONE', targetEntity: 'Account' }
          ]
        },
        {
          name: 'Account',
          fields: [{ name: 'email', type: 'String' }]
        }
      ]
    });
  }, (err: Error) => {
    assert.ok(err instanceof ConfigValidationError);
    assert.match(err.message, /collides with an existing field or ID property/);
    return true;
  });
});

test('23. Cross-file consistency between SQL foreign keys, entity annotations, DTO fields, and mapper logic', () => {
  const config: ProjectConfig = {
    projectName: 'clinic-app',
    groupId: 'com.clinic',
    artifactId: 'clinic-app',
    packageName: 'com.clinic.core',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    entities: [
      {
        name: 'Doctor',
        tableName: 'doctors',
        idType: 'UUID',
        fields: [{ name: 'specialty', type: 'String' }],
        relationships: [
          { name: 'appointments', type: 'ONE_TO_MANY', targetEntity: 'Appointment', mappedBy: 'doctor' }
        ]
      },
      {
        name: 'Appointment',
        tableName: 'appointments',
        idType: 'Long',
        fields: [{ name: 'date', type: 'LocalDate' }],
        relationships: [
          { name: 'doctor', type: 'MANY_TO_ONE', targetEntity: 'Doctor', required: true }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  const docRepo = findFile(project.files, 'src/main/java/com/clinic/core/repository/DoctorRepository.java')!;
  const apptReqDto = findFile(project.files, 'src/main/java/com/clinic/core/dto/AppointmentRequestDTO.java')!;
  const docResDto = findFile(project.files, 'src/main/java/com/clinic/core/dto/DoctorResponseDTO.java')!;
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  // Doctor ID is UUID -> repository matches
  assert.match(docRepo.content, /JpaRepository<Doctor, UUID>/);

  // AppointmentRequestDTO exposes doctorId as UUID
  assert.match(apptReqDto.content, /private UUID doctorId;/);

  // DoctorResponseDTO exposes appointmentIds as List<Long>
  assert.match(docResDto.content, /private List<Long> appointmentIds;/);

  // SQL foreign key references doctor_id with UUID type in PostgreSQL
  assert.match(sql.content, /doctor_id UUID NOT NULL/);
  assert.match(sql.content, /CONSTRAINT fk_appointments_doctor FOREIGN KEY \(doctor_id\) REFERENCES doctors\(id\)/);
});

test('24. Topological table ordering in schema.sql creates referenced tables before referencing tables', () => {
  const config: ProjectConfig = {
    projectName: 'order-flow',
    groupId: 'com.flow',
    artifactId: 'order-flow',
    packageName: 'com.flow.app',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    // Order of input: Payment references Order, Order references User
    entities: [
      {
        name: 'Payment',
        tableName: 'payments',
        fields: [{ name: 'amount', type: 'BigDecimal' }],
        relationships: [{ name: 'order', type: 'MANY_TO_ONE', targetEntity: 'Order' }]
      },
      {
        name: 'Order',
        tableName: 'orders',
        fields: [{ name: 'total', type: 'BigDecimal' }],
        relationships: [{ name: 'user', type: 'MANY_TO_ONE', targetEntity: 'User' }]
      },
      {
        name: 'User',
        tableName: 'users',
        fields: [{ name: 'name', type: 'String' }]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const sql = findFile(project.files, 'src/main/resources/schema.sql')!;

  // In the generated SQL: User table must appear before Order, and Order before Payment
  const userIdx = sql.content.indexOf('CREATE TABLE IF NOT EXISTS users');
  const orderIdx = sql.content.indexOf('CREATE TABLE IF NOT EXISTS orders');
  const paymentIdx = sql.content.indexOf('CREATE TABLE IF NOT EXISTS payments');

  assert.ok(userIdx !== -1, 'users table missing');
  assert.ok(orderIdx !== -1, 'orders table missing');
  assert.ok(paymentIdx !== -1, 'payments table missing');

  assert.ok(userIdx < orderIdx, 'users table must be created before orders table');
  assert.ok(orderIdx < paymentIdx, 'orders table must be created before payments table');
});

test('25. All seven domain templates have verified relationships and zero recursion in DTOs', () => {
  const templates = ['FOOD_DELIVERY', 'ECOMMERCE', 'BOOKING', 'STREAMING', 'PAYMENT', 'EDUCATION_ERP', 'CUSTOM'];

  for (const tKey of templates) {
    const config = createProjectConfigFromTemplate(tKey);
    const project = generateSpringBootProject(config);

    assert.ok(project.files.length >= 10);

    // Verify all DTO files avoid self-referencing entity classes
    const dtos = project.files.filter(f => f.path.includes('/dto/'));
    for (const dto of dtos) {
      // DTO fields should only be primitives, standard types, or target entity IDs, never direct entity graphs
      for (const entity of config.entities) {
        assert.doesNotMatch(
          dto.content,
          new RegExp(`private ${entity.name} `),
          `DTO ${dto.path} should not directly embed entity ${entity.name}`
        );
      }
    }
  }
});

test('26. Regression: Boolean entity and DTO fields provide both isX and getX accessors', () => {
  const config: ProjectConfig = {
    projectName: 'task-service',
    groupId: 'com.example.tasks',
    artifactId: 'task-service',
    packageName: 'com.example.tasks',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [
      {
        name: 'Task',
        fields: [
          { name: 'title', type: 'String', required: true },
          { name: 'completed', type: 'Boolean', defaultValue: 'false' }
        ]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  const entity = findFile(project.files, 'entity/Task.java');
  assert.ok(entity);
  assert.match(entity.content, /public Boolean isCompleted\(\)/);
  assert.match(entity.content, /public Boolean getCompleted\(\)/);

  const reqDto = findFile(project.files, 'dto/TaskRequestDTO.java');
  assert.ok(reqDto);
  assert.match(reqDto.content, /public Boolean isCompleted\(\)/);
  assert.match(reqDto.content, /public Boolean getCompleted\(\)/);

  const resDto = findFile(project.files, 'dto/TaskResponseDTO.java');
  assert.ok(resDto);
  assert.match(resDto.content, /public Boolean isCompleted\(\)/);
  assert.match(resDto.content, /public Boolean getCompleted\(\)/);

  const mapper = findFile(project.files, 'mapper/TaskMapper.java');
  assert.ok(mapper);
  assert.match(mapper.content, /dto\.getCompleted\(\)/);
  assert.match(mapper.content, /entity\.getCompleted\(\)/);
});

test('27. Regression: GlobalExceptionHandler handles BadCredentialsException (401) and IllegalArgumentException (400) when security is enabled', () => {
  const config: ProjectConfig = {
    projectName: 'secure-api',
    groupId: 'com.example.secure',
    artifactId: 'secure-api',
    packageName: 'com.example.secure',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'postgresql',
    security: { enabled: true },
    entities: [
      {
        name: 'Document',
        fields: [{ name: 'title', type: 'String', required: true }]
      }
    ]
  };

  const project = generateSpringBootProject(config);

  const handler = findFile(project.files, 'exception/GlobalExceptionHandler.java');
  assert.ok(handler);
  assert.match(handler.content, /BadCredentialsException/);
  assert.match(handler.content, /HttpStatus\.UNAUTHORIZED/);
  assert.match(handler.content, /IllegalArgumentException/);
  assert.match(handler.content, /HttpStatus\.BAD_REQUEST/);

  const authTest = findFile(project.files, 'AuthControllerTest.java');
  assert.ok(authTest);
  assert.match(authTest.content, /@Import\(GlobalExceptionHandler\.class\)/);
  assert.match(authTest.content, /JwtAuthenticationFilter jwtAuthFilter/);
  assert.match(authTest.content, /JwtAuthenticationEntryPoint authenticationEntryPoint/);
  assert.match(authTest.content, /JwtAccessDeniedHandler accessDeniedHandler/);
});

test('28. Regression: Representative matrix projects generate consistent Java and configuration assets', () => {
  assert.equal(REPRESENTATIVE_MATRIX.length, 8);

  for (const item of REPRESENTATIVE_MATRIX) {
    const project = generateSpringBootProject(item.config);
    assert.ok(project.files.length >= 10, `Project ${item.id} has fewer than 10 files`);
    assert.ok(findFile(project.files, 'pom.xml'), `Project ${item.id} missing pom.xml`);
    assert.ok(findFile(project.files, 'application.properties'), `Project ${item.id} missing application.properties`);
  }
});
