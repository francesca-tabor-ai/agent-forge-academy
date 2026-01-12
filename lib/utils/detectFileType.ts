/**
 * Safely detect file MIME type from file content (magic bytes)
 * Do not trust client-provided MIME types
 */

/**
 * Detect MIME type from file buffer by checking magic bytes
 * @param buffer - File buffer
 * @param fileName - Optional filename for fallback detection
 * @returns Detected MIME type or null if unknown
 */
export async function detectMimeTypeFromBuffer(
  buffer: Buffer | ArrayBuffer,
  fileName?: string
): Promise<string | null> {
  const buf = buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;
  
  // Check magic bytes (file signatures)
  // PDF: %PDF
  if (buf.length >= 4 && buf.subarray(0, 4).toString() === '%PDF') {
    return 'application/pdf';
  }
  
  // DOCX: PK\x03\x04 (ZIP file signature, DOCX is a ZIP archive)
  if (buf.length >= 4) {
    const header = buf.subarray(0, 4);
    if (header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04) {
      // Check if it's actually a DOCX by looking for word/ in the ZIP
      // This is a simplified check - in production you might want to parse the ZIP
      try {
        const headerStr = buf.subarray(0, 100).toString('utf-8', 0, 100);
        if (headerStr.includes('word/') || headerStr.includes('WordDocument')) {
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
      } catch {
        // If we can't read as UTF-8, fall back to extension check
      }
      
      // If it's a ZIP but we can't confirm it's DOCX, check extension
      if (fileName?.toLowerCase().endsWith('.docx')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
    }
  }
  
  // Fallback to extension-based detection (less secure but better than nothing)
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') {
      return 'application/pdf';
    }
    if (ext === 'docx') {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  }
  
  return null;
}

/**
 * Validate file type is PDF or DOCX
 * @param mimeType - Detected MIME type
 * @returns true if valid
 */
export function isValidCVFileType(mimeType: string | null): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return mimeType !== null && allowedTypes.includes(mimeType);
}
