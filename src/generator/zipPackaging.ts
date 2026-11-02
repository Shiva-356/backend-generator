/**
 * Secure, deterministic ZIP archive packaging engine for generated Spring Boot projects.
 * Enforces path safety, directory isolation, duplicate prevention, and archive integrity.
 */

import JSZip from 'jszip';
import { GeneratedProject, ProjectConfig } from './types';
import { generateSpringBootProject } from './index';

export class ZipPackagingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipPackagingError';
  }
}

export interface ZipExportOptions {
  rootDirName?: string;
  compressionLevel?: number;
}

/**
 * Sanitizes a folder or file name for archive roots across operating systems.
 */
export function sanitizeArchiveRoot(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'generated-project';
  }
  const sanitized = name
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return sanitized.length > 0 ? sanitized : 'generated-project';
}

/**
 * Validates and sanitizes root directory names.
 * Rejects traversal, path separators, absolute paths, and null bytes rather than relying on substring replacement.
 */
export function validateArchiveRoot(name: string): string {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ZipPackagingError('Root directory name must be a non-empty string.');
  }

  const trimmed = name.trim();

  if (trimmed.includes('\0')) {
    throw new ZipPackagingError(`Null byte is not allowed in root directory name: "${name}"`);
  }

  if (trimmed.includes('..') || trimmed.includes('%2e%2e') || trimmed.includes('%2E%2E')) {
    throw new ZipPackagingError(`Directory traversal ("..") is not allowed in root directory name: "${name}"`);
  }

  if (
    trimmed.includes('/') ||
    trimmed.includes('\\') ||
    trimmed.includes('%2f') ||
    trimmed.includes('%2F') ||
    trimmed.includes('%5c') ||
    trimmed.includes('%5C')
  ) {
    throw new ZipPackagingError(`Path separators are not allowed in root directory name: "${name}"`);
  }

  if (/^[a-zA-Z]:/.test(trimmed) || trimmed.startsWith('/')) {
    throw new ZipPackagingError(`Absolute paths are not allowed in root directory name: "${name}"`);
  }

  const sanitized = sanitizeArchiveRoot(trimmed);
  if (!sanitized || sanitized.length === 0) {
    throw new ZipPackagingError(`Invalid root directory name after sanitization: "${name}"`);
  }

  return sanitized;
}

/**
 * Normalizes relative file paths for ZIP entries:
 * - Converts backslashes to forward slashes.
 * - Trims whitespace.
 * - Disallows absolute paths (leading slash or Windows drive).
 * - Disallows directory traversal ("..").
 * - Strips leading/trailing slashes.
 * - Disallows null bytes and empty paths.
 */
export function normalizeZipPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') {
    throw new ZipPackagingError('File path must be a non-empty string.');
  }

  if (rawPath.includes('\0')) {
    throw new ZipPackagingError(`Null byte is not allowed in ZIP path: "${rawPath}"`);
  }

  // Reject URL-encoded directory traversal and separators
  if (/%2e%2e|%2e\.|%2f|%5c/i.test(rawPath)) {
    throw new ZipPackagingError(`Encoded path traversal or separator is not allowed in ZIP path: "${rawPath}"`);
  }

  // Convert Windows backslashes to forward slashes
  const normalized = rawPath.replace(/\\/g, '/').trim();

  // Check for absolute paths
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized)) {
    throw new ZipPackagingError(`Absolute paths are not allowed in ZIP archive: "${rawPath}"`);
  }

  // Split into segments and inspect for directory traversal
  const rawSegments = normalized.split('/');
  const cleanSegments: string[] = [];

  for (const seg of rawSegments) {
    if (seg === '' || seg === '.') {
      continue;
    }
    if (seg === '..' || seg.startsWith('..')) {
      throw new ZipPackagingError(`Directory traversal ("..") is not allowed in ZIP archive: "${rawPath}"`);
    }
    cleanSegments.push(seg);
  }

  if (cleanSegments.length === 0) {
    throw new ZipPackagingError(`Normalized path resulted in an empty path: "${rawPath}"`);
  }

  return cleanSegments.join('/');
}

const REQUIRED_CORE_FILES = [
  'pom.xml',
  'README.md',
  '.gitignore',
  'src/main/resources/application.properties'
];

/**
 * Validates the file collection before packaging into a ZIP archive.
 */
