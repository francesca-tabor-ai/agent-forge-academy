-- Create Vibe Coding Founder Inspiration Platform tables
-- This migration creates the complete schema for a content + learning + AI-assisted ideation platform
-- where users discover real founders, understand business models, take courses, and use AI to ideate

BEGIN;

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- User roles (extend existing if needed, but keep separate for clarity)
DO $$ BEGIN
    CREATE TYPE platform_user_role AS ENUM ('user', 'creator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription tiers
DO $$ BEGIN
    CREATE TYPE subscription_tier_type AS ENUM ('free', 'pro', 'builder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Startup status
DO $$ BEGIN
    CREATE TYPE startup_status AS ENUM ('active', 'acquired', 'shut_down');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Revenue range
DO $$ BEGIN
    CREATE TYPE revenue_range AS ENUM ('pre_revenue', '$1_10k', '$10_50k', '$50k_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Pricing model
DO $$ BEGIN
    CREATE TYPE pricing_model AS ENUM ('subscription', 'usage', 'one_off');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tool category
DO $$ BEGIN
    CREATE TYPE tool_category AS ENUM ('ai', 'frontend', 'backend', 'infra', 'nocode');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tool cost model
DO $$ BEGIN
    CREATE TYPE tool_cost_model AS ENUM ('free', 'freemium', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Prompt type
DO $$ BEGIN
    CREATE TYPE prompt_type AS ENUM ('ideation', 'frontend', 'backend', 'debugging');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Difficulty level
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Technical difficulty
DO $$ BEGIN
    CREATE TYPE technical_difficulty AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Course level
DO $$ BEGIN
    CREATE TYPE course_level AS ENUM ('beginner', 'intermediate');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Course access tier
DO $$ BEGIN
    CREATE TYPE course_access_tier AS ENUM ('free', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE IDENTITY & ACCESS
-- ============================================================================

-- Note: We extend the existing profiles table rather than creating a new users table
-- Add platform-specific fields to profiles if they don't exist
DO $$
BEGIN
  -- Add subscription_tier if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN subscription_tier subscription_tier_type DEFAULT 'free';
  END IF;

  -- Add ai_credits if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'ai_credits'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN ai_credits INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- 3. FOUNDERS & STARTUPS
-- ============================================================================

-- Founders table
CREATE TABLE IF NOT EXISTS founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  website TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES founders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  status startup_status NOT NULL DEFAULT 'active',
  launch_year INTEGER,
  revenue_range revenue_range,
  pricing_model pricing_model,
  target_customer TEXT,
  vibe_score INTEGER CHECK (vibe_score >= 1 AND vibe_score <= 10),
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. BUSINESS MODEL BREAKDOWN
-- ============================================================================

-- Business models table
CREATE TABLE IF NOT EXISTS business_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  revenue_streams JSONB DEFAULT '[]'::jsonb,
  pricing_details JSONB DEFAULT '{}'::jsonb,
  distribution_channels JSONB DEFAULT '[]'::jsonb,
  key_metrics JSONB DEFAULT '{}'::jsonb,
  growth_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. VIBE CODING STACK
-- ============================================================================

-- Tools table (reusable tool registry)
CREATE TABLE IF NOT EXISTS vibe_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category tool_category NOT NULL,
  cost_model tool_cost_model NOT NULL,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Startup tools (many-to-many)
CREATE TABLE IF NOT EXISTS startup_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES vibe_tools(id) ON DELETE CASCADE,
  usage_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(startup_id, tool_id)
);

-- Vibe prompts table
CREATE TABLE IF NOT EXISTS vibe_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  prompt_type prompt_type NOT NULL,
  prompt_text TEXT NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'intermediate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. BUILD DIFFICULTY & ESTIMATES
-- ============================================================================

-- Build estimates table
CREATE TABLE IF NOT EXISTS build_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  technical_difficulty technical_difficulty NOT NULL,
  estimated_build_time_days INTEGER,
  estimated_build_cost_usd INTEGER,
  maintenance_cost_usd_monthly INTEGER,
  solo_friendly BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revenue potential table
CREATE TABLE IF NOT EXISTS revenue_potential (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL UNIQUE REFERENCES startups(id) ON DELETE CASCADE,
  conservative_mrr INTEGER,
  realistic_mrr INTEGER,
  breakout_mrr INTEGER,
  assumptions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. COURSES & CLONE PLAYBOOKS
-- ============================================================================

-- Courses table (for clone/adaptation courses)
CREATE TABLE IF NOT EXISTS startup_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  level course_level NOT NULL DEFAULT 'beginner',
  price INTEGER NOT NULL DEFAULT 0,
  access_tier course_access_tier NOT NULL DEFAULT 'free',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES startup_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. AI IDEATION & CLONE-NOT-CLONE ENGINE
-- ============================================================================

-- AI sessions table
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI ideas table
CREATE TABLE IF NOT EXISTS ai_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  niche TEXT,
  problem_statement TEXT,
  solution_outline TEXT,
  differentiation TEXT,
  estimated_build JSONB DEFAULT '{}'::jsonb,
  estimated_revenue JSONB DEFAULT '{}'::jsonb,
  risk_factors TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. ENGAGEMENT & INSPIRATION LAYER
-- ============================================================================

-- Bookmarks table
CREATE TABLE IF NOT EXISTS startup_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, startup_id)
);

-- Progress tracking table
CREATE TABLE IF NOT EXISTS startup_progress_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES startup_courses(id) ON DELETE CASCADE,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================================================
-- 10. INDEXES
-- ============================================================================

-- Founders indexes
CREATE INDEX IF NOT EXISTS idx_founders_verified ON founders(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_founders_created_at ON founders(created_at DESC);

-- Startups indexes
CREATE INDEX IF NOT EXISTS idx_startups_founder_id ON startups(founder_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON startups(status);
CREATE INDEX IF NOT EXISTS idx_startups_revenue_range ON startups(revenue_range);
CREATE INDEX IF NOT EXISTS idx_startups_vibe_score ON startups(vibe_score DESC);
CREATE INDEX IF NOT EXISTS idx_startups_created_at ON startups(created_at DESC);

-- Business models indexes
CREATE INDEX IF NOT EXISTS idx_business_models_startup_id ON business_models(startup_id);

-- Tools indexes
CREATE INDEX IF NOT EXISTS idx_vibe_tools_category ON vibe_tools(category);
CREATE INDEX IF NOT EXISTS idx_vibe_tools_cost_model ON vibe_tools(cost_model);

-- Startup tools indexes
CREATE INDEX IF NOT EXISTS idx_startup_tools_startup_id ON startup_tools(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_tools_tool_id ON startup_tools(tool_id);

-- Vibe prompts indexes
CREATE INDEX IF NOT EXISTS idx_vibe_prompts_startup_id ON vibe_prompts(startup_id);
CREATE INDEX IF NOT EXISTS idx_vibe_prompts_prompt_type ON vibe_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_vibe_prompts_difficulty ON vibe_prompts(difficulty);

-- Build estimates indexes
CREATE INDEX IF NOT EXISTS idx_build_estimates_startup_id ON build_estimates(startup_id);
CREATE INDEX IF NOT EXISTS idx_build_estimates_technical_difficulty ON build_estimates(technical_difficulty);
CREATE INDEX IF NOT EXISTS idx_build_estimates_solo_friendly ON build_estimates(solo_friendly) WHERE solo_friendly = true;

-- Revenue potential indexes
CREATE INDEX IF NOT EXISTS idx_revenue_potential_startup_id ON revenue_potential(startup_id);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_startup_courses_startup_id ON startup_courses(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_courses_access_tier ON startup_courses(access_tier);
CREATE INDEX IF NOT EXISTS idx_startup_courses_level ON startup_courses(level);

-- Course modules indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order_index ON course_modules(course_id, order_index);

-- AI sessions indexes
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_startup_id ON ai_sessions(startup_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_created_at ON ai_sessions(created_at DESC);

-- AI ideas indexes
CREATE INDEX IF NOT EXISTS idx_ai_ideas_ai_session_id ON ai_ideas(ai_session_id);
CREATE INDEX IF NOT EXISTS idx_ai_ideas_created_at ON ai_ideas(created_at DESC);

-- Bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_startup_bookmarks_user_id ON startup_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_bookmarks_startup_id ON startup_bookmarks(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_bookmarks_created_at ON startup_bookmarks(created_at DESC);

-- Progress tracking indexes
CREATE INDEX IF NOT EXISTS idx_startup_progress_tracking_user_id ON startup_progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_progress_tracking_course_id ON startup_progress_tracking(course_id);

-- ============================================================================
-- 11. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Founders trigger
DROP TRIGGER IF EXISTS update_founders_updated_at ON founders;
CREATE TRIGGER update_founders_updated_at
  BEFORE UPDATE ON founders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Startups trigger
DROP TRIGGER IF EXISTS update_startups_updated_at ON startups;
CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Business models trigger
DROP TRIGGER IF EXISTS update_business_models_updated_at ON business_models;
CREATE TRIGGER update_business_models_updated_at
  BEFORE UPDATE ON business_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vibe tools trigger
DROP TRIGGER IF EXISTS update_vibe_tools_updated_at ON vibe_tools;
CREATE TRIGGER update_vibe_tools_updated_at
  BEFORE UPDATE ON vibe_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vibe prompts trigger
DROP TRIGGER IF EXISTS update_vibe_prompts_updated_at ON vibe_prompts;
CREATE TRIGGER update_vibe_prompts_updated_at
  BEFORE UPDATE ON vibe_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Build estimates trigger
DROP TRIGGER IF EXISTS update_build_estimates_updated_at ON build_estimates;
CREATE TRIGGER update_build_estimates_updated_at
  BEFORE UPDATE ON build_estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Revenue potential trigger
DROP TRIGGER IF EXISTS update_revenue_potential_updated_at ON revenue_potential;
CREATE TRIGGER update_revenue_potential_updated_at
  BEFORE UPDATE ON revenue_potential
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Startup courses trigger
DROP TRIGGER IF EXISTS update_startup_courses_updated_at ON startup_courses;
CREATE TRIGGER update_startup_courses_updated_at
  BEFORE UPDATE ON startup_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Course modules trigger
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON course_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- AI ideas trigger
DROP TRIGGER IF EXISTS update_ai_ideas_updated_at ON ai_ideas;
CREATE TRIGGER update_ai_ideas_updated_at
  BEFORE UPDATE ON ai_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Progress tracking trigger
DROP TRIGGER IF EXISTS update_startup_progress_tracking_updated_at ON startup_progress_tracking;
CREATE TRIGGER update_startup_progress_tracking_updated_at
  BEFORE UPDATE ON startup_progress_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_potential ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_progress_tracking ENABLE ROW LEVEL SECURITY;

-- Founders policies
DROP POLICY IF EXISTS "Anyone can view founders" ON founders;
CREATE POLICY "Anyone can view founders"
  ON founders
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage founders" ON founders;
CREATE POLICY "Admins can manage founders"
  ON founders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Startups policies
DROP POLICY IF EXISTS "Anyone can view startups" ON startups;
CREATE POLICY "Anyone can view startups"
  ON startups
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage startups" ON startups;
CREATE POLICY "Admins can manage startups"
  ON startups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Business models policies
DROP POLICY IF EXISTS "Anyone can view business models" ON business_models;
CREATE POLICY "Anyone can view business models"
  ON business_models
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage business models" ON business_models;
CREATE POLICY "Admins can manage business models"
  ON business_models
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Vibe tools policies
DROP POLICY IF EXISTS "Anyone can view vibe tools" ON vibe_tools;
CREATE POLICY "Anyone can view vibe tools"
  ON vibe_tools
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage vibe tools" ON vibe_tools;
CREATE POLICY "Admins can manage vibe tools"
  ON vibe_tools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Startup tools policies
DROP POLICY IF EXISTS "Anyone can view startup tools" ON startup_tools;
CREATE POLICY "Anyone can view startup tools"
  ON startup_tools
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage startup tools" ON startup_tools;
CREATE POLICY "Admins can manage startup tools"
  ON startup_tools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Vibe prompts policies
DROP POLICY IF EXISTS "Anyone can view vibe prompts" ON vibe_prompts;
CREATE POLICY "Anyone can view vibe prompts"
  ON vibe_prompts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage vibe prompts" ON vibe_prompts;
CREATE POLICY "Admins can manage vibe prompts"
  ON vibe_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Build estimates policies
DROP POLICY IF EXISTS "Anyone can view build estimates" ON build_estimates;
CREATE POLICY "Anyone can view build estimates"
  ON build_estimates
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage build estimates" ON build_estimates;
CREATE POLICY "Admins can manage build estimates"
  ON build_estimates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Revenue potential policies
DROP POLICY IF EXISTS "Anyone can view revenue potential" ON revenue_potential;
CREATE POLICY "Anyone can view revenue potential"
  ON revenue_potential
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage revenue potential" ON revenue_potential;
CREATE POLICY "Admins can manage revenue potential"
  ON revenue_potential
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Startup courses policies
DROP POLICY IF EXISTS "Anyone can view startup courses" ON startup_courses;
CREATE POLICY "Anyone can view startup courses"
  ON startup_courses
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage startup courses" ON startup_courses;
CREATE POLICY "Admins can manage startup courses"
  ON startup_courses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Course modules policies
DROP POLICY IF EXISTS "Anyone can view course modules" ON course_modules;
CREATE POLICY "Anyone can view course modules"
  ON course_modules
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage course modules" ON course_modules;
CREATE POLICY "Admins can manage course modules"
  ON course_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AI sessions policies (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own AI sessions" ON ai_sessions;
CREATE POLICY "Users can view their own AI sessions"
  ON ai_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own AI sessions" ON ai_sessions;
CREATE POLICY "Users can create their own AI sessions"
  ON ai_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all AI sessions" ON ai_sessions;
CREATE POLICY "Admins can manage all AI sessions"
  ON ai_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- AI ideas policies (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own AI ideas" ON ai_ideas;
CREATE POLICY "Users can view their own AI ideas"
  ON ai_ideas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_ideas.ai_session_id
      AND ai_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create their own AI ideas" ON ai_ideas;
CREATE POLICY "Users can create their own AI ideas"
  ON ai_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_sessions
      WHERE ai_sessions.id = ai_ideas.ai_session_id
      AND ai_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all AI ideas" ON ai_ideas;
CREATE POLICY "Admins can manage all AI ideas"
  ON ai_ideas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Bookmarks policies (users can only manage their own)
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON startup_bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON startup_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON startup_bookmarks;
CREATE POLICY "Users can manage their own bookmarks"
  ON startup_bookmarks
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Progress tracking policies (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own progress" ON startup_progress_tracking;
CREATE POLICY "Users can view their own progress"
  ON startup_progress_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own progress" ON startup_progress_tracking;
CREATE POLICY "Users can manage their own progress"
  ON startup_progress_tracking
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 13. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE founders IS 'Real founders interviewed or featured on the platform';
COMMENT ON TABLE startups IS 'Startups built via vibe coding, linked to founders';
COMMENT ON TABLE business_models IS 'Business model breakdown explaining how startups make money';
COMMENT ON TABLE vibe_tools IS 'Reusable tool registry (Cursor, GPT-4, Supabase, etc.)';
COMMENT ON TABLE startup_tools IS 'Many-to-many relationship between startups and tools';
COMMENT ON TABLE vibe_prompts IS 'Actual or reconstructed prompts used to build startups';
COMMENT ON TABLE build_estimates IS 'Build difficulty and time/cost estimates for cloning/adapting startups';
COMMENT ON TABLE revenue_potential IS 'Scenario-based revenue modeling (conservative, realistic, breakout)';
COMMENT ON TABLE startup_courses IS 'Courses teaching how to build a clone or adaptation of a startup';
COMMENT ON TABLE course_modules IS 'Modules within startup courses';
COMMENT ON TABLE ai_sessions IS 'Tracks AI chat sessions per user for ideation';
COMMENT ON TABLE ai_ideas IS 'Generated business ideas from AI ideation sessions';
COMMENT ON TABLE startup_bookmarks IS 'User bookmarks for startups they find inspiring';
COMMENT ON TABLE startup_progress_tracking IS 'Tracks learning progress through startup courses';

COMMIT;
