-- Seed advisor_conversations: conversation history for students
-- NOTE: This table requires existing student_profiles from auth.users
-- This script provides example queries that can be run AFTER users have signed up
-- Uses hardcoded UUIDs to reference parent records (courses, jobs, etc.)
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from other seed scripts:
-- Courses: Use 'a1b2c3d4-e5f6-4789-a012-3456789abc01' through 'a1b2c3d4-e5f6-4789-a012-3456789abc14'
-- Jobs: Use 'c1b2c3d4-e5f6-4789-a012-3456789abc01' through 'c1b2c3d4-e5f6-4789-a012-3456789abc06'
-- Portfolio projects: Created dynamically per student_profile_id

-- Dependencies:
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - courses (seeded in 02_seed_content.sql)
-- - jobs (seeded in 04_seed_jobs_offers.sql)
-- - portfolio_projects (depends on student_profiles)

-- Example: Seed advisor_conversations for students
-- Creates realistic conversation examples with various contexts
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUIDs
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  course_agentic_rag UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid;
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_ai_visibility UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc0c'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  -- Reference job UUIDs
  job_ai_engineer UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  job_fullstack UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  job_ai_visibility UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  
  student_record RECORD;
  project_id_var UUID;
  conv_id_var UUID;
  message_counter INTEGER;
  base_time TIMESTAMPTZ;
  student_index INTEGER := 0;
