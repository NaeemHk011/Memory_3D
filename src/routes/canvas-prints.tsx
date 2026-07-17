import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ImageEditor } from "@/components/shop/ImageEditor";
import { ChevronDown, ChevronUp, ArrowRight, Upload, Pencil, Loader2, CheckCircle, AlertCircle, ShoppingCart, X } from "lucide-react";
import { Canvas3DViewer } from "@/components/shop/Canvas3DViewer";
import imgFlexibility from "@/assets/canvas-flexibility.png";
import imgFrames from "@/assets/canvas-frames.png";
import imgHang from "@/assets/canvas-hang.png";
import bannerCanvas from "@/assets/banner-canvas.png";

export const Route = createFileRoute("/canvas-prints")({
  head: () => ({
    meta: [
      { title: "Custom Canvas Prints | Memory3D" },
      {
        name: "description",
        content:
          "Turn your favourite photos into stunning gallery-quality canvas prints. Customizable frames, ready to hang, and built to last.",
      },
      { property: "og:title", content: "Custom Canvas Prints – Memory3D" },
    ],
  }),
  component: CanvasPrintsPage,
});

const sizes = [
  { size: '8" × 8"',   label: "8x8",   off: "93% OFF", original: "$74.37",  price: "$5.20",  badge: "Great for Desks!", aspect: "aspect-square" },
  { size: '11" × 14"', label: "11x14", off: "87% OFF", original: "$111.58", price: "$14.49", badge: null, aspect: "aspect-[11/14]" },
  { size: '12" × 12"', label: "12x12", off: "87% OFF", original: "$111.58", price: "$14.49", badge: null, aspect: "aspect-square" },
  { size: '16" × 20"', label: "16x20", off: "87% OFF", original: "$158.08", price: "$20.53", badge: "Most Popular!", aspect: "aspect-[4/5]" },
  { size: '18" × 24"', label: "18x24", off: "87% OFF", original: "$185.97", price: "$24.16", badge: null, aspect: "aspect-[3/4]" },
  { size: '24" × 36"', label: "24x36", off: "87% OFF", original: "$260.41", price: "$33.83", badge: null, aspect: "aspect-[2/3]" },
  { size: '30" × 40"', label: "30x40", off: "87% OFF", original: "$348.70", price: "$45.30", badge: null, aspect: "aspect-[3/4]" },
];

const hangers = [
  { id: "none",    label: "No Hanger Set",     desc: "Canvas only      no hardware",          price: 0    },
  { id: "std",     label: "Standard Hanger",   desc: "Sawtooth + D-rings, ready to hang",  price: 4.99 },
  { id: "deluxe",  label: "Deluxe Wall Mount",  desc: "Premium floating mount system",      price: 9.99 },
];

const featureCards = [
  {
    img: imgFlexibility,
    title: "Flexibility To Customize",
    body: "Customize canvas prints effortlessly. Choose from frame types, upload your photos, and produce a stunning canvas print in just minutes.",
  },
  {
    img: imgFrames,
    title: "Customizable Frames",
    body: "Accentuate your canvas with a decorative frame for any style    from our extensive collection. Level up your canvas prints today.",
  },
  {
    img: imgHang,
    title: "Ready to Hang",
    body: "We want to make our customers' lives easier, which is why our canvas prints are delivered ready to hang with a sawtooth on the back.",
  },
];

const aboutItems = [
  {
    title: "Fade-Resistant Custom Canvas Prints",
    body: "Bring your favourite memories to life on premium canvas prints with sharp details, rich colour, and a quality finish. Our custom printing process precisely maps your images onto 100% poly-cotton fabric using archival-grade inks that resist fading for decades.",
  },
  {
    title: "Sizes, Frames, and Finishes for Every Space",
    body: "Choose the canvas size, wrap, and frame style that best fits your home or office. Whether you want a simple personalized photo print or a bold statement piece, we'll help you create something truly yours.",
  },
  {
    title: "Quality Craftsmanship You Can Trust",
    body: "Every canvas print is produced by experienced professionals who focus on print quality, clean finishing, and long-lasting presentation. Your result is personalised wall décor that lasts for many years to come.",
  },
  {
    title: "Canvas Prints Online in Minutes",
    body: "Simply upload your photo, personalise, and preview your order in just a few steps. From family portraits to travel memories, custom canvas prints make it easy to display what matters most.",
  },
];

