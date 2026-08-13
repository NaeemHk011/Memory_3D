import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getMemorialBySlug, getMemorialMedia, getStories,
  getMemorialDates, uploadPhoto, addVideoLink, submitStory,
  uploadMemorialPhoto,
} from "@/lib/memorial-api";
import { QRCodeDisplay } from "@/components/memorial/QRCodeDisplay";
import type { Memorial, MemorialMedia, MemorialStory, MemorialDate } from "@/types/memorial";
import {
  Loader2, Share2, QrCode, ShoppingBag, Lock, Pencil,
  Heart, Camera, Video, BookOpen, Calendar, ThumbsUp,
  MoreHorizontal, Send, Image, Smile, ChevronDown, X,
  Cake, Clock,
} from "lucide-react";

export const Route = createFileRoute("/memorial/$slug")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  component: MemorialPage,
});

type Tab = "timeline" | "photos" | "videos" | "stories" | "dates" | "about";

const C = {
  bg: "#f0f2f5", card: "#ffffff", border: "#e4e6ea",
  text: "#1c1e21", muted: "#65676b", gold: "#b8962e",
  goldBg: "#fdf8ed", navy: "#1e2340", hover: "#f2f2f2",
  shadow: "0 1px 2px rgba(0,0,0,0.1)",
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, boxShadow: C.shadow, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {icon}
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 15, color: C.text, margin: 0, fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

function StoryCard({ story, name }: { story: MemorialStory; name: string }) {
  const [liked, setLiked] = useState(false);
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.goldBg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
          {story.author_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>
            {story.author_name}
            {story.relationship && <span style={{ fontWeight: 400, color: C.muted }}> · {story.relationship}</span>}
          </p>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>left a tribute for {name}</p>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>
          <MoreHorizontal style={{ width: 18, height: 18 }} />
        </button>
      </div>
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: "0 0 12px" }}>{story.content}</p>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: "flex", gap: 4 }}>
        <button onClick={() => setLiked(v => !v)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: liked ? C.gold : C.muted }}>
          <ThumbsUp style={{ width: 17, height: 17 }} /> {liked ? "Liked" : "Like"}
        </button>
        <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.muted }}>
          <Share2 style={{ width: 17, height: 17 }} /> Share
        </button>
      </div>
    </Card>
  );
}

// ── Hover photo button (cover & profile) ──────────────────────────────
function PhotoOverlay({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", transition: "opacity 0.2s" }}>
      <Camera style={{ width: 22, height: 22, color: "#fff" }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{label}</span>
    </div>
  );
}

export default function MemorialPage() {
  const { slug }  = Route.useParams();
  const { token } = Route.useSearch();
  const { user }  = useAuth();

  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef   = useRef<HTMLInputElement>(null);
  const photoRef   = useRef<HTMLInputElement>(null);

  const [memorial, setMemorial] = useState<Memorial | null>(null);
  const [media,    setMedia]    = useState<MemorialMedia[]>([]);
  const [stories,  setStories]  = useState<MemorialStory[]>([]);
  const [dates,    setDates]    = useState<MemorialDate[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab,      setTab]      = useState<Tab>("timeline");
  const [showQR,   setShowQR]   = useState(false);  // modal
  const [copied,   setCopied]   = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [hoverCover,   setHoverCover]   = useState(false);
  const [hoverProfile, setHoverProfile] = useState(false);
  const [uploading,    setUploading]    = useState<"cover" | "profile" | "photo" | null>(null);

  // Tribute form
  const [tribName, setTribName] = useState("");
  const [tribRel,  setTribRel]  = useState("");
  const [tribMsg,  setTribMsg]  = useState("");
  const [tribBusy, setTribBusy] = useState(false);

  // Video form
  const [vidUrl,  setVidUrl]  = useState("");
  const [vidCap,  setVidCap]  = useState("");
  const [vidBusy, setVidBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const m = await getMemorialBySlug(slug);
      if (!m) { setNotFound(true); setLoading(false); return; }
      setMemorial(m);
      const [md, st, dt] = await Promise.all([getMemorialMedia(m.id), getStories(m.id), getMemorialDates(m.id)]);
      setMedia(md); setStories(st); setDates(dt); setLoading(false);
    }
    load();
  }, [slug]);

  const isOwner        = !!(user && memorial && user.id === memorial.owner_id);
  const isPrivateGated = !!(memorial?.is_private && !isOwner && memorial.share_token !== token);

  const handleShare = async () => {
    let url = `${window.location.origin}/memorial/${memorial!.slug}`;
    if (memorial!.is_private) url += `?token=${memorial!.share_token}`;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !memorial) return;
    setUploading("cover");
    const updated = await uploadMemorialPhoto(memorial.id, "cover_photo", file);
    setMemorial(updated);
    setUploading(null);
    e.target.value = "";
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !memorial) return;
    setUploading("profile");
    const updated = await uploadMemorialPhoto(memorial.id, "profile_photo", file);
    setMemorial(updated);
    setUploading(null);
    e.target.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !memorial) return;
    setUploading("photo");
    const item = await uploadPhoto(memorial.id, file);
    setMedia(p => [...p, item]);
    setUploading(null);
    e.target.value = "";
  };

  const handleVideoAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memorial || !vidUrl.trim()) return;
    setVidBusy(true);
    const item = await addVideoLink(memorial.id, vidUrl.trim(), vidCap || undefined);
    setMedia(p => [...p, item]);
    setVidUrl(""); setVidCap(""); setVidBusy(false);
  };

  const handleTribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memorial || !tribMsg.trim() || !tribName.trim()) return;
    setTribBusy(true);
    const s = await submitStory({ memorial_id: memorial.id, author_name: tribName, relationship: tribRel, content: tribMsg });
    setStories(p => [s, ...p]);
    setTribName(""); setTribRel(""); setTribMsg(""); setTribBusy(false);
  };

  function getEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) { const v = u.searchParams.get("v"); return v ? `https://www.youtube.com/embed/${v}` : null; }
      if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
      if (u.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video${u.pathname}`;
    } catch {}
    return null;
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  /* ── Guards ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: C.gold }} />
    </div>
  );
  if (notFound || !memorial) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <Card style={{ padding: 40, textAlign: "center", maxWidth: 380 }}>
        <Heart style={{ width: 44, height: 44, color: C.gold, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>Memorial not found</h2>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>This page may have been removed or made private.</p>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: C.gold, fontSize: 14, fontWeight: 600 }}>← Back home</Link>
      </Card>
    </div>
  );
  if (isPrivateGated) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <Card style={{ padding: 40, textAlign: "center", maxWidth: 380 }}>
        <Lock style={{ width: 44, height: 44, color: C.gold, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{memorial.name}</h2>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>Private memorial. Ask the family for a share link.</p>
        <Link to="/" style={{ display: "inline-block", marginTop: 16, color: C.gold, fontSize: 14, fontWeight: 600 }}>← Back home</Link>
      </Card>
    </div>
  );

  const photos = media.filter(m => m.type === "photo");
  const videos = media.filter(m => m.type === "video");
  const birthYear = memorial.birth_date ? new Date(memorial.birth_date).getFullYear() : null;
  const deathYear = memorial.death_date ? new Date(memorial.death_date).getFullYear() : null;

  const TABS: { id: Tab; label: string }[] = [
    { id: "timeline", label: "Timeline" },
    { id: "photos",   label: `Photos${photos.length ? ` (${photos.length})` : ""}` },
    { id: "videos",   label: `Videos${videos.length ? ` (${videos.length})` : ""}` },
    { id: "stories",  label: `Tributes${stories.length ? ` (${stories.length})` : ""}` },
    { id: "dates",    label: "Dates" },
    { id: "about",    label: "About" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingTop: 68 }}>

      {/* ══ COVER + PROFILE HEADER ══ */}
      <div style={{ background: C.card, boxShadow: C.shadow }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Cover photo */}
          <div
            style={{ position: "relative", height: 380, background: "#c8cdd5", overflow: "hidden" }}
            onMouseEnter={() => isOwner && setHoverCover(true)}
            onMouseLeave={() => setHoverCover(false)}
          >
            {memorial.cover_photo
              ? <img src={memorial.cover_photo} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e2340 0%, #2d3561 100%)" }}>
                  <Heart style={{ width: 64, height: 64, color: C.gold, opacity: 0.4 }} />
                </div>
            }
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)", pointerEvents: "none" }} />

            {/* Cover hover overlay */}
            {isOwner && hoverCover && !uploading && (
              <PhotoOverlay
                label={memorial.cover_photo ? "Update cover photo" : "Add cover photo"}
                onClick={() => coverRef.current?.click()}
              />
            )}
            {uploading === "cover" && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 style={{ width: 36, height: 36, color: "#fff" }} className="animate-spin" />
              </div>
            )}
            <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
          </div>

          {/* Profile row */}
          <div style={{ padding: "0 32px", display: "flex", alignItems: "flex-end", gap: 20, marginTop: -42, position: "relative", zIndex: 2 }}>

            {/* Profile photo avatar */}
            <div
              style={{ position: "relative", width: 168, height: 168, borderRadius: "50%", border: "4px solid #fff", flexShrink: 0, overflow: "hidden", background: "#e4e6ea", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", cursor: isOwner ? "pointer" : "default" }}
              onMouseEnter={() => isOwner && setHoverProfile(true)}
              onMouseLeave={() => setHoverProfile(false)}
            >
              {memorial.profile_photo
                ? <img src={memorial.profile_photo} alt={memorial.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 800, color: C.gold, background: "#ede9df" }}>
                    {memorial.name.charAt(0)}
                  </div>
              }
              {/* Profile hover overlay */}
              {isOwner && hoverProfile && !uploading && (
                <PhotoOverlay
                  label={memorial.profile_photo ? "Update photo" : "Add photo"}
                  onClick={() => profileRef.current?.click()}
                />
              )}
              {uploading === "profile" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                  <Loader2 style={{ width: 32, height: 32, color: "#fff" }} className="animate-spin" />
                </div>
              )}
              <input ref={profileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileUpload} />
            </div>

            {/* Name + stats */}
            <div style={{ flex: 1, paddingBottom: 16 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: C.text, margin: 0 }}>{memorial.name}</h1>
              {(birthYear || deathYear) && (
                <p style={{ color: C.muted, fontSize: 16, margin: "4px 0 0", fontWeight: 500 }}>
                  {birthYear && deathYear ? `${birthYear} – ${deathYear}` : birthYear || deathYear}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 14, color: C.muted }}><strong style={{ color: C.text }}>{photos.length}</strong> photos</span>
                <span style={{ fontSize: 14, color: C.muted }}><strong style={{ color: C.text }}>{stories.length}</strong> tributes</span>
                <span style={{ fontSize: 14, color: C.muted }}><strong style={{ color: C.text }}>{videos.length}</strong> videos</span>
              </div>
            </div>

            {/* Action buttons — FIX: Edit uses proper Link with params, QR is just button */}
            <div style={{ display: "flex", gap: 8, paddingBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {isOwner && (
                <Link
                  to="/memorial/$slug/edit"
                  params={{ slug }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: C.hover, color: C.text, textDecoration: "none", border: `1px solid ${C.border}` }}
                >
                  <Pencil style={{ width: 15, height: 15 }} /> Edit Memorial
                </Link>
              )}
              <button
                onClick={handleShare}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: C.hover, color: C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}
              >
                <Share2 style={{ width: 15, height: 15 }} /> {copied ? "Copied!" : "Share"}
              </button>
              <button
                onClick={() => setShowQR(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: C.hover, color: C.text, border: `1px solid ${C.border}`, cursor: "pointer" }}
              >
                <QrCode style={{ width: 15, height: 15 }} /> QR Code
              </button>
              <Link
                to="/shop"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: C.gold, color: "#fff", textDecoration: "none" }}
              >
                <ShoppingBag style={{ width: 15, height: 15 }} /> Order Crystal
              </Link>
            </div>
          </div>

          {/* Tab strip */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "0 32px", display: "flex", gap: 2, overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "12px 16px", fontSize: 15, fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", color: tab === t.id ? C.gold : C.muted, borderBottom: tab === t.id ? `3px solid ${C.gold}` : "3px solid transparent" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ maxWidth: 1200, margin: "12px auto 48px", padding: "0 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* About */}
          <Card style={{ padding: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 12 }}>About</h2>
            {memorial.bio
              ? <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{memorial.bio}</p>
              : <p style={{ fontSize: 14, color: C.muted }}>No biography added yet.</p>
            }
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {memorial.birth_date && <Row icon={<Cake style={{ width: 18, height: 18, color: C.muted }} />} label="Born" value={fmtDate(memorial.birth_date)} />}
              {memorial.death_date && <Row icon={<Heart style={{ width: 18, height: 18, color: C.muted }} />} label="Passed" value={fmtDate(memorial.death_date)} />}
              {birthYear && deathYear && <Row icon={<Clock style={{ width: 18, height: 18, color: C.muted }} />} label="Age" value={`${deathYear - birthYear} years`} />}
              {memorial.is_private && <Row icon={<Lock style={{ width: 18, height: 18, color: C.muted }} />} label="Privacy" value="Private memorial" />}
            </div>
            {isOwner && (
              <Link to="/memorial/$slug/edit" params={{ slug }}
                style={{ display: "block", textAlign: "center", marginTop: 12, padding: "8px", background: C.hover, borderRadius: 8, fontSize: 14, fontWeight: 600, color: C.text, textDecoration: "none" }}>
                Edit details
              </Link>
            )}
          </Card>

          {/* Photos preview */}
          {photos.length > 0 && (
            <Card style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Photos</h2>
                <button onClick={() => setTab("photos")} style={{ fontSize: 14, fontWeight: 600, color: C.gold, background: "none", border: "none", cursor: "pointer" }}>See all</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
                {photos.slice(0, 9).map(p => (
                  <div key={p.id} onClick={() => setLightbox(p.url)}
                    style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 6, cursor: "pointer" }}>
                    <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dates */}
          {dates.length > 0 && (
            <Card style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 12 }}>Important Dates</h2>
              {dates.map(d => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.goldBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Calendar style={{ width: 16, height: 16, color: C.gold }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{d.label}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{fmtDate(d.date)}</p>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Order crystal */}
          <Card style={{ padding: 16, background: "linear-gradient(135deg,#1e2340,#2d3561)", border: "none" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.gold, marginBottom: 6 }}>Memory3D</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Hold their memory in your hands.</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>Hand-crafted 3D crystal keepsake, engraved with their photo.</p>
            <Link to="/shop" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.gold, color: "#fff", padding: 10, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <ShoppingBag style={{ width: 16, height: 16 }} /> Order a Crystal
            </Link>
          </Card>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* TIMELINE */}
          {tab === "timeline" && (
            <>
              <Card style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.goldBg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
                    {user ? user.email.charAt(0).toUpperCase() : "?"}
                  </div>
                  <button onClick={() => setTab("stories")}
                    style={{ flex: 1, textAlign: "left", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "10px 16px", fontSize: 15, color: C.muted, cursor: "pointer" }}>
                    Leave a tribute for {memorial.name}...
                  </button>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", gap: 4 }}>
                  {isOwner && (
                    <button onClick={() => photoRef.current?.click()}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#45bd62" }}>
                      <Image style={{ width: 18, height: 18 }} />
                      {uploading === "photo" ? "Uploading..." : "Photo"}
                    </button>
                  )}
                  {isOwner && (
                    <button onClick={() => setTab("videos")}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#f02849" }}>
                      <Video style={{ width: 18, height: 18 }} /> Video
                    </button>
                  )}
                  <button onClick={() => setTab("stories")}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.gold }}>
                    <Smile style={{ width: 18, height: 18 }} /> Tribute
                  </button>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleGalleryUpload} />
              </Card>

              {photos.length > 0 && (
                <Card style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>Recent Photos</p>
                    <button onClick={() => setTab("photos")} style={{ fontSize: 14, fontWeight: 600, color: C.gold, background: "none", border: "none", cursor: "pointer" }}>See all</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
                    {photos.slice(0, 6).map(p => (
                      <div key={p.id} onClick={() => setLightbox(p.url)} style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 8, cursor: "pointer" }}>
                        <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {stories.slice(0, 3).map(s => <StoryCard key={s.id} story={s} name={memorial.name} />)}

              {stories.length > 3 && (
                <button onClick={() => setTab("stories")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", boxShadow: C.shadow }}>
                  <ChevronDown style={{ width: 18, height: 18 }} /> See all {stories.length} tributes
                </button>
              )}

              {stories.length === 0 && photos.length === 0 && (
                <Card style={{ padding: 32, textAlign: "center" }}>
                  <Heart style={{ width: 40, height: 40, color: C.gold, opacity: 0.35, margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>No memories shared yet</p>
                  <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Be the first to add a photo or leave a tribute.</p>
                </Card>
              )}
            </>
          )}

          {/* PHOTOS */}
          {tab === "photos" && (
            <Card style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Photos ({photos.length})</h2>
                {isOwner && (
                  <button onClick={() => photoRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
                    <Image style={{ width: 16, height: 16 }} /> {uploading === "photo" ? "Uploading..." : "Add Photo"}
                  </button>
                )}
                <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleGalleryUpload} />
              </div>
              {photos.length === 0
                ? <p style={{ color: C.muted, fontSize: 14 }}>No photos yet.</p>
                : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                    {photos.map(p => (
                      <div key={p.id} onClick={() => setLightbox(p.url)} style={{ aspectRatio: "1", overflow: "hidden", borderRadius: 8, cursor: "pointer" }}>
                        <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
              }
            </Card>
          )}

          {/* VIDEOS */}
          {tab === "videos" && (
            <Card style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 16 }}>Videos ({videos.length})</h2>
              {isOwner && (
                <form onSubmit={handleVideoAdd} style={{ marginBottom: 20, background: C.bg, padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <input value={vidUrl} onChange={e => setVidUrl(e.target.value)} placeholder="YouTube or Vimeo URL"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: "#fff", marginBottom: 8, boxSizing: "border-box" }} />
                  <input value={vidCap} onChange={e => setVidCap(e.target.value)} placeholder="Caption (optional)"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, background: "#fff", marginBottom: 10, boxSizing: "border-box" }} />
                  <button type="submit" disabled={vidBusy || !vidUrl.trim()}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: vidBusy ? 0.6 : 1 }}>
                    {vidBusy ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Video style={{ width: 14, height: 14 }} />}
                    Add Video
                  </button>
                </form>
              )}
              {videos.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>No videos yet.</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {videos.map(v => {
                      const embed = getEmbedUrl(v.url);
                      return (
                        <div key={v.id}>
                          {embed ? <iframe src={embed} style={{ width: "100%", borderRadius: 10, border: "none" }} height={300} allowFullScreen />
                                 : <video src={v.url} controls style={{ width: "100%", borderRadius: 10 }} />}
                          {v.caption && <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>{v.caption}</p>}
                        </div>
                      );
                    })}
                  </div>
              }
            </Card>
          )}

          {/* TRIBUTES */}
          {tab === "stories" && (
            <>
              <Card style={{ padding: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14 }}>Leave a tribute</h2>
                <form onSubmit={handleTribute} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input value={tribName} onChange={e => setTribName(e.target.value)} placeholder="Your name *" required
                      style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, outline: "none" }} />
                    <input value={tribRel} onChange={e => setTribRel(e.target.value)} placeholder="Relationship (e.g. Friend)"
                      style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, outline: "none" }} />
                  </div>
                  <textarea value={tribMsg} onChange={e => setTribMsg(e.target.value)} placeholder={`Share a memory or tribute for ${memorial.name}...`} required rows={4}
                    style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, color: C.text, resize: "vertical", outline: "none", fontFamily: "inherit" }} />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={tribBusy || !tribMsg.trim() || !tribName.trim()}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", opacity: tribBusy ? 0.6 : 1 }}>
                      {tribBusy ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Send style={{ width: 14, height: 14 }} />}
                      Post tribute
                    </button>
                  </div>
                </form>
              </Card>
              {stories.map(s => <StoryCard key={s.id} story={s} name={memorial.name} />)}
              {stories.length === 0 && (
                <Card style={{ padding: 32, textAlign: "center" }}>
                  <BookOpen style={{ width: 36, height: 36, color: C.gold, opacity: 0.35, margin: "0 auto 10px" }} />
                  <p style={{ color: C.muted, fontSize: 15 }}>No tributes yet — be the first.</p>
                </Card>
              )}
            </>
          )}

          {/* DATES */}
          {tab === "dates" && (
            <Card style={{ padding: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 16 }}>Important Dates</h2>
              {dates.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>No dates added yet.</p>
                : dates.map(d => (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: C.goldBg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Calendar style={{ width: 20, height: 20, color: C.gold }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>{d.label}</p>
                      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{fmtDate(d.date)}</p>
                    </div>
                  </div>
                ))
              }
            </Card>
          )}

          {/* ABOUT */}
          {tab === "about" && (
            <Card style={{ padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 20 }}>About {memorial.name}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {memorial.bio && (
                  <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 8 }}>Biography</p>
                    <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7 }}>{memorial.bio}</p>
                  </div>
                )}
                {memorial.birth_date && <Row icon={<Cake style={{ width: 18, height: 18, color: C.muted }} />} label="Born" value={fmtDate(memorial.birth_date)} />}
                {memorial.death_date && <Row icon={<Heart style={{ width: 18, height: 18, color: C.muted }} />} label="Passed" value={fmtDate(memorial.death_date)} />}
                {birthYear && deathYear && <Row icon={<Clock style={{ width: 18, height: 18, color: C.muted }} />} label="Age" value={`${deathYear - birthYear} years`} />}
                {isOwner && (
                  <Link to="/memorial/$slug/edit" params={{ slug }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "10px 16px", background: C.hover, borderRadius: 8, fontSize: 14, fontWeight: 600, color: C.text, textDecoration: "none" }}>
                    <Pencil style={{ width: 15, height: 15 }} /> Edit details
                  </Link>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ══ QR MODAL ══ */}
      {showQR && (
        <div
          onClick={() => setShowQR(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%", position: "relative" }}>
            <button onClick={() => setShowQR(false)}
              style={{ position: "absolute", top: 16, right: 16, background: C.hover, border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X style={{ width: 18, height: 18, color: C.text }} />
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>QR Code</h3>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Share this code so others can visit the memorial.</p>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <QRCodeDisplay url={`${window.location.origin}/memorial/${memorial.slug}`} name={memorial.name} />
            </div>
            <button onClick={handleShare}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.gold, color: "#fff", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}>
              <Share2 style={{ width: 16, height: 16 }} />
              {copied ? "Link copied!" : "Copy share link"}
            </button>
          </div>
        </div>
      )}

      {/* ══ PHOTO LIGHTBOX ══ */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
        </div>
      )}
    </div>
  );
}
