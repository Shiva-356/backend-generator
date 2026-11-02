import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  generateSpringBootProject,
  packageProjectToZip,
  exportProjectToZip,
  normalizeZipPath,
  sanitizeArchiveRoot,
  validateArchiveRoot,
  validateFileCollection,
  ZipPackagingError,
  downloadProjectZip,
  createProjectConfigFromTemplate,
  ProjectConfig
} from './index';

test('ZIP-A: Minimal project ZIP contains predictable root and exact matched files', async () => {
  const config: ProjectConfig = {
    projectName: 'mini-order',
    groupId: 'com.acme',
    artifactId: 'mini-order',
    packageName: 'com.acme.order',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [
      {
        name: 'Order',
        fields: [{ name: 'trackingNo', type: 'String', required: true }]
      }
    ]
  };

  const project = generateSpringBootProject(config);
  const zipBytes = await packageProjectToZip(project);

  assert.ok(zipBytes instanceof Uint8Array);
  assert.ok(zipBytes.byteLength > 0);

  // Read the ZIP archive back into memory
  const unzipped = await JSZip.loadAsync(zipBytes);
  const entryKeys = Object.keys(unzipped.files);

  assert.ok(entryKeys.length > 0, 'ZIP must have entries');

  const rootPrefix = 'mini-order/';

  // All entries must reside under the predictable root directory
  for (const key of entryKeys) {
    assert.ok(key.startsWith(rootPrefix), `Entry "${key}" is not inside root "${rootPrefix}"`);
    assert.doesNotMatch(key, /\\/, `Entry "${key}" contains Windows backslash`);
  }

  // Compare every file in the original project with the extracted ZIP entry
  for (const originalFile of project.files) {
    const zipPath = `${rootPrefix}${originalFile.path}`;
    const zipEntry = unzipped.file(zipPath);

    assert.ok(zipEntry, `File "${zipPath}" missing from ZIP archive`);
    const extractedContent = await zipEntry.async('string');

    assert.equal(
      extractedContent,
      originalFile.content,
      `Content mismatch for file "${originalFile.path}" in ZIP archive`
    );
  }
});

test('ZIP-B: Multiple entities and complete layered package structure in ZIP', async () => {
  const config: ProjectConfig = {
    projectName: 'multi-entity-app',
    groupId: 'com.corp',
    artifactId: 'multi-entity-app',
    packageName: 'com.corp.multi',
    javaVersion: '21',
    springBootVersion: '3.4.0',
    database: 'postgresql',
    entities: [
      { name: 'Customer', fields: [{ name: 'email', type: 'String' }] },
      { name: 'Invoice', fields: [{ name: 'invoiceNumber', type: 'String' }] },
      { name: 'LineItem', fields: [{ name: 'description', type: 'String' }] }
    ]
  };

  const project = generateSpringBootProject(config);
  const zipBytes = await packageProjectToZip(project);
  const unzipped = await JSZip.loadAsync(zipBytes);

  const root = 'multi-entity-app/';
  const pkgDir = `${root}src/main/java/com/corp/multi/`;

  for (const entityName of ['Customer', 'Invoice', 'LineItem']) {
    assert.ok(unzipped.file(`${pkgDir}entity/${entityName}.java`));
    assert.ok(unzipped.file(`${pkgDir}repository/${entityName}Repository.java`));
    assert.ok(unzipped.file(`${pkgDir}service/${entityName}Service.java`));
    assert.ok(unzipped.file(`${pkgDir}controller/${entityName}Controller.java`));
    assert.ok(unzipped.file(`${pkgDir}dto/${entityName}RequestDTO.java`));
    assert.ok(unzipped.file(`${pkgDir}dto/${entityName}ResponseDTO.java`));
    assert.ok(unzipped.file(`${pkgDir}mapper/${entityName}Mapper.java`));
  }
});

