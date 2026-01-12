import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';
import { getTopJobMatches, formatJobMatchesForLLM } from '@/lib/jobs/advisor-tools';
import { retrieveChunks, formatChunksForContext } from '@/lib/rag/retrieve';

/**
 * POST /api/realtime/tool
 * 
 * Executes tool calls requested by the OpenAI Realtime model.
 * Tools are executed on the backend and results are returned to be sent back to the model.
 * 
 * Security:
 * - Requires user authentication
 * - Validates tool names and parameters
 * - Returns only safe, formatted results
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { toolName, parameters, studentProfileId } = body;

    if (!toolName || !parameters) {
      return NextResponse.json(
        { error: 'toolName and parameters are required' },
        { status: 400 }
      );
    }

    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required' },
        { status: 400 }
      );
    }

    let result: any;

    // Execute tool based on tool name
    switch (toolName) {
      case 'getLesson': {
        const { courseSlug, lessonSlug } = parameters;
        if (!courseSlug || !lessonSlug) {
          return NextResponse.json(
            { error: 'courseSlug and lessonSlug are required for getLesson' },
            { status: 400 }
          );
        }

        // Use RAG to retrieve lesson content
        try {
          const query = `lesson ${lessonSlug} in ${courseSlug}`;
          const chunks = await retrieveChunks(query, {
            limit: 5,
            courseSlug,
            minScore: 0.5,
          });

          if (chunks.length > 0) {
            const formattedContent = formatChunksForContext(chunks);
            result = {
              success: true,
              content: formattedContent,
              chunks: chunks.map((c) => ({
                courseSlug: c.courseSlug,
                lessonSlug: c.lessonSlug,
                chunkIndex: c.chunkIndex,
              })),
            };
          } else {
            result = {
              success: false,
              error: `Lesson "${lessonSlug}" not found in course "${courseSlug}"`,
            };
          }
        } catch (error) {
          safeLogger.error('Error in getLesson tool', error);
          result = {
            success: false,
            error: 'Failed to retrieve lesson content',
          };
        }
        break;
      }

      case 'getProject': {
        const { projectId } = parameters;
        if (!projectId) {
          return NextResponse.json(
            { error: 'projectId is required for getProject' },
            { status: 400 }
          );
        }

        // Fetch project from database
        try {
          const { data: project, error: projectError } = await supabase
            .from('portfolio_projects')
            .select('*')
            .eq('id', projectId)
            .eq('student_profile_id', studentProfileId)
            .single();

          if (projectError || !project) {
            result = {
              success: false,
              error: 'Project not found',
            };
          } else {
            result = {
              success: true,
              project: {
                id: project.id,
                title: project.title,
                description: project.description,
                techStack: project.tech_stack || [],
                githubUrl: project.github_url,
                demoUrl: project.demo_url,
                visibility: project.visibility,
              },
            };
          }
        } catch (error) {
          safeLogger.error('Error in getProject tool', error);
          result = {
            success: false,
            error: 'Failed to retrieve project',
          };
        }
        break;
      }

      case 'getJobMatch': {
        const { jobId, limit = 5 } = parameters;
        if (!jobId) {
          return NextResponse.json(
            { error: 'jobId is required for getJobMatch' },
            { status: 400 }
          );
        }

        // Get job matches
        try {
          const matches = await getTopJobMatches(supabase, studentProfileId, limit);
          
          // Find the specific job if jobId is provided
          const specificJob = matches.find((m) => m.id === jobId);
          
          if (specificJob) {
            result = {
              success: true,
              job: {
                id: specificJob.id,
                title: specificJob.title,
                company: specificJob.company,
                matchingScore: specificJob.matchingScore,
                status: specificJob.status,
                skills: specificJob.skills,
                skillsMissing: specificJob.skillsMissing,
                explanation: specificJob.explanation,
              },
              formatted: formatJobMatchesForLLM([specificJob]),
            };
          } else {
            // Return top matches if specific job not found
            result = {
              success: true,
              matches: matches.slice(0, limit),
              formatted: formatJobMatchesForLLM(matches.slice(0, limit)),
            };
          }
        } catch (error) {
          safeLogger.error('Error in getJobMatch tool', error);
          result = {
            success: false,
            error: 'Failed to retrieve job matches',
          };
        }
        break;
      }

      case 'searchLessons': {
        const { query, courseSlug } = parameters;
        if (!query) {
          return NextResponse.json(
            { error: 'query is required for searchLessons' },
            { status: 400 }
          );
        }

        // Use RAG to search lessons
        try {
          const chunks = await retrieveChunks(query, {
            limit: 5,
            courseSlug: courseSlug || undefined,
            minScore: 0.5,
          });

          if (chunks.length > 0) {
            const formattedContent = formatChunksForContext(chunks);
            result = {
              success: true,
              content: formattedContent,
              chunks: chunks.map((c) => ({
                courseSlug: c.courseSlug,
                lessonSlug: c.lessonSlug,
                chunkIndex: c.chunkIndex,
                score: c.score,
              })),
            };
          } else {
            result = {
              success: false,
              error: `No lessons found matching "${query}"`,
            };
          }
        } catch (error) {
          safeLogger.error('Error in searchLessons tool', error);
          result = {
            success: false,
            error: 'Failed to search lessons',
          };
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown tool: ${toolName}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      toolName,
      result,
    });
  } catch (error) {
    safeLogger.error('Error executing tool', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute tool' },
      { status: 500 }
    );
  }
}
