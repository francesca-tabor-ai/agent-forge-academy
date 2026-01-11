import 'server-only';

import { createUserSupabaseClient } from '@/lib/supabase/server';
import type { VideoChapter } from '@/lib/lessons';

// Re-export VideoChapter for convenience
export type { VideoChapter };

// Type definition for Video matching the database schema
export interface Video {
  id: string;
  youtube_id: string;
  title: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  description: string | null;
  video_url: string | null;
  purpose: string | null;
  cover_image_url: string | null;
  instruction: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  tools_used: string[];
  playbook_md: string;
  prompts_md: string;
  steps: unknown[]; // JSONB array
  prompt_items: unknown[]; // JSONB array
  created_at: string;
  updated_at: string;
}

// Search parameters for video search
export interface VideoSearchParams {
  query?: string;
  channel?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tools?: string[];
}

/**
 * Fetches videos by their YouTube IDs
 * @param youtubeIds - Array of YouTube video IDs
 * @returns Array of Video objects matching the provided IDs
 */
export async function getVideosByYoutubeIds(youtubeIds: string[]): Promise<Video[]> {
  if (youtubeIds.length === 0) {
    return [];
  }

  const supabase = await createUserSupabaseClient();
  
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .in('youtube_id', youtubeIds);

  if (error) {
    console.error('Error fetching videos by YouTube IDs:', error);
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }

  return (data || []) as Video[];
}

/**
 * Fetches a single video by its YouTube ID
 * @param youtubeId - YouTube video ID
 * @returns Video object or null if not found
 */
export async function getVideoByYoutubeId(youtubeId: string): Promise<Video | null> {
  if (!youtubeId || youtubeId.trim().length === 0) {
    return null;
  }

  const supabase = await createUserSupabaseClient();
  
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('youtube_id', youtubeId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching video by YouTube ID:', error);
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return data as Video;
}

/**
 * Searches videos with optional filters
 * @param params - Search parameters (query, channel, difficulty, tools)
 * @returns Array of Video objects matching the search criteria
 */
export async function searchVideos(params: VideoSearchParams = {}): Promise<Video[]> {
  const supabase = await createUserSupabaseClient();
  let query = supabase.from('videos').select('*');

  // Filter by title query (case-insensitive partial match)
  if (params.query && params.query.trim().length > 0) {
    query = query.ilike('title', `%${params.query.trim()}%`);
  }

  // Filter by channel name
  if (params.channel && params.channel.trim().length > 0) {
    query = query.eq('channel_name', params.channel.trim());
  }

  // Filter by difficulty
  if (params.difficulty) {
    query = query.eq('difficulty', params.difficulty);
  }

  // Filter by tools (array overlap - videos that use any of the specified tools)
  if (params.tools && params.tools.length > 0) {
    // Filter out empty strings and trim
    const validTools = params.tools
      .map(tool => tool.trim())
      .filter(tool => tool.length > 0);
    
    if (validTools.length > 0) {
      // Use array overlap operator (&&) to find videos that have any of the specified tools
      query = query.overlaps('tools_used', validTools);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching videos:', error);
    throw new Error(`Failed to search videos: ${error.message}`);
  }

  return (data || []) as Video[];
}
