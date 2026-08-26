import { supabase } from '@/lib/db/supabase';

export async function getPublishedPosts(tag?: string) {
  try {
    let query = supabase.from('posts').select('*').ilike('status', 'published').order('createdAt', { ascending: false });
    if (tag) query = query.ilike('tags', `%${tag}%`);
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching published posts with order:', error);
      // Fallback query without explicit ordering if column case differs
      let fallbackQuery = supabase.from('posts').select('*').ilike('status', 'published');
      if (tag) fallbackQuery = fallbackQuery.ilike('tags', `%${tag}%`);
      const { data: fallbackData } = await fallbackQuery;
      return fallbackData || [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .ilike('status', 'published')
      .maybeSingle();
    if (error) {
      console.error('Error fetching post by slug:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

export async function getAllPostsForAdmin() {
  try {
    const { data, error } = await supabase.from('posts').select('*').order('createdAt', { ascending: false });
    if (error) {
      console.error('Error fetching admin posts:', error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return [];
  }
}

export async function createPost(post: any) {
  const { data, error } = await supabase.from('posts').insert([post]).select().single();
  if (error) throw error;
  return data;
}

export async function updatePost(post: any) {
  const { id, ...dataToUpdate } = post;
  const { data, error } = await supabase.from('posts').update(dataToUpdate).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
  return true;
}
