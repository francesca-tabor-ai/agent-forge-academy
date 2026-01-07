# Supabase Migration Fixes Summary

## Issues Fixed

### 1. Missing Admin Role
**Problem**: The `user_role` enum didn't include 'admin', but admin functionality was referenced in RLS policies.

**Fix**: Added 'admin' to the `user_role` enum in migration `20250107000008_fix_issues.sql`.

### 2. Problematic CHECK Constraints
**Problem**: The CHECK constraints in `student_profiles` and `recruiter_profiles` used subqueries that don't work reliably in PostgreSQL CHECK constraints.

**Fix**: 
- Removed the CHECK constraints
- Created trigger functions to validate roles instead
- Triggers run before INSERT/UPDATE and raise exceptions if validation fails

### 3. Broken is_admin Function
**Problem**: The `is_admin()` function always returned `false`, making admin policies ineffective.

**Fix**: 
- Implemented proper admin check by querying the `profiles` table for users with role = 'admin'
- Fixed parameter name conflict (changed from `user_id` to `check_user_id`)

### 4. Missing RLS Policies
**Problem**: Several tables had RLS enabled but no policies, making them inaccessible:
- `recruiter_profiles`
- `contact_requests`
- `events`
- `event_presentations`
- `event_attendance`

**Fix**: Added comprehensive RLS policies in migration `20250107000009_add_missing_rls_policies.sql`:

#### recruiter_profiles
- Recruiters can read/update/insert their own profile
- Admins can read all recruiter profiles

#### contact_requests
- Recruiters can create and read their own contact requests
- Students can read and update (approve/reject) contact requests for their profile
- Recruiters can withdraw their own pending requests
- Admins can read all contact requests

#### events
- Anyone can read events (public)
- Only admins can create/update/delete events

#### event_presentations
- Anyone can read event presentations (public)
- Students can create/update presentations for their own profile
- Admins can manage all presentations

#### event_attendance
- Users can read/create/update their own attendance records
- Admins can read all attendance

## Migration Order

1. `20250107000001_create_profiles_table.sql` - Base profiles table
2. `20250107000002_create_student_profiles_and_portfolio.sql` - Student tables
3. `20250107000003_create_recruiter_profiles_and_contact_requests.sql` - Recruiter tables
4. `20250107000004_create_profiles_rls_policies.sql` - Initial RLS policies
5. `20250107000005_create_student_profiles_rls_policies.sql` - Student RLS policies
6. `20250107000006_create_events_tables.sql` - Events tables
7. `20250107000007_create_portfolio_projects_rls_policies.sql` - Portfolio RLS policies
8. `20250107000008_fix_issues.sql` - **Fixes admin role, CHECK constraints, is_admin function**
9. `20250107000009_add_missing_rls_policies.sql` - **Adds missing RLS policies**

## Testing Recommendations

After applying these migrations, test:

1. **Role validation**: Try creating a `student_profiles` record with a non-student profile - should fail
2. **Admin access**: Create a profile with role='admin' and verify admin policies work
3. **Contact requests**: Test that recruiters can create requests and students can approve/reject
4. **Events**: Verify public read access and admin-only write access
5. **RLS enforcement**: Test that users can only access their own data

## Notes

- All migrations are idempotent (use `IF EXISTS`, `IF NOT EXISTS` where possible)
- The trigger-based role validation is more reliable than CHECK constraints
- Admin functionality is now fully implemented
- All tables now have appropriate RLS policies

