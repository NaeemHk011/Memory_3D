import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addons, type Size, type Shape } from "@/data/products";
import { SizeSelector } from "@/components/shop/SizeSelector";
import { PhotoUpload } from "@/components/shop/PhotoUpload";
import { AddonList } from "@/components/shop/AddonList";
import { CustomerForm } from "@/components/shop/CustomerForm";
import { TotalBar } from "@/components/shop/TotalBar";
import { calculateTotal } from "@/components/shop/PriceCalculator";
import { LivePreviewPanel } from "@/components/shop/LivePreviewPanel";
import { ImageEditor } from "@/components/shop/ImageEditor";
import { ImagePositioner } from "@/components/shop/ImagePositioner";
import { Reveal } from "@/components/site/Reveal";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

interface ConfiguratorProps {
  shape: Shape;
}

const productDescriptions: Record<string, string> = {
  "rectangle-tall":
    "Our most versatile crystal — the timeless portrait format works beautifully with individuals, couples, and small groups. Laser-etched with millions of micro-points for incredible 3D depth.",
  "rectangle-wide":
    "Perfect for landscape and group shots. The wide format captures more of your scene, making it ideal for family gatherings, sports teams, and panoramic memories.",
  heart:
    "Our signature wedding and anniversary crystal. The heart shape catches light from every angle, making it a breathtaking centrepiece in any home.",
  prestige:
    "The Prestige series features beveled edges and an extra-thick optical base that creates a floating 3D effect unlike any other crystal we make.",
  ball: "A flawless sphere of optical crystal — no edges, no angles. Your photo engraved inside a perfect ball is truly mesmerizing from every direction.",
  "cut-corner-diamond":
    "Compact and striking. The diamond cut with angled corners makes this our best-value crystal without compromising on optical quality.",
  candle:
    "Cylindrical and elegant, the Candle crystal is designed to sit on any of our lightbases. The cylindrical form rotates light through your image beautifully.",
  urn: "A dignified memorial tribute. The Urn shape is designed for those honouring a loved one or beloved pet — a lasting keepsake to hold their memory.",
  "notched-tall":
    "A contemporary take on the classic portrait. The distinctive notched top gives this crystal a modern architectural quality.",
  "notched-wide":
    "Wide-format crystal with a signature notched top. Ideal for landscape and group photos with a modern aesthetic.",
  "desk-lamp":
    "Crystal meets function. Your engraved crystal is built directly into an elegant desk lamp — art you live with every day.",
  ornament:
    "Perfect for the holidays or as a year-round keepsake. Hang your cherished memory on the tree or display it on a stand.",
  "vertical-keychain":
    "Carry your memory wherever you go. Our precision-engraved vertical keychain is crafted in optical crystal and made to last.",
  "horizontal-keychain":
    "Sleek horizontal crystal keychain — the perfect way to keep someone close every single day.",
  "heart-keychain":
    "A heart-shaped crystal keychain that makes the most meaningful small gift for a loved one.",
  "heart-necklace":
    "Wear your memory. Our heart necklace pendant is crafted from premium optical crystal engraved with your chosen image.",
  "dog-bone-vertical":
    "A loving tribute to your best friend. The dog bone shape honours your pet's memory in beautiful 3D crystal.",
  "dog-bone-horizontal":
    "Horizontal dog bone crystal — a deeply personal memorial for the pet who meant the world to you.",
};

