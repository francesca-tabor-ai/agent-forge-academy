# Build Fix: `next/headers` Error

## Problem

Build error: `next/headers` only works in App Router Server Components (not `pages/`)

## Solution Applied

Added `server-only` package protection to all server-only files that use `next/headers`:

1. ✅ `lib/supabase/server.ts` - Added `import 'server-only'`
2. ✅ `lib/videos.ts` - Added `import 'server-only'`
3. ✅ `lib/rag/retrieve.ts` - Added `import 'server-only'`
4. ✅ `lib/rag/indexLessons.ts` - Added `import 'server-only'`
5. ✅ `lib/middleware/course-access-guard.ts` - Added `import 'server-only'`
6. ✅ `lib/utils/subscription-access.ts` - Added `import 'server-only'`

## Required: Install `server-only` Package

Run this command to install the `server-only` package:

```bash
npm install server-only
```

Or if using yarn:

```bash
yarn add server-only
```

## What This Does

The `server-only` package prevents these files from being accidentally bundled into client-side code. When Next.js tries to bundle these files for the client, it will throw an error at build time, preventing the `next/headers` import from being included in client bundles.

## Verification

After installing `server-only`, run:

```bash
npm run build
```

The build should now succeed without the `next/headers` error.

## Files Modified

- `lib/supabase/server.ts`
- `lib/videos.ts`
- `lib/rag/retrieve.ts`
- `lib/rag/indexLessons.ts`
- `lib/middleware/course-access-guard.ts`
- `lib/utils/subscription-access.ts`

All these files now have `import 'server-only'` at the top to ensure they're never bundled for client-side code.
