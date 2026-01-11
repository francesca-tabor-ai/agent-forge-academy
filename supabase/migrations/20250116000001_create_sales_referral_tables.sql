-- Create sales referral tracking tables
-- Tables: sales_reps, sales_referral_links, sales_referral_visits
-- Purpose: Track sales team referral links and visitor analytics

-- 1. Create sales_reps table
CREATE TABLE IF NOT EXISTS sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  team TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups (unique constraint already creates one, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_sales_reps_email ON sales_reps(email);

-- Create index on is_active for filtering active reps
CREATE INDEX IF NOT EXISTS idx_sales_reps_is_active ON sales_reps(is_active);

-- 2. Create sales_referral_links table
CREATE TABLE IF NOT EXISTS sales_referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_rep_id UUID NOT NULL REFERENCES sales_reps(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  destination_path TEXT NOT NULL,
  campaign TEXT,
  utm_source TEXT NOT NULL DEFAULT 'sales',
  utm_medium TEXT NOT NULL DEFAULT 'referral',
  utm_campaign TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on sales_rep_id for filtering links by rep
CREATE INDEX IF NOT EXISTS idx_sales_referral_links_sales_rep_id ON sales_referral_links(sales_rep_id);

-- Create index on campaign for campaign-based queries
CREATE INDEX IF NOT EXISTS idx_sales_referral_links_campaign ON sales_referral_links(campaign);

-- Create index on slug for fast lookups (unique constraint already creates one, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_sales_referral_links_slug ON sales_referral_links(slug);

-- 3. Create sales_referral_visits table
CREATE TABLE IF NOT EXISTS sales_referral_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_link_id UUID NOT NULL REFERENCES sales_referral_links(id) ON DELETE CASCADE,
  sales_rep_id UUID NOT NULL REFERENCES sales_reps(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  landing_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  ga_client_id TEXT,
  session_id TEXT
);

-- Create index on referral_link_id for filtering visits by link
CREATE INDEX IF NOT EXISTS idx_sales_referral_visits_referral_link_id ON sales_referral_visits(referral_link_id);

-- Create index on sales_rep_id for filtering visits by rep
CREATE INDEX IF NOT EXISTS idx_sales_referral_visits_sales_rep_id ON sales_referral_visits(sales_rep_id);

-- Create index on visited_at for time-based queries and analytics
CREATE INDEX IF NOT EXISTS idx_sales_referral_visits_visited_at ON sales_referral_visits(visited_at);

-- Create index on session_id for session-based queries
CREATE INDEX IF NOT EXISTS idx_sales_referral_visits_session_id ON sales_referral_visits(session_id);

-- Enable Row Level Security (RLS) on all tables
-- Note: RLS policies should be added in a separate migration if needed
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_referral_visits ENABLE ROW LEVEL SECURITY;