BEGIN
  -- Loop through student profiles and create conversation examples
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    ORDER BY sp.created_at
    LIMIT 10
  LOOP
    student_index := student_index + 1;
    
    -- Get a random portfolio project for this student (if any exist)
    SELECT pp.id INTO project_id_var
    FROM portfolio_projects pp
    WHERE pp.student_profile_id = student_record.student_profile_id
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Scenario 1: Course-related conversation (Multi-Agent Systems)
    IF (student_index % 5 = 1) THEN
      -- Generate a conversation ID for this conversation
      conv_id_var := gen_random_uuid();
      base_time := NOW() - INTERVAL '7 days' + (RANDOM() * INTERVAL '6 days');
      message_counter := 0;
      -- User message
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_multi_agent,
        NULL,
        NULL,
        'user',
        'I''m having trouble understanding how to set up the LangGraph state machine. Can you help me?',
        jsonb_build_object(
          'intent', 'course_help',
          'intentConfidence', 0.95,
          'quick_action', 'explain_concept'
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_multi_agent,
        NULL,
        NULL,
        'assistant',
        'I''d be happy to help! LangGraph state machines are a powerful way to manage agent workflows. The key components are: 1) State schema definition, 2) Node functions that transform state, 3) Edges that define transitions. Would you like me to walk through a specific example from the course?',
        jsonb_build_object(
          'intent', 'course_help',
          'next_actions', jsonb_build_array('show_example', 'explain_detail')
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- User follow-up
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_multi_agent,
        NULL,
        NULL,
        'user',
        'Yes, please show me an example from Module 3',
        jsonb_build_object(
          'intent', 'course_help',
          'intentConfidence', 0.90
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response with example
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_multi_agent,
        NULL,
        NULL,
        'assistant',
        'Here''s a simple example from Module 3: ```python\nfrom langgraph.graph import StateGraph\n\n# Define state\nclass AgentState(TypedDict):\n    messages: list\n    step: int\n\n# Create graph\ngraph = StateGraph(AgentState)\ngraph.add_node("agent", agent_node)\ngraph.add_edge("agent", END)\n```\nThis creates a basic graph where the agent processes messages. Want to see how to add conditional edges?',
        jsonb_build_object(
          'intent', 'course_help',
          'code_example', true
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
    
    -- Scenario 2: Job-related conversation
    ELSIF (student_index % 5 = 2) THEN
      -- Generate a conversation ID for this conversation
      conv_id_var := gen_random_uuid();
      base_time := NOW() - INTERVAL '3 days' + (RANDOM() * INTERVAL '2 days');
      message_counter := 0;
      
      -- User message about job
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        NULL,
        job_ai_engineer,
        'user',
        'I''m interested in this AI Engineer position. What skills should I focus on to be competitive?',
        jsonb_build_object(
          'intent', 'job_advice',
          'intentConfidence', 0.92,
          'quick_action', 'analyze_job'
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        NULL,
        job_ai_engineer,
        'assistant',
        'Based on the job requirements, you should focus on: 1) Multi-agent systems (LangGraph, CrewAI), 2) Kubernetes deployment, 3) Production AI infrastructure. I notice you''re enrolled in the Multi-Agent Systems course - that''s perfect! Would you like me to create a learning plan to bridge any skill gaps?',
        jsonb_build_object(
          'intent', 'job_advice',
          'next_actions', jsonb_build_array('create_learning_plan', 'analyze_skills')
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
    
    -- Scenario 3: Project-related conversation
    ELSIF project_id_var IS NOT NULL AND (student_index % 5 = 3) THEN
      -- Generate a conversation ID for this conversation
      conv_id_var := gen_random_uuid();
      base_time := NOW() - INTERVAL '1 day' + (RANDOM() * INTERVAL '1 day');
      message_counter := 0;
      
      -- User message about project
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        project_id_var,
        NULL,
        'user',
        'I want to improve my portfolio project. What would make it stand out to recruiters?',
        jsonb_build_object(
          'intent', 'project_advice',
          'intentConfidence', 0.88,
          'quick_action', 'review_project'
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        project_id_var,
        NULL,
        'assistant',
        'Great question! To make your project stand out: 1) Add clear documentation and README, 2) Include metrics/results (e.g., "Improved accuracy by 15%"), 3) Show production considerations (deployment, monitoring), 4) Link to live demo. Would you like me to review your current project description and suggest improvements?',
        jsonb_build_object(
          'intent', 'project_advice',
          'next_actions', jsonb_build_array('review_project', 'suggest_improvements')
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
    
    -- Scenario 4: General question
    ELSIF (student_index % 5 = 4) THEN
      -- Generate a conversation ID for this conversation
      conv_id_var := gen_random_uuid();
      base_time := NOW() - INTERVAL '2 hours';
      message_counter := 0;
      
      -- User general question
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        NULL,
        NULL,
        'user',
        'What courses would you recommend for someone new to AI?',
        jsonb_build_object(
          'intent', 'general_question',
          'intentConfidence', 0.85
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        NULL,
        NULL,
        NULL,
        'assistant',
        'For beginners, I''d recommend starting with: 1) Prompt Engineering (foundations), 2) Vibe Coding with Cursor & Supabase (hands-on practice), 3) Spec Driven Development (structured approach). These courses build practical skills you can apply immediately. Would you like me to create a personalized learning path?',
        jsonb_build_object(
          'intent', 'general_question',
          'next_actions', jsonb_build_array('create_learning_path', 'show_courses')
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
    
    -- Scenario 5: Course + Project context conversation
    ELSIF project_id_var IS NOT NULL AND (student_index % 5 = 0) THEN
      -- Generate a conversation ID for this conversation
      conv_id_var := gen_random_uuid();
      base_time := NOW() - INTERVAL '30 minutes';
      message_counter := 0;
      
      -- User message with both course and project context
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_agentic_rag,
        project_id_var,
        NULL,
        'user',
        'I''m working on my RAG project and stuck on implementing adaptive retrieval. Can you help me apply what I learned in the Agentic RAG course?',
        jsonb_build_object(
          'intent', 'course_help',
          'intentConfidence', 0.93,
          'context', 'project_and_course'
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
      
      message_counter := message_counter + 1;
      
      -- Assistant response
      INSERT INTO advisor_conversations (
        student_profile_id,
        conversation_id,
        active_course_id,
        active_project_id,
        active_job_id,
        role,
        content,
        metadata,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        conv_id_var,
        course_agentic_rag,
        project_id_var,
        NULL,
        'assistant',
        'Perfect! Adaptive retrieval is covered in Module 4 of the Agentic RAG course. The key is to use a router that decides between dense retrieval, keyword search, or hybrid based on query complexity. I can help you implement this for your project. What specific part are you stuck on - the routing logic or the retrieval implementation?',
        jsonb_build_object(
          'intent', 'course_help',
          'next_actions', jsonb_build_array('show_code_example', 'explain_concept')
        ),
        base_time + (message_counter * INTERVAL '5 minutes')
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Seeded advisor_conversations for students';
END $$;
*/

-- Alternative: Simple seed with basic conversations
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUID
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  student_record RECORD;
  conv_id_var UUID;
BEGIN
  -- Create simple conversations for first 5 students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    ORDER BY sp.created_at
    LIMIT 5
  LOOP
    conv_id_var := gen_random_uuid();
    
    -- User message
    INSERT INTO advisor_conversations (
      student_profile_id,
      conversation_id,
      active_course_id,
      role,
      content,
      metadata
    )
    VALUES (
      student_record.student_profile_id,
      conv_id_var,
      course_multi_agent,
      'user',
      'Hello! I need help with my course.',
      jsonb_build_object('intent', 'general_question')
    );
    
    -- Assistant response
    INSERT INTO advisor_conversations (
      student_profile_id,
      conversation_id,
      active_course_id,
      role,
      content,
      metadata
    )
    VALUES (
      student_record.student_profile_id,
      conv_id_var,
      course_multi_agent,
      'assistant',
      'I''d be happy to help! What specific topic are you working on?',
      jsonb_build_object('intent', 'general_question')
    );
  END LOOP;
END $$;
*/

COMMIT;
