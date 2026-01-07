# Database Design Notes

## Student Profiles and Portfolio Projects

### Design Choices

1. **Separate student_profiles table**: 
   - Extends the base `profiles` table with student-specific fields
   - Uses a foreign key to `profiles` with a CHECK constraint ensuring the profile role is 'student'
   - Allows for future extension without modifying the base profiles table

2. **Visibility control at two levels**:
   - `student_profiles.visibility`: Controls overall profile visibility
   - `portfolio_projects.visibility`: Allows per-project visibility control
   - Uses enum type `visibility_level` for type safety and consistency

3. **Portfolio projects ownership**:
   - Each project belongs to exactly one student via `student_profile_id`
   - CASCADE delete ensures projects are removed when student profile is deleted
   - Projects can have independent visibility from the student profile

4. **URL fields**:
   - `github_url` and `demo_url` stored as TEXT (no length restriction)
   - No validation at DB level (handled in application layer)
   - Allows flexibility for various URL formats

5. **Minimal schema**:
   - Only essential fields included
   - Timestamps for audit trail
   - Indexes on foreign keys and visibility for query performance

