-- Seed event_attendance: RSVP and attendance records for events
-- NOTE: This table requires existing events and profiles from auth.users
-- This script provides example queries that can be run AFTER events and profiles exist
-- Uses hardcoded UUIDs to reference events from 03_seed_events.sql
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from 03_seed_events.sql:
-- Events: Use 'b1b2c3d4-e5f6-4789-a012-3456789abc01' through 'b1b2c3d4-e5f6-4789-a012-3456789abc04'
-- Example: Q1 2025 Demo Day = 'b1b2c3d4-e5f6-4789-a012-3456789abc01'

-- Dependencies:
-- - events (seeded in 03_seed_events.sql)
-- - profiles (depends on auth.users - cannot be seeded directly)
-- - event_attendance (depends on events + profiles)

-- IMPORTANT: There is a unique constraint on (event_id, profile_id).
-- Each profile can only have one attendance record per event.

-- Example: Seed event_attendance for events
-- Creates realistic RSVP and attendance records
-- Uncomment and modify when you have events and profiles:
/*
DO $$
DECLARE
  -- Reference event UUIDs
  event_demo_day_q1 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  event_workshop UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  event_networking UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  event_demo_day_q4 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  event_record RECORD;
  profile_record RECORD;
  rsvp_status_var VARCHAR(50);
  attended_var BOOLEAN;
  created_at_var TIMESTAMPTZ;
  attendance_counter INTEGER := 0;
BEGIN
  -- Loop through events and create attendance records
  FOR event_record IN 
    SELECT e.id as event_id, e.title, e.start_time, e.event_type
    FROM events e
    ORDER BY e.start_time
  LOOP
    -- For each event, create attendance from 5-15 profiles
    FOR profile_record IN 
      SELECT p.id as profile_id, p.role
      FROM profiles p
      ORDER BY RANDOM()
      LIMIT (5 + FLOOR(RANDOM() * 11)::INTEGER) -- 5-15 attendees per event
    LOOP
      -- Check if already has attendance record (respect unique constraint)
      IF NOT EXISTS (
        SELECT 1 FROM event_attendance ea
        WHERE ea.event_id = event_record.event_id
          AND ea.profile_id = profile_record.profile_id
      ) THEN
        created_at_var := event_record.start_time - INTERVAL '7 days' + (RANDOM() * INTERVAL '6 days');
        
        -- Determine RSVP status: 50% confirmed, 30% pending, 20% cancelled
        IF RANDOM() < 0.5 THEN
          rsvp_status_var := 'confirmed';
        ELSIF RANDOM() < 0.8 THEN
          rsvp_status_var := 'pending';
        ELSE
          rsvp_status_var := 'cancelled';
        END IF;
        
        -- Determine attendance:
        -- - If event is in the past and RSVP is confirmed: 80% chance of attended=true
        -- - If event is in the future: attended=false
        -- - If RSVP is cancelled: attended=false
        IF event_record.start_time < NOW() AND rsvp_status_var = 'confirmed' THEN
          attended_var := CASE WHEN RANDOM() < 0.8 THEN true ELSE false END;
        ELSIF rsvp_status_var = 'cancelled' THEN
          attended_var := false;
        ELSE
          attended_var := false; -- Future events haven't happened yet
        END IF;
        
        -- Insert attendance record
        INSERT INTO event_attendance (
          event_id,
          profile_id,
          rsvp_status,
          attended,
          created_at
        )
        VALUES (
          event_record.event_id,
          profile_record.profile_id,
          rsvp_status_var,
          attended_var,
          created_at_var
        );
        
        attendance_counter := attendance_counter + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Seeded % event attendance records', attendance_counter;
END $$;
*/

