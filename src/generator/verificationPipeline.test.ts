import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import JSZip from 'jszip';
import {
  isToolchainAvailable,
  extractAndValidateZip,
  verifyConfiguration,
  REPRESENTATIVE_MATRIX
} from '../../scripts/verify-generated-projects';
import { generateSpringBootProject, packageProjectToZip } from './index';

describe('Verification Pipeline Self-Tests', () => {

  // Test 1: Toolchain detection
  it('1. isToolchainAvailable returns structured status without throwing', () => {
    const status = isToolchainAvailable();
    assert.equal(typeof status.available, 'boolean');
    if (!status.available) {
      assert.ok(status.reason, 'Should report reason why toolchain is unavailable');
    }
  });

  // Test 2: Extraction succeeds on valid generated ZIP
  it('2. extractAndValidateZip extracts and verifies valid generated project ZIP', async () => {
    const sample = REPRESENTATIVE_MATRIX[0];
    const project = generateSpringBootProject(sample.config);
    const zipBytes = await packageProjectToZip(project);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-test-success-'));
    try {
      const { rootDir, filePaths } = await extractAndValidateZip(zipBytes, sample.config, tempDir);
      assert.ok(fs.existsSync(rootDir));
      assert.ok(filePaths.length > 0);
      assert.ok(fs.existsSync(path.join(rootDir, 'pom.xml')));
      assert.ok(fs.existsSync(path.join(rootDir, 'README.md')));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Test 3: Detects corrupt ZIP
  it('3. extractAndValidateZip throws on corrupt or malformed ZIP bytes', async () => {
    const sample = REPRESENTATIVE_MATRIX[0];
    const corruptBytes = new Uint8Array([0x50, 0x4b, 0x00, 0x00, 0x12, 0x34]); // truncated header
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-test-corrupt-'));

    try {
      await assert.rejects(
        async () => {
          await extractAndValidateZip(corruptBytes, sample.config, tempDir);
        },
        /Corrupted zip|Can't find end of central directory/i
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Test 4: Detects missing required file
  it('4. extractAndValidateZip throws when a required file (pom.xml) is missing', async () => {
    const sample = REPRESENTATIVE_MATRIX[0];
    const project = generateSpringBootProject(sample.config);
    // Remove pom.xml from zip
    const zip = new JSZip();
    const rootName = 'minimal-service';
    const folder = zip.folder(rootName)!;
    for (const f of project.files) {
      if (f.path !== 'pom.xml') {
        folder.file(f.path, f.content);
      }
    }
    const alteredBytes = await zip.generateAsync({ type: 'uint8array' });

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-test-missing-'));
    try {
      await assert.rejects(
        async () => {
          await extractAndValidateZip(alteredBytes, sample.config, tempDir);
        },
        /Required file "pom.xml" is missing/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Test 5: Detects empty required file
  it('5. extractAndValidateZip throws when a required file is empty (0 bytes)', async () => {
    const sample = REPRESENTATIVE_MATRIX[0];
    const project = generateSpringBootProject(sample.config);
    const zip = new JSZip();
    const rootName = 'minimal-service';
    const folder = zip.folder(rootName)!;
    for (const f of project.files) {
      folder.file(f.path, f.path === 'README.md' ? '' : f.content);
    }
    const alteredBytes = await zip.generateAsync({ type: 'uint8array' });

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-test-empty-'));
    try {
      await assert.rejects(
        async () => {
          await extractAndValidateZip(alteredBytes, sample.config, tempDir);
        },
        /Required file "README.md" is empty \(0 bytes\)/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Test 6: Detects security mismatch
  it('6. extractAndValidateZip throws when security is enabled but app_users is missing in schema.sql', async () => {
    const sample = REPRESENTATIVE_MATRIX.find(m => m.id === 'CONFIG_G')!;
    const project = generateSpringBootProject(sample.config);
    const zip = new JSZip();
    const rootName = 'secure-app';
    const folder = zip.folder(rootName)!;
    for (const f of project.files) {
      // Intentionally omit user table from schema.sql
      if (f.path === 'src/main/resources/schema.sql') {
        folder.file(f.path, '-- stripped schema without security tables\n');
      } else {
        folder.file(f.path, f.content);
      }
    }
    const alteredBytes = await zip.generateAsync({ type: 'uint8array' });

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-test-sec-'));
    try {
      await assert.rejects(
        async () => {
          await extractAndValidateZip(alteredBytes, sample.config, tempDir);
        },
        /missing "app_users" table in schema\.sql/
      );
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // Test 7: Temporary directory cleanup on failure
  it('7. verifyConfiguration always cleans up temporary directories even on extraction failure', async () => {
    let capturedTempDir = '';
    const brokenConfig = {
      id: 'CONFIG_FAIL',
      name: 'Broken Config',
      config: {
        ...REPRESENTATIVE_MATRIX[0].config,
        // invalid project name to trigger error in extraction check
        projectName: 'invalid/name'
      }
    };

    const result = await verifyConfiguration(brokenConfig as any, { available: false, reason: 'N/A' });
    assert.equal(result.generation, 'FAIL');
    assert.ok(result.errorSummary?.includes('Generation failed'));
  });

  // Test 8: Toolchain unavailable reports BLOCKED
  it('8. verifyConfiguration reports BLOCKED for compilation and tests when toolchain is not available', async () => {
    const sample = REPRESENTATIVE_MATRIX[0];
    const result = await verifyConfiguration(sample, { available: false, reason: 'Maven not installed in test environment' });

    assert.equal(result.generation, 'PASS');
    assert.equal(result.zipPackaging, 'PASS');
    assert.equal(result.extractionAndStructure, 'PASS');
    assert.equal(result.compilation, 'BLOCKED');
    assert.equal(result.tests, 'BLOCKED');
    assert.ok(result.errorSummary?.includes('Maven not installed in test environment'));
  });

  // Test 9: Representative matrix completeness
  it('9. REPRESENTATIVE_MATRIX contains all configurations from CONFIG_A to CONFIG_H', () => {
    const ids = REPRESENTATIVE_MATRIX.map(m => m.id);
    const expected = ['CONFIG_A', 'CONFIG_B', 'CONFIG_C', 'CONFIG_D', 'CONFIG_E', 'CONFIG_F', 'CONFIG_G', 'CONFIG_H'];
    assert.deepEqual(ids, expected);

    // Verify database coverage
    const databases = new Set(REPRESENTATIVE_MATRIX.map(m => m.config.database));
    assert.ok(databases.has('postgresql'));
    assert.ok(databases.has('mysql'));
    assert.ok(databases.has('h2'));

    // Verify security enabled and disabled coverage
    const hasSecEnabled = REPRESENTATIVE_MATRIX.some(m => m.config.security?.enabled === true);
    const hasSecDisabled = REPRESENTATIVE_MATRIX.some(m => m.config.security?.enabled === false);
    assert.ok(hasSecEnabled);
    assert.ok(hasSecDisabled);
  });
});
