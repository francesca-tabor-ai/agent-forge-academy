# Project Images Implementation

## Overview

This document describes the implementation of project image uploads (cover + gallery) using Supabase Storage with proper RLS policies and API routes.

## Implementation Summary

### Step 1: Database Schema ✅

**Migration:** `supabase/migrations/20250122000001_add_project_images_schema.sql`

1. **Added to `portfolio_projects`:**
   - `cover_image_path TEXT` - Storage path for cover image
   - `cover_image_updated_at TIMESTAMPTZ` - Timestamp of last cover update

2. **Created `project_images` table:**
   - `id UUID PRIMARY KEY`
   - `project_id UUID` - References portfolio_projects
   - `owner_id UUID` - User ID from auth.users
   - `image_path TEXT` - Storage path in bucket
   - `sort_order INTEGER` - For gallery ordering
   - `created_at TIMESTAMPTZ`
   - Unique constraint on (project_id, image_path)

3. **RLS Policies:**
   - SELECT: Users can view their own project images
   - INSERT: Users can insert images for their own projects
   - UPDATE: Users can update their own project images
   - DELETE: Users can delete their own project images

### Step 2: Storage Bucket ✅

**Bucket Name:** `project-images`
- **Type:** Private (requires signed URLs)
- **File Size Limit:** 5MB
- **Allowed MIME Types:** image/jpeg, image/jpg, image/png, image/webp

**Storage Policies:**
- INSERT: Users can upload only to paths starting with `${auth.uid()}/`
- SELECT: Users can read only their own images
- DELETE: Users can delete only their own images

**Path Structure:**
- Cover: `${userId}/${projectId}/cover-${timestamp}.${ext}`
- Gallery: `${userId}/${projectId}/gallery-${timestamp}-${n}.${ext}`

### Step 3: API Routes ✅

#### 1. POST `/api/portfolio/projects/[projectId]/cover-image`
- Uploads cover image
- Validates file type and size
- Stores path in database
- Returns signed URL (1 hour expiry)
- Deletes old cover if exists

#### 2. POST `/api/portfolio/projects/[projectId]/gallery-images`
- Uploads multiple gallery images
- Enforces max 10 images per project
- Creates database records with sort_order
- Returns array of image objects with signed URLs

#### 3. GET `/api/portfolio/projects/[projectId]/images`
- Returns cover and gallery images
- Generates signed URLs server-side (1 hour expiry)
- Supports public projects (read access)

#### 4. DELETE `/api/portfolio/projects/[projectId]/gallery-images/[imageId]`
- Deletes image from storage and database
- Verifies ownership before deletion

#### 5. PATCH `/api/portfolio/projects/[projectId]/gallery-images/reorder`
- Updates sort_order for gallery images
- Accepts array of ordered image IDs
- Validates all IDs belong to project

### Step 4: Frontend Components ✅

#### `ProjectImageUpload` Component
- Fetches images on mount via GET endpoint
- Handles cover image upload
- Handles multiple gallery image uploads
- Supports drag-to-reorder (via arrow buttons)
- Supports deletion
- Shows loading states and error messages
- Auto-refreshes signed URLs when needed

#### `EditProjectForm` Component
- Updated to work with new image structure
- Images are handled separately from project metadata
- No longer sends image URLs in PATCH request

### Step 5: Database Updates ✅

- Updated PATCH route to remove image handling (now separate endpoints)
- Edit page no longer fetches images (component handles it)

## Security Features

1. **RLS on Database:**
   - All queries respect user ownership
   - Users cannot access other users' images

2. **Storage Policies:**
   - Path-based access control
   - Users can only upload/read/delete in their own user-scoped paths

3. **API Validation:**
   - Ownership verification on all endpoints
   - File type and size validation
   - Max gallery image limit enforcement

## Usage

### Upload Cover Image
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`/api/portfolio/projects/${projectId}/cover-image`, {
  method: 'POST',
  body: formData,
});

const { cover_image_url } = await response.json();
```

### Upload Gallery Images
```typescript
const formData = new FormData();
files.forEach(file => formData.append('files', file));

const response = await fetch(`/api/portfolio/projects/${projectId}/gallery-images`, {
  method: 'POST',
  body: formData,
});

const { images } = await response.json();
```

### Fetch Images
```typescript
const response = await fetch(`/api/portfolio/projects/${projectId}/images`);
const { cover, gallery } = await response.json();
// cover: { path, url } | null
// gallery: Array<{ id, path, url, sort_order }>
```

### Delete Gallery Image
```typescript
await fetch(`/api/portfolio/projects/${projectId}/gallery-images/${imageId}`, {
  method: 'DELETE',
});
```

### Reorder Gallery Images
```typescript
await fetch(`/api/portfolio/projects/${projectId}/gallery-images/reorder`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderedImageIds: ['id1', 'id2', 'id3'] }),
});
```

## Migration Instructions

1. **Run the migration:**
   ```bash
   # Apply the migration to your Supabase database
   supabase migration up
   ```

2. **Verify bucket creation:**
   - Check Supabase Dashboard → Storage
   - Bucket `project-images` should exist and be private

3. **Test upload:**
   - Navigate to project edit page
   - Upload a cover image
   - Upload gallery images
   - Verify images display correctly

## Troubleshooting

### "Bucket not found" Error
- Verify bucket `project-images` exists in Supabase Dashboard
- Check bucket name matches exactly (case-sensitive)
- Ensure migration ran successfully

### "Upload failed" Error
- Check file size (must be < 5MB)
- Check file type (JPG, PNG, WEBP only)
- Verify storage policies are correctly set
- Check user authentication

### Images not displaying
- Signed URLs expire after 1 hour
- Component should refresh URLs automatically
- Check browser console for errors
- Verify RLS policies allow read access

## Notes

- Old upload route `/api/portfolio/projects/images/upload` still exists but is deprecated
- Images are stored as paths in database, not URLs
- Signed URLs are generated server-side for security
- Gallery images are limited to 10 per project
- Cover image replaces previous cover automatically