test('ZIP-C: Relationships and join tables packaged accurately in ZIP', async () => {
  const config = createProjectConfigFromTemplate('FOOD_DELIVERY', {
    projectName: 'delivery-backend'
  });

  const zipBytes = await packageProjectToZip(config);
  const unzipped = await JSZip.loadAsync(zipBytes);

  const root = 'delivery-backend/';

  // Schema file contains foreign keys and relationships
  const schemaFile = unzipped.file(`${root}src/main/resources/schema.sql`);
  assert.ok(schemaFile);
  const schemaContent = await schemaFile.async('string');

  assert.match(schemaContent, /CONSTRAINT fk_menu_items_restaurant FOREIGN KEY/);
  assert.match(schemaContent, /CONSTRAINT fk_orders_user FOREIGN KEY/);
  assert.match(schemaContent, /CONSTRAINT fk_orders_restaurant FOREIGN KEY/);
  assert.match(schemaContent, /CONSTRAINT fk_payments_order FOREIGN KEY/);

  // Entities contain JPA relationship annotations
  const restaurant = unzipped.file(`${root}src/main/java/com/example/deliverybackend/entity/Restaurant.java`);
  assert.ok(restaurant);
  const restaurantContent = await restaurant.async('string');
  assert.match(restaurantContent, /@OneToMany\(mappedBy = "restaurant"/);
});

test('ZIP-D: Database configurations in ZIP reflect exact driver and properties without cross-leaks', async () => {
  const databases = ['postgresql', 'mysql', 'h2'] as const;

  for (const db of databases) {
    const config: ProjectConfig = {
      projectName: `${db}-archive`,
      groupId: 'com.db',
      artifactId: `${db}-archive`,
      packageName: `com.db.${db}`,
      javaVersion: '17',
      springBootVersion: '3.3.0',
      database: db,
      entities: [{ name: 'Record', fields: [{ name: 'key', type: 'String' }] }]
    };

    const zipBytes = await packageProjectToZip(config);
    const unzipped = await JSZip.loadAsync(zipBytes);
    const root = `${db}-archive/`;

    const pomContent = await unzipped.file(`${root}pom.xml`)!.async('string');
    const propsContent = await unzipped.file(`${root}src/main/resources/application.properties`)!.async('string');

    if (db === 'postgresql') {
      assert.match(pomContent, /<artifactId>postgresql<\/artifactId>/);
      assert.doesNotMatch(pomContent, /mysql-connector-j/);
      assert.match(propsContent, /org\.postgresql\.Driver/);
    } else if (db === 'mysql') {
      assert.match(pomContent, /<artifactId>mysql-connector-j<\/artifactId>/);
      assert.doesNotMatch(pomContent, /<artifactId>postgresql<\/artifactId>/);
      assert.match(propsContent, /com\.mysql\.cj\.jdbc\.Driver/);
    } else {
      assert.match(pomContent, /<artifactId>h2<\/artifactId>/);
      assert.match(propsContent, /org\.h2\.Driver/);
    }
  }
});

test('ZIP-E: Optional features toggling in ZIP archive', async () => {
  // Feature disabled
  const disabledConfig: ProjectConfig = {
    projectName: 'no-dtos-app',
    groupId: 'com.simple',
    artifactId: 'no-dtos-app',
    packageName: 'com.simple.nodto',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [{ name: 'Task', fields: [{ name: 'summary', type: 'String' }] }],
    options: {
      enableDtos: false,
      enableGlobalExceptionHandler: false
    }
  };

  const zipBytes = await packageProjectToZip(disabledConfig);
  const unzipped = await JSZip.loadAsync(zipBytes);
  const files = Object.keys(unzipped.files);

  assert.equal(files.some(f => f.includes('DTO.java')), false, 'ZIP must not have DTOs when disabled');
  assert.equal(files.some(f => f.includes('Mapper.java')), false, 'ZIP must not have Mappers when disabled');
  assert.equal(files.some(f => f.includes('GlobalExceptionHandler.java')), false, 'ZIP must not have ExceptionHandler when disabled');
});

test('ZIP-F: Archive integrity, forward slashes, non-empty files, no duplicate paths', async () => {
  const config = createProjectConfigFromTemplate('ECOMMERCE', {
    projectName: 'shop-backend'
  });

  const zipBytes = await packageProjectToZip(config);
  const unzipped = await JSZip.loadAsync(zipBytes);
  const entries = Object.entries(unzipped.files);

  const seenPaths = new Set<string>();

  for (const [path, fileEntry] of entries) {
    // Forward slashes only
    assert.doesNotMatch(path, /\\/, `Path "${path}" contains backslash`);

    // No duplicate paths
    assert.equal(seenPaths.has(path), false, `Duplicate entry found: "${path}"`);
    seenPaths.add(path);

    // If entry is a file (not folder directory entry)
    if (!fileEntry.dir) {
      const content = await fileEntry.async('string');
      assert.ok(content.length > 0, `File "${path}" in ZIP must not be 0 bytes empty`);
    }
  }
});

test('ZIP-G: Strict isolation from workspace, git, node_modules, and secrets', async () => {
  const config: ProjectConfig = {
    projectName: 'secure-app',
    groupId: 'com.secure',
    artifactId: 'secure-app',
    packageName: 'com.secure.pkg',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [{ name: 'SecretEntity', fields: [{ name: 'title', type: 'String' }] }]
  };

  const zipBytes = await packageProjectToZip(config);
  const unzipped = await JSZip.loadAsync(zipBytes);
  const paths = Object.keys(unzipped.files);

  for (const p of paths) {
    assert.doesNotMatch(p, /node_modules/, `Workspace node_modules leaked into ZIP: "${p}"`);
    assert.doesNotMatch(p, /\.git(\/|$)/, `Git metadata leaked into ZIP: "${p}"`);
    assert.doesNotMatch(p, /(^|\/)\.env($|\.(local|production|prod|secret))/, `Secret .env file leaked into ZIP: "${p}"`);
    assert.doesNotMatch(p, /package\.json/, `Workspace package.json leaked into ZIP: "${p}"`);
    assert.doesNotMatch(p, /vite\.config\.ts/, `Workspace vite.config.ts leaked into ZIP: "${p}"`);
    assert.doesNotMatch(p, /tsconfig\.json/, `Workspace tsconfig.json leaked into ZIP: "${p}"`);
  }
});

test('ZIP-H: Path normalization and security rejection rules', () => {
  // Normalization
  assert.equal(normalizeZipPath('src\\main\\java\\App.java'), 'src/main/java/App.java');
  assert.equal(normalizeZipPath('  src/main/resources/application.properties  '), 'src/main/resources/application.properties');
  assert.equal(normalizeZipPath('./pom.xml'), 'pom.xml');

  // Directory traversal rejection
  assert.throws(() => normalizeZipPath('../evil.txt'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Directory traversal/);
    return true;
  });

  assert.throws(() => normalizeZipPath('src/../../etc/passwd'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Directory traversal/);
    return true;
  });

  // Absolute path rejection
  assert.throws(() => normalizeZipPath('/etc/shadow'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Absolute paths are not allowed/);
    return true;
  });

  assert.throws(() => normalizeZipPath('C:\\Windows\\system32'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Absolute paths are not allowed/);
    return true;
  });

  // Null byte rejection
  assert.throws(() => normalizeZipPath('src/main/\0/App.java'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Null byte/);
    return true;
  });

  // Empty path rejection
  assert.throws(() => normalizeZipPath(''), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /non-empty string/);
    return true;
  });
});

