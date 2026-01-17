# CV Upload Frontend Implementation

## Step 3 — Frontend Upload Component

### Component: `CVUpload`

**Location**: `components/portfolio/CVUpload.tsx`

### Requirements Implementation

✅ **Uncontrolled file input** - No `value` prop set (browser handles it)  
✅ **FormData with "cv" field** - Uses `formData.append("cv", file)`  
✅ **POST to /api/portfolio/cv** - Correct endpoint  
✅ **UI states** - All states implemented:
  - Idle: "Upload CV" button
  - Uploading: Progress indicator + disabled button
  - Success: Shows "CV uploaded: [date]" + "View/Download" link
  - Error: Shows validation error message  
✅ **Server data refresh** - Uses `router.refresh()` after successful upload  

### UI States

#### 1. Idle State
- Shows "Upload CV" button
- File input is hidden (triggered by button click)
- Help text: "Allowed formats: PDF, DOCX. Max size: 10MB"

#### 2. Uploading State
- Progress bar with percentage
- "Uploading..." text
- Button disabled
- File input disabled

#### 3. Success State
- Green success message: "CV uploaded: [formatted date]"
- "View/Download" link (opens in new tab)
- Automatically triggers `router.refresh()` to reload server data

#### 4. Error State
- Red error message box
- Shows validation or upload error
- File input reset

### Key Features

1. **Uncontrolled Input**
   ```tsx
   <input
     ref={fileInputRef}
     type="file"
     // NO value prop - browser handles it
   />
   ```

2. **FormData Creation**
   ```tsx
   const formData = new FormData();
   formData.append('cv', file); // Field name: "cv"
   ```

3. **Progress Tracking**
   - Uses XMLHttpRequest for accurate upload progress
   - Shows percentage and progress bar

4. **Error Handling**
   - Client-side validation (file size)
   - Server-side error display
   - File input reset on error

5. **Success Handling**
   - Displays uploaded date in readable format
   - Provides direct link to view/download CV
   - Triggers server data refresh via `router.refresh()`

### Integration

The component is used in `CVResumeSection`:

```tsx
<CVUpload
  onUploadSuccess={() => router.refresh()}
/>
```

**Note**: `studentProfileId` is no longer needed as a prop - the API derives it from the authenticated user.

### File Input Best Practices

✅ **DO**:
- Use `ref` to access the input
- Reset with `fileInputRef.current.value = ''` after upload/error
- Keep input uncontrolled (no `value` prop)
- Use `accept` attribute for UX (browser file picker filter)

❌ **DON'T**:
- Set `value` prop manually
- Use controlled input with state
- Trust client-side file type validation (server validates)

### Response Handling

The component expects this response format from `/api/portfolio/cv`:

```json
{
  "ok": true,
  "resume": {
    "url": "https://...",
    "fileName": "resume.pdf",
    "uploadedAt": "2025-01-25T12:00:00.000Z",
    "fileSize": 123456
  }
}
```

### Date Formatting

Uploaded dates are formatted for readability:
- Input: ISO string (`2025-01-25T12:00:00.000Z`)
- Output: "January 25, 2025"

### Next Steps

1. ✅ Step 1 - Database schema confirmed
2. ✅ Step 2 - Upload API route implemented
3. ✅ Step 3 - Frontend upload component fixed
4. ⏳ Step 4 - Verify Portfolio page re-renders correctly

### Testing Checklist

- [ ] File input is uncontrolled (no value prop)
- [ ] Upload button shows "Upload CV" when idle
- [ ] Progress bar shows during upload
- [ ] Success message displays with date and link
- [ ] Error messages display correctly
- [ ] Page refreshes after successful upload
- [ ] CV appears in portfolio after upload
- [ ] File input resets after upload/error
