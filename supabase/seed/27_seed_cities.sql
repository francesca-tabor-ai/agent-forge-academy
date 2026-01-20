-- Seed cities table with data from documentation/images/cities.md
-- Includes coordinates for nearest city search
-- Coordinates are approximate city center locations

BEGIN;

-- Insert cities with coordinates
-- Format: normalized_key (space-separated), name, country, latitude, longitude, banner_image_url
INSERT INTO cities (normalized_key, name, country, latitude, longitude, banner_image_url)
VALUES
  -- UK Cities
  ('london', 'London', 'UK', 51.5074, -0.1278, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80'),
  ('edinburgh', 'Edinburgh', 'UK', 55.9533, -3.1883, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80'),
  ('manchester', 'Manchester', 'UK', 53.4808, -2.2426, 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80'),
  ('birmingham', 'Birmingham', 'UK', 52.4862, -1.8904, 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80'),
  
  -- USA Cities
  ('new york', 'New York', 'USA', 40.7128, -74.0060, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80'),
  ('san francisco', 'San Francisco', 'USA', 37.7749, -122.4194, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80'),
  ('los angeles', 'Los Angeles', 'USA', 34.0522, -118.2437, 'https://images.unsplash.com/photo-1515895306158-7f4f5e83b3b1?w=1920&q=80'),
  ('chicago', 'Chicago', 'USA', 41.8781, -87.6298, 'https://images.unsplash.com/photo-1494522358652-f6aa0e5c5b4e?w=1920&q=80'),
  ('boston', 'Boston', 'USA', 42.3601, -71.0589, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=80'),
  ('austin', 'Austin', 'USA', 30.2672, -97.7431, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80'),
  ('seattle', 'Seattle', 'USA', 47.6062, -122.3321, 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80'),
  ('miami', 'Miami', 'USA', 25.7617, -80.1918, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'),
  
  -- Canada Cities
  ('toronto', 'Toronto', 'Canada', 43.6532, -79.3832, 'https://images.unsplash.com/photo-1517935706615-2710063c2225?w=1920&q=80'),
  ('vancouver', 'Vancouver', 'Canada', 49.2827, -123.1207, 'https://images.unsplash.com/photo-1559511260-66a654ada982?w=1920&q=80'),
  ('montreal', 'Montreal', 'Canada', 45.5017, -73.5673, 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1920&q=80'),
  
  -- European Cities
  ('dublin', 'Dublin', 'Ireland', 53.3498, -6.2603, 'https://images.unsplash.com/photo-1515595967223-f341ab1d24f1?w=1920&q=80'),
  ('paris', 'Paris', 'France', 48.8566, 2.3522, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80'),
  ('berlin', 'Berlin', 'Germany', 52.5200, 13.4050, 'https://images.unsplash.com/photo-1587330979470-3585ac7c98ed?w=1920&q=80'),
  ('munich', 'Munich', 'Germany', 48.1351, 11.5820, 'https://images.unsplash.com/photo-1587330979470-3585ac7c98ed?w=1920&q=80'),
  ('amsterdam', 'Amsterdam', 'Netherlands', 52.3676, 4.9041, 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=80'),
  ('stockholm', 'Stockholm', 'Sweden', 59.3293, 18.0686, 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&q=80'),
  ('copenhagen', 'Copenhagen', 'Denmark', 55.6761, 12.5683, 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1920&q=80'),
  ('oslo', 'Oslo', 'Norway', 59.9139, 10.7522, 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1920&q=80'),
  ('zurich', 'Zurich', 'Switzerland', 47.3769, 8.5417, 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1920&q=80'),
  ('geneva', 'Geneva', 'Switzerland', 46.2044, 6.1432, 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1920&q=80'),
  ('madrid', 'Madrid', 'Spain', 40.4168, -3.7038, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80'),
  ('barcelona', 'Barcelona', 'Spain', 41.3851, 2.1734, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80'),
  ('lisbon', 'Lisbon', 'Portugal', 38.7223, -9.1393, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80'),
  ('rome', 'Rome', 'Italy', 41.9028, 12.4964, 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&q=80'),
  ('milan', 'Milan', 'Italy', 45.4642, 9.1900, 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=1920&q=80'),
  ('warsaw', 'Warsaw', 'Poland', 52.2297, 21.0122, 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80'),
  ('prague', 'Prague', 'Czechia', 50.0755, 14.4378, 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1920&q=80'),
  ('vienna', 'Vienna', 'Austria', 48.2082, 16.3738, 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&q=80'),
  ('athens', 'Athens', 'Greece', 37.9838, 23.7275, 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&q=80'),
  
  -- Middle East & Asia
  ('dubai', 'Dubai', 'UAE', 25.2048, 55.2708, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80'),
  ('abu dhabi', 'Abu Dhabi', 'UAE', 24.4539, 54.3773, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80'),
  ('tel aviv', 'Tel Aviv', 'Israel', 32.0853, 34.7818, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1920&q=80'),
  ('singapore', 'Singapore', 'Singapore', 1.3521, 103.8198, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80'),
  ('hong kong', 'Hong Kong', 'Hong Kong', 22.3193, 114.1694, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&q=80'),
  ('tokyo', 'Tokyo', 'Japan', 35.6762, 139.6503, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80'),
  ('osaka', 'Osaka', 'Japan', 34.6937, 135.5023, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80'),
  ('seoul', 'Seoul', 'South Korea', 37.5665, 126.9780, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80'),
  
  -- Australia & New Zealand
  ('sydney', 'Sydney', 'Australia', -33.8688, 151.2093, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'),
  ('melbourne', 'Melbourne', 'Australia', -37.8136, 144.9631, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'),
  ('brisbane', 'Brisbane', 'Australia', -27.4698, 153.0251, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'),
  ('auckland', 'Auckland', 'New Zealand', -36.8485, 174.7633, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'),
  
  -- India
  ('bangalore', 'Bangalore', 'India', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=80'),
  ('mumbai', 'Mumbai', 'India', 19.0760, 72.8777, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=80'),
  ('delhi', 'Delhi', 'India', 28.6139, 77.2090, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920&q=80')
ON CONFLICT (normalized_key) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  banner_image_url = EXCLUDED.banner_image_url,
  updated_at = NOW();

COMMIT;
