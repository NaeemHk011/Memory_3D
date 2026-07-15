import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createMemorial } from "@/lib/memorial-api";
import { getSupabase } from "@/lib/supabase";
import { Loader2, Upload, Heart } from "lucide-react";

export const Route = createFileRoute("/memorial/create")({
  component: CreateMemorialPage,
});

function CreateMemorialPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    death_date: "",
    bio: "",
    is_private: false,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!authLoading && !user) {
    navigate({ to: "/login" });
    return null;
  }

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      let coverUrl: string | undefined;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `covers/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await getSupabase().storage
          .from("memorial-covers")
          .upload(path, coverFile, { cacheControl: "3600" });

        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = getSupabase().storage
          .from("memorial-covers")
          .getPublicUrl(path);
        coverUrl = publicUrl;
      }

      const memorial = await createMemorial({
        name: form.name.trim(),
        birth_date: form.birth_date || undefined,
        death_date: form.death_date || undefined,
        bio: form.bio || undefined,
        cover_photo: coverUrl,
        is_private: form.is_private,
      });

      navigate({ to: "/memorial/$slug", params: { slug: memorial.slug } });
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">New Memorial</span>
          <h1 className="font-display text-5xl mt-2 text-foreground leading-tight">
            Create a tribute
          </h1>
          <p className="mt-3 text-muted-foreground">
            Build a lasting digital space to celebrate a life lived.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Cover Photo */}
          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Cover Photo
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer border border-dashed border-border rounded-sm overflow-hidden aspect-[16/7] flex items-center justify-center hover:border-gold/50 transition-colors group"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-gold transition-colors" />
                  <p className="text-sm text-muted-foreground">Click to upload cover photo</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverPick} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Full Name <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              placeholder="Enter their full name"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                Date of Passing
              </label>
              <input
                type="date"
                value={form.death_date}
                onChange={(e) => setForm({ ...form, death_date: e.target.value })}
                className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Life Story / Bio
            </label>
            <textarea
              rows={5}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="Share a few words about who they were..."
            />
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-3 py-4 border-t border-border">
            <input
              type="checkbox"
              id="private"
              checked={form.is_private}
              onChange={(e) => setForm({ ...form, is_private: e.target.checked })}
              className="w-4 h-4 accent-gold"
            />
            <div>
              <label htmlFor="private" className="text-sm text-foreground cursor-pointer">
                Make this memorial private
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Only people with your share link can view it
              </p>
            </div>
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-gold text-primary-foreground py-4 rounded-sm text-[11px] tracking-[0.35em] uppercase font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            {status === "loading" ? "Creating..." : "Create Memorial"}
          </button>
        </form>
      </div>
    </div>
  );
}
