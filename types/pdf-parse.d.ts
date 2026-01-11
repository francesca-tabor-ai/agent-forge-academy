/**
 * Type definitions for pdf-parse
 * @see https://www.npmjs.com/package/pdf-parse
 */

declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
    Trapped?: string;
  }

  interface PDFMetadata {
    info?: PDFInfo;
    metadata?: any;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata | null;
    text: string;
    version: string;
  }

  interface PDFParseOptions {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }

  function pdfParse(
    data: Buffer | Uint8Array | string,
    options?: PDFParseOptions
  ): Promise<PDFData>;

  export = pdfParse;
}
