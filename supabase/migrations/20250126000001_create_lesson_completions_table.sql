-- Create lesson_completions table for tracking lesson completion
-- Simple table that records when a user completes a lesson
-- Uses user_id directly from auth.users and lesson_slug as lessonId

-- Create lesson_completions table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL, -- lesson slug (e.g., 'Module_01_Introduction')
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id) -- Prevent duplicate completions
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_lesson ON lesson_completions(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at ON lesson_completions(completed_at);

-- Enable Row Level Security
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_completions

-- Users can view their own lesson completions
DROP POLICY IF EXISTS "Users can view their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can view their own lesson completions"
  ON lesson_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own lesson completions
DROP POLICY IF EXISTS "Users can insert their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can insert their own lesson completions"
  ON lesson_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lesson completions (for idempotency)
DROP POLICY IF EXISTS "Users can update their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can update their own lesson completions"
  ON lesson_completions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all lesson completions
DROP POLICY IF EXISTS "Admins can view all lesson completions" ON lesson_completions;
CREATE POLICY "Admins can view all lesson completions"
  ON lesson_completions
  FOR SELECT
  USING (is_admin(auth.uid()));
