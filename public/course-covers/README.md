# Course Cover Images

This directory contains local course cover images organized by industry and track.

## Directory Structure

```
course-covers/
├── industry/          # Industry-specific cover images
│   ├── finance.jpg
│   ├── healthcare.jpg
│   ├── e-commerce.jpg
│   ├── saas.jpg
│   ├── media-and-publishing.jpg
│   ├── devtools.jpg
│   ├── legal-and-compliance.jpg
│   └── default.jpg    # Fallback image
└── track/             # Track/category-specific cover images
    ├── ai-search-and-visibility.jpg
    ├── agentic-systems.jpg
    ├── shopping-and-e-commerce.jpg
    ├── media-and-content-ops.jpg
    ├── trust-and-regulation.jpg
    ├── ml-engineering.jpg
    ├── vibe-engineering.jpg
    ├── platform-engineering.jpg
    ├── gtm-and-revenue-operations.jpg
    ├── creative-ai.jpg
    └── audio-and-voice.jpg
```

## Image Requirements

### Technical Specifications

- **Format**: JPG (preferred) or WebP
- **Dimensions**: 1920x1080px (16:9 aspect ratio)
- **File Size**: Optimized to < 500KB per image
- **Quality**: High quality, suitable for web display

### Naming Convention

Images are named using URL-friendly slugs:
- Convert to lowercase
- Replace `&` with `and`
- Replace spaces and special characters with hyphens
- Remove leading/trailing hyphens

**Examples:**
- `"E-commerce"` → `e-commerce.jpg`
- `"AI Search & Visibility"` → `ai-search-and-visibility.jpg`
- `"Legal & Compliance"` → `legal-and-compliance.jpg`
- `"GTM & Revenue Operations"` → `gtm-and-revenue-operations.jpg`

### Design Guidelines

1. **Visual Style**: Professional, modern, relevant to the industry/track
2. **Brand Consistency**: Should align with the overall brand aesthetic
3. **Text Overlay**: Images will have text overlays, so ensure sufficient contrast
4. **Subject Matter**: Should be relevant to the industry or track theme

## Adding New Images

### For Industries

1. Create/obtain an image that meets the technical specifications
2. Name it according to the naming convention (see above)
3. Place it in `public/course-covers/industry/`
4. Update `lib/courseCovers.ts`:
   - Add the industry name to `INDUSTRIES_WITH_LOCAL_IMAGES` Set
   - The system will automatically use the local image

### For Tracks

1. Create/obtain an image that meets the technical specifications
2. Name it according to the naming convention (see above)
3. Place it in `public/course-covers/track/`
4. Update `lib/courseCovers.ts`:
   - Add the track name to `TRACKS_WITH_LOCAL_IMAGES` Set
   - The system will automatically use the local image

## Current Status

### Industries with Local Images

The following industries are configured to use local images (when available):
- Finance
- Healthcare
- E-commerce
- SaaS
- Media & Publishing
- DevTools
- Legal & Compliance

**Note**: If a local image doesn't exist, the system will fall back to the external URL defined in `INDUSTRY_EXTERNAL_URLS`.

### Tracks with Local Images

Currently, all tracks use external URLs as fallback. To add local images:
1. Add the track name to `TRACKS_WITH_LOCAL_IMAGES` in `lib/courseCovers.ts`
2. Place the image file in `public/course-covers/track/` with the correct naming

## Image Optimization

Before adding images:

1. **Resize** to 1920x1080px (maintain aspect ratio)
2. **Optimize** using tools like:
   - [Squoosh](https://squoosh.app/)
   - [TinyPNG](https://tinypng.com/)
   - ImageMagick: `convert input.jpg -quality 85 -resize 1920x1080 output.jpg`
3. **Verify** file size is < 500KB

## Fallback Behavior

The system uses the following priority:

1. **Local image** (if exists in `/public/course-covers/`)
2. **External URL** (from `INDUSTRY_EXTERNAL_URLS` or `TRACK_EXTERNAL_URLS`)
3. **Default image** (`/course-covers/industry/default.jpg`)

This ensures images always load, even if local files are missing.

## Testing

After adding images:

1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server
3. Check course cards on `/student/courses`
4. Verify images load correctly
5. Check browser DevTools Network tab for image requests

## Related Files

- `lib/courseCovers.ts` - Image mapping and resolution logic
- `lib/utils/course-image-resolver.ts` - Course image URL resolution
- `components/courses/CourseCard.tsx` - Course card component
- `components/courses/CourseImagePlaceholder.tsx` - Fallback UI component
