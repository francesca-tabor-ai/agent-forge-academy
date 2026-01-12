# CV Portfolio Page Implementation

## Step 4 — Portfolio Page Loads CV from DB

### Implementation

**File**: `app/(student)/student/portfolio/page.tsx`

### Requirements Implementation

✅ **Query DB for user's Resume/CV record** - Server-side query  
✅ **If CV exists**:
  - Render filename + uploaded date ✅
  - Show "Download" link ✅
  - Use signed URL if private ✅
✅ **If CV not exists**:
  - Render "No CV uploaded" ✅

### Database Query

The page queries the `student_cvs` table:

```typescript
const { data: cv } = await supabase
  .from('student_cvs')
  .select('file_name, uploaded_at, visibility, url, file_path')
  .eq('student_profile_id', studentProfile?.id)
  .order('uploaded_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

**Fields queried**:
- `file_name` - Original filename
- `uploaded_at` - Upload timestamp
- `visibility` - Visibility level (private/public/recruiters_only)
- `url` - Public URL (if available)
- `file_path` - Storage path (for signed URL generation)

### Signed URL Generation

For **private CVs**, the page generates a signed URL server-side:

```typescript
if (cv.visibility === 'private') {
  const { data: signedUrl } = await supabase.storage
    .from('portfolio-files')
    .createSignedUrl(cv.file_path, 3600); // Expires in 1 hour
  cvDownloadUrl = signedUrl?.signedUrl || null;
} else {
  // Use public URL for non-private CVs
  cvDownloadUrl = cv.url || null;
}
```

**Benefits**:
- Secure access to private files
- No need for API endpoint for private CVs
- Direct download link (better performance)
- URL expires after 1 hour (security)

### Component Props

The `CVResumeSection` component receives:

```typescript
<CVResumeSection
  studentProfileId={studentProfile.id}
  cvFileName={cv?.file_name || null}
  cvLastUpdated={cv?.uploaded_at || null}
  cvVisibility={cv?.visibility || null}
  cvDownloadUrl={cvDownloadUrl} // Signed URL for private, public URL for others
  hasCV={!!cv}
/>
```

### Display Logic

#### When CV Exists

1. **Filename** - Displays original filename
2. **Uploaded Date** - Formatted as "Month Day, Year" (e.g., "January 25, 2025")
3. **Visibility Badge** - Shows visibility level with color coding
4. **Download Link** - Uses signed URL if private, public URL otherwise
5. **Preview Button** - Opens CV in new tab (uses API endpoint)
6. **Replace Button** - Allows uploading new CV

#### When CV Doesn't Exist

1. **Message** - "No CV uploaded"
2. **Description** - "Profiles with a CV get more recruiter outreach."
3. **Upload Component** - Shows CV upload form
4. **Generate CV Button** - Placeholder for future feature

### Download Implementation

The download functionality in `CVResumeSection`:

1. **Primary**: Uses `cvDownloadUrl` if available (signed URL for private, public URL for others)
2. **Fallback**: Uses `/api/portfolio/cv/download` endpoint if no direct URL

```typescript
const handleDownload = async () => {
  // If we have a direct download URL, use it
  if (cvDownloadUrl) {
    const a = document.createElement('a');
    a.href = cvDownloadUrl;
    a.download = cvFileName || 'CV.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  
  // Fallback to API endpoint
  // ...
};
```

### Date Formatting

Uploaded dates are formatted consistently:

```typescript
new Date(cvLastUpdated).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
```

**Example**: "January 25, 2025"

### Security

1. **Server-side query** - CV data loaded server-side (secure)
2. **Signed URLs** - Private CVs use time-limited signed URLs (1 hour expiry)
3. **RLS policies** - Database enforces access control
4. **Ownership verification** - Only user's own CV is loaded

### Performance

1. **Single query** - One database query for CV data
2. **Direct URLs** - Uses signed/public URLs directly (no API call needed for download)
3. **Server-side rendering** - CV data included in initial page load
4. **Efficient storage** - Uses Supabase Storage signed URLs

### Error Handling

- Uses `.maybeSingle()` to handle missing CV gracefully
- Falls back to API endpoint if signed URL generation fails
- Shows appropriate UI states (has CV vs. no CV)

### Files Modified

1. `app/(student)/student/portfolio/page.tsx` - Updated CV query and signed URL generation
2. `components/portfolio/CVResumeSection.tsx` - Updated to use download URL prop

### Testing Checklist

- [ ] CV displays filename correctly
- [ ] Uploaded date displays in readable format
- [ ] Download link works for private CVs (signed URL)
- [ ] Download link works for public CVs (public URL)
- [ ] "No CV uploaded" shows when no CV exists
- [ ] Page refreshes after CV upload
- [ ] CV appears immediately after upload
- [ ] Signed URLs expire after 1 hour

### Next Steps

1. ✅ Step 1 - Database schema confirmed
2. ✅ Step 2 - Upload API route implemented
3. ✅ Step 3 - Frontend upload component fixed
4. ✅ Step 4 - Portfolio page loads CV from DB

**All steps complete!** The CV upload and display functionality is fully implemented.
