import type { MemorialStory } from "@/types/memorial";
import { BookOpen } from "lucide-react";

interface Props {
  stories: MemorialStory[];
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function StoriesList({ stories }: Props) {
  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="mb-10">
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Tributes</span>
          <h2 className="font-display text-4xl mt-1 text-foreground">Stories &amp; Memories</h2>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Be the first to share a memory.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <article
                key={story.id}
                className="bg-card border border-border rounded-sm p-7 hover:border-gold/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-xl text-foreground">{story.title}</h3>
                    <p className="text-[11px] tracking-widest uppercase text-gold mt-1">
                      {story.author_name}
                    </p>
                  </div>
                  <time className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDate(story.created_at)}
                  </time>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {story.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
