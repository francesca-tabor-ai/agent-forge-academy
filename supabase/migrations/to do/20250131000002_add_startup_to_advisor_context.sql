-- Add active_startup_id to advisor_context and advisor_conversations tables
-- Allows students to set a startup as their active context for AI advisor

-- Add column to advisor_context table
ALTER TABLE advisor_context 
ADD COLUMN IF NOT EXISTS active_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL;

-- Add column to advisor_conversations table
ALTER TABLE advisor_conversations 
ADD COLUMN IF NOT EXISTS active_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL;

-- Update index to include startup in context index
DROP INDEX IF EXISTS idx_advisor_conversations_context;
CREATE INDEX IF NOT EXISTS idx_advisor_conversations_context 
ON advisor_conversations(active_course_id, active_project_id, active_job_id, active_startup_id);