test('ZIP-I: Packaging error scenarios and edge cases', async () => {
  // Empty file collection
  await assert.rejects(
    async () => {
      validateFileCollection([]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /empty file collection/);
      return true;
    }
  );

  // Duplicate relative paths in collection
  await assert.rejects(
    async () => {
      validateFileCollection([
        { path: 'pom.xml', content: '<xml/>' },
        { path: './pom.xml', content: '<xml-dup/>' },
        { path: 'README.md', content: 'hello' },
        { path: '.gitignore', content: '' },
        { path: 'src/main/resources/application.properties', content: '' },
        { path: 'src/main/java/AppApplication.java', content: '' }
      ]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /Duplicate file path detected/);
      return true;
    }
  );

  // Missing required core file (e.g. missing pom.xml)
  await assert.rejects(
    async () => {
      validateFileCollection([
        { path: 'README.md', content: 'hello' },
        { path: '.gitignore', content: '' },
        { path: 'src/main/resources/application.properties', content: '' },
        { path: 'src/main/java/AppApplication.java', content: '' }
      ]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /Required project file "pom.xml" is missing/);
      return true;
    }
  );

  // Null or undefined content
  await assert.rejects(
    async () => {
      validateFileCollection([
        { path: 'pom.xml', content: null as unknown as string }
      ]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /null or undefined content/);
      return true;
    }
  );
});

