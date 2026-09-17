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
  hourBucket: string;
  firstVisit: string;
  lastVisit: string;
  hitCount: number;
}

/**
 * Records or updates a page view, grouped by (visitorHash, hourBucket).
 * On the first hit that hour: inserts with firstVisit = lastVisit = now(), hitCount = 1.
 * On subsequent hits: updates lastVisit = now(), hitCount += 1.
 */
export async function recordPageView(visitorHash: string, path: string = '/'): Promise<boolean> {
  try {
    const now = new Date();
    const hourBucket = new Date(now);
    hourBucket.setMinutes(0, 0, 0);
    const hourBucketIso = hourBucket.toISOString();
    const nowIso = now.toISOString();

    // Try to insert first (first visit this hour)
    const { error: insertErr } = await supabase.from('telemetry_views').insert([
      {
        visitorHash,
        path: path.slice(0, 100),
        hourBucket: hourBucketIso,
        firstVisit: nowIso,
        lastVisit: nowIso,
        hitCount: 1,
      },
    ]);

    if (!insertErr) return true;

    // Unique conflict (23505) = already visited this hour, increment via RPC
    if (insertErr.code === '23505') {
      const { error: rpcErr } = await supabase.rpc('increment_telemetry_hit', {
        p_visitor_hash: visitorHash,
        p_hour_bucket: hourBucketIso,
        p_last_visit: nowIso,
      });
      if (rpcErr) {
        console.error('[TELEMETRY] RPC increment error:', rpcErr.message);
      }
      return true;
    }

    console.error('[TELEMETRY] Insert error:', insertErr.message);
    return false;
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
    const { data: views, error } = await supabase
      .from('telemetry_views')
      .select('visitorHash, path, hitCount, lastVisit')
      .order('lastVisit', { ascending: false })
      .limit(2000);

    if (error || !views) return defaultStats;

    const uniqueSet = new Set<string>();
    const pathCounts: Record<string, number> = {};
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    let totalHits = 0;
    let recent24h = 0;

    for (const item of views) {
      uniqueSet.add(item.visitorHash);
      totalHits += item.hitCount || 1;
      pathCounts[item.path] = (pathCounts[item.path] || 0) + (item.hitCount || 1);
      if (new Date(item.lastVisit).getTime() >= oneDayAgo) {
        recent24h += item.hitCount || 1;
      }
    }

    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      uniqueNodes: Math.max(uniqueSet.size, 1),
      totalHits: Math.max(totalHits, 1),
      recent24h: Math.max(recent24h, 1),
      topPaths: topPaths.length > 0 ? topPaths : [{ path: '/', count: 1 }],
    };
  } catch (err) {
    console.error('[TELEMETRY] Error computing stats:', err);
    return defaultStats;
  }
}

/**
 * Retrieves recent visitor logs (grouped hourly sessions) with decoded Real IPs.
 */
export async function getRecentVisitorLogs(limit = 50): Promise<VisitorLog[]> {
  try {
    const { data, error } = await supabase
      .from('telemetry_views')
      .select('id, visitorHash, path, hourBucket, firstVisit, lastVisit, hitCount')
      .order('lastVisit', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id,
      visitorHash: item.visitorHash,
      realIp: decodeIp(item.visitorHash),
      path: item.path,
      hourBucket: item.hourBucket,
      firstVisit: item.firstVisit,
      lastVisit: item.lastVisit,
      hitCount: item.hitCount || 1,
    }));
  } catch (err) {
    console.error('[TELEMETRY] Error fetching visitor logs:', err);
    return [];
  }
}


