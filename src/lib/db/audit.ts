import { supabase } from './supabase';

export type AuditEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILURE'
  | 'AUTH_LOCKOUT'
  | 'MUTATION'
  | 'IDLE_TIMEOUT'
  | 'LOGOUT'
  | 'SECURITY_ALERT';

export interface AuditLogEntry {
  id?: string;
  eventType: AuditEventType;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  details?: Record<string, any>;
  actorHash: string;
  createdAt?: string;
}

/**
 * Records an immutable security audit event into security_audit_logs.
 */
export async function logSecurityEvent(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('security_audit_logs').insert([
      {
        eventType: entry.eventType,
        action: entry.action,
        status: entry.status || 'SUCCESS',
        details: entry.details || {},
        actorHash: entry.actorHash ? entry.actorHash.slice(0, 32) : 'ANONYMOUS',
      },
    ]);

    if (error) {
      console.error('[AUDIT] Failed to insert audit log:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[AUDIT] Unexpected audit logging exception:', err);
    return false;
  }
}

/**
 * Retrieves the most recent immutable audit logs for the admin security console.
 */
export async function getRecentAuditLogs(limit = 25): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.warn('[AUDIT] Failed to fetch logs, returning fallback:', error?.message);
      return [];
    }

    return data as AuditLogEntry[];
  } catch (err) {
    console.error('[AUDIT] Error fetching audit logs:', err);
    return [];
  }
}
