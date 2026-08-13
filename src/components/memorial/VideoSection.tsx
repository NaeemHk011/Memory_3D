import { useState, useRef } from "react";
import { addVideoLink, deleteMedia } from "@/lib/memorial-api";
import type { MemorialMedia } from "@/types/memorial";
import { Film, Plus, X, Loader2, Link as LinkIcon, Check } from "lucide-react";

interface Props {
  memorialId: string;
  media: MemorialMedia[];
  canEdit: boolean;
  onUpdate: (media: MemorialMedia[]) => void;
}

/* ── Convert any YouTube / Vimeo URL to embed URL ─────────── */
function getEmbedUrl(url: string): { embed: string; isEmbed: boolean } {
  // YouTube: watch?v=ID or youtu.be/ID or shorts/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      embed: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      isEmbed: true,
    };
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      embed: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`,
      isEmbed: true,
    };
  }

  // Direct video URL (mp4, webm, etc.)
  return { embed: url, isEmbed: false };
}

export function VideoSection({ memorialId, media, canEdit, onUpdate }: Props) {
  const [showForm, setShowForm]   = useState(false);
  const [url, setUrl]             = useState("");
  const [caption, setCaption]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [urlError, setUrlError]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const videos = media.filter((m) => m.type === "video");

  const validateUrl = (val: string) => {
    try { new URL(val); return true; } catch { return false; }
  };

  const handleAdd = async () => {
    setUrlError("");
    if (!url.trim()) { setUrlError("Paste a YouTube, Vimeo, or video URL."); return; }
    if (!validateUrl(url.trim())) { setUrlError("Enter a valid URL."); return; }

    setSaving(true);
    try {
      const result = await addVideoLink(memorialId, url.trim(), caption.trim() || undefined);
      onUpdate([...media, result]);
      setUrl("");
      setCaption("");
      setShowForm(false);
    } catch {
      setUrlError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MemorialMedia) => {
    if (!confirm("Remove this video?")) return;
    await deleteMedia(item.id);
    onUpdate(media.filter((m) => m.id !== item.id));
  };

  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Gallery</span>
            <h2 className="font-display text-4xl mt-1 text-foreground">Videos</h2>
          </div>
          {canEdit && (
            <button
              onClick={() => { setShowForm((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-sm text-[11px] tracking-[0.25em] uppercase hover:border-gold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Video
            </button>
          )}
        </div>

        {/* Add video form */}
        {showForm && (
          <div className="mb-10 p-6 bg-card border border-border rounded-sm space-y-4">
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground font-bold">
              Add a Video
            </p>
            <div>
              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="url"
                  placeholder="Paste YouTube, Vimeo, or direct video URL…"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
                  className="flex-1 bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold outline-none transition-colors"
                />
              </div>
              {urlError && <p className="mt-1.5 ml-7 text-xs text-red-400">{urlError}</p>}
            </div>
            <input
              type="text"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold outline-none transition-colors"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-gold text-primary-foreground px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase rounded-sm shadow-gold disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Video
              </button>
              <button
                onClick={() => { setShowForm(false); setUrl(""); setCaption(""); setUrlError(""); }}
                className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Video grid */}
        {videos.length === 0 ? (
          <div
            className={`border border-dashed border-border rounded-sm py-20 text-center ${canEdit ? "cursor-pointer hover:border-gold/50 transition-colors" : ""}`}
            onClick={() => canEdit && setShowForm(true)}
          >
            <Film className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {canEdit ? "Add the first video" : "No videos yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video) => {
              const { embed, isEmbed } = getEmbedUrl(video.url);
              return (
                <div key={video.id} className="group relative rounded-sm overflow-hidden bg-card border border-border">
                  {/* Delete button */}
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(video)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-background/80 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                    >
                      <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}

                  {/* Video player */}
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    {isEmbed ? (
                      <iframe
                        src={embed}
                        title={video.caption ?? "Video"}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={embed}
                        controls
                        className="absolute inset-0 w-full h-full object-cover"
                        preload="metadata"
                      />
                    )}
                  </div>

                  {/* Caption */}
                  {video.caption && (
                    <div className="px-4 py-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{video.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
