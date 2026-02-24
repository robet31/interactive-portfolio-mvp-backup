import type { Post, Experience, Project, Certification } from './types';

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function getExperiencesFromApi(): Promise<Experience[]> {
  try {
    return await fetchFromApi<Experience[]>('/experiences');
  } catch (error) {
    console.error('Failed to fetch experiences:', error);
    return [];
  }
}

export async function getCertificationsFromApi(): Promise<Certification[]> {
  try {
    return await fetchFromApi<Certification[]>('/certifications');
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    return [];
  }
}

export async function getProjectsFromApi(): Promise<Project[]> {
  try {
    return await fetchFromApi<Project[]>('/projects');
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function getPostsFromApi(): Promise<Post[]> {
  try {
    return await fetchFromApi<Post[]>('/posts');
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export async function getPublishedPostsFromApi(): Promise<Post[]> {
  try {
    return await fetchFromApi<Post[]>('/posts/published');
  } catch (error) {
    console.error('Failed to fetch published posts:', error);
    return [];
  }
}

export async function getPostBySlugFromApi(slug: string): Promise<Post | undefined> {
  try {
    return await fetchFromApi<Post>(`/posts/${slug}`);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return undefined;
  }
}
