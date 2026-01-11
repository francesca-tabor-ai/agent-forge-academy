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
  emailType?: 'weekly_learning' | 'weekly_jobs'; // Required for type-specific unsubscribe links
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
 * Get company information for email footer
 * Can be overridden via environment variables for compliance
 */
function getCompanyInfo() {
  return {
    name: process.env.COMPANY_NAME || 'Agent Forge Academy',
    address: process.env.COMPANY_ADDRESS || 'London, UK',
    // Full address can be set via COMPANY_ADDRESS env var for compliance
  };
}

/**
 * Inject unsubscribe link, preferences link, company info, and UTM tracking into HTML content
 */
function processEmailContent(
  html: string,
  unsubscribeToken?: string,
  emailType?: 'weekly_learning' | 'weekly_jobs',
  utmSource?: string,
  utmCampaign?: string,
  utmMedium?: string
): string {
  let processedHtml = html;

  // Build required footer content
  const companyInfo = getCompanyInfo();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  
  // Build type-specific unsubscribe URL
  let unsubscribeUrl = '';
  let unsubscribeText = 'Unsubscribe';
  if (unsubscribeToken) {
    if (emailType === 'weekly_learning') {
      unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=learning`;
      unsubscribeText = 'Unsubscribe from learning emails';
    } else if (emailType === 'weekly_jobs') {
      unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=jobs`;
      unsubscribeText = 'Unsubscribe from job emails';
    } else {
      unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=all`;
    }
  }

  // Build preferences URL
  const preferencesUrl = unsubscribeToken
    ? `${baseUrl}/student/settings/notifications?token=${encodeURIComponent(unsubscribeToken)}`
    : `${baseUrl}/student/settings/notifications`;

  // Build email footer with required content
  const emailFooter = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      ${unsubscribeToken ? `
      <p style="margin: 0 0 8px 0;">
        <a href="${preferencesUrl}" style="color: #3b82f6; text-decoration: underline;">Manage email preferences</a>
      </p>
      ` : ''}
      ${unsubscribeUrl ? `
      <p style="margin: 0 0 12px 0;">
        <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">${unsubscribeText}</a>
      </p>
      ` : ''}
      <p style="margin: 0; font-size: 11px; color: #9ca3af;">
        ${companyInfo.name}<br>
        ${companyInfo.address}
      </p>
    </div>
  `;

  // Try to insert before </body>, otherwise append to end
  if (processedHtml.includes('</body>')) {
    processedHtml = processedHtml.replace('</body>', `${emailFooter}</body>`);
  } else {
    processedHtml = processedHtml + emailFooter;
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
  const { to, subject, html, text, unsubscribeToken, emailType, utmSource, utmCampaign, utmMedium } = options;

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
    // Process HTML content (add unsubscribe link, preferences link, company info, and UTM tracking)
    const processedHtml = processEmailContent(html, unsubscribeToken, emailType, utmSource, utmCampaign, utmMedium);

    // Process text content (add unsubscribe, preferences links, and company info)
    let processedText = text || '';
    const companyInfo = getCompanyInfo();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
    
    if (unsubscribeToken) {
      const preferencesUrl = `${baseUrl}/student/settings/notifications?token=${encodeURIComponent(unsubscribeToken)}`;
      let unsubscribeUrl = '';
      let unsubscribeText = 'Unsubscribe';
      
      if (emailType === 'weekly_learning') {
        unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=learning`;
        unsubscribeText = 'Unsubscribe from learning emails';
      } else if (emailType === 'weekly_jobs') {
        unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=jobs`;
        unsubscribeText = 'Unsubscribe from job emails';
      } else {
        unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}&type=all`;
      }
      
      processedText += `\n\n---\nManage email preferences: ${preferencesUrl}\n${unsubscribeText}: ${unsubscribeUrl}`;
    }
    
    // Add company info to plain text
    processedText += `\n\n${companyInfo.name}\n${companyInfo.address}`;

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
