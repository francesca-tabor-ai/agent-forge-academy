/**
 * Zod schema for AI Advisor chat request validation
 */

import { z } from 'zod';

/**
 * Schema for conversation history message
 */
const ConversationMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  role: z.enum(['user', 'assistant', 'human']),
  content: z.string().min(1, 'Message content is required'),
  timestamp: z.union([
    z.date(),
    z.string().datetime(), // ISO 8601 string
    z.string(), // Allow any string for flexibility
  ]).optional(),
});

/**
 * Schema for course context
 */
const CourseContextSchema = z.object({
  id: z.string().min(1, 'Course ID is required'),
  slug: z.string().min(1, 'Course slug is required'),
  title: z.string().min(1, 'Course title is required'),
}).strict(); // Reject additional properties

/**
 * Schema for project context
 */
const ProjectContextSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Project title is required'),
}).strict(); // Reject additional properties

/**
 * Schema for job context
 */
const JobContextSchema = z.object({
  id: z.string().min(1, 'Job ID is required'),
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
}).strict(); // Reject additional properties

/**
 * Schema for startup context
 */
const StartupContextSchema = z.object({
  id: z.string().min(1, 'Startup ID is required'),
  name: z.string().min(1, 'Startup name is required'),
}).strict(); // Reject additional properties

/**
 * Schema for context object
 */
const ContextSchema = z.object({
  course: CourseContextSchema.optional(),
  project: ProjectContextSchema.optional(),
  job: JobContextSchema.optional(),
  startup: StartupContextSchema.optional(),
}).strict().optional();

/**
 * Main chat request schema
 */
export const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required and must be non-empty')
    .max(10000, 'Message exceeds maximum length of 10,000 characters'),
  context: ContextSchema,
  studentProfileId: z.string().nullable(),
  conversationHistory: z.array(ConversationMessageSchema)
    .max(20, 'Conversation history cannot exceed 20 messages')
    .default([]),
  intent: z.string().optional(),
  conversationId: z.string().optional(),
}).strict(); // Reject additional properties

/**
 * Type inferred from schema
 */
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/**
 * Validate chat request payload
 * Returns validated data or throws ZodError
 */
export function validateChatRequest(data: unknown): ChatRequest {
  return ChatRequestSchema.parse(data);
}

/**
 * Safely validate chat request payload
 * Returns success result with validated data or error details
 */
export function safeValidateChatRequest(data: unknown): {
  success: true;
  data: ChatRequest;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = ChatRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Format Zod error for user-friendly message
 */
export function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map(issue => {
    const path = issue.path.join('.');
    if (path) {
      return `${path}: ${issue.message}`;
    }
    return issue.message;
  });
  
  if (issues.length === 1) {
    return issues[0];
  }
  
  return `Validation errors: ${issues.join('; ')}`;
}
