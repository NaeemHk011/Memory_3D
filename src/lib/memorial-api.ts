import { getSupabase } from "./supabase";
import type { Memorial, MemorialMedia, MemorialStory, MemorialDate, MemorialMember } from "@/types/memorial";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

// ── Memorials ──────────────────────────────────────────────

export async function createMemorial(data: {
  name: string;
  birth_date?: string;
  death_date?: string;
  bio?: string;
  cover_photo?: string;
  is_private?: boolean;
}): Promise<Memorial> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const baseSlug = slugify(data.name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: memorial, error } = await sb
    .from("memorials")
    .insert({
      ...data,
      slug,
      owner_id: user.id,
      share_token: randomToken(),
    })
    .select()
    .single();

  if (error) throw error;
  return memorial;
}

export async function getMemorialBySlug(slug: string): Promise<Memorial | null> {
  const { data, error } = await getSupabase()
    .from("memorials")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getMyMemorials(): Promise<Memorial[]> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return [];

  const { data, error } = await sb
    .from("memorials")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function updateMemorial(id: string, updates: Partial<Memorial>): Promise<Memorial> {
  const { data, error } = await getSupabase()
    .from("memorials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMemorial(id: string): Promise<void> {
  const { error } = await getSupabase().from("memorials").delete().eq("id", id);
  if (error) throw error;
}

// ── Media ──────────────────────────────────────────────────

export async function uploadPhoto(
  memorialId: string,
  file: File,
  caption?: string
): Promise<MemorialMedia> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop();
  const path = `${memorialId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await sb.storage
    .from("memorial-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = sb.storage
    .from("memorial-photos")
    .getPublicUrl(path);

  const { data, error } = await sb
    .from("memorial_media")
    .insert({
      memorial_id: memorialId,
      uploader_id: user.id,
      type: "photo",
      url: publicUrl,
      caption: caption ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMemorialMedia(memorialId: string): Promise<MemorialMedia[]> {
  const { data, error } = await getSupabase()
    .from("memorial_media")
    .select("*")
    .eq("memorial_id", memorialId)
    .order("uploaded_at", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await getSupabase().from("memorial_media").delete().eq("id", id);
  if (error) throw error;
}

// ── Stories ────────────────────────────────────────────────

export async function submitStory(data: {
  memorial_id: string;
  author_name: string;
  title: string;
  content: string;
}): Promise<MemorialStory> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();

  const { data: story, error } = await sb
    .from("memorial_stories")
    .insert({
      ...data,
      author_id: user?.id ?? null,
      is_approved: true,
    })
    .select()
    .single();

  if (error) throw error;
  return story;
}

export async function getStories(memorialId: string): Promise<MemorialStory[]> {
  const { data, error } = await getSupabase()
    .from("memorial_stories")
    .select("*")
    .eq("memorial_id", memorialId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

// ── Dates ──────────────────────────────────────────────────

export async function getMemorialDates(memorialId: string): Promise<MemorialDate[]> {
  const { data, error } = await getSupabase()
    .from("memorial_dates")
    .select("*")
    .eq("memorial_id", memorialId)
    .order("date", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function addMemorialDate(data: {
  memorial_id: string;
  label: string;
  date: string;
  note?: string;
}): Promise<MemorialDate> {
  const { data: d, error } = await getSupabase()
    .from("memorial_dates")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return d;
}

// ── Family Members ─────────────────────────────────────────

export async function inviteFamilyMember(
  memorialId: string,
  email: string,
  role: "editor" | "viewer" = "viewer"
): Promise<void> {
  const { error } = await getSupabase().functions.invoke("invite-family", {
    body: { memorial_id: memorialId, email, role },
  });
  if (error) throw error;
}

export async function getMemorialMembers(memorialId: string): Promise<MemorialMember[]> {
  const { data, error } = await getSupabase()
    .from("memorial_members")
    .select("*")
    .eq("memorial_id", memorialId);

  if (error) return [];
  return data ?? [];
}
