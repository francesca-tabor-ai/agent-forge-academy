-- Add Creative Automation & Templatization course to Essential Access tier
-- This migration is idempotent and can be run multiple times safely
--
-- Course to add:
-- creative-automation-templatization

BEGIN;

-- Ensure the course exists in the database
-- If it doesn't exist, create it (course sync may not have run yet)
INSERT INTO courses (slug, title, description, duration_weeks, difficulty_level, is_published)
VALUES (
  'creative-automation-templatization',
  'Creative Automation & Templatization',
  'Master creative automation and templatization to scale marketing creative production while maintaining brand consistency',
  12,
  'intermediate',
  true
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_weeks = EXCLUDED.duration_weeks,
  difficulty_level = EXCLUDED.difficulty_level,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

-- Map Creative Automation & Templatization course to Essential Access tier
INSERT INTO subscription_tier_courses (tier, course_id)
SELECT 
  'essential'::subscription_tier,
  c.id
FROM courses c
WHERE c.slug = 'creative-automation-templatization'
ON CONFLICT (tier, course_id) DO NOTHING;

-- Verification: Report what was inserted (for logging/debugging)
DO $$
DECLARE
    v_course_exists BOOLEAN;
    v_course_mapped BOOLEAN;
    v_course_record RECORD;
BEGIN
    -- Check if course exists
    SELECT EXISTS (
        SELECT 1 FROM courses
        WHERE slug = 'creative-automation-templatization'
    ) INTO v_course_exists;
    
    -- Check if course is mapped to essential tier
    SELECT EXISTS (
        SELECT 1
        FROM subscription_tier_courses stc
        JOIN courses c ON c.id = stc.course_id
        WHERE stc.tier = 'essential'::subscription_tier
        AND c.slug = 'creative-automation-templatization'
    ) INTO v_course_mapped;
    
    -- Log results
    IF v_course_exists THEN
        RAISE NOTICE 'Course "creative-automation-templatization" exists in database';
        
        -- Get course details
        SELECT c.slug, c.title, c.is_published
        INTO v_course_record
        FROM courses c
        WHERE c.slug = 'creative-automation-templatization';
        
        RAISE NOTICE '  Title: %', v_course_record.title;
        RAISE NOTICE '  Published: %', v_course_record.is_published;
        
        IF v_course_mapped THEN
            RAISE NOTICE 'Course is mapped to Essential Access tier';
        ELSE
            RAISE WARNING 'Course exists but is NOT mapped to Essential Access tier';
        END IF;
    ELSE
        RAISE WARNING 'Course "creative-automation-templatization" does not exist in database';
    END IF;
END $$;

COMMIT;
