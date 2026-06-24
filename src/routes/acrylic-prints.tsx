import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ChevronDown, ChevronUp, ArrowRight, Upload, RotateCcw, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import bannerAcrylic from "@/assets/banner-acrylic.png";
import imgGlossy from "@/assets/acrylic-glossy.png";
import imgHang from "@/assets/acrylic-hang.png";
import imgQuality from "@/assets/acrylic-quality.png";

export const Route = createFileRoute("/acrylic-prints")({
  head: () => ({
    meta: [
      { title: "Custom Acrylic Prints | Memory3D" },
      {
        name: "description",
        content:
          "Turn your favourite photos into stunning acrylic prints. Glossy finish, ready to hang, and crafted for lasting clarity.",
      },
      { property: "og:title", content: "Custom Acrylic Prints – Memory3D" },
    ],
  }),
  component: AcrylicPrintsPage,
});

const sizes = [
  { size: '5" × 7"',   label: "5x7",   off: "10% OFF", original: "$19.99",  price: "$17.99", badge: null,            aspect: "aspect-[5/7]" },
  { size: '8" × 10"',  label: "8x10",  off: "15% OFF", original: "$27.99",  price: "$23.79", badge: "Most Popular!", aspect: "aspect-[4/5]" },
  { size: '11" × 14"', label: "11x14", off: "20% OFF", original: "$39.99",  price: "$31.99", badge: null,            aspect: "aspect-[11/14]" },
  { size: '12" × 16"', label: "12x16", off: "25% OFF", original: "$49.99",  price: "$37.49", badge: null,            aspect: "aspect-[3/4]" },
  { size: '16" × 20"', label: "16x20", off: "30% OFF", original: "$69.99",  price: "$48.99", badge: null,            aspect: "aspect-[4/5]" },
  { size: '20" × 30"', label: "20x30", off: "40% OFF", original: "$119.99", price: "$71.99", badge: null,            aspect: "aspect-[2/3]" },
];

const featureCards = [
  {
    img: imgGlossy,
    title: "Glossy Finish",
    body: "Our acrylic prints naturally have a beautiful, sleek and glossy finish that will complement every part of your print.",
  },
  {
    img: imgHang,
    title: "Ready to Hang",
    body: "Hassle-free installation    our acrylic prints come with a wood block on the back creating a floating effect.",
  },
  {
    img: imgQuality,
    title: "Bright Picture Quality",
    body: "Transforming your image into a stunning print, our acrylic prints elevate colours and enhance their brilliance.",
  },
];

const aboutItems = [
  {
    title: "Experience Unparalleled Clarity",
    body: "Experience our unparalleled acrylic prints at Memory3D. With premium plexiglass, they strike the perfect balance between lightweight design and durability, weighing only 1lb. Our gloss process illuminates your memories with remarkable quality, bringing your cherished photos to life.",
  },
  {
    title: "Hassle-Free Installation",
    body: "Effortlessly decorate with our ready-to-hang acrylic prints. Each print features a wooden mount that integrates seamlessly into your wall space, blending stability, support, and elegance. Showcasing your illuminated memories is simple and sophisticated.",
  },
  {
    title: "Personalize and Cherish Family Memories",
    body: "Stand out with stunning acrylic prints that capture cherished family memories. Transform your favourite photographs into keepsake wall art with our deep customization options. Preserve and display the essence of your most precious memories with clarity and colour.",
  },
  {
    title: "Quality Craftsmanship You Can Trust",
    body: "Every acrylic print is produced by experienced professionals who focus on print quality, clean finishing, and long-lasting presentation. Your result is personalised wall décor that lasts for many years to come.",
  },
];

