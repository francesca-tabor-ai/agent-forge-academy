# GitHub Sync Test Checklist

## Prerequisites
- [ ] User is logged in as a student
- [ ] User has a student profile created
- [ ] Test GitHub username exists and has public repositories

## Test 1: Save GitHub URL with Valid Profile

### Steps:
1. Navigate to `/student/portfolio/profile/edit`
2. Enter a valid GitHub URL: `https://github.com/<username>` (e.g., `https://github.com/octocat`)
3. Fill in required fields (full name, headline)
4. Click "Save Changes"

### Expected Results:
- [ ] Profile saves successfully
- [ ] Redirects to `/student/portfolio?profileSaved=1&githubUrlSaved=1`
- [ ] Success toast appears: "Profile updated"
- [ ] GitHub URL is saved in `student_profiles.github_url` (check DB)

### Verification:
```sql
-- Check GitHub URL was saved
SELECT id, github_url FROM student_profiles 
WHERE profile_id = (SELECT id FROM profiles WHERE user_id = '<user_id>');
```

---

## Test 2: Confirm Sync Endpoint Runs

### Steps:
1. After saving GitHub URL, check Vercel logs within 5 seconds
2. Look for log entries with `[GitHub Sync]` prefix

### Expected Results:
- [ ] Log entry: `[GitHub Sync] Starting sync` with userId, username
- [ ] Log entry: `[GitHub Sync] Fetched repositories` with totalReposFetched
- [ ] Log entry: `[GitHub Sync] Filtered repositories` with reposAfterFiltering
- [ ] Log entry: `[GitHub Sync] Successfully synced repositories` with metrics

### Verification in Vercel Logs:
```
[GitHub Sync] Starting sync { userId: '...', username: 'octocat', ... }
[GitHub Sync] Fetched repositories { totalReposFetched: 25, ... }
[GitHub Sync] Filtered repositories { reposAfterFiltering: 12, ... }
[GitHub Sync] Successfully synced repositories { projectsCreated: 8, ... }
```

---

## Test 3: Confirm Repos Fetched (200 Response)

### Steps:
1. Check Vercel logs for GitHub API response
2. Or manually call: `GET /api/portfolio/github/sync`

### Expected Results:
- [ ] GitHub API returns 200 OK
- [ ] Log shows `totalReposFetched > 0`
- [ ] Repos are filtered (forks, archived, empty excluded)
- [ ] Response includes repo data

### Manual API Test:
```bash
# Get auth token from browser cookies
curl -X GET "https://your-domain.com/api/portfolio/github/sync" \
  -H "Cookie: sb-access-token=..." \
  | jq '.'
```

### Expected Response:
```json
{
  "ok": true,
  "repos": [...],
  "count": 12,
  "username": "octocat",
  "totalReposFetched": 25,
  "reposAfterFiltering": 12
}
```

---

## Test 4: Confirm Projects Upserted (DB Rows)

### Steps:
1. Wait 5-10 seconds after saving GitHub URL
2. Check `portfolio_projects` table

### Expected Results:
- [ ] Projects created with `source = 'github'`
- [ ] Projects have `source_id` matching GitHub repo.id
- [ ] Projects have correct `student_profile_id`
- [ ] Projects have `github_url` populated
- [ ] No duplicate projects (unique constraint works)

### Verification SQL:
```sql
-- Check created projects
SELECT 
  id, 
  title, 
  github_url, 
  source, 
  source_id,
  visibility,
  created_at
FROM portfolio_projects 
WHERE student_profile_id = '<student_profile_id>'
  AND source = 'github'
ORDER BY created_at DESC;

-- Verify no duplicates (should return 0 rows)
SELECT source_id, COUNT(*) 
FROM portfolio_projects 
WHERE student_profile_id = '<student_profile_id>'
  AND source = 'github'
GROUP BY source_id 
HAVING COUNT(*) > 1;
```

### Expected:
- Multiple projects with `source = 'github'`
- Each `source_id` appears only once
- Projects have titles formatted from repo names
- Projects have descriptions (with topics if available)

---

## Test 5: Confirm Portfolio Page Shows Projects

### Steps:
1. Navigate to `/student/portfolio`
2. Wait for page to load (auto-refresh happens after 5 seconds)
3. Check "Projects" section

### Expected Results:
- [ ] Projects section displays
- [ ] GitHub-synced projects appear in the list
- [ ] Projects show correct titles, descriptions
- [ ] Projects have GitHub links
- [ ] Projects are sorted by `created_at` (newest first)
- [ ] No manual refresh needed (auto-refresh works)

### Verification:
- Projects visible in UI
- Project cards show:
  - Title (formatted from repo name)
  - Description (with topics if available)
  - GitHub URL link
  - Visibility badge (default: private)

---

## Test 6: Re-run Sync and Confirm No Duplicates

