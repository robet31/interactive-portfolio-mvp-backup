export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML string from TipTap
  cover_image_url: string;
  category: PostCategory;
  status: 'draft' | 'published';
  excerpt: string;
  created_at: string;
  updated_at: string;
  reading_time: number; // in minutes
}

export type PostCategory =
  | 'Data Science'
  | 'Web Development'
  | 'IT Audit & COBIT'
  | 'Jurnal & Catatan'
  | 'Daily Log';

export type ExperienceType =
  | 'work'
  | 'internship'
  | 'education'
  | 'program'
  | 'organization'
  | 'volunteer';

export interface Experience {
  id: string;
  title: string;
  organization: string;
  period?: string;
  description: string;
  tags: string[];
  type: ExperienceType;
  image?: string; // Legacy single image
  images?: string[]; // Multiple images for gallery
  startDate?: string; // YYYY-MM format for sorting/grouping
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string; // YYYY-MM
  expiryDate?: string; // YYYY-MM or empty for no expiry
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  category: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}
