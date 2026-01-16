-- Trigger to track offer unlocks when course is completed
-- This automatically tracks when a course completion unlocks an offer

CREATE OR REPLACE FUNCTION track_offer_unlock_on_course_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_tool_id UUID;
  v_offer_id UUID;
BEGIN
  -- Only trigger if course was just completed (completed_at was NULL and is now NOT NULL)
  -- OR progress_percentage reached 100
  IF (OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL) OR
     (OLD.progress_percentage < 100 AND NEW.progress_percentage >= 100) THEN
    
    -- Find offers that require this course completion
    FOR v_offer_id, v_tool_id IN
      SELECT to.id, to.tool_id
      FROM tool_offers to
      WHERE to.requires_course_completion = true
        AND to.required_course_id = NEW.course_id
        AND to.is_active = true
    LOOP
      -- Insert analytics event
      INSERT INTO tool_analytics_events (
        event_type,
        user_id,
        student_profile_id,
        tool_id,
        offer_id,
        course_id,
        metadata
      )
      SELECT
        'offer_unlock',
        p.user_id,
        NEW.student_profile_id,
        v_tool_id,
        v_offer_id,
        NEW.course_id,
        jsonb_build_object(
          'completed_at', NEW.completed_at,
          'progress_percentage', NEW.progress_percentage,
          'unlocked_at', NOW()
        )
      FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = NEW.student_profile_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on course_enrollments
DROP TRIGGER IF EXISTS track_offer_unlocks_trigger ON course_enrollments;
CREATE TRIGGER track_offer_unlocks_trigger
  AFTER UPDATE ON course_enrollments
  FOR EACH ROW
  WHEN (
    (OLD.completed_at IS NULL AND NEW.completed_at IS NOT NULL) OR
    (OLD.progress_percentage IS DISTINCT FROM NEW.progress_percentage AND NEW.progress_percentage >= 100)
  )
  EXECUTE FUNCTION track_offer_unlock_on_course_completion();

-- Comments for documentation
COMMENT ON FUNCTION track_offer_unlock_on_course_completion() IS 'Automatically tracks offer_unlock events when a course is completed and unlocks gated offers';