### Steps:
1. Save the same GitHub URL again (or trigger sync manually)
2. Wait for sync to complete
3. Check database for duplicates

### Expected Results:
- [ ] Sync runs again (check logs)
- [ ] No new projects created (all skipped)
- [ ] Existing projects may be updated if repo data changed
- [ ] Log shows: `projectsCreated: 0, projectsSkipped: X`
- [ ] No duplicate rows in database

### Verification SQL:
```sql
-- Should still return 0 rows (no duplicates)
SELECT source_id, COUNT(*) 
FROM portfolio_projects 
WHERE student_profile_id = '<student_profile_id>'
  AND source = 'github'
GROUP BY source_id 
HAVING COUNT(*) > 1;

-- Check sync metrics in logs
-- Should show: projectsCreated: 0, projectsSkipped: X
```

### Expected Log Output:
```
[GitHub Sync] Successfully synced repositories {
  projectsCreated: 0,
  projectsUpdated: 0,
  projectsSkipped: 8,
  errors: 0
}
```

---

## Test 7: Try Invalid URL and Confirm Graceful Error

### Test 7a: Invalid URL Format

### Steps:
1. Navigate to `/student/portfolio/profile/edit`
2. Enter invalid GitHub URL: `not-a-url` or `https://github.com/`
3. Save profile

### Expected Results:
- [ ] Validation error shown: "Please enter a valid URL"
- [ ] Profile does not save
- [ ] No sync attempted

---

### Test 7b: Non-existent GitHub User

### Steps:
1. Enter valid format but non-existent user: `https://github.com/this-user-definitely-does-not-exist-12345`
2. Save profile
3. Check logs after sync

### Expected Results:
- [ ] Profile saves successfully (URL format is valid)
- [ ] Sync attempts to run
- [ ] Error logged: `[GitHub Sync] GitHub user not found`
- [ ] No projects created
- [ ] Error message in logs: "Couldn't connect to GitHub. Please check the URL or try again."

### Verification in Logs:
```
[GitHub Sync] GitHub user not found {
  userId: '...',
  username: 'this-user-definitely-does-not-exist-12345',
  status: 404
}
```

---

### Test 7c: Malformed GitHub URL

### Steps:
1. Enter: `https://github.com/user name with spaces`
2. Save profile

### Expected Results:
- [ ] URL validation may pass (spaces in URL)
- [ ] Sync attempts to run
- [ ] Error logged with details
- [ ] Graceful error handling (no crash)

---

## Test 8: Edge Cases

### Test 8a: User with No Repos

### Steps:
1. Use GitHub username with 0 public repos
2. Save GitHub URL

### Expected Results:
- [ ] Sync completes successfully
- [ ] Log shows: `totalReposFetched: 0, reposAfterFiltering: 0`
- [ ] No projects created (expected)
- [ ] No errors

---

### Test 8b: User with Only Forks

### Steps:
1. Use GitHub username with only forked repositories
2. Save GitHub URL

### Expected Results:
- [ ] Sync completes successfully
- [ ] Forks are filtered out
- [ ] Log shows: `totalReposFetched: X, reposAfterFiltering: 0`
- [ ] No projects created (expected)

---

### Test 8c: Rate Limit Handling

### Steps:
1. Make many rapid sync requests
2. Check error handling

### Expected Results:
- [ ] Rate limit error logged clearly
- [ ] User-friendly error message returned
- [ ] No crash or unhandled exception

---

## Test 9: Checklist Updates

### Steps:
1. After projects are created, check Recruiter Visibility section
2. Verify checklist item: "≥1 Public project"

### Expected Results:
- [ ] If projects are private: Checklist shows ○ (not completed)
- [ ] If at least one project is public/recruiters_only: Checklist shows ✓ (completed)
- [ ] Checklist updates automatically after projects appear

### Verification:
- Check `RecruiterVisibilitySection` component
- `visibleProjectCount >= 1` should make checklist item complete

---

## Test 10: Performance and Logging

### Steps:
1. Review Vercel logs for a successful sync
2. Check log completeness

### Expected Results:
- [ ] All log entries include userId
- [ ] All log entries include username
- [ ] Sync duration is logged
- [ ] All metrics are logged (created, updated, skipped, errors)
- [ ] No sensitive data in logs (PII redacted)

---

## Summary

### Success Criteria:
- ✅ GitHub URL saves correctly
- ✅ Sync runs automatically after save
- ✅ Repos are fetched from GitHub API
- ✅ Projects are created in database
- ✅ Projects appear on portfolio page
- ✅ No duplicates on re-sync
- ✅ Invalid URLs handled gracefully
- ✅ All errors logged with context
- ✅ User-friendly error messages

### Manual Testing Required:
- Steps 1-7 require manual testing with actual GitHub accounts
- Steps 8-10 can be verified through code review and log inspection

### Automated Testing (Future):
- Unit tests for mapping function
- Integration tests for sync endpoint
- E2E tests for full flow
