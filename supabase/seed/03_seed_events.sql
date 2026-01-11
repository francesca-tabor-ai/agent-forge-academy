-- Seed events: demo days, workshops, networking events
-- No dependencies - can be seeded independently
-- Uses hardcoded UUIDs for easy reference and consistency
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Insert sample events with hardcoded deterministic UUIDs
-- These UUIDs are stable and can be referenced in other seed scripts
INSERT INTO events (id, title, description, event_type, start_time, end_time, location, recording_url)
VALUES
  -- Future Demo Days
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
    'b1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid,
    'Q2 2025 Demo Day',
    'Showcase of student projects from Q2 2025 cohort. Students present their portfolio projects to recruiters and peers.',
    'demo_day',
    NOW() + INTERVAL '120 days',
    NOW() + INTERVAL '120 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    NULL
  ),
  -- Past Demo Days
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid,
    'Q4 2024 Demo Day Recording',
    'Recording of the Q4 2024 Demo Day featuring student presentations.',
    'demo_day',
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '60 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    'https://example.com/recordings/q4-2024-demo-day'
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid,
    'Q3 2024 Demo Day Recording',
    'Recording of the Q3 2024 Demo Day featuring student presentations.',
    'demo_day',
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '90 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    'https://example.com/recordings/q3-2024-demo-day'
  ),
  -- Future Workshops
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
    'b1b2c3d4-e5f6-4789-a012-3456789abc07'::uuid,
    'LangChain & Vector Databases Workshop',
    'Learn how to build RAG applications with LangChain and vector databases. Covers embeddings, retrieval, and generation patterns.',
    'workshop',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '45 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc08'::uuid,
    'Supabase & Next.js Full-Stack Workshop',
    'Build a complete full-stack application with Supabase and Next.js. Covers authentication, database design, and real-time features.',
    'workshop',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '60 days' + INTERVAL '3 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc09'::uuid,
    'Resume & Portfolio Review Workshop',
    'Get feedback on your resume and portfolio from industry professionals. Learn how to showcase your projects effectively.',
    'workshop',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '1.5 hours',
    'Virtual (Zoom)',
    NULL
  ),
  -- Past Workshops
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc10'::uuid,
    'Python for AI Development Workshop',
    'Introduction to Python for AI development. Covers data structures, libraries, and best practices for AI projects.',
    'workshop',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    'https://example.com/recordings/python-ai-workshop'
  ),
  -- Future Networking Events
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
    'b1b2c3d4-e5f6-4789-a012-3456789abc11'::uuid,
    'Alumni Networking Mixer',
    'Connect with alumni who have successfully transitioned into tech careers. Share experiences and learn from their journeys.',
    'networking',
    NOW() + INTERVAL '75 days',
    NOW() + INTERVAL '75 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc12'::uuid,
    'Tech Industry Panel Discussion',
    'Panel discussion with industry experts on the future of AI and software development. Q&A session included.',
    'networking',
    NOW() + INTERVAL '90 days',
    NOW() + INTERVAL '90 days' + INTERVAL '1.5 hours',
    'Virtual (Zoom)',
    NULL
  ),
  -- Past Networking Events
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc13'::uuid,
    'Holiday Networking Social',
    'End-of-year networking event for students, alumni, and recruiters. Casual atmosphere for building connections.',
    'networking',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '45 days' + INTERVAL '2 hours',
    'Virtual (Zoom)',
    NULL
  ),
  -- Other Events
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc14'::uuid,
    'Platform Launch Celebration',
    'Celebrate the launch of our new learning platform. Learn about new features and how to make the most of your learning journey.',
    'other',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '1 hour',
    'Virtual (Zoom)',
    NULL
  ),
  (
    'b1b2c3d4-e5f6-4789-a012-3456789abc15'::uuid,
    'Community Q&A Session',
    'Open Q&A session with the platform team. Ask questions about courses, features, or get help with technical issues.',
    'other',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '35 days' + INTERVAL '1 hour',
    'Virtual (Zoom)',
    NULL
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
-- Future Demo Days:
--   Q1 2025 Demo Day: 'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid
--   Q2 2025 Demo Day: 'b1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid
-- Past Demo Days:
--   Q4 2024 Demo Day: 'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid
--   Q3 2024 Demo Day: 'b1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid
-- Future Workshops:
--   AI Agent Architecture: 'b1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid
--   LangChain & Vector DBs: 'b1b2c3d4-e5f6-4789-a012-3456789abc07'::uuid
--   Supabase & Next.js: 'b1b2c3d4-e5f6-4789-a012-3456789abc08'::uuid
--   Resume & Portfolio Review: 'b1b2c3d4-e5f6-4789-a012-3456789abc09'::uuid
-- Past Workshops:
--   Python for AI: 'b1b2c3d4-e5f6-4789-a012-3456789abc10'::uuid
-- Future Networking:
--   Recruiter Networking: 'b1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid
--   Alumni Networking: 'b1b2c3d4-e5f6-4789-a012-3456789abc11'::uuid
--   Tech Industry Panel: 'b1b2c3d4-e5f6-4789-a012-3456789abc12'::uuid
-- Past Networking:
--   Holiday Networking: 'b1b2c3d4-e5f6-4789-a012-3456789abc13'::uuid
-- Other Events:
--   Platform Launch: 'b1b2c3d4-e5f6-4789-a012-3456789abc14'::uuid
--   Community Q&A: 'b1b2c3d4-e5f6-4789-a012-3456789abc15'::uuid

COMMIT;