-- Alternative: Simple seed with basic attendance records
-- Uncomment and modify when you have events and profiles:
/*
DO $$
DECLARE
  event_record RECORD;
  profile_record RECORD;
  rsvp_status_var VARCHAR(50);
BEGIN
  -- Create attendance for future events only
  FOR event_record IN 
    SELECT e.id as event_id, e.start_time
    FROM events e
    WHERE e.start_time > NOW()
    ORDER BY e.start_time
  LOOP
    FOR profile_record IN 
      SELECT p.id as profile_id
      FROM profiles p
      ORDER BY RANDOM()
      LIMIT 10
    LOOP
      -- Check for existing record
      IF NOT EXISTS (
        SELECT 1 FROM event_attendance ea
        WHERE ea.event_id = event_record.event_id
          AND ea.profile_id = profile_record.profile_id
      ) THEN
        rsvp_status_var := CASE (FLOOR(RANDOM() * 3)::INTEGER)
          WHEN 0 THEN 'pending'
          WHEN 1 THEN 'confirmed'
          ELSE 'cancelled'
        END;
        
        INSERT INTO event_attendance (
          event_id,
          profile_id,
          rsvp_status,
          attended
        )
        VALUES (
          event_record.event_id,
          profile_record.profile_id,
          rsvp_status_var,
          false -- Future events haven't happened yet
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example: Seed attendance for past events (with actual attendance)
-- Creates attendance records for past events where some people actually attended
-- Uncomment and modify when you have events and profiles:
/*
DO $$
DECLARE
  event_record RECORD;
  profile_record RECORD;
  attended_var BOOLEAN;
BEGIN
  -- Create attendance for past events
  FOR event_record IN 
    SELECT e.id as event_id, e.start_time, e.title
    FROM events e
    WHERE e.start_time < NOW()
    ORDER BY e.start_time
  LOOP
    FOR profile_record IN 
      SELECT p.id as profile_id
      FROM profiles p
      ORDER BY RANDOM()
      LIMIT 15
    LOOP
      -- Check for existing record
      IF NOT EXISTS (
        SELECT 1 FROM event_attendance ea
        WHERE ea.event_id = event_record.event_id
          AND ea.profile_id = profile_record.profile_id
      ) THEN
        -- For past events, 70% confirmed, 20% pending, 10% cancelled
        -- Of confirmed, 80% actually attended
        IF RANDOM() < 0.7 THEN
          -- Confirmed
          attended_var := CASE WHEN RANDOM() < 0.8 THEN true ELSE false END;
          
          INSERT INTO event_attendance (
            event_id,
            profile_id,
            rsvp_status,
            attended,
            created_at
          )
          VALUES (
            event_record.event_id,
            profile_record.profile_id,
            'confirmed',
            attended_var,
            event_record.start_time - INTERVAL '7 days'
          );
        ELSIF RANDOM() < 0.9 THEN
          -- Pending
          INSERT INTO event_attendance (
            event_id,
            profile_id,
            rsvp_status,
            attended,
            created_at
          )
          VALUES (
            event_record.event_id,
            profile_record.profile_id,
            'pending',
            false,
            event_record.start_time - INTERVAL '3 days'
          );
        ELSE
          -- Cancelled
          INSERT INTO event_attendance (
            event_id,
            profile_id,
            rsvp_status,
            attended,
            created_at
          )
          VALUES (
            event_record.event_id,
            profile_record.profile_id,
            'cancelled',
            false,
            event_record.start_time - INTERVAL '5 days'
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example: Seed attendance for specific event types
-- Creates attendance with role-specific patterns
-- Uncomment and modify when you have events and profiles:
/*
DO $$
DECLARE
  event_record RECORD;
  profile_record RECORD;
  rsvp_status_var VARCHAR(50);
BEGIN
  -- Demo days: More students and recruiters
  FOR event_record IN 
    SELECT e.id as event_id, e.event_type
    FROM events e
    WHERE e.event_type = 'demo_day'
      AND e.start_time > NOW()
  LOOP
    -- Students (60% of attendees)
    FOR profile_record IN 
      SELECT p.id as profile_id
      FROM profiles p
      WHERE p.role = 'student'
      ORDER BY RANDOM()
      LIMIT 12
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM event_attendance ea
        WHERE ea.event_id = event_record.event_id
          AND ea.profile_id = profile_record.profile_id
      ) THEN
        rsvp_status_var := CASE WHEN RANDOM() < 0.7 THEN 'confirmed' ELSE 'pending' END;
        
        INSERT INTO event_attendance (
          event_id,
          profile_id,
          rsvp_status,
          attended
        )
        VALUES (
          event_record.event_id,
          profile_record.profile_id,
          rsvp_status_var,
          false
        );
      END IF;
    END LOOP;
    
    -- Recruiters (30% of attendees)
    FOR profile_record IN 
      SELECT p.id as profile_id
      FROM profiles p
      WHERE p.role = 'recruiter'
      ORDER BY RANDOM()
      LIMIT 6
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM event_attendance ea
        WHERE ea.event_id = event_record.event_id
          AND ea.profile_id = profile_record.profile_id
      ) THEN
        rsvp_status_var := CASE WHEN RANDOM() < 0.8 THEN 'confirmed' ELSE 'pending' END;
        
        INSERT INTO event_attendance (
          event_id,
          profile_id,
          rsvp_status,
          attended
        )
        VALUES (
          event_record.event_id,
          profile_record.profile_id,
          rsvp_status_var,
          false
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

COMMIT;
