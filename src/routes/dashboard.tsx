import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMyMemorials, deleteMemorial } from "@/lib/memorial-api";
import type { Memorial } from "@/types/memorial";
import {
  Plus, Loader2, Heart, Lock, Pencil, Trash2, Eye,
  User, Settings, LogOut, Calendar
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Tab = "memorials" | "settings";

function fmt(date: string | null) {
  if (!date) return "";
  return new Date(date).getFullYear().toString();
}

function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<Tab>("memorials");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      getMyMemorials().then((data) => { setMemorials(data); setLoading(false); });
    }
  }, [user]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteMemorial(id);
    setMemorials((prev) => prev.filter((m) => m.id !== id));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ef" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#b8962e" }} />
      </div>
    );
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";
  const emailName = user?.email?.split("@")[0] ?? "";
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, " ");

  return (
    <div className="min-h-screen pt-[68px]" style={{ background: "#f5f3ef" }}>

      {/* ── Profile header card ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e9e5de" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold"
                style={{ background: "#ede9df", color: "#b8962e" }}
              >
                {initials}
              </div>
              <div
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "#b8962e" }}
              >
                <Pencil className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold" style={{ color: "#1a1a1a" }}>{displayName}</h1>
              <p className="mt-0.5 text-sm" style={{ color: "#6b6560" }}>
                Email: <span style={{ color: "#333" }}>{user?.email}</span>
              </p>
              {user?.created_at && (
                <p className="mt-0.5 text-sm flex items-center gap-1.5" style={{ color: "#6b6560" }}>
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                </p>
              )}
            </div>

            {/* Welcome box */}
            <div
              className="rounded-xl p-4 max-w-xs text-sm leading-relaxed"
              style={{ background: "#fdf8ed", border: "1px solid #e8d99a", color: "#6b6560" }}
            >
              <p className="font-semibold mb-1" style={{ color: "#1a1a1a" }}>Welcome back!</p>
              Thank you for keeping the memories of your loved ones alive. We are honoured to be part of your journey.
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 border-b" style={{ borderColor: "#e9e5de" }}>
            {(["memorials", "settings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="pb-3 text-sm font-medium capitalize transition-colors"
                style={{
                  color: tab === t ? "#b8962e" : "#9d9590",
                  borderBottom: tab === t ? "2px solid #b8962e" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t === "memorials" ? "My Memorials" : "Settings"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ══ Memorials tab ══ */}
        {tab === "memorials" && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3">
                {["Active", "Archived"].map((l) => (
                  <button
                    key={l}
                    className="text-sm font-medium px-1 pb-0.5 transition-colors"
                    style={{ color: l === "Active" ? "#b8962e" : "#9d9590", borderBottom: l === "Active" ? "2px solid #b8962e" : "2px solid transparent" }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Link
                to="/memorial/create"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#1e2340" }}
              >
                <Plus className="w-4 h-4" />
                Create a new memorial
              </Link>
            </div>

            {/* Empty state */}
            {memorials.length === 0 ? (
              <div
                className="rounded-2xl p-16 text-center"
                style={{ background: "#fff", border: "1px solid #e9e5de" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "#fdf8ed" }}
                >
                  <Heart className="w-7 h-7" style={{ color: "#b8962e" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a1a" }}>No memorials yet</h3>
                <p className="text-sm mb-7" style={{ color: "#9d9590" }}>
                  Create your first memorial to celebrate someone special.
                </p>
                <Link
                  to="/memorial/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "#1e2340" }}
                >
                  <Plus className="w-4 h-4" />
                  Create a memorial
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {memorials.map((m) => (
                  <MemorialCard key={m.id} memorial={m} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ Settings tab ══ */}
        {tab === "settings" && (
          <div
            className="rounded-2xl p-8 max-w-lg"
            style={{ background: "#fff", border: "1px solid #e9e5de" }}
          >
            <h2 className="text-lg font-semibold mb-6" style={{ color: "#1a1a1a" }}>Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-widest" style={{ color: "#9d9590" }}>Email</label>
                <p className="mt-1 text-sm font-medium" style={{ color: "#1a1a1a" }}>{user?.email}</p>
              </div>
              <div style={{ borderTop: "1px solid #f0ece4", paddingTop: "1.25rem" }}>
                <button
                  onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                  className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "#c0392b" }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Memorial Card ─────────────────────────────────────────────────────────────
function MemorialCard({
  memorial,
  onDelete,
}: {
  memorial: Memorial;
  onDelete: (id: string, name: string) => void;
}) {
  const birth = fmt(memorial.birth_date);
  const death = fmt(memorial.death_date);
  const span  = birth && death ? `${birth} – ${death}` : birth || death || "";

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group transition-shadow hover:shadow-md"
      style={{ background: "#fff", border: "1px solid #e9e5de" }}
    >
      {/* Cover */}
      <div className="relative" style={{ aspectRatio: "4/3", background: "#f0ece4" }}>
        {memorial.cover_photo ? (
          <img
            src={memorial.cover_photo}
            alt={memorial.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-10 h-10" style={{ color: "#d4b96a" }} />
          </div>
        )}
        {memorial.is_private && (
          <span
            className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.9)", color: "#6b6560" }}
          >
            <Lock className="w-3 h-3" /> Private
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-base leading-snug" style={{ color: "#1a1a1a" }}>
          {memorial.name}
        </h3>
        {span && (
          <p className="mt-0.5 text-xs font-medium" style={{ color: "#b8962e" }}>{span}</p>
        )}
        {memorial.bio && (
          <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: "#7a756e" }}>
            {memorial.bio}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid #f0ece4" }}>
          <Link
            to="/memorial/$slug"
            params={{ slug: memorial.slug }}
            className="flex-1 text-center py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#b8962e" }}
          >
            View
          </Link>
          <Link
            to="/memorial/$slug/edit"
            params={{ slug: memorial.slug }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-gray-100"
            style={{ color: "#6b6560", border: "1px solid #e9e5de" }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(memorial.id, memorial.name)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-red-50"
            style={{ border: "1px solid #e9e5de", color: "#c0392b" }}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
