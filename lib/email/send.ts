/**
 * Email sending module
 * Unified interface for sending emails via Resend (or other providers)
 * 
 * Supports:
 * - Unsubscribe links
 * - UTM tracking parameters
 * - HTML and plain text content
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  unsubscribeToken?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Build unsubscribe URL with token
 */
function buildUnsubscribeUrl(token: string, type: 'learning' | 'jobs' | 'all' = 'all'): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  return `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}&type=${type}`;
}

/**
 * Build manage preferences URL
 */
function buildPreferencesUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  return `${baseUrl}/student/settings/notifications?token=${encodeURIComponent(token)}`;
}

/**
 * Add UTM parameters to a URL
 */
function addUtmParams(url: string, source?: string, campaign?: string, medium?: string): string {
  if (!source && !campaign && !medium) {
    return url;
  }

  const urlObj = new URL(url);
  if (source) urlObj.searchParams.set('utm_source', source);
  if (campaign) urlObj.searchParams.set('utm_campaign', campaign);
  if (medium) urlObj.searchParams.set('utm_medium', medium);

  return urlObj.toString();
}

/**
 * Inject unsubscribe link and UTM tracking into HTML content
 */
function processEmailContent(
  html: string,
  unsubscribeToken?: string,
  utmSource?: string,
  utmCampaign?: string,
  utmMedium?: string
): string {
  let processedHtml = html;

  // Add unsubscribe and preferences links if token provided
  if (unsubscribeToken) {
    const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
    const preferencesUrl = buildPreferencesUrl(unsubscribeToken);
    const emailFooter = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">
          <a href="${preferencesUrl}" style="color: #3b82f6; text-decoration: underline;">Manage email preferences</a>
        </p>
        <p style="margin: 0;">
          Don't want to receive these emails? 
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    `;
    // Try to insert before </body>, otherwise append to end
    if (processedHtml.includes('</body>')) {
      processedHtml = processedHtml.replace('</body>', `${emailFooter}</body>`);
    } else {
      processedHtml = processedHtml + emailFooter;
    }
  }

  // Add UTM parameters to all links in HTML
  if (utmSource || utmCampaign || utmMedium) {
    processedHtml = processedHtml.replace(
      /<a\s+([^>]*href=["'])([^"']+)(["'][^>]*)>/gi,
      (match, before, url, after) => {
        // Skip if already has UTM params or is unsubscribe link
        if (url.includes('utm_') || url.includes('unsubscribe')) {
          return match;
        }
        const trackedUrl = addUtmParams(url, utmSource, utmCampaign, utmMedium);
        return `<a ${before}${trackedUrl}${after}>`;
      }
    );
  }

  return processedHtml;
}

/**
 * Send email using Resend
 * 
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 * - EMAIL_FROM: Sender email address (e.g., "noreply@yourdomain.com")
 * - NEXT_PUBLIC_APP_URL: Base URL for unsubscribe links
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, unsubscribeToken, utmSource, utmCampaign, utmMedium } = options;

  // Check for required environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey) {
    console.error('RESEND_API_KEY environment variable not set');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  if (!emailFrom) {
    console.error('EMAIL_FROM or RESEND_FROM_EMAIL environment variable not set');
    return {
      success: false,
      error: 'Email sender not configured',
    };
  }

  try {
    // Process HTML content (add unsubscribe link and UTM tracking)
    const processedHtml = processEmailContent(html, unsubscribeToken, utmSource, utmCampaign, utmMedium);

    // Process text content (add unsubscribe and preferences links)
    let processedText = text;
    if (processedText && unsubscribeToken) {
      const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
      const preferencesUrl = buildPreferencesUrl(unsubscribeToken);
      processedText += `\n\n---\nManage email preferences: ${preferencesUrl}\nDon't want to receive these emails? Unsubscribe: ${unsubscribeUrl}`;
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject,
        html: processedHtml,
        text: processedText || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Resend API error:', errorData);
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email with default UTM parameters for weekly learning emails
 */
export async function sendWeeklyLearningEmail(
  to: string,
  subject: string,
  html: string,
  text: string | undefined,
  unsubscribeToken: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject,
    html,
    text,
    unsubscribeToken,
    utmSource: 'weekly_email',
    utmCampaign: 'learning_update',
    utmMedium: 'email',
  });
}
