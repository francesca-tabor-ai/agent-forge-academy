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

interface WeeklyJobsEmailPayload {
  name: string;
  topMatch: {
    id: string;
    title: string;
    company: string;
    matching_score: number;
    status: string;
    skills_missing: string[];
    location: string | null;
    is_remote: boolean;
    salary_range: string | null;
    external_url: string | null;
  };
  nearMisses: Array<{
    id: string;
    title: string;
    company: string;
    matching_score: number;
    status: string;
    skills_missing: string[];
    location: string | null;
    is_remote: boolean;
    salary_range: string | null;
    external_url: string | null;
  }>;
  skillGapOfTheWeek: string | null;
  unsubscribeToken?: string;
}

/**
 * Render weekly jobs email HTML
 */
export function renderWeeklyJobsEmailHTML(payload: WeeklyJobsEmailPayload): string {
  const { name, topMatch, nearMisses, skillGapOfTheWeek } = payload;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  const jobsUrl = `${baseUrl}/student/jobs`;
  const topMatchUrl = topMatch.external_url || `${jobsUrl}?jobId=${topMatch.id}`;
  const preparePackUrl = `${jobsUrl}?preparePack=true`;

  const formatLocation = (location: string | null, isRemote: boolean) => {
    if (isRemote) return 'Remote';
    if (location) return location;
    return 'Location TBD';
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      recommended: '⭐ Recommended',
      unlocked: '🔓 Unlocked',
      locked: '🔒 Locked',
      stretch: '🎯 Stretch',
      new: '✨ New',
    };
    return statusMap[status] || status;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 roles you're closest to</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">3 Roles You're Closest To, ${name}</h1>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    
    <!-- Top Match -->
    <div style="margin-bottom: 30px;">
      <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">⭐ Top Match</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">${topMatch.title}</h3>
        <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 16px;">${topMatch.company}</p>
        
        <div style="display: flex; gap: 15px; margin-bottom: 12px; flex-wrap: wrap;">
          <span style="background: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; color: #059669; font-weight: 600;">
            ${topMatch.matching_score}% Match
          </span>
          <span style="background: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; color: #6b7280;">
            ${formatStatus(topMatch.status)}
          </span>
          <span style="background: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; color: #6b7280;">
            ${formatLocation(topMatch.location, topMatch.is_remote)}
          </span>
        </div>
        
        ${topMatch.salary_range ? `
        <p style="margin: 0 0 12px 0; color: #1f2937; font-weight: 600;">${topMatch.salary_range}</p>
        ` : ''}
        
        ${topMatch.skills_missing.length > 0 ? `
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">
          Missing: ${topMatch.skills_missing.slice(0, 3).join(', ')}${topMatch.skills_missing.length > 3 ? '...' : ''}
        </p>
        ` : ''}
        
        <a href="${topMatchUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 15px;">
          View Role →
        </a>
      </div>
    </div>

    <!-- Near Misses -->
    ${nearMisses.length > 0 ? `
    <div style="margin-bottom: 30px;">
      <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🎯 Near Misses</h2>
      ${nearMisses.map(job => {
        const jobUrl = job.external_url || `${jobsUrl}?jobId=${job.id}`;
        return `
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 12px; border-left: 3px solid #10b981;">
          <h4 style="color: #1f2937; margin: 0 0 4px 0; font-size: 16px;">${job.title}</h4>
          <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">${job.company}</p>
          <div style="display: flex; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
            <span style="background: white; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #059669; font-weight: 600;">
              ${job.matching_score}% Match
            </span>
            <span style="background: white; padding: 3px 10px; border-radius: 10px; font-size: 11px; color: #6b7280;">
              ${formatLocation(job.location, job.is_remote)}
            </span>
          </div>
          ${job.skills_missing.length > 0 ? `
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">
            Missing: ${job.skills_missing.slice(0, 2).join(', ')}${job.skills_missing.length > 2 ? '...' : ''}
          </p>
          ` : ''}
          <a href="${jobUrl}" style="display: inline-block; color: #10b981; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 8px;">
            View Role →
          </a>
        </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    <!-- Skill Gap of the Week -->
    ${skillGapOfTheWeek ? `
    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
      <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">📚 Skill Gap of the Week</h3>
      <p style="color: #1e40af; margin: 0; font-size: 18px; font-weight: 600;">${skillGapOfTheWeek}</p>
      <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">
        This skill appears most frequently in roles you're close to matching.
      </p>
    </div>
    ` : ''}

    <!-- CTAs -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="${jobsUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 12px; font-size: 16px;">
        View These Roles
      </a>
      <br>
      <a href="${preparePackUrl}" style="display: inline-block; color: #10b981; text-decoration: underline; font-size: 14px; margin-top: 8px;">
        Prepare My Application Pack
      </a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Render weekly jobs email plain text
 */
export function renderWeeklyJobsEmailText(payload: WeeklyJobsEmailPayload): string {
  const { name, topMatch, nearMisses, skillGapOfTheWeek } = payload;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  const jobsUrl = `${baseUrl}/student/jobs`;
  const topMatchUrl = topMatch.external_url || `${jobsUrl}?jobId=${topMatch.id}`;

  const formatLocation = (location: string | null, isRemote: boolean) => {
    if (isRemote) return 'Remote';
    if (location) return location;
    return 'Location TBD';
  };

  let text = `3 Roles You're Closest To, ${name}\n\n`;
  
  text += `⭐ Top Match\n`;
  text += `${topMatch.title}\n`;
  text += `${topMatch.company}\n`;
  text += `${topMatch.matching_score}% Match | ${formatLocation(topMatch.location, topMatch.is_remote)}\n`;
  if (topMatch.salary_range) {
    text += `${topMatch.salary_range}\n`;
  }
  if (topMatch.skills_missing.length > 0) {
    text += `Missing: ${topMatch.skills_missing.slice(0, 3).join(', ')}\n`;
  }
  text += `${topMatchUrl}\n\n`;

  if (nearMisses.length > 0) {
    text += `🎯 Near Misses\n\n`;
    nearMisses.forEach(job => {
      const jobUrl = job.external_url || `${jobsUrl}?jobId=${job.id}`;
      text += `${job.title}\n`;
      text += `${job.company}\n`;
      text += `${job.matching_score}% Match | ${formatLocation(job.location, job.is_remote)}\n`;
      if (job.skills_missing.length > 0) {
        text += `Missing: ${job.skills_missing.slice(0, 2).join(', ')}\n`;
      }
      text += `${jobUrl}\n\n`;
    });
  }

  if (skillGapOfTheWeek) {
    text += `📚 Skill Gap of the Week\n`;
    text += `${skillGapOfTheWeek}\n`;
    text += `This skill appears most frequently in roles you're close to matching.\n\n`;
  }

  text += `View These Roles\n`;
  text += `${jobsUrl}\n\n`;
  text += `Prepare My Application Pack\n`;
  text += `${jobsUrl}?preparePack=true\n`;

  return text;
}
