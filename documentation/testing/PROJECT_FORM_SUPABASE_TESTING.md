# Testing Project Form Connection to Supabase

This document provides step-by-step instructions to verify that the project creation form is properly connected to Supabase and saving data to the database.

## Prerequisites

1. **Access to Supabase Dashboard**
   - You need access to your Supabase project dashboard
   - URL: `https://app.supabase.com/project/[your-project-id]`

2. **Browser Developer Tools**
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Safari: Enable Developer menu in Preferences > Advanced

3. **Database Access**
   - Direct connection to Supabase database (via SQL Editor or psql)
   - Or access via Supabase Dashboard > SQL Editor

## Test Scenarios

### Test 1: Successful Project Creation

**Objective:** Verify that a project is successfully created and saved to the database.

**Steps:**
1. Navigate to `/student/portfolio/new` (or click "Add Project" from portfolio page)
2. Fill in the form:
   - **Title:** `Test Project - [Your Name] - [Timestamp]`
   - **Description:** `This is a test project to verify database connection.`
   - **GitHub URL:** `https://github.com/test/repo` (optional)
   - **Demo URL:** `https://example.com` (optional)
   - **Visibility:** Select any option (Private, Recruiters Only, or Public)
3. Click "Create Project"
4. **Expected Results:**
   - ✅ Green toast notification appears: "Project created successfully!"
   - ✅ Page redirects to `/student/portfolio/[project-id]/edit`
   - ✅ Project appears in your portfolio list

**Verify in Database:**
```sql
-- Run this query in Supabase SQL Editor
SELECT 
  pp.id,
  pp.title,
  pp.description,
  pp.github_url,
  pp.demo_url,
  pp.visibility,
  pp.created_at,
  sp.id as student_profile_id
FROM portfolio_projects pp
JOIN student_profiles sp ON sp.id = pp.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = auth.uid()
ORDER BY pp.created_at DESC
LIMIT 5;
```

**Expected:** Your test project should appear in the results with all the data you entered.

---

### Test 2: Error Handling - Missing Required Fields

**Objective:** Verify that the form shows appropriate error messages when required fields are missing.

**Steps:**
1. Navigate to `/student/portfolio/new`
2. Leave the **Title** field empty
3. Fill in other optional fields if desired
4. Click "Create Project"
5. **Expected Results:**
   - ✅ Red error toast notification appears
   - ✅ Error message displayed: "Title is required"
   - ✅ Form does not submit
   - ✅ No network request sent (check Network tab)

**Verify:**
- Open Browser DevTools > Network tab
- Look for POST request to `/api/portfolio/projects`
- Should NOT see a request if validation fails

---

### Test 3: Error Handling - Network Failure

**Objective:** Verify that the form handles network errors gracefully.

**Steps:**
1. Navigate to `/student/portfolio/new`
2. Fill in the form completely
3. **Simulate network failure:**
   - Open Browser DevTools > Network tab
   - Select "Offline" from the throttling dropdown
   - Or disconnect your internet
4. Click "Create Project"
5. **Expected Results:**
   - ✅ Red error toast appears
   - ✅ Error message: "Network error: Unable to connect to server..."
   - ✅ Detailed error message in the form
   - ✅ Form remains on the page (no redirect)

**Verify:**
- Check Browser Console (Console tab) for error logs
- Error should be logged: `[NewProjectForm] Error creating project: ...`

---

### Test 4: Error Handling - Database Error

**Objective:** Verify that database errors are properly handled and displayed.

**Steps:**
1. Navigate to `/student/portfolio/new`
2. Fill in the form completely
3. **Simulate database error** (requires database access):
   ```sql
   -- Temporarily disable RLS on portfolio_projects (for testing only!)
   -- WARNING: Only do this in a development environment
   ALTER TABLE portfolio_projects DISABLE ROW LEVEL SECURITY;
   ```
4. Try to create a project
5. **Expected Results:**
   - ✅ Error toast appears with database error message
   - ✅ Error includes error code if available
   - ✅ Detailed error information in form

**Cleanup:**
```sql
-- Re-enable RLS after testing
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
```

---

### Test 5: Verify Data Persistence

**Objective:** Verify that created projects persist in the database and appear in the portfolio.

**Steps:**
1. Create a project using the form (follow Test 1)
2. Note the project ID from the URL after creation
3. Navigate back to `/student/portfolio`
4. **Expected Results:**
   - ✅ Project appears in your portfolio list
   - ✅ Project data matches what you entered

**Verify in Database:**
```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then check projects (replace USER_ID with actual ID)
SELECT 
  pp.*,
  sp.id as student_profile_id,
  p.user_id
FROM portfolio_projects pp
JOIN student_profiles sp ON sp.id = pp.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'USER_ID'
ORDER BY pp.created_at DESC;
```

---

### Test 6: API Endpoint Direct Testing

