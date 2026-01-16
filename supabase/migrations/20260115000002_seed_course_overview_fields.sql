-- Seed course overview fields for example courses
-- Populates outcome, youll_build, best_for, and category for at least 3 courses

-- Example Course 1: AI-Native Software Delivery Pipelines
UPDATE courses
SET
  outcome = ARRAY[
    'Ship AI features safely, repeatedly, and measurably',
    'Implement eval gates and quality checks in CI/CD',
    'Manage prompt versions and model routing effectively'
  ],
  youll_build = ARRAY[
    'A CI/CD pipeline with eval gates',
    'Prompt/version control system',
    'Model routing and rollout strategy',
    'Automated quality checks for AI features'
  ],
  best_for = ARRAY[
    'Engineers and tech leads',
    'Teams owning reliability and release velocity',
    'Organizations shipping AI features to production'
  ],
  category = 'Vibe Engineering'
WHERE slug = 'ai-native-software-delivery-pipelines';

-- Example Course 2: Spec Driven Development
UPDATE courses
SET
  outcome = ARRAY[
    'Turn vague ideas into executable specs',
    'Create specs that agents and humans can deliver',
    'Reduce misunderstandings and speed up iteration'
  ],
  youll_build = ARRAY[
    'A spec template for requirements',
    'Workflow from requirements to acceptance tests',
    'Task breakdown and implementation plan',
    'Spec-driven development process'
  ],
  best_for = ARRAY[
    'PMs, engineers, and founders',
    'Teams wanting fewer misunderstandings',
    'Organizations needing faster iteration cycles'
  ],
  category = 'Vibe Engineering'
WHERE slug = 'spec-driven-development';

-- Example Course 3: Prompt Engineering
UPDATE courses
SET
  outcome = ARRAY[
    'Write prompts that are reliable and testable',
    'Create reusable prompt patterns',
    'Implement failure-mode checks for prompts'
  ],
  youll_build = ARRAY[
    'A prompt library with patterns',
    'Role/task/context/output templates',
    'Test cases for prompt validation',
    'Failure-mode detection system'
  ],
  best_for = ARRAY[
    'Anyone shipping LLM features',
    'Developers working with AI models',
    'Teams building production AI applications'
  ],
  category = 'Agentic Systems'
WHERE slug = 'prompt-engineering';

-- Note: These updates will only affect courses that exist in the database
-- Courses are typically synced from metadata files, so these serve as examples
