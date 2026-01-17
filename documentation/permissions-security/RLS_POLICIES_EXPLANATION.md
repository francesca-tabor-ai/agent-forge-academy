# RLS Policies Explanation

## Profiles Table Policies

### 1. "Users can read own profile"
- **Rule**: Users can always read their own profile
- **Implementation**: Checks if `auth.uid()` matches the `user_id` in the profile
- **Purpose**: Ensures users have full access to their own data

### 2. "Users can update own profile"
- **Rule**: Users can always update their own profile
- **Implementation**: Same check as read policy
- **Purpose**: Allows users to modify their own profile information

### 3. "Users can insert own profile"
- **Rule**: Users can create their own profile
- **Implementation**: Validates that the inserted profile belongs to the authenticated user
- **Purpose**: Typically used when a profile is created via trigger after user signup

### 4. "Admins can read all profiles"
- **Rule**: Admins can read everything
- **Implementation**: Uses `is_admin()` helper function (needs implementation)
- **Purpose**: Provides administrative access for platform management

### 5. "Admins can update all profiles"
- **Rule**: Admins can update any profile
- **Implementation**: Uses `is_admin()` helper function
- **Purpose**: Allows admins to manage user profiles

## Student Profiles Table Policies

### 1. "Students can read own profile"
- **Rule**: Students can read their own profile
- **Implementation**: Checks if the profile belongs to the authenticated user
- **Purpose**: Self-service access to own data

### 2. "Students can update own profile"
- **Rule**: Students can update their own profile
- **Implementation**: Same ownership check
- **Purpose**: Allows students to manage their profile visibility and bio

### 3. "Recruiters can read non-private student profiles"
- **Rule**: Recruiters can only read student profiles where visibility != 'private'
- **Implementation**: 
  - Checks that visibility is not 'private'
  - Verifies the requester is a recruiter
  - Ensures the profile belongs to a student
- **Purpose**: Enforces privacy - students control who can see their profile

### 4. "Tutors can read student profiles"
- **Rule**: Tutors cannot see recruiter-only fields
- **Implementation**: Allows tutors to read student profiles
- **Note**: Recruiter-only fields are filtered at the application level, not in RLS
- **Purpose**: Tutors need to see student profiles for educational purposes

### 5. "Admins can read all student profiles"
- **Rule**: Admins can read everything
- **Implementation**: Uses `is_admin()` helper function
- **Purpose**: Administrative oversight

## Important Notes

1. **Recruiter-only fields**: The RLS policies don't filter specific fields. Fields marked as "recruiter-only" should be filtered at the application level when tutors access student profiles.

2. **Admin function**: The `is_admin()` function needs to be implemented based on your admin system. Common approaches:
   - Add an `is_admin` boolean to profiles
   - Create a separate `admins` table
   - Use a specific role value

3. **Implicit access**: All policies use explicit checks - no implicit access is granted. Users must meet specific conditions to access data.

