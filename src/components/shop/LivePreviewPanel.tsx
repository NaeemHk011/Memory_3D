import { Star, Shield, Truck, RotateCcw, Move } from "lucide-react";
import type { Shape, Size } from "@/data/products";

const trustBadges = [
  { icon: Shield,   label: "Premium Optical Crystal"  },
  { icon: Star,     label: "4.9★ · 12k+ Reviews"      },
  { icon: Truck,    label: "10–14 Day Delivery"        },
  { icon: RotateCcw, label: "Satisfaction Guaranteed" },
];

interface Props {
  shape: Shape;
  size: Size;
  photoUrl: string | null;
  totalPrice: number;
  onPositionClick: () => void;
}

export function LivePreviewPanel({ shape, size, photoUrl, totalPrice, onPositionClick }: Props) {
  const paddingTop = `${(1 / shape.crystalAspect) * 100}%`;

  return (
    <div className="lg:sticky lg:top-28 space-y-6">

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold">
          Live Preview
        </span>
      </div>

      {/* Crystal frame */}
      <div className="w-full max-w-[320px] mx-auto">
        <div className="relative w-full" style={{ paddingTop }}>
          <div className="absolute inset-0 overflow-hidden">
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Your photo preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "grayscale(100%)" }}
                />
                <img
                  src={shape.crystalFramePng}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ zIndex: 2 }}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <img
                  src={shape.crystalFramePng}
                  alt={shape.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-70"
                />
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground text-center px-6 relative" style={{ zIndex: 1 }}>
                  Upload a photo to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Position button */}
      {photoUrl && (
        <div className="flex gap-2 max-w-[320px] mx-auto w-full">
          <button
            onClick={onPositionClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gold/40 text-[10px] tracking-[0.15em] uppercase font-bold text-gold hover:bg-gold/5 transition-all cursor-pointer"
          >
            <Move className="w-3.5 h-3.5" /> Position
          </button>
        </div>
      )}

      {/* Selection summary */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-2.5 max-w-[320px] mx-auto w-full">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Shape</span>
          <span className="text-[11px] text-foreground font-semibold">{shape.label}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Size</span>
          <span className="text-[11px] text-foreground font-semibold">{size.label}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">Dimensions</span>
          <span className="text-[11px] text-foreground font-semibold">{size.dimensions}</span>
        </div>
        <div className="border-t border-border pt-2.5 flex justify-between items-end">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="font-display text-3xl text-gold font-bold">${totalPrice}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3 max-w-[320px] mx-auto w-full">
        {trustBadges.map(({ icon: I, label }) => (
          <div key={label} className="flex items-center gap-2.5 p-3 bg-card border border-border rounded-xl shadow-sm">
            <I className="w-4 h-4 text-gold shrink-0" />
            <span className="text-[10px] tracking-[0.1em] text-muted-foreground font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
