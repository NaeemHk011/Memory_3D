import { useState } from "react";
import { submitStory } from "@/lib/memorial-api";
import type { MemorialStory } from "@/types/memorial";
import { Loader2, Heart } from "lucide-react";

interface Props {
  memorialId: string;
  onSubmitted: (story: MemorialStory) => void;
}

export function TributeForm({ memorialId, onSubmitted }: Props) {
  const [form, setForm] = useState({ author_name: "", title: "", content: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const story = await submitStory({ memorial_id: memorialId, ...form });
      onSubmitted(story);
      setStatus("success");
      setForm({ author_name: "", title: "", content: "" });
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to submit. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
        <p className="font-display text-2xl text-foreground">Thank you for sharing.</p>
        <p className="mt-2 text-sm text-muted-foreground">Your tribute has been added.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-[11px] tracking-widest uppercase text-gold hover:underline"
        >
          Leave another tribute
        </button>
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-2xl mx-auto px-6 lg:px-10">
        <div className="mb-10">
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Leave a Tribute</span>
          <h2 className="font-display text-4xl mt-1 text-foreground">Share a memory</h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Your words will be treasured by those who loved them.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Your Name <span className="text-gold">*</span>
            </label>
            <input
              required
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Title <span className="text-gold">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              placeholder="e.g. A light in our lives"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Your Story <span className="text-gold">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="Share a cherished memory or heartfelt message..."
            />
          </div>

          {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-gold text-primary-foreground py-3.5 rounded-sm text-[11px] tracking-[0.3em] uppercase disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
          >
            {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Tribute
          </button>
        </form>
      </div>
    </section>
  );
}