**Objective:** Test the API endpoint directly to verify backend functionality.

**Steps:**
1. Open Browser DevTools > Network tab
2. Navigate to `/student/portfolio/new`
3. Fill in and submit the form
4. Find the POST request to `/api/portfolio/projects`
5. Click on it to view details
6. **Check Request:**
   - **Method:** POST
   - **Status:** 200 (success) or appropriate error code
   - **Request Payload:** Should contain all form data as JSON
   - **Response:** Should contain the created project object with `id`

**Expected Request Payload:**
```json
{
  "title": "Test Project",
  "description": "Test description",
  "github_url": "https://github.com/test/repo",
  "demo_url": "https://example.com",
  "visibility": "private"
}
```

**Expected Response (Success):**
```json
{
  "id": "uuid-here",
  "title": "Test Project",
  "description": "Test description",
  "github_url": "https://github.com/test/repo",
  "demo_url": "https://example.com",
  "visibility": "private",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Test 7: Student Profile Auto-Creation

**Objective:** Verify that a student profile is automatically created if it doesn't exist.

**Steps:**
1. **Check if student_profile exists:**
   ```sql
   SELECT sp.*, p.user_id, p.email
   FROM student_profiles sp
   JOIN profiles p ON p.id = sp.profile_id
   WHERE p.user_id = auth.uid();
   ```
2. If student_profile exists, note its ID
3. Create a new project
4. **Verify:**
   ```sql
   -- Check that student_profile still exists or was created
   SELECT sp.*, p.user_id
   FROM student_profiles sp
   JOIN profiles p ON p.id = sp.profile_id
   WHERE p.user_id = auth.uid();
   
   -- Check that project is linked to student_profile
   SELECT pp.*, sp.id as student_profile_id
   FROM portfolio_projects pp
   JOIN student_profiles sp ON sp.id = pp.student_profile_id
   WHERE pp.title LIKE 'Test Project%'
   ORDER BY pp.created_at DESC
   LIMIT 1;
   ```

**Expected:** Student profile should exist and project should be linked to it.

---

## Troubleshooting

### Issue: Form submits but no success message appears

**Check:**
1. Browser Console for JavaScript errors
2. Network tab for failed requests
3. Verify Toast component is imported correctly

**Solution:**
- Check browser console for errors
- Verify all dependencies are installed
- Clear browser cache and reload

---

### Issue: Success message appears but project doesn't save

**Check:**
1. Network tab - verify POST request returns 200 status
2. Database - run verification query (Test 5)
3. Browser Console for errors

**Solution:**
- Check Supabase logs for database errors
- Verify RLS policies are correctly set up
- Check that user has proper authentication

---

### Issue: Error message appears but is not helpful

**Check:**
1. Network tab - check response body for error details
2. Browser Console for full error stack
3. Supabase logs for backend errors

**Solution:**
- Error messages should include:
  - Clear description of what went wrong
  - Error code (if available)
  - Suggestions for resolution

---

### Issue: Projects don't appear in portfolio after creation

**Check:**
1. Verify project was created in database (Test 5)
2. Check portfolio page query/filter
3. Verify visibility settings

**Solution:**
- Check that portfolio page is fetching projects correctly
- Verify RLS policies allow reading projects
- Check visibility settings match filter criteria

---

## Quick Verification Checklist

Use this checklist for a quick smoke test:

- [ ] Form loads without errors
- [ ] Required field validation works (title field)
- [ ] Form submits successfully with valid data
- [ ] Success toast appears after submission
- [ ] Redirect to edit page works
- [ ] Project appears in database query
- [ ] Project appears in portfolio list
- [ ] Error messages appear for invalid submissions
- [ ] Network errors are handled gracefully
- [ ] Browser console shows no errors

---

## Database Schema Reference

**portfolio_projects table:**
- `id` (UUID, Primary Key)
- `student_profile_id` (UUID, Foreign Key → student_profiles.id)
- `title` (VARCHAR(255), NOT NULL)
- `description` (TEXT, nullable)
- `github_url` (TEXT, nullable)
- `demo_url` (TEXT, nullable)
- `visibility` (ENUM: 'private', 'recruiters_only', 'public')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**student_profiles table:**
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key → profiles.id)
- Other fields...

**profiles table:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users.id)
- `role` (ENUM: 'student', 'recruiter', 'tutor', 'admin')

---

## Additional Resources

- **Supabase Dashboard:** https://app.supabase.com
- **API Documentation:** `/api/portfolio/projects` endpoint
- **RLS Policies:** Check `supabase/migrations/to do/20250107000007_create_portfolio_projects_rls_policies.sql`
- **Error Logs:** Check Supabase Dashboard > Logs > API Logs

---

## Notes

- Always test in a development environment first
- Never disable RLS in production
- Keep test data separate from production data
- Clean up test projects after verification
