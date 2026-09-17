import { supabase } from './supabase';
import { decodeIp } from '@/lib/security/ipCodec';

export interface TelemetryStats {
  uniqueNodes: number;
  totalHits: number;
  recent24h: number;
  topPaths: { path: string; count: number }[];
}

export interface VisitorLog {
  id?: string;
  visitorHash: string;
  realIp: string;
  path: string;
  viewedAt: string;
}

/**
 * Records an origin-hashed page view (visitor hash + target path).
 */
export async function recordPageView(visitorHash: string, path: string = '/'): Promise<boolean> {
  try {
    const { error } = await supabase.from('telemetry_views').insert([
      {
        visitorHash,
        path: path.slice(0, 100),
      },
    ]);

    if (error) {
      console.error('[TELEMETRY] Insert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[TELEMETRY] Unexpected error recording view:', err);
    return false;
  }
}

/**
 * Computes aggregated visitor metrics from telemetry_views.
 */
export async function getTelemetryStats(): Promise<TelemetryStats> {
  const defaultStats: TelemetryStats = {
    uniqueNodes: 1,
    totalHits: 1,
    recent24h: 1,
    topPaths: [{ path: '/', count: 1 }],
  };

  try {
    // 1. Fetch total count
    const { count: totalCount, error: countErr } = await supabase
      .from('telemetry_views')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      return defaultStats;
    }

    // 2. Fetch distinct records for unique nodes calculation (sample recent 2000)
    const { data: views, error: dataErr } = await supabase
      .from('telemetry_views')
      .select('visitorHash, path, viewedAt')
      .order('viewedAt', { ascending: false })
      .limit(2000);

    if (dataErr || !views) {
      return {
        ...defaultStats,
        totalHits: totalCount || 1,
      };
    }

    const uniqueSet = new Set<string>();
    const pathCounts: Record<string, number> = {};
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let recent24h = 0;

    for (const item of views) {
      uniqueSet.add(item.visitorHash);
      pathCounts[item.path] = (pathCounts[item.path] || 0) + 1;

      const viewTime = new Date(item.viewedAt).getTime();
      if (viewTime >= oneDayAgo) {
        recent24h++;
      }
    }

    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      uniqueNodes: Math.max(uniqueSet.size, 1),
      totalHits: Math.max(totalCount || views.length, 1),
      recent24h: Math.max(recent24h, 1),
      topPaths: topPaths.length > 0 ? topPaths : [{ path: '/', count: 1 }],
    };
  } catch (err) {
    console.error('[TELEMETRY] Error computing stats:', err);
    return defaultStats;
  }
}

/**
 * Retrieves recent visitor logs with decoded Real IPs for the admin console.
 */
export async function getRecentVisitorLogs(limit = 30): Promise<VisitorLog[]> {
  try {
    const { data, error } = await supabase
      .from('telemetry_views')
      .select('id, visitorHash, path, viewedAt')
      .order('viewedAt', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      visitorHash: item.visitorHash,
      realIp: decodeIp(item.visitorHash),
      path: item.path,
      viewedAt: item.viewedAt,
    }));
  } catch (err) {
    console.error('[TELEMETRY] Error fetching visitor logs:', err);
    return [];
  }
}

