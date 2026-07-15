import { Heart } from "lucide-react";
import type { Memorial } from "@/types/memorial";

interface Props {
  memorial: Memorial;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MemorialHero({ memorial }: Props) {
  const birthDate = formatDate(memorial.birth_date);
  const deathDate = formatDate(memorial.death_date);

  return (
    <section className="relative min-h-[80vh] flex items-end pb-20 pt-32">
      {memorial.cover_photo ? (
        <>
          <div className="absolute inset-0">
            <img
              src={memorial.cover_photo}
              alt={memorial.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/30" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
      )}

      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 w-full">
        <div className="flex items-center gap-2 mb-5">
          <Heart className="w-4 h-4 text-gold" />
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">
            In Loving Memory
          </span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl text-foreground leading-[0.95]">
          {memorial.name}
        </h1>

        {(birthDate || deathDate) && (
          <p className="mt-4 text-xl text-muted-foreground font-light tracking-wide">
            {birthDate && <span>{birthDate}</span>}
            {birthDate && deathDate && <span className="mx-3 text-gold">·</span>}
            {deathDate && <span>{deathDate}</span>}
          </p>
        )}

        {memorial.bio && (
          <p className="mt-6 text-base md:text-lg text-foreground/80 max-w-2xl font-light leading-relaxed">
            {memorial.bio}
          </p>
        )}
      </div>
    </section>
  );
}
