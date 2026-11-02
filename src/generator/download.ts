/**
 * Safe browser download utility for generated Spring Boot project ZIP archives.
 * Manages Blob conversion, URL revocation, concurrent-click guards, and error propagation.
 */

import { GeneratedProject, ProjectConfig } from './types';
import { packageProjectToZip, sanitizeArchiveRoot, ZipPackagingError } from './zipPackaging';

let isDownloadInProgress = false;

export interface DownloadResult {
  filename: string;
  sizeBytes: number;
}

/**
 * Initiates a browser file download from a Blob and reliably revokes the object URL.
 */
export function triggerBrowserBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new ZipPackagingError('Browser download can only be triggered in a browser environment.');
  }

  if (!blob || !(blob instanceof Blob) || blob.size === 0) {
    throw new ZipPackagingError('Invalid or empty Blob provided for download.');
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    // Revoke object URL after a short timeout so browser can complete opening the stream
    setTimeout(() => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // Ignore revocation errors if already released
      }
    }, 1500);
  }
}

/**
 * Packages a Spring Boot project into a ZIP archive and triggers a browser download.
 * Guarded against concurrent execution.
 */
export async function downloadProjectZip(
  target: GeneratedProject | ProjectConfig,
  customFilename?: string
): Promise<DownloadResult> {
  if (isDownloadInProgress) {
    throw new ZipPackagingError('A project download is already in progress. Please wait.');
  }

  isDownloadInProgress = true;

  try {
    const zipBytes = await packageProjectToZip(target);

    const baseName =
      'summary' in target
        ? target.summary.projectName
        : target.projectName;

    const safeBaseName = sanitizeArchiveRoot(baseName);
    const finalFilename = customFilename
      ? (customFilename.endsWith('.zip') ? customFilename : `${customFilename}.zip`)
      : `${safeBaseName}.zip`;

    // In browser environment, trigger download
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const arrayBuffer = zipBytes.buffer.slice(
        zipBytes.byteOffset,
        zipBytes.byteOffset + zipBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: 'application/zip' });
      triggerBrowserBlobDownload(blob, finalFilename);
    }

    return {
      filename: finalFilename,
      sizeBytes: zipBytes.byteLength
    };
  } finally {
    isDownloadInProgress = false;
  }
}
