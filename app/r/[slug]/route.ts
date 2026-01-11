import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { randomUUID } from 'crypto';

/**
 * GET /r/[slug]
 * 
 * Sales referral link handler:
 * 1. Fetches referral link by slug
 * 2. Creates visit record
 * 3. Sets attribution cookies
 * 4. Redirects to destination with UTM params
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Initialize Supabase client (using service role to bypass RLS for visit tracking)
    const supabase = createServerSupabaseClient();

    // Fetch referral link by slug
    const { data: referralLink, error: linkError } = await supabase
      .from('sales_referral_links')
      .select('id, sales_rep_id, destination_path, utm_source, utm_medium, utm_campaign, utm_content')
      .eq('slug', slug)
      .single();

    if (linkError || !referralLink) {
      // Redirect to home if link not found
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Get or create session ID
    const sessionIdCookie = request.cookies.get('agh_sid');
    let sessionId = sessionIdCookie?.value;
    if (!sessionId) {
      sessionId = randomUUID();
    }

    // Get IP address and hash it
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               null;
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex') : null;

    // Parse GA client ID from _ga cookie
    const gaCookie = request.cookies.get('_ga');
    let gaClientId: string | null = null;
    if (gaCookie?.value) {
      // GA cookie format: GA1.2.1234567890.1234567890
      // Client ID is the last two parts joined by a dot
      const parts = gaCookie.value.split('.');
      if (parts.length >= 4) {
        gaClientId = `${parts[2]}.${parts[3]}`;
      }
    }

    // Get referrer and user agent
    const referrer = request.headers.get('referer') || null;
    const userAgent = request.headers.get('user-agent') || null;

    // Create visit record
    const { error: visitError } = await supabase
      .from('sales_referral_visits')
      .insert({
        referral_link_id: referralLink.id,
        sales_rep_id: referralLink.sales_rep_id,
        landing_path: referralLink.destination_path,
        referrer,
        user_agent: userAgent,
        ip_hash: ipHash,
        ga_client_id: gaClientId,
        session_id: sessionId,
      });

    if (visitError) {
      console.error('Error creating visit record:', visitError);
      // Continue with redirect even if visit tracking fails
    }

    // Build redirect URL with destination path
    const destinationUrl = new URL(referralLink.destination_path, request.url);
    
    // Add UTM parameters if present in referral link
    if (referralLink.utm_source) {
      destinationUrl.searchParams.set('utm_source', referralLink.utm_source);
    }
    if (referralLink.utm_medium) {
      destinationUrl.searchParams.set('utm_medium', referralLink.utm_medium);
    }
    if (referralLink.utm_campaign) {
      destinationUrl.searchParams.set('utm_campaign', referralLink.utm_campaign);
    }
    if (referralLink.utm_content) {
      destinationUrl.searchParams.set('utm_content', referralLink.utm_content);
    }
    
    // Add ref parameter
    destinationUrl.searchParams.set('ref', slug);

    // Create response with redirect
    const response = NextResponse.redirect(destinationUrl, { status: 302 });

    // Set session ID cookie (30 days = 2592000 seconds)
    response.cookies.set('agh_sid', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Set attribution cookies (30 days)
    response.cookies.set('agh_ref', referralLink.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('agh_rep', referralLink.sales_rep_id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Error in referral link handler:', error);
    // Redirect to home on error
    return NextResponse.redirect(new URL('/', request.url));
  }
}
