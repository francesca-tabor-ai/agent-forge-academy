-- Seed events: demo days, workshops, networking events
-- This creates sample events with presentations and attendance

BEGIN;

-- Insert sample events
INSERT INTO events (title, description, event_type, start_time, end_time, location, recording_url)
VALUES
  (
    'Q1 2025 Demo Day',
    'Showcase of student projects from Q1 2025 cohort. Students present their portfolio projects to recruiters and peers.',
    'demo_day',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '30 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'AI Agent Architecture Workshop',
    'Hands-on workshop on building production-ready multi-agent systems. Covers LangGraph, CrewAI, and deployment patterns.',
    'workshop',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'Recruiter Networking Session',
    'Networking event connecting students with tech recruiters. Learn about job opportunities and industry trends.',
    'networking',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '1 hour',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'Q4 2024 Demo Day Recording',
    'Recording of the Q4 2024 Demo Day featuring student presentations.',
    'demo_day',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    'https://example.com/recordings/q4-2024-demo-day'
  )
ON CONFLICT DO NOTHING;

-- Note: event_presentations and event_attendance require actual profile IDs
-- These would be populated when:
-- 1. Students enroll and create profiles
-- 2. Students submit projects for demo day
-- 3. Users RSVP to events
--
-- Example queries to add presentations (run after students exist):
-- INSERT INTO event_presentations (event_id, student_profile_id, portfolio_project_id, presentation_title, presentation_order)
-- SELECT 
--   (SELECT id FROM events WHERE title = 'Q1 2025 Demo Day' LIMIT 1),
--   sp.id,
--   pp.id,
--   pp.title,
--   ROW_NUMBER() OVER (ORDER BY pp.created_at)
-- FROM student_profiles sp
-- JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
-- WHERE pp.visibility IN ('public', 'recruiters_only')
-- LIMIT 10;
--
-- Example queries to add attendance (run after profiles exist):
-- INSERT INTO event_attendance (event_id, profile_id, rsvp_status)
-- SELECT 
--   e.id,
--   p.id,
--   'confirmed'
-- FROM events e
-- CROSS JOIN profiles p
-- WHERE e.start_time > NOW()
-- LIMIT 20;

COMMIT;
