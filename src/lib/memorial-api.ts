import { apiFetch, apiPost, apiUpload } from "./api-client";
import type { Memorial, MemorialMedia, MemorialStory, MemorialDate, MemorialMember } from "@/types/memorial";

// ── Memorials ──────────────────────────────────────────────

export async function createMemorial(data: {
  name: string;
  birth_date?: string;
  death_date?: string;
  bio?: string;
  cover_photo?: string;
  is_private?: boolean;
}): Promise<Memorial> {
  return apiPost<Memorial>("/memorials/create.php", data);
}

export async function getMemorialBySlug(slug: string): Promise<Memorial | null> {
  try {
    return await apiFetch<Memorial>(`/memorials/get.php?slug=${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getMyMemorials(): Promise<Memorial[]> {
  try {
    return await apiFetch<Memorial[]>("/memorials/list.php");
  } catch {
    return [];
  }
}

export async function updateMemorial(id: string, updates: Partial<Memorial>): Promise<Memorial> {
  return apiPost<Memorial>("/memorials/update.php", { id, ...updates });
}

export async function deleteMemorial(id: string): Promise<void> {
  await apiPost("/memorials/delete.php", { id });
}

// ── Media ──────────────────────────────────────────────────

export async function uploadMemorialPhoto(
  memorialId: string,
  field: "cover_photo" | "profile_photo",
  file: File
): Promise<Memorial> {
  const fd = new FormData();
  fd.append("memorial_id", memorialId);
  fd.append("file", file);
  const media = await apiUpload<{ url: string }>("/media/upload.php", fd);
  return apiPost<Memorial>("/memorials/update.php", { id: memorialId, [field]: media.url });
}

export async function uploadPhoto(
  memorialId: string,
  file: File,
  caption?: string
): Promise<MemorialMedia> {
  const fd = new FormData();
  fd.append("memorial_id", memorialId);
  fd.append("file", file);
  if (caption) fd.append("caption", caption);
  return apiUpload<MemorialMedia>("/media/upload.php", fd);
}

export async function getMemorialMedia(memorialId: string): Promise<MemorialMedia[]> {
  try {
    return await apiFetch<MemorialMedia[]>(
      `/media/list.php?memorial_id=${encodeURIComponent(memorialId)}`
    );
  } catch {
    return [];
  }
}

export async function deleteMedia(id: string): Promise<void> {
  await apiPost("/media/delete.php", { id });
}

export async function addVideoLink(
  memorialId: string,
  url: string,
  caption?: string
): Promise<MemorialMedia> {
  return apiPost<MemorialMedia>("/media/add-video.php", {
    memorial_id: memorialId,
    url,
    caption: caption ?? null,
  });
}

// ── Stories ────────────────────────────────────────────────

export async function submitStory(data: {
  memorial_id: string;
  author_name: string;
  relationship?: string;
  content: string;
}): Promise<MemorialStory> {
  return apiPost<MemorialStory>("/stories/submit.php", data);
}

export async function getStories(memorialId: string): Promise<MemorialStory[]> {
  try {
    return await apiFetch<MemorialStory[]>(
      `/stories/list.php?memorial_id=${encodeURIComponent(memorialId)}`
    );
  } catch {
    return [];
  }
}

// ── Dates ──────────────────────────────────────────────────

export async function getMemorialDates(memorialId: string): Promise<MemorialDate[]> {
  try {
    return await apiFetch<MemorialDate[]>(
      `/dates/list.php?memorial_id=${encodeURIComponent(memorialId)}`
    );
  } catch {
    return [];
  }
}

export async function addMemorialDate(data: {
  memorial_id: string;
  label: string;
  date: string;
}): Promise<MemorialDate> {
  return apiPost<MemorialDate>("/dates/add.php", data);
}

export async function deleteMemorialDate(id: string): Promise<void> {
  await apiPost("/dates/delete.php", { id });
}

// ── Family Members (stubs — invite flow not yet in PHP backend) ──────

export async function getMemorialMembers(_memorialId: string): Promise<MemorialMember[]> {
  return [];
}

export async function inviteFamilyMember(
  _memorialId: string,
  _email: string,
  _role: "editor" | "viewer" = "viewer"
): Promise<void> {
  throw new Error("Family invite is not yet available.");
}