const faqs = [
  {
    q: "Can I hang my acrylic prints outside?",
    a: "Acrylic prints are designed for indoor display. Prolonged exposure to direct sunlight or moisture can affect the print quality and longevity. We recommend keeping them indoors.",
  },
  {
    q: "What is the thickness of the acrylic?",
    a: "Our acrylic prints are printed on 1/4\" (6mm) thick premium optical-grade acrylic, giving them a solid, high-end feel.",
  },
  {
    q: "What hanging options are available for acrylic prints?",
    a: "Every acrylic print ships with a standoff mounting system pre-installed on the back, allowing for a frameless floating look on any wall. No tools required.",
  },
  {
    q: "How do I handle and take care of my acrylic print?",
    a: "Clean with a soft microfibre cloth and a small amount of isopropyl alcohol. Avoid abrasive cleaners or paper towels which can cause micro-scratches on the surface.",
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
        <span className="text-sm font-semibold text-foreground group-hover:text-gold transition-colors">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gold shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-gold transition-colors" />
        }
      </button>
      {open && <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

function AcrylicConfigurator() {
  const [selectedSize, setSelectedSize] = useState(sizes[1]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rotated, setRotated] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleOrder = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const photoBase64 = uploadedFile ? await toBase64(uploadedFile) : null;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          cartItems: [{ shapeLabel: "Acrylic Print", sizeLabel: selectedSize.size, price: parseFloat(selectedSize.price.replace("$", "")) }],
          totalPrice: parseFloat(selectedSize.price.replace("$", "")),
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

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="w-16 h-16 text-gold mb-6" />
        <h2 className="font-display text-4xl text-foreground mb-3">Order Received!</h2>
        <p className="text-muted-foreground max-w-sm">
          Thank you! We've received your acrylic print order. Our team will be in touch within 24 hours.
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

  const canSubmit = form.name && form.email && form.phone && uploadedFile;

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">

      {/* ── Left: Preview ── */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-1.5 w-16 py-3 bg-card border border-border rounded-sm hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <Upload className="w-5 h-5 text-gold" />
            <span className="text-[9px] tracking-[0.15em] uppercase font-bold text-muted-foreground group-hover:text-gold transition-colors">
              Upload
            </span>
          </button>
          <button
            onClick={() => setRotated((v) => !v)}
            className="flex flex-col items-center gap-1.5 w-16 py-3 bg-card border border-border rounded-sm hover:border-gold/50 hover:bg-gold/5 transition-all group"
          >
            <RotateCcw className="w-5 h-5 text-gold" />
            <span className="text-[9px] tracking-[0.12em] uppercase font-bold text-muted-foreground group-hover:text-gold transition-colors leading-tight text-center">
              Rotate
            </span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-4">
          <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-gold">
            {selectedSize.label}
          </p>
          <div
            className={`w-full max-w-[320px] ${rotated ? (selectedSize.aspect === "aspect-square" ? "aspect-square" : selectedSize.aspect === "aspect-[5/7]" ? "aspect-[7/5]" : selectedSize.aspect === "aspect-[4/5]" ? "aspect-[5/4]" : selectedSize.aspect === "aspect-[11/14]" ? "aspect-[14/11]" : selectedSize.aspect === "aspect-[3/4]" ? "aspect-[4/3]" : selectedSize.aspect === "aspect-[2/3]" ? "aspect-[3/2]" : selectedSize.aspect) : selectedSize.aspect} bg-muted/40 border-2 border-dashed border-border rounded-sm overflow-hidden flex items-center justify-center relative transition-all duration-300`}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={`w-full h-full object-contain transition-transform duration-300 ${rotated ? "rotate-90" : ""}`} />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center gap-3 text-muted-foreground hover:text-gold transition-colors p-8"
              >
                <Upload className="w-8 h-8" />
                <span className="text-[11px] tracking-[0.2em] uppercase font-semibold">Upload Image</span>
              </button>
            )}
          </div>
          {previewUrl && (
            <button
              onClick={() => { setPreviewUrl(null); setUploadedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* ── Right: Size + Customer Form ── */}
      <div className="space-y-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-foreground mb-3">
            Select Size
          </p>
          <div className="space-y-2">
            {sizes.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelectedSize(s)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-sm border transition-all duration-200 ${
                  selectedSize.label === s.label
                    ? "border-gold bg-gold/5 shadow-[0_0_0_1px_oklch(0.62_0.14_79/0.3)]"
                    : "border-border bg-card hover:border-gold/40 hover:bg-gold/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{s.size}</span>
                  {s.badge && (
                    <span className="text-[9px] tracking-[0.15em] uppercase font-bold px-2 py-0.5 bg-gold text-black rounded-full">
                      {s.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground line-through">{s.original}</span>
                  <span className="text-sm font-bold text-gold">{s.price}</span>
                  <span className="text-[9px] tracking-[0.1em] uppercase font-bold px-2 py-0.5 bg-gold/10 text-gold rounded-full border border-gold/20">
                    {s.off}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customer details */}
        <div className="bg-card border border-border rounded-sm p-6 space-y-4">
          <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-gold">Your Details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Full Name *</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Phone *</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium">Email *</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-[11px] uppercase tracking-wider">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={handleOrder}
          disabled={!canSubmit || status === "loading"}
          className="w-full inline-flex items-center justify-center gap-3 bg-gradient-gold text-white py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
          ) : (
            <>Order Now    {selectedSize.price} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
        <p className="text-[10px] text-center text-muted-foreground tracking-wider">
          No payment taken at this stage. We'll confirm and follow up within 24 hours.
        </p>
      </div>
    </div>
  );
}

function AcrylicPrintsPage() {
  return (
    <div className="bg-background">

      {/* ══════════ BANNER ══════════ */}
      <section className="relative h-[80vh] min-h-[520px] flex items-end overflow-hidden">
        <img
          src={bannerAcrylic}
          alt="Acrylic Prints"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-amber-800/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-14 w-full" style={{ paddingTop: "102px" }}>
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              Custom Acrylic Prints
            </span>
            <h1 className="font-display text-5xl md:text-7xl mt-3 leading-[0.95] text-white">
              Create Your Own <br />
              <em className="text-gradient-gold not-italic">Acrylic Print</em>
            </h1>
          </Reveal>
        </div>
      </section>

      {/* ══════════ CONFIGURATOR ══════════ */}
      <section className="py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-4">
              Create Your Canvas
            </h2>
            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-14">
              Upload your photo, select your size, and place your order in minutes.
            </p>
            <AcrylicConfigurator />
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
              Every acrylic print is made to order    crafted to the exact specifications of your photo and size.
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
              About Our Custom Acrylic Prints
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

      {/* ══════════ FAQs ══════════ */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl text-foreground text-center mb-4">
              FAQs
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
      <section className="py-28 bg-gradient-hero border-t border-border text-center">
        <Reveal>
          <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
            Ready to print?
          </span>
          <h2 className="font-display text-5xl md:text-7xl mt-4 max-w-3xl mx-auto leading-tight text-foreground px-6">
            Create Your Own <br />
            <em className="text-gradient-gold not-italic">Acrylic Print</em>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-md mx-auto">
            Upload your photo, choose your size, and we'll handle the rest    shipped to your door in 10–14 days.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 bg-gradient-gold text-white px-10 py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold font-bold hover:opacity-90 transition"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </section>

    </div>
  );
}
