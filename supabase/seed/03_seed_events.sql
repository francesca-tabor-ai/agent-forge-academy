-- Seed events: demo days, workshops, networking events
-- No dependencies - can be seeded independently
-- Uses deterministic UUIDs based on title for easy reference

BEGIN;

-- Helper function to generate deterministic UUID from string
CREATE OR REPLACE FUNCTION deterministic_uuid(input_text TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5('6ba7b811-9dad-11d1-80b4-00c04fd430c8'::uuid, input_text);
EXCEPTION
  WHEN OTHERS THEN
    RETURN ('00000000-0000-0000-0000-' || substr(md5(input_text), 1, 12))::uuid;
END;
$$ LANGUAGE plpgsql;

-- Ensure uuid extension is available
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Insert sample events with deterministic UUIDs
-- Store IDs in variables for later reference
DO $$
DECLARE
  event_q1_2025_id UUID := deterministic_uuid('event:Q1 2025 Demo Day');
  event_workshop_id UUID := deterministic_uuid('event:AI Agent Architecture Workshop');
  event_networking_id UUID := deterministic_uuid('event:Recruiter Networking Session');
  event_q4_2024_id UUID := deterministic_uuid('event:Q4 2024 Demo Day Recording');
BEGIN
  -- Insert events
  INSERT INTO events (id, title, description, event_type, start_time, end_time, location, recording_url)
  VALUES
    (
      event_q1_2025_id,
      'Q1 2025 Demo Day',
      'Showcase of student projects from Q1 2025 cohort. Students present their portfolio projects to recruiters and peers.',
      'demo_day',
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '30 days' + INTERVAL '3 hours',
      'Virtual (Zoom)',
      NULL
    ),
    (
      event_workshop_id,
      'AI Agent Architecture Workshop',
      'Hands-on workshop on building production-ready multi-agent systems. Covers LangGraph, CrewAI, and deployment patterns.',
      'workshop',
      NOW() + INTERVAL '14 days',
      NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
      'Virtual (Zoom)',
      NULL
    ),
    (
      event_networking_id,
      'Recruiter Networking Session',
      'Networking event connecting students with tech recruiters. Learn about job opportunities and industry trends.',
      'networking',
      NOW() + INTERVAL '21 days',
      NOW() + INTERVAL '21 days' + INTERVAL '1 hour',
      'Virtual (Zoom)',
      NULL
    ),
    (
      event_q4_2024_id,
      'Q4 2024 Demo Day Recording',
      'Recording of the Q4 2024 Demo Day featuring student presentations.',
      'demo_day',
      NOW() - INTERVAL '60 days',
      NOW() - INTERVAL '60 days' + INTERVAL '3 hours',
      'Virtual (Zoom)',
      'https://example.com/recordings/q4-2024-demo-day'
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    event_type = EXCLUDED.event_type,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    location = EXCLUDED.location,
    recording_url = EXCLUDED.recording_url,
    updated_at = NOW();
END $$;

-- Note: To seed event_presentations and event_attendance, you can reference these IDs:
-- SELECT id FROM events WHERE id = deterministic_uuid('event:Q1 2025 Demo Day');
-- Or use the deterministic UUID function directly in your queries

COMMIT;
