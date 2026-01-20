# Documentation Organization

This directory contains all project documentation organized by topic and feature area.

## Folder Structure

### `/architecture`
High-level architecture, design system, and routing documentation.
- `ARCHITECTURE_SUMMARY.md` - Complete system architecture overview
- `DESIGN_NOTES.md` - Design decisions and notes
- `DESIGN_SYSTEM.md` - UI/UX design system guidelines
- `ROLE_BASED_ROUTING.md` - Role-based routing implementation

### `/api`
API documentation, setup, and integration guides.
- `API_ROUTE_GUARDING.md` - API route protection
- `API_SETUP_AND_INTEGRATION.md` - API setup instructions
- `MISSING_APIS.md` - Missing API endpoints tracking
- `STRUCTURED_LOGGING.md` - Logging standards
- `WEBHOOK_VALIDATION.md` - Webhook validation

### `/ai-advisor`
AI Advisor feature documentation and fixes.
- `AI_ADVISOR_FIX.md` - AI Advisor bug fixes
- `AI_ADVISOR_FIXES.md` - Additional fixes
- `AI_ADVISOR_UAT_MAPPING.md` - UAT mapping for AI Advisor

### `/cv-portfolio`
CV upload and portfolio management documentation.
- `CV_PORTFOLIO_PAGE.md` - Portfolio page implementation
- `CV_UPLOAD_API.md` - CV upload API documentation
- `CV_UPLOAD_BUCKET_FIX.md` - Storage bucket fixes
- `CV_UPLOAD_BUG_FIXES.md` - Bug fixes
- `CV_UPLOAD_DEFINITION_OF_DONE.md` - Completion criteria
- `CV_UPLOAD_E2E_TESTING.md` - End-to-end testing
- `CV_UPLOAD_FRONTEND.md` - Frontend implementation
- `CV_UPLOAD_SCHEMA.md` - Database schema
- `PORTFOLIO_GUIDE.md` - Portfolio feature guide
- `PORTFOLIO_PROFILE_API_FIXES.md` - API fixes
- `PROJECT_IMAGES_IMPLEMENTATION.md` - Project images feature

### `/courses`
Course management, sync, and subscription linking.
- `COURSES.md` - Course system overview
- `COURSE_SUBSCRIPTION_LINKING_PLAN.md` - Subscription linking plan
- `COURSE_SYNC_IMPLEMENTATION.md` - Course sync implementation
- `COURSE_SYNC_PLAN.md` - Course sync planning
- `MULTI_COURSE_GUIDE.md` - Multi-course management guide

### `/email`
Email system implementation and status.
- `EMAIL_SYSTEM_API_ENDPOINTS.md` - Email API endpoints
- `EMAIL_SYSTEM_IMPLEMENTATION_CHECKLIST.md` - Implementation checklist
- `EMAIL_SYSTEM_STATUS.md` - Current status

### `/interviews`
Interview preparation guides and frameworks.
- `UBTIF_GUIDE.md` - Unified Big Tech Interview Framework comprehensive guide
- `UBTIF_QUICK_REFERENCE.md` - Quick reference cheat sheet for interview prep
- `UBTIF_SYSTEM_PROMPTS.md` - AI prompts and templates for presenting work experiences

### `/jobs`
Job matching and opportunities feature.
- `JOBS_500_ERROR_FIX.md` - Error fixes
- `JOBS_API_FIX.md` - API fixes

### `/migrations`
Database migration documentation and guides.
- `FIX_DUPLICATE_MIGRATION.md` - Duplicate migration fixes
- `MIGRATION_COMPLETE.md` - Migration completion status
- `MIGRATION_INSTRUCTIONS.md` - How to run migrations
- `PRICING_RISK_LAB_MIGRATION.md` - Specific migration guide
- `RUN_MIGRATIONS.md` - Migration execution guide
- `RUN_STRIPE_MIGRATIONS.md` - Stripe-specific migrations
- `VERIFY_MIGRATIONS.md` - Migration verification

### `/permissions-security`
Security, permissions, and Row Level Security (RLS) documentation.
- `PERMISSIONS.md` - Permission system overview
- `RLS_NOTES.md` - RLS implementation notes
- `RLS_POLICIES_EXPLANATION.md` - RLS policy documentation
- `RLS_STRATEGY.md` - RLS strategy and approach
- `FRONTEND_ACCESS_CONTROL.md` - Frontend access control

