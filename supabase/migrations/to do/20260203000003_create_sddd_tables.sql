-- Create Spec-Driven Development (SDDD) tables
-- Tables: sddd_workflows, sddd_documents, sddd_document_versions, sddd_settings
-- RLS: Students can only read/write their own data

BEGIN;

-- Create sddd_workflows table
CREATE TABLE IF NOT EXISTS sddd_workflows (
  id SERIAL PRIMARY KEY,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  current_agent VARCHAR(50),
  context_variables JSONB DEFAULT '[]'::jsonb,
  constitution_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sddd_documents table
CREATE TABLE IF NOT EXISTS sddd_documents (
  id SERIAL PRIMARY KEY,
  workflow_id INTEGER REFERENCES sddd_workflows(id) ON DELETE CASCADE,
  agent_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  output_type VARCHAR(100) NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sddd_document_versions table
CREATE TABLE IF NOT EXISTS sddd_document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES sddd_documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sddd_settings table
CREATE TABLE IF NOT EXISTS sddd_settings (
  id SERIAL PRIMARY KEY,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_profile_id, key)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sddd_workflows_student_profile_id ON sddd_workflows(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_sddd_workflows_status ON sddd_workflows(status);
CREATE INDEX IF NOT EXISTS idx_sddd_workflows_created_at ON sddd_workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sddd_documents_workflow_id ON sddd_documents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_sddd_documents_agent_type ON sddd_documents(agent_type);
CREATE INDEX IF NOT EXISTS idx_sddd_document_versions_document_id ON sddd_document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_sddd_settings_student_profile_id ON sddd_settings(student_profile_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sddd_workflows_updated_at ON sddd_workflows;
CREATE TRIGGER update_sddd_workflows_updated_at
  BEFORE UPDATE ON sddd_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sddd_documents_updated_at ON sddd_documents;
CREATE TRIGGER update_sddd_documents_updated_at
  BEFORE UPDATE ON sddd_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sddd_settings_updated_at ON sddd_settings;
CREATE TRIGGER update_sddd_settings_updated_at
  BEFORE UPDATE ON sddd_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE sddd_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sddd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sddd_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sddd_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Students can only access their own data
CREATE POLICY "Students can view their own workflows"
  ON sddd_workflows FOR SELECT
  USING (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can insert their own workflows"
  ON sddd_workflows FOR INSERT
  WITH CHECK (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can update their own workflows"
  ON sddd_workflows FOR UPDATE
  USING (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can delete their own workflows"
  ON sddd_workflows FOR DELETE
  USING (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can view documents for their workflows"
  ON sddd_documents FOR SELECT
  USING (
    workflow_id IN (
      SELECT id FROM sddd_workflows
      WHERE student_profile_id IN (
        SELECT id FROM student_profiles
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
    OR workflow_id IS NULL
  );

CREATE POLICY "Students can insert documents for their workflows"
  ON sddd_documents FOR INSERT
  WITH CHECK (
    workflow_id IS NULL
    OR workflow_id IN (
      SELECT id FROM sddd_workflows
      WHERE student_profile_id IN (
        SELECT id FROM student_profiles
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Students can update documents for their workflows"
  ON sddd_documents FOR UPDATE
  USING (
    workflow_id IN (
      SELECT id FROM sddd_workflows
      WHERE student_profile_id IN (
        SELECT id FROM student_profiles
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
    OR workflow_id IS NULL
  );

CREATE POLICY "Students can delete documents for their workflows"
  ON sddd_documents FOR DELETE
  USING (
    workflow_id IN (
      SELECT id FROM sddd_workflows
      WHERE student_profile_id IN (
        SELECT id FROM student_profiles
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
    OR workflow_id IS NULL
  );

CREATE POLICY "Students can view document versions for their documents"
  ON sddd_document_versions FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM sddd_documents
      WHERE workflow_id IN (
        SELECT id FROM sddd_workflows
        WHERE student_profile_id IN (
          SELECT id FROM student_profiles
          WHERE profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
          )
        )
      )
      OR workflow_id IS NULL
    )
  );

CREATE POLICY "Students can insert document versions for their documents"
  ON sddd_document_versions FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM sddd_documents
      WHERE workflow_id IN (
        SELECT id FROM sddd_workflows
        WHERE student_profile_id IN (
          SELECT id FROM student_profiles
          WHERE profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
          )
        )
      )
      OR workflow_id IS NULL
    )
  );

CREATE POLICY "Students can view their own settings"
  ON sddd_settings FOR SELECT
  USING (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can insert their own settings"
  ON sddd_settings FOR INSERT
  WITH CHECK (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Students can update their own settings"
  ON sddd_settings FOR UPDATE
  USING (
    student_profile_id IN (
      SELECT id FROM student_profiles
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

COMMIT;
