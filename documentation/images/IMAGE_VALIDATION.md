# Course Image Validation

This document describes the course image validation system that ensures all courses have accessible image URLs before deployment.

## Overview

The validation script (`scripts/validate-course-images.ts`) checks that:
1. All courses have a resolvable image URL
2. Local image files exist in `/public/course-covers/`
3. External image URLs are accessible (HTTP HEAD request)
4. Images return valid content types

## Usage

### Basic Validation

```bash
npm run validate:images
```

This will:
- Load all courses from the file system
- Resolve image URL for each course
- Validate local files exist
- Validate external URLs are accessible
- Report any issues
- Exit with error code if any images are invalid

### Skip External URL Validation

For faster validation when you only want to check local files:

```bash
npm run validate:images:skip-external
```

Or directly:

```bash
npx tsx scripts/validate-course-images.ts --skip-external
```

### Warning Mode

To run validation without failing the build:

```bash
npx tsx scripts/validate-course-images.ts --warn-only
```

## Integration

### Pre-Build Validation

The validation script can be added to the build process. Currently, it's available as a standalone command. To add it to pre-build:

```json
{
  "scripts": {
    "prebuild": "npm run generate:city-banners && npm run validate:images"
  }
}
```

**Note**: This will fail the build if any images are invalid. Use `--warn-only` during development if needed.

### CI/CD Integration

Add to your CI/CD pipeline (GitHub Actions, GitLab CI, etc.):

```yaml
# Example GitHub Actions workflow
- name: Validate course images
  run: npm run validate:images
```

For faster CI runs, you might want to skip external validation:

```yaml
- name: Validate course images (local only)
  run: npm run validate:images:skip-external
```

## How It Works

### 1. Course Discovery

The script uses `getAllCourseSlugs()` to discover all courses from the file system.

### 2. Image URL Resolution

For each course, it:
- Loads metadata from `_COURSE_METADATA.md` or `course-metadata.ts`
- Uses `resolveCourseImageUrl()` to get the final image URL
- Follows the same priority logic as the application:
  1. Direct `imageUrl` from metadata
  2. Priority industries (Healthcare, Finance)
  3. Track-based image
  4. Standard industry-based image
  5. Default fallback

### 3. Validation

#### Local Images

For local paths (starting with `/`):
- Checks if file exists in `/public/`
- Verifies it's actually a file (not a directory)
- Reports missing files

#### External Images

For external URLs:
- Makes HTTP HEAD request (faster than GET)
- Validates response status (200-299)
- Checks Content-Type header (should start with `image/`)
- Handles timeouts (10 second default)
- Handles network errors gracefully

### 4. Reporting

The script provides:
- Progress indicator for each course
- Summary statistics (total, valid, invalid)
- Detailed error messages for invalid images
- Exit code (0 = success, 1 = failure)

## Example Output

### Success

```
🔍 Validating course images...

Found 60 courses to validate

[1/60] Validating agentic-rag... ✓ (external)
[2/60] Validating agentic-commerce... ✓ (local)
...
[60/60] Validating ai-visibility... ✓ (external)

============================================================
📊 Validation Summary
============================================================
Total courses: 60
✓ Valid images: 60
✗ Invalid images: 0
============================================================

✅ All course images are valid!
```

### Failure

```
🔍 Validating course images...

Found 60 courses to validate

[1/60] Validating agentic-rag... ✓ (external)
[2/60] Validating broken-course... ✗ HTTP 404: Not Found
...

============================================================
📊 Validation Summary
============================================================
Total courses: 60
✓ Valid images: 59
✗ Invalid images: 1
============================================================

❌ Invalid Images:

  Course: Broken Course (broken-course)
  Image URL: https://example.com/missing-image.jpg
  Error: HTTP 404: Not Found
  Type: External

❌ Validation failed! Fix the errors above before proceeding.
```

## Error Handling

### Network Issues

If external URLs fail due to network issues:
- Use `--skip-external` to skip external validation
- Or use `--warn-only` to continue despite errors
- Check your network connection and firewall settings

### Rate Limiting

The script includes a 200ms delay between external URL checks to avoid rate limiting. If you encounter rate limiting:
- Increase the delay in the script
- Use `--skip-external` for local-only validation
- Run validation in smaller batches

### Timeouts

Default timeout is 10 seconds per URL. If you have slow external URLs:
- Increase timeout in the script (modify `timeout` option)
- Consider migrating slow external URLs to local images

## Best Practices

1. **Run before commits**: Validate images before committing changes
   ```bash
   npm run validate:images
   ```

2. **CI/CD integration**: Add to your CI pipeline to catch issues early

3. **Local-first**: Migrate external images to local files for better reliability

4. **Regular audits**: Run validation periodically to catch broken external URLs

5. **Development workflow**: Use `--warn-only` during development, strict validation in CI

## Troubleshooting

### "Local file not found" errors

- Check that image exists in `/public/course-covers/industry/` or `/public/course-covers/track/`
- Verify filename matches the slug (e.g., `e-commerce.jpg` for "E-commerce")
- See `/public/course-covers/README.md` for naming conventions

### "HTTP 404" errors for external URLs

- External image URL may have changed or been removed
- Consider downloading and using local image instead
- Update the URL in `lib/courseCovers.ts` if URL changed

### "Request timeout" errors

- External server may be slow or down
- Check if URL is accessible in browser
- Consider migrating to local image for reliability

### "Content-Type" errors

- URL may not be returning an image
- Check URL in browser to verify it's an image
- May need to update URL or use different image source

## Related Files

- `scripts/validate-course-images.ts` - Validation script
- `lib/utils/course-image-resolver.ts` - Image URL resolution logic
- `lib/courseCovers.ts` - Image mapping configuration
- `public/course-covers/README.md` - Image requirements and naming

## Future Improvements

- [ ] Cache validation results to speed up repeated runs
- [ ] Support for validating images from database (not just file system)
- [ ] Image optimization validation (file size, dimensions)
- [ ] Parallel validation for faster execution
- [ ] JSON output option for CI/CD integration
- [ ] Validation report generation (HTML/JSON)
