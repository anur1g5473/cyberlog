import { supabase } from './supabase';

export interface CreateProjectInput {
  title: string;
  description: string;
  techStack: string;
  githubUrl: string;
  demoUrl?: string;
  category?: string;
  featured?: boolean;
}

export interface UpdateProjectInput {
  id: string;
  title?: string;
  description?: string;
  techStack?: string;
  githubUrl?: string;
  demoUrl?: string;
  category?: string;
  featured?: boolean;
}

/**
 * Fetches all projects.
 */
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Fetches featured projects.
 */
export async function getFeaturedProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

/**
 * Creates new project card.
 */
export async function createProject(input: CreateProjectInput) {
  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        title: input.title,
        description: input.description,
        techStack: input.techStack,
        githubUrl: input.githubUrl,
        demoUrl: input.demoUrl || null,
        category: input.category || 'Security Tool',
        featured: input.featured ?? false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates existing project.
 */
export async function updateProject(input: UpdateProjectInput) {
  const dataToUpdate: any = { ...input };
  delete dataToUpdate.id;

  const { data, error } = await supabase
    .from('projects')
    .update(dataToUpdate)
    .eq('id', input.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes project by ID.
 */
export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

