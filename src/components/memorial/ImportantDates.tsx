import type { MemorialDate } from "@/types/memorial";
import { Calendar } from "lucide-react";

interface Props {
  dates: MemorialDate[];
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ImportantDates({ dates }: Props) {
  if (dates.length === 0) return null;

  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="mb-10">
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Timeline</span>
          <h2 className="font-display text-4xl mt-1 text-foreground">Important Dates</h2>
        </div>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {dates.map((d) => (
              <div key={d.id} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                </div>
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-gold">{d.label}</p>
                  <p className="mt-0.5 text-foreground font-light">{formatDate(d.date)}</p>
                  {d.note && (
                    <p className="mt-1 text-sm text-muted-foreground">{d.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