export function validateFileCollection(files: { path: string; content: string }[]): { path: string; content: string }[] {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ZipPackagingError('Cannot package an empty file collection into a ZIP archive.');
  }

  const seenPaths = new Set<string>();
  const lowerCasePaths = new Set<string>();
  const validatedFiles: { path: string; content: string }[] = [];

  for (const file of files) {
    if (!file || typeof file.path !== 'string') {
      throw new ZipPackagingError('Encountered an invalid file entry without a path.');
    }

    if (file.content === undefined || file.content === null) {
      throw new ZipPackagingError(`File "${file.path}" has null or undefined content.`);
    }

    const normPath = normalizeZipPath(file.path);
    const lowerPath = normPath.toLowerCase();

    if (seenPaths.has(normPath)) {
      throw new ZipPackagingError(`Duplicate file path detected in ZIP archive: "${normPath}"`);
    }
    if (lowerCasePaths.has(lowerPath)) {
      throw new ZipPackagingError(`Case-insensitive duplicate file path detected in ZIP archive: "${normPath}"`);
    }
    seenPaths.add(normPath);
    lowerCasePaths.add(lowerPath);

    validatedFiles.push({
      path: normPath,
      content: file.content
    });
  }

  // Check for conflicting paths (where a file path collides with a directory prefix)
  const dirPaths = new Set<string>();
  for (const file of validatedFiles) {
    const segments = file.path.split('/');
    let current = '';
    for (let i = 0; i < segments.length - 1; i++) {
      current = current ? `${current}/${segments[i]}` : segments[i];
      dirPaths.add(current);
    }
  }

  for (const file of validatedFiles) {
    if (dirPaths.has(file.path)) {
      throw new ZipPackagingError(
        `Conflicting path detected in ZIP archive: "${file.path}" cannot be both a file and a directory.`
      );
    }
  }

  // Verify core build and configuration files exist
  for (const req of REQUIRED_CORE_FILES) {
    if (!seenPaths.has(req)) {
      throw new ZipPackagingError(`Required project file "${req}" is missing from the generated file collection.`);
    }
  }

  // Verify at least one Java application class exists
  const hasJavaApp = Array.from(seenPaths).some(p => p.endsWith('Application.java'));
  if (!hasJavaApp) {
    throw new ZipPackagingError('Spring Boot Application entry point class is missing from the generated file collection.');
  }

  return validatedFiles;
}

function isGeneratedProject(target: GeneratedProject | ProjectConfig): target is GeneratedProject {
  return typeof target === 'object' && target !== null && 'files' in target && Array.isArray((target as GeneratedProject).files);
}

/**
 * Packages generated Spring Boot files into an in-memory ZIP archive using JSZip.
 * Browser and Node compatible. Returns a Uint8Array containing the binary ZIP.
 */
export async function packageProjectToZip(
  target: GeneratedProject | ProjectConfig,
  options?: ZipExportOptions
): Promise<Uint8Array> {
  const project: GeneratedProject = isGeneratedProject(target)
    ? target
    : generateSpringBootProject(target);

  const validatedFiles = validateFileCollection(project.files);

  const rootTarget = options?.rootDirName || project.summary.projectName;
  const rootName = validateArchiveRoot(rootTarget);
  const zip = new JSZip();
  const rootFolder = zip.folder(rootName);

  if (!rootFolder) {
    throw new ZipPackagingError(`Failed to create root directory "${rootName}" in ZIP archive.`);
  }

  // Add validated files under the predictable root directory
  for (const file of validatedFiles) {
    rootFolder.file(file.path, file.content);
  }

  const compressionLevel = Math.min(Math.max(options?.compressionLevel ?? 6, 1), 9);

  try {
    const zipBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel }
    });

    if (!zipBytes || zipBytes.byteLength === 0) {
      throw new ZipPackagingError('Generated ZIP archive is empty (0 bytes).');
    }

    // Verify ZIP magic bytes (PK\x03\x04 = 0x50, 0x4B, 0x03, 0x04)
    if (zipBytes[0] !== 0x50 || zipBytes[1] !== 0x4b || zipBytes[2] !== 0x03 || zipBytes[3] !== 0x04) {
      throw new ZipPackagingError('Generated archive failed ZIP magic bytes verification.');
    }

    return zipBytes;
  } catch (err: unknown) {
    if (err instanceof ZipPackagingError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new ZipPackagingError(`ZIP compression failed: ${message}`);
  }
}
