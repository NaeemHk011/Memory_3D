import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMyMemorials, deleteMemorial } from "@/lib/memorial-api";
import { MemorialCard } from "@/components/memorial/MemorialCard";
import type { Memorial } from "@/types/memorial";
import { Plus, Loader2, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      getMyMemorials().then((data) => {
        setMemorials(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this memorial? This cannot be undone.")) return;
    await deleteMemorial(id);
    setMemorials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-12">
          <div>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold">My Memorials</span>
            <h1 className="font-display text-5xl mt-2 text-foreground">Your tributes</h1>
            <p className="mt-2 text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/memorial/create"
              className="flex items-center gap-2 bg-gradient-gold text-primary-foreground px-6 py-3 rounded-sm text-[11px] tracking-[0.25em] uppercase shadow-gold"
            >
              <Plus className="w-4 h-4" />
              New Memorial
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 border border-border text-muted-foreground px-4 py-3 rounded-sm text-[11px] tracking-[0.25em] uppercase hover:border-gold/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {memorials.length === 0 ? (
          <div className="text-center py-24 border border-border/40 rounded-sm">
            <p className="font-display text-2xl text-foreground/60">No memorials yet</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Create your first memorial to honour someone special.
            </p>
            <Link
              to="/memorial/create"
              className="mt-8 inline-flex items-center gap-2 bg-gradient-gold text-primary-foreground px-8 py-3 rounded-sm text-[11px] tracking-[0.3em] uppercase shadow-gold"
            >
              <Plus className="w-4 h-4" />
              Create Memorial
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memorials.map((m) => (
              <MemorialCard key={m.id} memorial={m} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
