import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addons, type Size, type Shape } from "@/data/products";
import { SizeSelector }    from "@/components/shop/SizeSelector";
import { PhotoUpload }     from "@/components/shop/PhotoUpload";
import { AddonList }       from "@/components/shop/AddonList";
import { CustomerForm }    from "@/components/shop/CustomerForm";
import { TotalBar }        from "@/components/shop/TotalBar";
import { calculateTotal }  from "@/components/shop/PriceCalculator";
import { LivePreviewPanel } from "@/components/shop/LivePreviewPanel";
import { ImagePositioner } from "@/components/shop/ImagePositioner";
import { StepWizard }      from "@/components/shop/StepWizard";
import { Reveal }          from "@/components/site/Reveal";
import { useCart }         from "@/hooks/use-cart";
import { toast }           from "sonner";
import {
  ArrowLeft, ArrowRight, ShoppingCart,
  Move, CheckCircle2, ImageIcon,
} from "lucide-react";

interface ConfiguratorProps {
  shape: Shape;
}

const STEPS = ["Size", "Photo", "Options", "Details", "Review"];

const productDescriptions: Record<string, string> = {
  "rectangle-tall":
    "Our most versatile crystal     the timeless portrait format works beautifully with individuals, couples, and small groups. Laser-etched with millions of micro-points for incredible 3D depth.",
  "rectangle-wide":
    "Perfect for landscape and group shots. The wide format captures more of your scene, making it ideal for family gatherings, sports teams, and panoramic memories.",
  heart:
    "Our signature wedding and anniversary crystal. The heart shape catches light from every angle, making it a breathtaking centrepiece in any home.",
  prestige:
    "The Prestige series features beveled edges and an extra-thick optical base that creates a floating 3D effect unlike any other crystal we make.",
  ball: "A flawless sphere of optical crystal     no edges, no angles. Your photo engraved inside a perfect ball is truly mesmerizing from every direction.",
  "cut-corner-diamond":
    "Compact and striking. The diamond cut with angled corners makes this our best-value crystal without compromising on optical quality.",
  candle:
    "Cylindrical and elegant, the Candle crystal is designed to sit on any of our lightbases. The cylindrical form rotates light through your image beautifully.",
  urn: "A dignified memorial tribute. The Urn shape is designed for those honouring a loved one or beloved pet     a lasting keepsake to hold their memory.",
  "notched-tall":
    "A contemporary take on the classic portrait. The distinctive notched top gives this crystal a modern architectural quality.",
  "notched-wide":
    "Wide-format crystal with a signature notched top. Ideal for landscape and group photos with a modern aesthetic.",
  "desk-lamp":
    "Crystal meets function. Your engraved crystal is built directly into an elegant desk lamp     art you live with every day.",
  ornament:
    "Perfect for the holidays or as a year-round keepsake. Hang your cherished memory on the tree or display it on a stand.",
  "vertical-keychain":
    "Carry your memory wherever you go. Our precision-engraved vertical keychain is crafted in optical crystal and made to last.",
  "horizontal-keychain":
    "Sleek horizontal crystal keychain     the perfect way to keep someone close every single day.",
  "heart-keychain":
    "A heart-shaped crystal keychain that makes the most meaningful small gift for a loved one.",
  "heart-necklace":
    "Wear your memory. Our heart necklace pendant is crafted from premium optical crystal engraved with your chosen image.",
  "dog-bone-vertical":
    "A loving tribute to your best friend. The dog bone shape honours your pet's memory in beautiful 3D crystal.",
  "dog-bone-horizontal":
    "Horizontal dog bone crystal     a deeply personal memorial for the pet who meant the world to you.",
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
  const [showPositioner,  setShowPositioner]  = useState(false);
  const [currentStep,     setCurrentStep]     = useState(1);

  useEffect(() => {
    setSelectedSize(shape.sizes[0]);
    setCurrentStep(1);
  }, [shape.id]);

  const totals = useMemo(
    () => calculateTotal({ sizePrice: selectedSize.price, selectedAddons, addons, inscriptionText, shippingPrice }),
    [selectedSize, selectedAddons, inscriptionText, shippingPrice],
  );

  const completedSteps = useMemo(() => {
    const done: number[] = [];
    if (currentStep > 1) done.push(1);
    if (currentStep > 2) done.push(2);
    if (currentStep > 3) done.push(3);
    if (currentStep > 4) done.push(4);
    return done;
  }, [currentStep]);

  const canGoNext: Record<number, boolean> = {
    1: true,
    2: !!photoUrl,
    3: true,
    4: !!(formData.name && formData.email && formData.phone),
    5: false,
  };

  const handlePhotoChange = (file: File | null) => {
    setUploadedFile(file);
    setPhotoUrl(file ? URL.createObjectURL(file) : null);
  };

  const handlePositionerSave = (base64: string) => {
    setPhotoUrl(base64);
    setShowPositioner(false);
  };

  const handleAddToCart = useCallback(async () => {
    localStorage.setItem("customerData", JSON.stringify({
      name: formData.name || "", email: formData.email || "", phone: formData.phone || "",
    }));

    let photoBase64: string | undefined;
    let photoName: string | undefined;

    if (photoUrl?.startsWith("data:")) {
      photoBase64 = photoUrl;
      photoName = uploadedFile?.name || "photo.jpg";
    } else if (uploadedFile) {
      photoName = uploadedFile.name;
      photoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(uploadedFile);
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }

    try {
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
      toast.success(`${shape.label} added to cart!`);
      navigate({ to: "/cart" });
    } catch {
      toast.error("Could not add to cart. Please try again.");
    }
  }, [shape, selectedSize, uploadedFile, photoUrl, selectedAddons, inscriptionText, addItem, navigate, totals.total, formData]);

  const description   = productDescriptions[shape.id] || "";
  const startingPrice = Math.min(...shape.sizes.map((s) => s.price));

  const checkedAddons = addons.filter((a) => selectedAddons[a.id]?.checked);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-2">{shape.label}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
            <div className="mb-6 p-5 bg-card border border-border rounded-2xl">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Starting from</p>
              <div className="font-display text-4xl text-gradient-gold">${startingPrice}</div>
            </div>
            <h3 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-4">
              Select Size
            </h3>
            <SizeSelector
              sizes={shape.sizes}
              selectedSizeId={selectedSize.id}
              onSizeChange={setSelectedSize}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-2">Your Photo</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a clear, high-resolution photo. Our team enhances every image before engraving.
            </p>

            <PhotoUpload
              shapePreviewImage={shape.previewImage}
              onPhotoChange={handlePhotoChange}
              externalPreview={photoUrl}
            />

            {photoUrl ? (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-bold">
                  Customise Your Photo
                </p>

                <button
                  onClick={() => setShowPositioner(true)}
                  className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-gold/40 bg-gold/5 hover:bg-gold/10 transition-all text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gold/20 flex items-center justify-center">
                      <Move className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <span className="text-[10px] tracking-[0.15em] uppercase font-bold text-gold">
                      Position
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Drag & zoom to perfectly frame your photo in the crystal shape
                  </p>
                </button>

                <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-[10px] text-muted-foreground">
                    Photo uploaded — positioning is optional. Click <strong>Next</strong> when ready.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
                <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground">
                  Upload a photo to unlock editing and positioning tools.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">Options</h2>
            <h3 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-4">
              Premium Add-ons
            </h3>
            <AddonList
              addons={addons}
              selectedAddons={selectedAddons}
              onAddonChange={(id, checked, qty) =>
                setSelectedAddons((prev) => ({ ...prev, [id]: { checked, qty } }))
              }
            />
            <div className="mt-8">
              <h3 className="text-[12px] tracking-[0.3em] uppercase font-bold text-gold mb-4">
                Custom Inscription
                <span className="text-[9px] tracking-normal normal-case text-muted-foreground font-normal ml-2">(Optional)</span>
              </h3>
              <input
                type="text"
                placeholder="Names, dates, a short message…"
                value={inscriptionText}
                onChange={(e) => setInscriptionText(e.target.value)}
                maxLength={80}
                className="w-full bg-card border border-border rounded-xl px-5 py-4 text-sm focus:border-gold outline-none transition-colors text-foreground placeholder:text-muted-foreground"
              />
              <p className="mt-2 text-[10px] text-muted-foreground">{inscriptionText.length}/80</p>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">Your Details & Shipping</h2>
            <CustomerForm
              onShippingChange={setShippingPrice}
              onFormChange={(data) => setFormData((prev: any) => ({ ...prev, ...data }))}
            />
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="font-display text-2xl text-foreground mb-6">Review Your Order</h2>
            <div className="space-y-4">

              {/* Crystal photo preview */}
              {photoUrl && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">
                    Your Photo Preview
                  </p>
                  <div className="flex items-center gap-5">
                    <div
                      className="shrink-0 w-24 relative overflow-hidden"
                      style={{ aspectRatio: `${shape.crystalAspect}` }}
                    >
                      <img src={photoUrl} alt="Your photo" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
                      <img src={shape.crystalFramePng} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 2 }} />
                    </div>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => { setShowPositioner(true); setCurrentStep(2); }}
                        className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:text-gold transition-colors"
                      >
                        <Move className="w-3 h-3" /> Reposition
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Crystal + Size */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">Product</p>
                <Row label="Crystal" value={shape.label} />
                <Row label="Size" value={selectedSize.label} />
                <Row label="Dimensions" value={selectedSize.dimensions} />
                <Row label="Base Price" value={`$${selectedSize.price}`} />
                {inscriptionText && (
                  <Row label="Inscription" value={`"${inscriptionText}"`} />
                )}
              </div>

              {/* Add-ons with quantity */}
              {checkedAddons.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Add-ons</p>
                  <div className="space-y-2.5">
                    {checkedAddons.map((a) => {
                      const qty = selectedAddons[a.id]?.qty || 1;
                      return (
                        <div key={a.id} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">
                            {a.label}
                            {qty > 1 && (
                              <span className="ml-2 text-[10px] text-muted-foreground">× {qty}</span>
                            )}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ${a.price * qty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customer details */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">Contact</p>
                <Row label="Name"  value={formData.name  || "   "} />
                <Row label="Email" value={formData.email || "   "} />
                <Row label="Phone" value={formData.phone || "   "} />
              </div>

              {/* Shipping */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-2">
                <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">Shipping</p>
                <Row
                  label="Method"
                  value={shippingPrice === 0 ? "Free Shipping / Store Pickup" : "Fast Shipping"}
                />
                <Row label="Shipping Cost" value={shippingPrice === 0 ? "Free" : `$${shippingPrice}`} />
              </div>

              {/* Total */}
              <div className="bg-card border border-gold/30 rounded-xl p-5 flex items-center justify-between">
                <span className="text-[11px] tracking-widest uppercase text-muted-foreground">Order Total</span>
                <span className="font-display text-2xl text-gradient-gold">${totals.total}</span>
              </div>

              <p className="text-[10px] text-muted-foreground text-center">
                * Taxes may apply at checkout
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="pt-10 pb-16">

      {/* Mobile compact preview bar */}
      <div className="lg:hidden mb-6 p-4 bg-card border border-border rounded-2xl flex items-center gap-4">
        <div
          className="shrink-0 w-14 relative overflow-hidden"
          style={{ aspectRatio: `${shape.crystalAspect}` }}
        >
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(100%)" }} />
              <img src={shape.crystalFramePng} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ zIndex: 2 }} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img src={shape.crystalFramePng} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{shape.label}</p>
          <p className="text-[10px] text-muted-foreground">{selectedSize.label} · {selectedSize.dimensions}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total</p>
          <p className="font-display text-lg text-gold">${totals.total}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-start">

        {/* LEFT: Live Preview     desktop only */}
        <div className="hidden lg:block">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <LivePreviewPanel
                shape={shape}
                size={selectedSize}
                photoUrl={photoUrl}
                totalPrice={totals.total}
                onPositionClick={() => setShowPositioner(true)}
              />
            </div>
          </Reveal>
        </div>

        {/* RIGHT: Step Wizard */}
        <div>
          <Reveal>
            <StepWizard
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
              completedSteps={completedSteps}
            />

            <div className="min-h-[400px] mt-8">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center gap-2 px-5 py-3 border border-border rounded-xl text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:border-gold/50 hover:text-foreground transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canGoNext[currentStep]}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-gold text-primary-foreground rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-gold transition-all"
                >
                  {currentStep === 2 && !photoUrl ? "Upload a photo to continue" : "Continue"}
                  {canGoNext[currentStep] && <ArrowRight className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-gold text-primary-foreground rounded-xl text-[11px] tracking-[0.2em] uppercase font-bold shadow-gold"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart · ${totals.total}
                </button>
              )}
            </div>

            {currentStep === 4 && !(formData.name && formData.email && formData.phone) && (
              <p className="mt-3 text-[11px] text-muted-foreground text-center">
                Fill in your name, email and phone to continue
              </p>
            )}
          </Reveal>
        </div>
      </div>

      {/* Modals */}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] tracking-widest uppercase text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}
