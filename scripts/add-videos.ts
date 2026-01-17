#!/usr/bin/env node
/**
 * CLI script to add videos to the database
 * 
 * Usage:
 *   npm run add-videos
 *   tsx scripts/add-videos.ts
 */

// Load environment variables from .env.local (Next.js convention)
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });
config({ path: resolve(process.cwd(), '.env') });

import { createCliSupabaseClient } from '../lib/supabase/cli';

interface VideoInput {
  youtubeId: string;
  url: string;
  tool: string;
  purpose?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Extract YouTube video ID from URL
 */
function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract YouTube playlist ID from URL
 */
function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^&\n?#]+)/);
  return match ? match[1] : null;
}

/**
 * Videos to add, organized by tool/platform
 */
const videosToAdd: VideoInput[] = [
  // ComfyUI
  {
    youtubeId: 'Zko_s2LO9Wo',
    url: 'https://www.youtube.com/watch?v=Zko_s2LO9Wo',
    tool: 'ComfyUI',
    purpose: 'ComfyUI tutorial/intro',
  },
  // Note: ComfyUI playlists need to be processed separately with YouTube API:
  // - https://www.youtube.com/playlist?list=PLytT-JPS5UETbSOUKRlxE6ADyLY8TMP5e
  // - https://www.youtube.com/playlist?list=PLeSRFsDW9Go8gcQpp9kBBOCnsE-EdhMGF

  // Weavy AI / Figma Weave
  {
    youtubeId: 'SMAaksR_1qg',
    url: 'https://www.youtube.com/watch?v=SMAaksR_1qg',
    tool: 'Weavy AI',
    purpose: 'Weavy AI / Figma Weave tutorial',
  },
  {
    youtubeId: 'ihOFi5lpQr8',
    url: 'https://www.youtube.com/watch?v=ihOFi5lpQr8',
    tool: 'Weavy AI',
    purpose: 'Weavy AI / Figma Weave tutorial',
  },

  // Flora AI
  {
    youtubeId: 'fmXXp6lobi0',
    url: 'https://www.youtube.com/watch?v=fmXXp6lobi0',
    tool: 'Flora AI',
    purpose: 'Flora AI tutorial/intro',
  },

  // Fal.ai
  {
    youtubeId: 'FTKnTYmfMv8',
    url: 'https://www.youtube.com/watch?v=FTKnTYmfMv8',
    tool: 'Fal.ai',
    purpose: 'Fal.ai tutorial',
  },
  {
    youtubeId: 'bZhzgQuOZpg',
    url: 'https://www.youtube.com/watch?v=bZhzgQuOZpg',
    tool: 'Fal.ai',
    purpose: 'Fal.ai tutorial',
  },
  {
    youtubeId: 'PdU6D57ejAI',
    url: 'https://www.youtube.com/watch?v=PdU6D57ejAI',
    tool: 'Fal.ai',
    purpose: 'Fal.ai tutorial',
  },
  // Note: Fal.ai playlist needs to be processed separately with YouTube API:
  // - https://www.youtube.com/playlist?list=PLg9z7TXgYiH1doa0wMTCzG5X2Z5JAuxYk

  // Phygital+
  {
    youtubeId: 'xcQquEpX0nY',
    url: 'https://www.youtube.com/watch?v=xcQquEpX0nY',
    tool: 'Phygital+',
    purpose: 'Phygital+ AI workflow environment - intro/tutorial',
  },
  {
    youtubeId: 'iXCr9k0GGZo',
    url: 'https://www.youtube.com/watch?v=iXCr9k0GGZo',
    tool: 'Phygital+',
    purpose: 'Phygital+ AI workflow environment - intro/tutorial',
  },
  {
    youtubeId: '_w9lBgc5nzM',
    url: 'https://www.youtube.com/watch?v=_w9lBgc5nzM',
    tool: 'Phygital+',
    purpose: 'Phygital+ AI workflow environment - intro/tutorial',
  },

  // Workflow Content (n8n & Fal.ai)
  {
    youtubeId: 'M83nNHQ-ufQ',
    url: 'https://www.youtube.com/watch?v=M83nNHQ-ufQ',
    tool: 'n8n',
    purpose: 'AI workflow with n8n & Fal.ai - node-style automation',
  },
  {
    youtubeId: '4GNo72yQ-cg',
    url: 'https://www.youtube.com/watch?v=4GNo72yQ-cg',
    tool: 'Fal.ai',
    purpose: 'Fal.ai API + n8n setup - workflow integration',
  },
];

async function addVideos() {
  console.log('Starting video addition...\n');

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

  const supabase = createCliSupabaseClient();

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  console.log(`Processing ${videosToAdd.length} videos...\n`);

  for (const video of videosToAdd) {
    try {
      // Check if video already exists
      const { data: existing } = await supabase
        .from('videos')
        .select('youtube_id')
        .eq('youtube_id', video.youtubeId)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${video.youtubeId} (${video.tool}) - already exists`);
        skipCount++;
        continue;
      }

      // Prepare video data
      const videoData = {
        youtube_id: video.youtubeId,
        video_url: video.url,
        title: null, // Will be populated later via YouTube API if needed
        channel_name: null,
        thumbnail_url: null,
        description: null,
        purpose: video.purpose || null,
        difficulty: video.difficulty || null,
        tools_used: [video.tool],
        playbook_md: '',
        prompts_md: '',
        steps: [],
        prompt_items: [],
      };

      // Insert video
      const { error } = await supabase
        .from('videos')
        .insert(videoData);

      if (error) {
        console.error(`❌ Error adding ${video.youtubeId} (${video.tool}): ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Added ${video.youtubeId} (${video.tool})`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${video.youtubeId} (${video.tool}):`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Video Addition Results');
  console.log('='.repeat(60));
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addVideos().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { addVideos };
