#!/usr/bin/env node
/**
 * CLI script to sync course metadata from MD files to Supabase
 * 
 * Usage:
 *   npm run sync-courses
 *   npm run sync-courses -- --dry-run
 *   npm run sync-courses -- --delete-missing
 */

// Load environment variables from .env.local (Next.js convention)
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });
config({ path: resolve(process.cwd(), '.env') });

import { createCliSupabaseClient } from '../lib/supabase/cli';
import { syncCoursesToDatabase } from '../lib/course-sync/sync-to-db';
import { extractAllCourseMetadata, validateAllCourseMetadata } from '../lib/course-sync/extract-metadata';

interface CliOptions {
  dryRun: boolean;
  deleteMissing: boolean;
  skipValidation: boolean;
  verbose: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  
  return {
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    deleteMissing: args.includes('--delete-missing'),
    skipValidation: args.includes('--skip-validation'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
}

function printResults(result: Awaited<ReturnType<typeof syncCoursesToDatabase>>, options: CliOptions) {
  console.log('\n' + '='.repeat(60));
  console.log('Course Sync Results');
  console.log('='.repeat(60));
  
  if (options.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No changes were made to the database\n');
  }

  console.log('\nSummary:');
  console.log(`  Total courses found: ${result.summary.total}`);
  console.log(`  ✅ Created: ${result.summary.created}`);
  console.log(`  🔄 Updated: ${result.summary.updated}`);
  console.log(`  ❌ Deleted: ${result.summary.deleted}`);
  console.log(`  ➖ Unchanged: ${result.summary.unchanged}`);
  console.log(`  ⚠️  Errors: ${result.summary.errors}`);

  if (result.created.length > 0) {
    console.log('\n📝 Created courses:');
    result.created.forEach((course) => {
      console.log(`  - ${course.slug}: ${course.title}`);
    });
  }

  if (result.updated.length > 0) {
    console.log('\n🔄 Updated courses:');
    result.updated.forEach((course) => {
      console.log(`  - ${course.slug}: ${course.title}`);
    });
  }

  if (result.deleted.length > 0) {
    console.log('\n❌ Deleted courses:');
    result.deleted.forEach((course) => {
      console.log(`  - ${course.slug}: ${course.title}`);
    });
  }

  if (result.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    result.errors.forEach((error) => {
      console.log(`  - ${error.course}: ${error.error}`);
    });
  }

  if (options.verbose && result.unchanged.length > 0) {
    console.log('\n➖ Unchanged courses:');
    result.unchanged.forEach((course) => {
      console.log(`  - ${course.slug}: ${course.title}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

async function main() {
  const options = parseArgs();

  console.log('Starting course sync...\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Missing required environment variables');
    console.error('');
    console.error('   Required variables:');
    if (!supabaseUrl) {
      console.error('     - NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!supabaseServiceKey) {
      console.error('     - SUPABASE_SERVICE_ROLE_KEY');
    }
    console.error('');
    console.error('   Please ensure these are set in your .env.local file:');
    console.error('     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.error('     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
    console.error('');
    console.error('   Or export them in your shell before running the script.');
    process.exit(1);
  }

  try {
    // Extract and validate metadata first
    console.log('📖 Extracting course metadata from files...');
    const metadataSources = extractAllCourseMetadata();
    console.log(`   Found ${metadataSources.length} courses\n`);

    if (options.verbose) {
      console.log('Course metadata sources:');
      metadataSources.forEach((source) => {
        console.log(`  - ${source.courseSlug}: ${source.sourceFile}`);
      });
      console.log('');
    }

    // Validate metadata
    if (!options.skipValidation) {
      console.log('✅ Validating course metadata...');
      const validations = validateAllCourseMetadata(metadataSources);
      const invalid = validations.filter((v) => !v.validation.valid);
      
      if (invalid.length > 0) {
        console.error('\n❌ Validation errors found:');
        invalid.forEach(({ source, validation }) => {
          console.error(`  - ${source.courseSlug}:`);
          validation.errors.forEach((error) => {
            console.error(`    • ${error.field}: ${error.message}`);
          });
        });
        
        if (!options.dryRun) {
          console.error('\n⚠️  Fix validation errors before syncing.');
          process.exit(1);
        }
      } else {
        console.log('   All courses validated successfully\n');
      }
    }

    // Sync to database
    console.log('🔄 Syncing to database...');
    const supabase = createCliSupabaseClient();
    const result = await syncCoursesToDatabase(supabase, {
      dryRun: options.dryRun,
      deleteMissing: options.deleteMissing,
      skipValidation: options.skipValidation,
    });

    // Print results
    printResults(result, options);

    // Exit with error code if there were errors
    if (result.summary.errors > 0) {
      process.exit(1);
    }

    console.log('\n✅ Sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Fatal error during sync:');
    console.error(error instanceof Error ? error.message : String(error));
    if (options.verbose && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };
