import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getMemorialBySlug,
  getMemorialMedia,
  getStories,
  getMemorialDates,
} from "@/lib/memorial-api";
import { MemorialHero } from "@/components/memorial/MemorialHero";
import { PhotoGallery } from "@/components/memorial/PhotoGallery";
import { StoriesList } from "@/components/memorial/StoriesList";
import { TributeForm } from "@/components/memorial/TributeForm";
import { ImportantDates } from "@/components/memorial/ImportantDates";
import { QRCodeDisplay } from "@/components/memorial/QRCodeDisplay";
import type { Memorial, MemorialMedia, MemorialStory, MemorialDate } from "@/types/memorial";
import { Loader2, Share2, QrCode, ShoppingBag, Lock } from "lucide-react";

export const Route = createFileRoute("/memorial/$slug")({
  component: MemorialPage,
});

function MemorialPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();

  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [media, setMedia] = useState<MemorialMedia[]>([]);
  const [stories, setStories] = useState<MemorialStory[]>([]);
  const [dates, setDates] = useState<MemorialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = !!(user && memorial && user.id === memorial.owner_id);
  const canEdit = isOwner;

  useEffect(() => {
    async function load() {
      const m = await getMemorialBySlug(slug);
      if (!m) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setMemorial(m);
      const [mediaData, storiesData, datesData] = await Promise.all([
        getMemorialMedia(m.id),
        getStories(m.id),
        getMemorialDates(m.id),
      ]);
      setMedia(mediaData);
      setStories(storiesData);
      setDates(datesData);
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (notFound || !memorial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-6">
        <div>
          <p className="font-display text-5xl text-gradient-gold">404</p>
          <h1 className="mt-4 text-xl font-display text-foreground">Memorial not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This memorial may have been made private or removed.
          </p>
          <Link to="/" className="mt-8 inline-block text-[11px] tracking-widest uppercase text-gold hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const pageUrl = `${window.location.origin}/memorial/${memorial.slug}`;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <MemorialHero memorial={memorial} />

      {/* Action bar */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {memorial.is_private && (
              <span className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground border border-border rounded-sm px-2 py-1">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
            {isOwner && (
              <Link
                to="/memorial/$slug/edit"
                params={{ slug }}
                className="text-[10px] tracking-widest uppercase text-foreground border border-border rounded-sm px-3 py-1.5 hover:border-gold transition-colors"
              >
                Edit Memorial
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR((v) => !v)}
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-foreground transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-foreground transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Share"}
            </button>
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-gradient-gold text-primary-foreground text-[10px] tracking-widest uppercase rounded-sm px-4 py-1.5 shadow-gold"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Order Crystal
            </Link>
          </div>
        </div>
      </div>

      {/* QR Code panel */}
      {showQR && (
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
          <div className="flex justify-center">
            <QRCodeDisplay url={pageUrl} name={memorial.name} />
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      <PhotoGallery
        memorialId={memorial.id}
        media={media}
        canEdit={canEdit}
        onUpdate={setMedia}
      />

      {/* Important Dates */}
      <ImportantDates dates={dates} />

      {/* Stories */}
      <StoriesList stories={stories} />

      {/* Tribute Form */}
      <TributeForm
        memorialId={memorial.id}
        onSubmitted={(story) => setStories((prev) => [story, ...prev])}
      />

      {/* Order Crystal CTA */}
      <section className="py-24 bg-card/40">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold">Memory3D</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-foreground leading-tight">
            Hold their memory
            <br />
            in your hands.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Turn this memorial into a hand-crafted 3D crystal keepsake     engraved with their photo,
            lasting forever.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-3 bg-gradient-gold text-primary-foreground px-10 py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold"
          >
            <ShoppingBag className="w-4 h-4" />
            Order a Memorial Crystal
          </Link>
        </div>
      </section>
    </div>
  );
}