const productDetails = [
  {
    label: "Canvas Size",
    desc: "Our canvas prints are printed with a border of up to 1\" on each side, giving a clean gallery-wrapped appearance from every angle.",
  },
  {
    label: "Canvas Framing",
    desc: "Canvas prints are available with optional frames ranging from 1.25\" to 3\" depth    choose the profile that suits your wall and style.",
  },
  {
    label: "Gallery Quality",
    desc: "High-quality 100% virgin poly-cotton fabric that is highly fade-resistant and true-to-colour, ensuring your print looks as vibrant as the day it arrived.",
  },
];

const faqs = [
  {
    q: "How will my custom canvas prints hold up outdoors?",
    a: "Canvas prints are designed for indoor display. While our inks are fade-resistant, prolonged direct sun or moisture exposure can degrade the fabric and colour over time. We recommend indoor placement away from direct sunlight.",
  },
  {
    q: "How do I clean my canvas print?",
    a: "Use a soft, dry microfibre cloth to gently dust the surface. For stubborn spots, lightly dampen the cloth    never apply liquid directly to the canvas. Avoid harsh chemicals or abrasive materials.",
  },
  {
    q: "Will my finished canvas look like the image on my computer screen?",
    a: "We colour-calibrate every print to match your uploaded image as closely as possible. Screen colour profiles vary, so minor differences may occur, but our quality team reviews every order before it ships.",
  },
  {
    q: "Should I choose a Wall Mount, Wall Hanging System, or a standard frame?",
    a: "It depends on your wall type and aesthetic. Wall mounts give a modern floating look; a standard hanging system works with any wall; frames add a traditional, finished edge. All options are available at checkout.",
  },
  {
    q: "What is your turnaround time?",
    a: "Most canvas prints are produced and dispatched within 3–5 business days. Standard shipping delivers in 10–14 days. Expedited options are available at checkout.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gold shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-gold transition-colors" />
        )}
      </button>
      {open && <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

function CanvasConfigurator() {
  const [selectedSize,   setSelectedSize]   = useState(sizes[3]);
  const [selectedHanger, setSelectedHanger] = useState("none");
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);
  const [uploadedFile,   setUploadedFile]   = useState<File | null>(null);
  const [showEditor,     setShowEditor]     = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status,   setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const basePrice   = parseFloat(selectedSize.price.replace("$", ""));
  const hangerPrice = hangers.find((h) => h.id === selectedHanger)?.price ?? 0;
  const totalPrice  = (basePrice + hangerPrice).toFixed(2);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleOrder = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const photoBase64 = previewUrl?.startsWith("data:")
        ? previewUrl
        : uploadedFile ? await toBase64(uploadedFile) : null;
      const hanger = hangers.find((h) => h.id === selectedHanger);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          cartItems: [
            { shapeLabel: "Canvas Print", sizeLabel: selectedSize.size, price: basePrice },
            ...(hanger && hanger.price > 0 ? [{ shapeLabel: hanger.label, sizeLabel: "", price: hanger.price }] : []),
          ],
          totalPrice: parseFloat(totalPrice),
          photoBase64,
          photoName: uploadedFile?.name || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Order submission failed");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const resetPhoto = () => {
    setPreviewUrl(null);
    setUploadedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="w-16 h-16 text-gold mb-6" />
        <h2 className="font-display text-4xl text-foreground mb-3">Order Received!</h2>
        <p className="text-muted-foreground max-w-sm">
          Thank you! We've received your canvas print order. Our team will be in touch within 24 hours.
        </p>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "" }); }}
          className="mt-8 text-[11px] tracking-[0.2em] uppercase text-gold hover:underline font-medium"
        >
          Place another order
        </button>
      </div>
    );
  }

  const canSubmit = !!(form.name && form.email && form.phone && previewUrl);

  return (
    <div className="grid lg:grid-cols-[1fr_520px] gap-10 items-start">

      {/* ══ LEFT: Config ══ */}
      <div className="space-y-8">

        {/* Step 1      Format */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-gold text-black text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
            <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-foreground">Choose Format</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-4 pb-2 text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-bold border-b border-border">
            <span>Format</span>
            <span className="text-right">Original</span>
            <span className="text-right">Price</span>
            <span className="text-right">Saving</span>
          </div>

          <div className="divide-y divide-border">
            {sizes.map((s) => {
              const active = selectedSize.label === s.label;
              return (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center px-4 py-3.5 transition-all text-left ${
                    active ? "bg-gold/8 border-l-2 border-l-gold" : "hover:bg-card/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? "border-gold" : "border-border"}`}>
                      {active && <span className="w-2 h-2 rounded-full bg-gold block" />}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{s.size}</span>
                    {s.badge && (
                      <span className="text-[9px] tracking-[0.1em] uppercase font-bold px-2 py-0.5 bg-gold text-black rounded-full">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground line-through text-right">{s.original}</span>
                  <span className="text-sm font-bold text-gold text-right">{s.price}</span>
                  <span className="text-[9px] font-bold text-gold/80 text-right">{s.off}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2      Hanger */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-gold text-black text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
            <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-foreground">Choose Hanger Set</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {hangers.map((h) => {
              const active = selectedHanger === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHanger(h.id)}
                  className={`flex flex-col items-start p-4 rounded-sm border transition-all text-left ${
                    active
                      ? "border-gold bg-gold/8 shadow-[0_0_0_1px_oklch(0.62_0.14_79/0.3)]"
                      : "border-border bg-card hover:border-gold/40"
                  }`}
                >
                  {/* Mini icon block */}
                  <div className={`w-10 h-10 rounded mb-3 flex items-center justify-center text-lg ${active ? "bg-gold/20" : "bg-muted/60"}`}>
                    {h.id === "none" ? "🚫" : h.id === "std" ? "🔩" : "🖼️"}
                  </div>
                  <p className={`text-[11px] font-bold tracking-wide mb-1 ${active ? "text-gold" : "text-foreground"}`}>{h.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug mb-2">{h.desc}</p>
                  <p className={`text-[11px] font-bold ${active ? "text-gold" : "text-muted-foreground"}`}>
                    {h.price === 0 ? "Free" : `+$${h.price.toFixed(2)}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3      Summary */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-6 rounded-full bg-gold text-black text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
            <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-foreground">Summary</p>
          </div>
          <div className="bg-card border border-border rounded-sm divide-y divide-border">
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Product</span>
              <span className="text-sm font-semibold text-foreground">Canvas Print</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Format</span>
              <span className="text-sm font-semibold text-foreground">{selectedSize.size}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Hanger</span>
              <span className="text-sm font-semibold text-foreground">{hangers.find((h) => h.id === selectedHanger)?.label}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-4">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Price</span>
              <span className="font-display text-2xl text-gold font-bold">${totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT: Preview + Edit + Form + Order ══ */}
      <div className="space-y-5 lg:sticky lg:top-20">

        {/* Image preview */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">

          {/* 3D preview      always on */}
          {previewUrl ? (
            <div
              className="relative"
              style={{ height: 520, background: "linear-gradient(160deg,#1a1410 0%,#231c14 60%,#1a1410 100%)" }}
            >
              <Canvas3DViewer photoUrl={previewUrl} sizeLabel={selectedSize.label} />
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[9px] tracking-[0.2em] uppercase text-white/30 pointer-events-none select-none"
                style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", whiteSpace: "nowrap" }}
              >
                Drag to rotate
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-gold transition-colors p-8 cursor-pointer"
              style={{ height: 520 }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-[12px] tracking-[0.2em] uppercase font-semibold text-center">
                Click to upload your photo
              </p>
              <p className="text-[11px] text-muted-foreground text-center">
                JPG, PNG or WEBP · Max 10 MB
              </p>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-t border-border bg-background/50">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] tracking-wide uppercase font-bold text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
            {previewUrl && (
              <>
                <button
                  onClick={() => setShowEditor(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-[10px] tracking-wide uppercase font-bold text-gold border border-gold/30 hover:bg-gold/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Photo
                </button>
                <button
                  onClick={resetPhoto}
                  className="ml-auto flex items-center gap-1 px-2 py-2 rounded text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-sm">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">Total Price</p>
            <p className="text-[10px] text-muted-foreground">{selectedSize.size} · {hangers.find(h=>h.id===selectedHanger)?.label}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl text-gold font-bold">${totalPrice}</p>
            <p className="text-[10px] text-muted-foreground line-through">{selectedSize.original}</p>
          </div>
        </div>

        {/* Customer form */}
        <div className="bg-card border border-border rounded-sm p-5 space-y-4">
          <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold">Your Details</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Full Name *</label>
              <input
                type="text" placeholder="Your full name" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Email *</label>
                <input
                  type="email" placeholder="you@email.com" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Phone *</label>
                <input
                  type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-[11px] uppercase tracking-wider">{errorMsg}</p>
          </div>
        )}

        {/* Order button */}
        <button
          onClick={handleOrder}
          disabled={!canSubmit || status === "loading"}
          className="w-full inline-flex items-center justify-center gap-3 bg-gradient-gold text-black py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold font-bold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Order Now · ${totalPrice}</>
          )}
        </button>

        {!previewUrl && (
          <p className="text-[10px] text-center text-amber-500/80 tracking-wider">
            Upload a photo to place your order
          </p>
        )}
        <p className="text-[10px] text-center text-muted-foreground tracking-wider">
          No payment taken at this stage      we'll confirm and follow up within 24 hours.
        </p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {showEditor && previewUrl && (
        <ImageEditor
          imageUrl={previewUrl}
          onClose={() => setShowEditor(false)}
          onSave={(base64) => {
            setPreviewUrl(base64);
            setUploadedFile(null);
            setShowEditor(false);
          }}
        />
      )}
    </div>
  );
}

function CanvasPrintsPage() {
  return (
    <div className="bg-background">

      {/* ══════════ BANNER ══════════ */}
      <section className="relative h-[80vh] min-h-[520px] flex items-end overflow-hidden">
        <img
          src={bannerCanvas}
          alt="Canvas Prints"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-800/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-14 w-full" style={{ paddingTop: "102px" }}>
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              Custom Canvas Prints
            </span>
            <h1 className="font-display text-5xl md:text-7xl mt-3 leading-[0.95] text-white">
              Create Your Own <br />
              <em className="text-gradient-gold not-italic">Canvas Print</em>
            </h1>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/80">
              {["Stunning Canvas Prints", "Premium Quality Canvas", "Free Shipping"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ══════════ CONFIGURATOR ══════════ */}
      <section className="py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal>
            <CanvasConfigurator />
          </Reveal>
        </div>
      </section>

      {/* ══════════ MAKE IT YOUR OWN ══════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-4">
              Make It Your Own
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
              Every canvas is made to order    tailored to your photo, your size, and your frame choice.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {featureCards.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-sm overflow-hidden hover:border-gold/30 transition-colors group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="py-28 bg-gradient-hero border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-16">
              About Our Canvas Prints
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {aboutItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="p-8 bg-card border border-border rounded-sm hover:border-gold/20 transition-colors h-full">
                  <h3 className="font-display text-xl text-foreground mb-4">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PRODUCT DETAILS ══════════ */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-14">
              Product Details
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              {productDetails.map((d, i) => (
                <div
                  key={d.label}
                  className={`grid sm:grid-cols-[200px_1fr] gap-4 px-8 py-6 border-b border-border/50 last:border-0 ${
                    i % 2 === 0 ? "bg-background/40" : ""
                  }`}
                >
                  <span className="text-[11px] tracking-[0.2em] uppercase font-bold text-gold self-start pt-0.5">
                    {d.label}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ FAQs ══════════ */}
      <section className="py-28 bg-gradient-hero border-t border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-14">
              Everything you need to know before ordering.
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="bg-card border border-border rounded-sm px-8">
              {faqs.map((f) => (
                <FAQItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-28 border-t border-border text-center">
        <Reveal>
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
            Ready to create?
          </span>
          <h2 className="font-display text-5xl md:text-7xl mt-4 max-w-3xl mx-auto leading-tight text-foreground px-6">
            Ready To Create <br />
            <em className="text-gradient-gold not-italic">Your Canvas?</em>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-md mx-auto">
            Upload your photo, pick your size and frame, and we'll handle the rest    delivered in premium packaging.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 bg-gradient-gold text-white px-10 py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold font-bold hover:opacity-90 transition"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

    </div>
  );
}
