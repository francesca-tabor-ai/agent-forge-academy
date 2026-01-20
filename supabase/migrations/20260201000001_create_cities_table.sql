-- Create cities table for location-based features
-- Links to student_profiles via city_id for profile banners
-- Includes coordinates for nearest city search

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Display name (e.g., "London", "New York")
  normalized_key TEXT NOT NULL UNIQUE, -- Normalized key for matching (e.g., "london", "new york")
  country TEXT NOT NULL, -- Country name (e.g., "UK", "USA")
  latitude DECIMAL(10, 8), -- Latitude coordinate (nullable for cities without coordinates)
  longitude DECIMAL(11, 8), -- Longitude coordinate (nullable for cities without coordinates)
  banner_image_url TEXT, -- Banner image URL for profile headers
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cities_normalized_key ON cities(normalized_key);
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_coordinates ON cities(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create GIST index for spatial queries (if PostGIS is available, this will use it)
-- Otherwise, we'll use Haversine formula in application code
-- Note: This index creation will fail silently if PostGIS is not enabled, which is fine
-- We'll use Haversine formula in application code as fallback
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_cities_location ON cities USING GIST (
    point(longitude, latitude)
  ) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Index creation failed (likely PostGIS not enabled), continue without it
    NULL;
END $$;

-- Add comments for documentation
COMMENT ON TABLE cities IS 'Cities table for location-based features and profile banners';
COMMENT ON COLUMN cities.normalized_key IS 'Normalized city key (lowercase, space-separated, e.g., "london", "new york") for matching user input';
COMMENT ON COLUMN cities.latitude IS 'Latitude coordinate for distance calculations';
COMMENT ON COLUMN cities.longitude IS 'Longitude coordinate for distance calculations';
COMMENT ON COLUMN cities.banner_image_url IS 'Banner image URL for profile headers';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cities_updated_at ON cities;
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_cities_updated_at();

-- Enable Row Level Security (cities are public data)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Everyone can read cities
CREATE POLICY "Cities are viewable by everyone"
  ON cities
  FOR SELECT
  USING (true);
