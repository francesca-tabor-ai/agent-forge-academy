import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/send';
import { renderWeeklyLearningEmailHTML, renderWeeklyLearningEmailText } from '@/lib/email/templates';

/**
 * GET /api/cron/send-emails
 * 
 * Email sender job that processes queued emails from email_outbox.
 * Protected by CRON_SECRET header.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Process:
 * 1. Find emails where status='queued' OR status='failed' AND next_attempt_at <= now()
 * 2. Attempt to send via email provider
 * 3. On success: update status='sent', set sent_at
 * 4. On failure: update status='failed', increment attempt_count, schedule retry with exponential backoff
 * 
 * Exponential backoff: next_attempt_at = now() + (2^attempt_count) minutes, capped at 6 hours
 */
export async function GET(request: NextRequest) {
  try {
    // Check for secret header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    // Verify authorization header
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find emails ready to send: queued or failed with next_attempt_at <= now()
    const now = new Date().toISOString();
    const { data: queuedEmails, error: fetchError } = await supabase
      .from('email_outbox')
      .select('*')
      .in('status', ['queued', 'failed'])
      .lte('next_attempt_at', now)
      .order('created_at', { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching queued emails:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch queued emails' },
        { status: 500 }
      );
    }

    if (!queuedEmails || queuedEmails.length === 0) {
      return NextResponse.json({
        message: 'No emails to send',
        processed: 0,
        sent: 0,
        failed: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each email
    for (const email of queuedEmails) {
      try {
        // Get student profile to fetch unsubscribe token
        const { data: studentProfile, error: profileError } = await supabase
          .from('student_profiles')
          .select('unsubscribe_token')
          .eq('id', email.student_profile_id)
          .single();

        if (profileError || !studentProfile) {
          console.error(`Error fetching student profile for email ${email.id}:`, profileError);
          // Mark as failed
          await supabase
            .from('email_outbox')
            .update({
              status: 'failed',
              last_error: 'Student profile not found',
              attempt_count: email.attempt_count + 1,
              next_attempt_at: calculateNextAttempt(email.attempt_count + 1),
            })
            .eq('id', email.id);
          failed++;
          continue;
        }

        const unsubscribeToken = studentProfile.unsubscribe_token;

        // Render email content based on email_type
        let html: string;
        let text: string;

        if (email.email_type === 'weekly_learning') {
          const payload = email.payload as any;
          html = renderWeeklyLearningEmailHTML(payload);
          text = renderWeeklyLearningEmailText(payload);
        } else if (email.email_type === 'weekly_jobs') {
          // TODO: Implement weekly_jobs email template
          html = '<p>Weekly jobs email template not yet implemented.</p>';
          text = 'Weekly jobs email template not yet implemented.';
        } else {
          console.error(`Unknown email_type: ${email.email_type}`);
          await supabase
            .from('email_outbox')
            .update({
              status: 'failed',
              last_error: `Unknown email_type: ${email.email_type}`,
              attempt_count: email.attempt_count + 1,
              next_attempt_at: calculateNextAttempt(email.attempt_count + 1),
            })
            .eq('id', email.id);
          failed++;
          continue;
        }

        // Attempt to send email
        const result = await sendEmail({
          to: email.to_email,
          subject: email.subject,
          html,
          text,
          unsubscribeToken,
          utmSource: 'weekly_email',
          utmCampaign: email.email_type === 'weekly_learning' ? 'learning_update' : 'jobs_update',
          utmMedium: 'email',
        });

        if (result.success) {
          // Success: mark as sent
          await supabase
            .from('email_outbox')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', email.id);
          sent++;
        } else {
          // Failure: schedule retry with exponential backoff
          const newAttemptCount = email.attempt_count + 1;
          const nextAttemptAt = calculateNextAttempt(newAttemptCount);

          await supabase
            .from('email_outbox')
            .update({
              status: 'failed',
              attempt_count: newAttemptCount,
              last_error: result.error || 'Unknown error',
              next_attempt_at: nextAttemptAt,
            })
            .eq('id', email.id);

          failed++;
          errors.push(`Email ${email.id}: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        const newAttemptCount = email.attempt_count + 1;
        const nextAttemptAt = calculateNextAttempt(newAttemptCount);

        await supabase
          .from('email_outbox')
          .update({
            status: 'failed',
            attempt_count: newAttemptCount,
            last_error: error instanceof Error ? error.message : 'Unknown error',
            next_attempt_at: nextAttemptAt,
          })
          .eq('id', email.id);

        failed++;
        errors.push(`Email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: 'Email sending job completed',
      processed: queuedEmails.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in email sending job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate next attempt time using exponential backoff
 * Formula: now() + (2^attempt_count) minutes, capped at 6 hours (360 minutes)
 */
function calculateNextAttempt(attemptCount: number): string {
  // Exponential backoff: 2^attempt_count minutes
  // attempt_count 0: 1 minute
  // attempt_count 1: 2 minutes
  // attempt_count 2: 4 minutes
  // attempt_count 3: 8 minutes
  // attempt_count 4: 16 minutes
  // attempt_count 5: 32 minutes
  // attempt_count 6: 64 minutes
  // attempt_count 7: 128 minutes
  // attempt_count 8: 256 minutes
  // attempt_count 9+: 360 minutes (6 hours cap)
  
  const minutes = Math.min(Math.pow(2, attemptCount), 360);
  const nextAttempt = new Date();
  nextAttempt.setMinutes(nextAttempt.getMinutes() + minutes);
  
  return nextAttempt.toISOString();
}
