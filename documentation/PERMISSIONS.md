# Canonical Permissions for AgentForge Academy

This document defines the canonical permissions for each role in the system. All permissions are enforced via Supabase Row Level Security (RLS) at the database level. Frontend role checks are for UX only and never for security.

## Default Access: Deny

**All tables default to deny access.** Only explicitly granted permissions allow access.

## Role Definitions

### Admin

**Can:**
- Full read/write access to all tables
- Manage users and roles (assign roles, change roles)
- Create and manage events
- Publish and unpublish content
- View audit and consent logs
- Approve instructors
- Manage recruiter verification
- Access all student data regardless of visibility settings

**Cannot:**
- Impersonate users (no user switching)
- Bypass audit logging
- Change their own role (must be done by another admin)

### Student

**Can:**
- Read lessons and media
- Create and edit own profile and portfolio
- Control profile visibility (private, recruiters_only, public)
- Ask questions to instructors
- Participate in demo days
- Approve or reject recruiter contact requests
- View own contact requests
- Create and edit own portfolio projects
- View own questions and answers

**Cannot:**
- View other students' private data
- View recruiter-only analytics
- Change own role
- View recruiter profiles
- Access instructor-only areas
- Create events
- Mark answers as accepted
- Edit instructor answers
- View other students' contact requests

### Instructor

**Can:**
- Read lessons and labs
- Answer student questions
- Mark accepted answers
- Host office hours
- View student profiles where visibility allows (cannot see private unless explicitly shared)
- Read all questions
- Update own answers

**Cannot:**
- View recruiter profiles
- Access student contact details
- Change student visibility
- Manage events (unless admin)
- Edit student questions
- View private student portfolios
- Contact recruiters
- See recruiter-only fields in student profiles
- Create or manage events

### Recruiter

**Can:**
- Browse discoverable student profiles (where visibility allows)
- Request contact with students
- RSVP to demo days
- View public and recruiters_only portfolio projects
- View student profiles with visibility != 'private'
- Create contact requests

**Cannot:**
- Message students directly (must request contact)
- See student emails or private metadata
- Query portfolio projects if student visibility is private
- View private student data
- See recruiter-only-hidden fields
- Change student visibility
- Access instructor areas
- View other recruiters' contact requests (only own requests)

## Permission Enforcement

### Database Level (RLS)
- All permissions are enforced via Supabase RLS policies
- Default deny: If no policy matches, access is denied
- Policies are evaluated for every query

### Application Level
- Server-side role checks before rendering UI
- No client-side permission checks (UX only)
- Unauthorized actions are not shown in UI

## Visibility Levels

### Private
- Only the student can see their own data
- Not visible to recruiters, instructors, or other students

### Recruiters Only
- Visible to verified recruiters
- Not visible to other students or instructors
- Student can see their own data

### Public
- Visible to everyone (students, instructors, recruiters)
- Still respects RLS for data access

## Contact Requests

- Recruiters can create contact requests
- Students can approve or reject requests
- Recruiters cannot see student contact info unless approved
- No direct messaging is possible
- All contact must go through the approval system

## Admin Access

- Admin role is assigned manually (not self-service)
- Admin can read/write all rows
- Admin access is auditable (all actions logged)
- Admin cannot impersonate users
- Admin role changes require another admin

## Security Principles

1. **Default Deny**: All access is denied unless explicitly granted
2. **No Implicit Access**: Cross-role access must be intentional
3. **RLS Enforces Everything**: Database-level enforcement is the source of truth
4. **No Client-Side Security**: Frontend checks are for UX only
5. **Audit Everything**: Admin actions are logged
6. **Role Immutability**: Users cannot change their own role

