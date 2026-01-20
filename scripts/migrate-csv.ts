#!/usr/bin/env tsx
/**
 * CSV Migration Script
 * 
 * Imports CSV files into Supabase tables.
 * 
 * Usage:
 *   tsx scripts/migrate-csv.ts <csv-file> <table-name> [options]
 * 
 * Options:
 *   --dry-run    Validate CSV without importing
 *   --batch-size <number>  Batch size for processing (default: 100)
 *   --on-conflict <column>  Column to use for upsert conflicts (optional)
 * 
 * Examples:
 *   tsx scripts/migrate-csv.ts data/csv/users.csv profiles
 *   tsx scripts/migrate-csv.ts data/csv/courses.csv courses --on-conflict slug
 *   tsx scripts/migrate-csv.ts data/csv/users.csv profiles --dry-run
 */

// Load environment variables from .env.local (Next.js convention)
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });
config({ path: resolve(process.cwd(), '.env') });

import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCSV } from '@/lib/utils/bulk-upload-parser';
import { createCliSupabaseClient } from '@/lib/supabase/cli';

interface Options {
  dryRun: boolean;
  batchSize: number;
  onConflict?: string;
}

function parseArgs(): { csvFile: string; tableName: string; options: Options } {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: tsx scripts/migrate-csv.ts <csv-file> <table-name> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --dry-run              Validate CSV without importing');
    console.error('  --batch-size <number>   Batch size for processing (default: 100)');
    console.error('  --on-conflict <column>  Column to use for upsert conflicts');
    console.error('');
    console.error('Examples:');
    console.error('  tsx scripts/migrate-csv.ts data/csv/users.csv profiles');
    console.error('  tsx scripts/migrate-csv.ts data/csv/courses.csv courses --on-conflict slug');
    console.error('  tsx scripts/migrate-csv.ts data/csv/users.csv profiles --dry-run');
    process.exit(1);
  }

  const csvFile = args[0];
  const tableName = args[1];
  const options: Options = {
    dryRun: false,
    batchSize: 100,
  };

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (args[i] === '--batch-size' && i + 1 < args.length) {
      options.batchSize = parseInt(args[i + 1], 10);
      if (isNaN(options.batchSize) || options.batchSize < 1) {
        console.error('Error: --batch-size must be a positive number');
        process.exit(1);
      }
      i++;
    } else if (args[i] === '--on-conflict' && i + 1 < args.length) {
      options.onConflict = args[i + 1];
      i++;
    }
  }

  return { csvFile, tableName, options };
}

async function main() {
  const { csvFile, tableName, options } = parseArgs();

  console.log(`📄 CSV File: ${csvFile}`);
  console.log(`📊 Table: ${tableName}`);
  console.log(`🔧 Options:`, {
    dryRun: options.dryRun,
    batchSize: options.batchSize,
    onConflict: options.onConflict || 'none',
  });
  console.log('');

  // Read CSV file
  let csvContent: string;
  try {
    const filePath = join(process.cwd(), csvFile);
    csvContent = readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Parse CSV
  let rows: any[];
  try {
    rows = parseCSV(csvContent);
    console.log(`✅ Parsed ${rows.length} rows from CSV`);
  } catch (error) {
    console.error(`❌ Error parsing CSV: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  if (rows.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  // Show sample row
  console.log('');
  console.log('📋 Sample row:');
  console.log(JSON.stringify(rows[0], null, 2));
  console.log('');

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be imported');
    console.log(`✅ CSV is valid and ready to import ${rows.length} rows into ${tableName}`);
    return;
  }

  // Create Supabase client
  let supabase;
  try {
    supabase = createCliSupabaseClient();
    console.log('✅ Connected to Supabase');
  } catch (error) {
    console.error(`❌ Error connecting to Supabase: ${error instanceof Error ? error.message : String(error)}`);
    console.error('');
    console.error('Make sure you have these environment variables set:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Verify table exists
  try {
    const { error: tableError } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error(`❌ Error accessing table "${tableName}": ${tableError.message}`);
      console.error('');
      console.error('Make sure:');
      console.error('  - The table name is correct (case-sensitive)');
      console.error('  - The table exists in your Supabase database');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error verifying table: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  console.log('✅ Table verified');
  console.log('');

  // Process rows in batches
  let inserted = 0;
  let updated = 0;
  let failed = 0;
  const errors: Array<{ row: number; message: string }> = [];

  const batchSize = options.batchSize;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(rows.length / batchSize);

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (rows ${i + 1}-${Math.min(i + batchSize, rows.length)})...`);

    // Prepare batch data
    const batchData = batch.map((row, idx) => {
      const rowNumber = i + idx + 1;
      
      // Clean up the row data
      const cleanedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        // Convert empty strings to null
        if (value === '' || value === null || value === undefined) {
          cleanedRow[key] = null;
        } else {
          cleanedRow[key] = value;
        }
      }
      
      return cleanedRow;
    });

    try {
      // Insert or upsert
      const upsertOptions: any = {};
      if (options.onConflict) {
        upsertOptions.onConflict = options.onConflict;
      }

      const { data, error } = await supabase
        .from(tableName)
        .upsert(batchData, {
          ...upsertOptions,
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        // If upsert fails, try individual inserts to get better error messages
        console.log(`⚠️  Batch upsert failed, trying individual rows...`);
        
        for (let j = 0; j < batch.length; j++) {
          const row = batchData[j];
          const rowNumber = i + j + 1;
          
          try {
            const { error: rowError } = await supabase
              .from(tableName)
              .upsert(row, {
                ...upsertOptions,
                ignoreDuplicates: false,
              });

            if (rowError) {
              failed++;
              errors.push({
                row: rowNumber,
                message: rowError.message,
              });
            } else {
              // Check if it was an insert or update by querying
              const { data: existing } = await supabase
                .from(tableName)
                .select('*')
                .eq(options.onConflict || 'id', row[options.onConflict || 'id'])
                .maybeSingle();
              
              if (existing) {
                updated++;
              } else {
                inserted++;
              }
            }
          } catch (rowErr) {
            failed++;
            errors.push({
              row: rowNumber,
              message: rowErr instanceof Error ? rowErr.message : String(rowErr),
            });
          }
        }
      } else {
        // Success - count as inserted (upsert doesn't tell us insert vs update)
        inserted += batch.length;
        console.log(`✅ Batch ${batchNumber} processed successfully`);
      }
    } catch (error) {
      failed += batch.length;
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : String(error),
      });
      console.log(`❌ Batch ${batchNumber} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary
  console.log('');
  console.log('📊 Import Summary:');
  console.log(`   ✅ Inserted/Updated: ${inserted + updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total rows: ${rows.length}`);

  if (errors.length > 0) {
    console.log('');
    console.log('❌ Errors:');
    errors.slice(0, 10).forEach(({ row, message }) => {
      console.log(`   Row ${row}: ${message}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
