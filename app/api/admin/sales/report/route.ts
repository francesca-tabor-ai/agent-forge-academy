import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { hasRole } from '@/lib/supabase/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sales/report
 * 
 * Sales referral analytics report.
 * Requires admin role.
 * 
 * Query parameters:
 * - from: YYYY-MM-DD (required)
 * - to: YYYY-MM-DD (required)
 * - includeTimeSeries: boolean (optional, default: false)
 * 
 * Returns:
 * - visitsPerRep: Array of { repId, repName, repEmail, team, visitCount }
 * - visitsPerCampaign: Array of { campaign, visitCount }
 * - topDestinationPaths: Array of { destinationPath, visitCount }
 * - dailyTimeSeries: Array of { date, visitCount } (if includeTimeSeries=true)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const isAdmin = await hasRole('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const includeTimeSeries = searchParams.get('includeTimeSeries') === 'true';

    // Validate date parameters
    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Both "from" and "to" date parameters are required (format: YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Parse and validate dates
    const fromDate = new Date(fromParam + 'T00:00:00Z');
    const toDate = new Date(toParam + 'T23:59:59Z');

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        { error: '"from" date must be before or equal to "to" date' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient();

    // Build date filter
    const fromISO = fromDate.toISOString();
    const toISO = toDate.toISOString();

    // 1. Visits per rep
    const { data: visitsPerRepData, error: repError } = await supabase
      .from('sales_referral_visits')
      .select(`
        sales_rep_id,
        sales_reps!inner (
          id,
          name,
          email,
          team
        )
      `)
      .gte('visited_at', fromISO)
      .lte('visited_at', toISO);

    if (repError) {
      console.error('Error fetching visits per rep:', repError);
      return NextResponse.json(
        { error: 'Failed to fetch visits per rep', details: repError.message },
        { status: 500 }
      );
    }

    // Aggregate visits per rep
    const repCounts = new Map<string, {
      repId: string;
      repName: string;
      repEmail: string;
      team: string | null;
      visitCount: number;
    }>();

    visitsPerRepData?.forEach((visit: any) => {
      const rep = visit.sales_reps;
      if (!rep) return;

      const key = rep.id;
      if (!repCounts.has(key)) {
        repCounts.set(key, {
          repId: rep.id,
          repName: rep.name,
          repEmail: rep.email,
          team: rep.team,
          visitCount: 0,
        });
      }
      repCounts.get(key)!.visitCount++;
    });

    const visitsPerRep = Array.from(repCounts.values())
      .sort((a, b) => b.visitCount - a.visitCount);

    // 2. Visits per campaign
    const { data: visitsPerCampaignData, error: campaignError } = await supabase
      .from('sales_referral_visits')
      .select(`
        referral_link_id,
        sales_referral_links!inner (
          campaign
        )
      `)
      .gte('visited_at', fromISO)
      .lte('visited_at', toISO);

    if (campaignError) {
      console.error('Error fetching visits per campaign:', campaignError);
      return NextResponse.json(
        { error: 'Failed to fetch visits per campaign', details: campaignError.message },
        { status: 500 }
      );
    }

    // Aggregate visits per campaign
    const campaignCounts = new Map<string, number>();
    visitsPerCampaignData?.forEach((visit: any) => {
      const campaign = visit.sales_referral_links?.campaign || 'No Campaign';
      campaignCounts.set(campaign, (campaignCounts.get(campaign) || 0) + 1);
    });

    const visitsPerCampaign = Array.from(campaignCounts.entries())
      .map(([campaign, visitCount]) => ({ campaign, visitCount }))
      .sort((a, b) => b.visitCount - a.visitCount);

    // 3. Top destination paths
    const { data: topPathsData, error: pathsError } = await supabase
      .from('sales_referral_visits')
      .select('landing_path')
      .gte('visited_at', fromISO)
      .lte('visited_at', toISO);

    if (pathsError) {
      console.error('Error fetching top destination paths:', pathsError);
      return NextResponse.json(
        { error: 'Failed to fetch top destination paths', details: pathsError.message },
        { status: 500 }
      );
    }

    // Aggregate destination paths
    const pathCounts = new Map<string, number>();
    topPathsData?.forEach((visit: any) => {
      const path = visit.landing_path || 'Unknown';
      pathCounts.set(path, (pathCounts.get(path) || 0) + 1);
    });

    const topDestinationPaths = Array.from(pathCounts.entries())
      .map(([destinationPath, visitCount]) => ({ destinationPath, visitCount }))
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 20); // Top 20

    // 4. Daily time series (optional)
    let dailyTimeSeries: Array<{ date: string; visitCount: number }> = [];

    if (includeTimeSeries) {
      const { data: timeSeriesData, error: timeSeriesError } = await supabase
        .from('sales_referral_visits')
        .select('visited_at')
        .gte('visited_at', fromISO)
        .lte('visited_at', toISO)
        .order('visited_at', { ascending: true });

      if (timeSeriesError) {
        console.error('Error fetching time series:', timeSeriesError);
        // Don't fail the whole request if time series fails
      } else {
        // Group by date
        const dailyCounts = new Map<string, number>();
        timeSeriesData?.forEach((visit: any) => {
          const date = new Date(visit.visited_at).toISOString().split('T')[0]; // YYYY-MM-DD
          dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        });

        // Fill in missing dates with 0
        const currentDate = new Date(fromDate);
        while (currentDate <= toDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!dailyCounts.has(dateStr)) {
            dailyCounts.set(dateStr, 0);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        dailyTimeSeries = Array.from(dailyCounts.entries())
          .map(([date, visitCount]) => ({ date, visitCount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    return NextResponse.json({
      period: {
        from: fromParam,
        to: toParam,
      },
      visitsPerRep,
      visitsPerCampaign,
      topDestinationPaths,
      ...(includeTimeSeries && { dailyTimeSeries }),
    });
  } catch (error) {
    console.error('Error in sales report handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
