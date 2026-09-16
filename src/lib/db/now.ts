import { supabase } from '@/lib/db/supabase';

export type NowCategory = 'working_on' | 'reading' | 'subject' | 'internship' | 'other';

export interface NowItem {
  id: string;
  title: string;
  category: NowCategory;
  description: string;
  status: string; // e.g., 'Active', 'In Progress', 'Reading', 'Semester VI', 'Completed'
  progress?: number; // 0 to 100
  link?: string;
  linkText?: string;
  tags?: string[] | string;
  startDate?: string;
  targetDate?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NowSettings {
  id?: string;
  headline: string;
  currentFocus: string;
  location: string;
  availability: string;
  lastUpdated: string;
}

export interface NowData {
  settings: NowSettings;
  items: NowItem[];
}

export const DEFAULT_NOW_SETTINGS: NowSettings = {
  id: 'default',
  headline: '',
  currentFocus: '',
  location: '',
  availability: '',
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_NOW_ITEMS: NowItem[] = [];

let cachedNowSettings: NowSettings = { ...DEFAULT_NOW_SETTINGS };
let cachedNowItems: NowItem[] = [];

export function normalizeTags(tags?: string[] | string | null): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
    } catch {
      // Not JSON, continue to delimiter split
    }
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export async function getNowData(): Promise<NowData> {
  try {
    const [settingsRes, itemsRes] = await Promise.all([
      supabase.from('now_settings').select('*').eq('id', 'default').maybeSingle(),
      supabase.from('now_items').select('*').order('order', { ascending: true }),
    ]);

    if (!settingsRes.error && settingsRes.data) {
      cachedNowSettings = {
        ...DEFAULT_NOW_SETTINGS,
        ...settingsRes.data,
      };
    }

    if (!itemsRes.error && Array.isArray(itemsRes.data)) {
      cachedNowItems = itemsRes.data.map((item: any) => ({
        ...item,
        tags: normalizeTags(item.tags),
      }));
    }

    return {
      settings: cachedNowSettings,
      items: cachedNowItems,
    };
  } catch (error) {
    console.warn('[DB GET NOW NOTICE]: Using fallback cached data', error);
    return {
      settings: cachedNowSettings,
      items: cachedNowItems,
    };
  }
}

export async function getNowItems(): Promise<NowItem[]> {
  const data = await getNowData();
  return data.items;
}

export async function getNowSettings(): Promise<NowSettings> {
  const data = await getNowData();
  return data.settings;
}

export async function createNowItem(input: Partial<NowItem>): Promise<NowItem> {
  const newItem: NowItem = {
    id: input.id || 'now_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: input.title || 'Untitled Activity',
    category: input.category || 'working_on',
    description: input.description || '',
    status: input.status || 'Active',
    progress: typeof input.progress === 'number' ? input.progress : 50,
    link: input.link || '',
    linkText: input.linkText || '',
    tags: normalizeTags(input.tags),
    startDate: input.startDate || '',
    targetDate: input.targetDate || '',
    order: typeof input.order === 'number' ? input.order : cachedNowItems.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cachedNowItems = [newItem, ...cachedNowItems];
  cachedNowSettings.lastUpdated = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('now_items')
      .insert([
        {
          id: newItem.id,
          title: newItem.title,
          category: newItem.category,
          description: newItem.description,
          status: newItem.status,
          progress: newItem.progress,
          link: newItem.link,
          linkText: newItem.linkText,
          tags: JSON.stringify(newItem.tags),
          startDate: newItem.startDate,
          targetDate: newItem.targetDate,
          order: newItem.order,
          createdAt: newItem.createdAt,
          updatedAt: newItem.updatedAt,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[DB INSERT NOW NOTICE]: Supabase insert notice:', error.message);
    } else if (data) {
      newItem.tags = normalizeTags(data.tags);
    }
  } catch (err) {
    console.error('[DB INSERT NOW ERROR]:', err);
  }

  return newItem;
}

export async function updateNowItem(input: Partial<NowItem> & { id: string }): Promise<NowItem> {
  const existingIdx = cachedNowItems.findIndex((i) => i.id === input.id);
  const existing = existingIdx >= 0 ? cachedNowItems[existingIdx] : null;

  const updated: NowItem = {
    id: input.id,
    title: input.title ?? existing?.title ?? 'Untitled',
    category: input.category ?? existing?.category ?? 'working_on',
    description: input.description ?? existing?.description ?? '',
    status: input.status ?? existing?.status ?? 'Active',
    progress: typeof input.progress === 'number' ? input.progress : existing?.progress,
    link: input.link ?? existing?.link ?? '',
    linkText: input.linkText ?? existing?.linkText ?? '',
    tags: normalizeTags(input.tags ?? existing?.tags),
    startDate: input.startDate ?? existing?.startDate ?? '',
    targetDate: input.targetDate ?? existing?.targetDate ?? '',
    order: typeof input.order === 'number' ? input.order : existing?.order ?? 1,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    cachedNowItems[existingIdx] = updated;
  } else {
    cachedNowItems.push(updated);
  }

  cachedNowSettings.lastUpdated = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('now_items')
      .upsert(
        {
          id: updated.id,
          title: updated.title,
          category: updated.category,
          description: updated.description,
          status: updated.status,
          progress: updated.progress,
          link: updated.link,
          linkText: updated.linkText,
          tags: JSON.stringify(updated.tags),
          startDate: updated.startDate,
          targetDate: updated.targetDate,
          order: updated.order,
          updatedAt: updated.updatedAt,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[DB UPDATE NOW NOTICE]: Supabase update notice:', error.message);
    }
  } catch (err) {
    console.error('[DB UPDATE NOW ERROR]:', err);
  }

  return updated;
}

export async function deleteNowItem(id: string): Promise<boolean> {
  cachedNowItems = cachedNowItems.filter((i) => i.id !== id);
  cachedNowSettings.lastUpdated = new Date().toISOString();

  try {
    const { error } = await supabase.from('now_items').delete().eq('id', id);
    if (error) {
      console.warn('[DB DELETE NOW NOTICE]: Supabase delete notice:', error.message);
    }
  } catch (err) {
    console.error('[DB DELETE NOW ERROR]:', err);
  }

  return true;
}

export async function updateNowSettings(input: Partial<NowSettings>): Promise<NowSettings> {
  const updated: NowSettings = {
    ...cachedNowSettings,
    ...input,
    id: 'default',
    lastUpdated: input.lastUpdated || new Date().toISOString(),
  };

  cachedNowSettings = updated;

  try {
    const { error } = await supabase
      .from('now_settings')
      .upsert(
        {
          id: 'default',
          headline: updated.headline,
          currentFocus: updated.currentFocus,
          location: updated.location,
          availability: updated.availability,
          lastUpdated: updated.lastUpdated,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[DB UPDATE NOW SETTINGS NOTICE]: Supabase notice:', error.message);
    }
  } catch (err) {
    console.error('[DB UPDATE NOW SETTINGS ERROR]:', err);
  }

  return cachedNowSettings;
}
