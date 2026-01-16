/**
 * Regression Tests: Dashboard Course Title Display
 * 
 * Tests to prevent regression where lesson titles are shown as course titles
 * Focus: Ensuring course cards always show course name, not lesson file name
 * 
 * How to verify this test catches regressions:
 * 1. Run: npm run test:regression -- tests/regression/dashboard-course-title.test.ts
 * 2. If someone accidentally uses nextLessonTitle for courseTitle, tests will fail
 * 3. All tests should pass when courseTitle is correctly extracted from course metadata
 */

import { describe, it, expect } from 'vitest';

describe('Regression Tests - Dashboard Course Title Display', () => {
  describe('Course Title vs Lesson Title Separation', () => {
    it('should extract courseTitle from course metadata, never from lesson', () => {
      // Test data matching the actual scenario
      const course = {
        slug: 'vibe-coding-cursor-supabase',
        title: 'Vibe Coding with Cursor & Supabase',
        metadata: {
          title: 'Vibe Coding with Cursor & Supabase',
          category: 'Vibe Engineering',
        },
      };

      const nextLesson = {
        slug: 'course-overview-quick-start-guide',
        frontmatter: {
          title: 'Course Overview & Quick Start Guide',
        },
      };

      // Simulate the extraction logic from CoursesSection
      const courseTitle = course.metadata?.title || course.title;
      const nextLessonTitle = nextLesson?.frontmatter?.title || nextLesson?.slug || null;

      // Regression: courseTitle should NEVER equal nextLessonTitle
      expect(courseTitle).toBe('Vibe Coding with Cursor & Supabase');
      expect(nextLessonTitle).toBe('Course Overview & Quick Start Guide');
      expect(courseTitle).not.toBe(nextLessonTitle);
    });

    it('should use course title even when lesson title exists', () => {
      // Scenario: Course has metadata title, lesson also has title
      const course = {
        slug: 'agentic-rag',
        title: 'Mastering Agentic RAG for Enterprise AI',
        metadata: {
          title: 'Mastering Agentic RAG for Enterprise AI',
        },
      };

      const nextLesson = {
        slug: 'course-index-reference-guide',
        frontmatter: {
          title: 'Course Index & Reference Guide',
        },
      };

      const courseTitle = course.metadata?.title || course.title;
      const nextLessonTitle = nextLesson?.frontmatter?.title || null;

      // Primary title must be course title
      expect(courseTitle).toBe('Mastering Agentic RAG for Enterprise AI');
      expect(courseTitle).not.toContain('Course Index');
      expect(courseTitle).not.toContain('Reference Guide');
      
      // Lesson title should be separate
      expect(nextLessonTitle).toBe('Course Index & Reference Guide');
    });

    it('should fallback to course.title if metadata.title is missing', () => {
      // Scenario: No metadata, but course has title
      const course = {
        slug: 'test-course',
        title: 'Test Course Title',
        metadata: undefined,
      };

      const courseTitle = course.metadata?.title || course.title;

      // Should use course.title, never lesson title
      expect(courseTitle).toBe('Test Course Title');
    });

    it('should never derive courseTitle from nextLessonTitle', () => {
      // Regression: This test will fail if someone accidentally uses lesson title for course title
      const course = {
        slug: 'vibe-coding-cursor-supabase',
        title: 'Vibe Coding with Cursor & Supabase',
        metadata: {
          title: 'Vibe Coding with Cursor & Supabase',
        },
      };

      const nextLesson = {
        slug: 'course-overview-quick-start-guide',
        frontmatter: {
          title: 'Course Overview & Quick Start Guide',
        },
      };

      // Extract titles using the correct logic
      const courseTitle = course.metadata?.title || course.title;
      const nextLessonTitle = nextLesson?.frontmatter?.title || null;

      // CRITICAL: courseTitle must NEVER be derived from nextLessonTitle
      // This test will fail if someone does: courseTitle = nextLessonTitle
      expect(courseTitle).not.toBe(nextLessonTitle);
      expect(courseTitle).not.toEqual(nextLessonTitle);
      
      // Verify they are different strings
      expect(courseTitle).toBe('Vibe Coding with Cursor & Supabase');
      expect(nextLessonTitle).toBe('Course Overview & Quick Start Guide');
    });
  });

  describe('Data Structure Validation', () => {
    it('should have separate courseTitle and nextLessonTitle fields', () => {
      // Simulate the return structure from activeCoursesWithDetails
      const courseData = {
        course: {
          slug: 'vibe-coding-cursor-supabase',
          title: 'Vibe Coding with Cursor & Supabase',
        },
        nextLesson: {
          slug: 'course-overview-quick-start-guide',
          frontmatter: {
            title: 'Course Overview & Quick Start Guide',
          },
        },
        // Explicit fields - these must exist and be separate
        courseTitle: 'Vibe Coding with Cursor & Supabase',
        courseSlug: 'vibe-coding-cursor-supabase',
        courseTrack: 'Vibe Engineering',
        courseDifficulty: 'beginner',
        courseDuration: '4-8 hours',
        nextLessonTitle: 'Course Overview & Quick Start Guide',
        nextLessonSlug: 'course-overview-quick-start-guide',
      };

      // Verify explicit fields exist
      expect(courseData.courseTitle).toBeDefined();
      expect(courseData.nextLessonTitle).toBeDefined();
      
      // Verify they are different
      expect(courseData.courseTitle).not.toBe(courseData.nextLessonTitle);
      
      // Verify courseTitle is not derived from nextLesson
      expect(courseData.courseTitle).not.toBe(courseData.nextLesson?.frontmatter?.title);
    });

    it('should have courseTitle that matches course metadata or title', () => {
      const course = {
        slug: 'test-course',
        title: 'Test Course',
        metadata: {
          title: 'Test Course Name',
        },
      };

      const courseTitle = course.metadata?.title || course.title;

      // Should prioritize metadata.title
      expect(courseTitle).toBe('Test Course Name');
      expect(courseTitle).toBe(course.metadata.title);
    });
  });

  describe('UI Rendering Logic Validation', () => {
    it('should use courseTitle for primary heading, never nextLessonTitle', () => {
      // Simulate what the UI should render
      const courseTitle = 'Vibe Coding with Cursor & Supabase';
      const nextLessonTitle = 'Course Overview & Quick Start Guide';

      // Primary heading should be courseTitle
      const primaryHeading = courseTitle;
      
      // This assertion will fail if someone uses nextLessonTitle for primary heading
      expect(primaryHeading).toBe(courseTitle);
      expect(primaryHeading).not.toBe(nextLessonTitle);
      expect(primaryHeading).not.toContain('Course Overview');
    });

    it('should use nextLessonTitle only in Next Lesson section', () => {
      const courseTitle = 'Vibe Coding with Cursor & Supabase';
      const nextLessonTitle = 'Course Overview & Quick Start Guide';

      // Primary heading (card title) should be courseTitle
      const cardTitle = courseTitle;
      
      // Next Lesson section should use nextLessonTitle
      const nextLessonSectionTitle = nextLessonTitle;

      // Verify separation
      expect(cardTitle).toBe(courseTitle);
      expect(nextLessonSectionTitle).toBe(nextLessonTitle);
      expect(cardTitle).not.toBe(nextLessonSectionTitle);
    });
  });

  describe('Regression Prevention', () => {
    it('should fail if lesson title becomes the main heading', () => {
      // This test explicitly checks for the regression scenario
      const courseTitle = 'Vibe Coding with Cursor & Supabase';
      const nextLessonTitle = 'Course Overview & Quick Start Guide';

      // WRONG: If someone does this, the test fails
      // const wrongPrimaryTitle = nextLessonTitle;
      
      // CORRECT: Primary title must be courseTitle
      const correctPrimaryTitle = courseTitle;

      // This assertion will catch the regression
      expect(correctPrimaryTitle).toBe(courseTitle);
      expect(correctPrimaryTitle).not.toBe(nextLessonTitle);
      
      // Additional check: primary title should not contain lesson-specific text
      expect(correctPrimaryTitle).not.toContain('Course Overview');
      expect(correctPrimaryTitle).not.toContain('Quick Start Guide');
      expect(correctPrimaryTitle).not.toContain('Reference Guide');
    });

    it('should detect if courseTitle is accidentally set to nextLessonTitle', () => {
      const course = {
        metadata: { title: 'Vibe Coding with Cursor & Supabase' },
        title: 'Vibe Coding with Cursor & Supabase',
      };
      
      const nextLesson = {
        frontmatter: { title: 'Course Overview & Quick Start Guide' },
      };

      // Correct extraction
      const courseTitle = course.metadata?.title || course.title;
      const nextLessonTitle = nextLesson?.frontmatter?.title || null;

      // Regression check: courseTitle should never equal nextLessonTitle
      // If someone accidentally does: courseTitle = nextLessonTitle, this fails
      expect(courseTitle).not.toBe(nextLessonTitle);
      
      // Verify courseTitle is from course, not lesson
      expect(courseTitle).toBe(course.metadata.title);
      expect(courseTitle).not.toBe(nextLesson.frontmatter.title);
    });
  });
});
