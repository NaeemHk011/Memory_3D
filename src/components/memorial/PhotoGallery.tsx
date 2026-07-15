import { useState, useRef } from "react";
import { uploadPhoto, deleteMedia } from "@/lib/memorial-api";
import type { MemorialMedia } from "@/types/memorial";
import { Upload, X, ZoomIn, Loader2, ImageIcon } from "lucide-react";

interface Props {
  memorialId: string;
  media: MemorialMedia[];
  canEdit: boolean;
  onUpdate: (media: MemorialMedia[]) => void;
}

export function PhotoGallery({ memorialId, media, canEdit, onUpdate }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const photos = media.filter((m) => m.type === "photo");

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    const newMedia: MemorialMedia[] = [];

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID();
      setProgress((p) => ({ ...p, [id]: 0 }));
      try {
        const result = await uploadPhoto(memorialId, file);
        newMedia.push(result);
        setProgress((p) => ({ ...p, [id]: 100 }));
      } catch {
        setProgress((p) => {
          const next = { ...p };
          delete next[id];
          return next;
        });
      }
    }

    onUpdate([...media, ...newMedia]);
    setUploading(false);
    setProgress({});
  };

  const handleDelete = async (item: MemorialMedia) => {
    if (!confirm("Remove this photo?")) return;
    await deleteMedia(item.id);
    onUpdate(media.filter((m) => m.id !== item.id));
  };

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Gallery</span>
            <h2 className="font-display text-4xl mt-1 text-foreground">Photos</h2>
          </div>
          {canEdit && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-sm text-[11px] tracking-[0.25em] uppercase hover:border-gold transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Add Photos
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {photos.length === 0 ? (
          <div
            className={`border border-dashed border-border rounded-sm py-20 text-center ${canEdit ? "cursor-pointer hover:border-gold/50 transition-colors" : ""}`}
            onClick={() => canEdit && fileRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {canEdit ? "Click to add the first photo" : "No photos yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-sm">
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setLightbox(photo.url)}
                    className="p-2 bg-background/80 rounded-sm"
                  >
                    <ZoomIn className="w-4 h-4 text-foreground" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => handleDelete(photo)}
                      className="p-2 bg-background/80 rounded-sm"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/70 px-3 py-2">
                    <p className="text-xs text-foreground truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 border border-border rounded-sm text-muted-foreground hover:border-gold transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
