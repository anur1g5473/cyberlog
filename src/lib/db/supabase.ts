import { createClient } from '@supabase/supabase-js';

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseUrl = 'https://placeholder.supabase.co';

if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
  try {
    new URL(rawUrl);
    supabaseUrl = rawUrl;
  } catch (e) {
    supabaseUrl = 'https://placeholder.supabase.co';
  }
}

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);


