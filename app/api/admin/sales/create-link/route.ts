import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasRole } from '@/lib/supabase/server';

/**
 * POST /api/admin/sales/create-link
 * 
 * Creates a sales referral link.
 * Requires admin role.
 * 
 * Body:
 * {
 *   "salesRepEmail": string (required),
 *   "salesRepName": string (required),
 *   "team": string (optional),
 *   "destinationPath": string (required, e.g. "/auth/signup"),
 *   "campaign": string (optional),
 *   "utmCampaign": string (optional),
 *   "utmContent": string (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const isAdmin = await hasRole('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      salesRepEmail,
      salesRepName,
      team,
      destinationPath,
      campaign,
      utmCampaign,
      utmContent,
    } = body;

    // Minimal validation
    if (!salesRepEmail || typeof salesRepEmail !== 'string') {
      return NextResponse.json(
        { error: 'salesRepEmail is required and must be a string' },
        { status: 400 }
      );
    }

    if (!salesRepName || typeof salesRepName !== 'string') {
      return NextResponse.json(
        { error: 'salesRepName is required and must be a string' },
        { status: 400 }
      );
    }

    if (!destinationPath || typeof destinationPath !== 'string') {
      return NextResponse.json(
        { error: 'destinationPath is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize Supabase client (service role for admin operations)
    const supabase = createServerSupabaseClient();

    // Extract first name from salesRepName (for slug generation)
    const firstName = salesRepName.trim().split(/\s+/)[0].toLowerCase();
    // Sanitize: remove non-alphanumeric characters, keep only letters and numbers
    const sanitizedFirstName = firstName.replace(/[^a-z0-9]/g, '');

    if (!sanitizedFirstName) {
      return NextResponse.json(
        { error: 'salesRepName must contain at least one alphanumeric character' },
        { status: 400 }
      );
    }

    // Upsert sales rep by email
    // First, check if sales rep exists
    const { data: existingRep, error: fetchError } = await supabase
      .from('sales_reps')
      .select('id, name, team')
      .eq('email', salesRepEmail.toLowerCase().trim())
      .single();

    let salesRep;
    // If rep exists (no error or error is not "not found"), update it
    if (existingRep && !fetchError) {
      // Update existing rep
      const { data: updatedRep, error: updateError } = await supabase
        .from('sales_reps')
        .update({
          name: salesRepName.trim(),
          team: team?.trim() || null,
          is_active: true,
        })
        .eq('id', existingRep.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating sales rep:', updateError);
        return NextResponse.json(
          { error: 'Failed to update sales rep', details: updateError.message },
          { status: 500 }
        );
      }
      salesRep = updatedRep;
    } else {
      // Create new rep
      const { data: newRep, error: insertError } = await supabase
        .from('sales_reps')
        .insert({
          email: salesRepEmail.toLowerCase().trim(),
          name: salesRepName.trim(),
          team: team?.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating sales rep:', insertError);
        return NextResponse.json(
          { error: 'Failed to create sales rep', details: insertError.message },
          { status: 500 }
        );
      }
      salesRep = newRep;
    }

    // Generate unique slug: <first-name-lower>-<randomBase36(6)>
    // Retry if collision (max 10 attempts)
    let slug: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      // Generate random base36 string (6 characters)
      const randomStr = Math.random().toString(36).substring(2, 8);
      slug = `${sanitizedFirstName}-${randomStr}`;
      attempts++;

      // Check if slug already exists
      const { data: existingLink } = await supabase
        .from('sales_referral_links')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingLink) {
        // Slug is unique, break out of loop
        break;
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique slug after multiple attempts' },
          { status: 500 }
        );
      }
    } while (attempts < maxAttempts);

    // Insert referral link
    const { data: referralLink, error: linkError } = await supabase
      .from('sales_referral_links')
      .insert({
        sales_rep_id: salesRep.id,
        slug,
        destination_path: destinationPath.trim(),
        campaign: campaign?.trim() || null,
        utm_source: 'sales',
        utm_medium: 'referral',
        utm_campaign: utmCampaign?.trim() || campaign?.trim() || null,
        utm_content: utmContent?.trim() || null,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error creating referral link:', linkError);
      return NextResponse.json(
        { error: 'Failed to create referral link', details: linkError.message },
        { status: 500 }
      );
    }

    // Get site URL from environment or construct from request
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    new URL(request.url).origin;
    
    const fullUrl = `${siteUrl}/r/${slug}`;

    return NextResponse.json({
      slug,
      fullUrl,
      link: referralLink,
    });
  } catch (error) {
    console.error('Error in create-link handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
