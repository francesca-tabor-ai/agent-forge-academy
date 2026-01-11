import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/attribution
 * 
 * Applies referral attribution to user profile from cookies.
 * Called after profile creation/update during onboarding.
 * 
 * Behavior:
 * - Reads cookies 'agh_ref' (referral_link_id) and 'agh_rep' (sales_rep_id)
 * - If profile.referral_link_id is null, updates with attribution
 * - First-touch attribution (does not overwrite if already set)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Read attribution cookies
    const referralLinkId = request.cookies.get('agh_ref')?.value;
    const salesRepId = request.cookies.get('agh_rep')?.value;

    // If no attribution cookies, return success (nothing to do)
    if (!referralLinkId || !salesRepId) {
      return NextResponse.json({ 
        success: true, 
        message: 'No attribution cookies found' 
      });
    }

    // Get current profile to check if attribution already set
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, referral_link_id, sales_rep_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // First-touch attribution: only set if not already set
    if (profile.referral_link_id !== null) {
      return NextResponse.json({ 
        success: true, 
        message: 'Attribution already set, skipping',
        alreadyAttributed: true
      });
    }

    // Validate that referral link and sales rep exist
    const { data: referralLink } = await supabase
      .from('sales_referral_links')
      .select('id')
      .eq('id', referralLinkId)
      .single();

    const { data: salesRep } = await supabase
      .from('sales_reps')
      .select('id')
      .eq('id', salesRepId)
      .single();

    if (!referralLink || !salesRep) {
      // Invalid cookies, but don't fail - just log and continue
      console.warn('Invalid referral attribution cookies:', {
        referralLinkId,
        salesRepId,
        userId: user.id,
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Invalid attribution cookies, skipping',
        invalidCookies: true
      });
    }

    // Update profile with attribution
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        referral_link_id: referralLinkId,
        sales_rep_id: salesRepId,
        referred_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .is('referral_link_id', null); // Only update if still null (race condition protection)

    if (updateError) {
      console.error('Error updating profile attribution:', updateError);
      return NextResponse.json(
        { error: 'Failed to update attribution', details: updateError.message },
        { status: 500 }
      );
    }

    // Optionally clear cookies after attribution (or keep for 30 days as specified)
    // Keeping cookies for 30 days as they may be useful for analytics
    // If you want to clear them, uncomment the code below:
    /*
    const response = NextResponse.json({ success: true });
    response.cookies.delete('agh_ref');
    response.cookies.delete('agh_rep');
    return response;
    */

    return NextResponse.json({ 
      success: true, 
      message: 'Attribution applied successfully',
      attribution: {
        referralLinkId,
        salesRepId,
      }
    });
  } catch (error) {
    console.error('Error in attribution handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
