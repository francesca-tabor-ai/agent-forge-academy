#!/usr/bin/env tsx
/**
 * Schema Validation Script
 * 
 * Validates that required columns exist in the database schema.
 * This prevents issues where code expects columns that don't exist.
 * 
 * Usage:
 *   npm run validate:schema
 *   tsx scripts/validate-schema.ts
 * 
 * Exit codes:
 *   0 - All validations passed
 *   1 - Validation failed
 */

import { createClient } from '@supabase/supabase-js';

// Required columns for student_profiles table
const REQUIRED_COLUMNS = {
  student_profiles: [
    'id',
    'profile_id',
    'visibility',
    'full_name',
    'headline',
    'bio',
    'skills',
    'location',
    'city',        // Required for location parsing
    'country',     // Required for location parsing
    'linkedin_url',
    'github_url',
    'website_url',
    'headshot_image_url',
    'created_at',
    'updated_at',
  ],
} as const;

async function validateSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not set');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not set');
    console.error('   This script requires service role key to query information_schema');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Validating database schema...\n');

  let allValid = true;

  // Validate each table
  for (const [tableName, requiredColumns] of Object.entries(REQUIRED_COLUMNS)) {
    console.log(`📋 Checking table: ${tableName}`);

    // Test query to verify columns exist
    // Using a SELECT with all required columns will fail if any are missing
    const { error: testError } = await supabase
      .from(tableName)
      .select(requiredColumns.join(', '))
      .limit(0); // Don't fetch any rows, just validate the query

    if (testError) {
      const errorMessage = testError.message.toLowerCase();
      
      // Check if error is about missing columns
      const isColumnError = 
        errorMessage.includes('could not find') ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('column');

      if (isColumnError) {
        // Try to identify which columns are missing by testing individually
        const missingColumns: string[] = [];
        
        for (const col of requiredColumns) {
          const { error: colError } = await supabase
            .from(tableName)
            .select(col)
            .limit(0);
          
          if (colError) {
            const colErrorMessage = colError.message.toLowerCase();
            if (colErrorMessage.includes('could not find') || 
                colErrorMessage.includes('does not exist') ||
                colErrorMessage.includes(`column "${col}"`)) {
              missingColumns.push(col);
            }
          }
        }

        if (missingColumns.length > 0) {
          console.error(`   ❌ Missing columns: ${missingColumns.join(', ')}`);
          allValid = false;
        } else {
          // Couldn't identify specific columns, but error suggests schema issue
          console.error(`   ❌ Schema validation failed: ${testError.message}`);
          allValid = false;
        }
      } else {
        // Other database errors (connection, permissions, etc.)
        console.error(`   ❌ Database error: ${testError.message}`);
        allValid = false;
      }
    } else {
      console.log(`   ✅ All ${requiredColumns.length} required columns exist`);
      
      // Verify key location columns specifically
      const locationColumns = ['location', 'city', 'country'];
      const locationStatus = locationColumns.map(col => 
        requiredColumns.includes(col) ? '✓' : '✗'
      ).join(' ');
      console.log(`   📍 Location fields: ${locationStatus} (location, city, country)`);
    }
  }

  console.log('');

  if (allValid) {
    console.log('✅ Schema validation passed!');
    return 0;
  } else {
    console.error('❌ Schema validation failed!');
    console.error('');
    console.error('💡 Next steps:');
    console.error('   1. Run migrations: supabase db push');
    console.error('   2. Refresh schema cache: ./scripts/refresh-schema-cache.sh');
    console.error('   3. Re-run validation: npm run validate:schema');
    return 1;
  }
}

// Run validation
validateSchema()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
