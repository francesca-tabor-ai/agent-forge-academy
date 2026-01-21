#!/usr/bin/env tsx
/**
 * Upload videos from CSV to Supabase
 * 
 * Usage:
 *   tsx scripts/upload-videos-from-csv.ts [csv-file]
 * 
 * If no CSV file is provided, defaults to:
 *   data/csv/video-upload/starter_story_videos.csv
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

interface CSVVideoRow {
  youtubeId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  description: string;
  videoUrl: string;
}

async function uploadVideosFromCSV(csvFilePath: string) {
  console.log('Starting video upload from CSV...\n');

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
    process.exit(1);
  }

  // Read CSV file
  let csvContent: string;
  try {
    const filePath = join(process.cwd(), csvFilePath);
    console.log(`📄 Reading CSV file: ${filePath}`);
    csvContent = readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ Error reading CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  // Parse CSV
  let rows: CSVVideoRow[];
  try {
    console.log('📊 Parsing CSV...');
    rows = parseCSV(csvContent) as CSVVideoRow[];
    console.log(`✅ Parsed ${rows.length} video rows\n`);
  } catch (error) {
    console.error(`❌ Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  // Validate required columns
  if (rows.length === 0) {
    console.error('❌ Error: CSV file is empty or has no data rows');
    process.exit(1);
  }

  const requiredColumns = ['youtubeId', 'title', 'channelName', 'thumbnailUrl', 'description', 'videoUrl'];
  const firstRow = rows[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    console.error(`❌ Error: Missing required columns: ${missingColumns.join(', ')}`);
    console.error(`   Found columns: ${Object.keys(firstRow).join(', ')}`);
    process.exit(1);
  }

  const supabase = createCliSupabaseClient();

  let successCount = 0;
  let skipCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  console.log(`Processing ${rows.length} videos...\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because CSV has header row and 1-based indexing

    try {
      // Validate row data
      if (!row.youtubeId || !row.youtubeId.trim()) {
        console.error(`❌ Row ${rowNumber}: Missing youtubeId`);
        errorCount++;
        continue;
      }

      const youtubeId = row.youtubeId.trim();

      // Check if video already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('youtube_id, title')
        .eq('youtube_id', youtubeId)
        .single();

      // Prepare video data
      const videoData = {
        youtube_id: youtubeId,
        video_url: row.videoUrl?.trim() || null,
        title: row.title?.trim() || null,
        channel_name: row.channelName?.trim() || null,
        thumbnail_url: row.thumbnailUrl?.trim() || null,
        description: row.description?.trim() || null,
        // Set defaults for fields not in CSV
        purpose: null,
        difficulty: null,
        tools_used: [] as string[],
        playbook_md: '',
        prompts_md: '',
        steps: [],
        prompt_items: [],
      };

      if (existing) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('youtube_id', youtubeId);

        if (error) {
          console.error(`❌ Row ${rowNumber} (${youtubeId}): Error updating - ${error.message}`);
          errorCount++;
        } else {
          console.log(`🔄 Updated ${youtubeId} - ${row.title?.substring(0, 50) || 'No title'}...`);
          updateCount++;
        }
      } else {
        // Insert new video
        const { error } = await supabase
          .from('videos')
          .insert(videoData);

        if (error) {
          console.error(`❌ Row ${rowNumber} (${youtubeId}): Error inserting - ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Added ${youtubeId} - ${row.title?.substring(0, 50) || 'No title'}...`);
          successCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Row ${rowNumber}: Error processing - ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Video Upload Results');
  console.log('='.repeat(60));
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`🔄 Updated: ${updateCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    console.error('\n⚠️  Some videos failed to upload. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ All videos processed successfully!');
  }
}

// Parse command line arguments
const csvFile = process.argv[2] || 'data/csv/video-upload/starter_story_videos.csv';

// Run if called directly
if (require.main === module) {
  uploadVideosFromCSV(csvFile).catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { uploadVideosFromCSV };
