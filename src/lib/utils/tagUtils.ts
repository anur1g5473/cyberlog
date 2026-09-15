export interface TagItem {
  name: string;
  color: string;
}

export const CYBER_COLOR_PRESETS: Array<{ label: string; color: string }> = [
  { label: 'Terminal Green', color: '#00ff41' },
  { label: 'Cyber Cyan', color: '#00f3ff' },
  { label: 'Neon Purple', color: '#a855f7' },
  { label: 'Amber Warning', color: '#f59e0b' },
  { label: 'Exploit Red', color: '#ef4444' },
  { label: 'Hot Pink', color: '#ec4899' },
  { label: 'Matrix Emerald', color: '#10b981' },
  { label: 'Cobalt Blue', color: '#3b82f6' },
];

export const DEFAULT_SUGGESTED_TAGS: TagItem[] = [
  { name: 'WebSecurity', color: '#00f3ff' },
  { name: 'PenTesting', color: '#ef4444' },
  { name: 'CTF', color: '#a855f7' },
  { name: 'ZeroDay', color: '#f59e0b' },
  { name: 'MalwareAnalysis', color: '#ec4899' },
  { name: 'Cryptography', color: '#10b981' },
  { name: 'Network', color: '#3b82f6' },
  { name: 'DevSecOps', color: '#00ff41' },
];

/**
 * Returns a fallback cyber outline color based on hashtag name keywords.
 */
export function getDefaultColorForTag(tagName: string): string {
  if (!tagName) return '#00ff41';
  const lower = tagName.toLowerCase();
  if (lower.includes('web') || lower.includes('frontend') || lower.includes('react')) return '#00f3ff';
  if (lower.includes('network') || lower.includes('cloud') || lower.includes('api')) return '#3b82f6';
  if (lower.includes('ctf') || lower.includes('crypto') || lower.includes('reverse')) return '#a855f7';
  if (lower.includes('tool') || lower.includes('linux') || lower.includes('bash')) return '#10b981';
  if (lower.includes('red') || lower.includes('exploit') || lower.includes('malware') || lower.includes('zero') || lower.includes('vuln')) return '#ef4444';
  if (lower.includes('warn') || lower.includes('audit') || lower.includes('recon')) return '#f59e0b';
  if (lower.includes('bug') || lower.includes('bounty') || lower.includes('privesc')) return '#ec4899';
  return '#00ff41';
}

/**
 * Parses raw tags stored in DB (JSON array, comma-separated string, or object array)
 * into a normalized TagItem[] with outline colors.
 */
export function parseBlogTags(raw: any): TagItem[] {
  if (!raw) return [];

  // If already an array
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') {
          const cleanName = item.trim().replace(/^#+/, '');
          return { name: cleanName, color: getDefaultColorForTag(cleanName) };
        }
        if (typeof item === 'object' && item !== null) {
          const name = String(item.name || item.label || item.tag || '').trim().replace(/^#+/, '');
          const color = item.color && /^#([0-9A-Fa-f]{3}){1,2}$/.test(item.color)
            ? item.color
            : getDefaultColorForTag(name);
          return { name, color };
        }
        return null;
      })
      .filter((t): t is TagItem => Boolean(t && t.name.length > 0));
  }

  // If string (could be JSON string or comma-separated)
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parseBlogTags(parsed);
        }
      } catch (e) {
        // Fall back to comma-separated split
      }
    }

    return trimmed
      .split(',')
      .map((t) => {
        const cleanName = t.trim().replace(/^#+/, '');
        return {
          name: cleanName,
          color: getDefaultColorForTag(cleanName),
        };
      })
      .filter((t) => t.name.length > 0);
  }

  return [];
}

/**
 * Serializes TagItem[] into a JSON string to persist in Supabase tags TEXT column.
 */
export function serializeBlogTags(tags: TagItem[]): string {
  if (!tags || tags.length === 0) return '[]';
  return JSON.stringify(
    tags.map((t) => ({
      name: t.name.trim().replace(/^#+/, ''),
      color: t.color || getDefaultColorForTag(t.name),
    }))
  );
}
