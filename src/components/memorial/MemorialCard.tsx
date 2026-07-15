import { Link } from "@tanstack/react-router";
import { Heart, Lock, Eye } from "lucide-react";
import type { Memorial } from "@/types/memorial";

interface Props {
  memorial: Memorial;
  onDelete?: (id: string) => void;
}

function formatYear(date: string | null): string {
  if (!date) return "";
  return new Date(date).getFullYear().toString();
}

export function MemorialCard({ memorial, onDelete }: Props) {
  const birthYear = formatYear(memorial.birth_date);
  const deathYear = formatYear(memorial.death_date);
  const lifespan = birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear || deathYear || "";

  return (
    <div className="group bg-card border border-border rounded-sm overflow-hidden hover:border-gold/50 transition-colors">
      <div className="relative aspect-[4/3] bg-background overflow-hidden">
        {memorial.cover_photo ? (
          <img
            src={memorial.cover_photo}
            alt={memorial.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-gold/30" />
          </div>
        )}
        {memorial.is_private && (
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-sm px-2 py-1 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Private</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl text-foreground leading-tight">{memorial.name}</h3>
        {lifespan && (
          <p className="mt-1 text-[11px] tracking-[0.25em] uppercase text-gold">{lifespan}</p>
        )}
        {memorial.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{memorial.bio}</p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Link
            to="/memorial/$slug"
            params={{ slug: memorial.slug }}
            className="flex-1 text-center bg-gradient-gold text-primary-foreground py-2 rounded-sm text-[10px] tracking-[0.25em] uppercase"
          >
            View
          </Link>
          <Link
            to="/memorial/$slug/edit"
            params={{ slug: memorial.slug }}
            className="flex-1 text-center border border-border text-foreground py-2 rounded-sm text-[10px] tracking-[0.25em] uppercase hover:border-gold transition-colors"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(memorial.id)}
              className="px-3 py-2 border border-border rounded-sm text-muted-foreground hover:border-red-500/50 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Eye className="w-3.5 h-3.5 rotate-45" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
