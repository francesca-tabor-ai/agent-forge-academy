-- Update skills structure to support ranked/top skills
-- Migrate existing string array to object array with ordering and top skills

-- First, migrate existing data if needed
-- Convert simple string arrays to object arrays
DO $$
DECLARE
  profile_record RECORD;
  skills_array JSONB;
  skills_objects JSONB := '[]'::jsonb;
  skill_item TEXT;
  skill_index INTEGER := 0;
BEGIN
  FOR profile_record IN 
    SELECT id, skills 
    FROM student_profiles 
    WHERE skills IS NOT NULL 
    AND jsonb_typeof(skills) = 'array'
    AND jsonb_array_length(skills) > 0
    AND jsonb_typeof(skills->0) = 'string'  -- Only migrate if it's still string array
  LOOP
    skills_objects := '[]'::jsonb;
    skill_index := 0;
    
    -- Convert each string to object
    FOR skill_item IN 
      SELECT jsonb_array_elements_text(profile_record.skills)
    LOOP
      skills_objects := skills_objects || jsonb_build_object(
        'name', skill_item,
        'isTopSkill', false,
        'order', skill_index
      );
      skill_index := skill_index + 1;
    END LOOP;
    
    -- Update the record
    UPDATE student_profiles
    SET skills = skills_objects
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.skills IS 'Array of skill objects: {name: string, isTopSkill: boolean, order: number}. Order determines display order. Top skills are shown first.';
