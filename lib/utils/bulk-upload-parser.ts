/**
 * Bulk Upload File Parsers
 * 
 * Parses CSV and JSON files for bulk upload operations
 */

/**
 * Parse CSV content into array of objects
 * Assumes first row is headers
 * Handles quoted values, commas within quotes, and newlines within quoted fields
 */
export function parseCSV(content: string): any[] {
  if (!content || content.trim().length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse CSV handling quoted values and multi-line fields
  function parseCSVRows(csvContent: string): string[][] {
    const rows: string[][] = [];
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let rowNumber = 1;

    for (let i = 0; i < csvContent.length; i++) {
      const char = csvContent[i];
      const nextChar = csvContent[i + 1];
      const prevChar = i > 0 ? csvContent[i - 1] : '';

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (double quote)
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current);
        current = '';
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
        // End of row (only if not in quotes)
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n after \r
        }
        values.push(current);
        current = '';
        
        // Only add row if it has values (skip empty rows)
        if (values.length > 0 && values.some(v => v.trim().length > 0)) {
          rows.push(values.map(v => v.trim()));
        }
        values.length = 0; // Clear array
        rowNumber++;
      } else if (char !== '\r') {
        // Add character (skip standalone \r, handle \r\n above)
        current += char;
      }
    }

    // Add last field and row if content doesn't end with newline
    if (current.length > 0 || values.length > 0) {
      values.push(current);
      if (values.length > 0 && values.some(v => v.trim().length > 0)) {
        rows.push(values.map(v => v.trim()));
      }
    }

    return rows;
  }

  const allRows = parseCSVRows(content);
  
  if (allRows.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = allRows[0].map(h => h.replace(/^"|"$/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < allRows.length; i++) {
    const rowValues = allRows[i].map(v => {
      const cleaned = v.replace(/^"|"$/g, '');
      return cleaned === '' ? null : cleaned;
    });

    if (rowValues.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${rowValues.length} columns, expected ${headers.length}`);
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = rowValues[index];
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse JSON content into array of objects
 * Supports both array of objects and single object
 */
export function parseJSON(content: string): any[] {
  try {
    const parsed = JSON.parse(content);
    
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Single object, wrap in array
      return [parsed];
    } else {
      throw new Error('JSON must be an object or array of objects');
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}
