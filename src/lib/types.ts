
export type CodeListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'frontend' | 'backend' | 'full-stack' | 'component' | 'utility' | 'template';
  preview_url?: string;
  demo_url?: string;
  creator_id: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  featured: boolean;
};

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};
