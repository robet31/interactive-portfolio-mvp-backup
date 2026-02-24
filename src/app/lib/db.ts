import type { Post, Experience, Project, Certification } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllPostsFromDb(): Promise<Post[]> {
  try {
    const rows = await fetchFromApi<Post[]>('/posts');
    return rows.map(row => ({
      id: String(row.id),
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      cover_image_url: row.cover_image_url || '',
      category: row.category || 'Jurnal & Catatan',
      status: row.status || 'draft',
      excerpt: row.excerpt || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      reading_time: Number(row.reading_time) || 0,
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPublishedPostsFromDb(): Promise<Post[]> {
  try {
    const rows = await fetchFromApi<Post[]>('/posts/published');
    return rows.map(row => ({
      id: String(row.id),
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      cover_image_url: row.cover_image_url || '',
      category: row.category || 'Jurnal & Catatan',
      status: row.status || 'draft',
      excerpt: row.excerpt || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      reading_time: Number(row.reading_time) || 0,
    }));
  } catch (error) {
    console.error('Error fetching published posts:', error);
    return [];
  }
}

export async function getPostBySlugFromDb(slug: string): Promise<Post | undefined> {
  try {
    const row = await fetchFromApi<Post>(`/posts/${slug}`);
    return {
      id: String(row.id),
      title: row.title,
      slug: row.slug,
      content: row.content || '',
      cover_image_url: row.cover_image_url || '',
      category: row.category || 'Jurnal & Catatan',
      status: row.status || 'draft',
      excerpt: row.excerpt || '',
      created_at: row.created_at,
      updated_at: row.updated_at,
      reading_time: Number(row.reading_time) || 0,
    };
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return undefined;
  }
}

interface ApiExperience {
  id: number;
  title: string;
  organization: string;
  period: string;
  description: string;
  type: string;
  image: string;
  start_date: string;
  tags: string[];
}

export async function getAllExperiencesFromDb(): Promise<Experience[]> {
  try {
    const rows = await fetchFromApi<ApiExperience[]>('/experiences');
    return rows.map(row => ({
      id: String(row.id),
      title: row.title,
      organization: row.organization || '',
      period: row.period || '',
      description: row.description || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      type: (row.type as Experience['type']) || 'work',
      image: row.image || '',
      images: Array.isArray(row.images) ? row.images : [],
      startDate: row.start_date || '',
    }));
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return [];
  }
}

interface ApiProject {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  category: string;
}

export async function getAllProjectsFromDb(): Promise<Project[]> {
  try {
    const rows = await fetchFromApi<ApiProject[]>('/projects');
    return rows.map(row => ({
      id: String(row.id),
      title: row.title,
      description: row.description || '',
      image: row.image || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      link: row.link || '',
      category: row.category || '',
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

interface ApiCertification {
  id: number;
  name: string;
  organization: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
  image: string;
  skills: string[];
}

export async function getAllCertificationsFromDb(): Promise<Certification[]> {
  try {
    const rows = await fetchFromApi<ApiCertification[]>('/certifications');
    return rows.map(row => ({
      id: String(row.id),
      name: row.name,
      organization: row.organization,
      issueDate: row.issue_date || '',
      expiryDate: row.expiry_date || '',
      credentialId: row.credential_id || '',
      credentialUrl: row.credential_url || '',
      image: row.image || '',
      skills: Array.isArray(row.skills) ? row.skills : [],
    }));
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return [];
  }
}

// ==================== CRUD FUNCTIONS ====================

// Posts CRUD
export async function createPostInDb(data: Partial<Post>): Promise<Post | null> {
  try {
    const result = await fetchFromApi<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function updatePostInDb(id: string, data: Partial<Post>): Promise<Post | null> {
  try {
    const result = await fetchFromApi<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

export async function deletePostInDb(id: string): Promise<boolean> {
  try {
    await fetchFromApi(`/posts/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

// Experiences CRUD
export async function createExperienceInDb(data: Partial<Experience>): Promise<Experience | null> {
  try {
    const result = await fetchFromApi<Experience>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating experience:', error);
    return null;
  }
}

export async function updateExperienceInDb(id: string, data: Partial<Experience>): Promise<Experience | null> {
  try {
    const result = await fetchFromApi<Experience>(`/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error updating experience:', error);
    return null;
  }
}

export async function deleteExperienceInDb(id: string): Promise<boolean> {
  try {
    await fetchFromApi(`/experiences/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting experience:', error);
    return false;
  }
}

// Projects CRUD
export async function createProjectInDb(data: Partial<Project>): Promise<Project | null> {
  try {
    const result = await fetchFromApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function updateProjectInDb(id: string, data: Partial<Project>): Promise<Project | null> {
  try {
    const result = await fetchFromApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
}

export async function deleteProjectInDb(id: string): Promise<boolean> {
  try {
    await fetchFromApi(`/projects/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Certifications CRUD
export async function createCertificationInDb(data: Partial<Certification>): Promise<Certification | null> {
  try {
    const result = await fetchFromApi<Certification>('/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating certification:', error);
    return null;
  }
}

export async function updateCertificationInDb(id: string, data: Partial<Certification>): Promise<Certification | null> {
  try {
    const result = await fetchFromApi<Certification>(`/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error updating certification:', error);
    return null;
  }
}

export async function deleteCertificationInDb(id: string): Promise<boolean> {
  try {
    await fetchFromApi(`/certifications/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting certification:', error);
    return false;
  }
}
