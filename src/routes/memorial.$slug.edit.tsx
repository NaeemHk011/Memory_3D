import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getMemorialBySlug,
  updateMemorial,
  deleteMemorial,
  uploadPhoto,
} from "@/lib/memorial-api";
import { FamilyInvite } from "@/components/memorial/FamilyInvite";
import type { Memorial } from "@/types/memorial";
import { Loader2, ArrowLeft, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/memorial/$slug/edit")({
  component: EditMemorialPage,
});

function EditMemorialPage() {
  const { slug } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [form, setForm] = useState({
    name: "",
    birth_date: "",
    death_date: "",
    bio: "",
    is_private: false,
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function load() {
      const m = await getMemorialBySlug(slug);
      if (!m || !user || m.owner_id !== user.id) {
        navigate({ to: "/dashboard" });
        return;
      }
      setMemorial(m);
      setForm({
        name: m.name,
        birth_date: m.birth_date ?? "",
        death_date: m.death_date ?? "",
        bio: m.bio ?? "",
        is_private: m.is_private,
      });
      if (m.cover_photo) setCoverPreview(m.cover_photo);
      setLoading(false);
    }
    if (user) load();
  }, [user, slug, navigate]);

  const handleCoverPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memorial) return;
    setSaving(true);
    setErrorMsg("");
    setSaved(false);

    try {
      let coverUrl = memorial.cover_photo;

      if (coverFile) {
        const media = await uploadPhoto(memorial.id, coverFile);
        coverUrl = media.url;
      }

      await updateMemorial(memorial.id, {
        name: form.name.trim(),
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        bio: form.bio || null,
        is_private: form.is_private,
        cover_photo: coverUrl,
      });

      setSaved(true);
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memorial) return;
    if (!confirm(`Permanently delete the memorial for "${memorial.name}"? This cannot be undone.`)) return;
    await deleteMemorial(memorial.id);
    navigate({ to: "/dashboard" });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/memorial/$slug"
            params={{ slug }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Edit Memorial</span>
            <h1 className="font-display text-4xl mt-1 text-foreground">{memorial?.name}</h1>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-7">
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
                  <p className="text-sm text-muted-foreground">Click to upload</p>
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
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
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
                Private memorial
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Only accessible via your share link
              </p>
            </div>
          </div>

          {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
          {saved && <p className="text-green-400 text-sm">Changes saved successfully.</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-gold text-primary-foreground py-3.5 rounded-sm text-[11px] tracking-[0.3em] uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>

        {/* Family Invite */}
        {memorial && (
          <div className="mt-12">
            <FamilyInvite memorialId={memorial.id} />
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-12 border border-red-900/30 rounded-sm p-6">
          <h3 className="text-sm font-medium text-red-400 mb-3">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Permanently delete this memorial and all its photos, stories, and data.
          </p>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 border border-red-900/50 text-red-400 px-5 py-2.5 rounded-sm text-[11px] tracking-[0.25em] uppercase hover:bg-red-900/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Memorial
          </button>
        </div>
      </div>
    </div>
  );
}
