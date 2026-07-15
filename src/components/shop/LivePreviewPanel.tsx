import { useEffect } from "react";
import { Star, Shield, Truck, RotateCcw, Pencil, Move } from "lucide-react";
import type { Shape, Size } from "@/data/products";

const trustBadges = [
  { icon: Shield, label: "Premium Optical Crystal" },
  { icon: Star,   label: "4.9★ · 12k+ Reviews"     },
  { icon: Truck,  label: "10–14 Day Delivery"       },
  { icon: RotateCcw, label: "Satisfaction Guaranteed" },
];

function injectSvgClipDefs() {
  if (document.getElementById("crystal-clip-defs")) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "crystal-clip-defs";
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:absolute;overflow:hidden;width:0;height:0;top:0;left:0;pointer-events:none;";
  svg.innerHTML = `
    <defs>
      <clipPath id="cp-heart" clipPathUnits="objectBoundingBox">
        <path d="M 0.5 0.25 C 0.5 0.05 0.25 0 0.1 0.15 C 0 0.28 0 0.5 0.5 0.85 C 1 0.5 1 0.28 0.9 0.15 C 0.75 0 0.5 0.05 0.5 0.25 Z"/>
      </clipPath>
      <clipPath id="cp-ball" clipPathUnits="objectBoundingBox">
        <circle cx="0.5" cy="0.5" r="0.5"/>
      </clipPath>
      <clipPath id="cp-diamond" clipPathUnits="objectBoundingBox">
        <polygon points="0.5,0.05 0.95,0.4 0.78,0.97 0.22,0.97 0.05,0.4"/>
      </clipPath>
      <clipPath id="cp-ornament" clipPathUnits="objectBoundingBox">
        <ellipse cx="0.5" cy="0.5" rx="0.44" ry="0.5"/>
      </clipPath>
    </defs>
  `;
  document.body.appendChild(svg);
}

export function getShapeClip(id: string): { clip: string; aspect: number } {
  if (id === "ball")             return { clip: "url(#cp-ball)",     aspect: 1      };
  if (id.includes("heart"))      return { clip: "url(#cp-heart)",    aspect: 0.88   };
  if (id.includes("diamond"))    return { clip: "url(#cp-diamond)",  aspect: 0.72   };
  if (id === "ornament")         return { clip: "url(#cp-ornament)", aspect: 0.9    };
  if (id === "candle")           return { clip: "inset(0 round 80px)", aspect: 0.38 };
  if (id === "urn")              return { clip: "inset(0 round 16px 16px 0 0)", aspect: 0.85 };
  if (id.includes("wide"))       return { clip: "inset(0 round 6px)", aspect: 1.32  };
  if (id.includes("tall"))       return { clip: "inset(0 round 6px)", aspect: 0.72  };
  if (id === "prestige")         return { clip: "inset(0 round 4px)", aspect: 0.75  };
  if (id.includes("notched"))    return { clip: "inset(0 round 4px)", aspect: 0.72  };
  if (id === "desk-lamp")        return { clip: "inset(0 round 8px)", aspect: 0.65  };
  if (id.includes("key"))        return { clip: "inset(0 round 4px)", aspect: 0.44  };
  return                                { clip: "inset(0 round 8px)", aspect: 0.75  };
}

interface Props {
  shape: Shape;
  size: Size;
  photoUrl: string | null;
  totalPrice: number;
  onEditClick: () => void;
  onPositionClick: () => void;
}

export function LivePreviewPanel({
  shape, size, photoUrl, totalPrice, onEditClick, onPositionClick,
}: Props) {
  useEffect(() => { injectSvgClipDefs(); }, []);

  const { clip, aspect } = getShapeClip(shape.id);

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
        <div className="relative w-full" style={{ paddingTop: `${(1 / aspect) * 100}%` }}>
          <div
            className="absolute inset-0"
            style={{ clipPath: clip, overflow: "hidden" }}
          >
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Your photo preview"
                  className="w-full h-full object-cover"
                />
                {/* Crystal glass shimmer */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 45%, rgba(255,255,255,0.07) 75%, transparent 100%)",
                  }}
                />
                {/* Inner shadow depth */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.25), inset 2px 2px 0 rgba(255,255,255,0.08)" }}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card border border-border gap-3">
                <img
                  src={shape.thumbImage}
                  alt={shape.label}
                  className="w-1/2 h-1/2 object-contain opacity-15"
                />
                <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground text-center px-6">
                  Upload a photo to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit / Position buttons */}
      {photoUrl && (
        <div className="flex gap-2 max-w-[320px] mx-auto w-full">
          <button
            onClick={onEditClick}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-[10px] tracking-[0.15em] uppercase font-bold text-muted-foreground hover:text-gold hover:border-gold/40 transition-all cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
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
