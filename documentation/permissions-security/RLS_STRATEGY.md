# Global RLS Strategy

## Overview

Row Level Security (RLS) is enabled on all user-facing tables. This document explains how RLS is implemented and how admin access is safely handled.

## Default Access: Deny

**All tables default to deny access.** If no RLS policy matches a query, access is denied. This is the security-first approach.

## RLS Policy Structure

### Policy Types

1. **SELECT policies**: Control read access
2. **INSERT policies**: Control creation access
3. **UPDATE policies**: Control modification access
4. **DELETE policies**: Control deletion access

### Policy Evaluation

- Policies are evaluated for every query
- Multiple policies can match (OR logic)
- If any policy allows access, the operation proceeds
- If no policy allows access, the operation is denied

## Admin Access Strategy

### How Admin Access Works

1. **Role Check Function**: `is_admin(user_id)` checks if a user has the 'admin' role
2. **SECURITY DEFINER**: Admin check functions use `SECURITY DEFINER` to bypass RLS for the check itself
3. **Policy Pattern**: Admin policies use `is_admin(auth.uid())` to grant full access

### Example Admin Policy

```sql
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (is_admin(auth.uid()));
```

### Admin Access Safety

1. **No Impersonation**: Admin cannot switch to another user's session
2. **Auditable**: All admin actions should be logged (future enhancement)
3. **Manual Assignment**: Admin role is assigned manually, not self-service
4. **Role Immutability**: Even admins cannot change their own role (requires another admin)

## Service Role Bypass

### When to Use Service Role

- Server-side operations that need to bypass RLS
- Admin operations from backend
- System operations (not user-initiated)

### Service Role Client

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

// This uses SUPABASE_SERVICE_ROLE_KEY
const supabase = createServerSupabaseClient();
```

### Service Role Safety

1. **Server-Side Only**: Never expose service role key to client
2. **Limited Use**: Only use when necessary
3. **Audit Logging**: Log all service role operations
4. **No User Context**: Service role operations don't have user context

## Policy Patterns

### Own Resource Pattern

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Role-Based Pattern

```sql
-- Students can read student profiles
CREATE POLICY "Students can read student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'student'
      AND profiles.user_id = auth.uid()
    )
  );
```

### Visibility-Based Pattern

```sql
-- Recruiters can read non-private profiles
CREATE POLICY "Recruiters can read visible profiles"
  ON student_profiles
  FOR SELECT
  USING (
    visibility != 'private'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
  );
```

### Admin Override Pattern

```sql
-- Admins can read everything
CREATE POLICY "Admins can read all"
  ON table_name
  FOR SELECT
  USING (is_admin(auth.uid()));
```

## Policy Testing

### Testing RLS Policies

1. Test as each role (student, instructor, recruiter, admin)
2. Test edge cases (no role, incomplete onboarding)
3. Test cross-role access (should be denied)
4. Test visibility levels (private, recruiters_only, public)

### Common Issues

1. **Missing policies**: If no policy matches, access is denied
2. **Policy conflicts**: Multiple policies can match (OR logic)
3. **Function security**: Admin check functions must use SECURITY DEFINER
4. **Performance**: Complex policies can slow queries (use indexes)

## Best Practices

1. **Default Deny**: Always start with deny, then add allow policies
2. **Explicit Policies**: Be explicit about what each role can do
3. **Test Thoroughly**: Test all role combinations
4. **Document Policies**: Comment policies to explain intent
5. **Audit Admin Access**: Log all admin operations
6. **No Client-Side Security**: RLS is the source of truth

## Migration Strategy

1. Enable RLS on table
2. Create admin policies first (safety net)
3. Create role-specific policies
4. Test each policy
5. Document in this file

## Security Considerations

1. **No Implicit Access**: Cross-role access must be explicit
2. **No Escalation**: Users cannot escalate their own privileges
3. **Audit Trail**: All sensitive operations should be logged
4. **Role Immutability**: Users cannot change their own role
5. **Visibility Control**: Students control their own visibility

