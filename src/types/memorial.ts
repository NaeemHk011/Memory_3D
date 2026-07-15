export interface Memorial {
  id: string;
  slug: string;
  owner_id: string;
  name: string;
  birth_date: string | null;
  death_date: string | null;
  bio: string | null;
  cover_photo: string | null;
  is_private: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface MemorialMedia {
  id: string;
  memorial_id: string;
  uploader_id: string | null;
  type: "photo" | "video";
  url: string;
  caption: string | null;
  uploaded_at: string;
}

export interface MemorialStory {
  id: string;
  memorial_id: string;
  author_id: string | null;
  author_name: string;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface MemorialDate {
  id: string;
  memorial_id: string;
  label: string;
  date: string;
  note: string | null;
}

export interface MemorialMember {
  id: string;
  memorial_id: string;
  user_id: string;
  role: "owner" | "editor" | "viewer";
  invited_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
