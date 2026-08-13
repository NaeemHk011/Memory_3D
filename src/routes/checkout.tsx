import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { AffiliateBanner } from "@/components/site/AffiliateBanner";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const customerData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("customerData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const handlePlaceOrder = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const firstPhoto = items.find((i) => i.photoBase64);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/ghl/submit.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          cartItems: items.map((item) => ({
            shapeLabel: item.shapeLabel,
            sizeLabel: item.sizeLabel,
            price: item.price,
            addons: item.addons,
            inscriptionText: item.inscriptionText,
          })),
          totalPrice,
          photoBase64: firstPhoto?.photoBase64 || null,
          framedPhotoBase64: firstPhoto?.framedPhotoBase64 || null,
          photoName: firstPhoto?.photoName || null,
        }),
      });

      const text = await res.text();
      if (!text) throw new Error("No response from server. Make sure XAMPP is running.");

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error (${res.status}). Check PHP error logs for details.`);
      }

      if (!res.ok || data.error) throw new Error(data.error || "Order submission failed");
      clearCart();
      localStorage.removeItem("customerData");
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return <ThankYouView />;
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-24 min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg uppercase tracking-widest mb-8">
            Your cart is empty.
          </p>
          <Link to="/shop">
            <Button className="bg-gradient-gold text-primary-foreground px-10 py-6 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="flex items-center gap-4 mb-12">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-12">
            Review & Place Order
          </h1>
        </Reveal>

        {/* Order Items */}
        <Reveal delay={0.05}>
          <div className="bg-card border border-border rounded-sm p-8 mb-8">
            <h2 className="text-[12px] tracking-[0.2em] uppercase font-bold text-gold border-b border-gold/20 pb-3 mb-6">
              Order Items
            </h2>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.shapeLabel}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      Size: {item.sizeLabel}
                    </p>
                    {item.addons.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {item.addons.map((a) => (
                          <p key={a.id} className="text-[10px] text-muted-foreground">
                            + {a.label}{a.qty > 1 ? ` ×${a.qty}` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.inscriptionText && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">
                        "{item.inscriptionText}"
                      </p>
                    )}
                  </div>
                  <span className="font-display text-xl text-gold font-bold shrink-0">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-px bg-border my-6" />
            <div className="flex justify-between items-end">
              <span className="font-display text-lg uppercase tracking-widest text-foreground">
                Total
              </span>
              <span className="font-display text-4xl text-gold font-bold">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Customer Details */}
        <Reveal delay={0.1}>
          <div className="bg-card border border-border rounded-sm p-8 mb-10">
            <h2 className="text-[12px] tracking-[0.2em] uppercase font-bold text-gold border-b border-gold/20 pb-3 mb-6">
              Customer Details
            </h2>
            {customerData.name ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Name
                  </span>
                  <span className="text-sm text-foreground">{customerData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm text-foreground">{customerData.email || "  "}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Phone
                  </span>
                  <span className="text-sm text-foreground">{customerData.phone || "  "}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[11px] uppercase tracking-wider">
                  Customer details missing.{" "}
                  <Link to="/shop" className="underline hover:text-gold">
                    Return to product page
                  </Link>{" "}
                  and fill in your details before placing an order.
                </p>
              </div>
            )}
          </div>
        </Reveal>

        {/* Error message */}
        {status === "error" && (
          <Reveal>
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-sm mb-6 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-[11px] uppercase tracking-wider">{errorMsg}</p>
            </div>
          </Reveal>
        )}

        {/* Place Order */}
        <Reveal delay={0.15}>
          <Button
            onClick={handlePlaceOrder}
            disabled={status === "loading" || !customerData.name}
            className="w-full bg-gradient-gold text-primary-foreground py-7 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Placing Your Order…
              </>
            ) : (
              "Place Order"
            )}
          </Button>
          <p className="mt-4 text-[10px] text-center text-muted-foreground uppercase tracking-widest leading-loose">
            By placing your order you agree to our terms. No payment is taken at this stage.
          </p>
        </Reveal>
      </div>
    </div>
  );
}

function ThankYouView() {
  return (
    <div className="pt-40 pb-24 min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <Reveal>
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gold/10 border border-gold/20 mb-8">
              <CheckCircle className="w-10 h-10 text-gold" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-foreground mb-6">
              Order Received.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto mb-10">
              Your memory is now in the hands of our master artisans. We'll send you a tracking
              number once your crystal has been hand-inspected and shipped.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-card/50 border border-border rounded-sm p-10 mb-12">
            <h3 className="font-display text-2xl mb-4 text-foreground">What's Next?</h3>
            <ul className="text-left space-y-6 max-w-sm mx-auto">
              {[
                {
                  t: "Photo Review",
                  d: "Our team will manually review your photo for optimal laser-etching.",
                },
                {
                  t: "Laser-Engraving",
                  d: "Millions of micro-points are etched into your optical crystal.",
                },
                { t: "Shipping", d: "Your order arrives in 10-14 days in a premium gift box." },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-6 h-6 shrink-0 rounded-full border border-gold/40 text-[10px] flex items-center justify-center text-gold font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest font-bold text-foreground">
                      {step.t}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <AffiliateBanner />
        </Reveal>

        <Reveal delay={0.25}>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link to="/">
              <Button className="w-full sm:w-auto bg-gradient-gold text-primary-foreground px-10 py-6 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold">
                Return to Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-gold/40 text-foreground px-10 py-6 text-[11px] tracking-[0.3em] uppercase rounded-sm hover:border-gold transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Order Another
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
