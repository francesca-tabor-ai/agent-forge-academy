/**
 * Email template rendering functions
 * Converts payload data into HTML and plain text email content
 */

interface WeeklyLearningEmailPayload {
  name: string;
  courseTitle: string;
  courseSlug: string;
  lastLesson: string | null;
  lastLessonSlug: string | null;
  nextLesson: string | null;
  nextLessonSlug: string | null;
  emailTakeaway: string | null;
  emailAction: string | null;
  progressPercentage: number;
  unsubscribeToken?: string;
}

/**
 * Render weekly learning email HTML
 */
export function renderWeeklyLearningEmailHTML(payload: WeeklyLearningEmailPayload): string {
  const {
    name,
    courseTitle,
    courseSlug,
    lastLesson,
    nextLesson,
    emailTakeaway,
    emailAction,
    progressPercentage,
  } = payload;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  const courseUrl = `${baseUrl}/student/courses/${courseSlug}`;
  const nextLessonUrl = payload.nextLessonSlug
    ? `${baseUrl}/student/courses/${courseSlug}/lessons/${payload.nextLessonSlug}`
    : courseUrl;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Continue learning: ${nextLesson || courseTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Keep Learning, ${name}!</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Your Progress in ${courseTitle}</h2>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 14px; color: #6b7280;">Progress</span>
        <span style="font-weight: 600; color: #1f2937;">${Math.round(progressPercentage)}%</span>
      </div>
      <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${progressPercentage}%; transition: width 0.3s;"></div>
      </div>
    </div>

    ${lastLesson ? `
    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Last lesson completed:</p>
      <p style="margin: 4px 0 0 0; font-weight: 600; color: #1f2937;">${lastLesson}</p>
    </div>
    ` : ''}

    ${nextLesson ? `
    <div style="margin: 30px 0;">
      <h3 style="color: #1f2937; margin-bottom: 10px;">Next Up: ${nextLesson}</h3>
      ${emailTakeaway ? `
      <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0; color: #1e40af; font-style: italic;">"${emailTakeaway}"</p>
      </div>
      ` : ''}
      <a href="${nextLessonUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px;">
        ${emailAction || `Continue with "${nextLesson}"`}
      </a>
    </div>
    ` : `
    <div style="margin: 30px 0; text-align: center; padding: 30px; background: #f0fdf4; border-radius: 6px;">
      <h3 style="color: #166534; margin: 0 0 10px 0;">🎉 Course Complete!</h3>
      <p style="margin: 0; color: #166534;">You've finished ${courseTitle}. Great work!</p>
      <a href="${courseUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px;">
        Explore Other Courses
      </a>
    </div>
    `}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Render weekly learning email plain text
 */
export function renderWeeklyLearningEmailText(payload: WeeklyLearningEmailPayload): string {
  const {
    name,
    courseTitle,
    courseSlug,
    lastLesson,
    nextLesson,
    emailTakeaway,
    emailAction,
    progressPercentage,
  } = payload;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  const courseUrl = `${baseUrl}/student/courses/${courseSlug}`;
  const nextLessonUrl = payload.nextLessonSlug
    ? `${baseUrl}/student/courses/${courseSlug}/lessons/${payload.nextLessonSlug}`
    : courseUrl;

  let text = `Keep Learning, ${name}!\n\n`;
  text += `Your Progress in ${courseTitle}\n`;
  text += `Progress: ${Math.round(progressPercentage)}%\n\n`;

  if (lastLesson) {
    text += `Last lesson completed: ${lastLesson}\n\n`;
  }

  if (nextLesson) {
    text += `Next Up: ${nextLesson}\n`;
    if (emailTakeaway) {
      text += `\n"${emailTakeaway}"\n\n`;
    }
    text += `${emailAction || `Continue with "${nextLesson}"`}\n`;
    text += `${nextLessonUrl}\n`;
  } else {
    text += `🎉 Course Complete!\n\n`;
    text += `You've finished ${courseTitle}. Great work!\n\n`;
    text += `Explore Other Courses\n`;
    text += `${courseUrl}\n`;
  }

  return text;
}
