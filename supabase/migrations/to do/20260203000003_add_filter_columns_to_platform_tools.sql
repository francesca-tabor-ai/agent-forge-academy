-- Add filter columns to platform_tools table to align with course filters
-- This enables filtering tools by track, difficulty, duration, industries, and best_for

-- Add category (track) column
ALTER TABLE platform_tools
  ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Add difficulty_level column
ALTER TABLE platform_tools
  ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50); -- 'beginner', 'intermediate', 'advanced'

-- Add duration column (time estimate like "~4-6 hours" or "~8 weeks")
ALTER TABLE platform_tools
  ADD COLUMN IF NOT EXISTS duration VARCHAR(100);

-- Add industries column (array of industries)
ALTER TABLE platform_tools
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}'::text[];

-- Add best_for column (array of target audiences)
ALTER TABLE platform_tools
  ADD COLUMN IF NOT EXISTS best_for TEXT[] DEFAULT '{}'::text[];

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_platform_tools_category ON platform_tools(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_tools_difficulty_level ON platform_tools(difficulty_level) WHERE difficulty_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_platform_tools_industries ON platform_tools USING GIN(industries);
CREATE INDEX IF NOT EXISTS idx_platform_tools_best_for ON platform_tools USING GIN(best_for);

-- Comments for documentation
COMMENT ON COLUMN platform_tools.category IS 'Tool track/category (e.g., "GTM & Revenue Operations", "Agentic Systems")';
COMMENT ON COLUMN platform_tools.difficulty_level IS 'Tool difficulty level: beginner, intermediate, or advanced';
COMMENT ON COLUMN platform_tools.duration IS 'Estimated time to use/complete the tool (e.g., "~4-6 hours", "~8 weeks")';
COMMENT ON COLUMN platform_tools.industries IS 'Array of industries this tool is relevant for';
COMMENT ON COLUMN platform_tools.best_for IS 'Array of target audiences or use cases for this tool';
