/**
 * TypeScript types for student_profiles table
 * 
 * This file provides type definitions that match the database schema exactly.
 * Use these types when working with student profile data from the API.
 */

/**
 * Complete student profile type matching the database schema
 * 
 * All fields match the student_profiles table columns exactly.
 */
export interface StudentProfile {
  id: string;
  profile_id: string;
  visibility: 'private' | 'recruiters_only' | 'public';
  full_name: string | null;
  headline: string;
  bio: string | null;
  skills: string[] | null;
  location: string | null;  // Original user input (e.g., "London, UK")
  city: string | null;      // Normalized city key (e.g., "london")
  country: string | null;   // Country/state (e.g., "UK")
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  headshot_image_url: string | null;
  cv_text: string | null;
  email_preferences?: {
    weekly_learning_emails_enabled?: boolean;
    weekly_jobs_emails_enabled?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Student profile fields that can be updated via API
 * 
 * Excludes read-only fields like id, profile_id, created_at, updated_at
 */
export interface StudentProfileUpdate {
  full_name?: string | null;
  headline?: string;
  bio?: string | null;
  skills?: string[];
  location?: string | null;
  city?: string | null;      // Should be set via parseLocation(location)
  country?: string | null;   // Should be set via parseLocation(location)
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
  headshot_image_url?: string | null;
  visibility?: 'private' | 'recruiters_only' | 'public';
}

/**
 * Student profile fields returned from GET /api/portfolio/profile
 * 
 * This is the subset of fields typically returned to the client
 */
export interface StudentProfileResponse {
  id: string;
  full_name: string | null;
  headline: string;
  bio: string | null;
  skills: string[];
  location: string | null;
  city: string | null;
  country: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  headshot_image_url: string | null;
}

/**
 * Student profile fields for form input
 * 
 * Used in ProfileEditForm - only includes fields that users can edit
 */
export interface StudentProfileFormData {
  full_name: string;
  headline: string;
  bio: string;
  skills: string[];
  location: string;  // Single field - parsed into city/country by API
  linkedin_url: string;
  github_url: string;
  website_url: string;
  headshot_image_url?: string | null;
}
