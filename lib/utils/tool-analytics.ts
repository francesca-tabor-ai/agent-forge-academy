/**
 * Tool analytics event tracking utilities
 * Tracks user interactions for ROI analysis and partner reporting
 */

export type AnalyticsEventType = 
  | 'tool_view'
  | 'offer_unlock'
  | 'offer_claim'
  | 'course_tool_conversion';

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  tool_id?: string;
  offer_id?: string;
  course_id?: string;
  project_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Track an analytics event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const response = await fetch('/api/analytics/tools/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Failed to track analytics event:', await response.text());
    }
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.error('Error tracking analytics event:', error);
  }
}

/**
 * Track tool view
 */
export async function trackToolView(toolId: string, metadata?: Record<string, any>): Promise<void> {
  return trackEvent({
    event_type: 'tool_view',
    tool_id: toolId,
    metadata,
  });
}

/**
 * Track offer unlock (when course is completed and offer becomes available)
 */
export async function trackOfferUnlock(
  offerId: string,
  toolId: string,
  courseId: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackEvent({
    event_type: 'offer_unlock',
    offer_id: offerId,
    tool_id: toolId,
    course_id: courseId,
    metadata,
  });
}

/**
 * Track offer claim (when user clicks claim button)
 */
export async function trackOfferClaim(
  offerId: string,
  toolId: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackEvent({
    event_type: 'offer_claim',
    offer_id: offerId,
    tool_id: toolId,
    metadata,
  });
}

/**
 * Track course → tool conversion (when user enrolls in course that teaches tool)
 */
export async function trackCourseToolConversion(
  courseId: string,
  toolId: string,
  metadata?: Record<string, any>
): Promise<void> {
  return trackEvent({
    event_type: 'course_tool_conversion',
    course_id: courseId,
    tool_id: toolId,
    metadata,
  });
}
