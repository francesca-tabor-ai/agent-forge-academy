-- Seed events: demo days, workshops, networking events
-- No dependencies - can be seeded independently
-- Uses hardcoded UUIDs for easy reference and consistency

BEGIN;

-- Insert sample events with hardcoded deterministic UUIDs
-- These UUIDs are stable and can be referenced in other seed scripts
INSERT INTO events (id, title, description, event_type, start_time, end_time, location, recording_url)
VALUES
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid,
    'Q1 2025 Demo Day',
    'Showcase of student projects from Q1 2025 cohort. Students present their portfolio projects to recruiters and peers.',
    'demo_day',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '30 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid,
    'AI Agent Architecture Workshop',
    'Hands-on workshop on building production-ready multi-agent systems. Covers LangGraph, CrewAI, and deployment patterns.',
    'workshop',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid,
    'Recruiter Networking Session',
    'Networking event connecting students with tech recruiters. Learn about job opportunities and industry trends.',
    'networking',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '1 hour',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid,
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

-- Note: To seed event_presentations and event_attendance, reference these IDs:
-- Q1 2025 Demo Day: 'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid
-- AI Agent Architecture Workshop: 'b1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid
-- Recruiter Networking Session: 'b1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid
-- Q4 2024 Demo Day Recording: 'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid

COMMIT;
