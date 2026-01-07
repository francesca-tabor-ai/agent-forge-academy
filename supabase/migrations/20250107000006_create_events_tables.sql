-- Create events, event_presentations, and event_attendance tables
-- Keep schema simple and extensible

-- Create event type enum
CREATE TYPE event_type AS ENUM ('demo_day', 'workshop', 'networking', 'other');

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type event_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event_presentations table
-- Links students to projects they're presenting
CREATE TABLE event_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  portfolio_project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  presentation_title VARCHAR(255),
  presentation_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event_attendance table
-- Tracks attendance for recruiters, students, tutors
CREATE TABLE event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rsvp_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- Create indexes for common queries
CREATE INDEX idx_events_start_time ON events(start_time DESC);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_event_presentations_event_id ON event_presentations(event_id);
CREATE INDEX idx_event_presentations_student_profile_id ON event_presentations(student_profile_id);
CREATE INDEX idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX idx_event_attendance_profile_id ON event_attendance(profile_id);
CREATE INDEX idx_event_attendance_rsvp_status ON event_attendance(rsvp_status);

-- Create triggers to update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_presentations_updated_at
  BEFORE UPDATE ON event_presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON event_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