export function Configurator({ shape }: ConfiguratorProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [selectedSize,    setSelectedSize]    = useState<Size>(shape.sizes[0]);
  const [uploadedFile,    setUploadedFile]    = useState<File | null>(null);
  const [photoUrl,        setPhotoUrl]        = useState<string | null>(null);
  const [selectedAddons,  setSelectedAddons]  = useState<Record<string, { checked: boolean; qty: number }>>({});
  const [inscriptionText, setInscriptionText] = useState("");
  const [shippingPrice,   setShippingPrice]   = useState(0);
  const [formData,        setFormData]        = useState<any>({});
  const [showEditor,      setShowEditor]      = useState(false);
  const [showPositioner,  setShowPositioner]  = useState(false);

  // Reset when navigating to a different shape
  useEffect(() => {
    setSelectedSize(shape.sizes[0]);
  }, [shape.id]);

  const totals = useMemo(
    () => calculateTotal({ sizePrice: selectedSize.price, selectedAddons, addons, inscriptionText, shippingPrice }),
    [selectedSize, selectedAddons, inscriptionText, shippingPrice],
  );

  const missingFields = useMemo(() => {
    const fields: string[] = [];
    if (!photoUrl)      fields.push("photo");
    if (!formData.name)  fields.push("Full Name");
    if (!formData.email) fields.push("Email");
    if (!formData.phone) fields.push("Phone");
    return fields;
  }, [photoUrl, formData]);

  const isReady = missingFields.length === 0;

  // ── Photo handlers ──────────────────────────────────────────
  const handlePhotoChange = (file: File | null) => {
    setUploadedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    } else {
      setPhotoUrl(null);
    }
  };

  const handleEditorSave = (base64: string) => {
    setPhotoUrl(base64);
    setShowEditor(false);
  };

  const handlePositionerSave = (base64: string) => {
    setPhotoUrl(base64);
    setShowPositioner(false);
  };

  // ── Add to cart ─────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    localStorage.setItem("customerData", JSON.stringify({
      name: formData.name || "", email: formData.email || "", phone: formData.phone || "",
    }));

    let photoBase64: string | undefined;
    let photoName: string | undefined;

    if (photoUrl?.startsWith("data:")) {
      // Already base64 (from editor or positioner)
      photoBase64 = photoUrl;
      photoName = uploadedFile?.name || "photo.jpg";
    } else if (uploadedFile) {
      // Raw blob URL — read from the original file
      photoName = uploadedFile.name;
      photoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(uploadedFile);
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }

    addItem({
      id: crypto.randomUUID(),
      shapeId: shape.id, shapeLabel: shape.label,
      sizeId: selectedSize.id, sizeLabel: selectedSize.label,
      price: totals.total,
      photo: photoUrl || "",
      photoBase64, photoName,
      addons: addons
        .filter((a) => selectedAddons[a.id]?.checked)
        .map((a) => ({ id: a.id, label: a.label, price: a.price, qty: selectedAddons[a.id]?.qty || 1 })),
      inscriptionText,
      quantity: 1,
    });

    toast.success(`${shape.label} added to cart! We'll review your photo shortly.`);
    navigate({ to: "/cart" });
  }, [shape, selectedSize, uploadedFile, photoUrl, selectedAddons, inscriptionText, addItem, navigate, totals.total, formData]);

  const description   = productDescriptions[shape.id] || "";
  const startingPrice = Math.min(...shape.sizes.map((s) => s.price));

  return (
    <div className="pt-10 pb-16">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* ── LEFT: Live Preview Panel ── */}
        <Reveal>
          <LivePreviewPanel
            shape={shape}
            size={selectedSize}
            photoUrl={photoUrl}
            totalPrice={totals.total}
            onEditClick={() => setShowEditor(true)}
            onPositionClick={() => setShowPositioner(true)}
          />
        </Reveal>

        {/* ── RIGHT: Product Info + Order Form ── */}
        <div>
          <Reveal>
            {/* Product Header */}
            <div className="mb-3">
              <span className="label-chip block">3D Laser-Engraved Crystal</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
              {shape.label}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-gold text-gold" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">4.9 · 12,000+ reviews</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8 text-base">{description}</p>

            {/* Starting Price */}
            <div className="mb-10 p-5 bg-card border border-border rounded-2xl shadow-card">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Starting from</p>
              <div className="font-display text-4xl text-gradient-gold">${startingPrice}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {shape.sizes.length} size option{shape.sizes.length > 1 ? "s" : ""} available · Prices shown at checkout
              </p>
            </div>
          </Reveal>

          {/* STEP 1: Size */}
          <Reveal delay={0.1}>
            <section className="mb-10">
              <h2 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-gold text-white text-[10px] font-bold grid place-items-center shrink-0">1</span>
                Select Size
              </h2>
              <SizeSelector
                sizes={shape.sizes}
                selectedSizeId={selectedSize.id}
                onSizeChange={setSelectedSize}
              />
            </section>
          </Reveal>

          {/* STEP 2: Photo Upload */}
          <Reveal delay={0.15}>
            <section className="mb-10">
              <h2 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-gold text-white text-[10px] font-bold grid place-items-center shrink-0">2</span>
                Upload Your Photo
              </h2>
              <PhotoUpload
                shapePreviewImage={shape.previewImage}
                onPhotoChange={handlePhotoChange}
                externalPreview={photoUrl}
              />
              {photoUrl && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowEditor(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-[10px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-gold hover:border-gold/40 transition-all cursor-pointer"
                  >
                    Edit & Filter Image
                  </button>
                  <button
                    onClick={() => setShowPositioner(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gold/40 text-[10px] tracking-[0.15em] uppercase font-bold text-gold hover:bg-gold/5 transition-all cursor-pointer"
                  >
                    Position on Crystal
                  </button>
                </div>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground italic">
                Upload a clear, high-resolution photo. Our team will enhance it for the best result.
              </p>
            </section>
          </Reveal>

          {/* STEP 3: Add-ons */}
          <Reveal delay={0.2}>
            <section className="mb-10">
              <h2 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-gold text-white text-[10px] font-bold grid place-items-center shrink-0">3</span>
                Premium Add-ons
              </h2>
              <AddonList
                addons={addons}
                selectedAddons={selectedAddons}
                onAddonChange={(id, checked, qty) =>
                  setSelectedAddons((prev) => ({ ...prev, [id]: { checked, qty } }))
                }
              />
            </section>
          </Reveal>

          {/* STEP 4: Inscription */}
          <Reveal delay={0.25}>
            <section className="mb-10">
              <h2 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-gold text-white text-[10px] font-bold grid place-items-center shrink-0">4</span>
                Custom Inscription
                <span className="text-[9px] tracking-normal normal-case text-muted-foreground font-normal ml-1">(Optional)</span>
              </h2>
              <input
                type="text"
                placeholder="Type your engraving text — names, dates, a short message…"
                value={inscriptionText}
                onChange={(e) => setInscriptionText(e.target.value)}
                maxLength={80}
                className="w-full bg-card border border-border rounded-xl px-5 py-4 text-sm focus:border-gold outline-none transition-colors text-foreground placeholder:text-muted-foreground focus:shadow-[0_0_0_3px_oklch(0.62_0.14_79/0.1)]"
              />
              <p className="mt-2 text-[10px] text-muted-foreground">{inscriptionText.length}/80 characters</p>
            </section>
          </Reveal>

          {/* STEP 5: Customer & Shipping */}
          <Reveal delay={0.3}>
            <section className="mb-10">
              <h2 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gradient-gold text-white text-[10px] font-bold grid place-items-center shrink-0">5</span>
                Your Details & Shipping
              </h2>
              <CustomerForm
                onShippingChange={setShippingPrice}
                onFormChange={(data) => setFormData((prev: any) => ({ ...prev, ...data }))}
              />
            </section>
          </Reveal>

          {/* Total & Cart */}
          <TotalBar
            subtotal={totals.subtotal}
            shippingPrice={totals.shipping}
            total={totals.total}
            isReady={isReady}
            missingFields={missingFields}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* ── Modals ── */}
      {showEditor && photoUrl && (
        <ImageEditor
          imageUrl={photoUrl}
          onClose={() => setShowEditor(false)}
          onSave={handleEditorSave}
        />
      )}
      {showPositioner && photoUrl && (
        <ImagePositioner
          imageUrl={photoUrl}
          shape={shape}
          onClose={() => setShowPositioner(false)}
          onSave={handlePositionerSave}
        />
      )}
    </div>
  );
}
