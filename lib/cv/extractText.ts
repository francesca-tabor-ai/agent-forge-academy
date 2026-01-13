/**
 * CV Text Extraction Utility
 * 
 * Extracts plain text from PDF and DOCX files.
 * Currently supports text-layer extraction from PDFs only.
 * OCR support for scanned PDFs is TODO.
 */

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
  method?: 'pdf-text' | 'docx-text' | 'ocr'; // OCR is TODO
}

/**
 * Extract text from a PDF file (text-layer only)
 * TODO: Add OCR support for scanned PDFs
 */
async function extractTextFromPDF(file: File | Buffer): Promise<ExtractionResult> {
  try {
    let buffer: Buffer;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    const data = await pdfParse(buffer);
    
    // Extract text and clean it up
    const text = data.text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    if (!text || text.length === 0) {
      return {
        text: '',
        success: false,
        error: 'No text found in PDF. This may be a scanned PDF. OCR support is TODO.',
        method: 'pdf-text',
      };
    }

    return {
      text,
      success: true,
      method: 'pdf-text',
    };
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract text from PDF',
      method: 'pdf-text',
    };
  }
}

/**
 * Extract text from a DOCX file
 */
async function extractTextFromDOCX(file: File | Buffer): Promise<ExtractionResult> {
  try {
    let buffer: Buffer;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    const result = await mammoth.extractRawText({ buffer });
    
    // Extract text and clean it up
    const text = result.value
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    if (!text || text.length === 0) {
      return {
        text: '',
        success: false,
        error: 'No text found in DOCX file',
        method: 'docx-text',
      };
    }

    return {
      text,
      success: true,
      method: 'docx-text',
    };
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract text from DOCX',
      method: 'docx-text',
    };
  }
}

/**
 * Extract text from a CV file (PDF or DOCX)
 * 
 * @param file - The file to extract text from
 * @param mimeType - The MIME type of the file (e.g., 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
 * @returns Extraction result with text and metadata
 */
export async function extractTextFromCV(
  file: File | Buffer,
  mimeType?: string
): Promise<ExtractionResult> {
  // Determine file type from MIME type or file extension
  const fileType = mimeType || (file instanceof File ? file.type : '');
  
  if (fileType === 'application/pdf' || (file instanceof File && file.name.toLowerCase().endsWith('.pdf'))) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    (file instanceof File && file.name.toLowerCase().endsWith('.docx'))
  ) {
    return extractTextFromDOCX(file);
  } else {
    return {
      text: '',
      success: false,
      error: `Unsupported file type: ${fileType || 'unknown'}. Only PDF and DOCX files are supported.`,
    };
  }
}

/**
 * Extract text from a CV file stored in Supabase Storage
 * 
 * @param supabase - Supabase client
 * @param filePath - Path to the file in storage (e.g., 'user-id/resume-timestamp.pdf')
 * @param bucket - Storage bucket name (defaults to env var or 'resumes')
 * @returns Extraction result with text and metadata
 */
export async function extractTextFromStoredCV(
  supabase: any,
  filePath: string,
  bucket?: string
): Promise<ExtractionResult> {
  // Use provided bucket or get from env var
  const bucketName = bucket || (await import('@/lib/utils/storage')).getResumeBucketName();
  try {
    // Download file from storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      return {
        text: '',
        success: false,
        error: `Failed to download file: ${error.message}`,
      };
    }

    if (!data) {
      return {
        text: '',
        success: false,
        error: 'File not found in storage',
      };
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file type from extension
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'pdf') {
      return extractTextFromPDF(buffer);
    } else if (fileExtension === 'docx') {
      return extractTextFromDOCX(buffer);
    } else {
      return {
        text: '',
        success: false,
        error: `Unsupported file type: ${fileExtension}. Only PDF and DOCX files are supported.`,
      };
    }
  } catch (error) {
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract text from stored CV',
    };
  }
}