### `/recruiter`
Recruiter-specific features and access.
- `RECRUITER_CV_ACCESS_DEFINITION_OF_DONE.md` - CV access feature completion

### `/realtime`
Realtime features documentation.
- `REALTIME_DEFINITION_OF_DONE.md` - Realtime feature completion

### `/setup-config`
Environment setup, configuration, and deployment guides.
- `SETUP_ENV.md` - Environment setup
- `DOCKER_SETUP.md` - Docker configuration
- `VERCEL_ENV_VAR_CHECKLIST.md` - Vercel environment variables
- `VERCEL_SUPABASE_ENV_SETUP.md` - Vercel + Supabase setup
- `SUPABASE_ENV_VERIFICATION_REPORT.md` - Environment verification
- `SUPABASE_COURSE_IMAGES_BUCKET_SETUP.md` - Course images bucket
- `SUPABASE_PROFILE_HEADSHOTS_BUCKET_SETUP.md` - Profile headshots bucket
- `SUPABASE_RESUMES_BUCKET_SETUP.md` - Resumes bucket setup

### `/stripe`
Stripe integration and payment processing.
- `STRIPE_INTEGRATION_PLAN.md` - Integration planning
- `STRIPE_PRODUCT_IDS.md` - Product ID reference
- `STRIPE_SETUP_GUIDE.md` - Setup instructions
- `STRIPE_TABLES_STRUCTURE.md` - Database structure

### `/subscriptions`
Subscription management, tiers, and access control.
- `SUBSCRIPTION_ACCESS_MODEL.md` - Access model
- `SUBSCRIPTION_BUTTON_ACTIONS.md` - Button actions
- `SUBSCRIPTION_CHANGE_HANDLING.md` - Change handling
- `SUBSCRIPTION_COMPLETION_CHECKLIST.md` - Completion checklist
- `SUBSCRIPTION_DATA_LOADER.md` - Data loading
- `SUBSCRIPTION_DATA_MODEL.md` - Data model
- `SUBSCRIPTION_LOADING_ERROR_STATES.md` - Error states
- `SUBSCRIPTION_PAGE_IMPLEMENTATION.md` - Page implementation
- `SUBSCRIPTION_REFACTOR_COMPLETE.md` - Refactor status
- `SUBSCRIPTION_SCHEMA_VERIFICATION.md` - Schema verification
- `SUBSCRIPTION_TIER_ANALYSIS.md` - Tier analysis
- `SUBSCRIPTION_UI_REFACTOR.md` - UI refactor
- `EDGE_CASES_SUBSCRIPTION_ACCESS.md` - Edge cases
- `TIER_ENTITLEMENTS_MANAGEMENT.md` - Entitlements management

### `/testing`
Testing documentation, checklists, and bug fixes.
- `QA_CHECKLIST.md` - Quality assurance checklist
- `IMPLEMENTATION_STATUS.md` - Implementation status tracking
- `UAT_COMPLETION_STATUS.md` - UAT completion status
- `BUILD_FIX.md` - Build fixes
- `FIXES_SUMMARY.md` - Summary of fixes
- `PRODUCTION_ERRORS_FIX.md` - Production error fixes
- `SEED_DATA_TROUBLESHOOTING.md` - Seed data issues

### `/tools`
Tools and tool runs documentation.
- `TOOL_RUNS_SCHEMA_PLAN.md` - Schema planning
- `TOOLS_MIGRATION_GUIDE.md` - Migration guide

### `/uat`
User Acceptance Testing (UAT) documentation.
- `UAT_MOCK_ENDPOINTS.md` - Mock endpoints for UAT
- `UAT_MOCK_MODE.md` - Mock mode configuration
- `UAT_VOICE_MOCK_MODE.md` - Voice mock mode
- `UAT_WEBRTC_MOCK_MODE.md` - WebRTC mock mode

### `/content`
Content authoring and guidelines.
- `CONTENT_AUTHORING_GUIDELINES.md` - Content creation guidelines

### `/voice`
Voice AI features and testing.
- `VOICE_API_TESTING.md` - Voice API testing
- `VOICE_AI_AND_JOBS_MATCHING_PROPOSAL.md` - Voice AI + jobs matching proposal

### `/webrtc`
WebRTC implementation documentation.
- `WEBRTC_ISOLATION.md` - WebRTC isolation

## Root Files

- `CURSOR_PROMPT.md` - General development prompt for Cursor AI
- `README.md` - This file
