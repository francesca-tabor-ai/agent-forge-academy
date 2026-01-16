/**
 * Tool Run Logger
 * 
 * Logs tool executions for analytics and portfolio artifact generation.
 * Currently a stub that logs to console. Will be replaced with Supabase API call.
 * 
 * Usage:
 * ```ts
 * await logToolRun({
 *   toolId: 'gtm-system-designer',
 *   studentProfileId: '...',
 *   inputs: { ... },
 *   outputs: { ... }
 * });
 * ```
 */

export interface ToolRunInput {
  toolId: string;
  studentProfileId: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
}

/**
 * Log a tool run to the database
 * 
 * Currently a stub that logs to console. In production, this will:
 * 1. POST to /api/tools/runs endpoint
 * 2. Store in tool_runs table
 * 3. Trigger portfolio artifact generation if applicable
 * 
 * @param run - Tool run data
 */
export async function logToolRun(run: ToolRunInput): Promise<void> {
  // Stub implementation - logs to console
  console.log('[Tool Run]', {
    toolId: run.toolId,
    studentProfileId: run.studentProfileId,
    inputs: run.inputs,
    outputs: run.outputs,
    timestamp: new Date().toISOString(),
  });

  // TODO: Replace with actual API call when ready
  // try {
  //   const response = await fetch('/api/tools/runs', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(run),
  //   });
  //   
  //   if (!response.ok) {
  //     throw new Error(`Failed to log tool run: ${response.statusText}`);
  //   }
  // } catch (error) {
  //   console.error('[Tool Run] Failed to log:', error);
  //   // Don't throw - tool execution should continue even if logging fails
  // }
}

/**
 * Log a tool run with error handling
 * 
 * Wrapper that ensures logging failures don't break tool execution
 */
export async function logToolRunSafe(run: ToolRunInput): Promise<void> {
  try {
    await logToolRun(run);
  } catch (error) {
    console.error('[Tool Run] Logging failed (non-blocking):', error);
    // Silently fail - don't interrupt tool execution
  }
}