test('ZIP-J: Download utility packaging and concurrency protection', async () => {
  const config: ProjectConfig = {
    projectName: 'download-service',
    groupId: 'com.dl',
    artifactId: 'download-service',
    packageName: 'com.dl.service',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    database: 'h2',
    entities: [{ name: 'Item', fields: [{ name: 'name', type: 'String' }] }]
  };

  const result = await downloadProjectZip(config, 'custom-download.zip');

  assert.equal(result.filename, 'custom-download.zip');
  assert.ok(result.sizeBytes > 1000);

  // Test root sanitization helper
  assert.equal(sanitizeArchiveRoot('My Service!!'), 'My-Service');
  assert.equal(sanitizeArchiveRoot('   '), 'generated-project');
});

test('ZIP-K: validateArchiveRoot rejects directory traversal, path separators, absolute paths, and null bytes', () => {
  // Valid names
  assert.equal(validateArchiveRoot('my-service'), 'my-service');
  assert.equal(validateArchiveRoot('Order Service 123'), 'Order-Service-123');

  // Traversal rejection
  assert.throws(() => validateArchiveRoot('../evil'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Directory traversal/);
    return true;
  });

  assert.throws(() => validateArchiveRoot('foo/../../bar'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Directory traversal|Path separators/);
    return true;
  });

  // Path separator rejection
  assert.throws(() => validateArchiveRoot('sub/folder'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Path separators/);
    return true;
  });

  assert.throws(() => validateArchiveRoot('sub\\folder'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Path separators/);
    return true;
  });

  // Absolute path rejection
  assert.throws(() => validateArchiveRoot('/etc/passwd'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Path separators|Absolute paths/);
    return true;
  });

  assert.throws(() => validateArchiveRoot('C:\\Windows'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Path separators|Absolute/);
    return true;
  });

  // Null byte rejection
  assert.throws(() => validateArchiveRoot('evil\0folder'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Null byte/);
    return true;
  });

  // Blank/empty rejection
  assert.throws(() => validateArchiveRoot('   '), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /non-empty string|cannot be blank/);
    return true;
  });
});

test('ZIP-L: Conflicting path detection rejects files colliding with directory prefixes', () => {
  // 'src/main' is a file, but 'src/main/AppApplication.java' requires 'src/main' to be a directory
  assert.throws(
    () => {
      validateFileCollection([
        { path: 'pom.xml', content: '<xml/>' },
        { path: 'README.md', content: 'hello' },
        { path: '.gitignore', content: '' },
        { path: 'src/main/resources/application.properties', content: '' },
        { path: 'src/main', content: 'I am a file' },
        { path: 'src/main/AppApplication.java', content: 'class AppApplication {}' }
      ]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /Conflicting path detected in ZIP archive: "src\/main" cannot be both a file and a directory/);
      return true;
    }
  );
});

test('ZIP-M: Case-insensitive duplicate path detection', () => {
  assert.throws(
    () => {
      validateFileCollection([
        { path: 'pom.xml', content: '<xml/>' },
        { path: 'README.md', content: 'hello' },
        { path: 'readme.md', content: 'duplicate lower' },
        { path: '.gitignore', content: '' },
        { path: 'src/main/resources/application.properties', content: '' },
        { path: 'src/main/java/AppApplication.java', content: '' }
      ]);
    },
    (err: Error) => {
      assert.ok(err instanceof ZipPackagingError);
      assert.match(err.message, /Case-insensitive duplicate file path detected/);
      return true;
    }
  );
});

test('ZIP-N: URL-encoded path traversal and separator rejection', () => {
  assert.throws(() => normalizeZipPath('src/%2e%2e/etc/passwd'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Encoded path traversal/);
    return true;
  });

  assert.throws(() => normalizeZipPath('src%2fmain%2fApp.java'), (err: Error) => {
    assert.ok(err instanceof ZipPackagingError);
    assert.match(err.message, /Encoded path traversal/);
    return true;
  });
});

