-- Create advisor_context and advisor_conversations tables
-- Stores user's active context (course/project/job) and conversation history

-- Create advisor_context table
-- One row per student_profile_id to store their current active context
CREATE TABLE IF NOT EXISTS advisor_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
  active_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  active_project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  active_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create advisor_conversations table
-- Stores conversation history per context
CREATE TABLE IF NOT EXISTS advisor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(), -- Groups messages in a conversation
  active_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  active_project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  active_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'human')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Store intent, quick_action, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_context_student_profile_id ON advisor_context(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_advisor_conversations_student_profile_id ON advisor_conversations(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_advisor_conversations_conversation_id ON advisor_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_advisor_conversations_context ON advisor_conversations(active_course_id, active_project_id, active_job_id);
CREATE INDEX IF NOT EXISTS idx_advisor_conversations_created_at ON advisor_conversations(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_advisor_context_updated_at ON advisor_context;
CREATE TRIGGER update_advisor_context_updated_at
  BEFORE UPDATE ON advisor_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE advisor_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_context
-- Students can read their own context
DROP POLICY IF EXISTS "Students can read own advisor context" ON advisor_context;
CREATE POLICY "Students can read own advisor context"
  ON advisor_context
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = advisor_context.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own context
DROP POLICY IF EXISTS "Students can insert own advisor context" ON advisor_context;
CREATE POLICY "Students can insert own advisor context"
  ON advisor_context
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = advisor_context.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own context
DROP POLICY IF EXISTS "Students can update own advisor context" ON advisor_context;
CREATE POLICY "Students can update own advisor context"
  ON advisor_context
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = advisor_context.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for advisor_conversations
-- Students can read their own conversations
DROP POLICY IF EXISTS "Students can read own advisor conversations" ON advisor_conversations;
CREATE POLICY "Students can read own advisor conversations"
  ON advisor_conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = advisor_conversations.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own conversations
DROP POLICY IF EXISTS "Students can insert own advisor conversations" ON advisor_conversations;
CREATE POLICY "Students can insert own advisor conversations"
  ON advisor_conversations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = advisor_conversations.student_profile_id
      AND p.user_id = auth.uid()
    )
  );
