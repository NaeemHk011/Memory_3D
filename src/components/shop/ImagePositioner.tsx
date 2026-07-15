import { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { X, Check, Move, ZoomIn, ZoomOut, RotateCcw as RotateIcon } from "lucide-react";
import type { Shape } from "@/data/products";

interface Props {
  imageUrl: string;
  shape: Shape;
  onClose: () => void;
  onSave: (base64: string) => void;
}

interface GuideBounds {
  cx: number; cy: number;
  gw: number; gh: number;
}

interface GuideOverlay {
  svgEl: React.ReactNode;
  bounds: GuideBounds;
  w: number; h: number; // canvas dimensions for viewBox
}

// Pure function     no Fabric.js, just computes SVG shape + bounds
function computeGuide(W: number, H: number, shapeId: string): GuideOverlay {
  const capW = Math.min(W * 0.38, 420);
  const capH = Math.min(H * 0.52, 380);
  const cx = W / 2;
  const cy = H / 2;

  const S = { fill: "none", stroke: "rgba(255,138,0,0.95)", strokeWidth: 3, strokeDasharray: "10 5" } as const;

  // ── ball ──────────────────────────────────────────────────────
  if (shapeId === "ball") {
    const r = Math.min(capW, capH) / 2;
    return {
      svgEl: <circle cx={cx} cy={cy} r={r} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />,
      bounds: { cx, cy, gw: r * 2, gh: r * 2 },
      w: W, h: H,
    };
  }

  // ── heart ─────────────────────────────────────────────────────
  if (shapeId.includes("heart")) {
    const gw = Math.min(capW, capH * (1.04 / 0.84));
    const gh = gw * (0.84 / 1.04);
    const l  = cx - gw / 2;
    const t  = cy - gh / 2;
    const xs = gw / 1.04;
    const ys = gh / 0.84;
    const ox = l + 0.02 * xs;
    const oy = t;
    const pxx = (n: number) => +(ox + n * xs).toFixed(1);
    const pyy = (n: number) => +(oy + n * ys).toFixed(1);
    const d = [
      `M ${pxx(0.5)} ${pyy(0.22)}`,
      `C ${pxx(0.5)} ${pyy(0.02)} ${pxx(0.22)} ${pyy(0)} ${pxx(0.08)} ${pyy(0.14)}`,
      `C ${pxx(-0.02)} ${pyy(0.27)} ${pxx(-0.02)} ${pyy(0.5)} ${pxx(0.5)} ${pyy(0.84)}`,
      `C ${pxx(1.02)} ${pyy(0.5)} ${pxx(1.02)} ${pyy(0.27)} ${pxx(0.92)} ${pyy(0.14)}`,
      `C ${pxx(0.78)} ${pyy(0)} ${pxx(0.5)} ${pyy(0.02)} ${pxx(0.5)} ${pyy(0.22)} Z`,
    ].join(" ");
    return {
      svgEl: <path d={d} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />,
      bounds: { cx, cy, gw, gh },
      w: W, h: H,
    };
  }

  // ── diamond ───────────────────────────────────────────────────
  if (shapeId.includes("diamond")) {
    const s   = Math.min(capW * 0.95, capH * 0.95);
    const pts = [
      [cx,            cy - s * 0.47],
      [cx + s * 0.45, cy - s * 0.10],
      [cx + s * 0.28, cy + s * 0.47],
      [cx - s * 0.28, cy + s * 0.47],
      [cx - s * 0.45, cy - s * 0.10],
    ].map(p => p.join(",")).join(" ");
    return {
      svgEl: <polygon points={pts} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />,
      bounds: { cx, cy, gw: s * 0.90, gh: s * 0.94 },
      w: W, h: H,
    };
  }

  // ── ornament ──────────────────────────────────────────────────
  if (shapeId === "ornament") {
    const rw = capW / 2;
    const rh = Math.min(capH, capW * 1.1) / 2;
    return {
      svgEl: <ellipse cx={cx} cy={cy} rx={rw} ry={rh} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />,
      bounds: { cx, cy, gw: rw * 2, gh: rh * 2 },
      w: W, h: H,
    };
  }

  // ── rect shapes ───────────────────────────────────────────────
  const isWide   = shapeId.includes("wide");
  const isCandle = shapeId === "candle";
  const isKey    = shapeId.includes("key") || shapeId === "heart-necklace";
  const isDogH   = shapeId === "dog-bone-horizontal";
  const ratio    = isKey ? 0.44 : isDogH ? 1.6 : isCandle ? 0.38 : isWide ? 1 / 0.75 : 0.72;

  let gw: number, gh: number;
  if (isWide || isDogH) {
    gw = capW; gh = gw / ratio;
    if (gh > capH) { gh = capH; gw = gh * ratio; }
  } else {
    gh = capH; gw = gh * ratio;
    if (gw > capW) { gw = capW; gh = gw / ratio; }
  }

  const l  = cx - gw / 2;
  const t  = cy - gh / 2;
  const rx = isCandle ? Math.min(gw, gh) / 2 : 8;

  return {
    svgEl: <rect x={l} y={t} width={gw} height={gh} rx={rx} ry={rx} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />,
    bounds: { cx, cy, gw, gh },
    w: W, h: H,
  };
}

export function ImagePositioner({ imageUrl, shape, onClose, onSave }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasElRef    = useRef<HTMLCanvasElement>(null);
  const fabricRef      = useRef<fabric.Canvas | null>(null);
  const imgRef         = useRef<fabric.Image | null>(null);
  const guideBoundsRef = useRef<GuideBounds | null>(null);

  const [overlay, setOverlay] = useState<GuideOverlay | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const el        = canvasElRef.current;
    if (!container || !el) return;

    let canvas: fabric.Canvas | null = null;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;

      const W = container.clientWidth  > 0 ? container.clientWidth  : window.innerWidth;
      const H = container.clientHeight > 0 ? container.clientHeight : window.innerHeight - 120;

      // Compute guide as SVG     no Fabric.js object needed
      const guide = computeGuide(W, H, shape.id);
      guideBoundsRef.current = guide.bounds;
      setOverlay(guide);

      canvas = new fabric.Canvas(el, {
        width: W,
        height: H,
        backgroundColor: "#141414",
        selection: false,
      });
      fabricRef.current = canvas;

      const isBlobOrData = imageUrl.startsWith("blob:") || imageUrl.startsWith("data:");
      fabric.Image.fromURL(
        imageUrl,
        (img) => {
          if (cancelled || !img || !img.width || !canvas) return;

          const b     = guideBoundsRef.current;
          const targCX = b?.cx ?? W / 2;
          const targCY = b?.cy ?? H / 2;
          const targW  = b?.gw ?? W * 0.40;
          const targH  = b?.gh ?? H * 0.50;

          const scale = Math.max(targW / img.width!, targH / img.height!);

          img.set({
            left: targCX,
            top:  targCY,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
            cornerColor:        "#FF8A00",
            cornerStrokeColor:  "#FF8A00",
            borderColor:        "rgba(255,138,0,0.8)",
            transparentCorners: false,
            cornerSize:         12,
          });

          canvas.add(img);
          imgRef.current = img;
          canvas.setActiveObject(img);
          canvas.renderAll();
        },
        isBlobOrData ? {} : { crossOrigin: "anonymous" },
      );

      // Touch pinch-to-zoom
      let lastDist = 0;
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 2 || !canvas) return;
        e.preventDefault();
        const dx   = e.touches[0].clientX - e.touches[1].clientX;
        const dy   = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastDist > 0) {
          const z    = Math.max(0.3, Math.min(8, canvas.getZoom() * (dist / lastDist)));
          const mx   = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const my   = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const rect = el.getBoundingClientRect();
          canvas.zoomToPoint({ x: mx - rect.left, y: my - rect.top } as fabric.Point, z);
        }
        lastDist = dist;
      };
      const onTouchEnd = () => { lastDist = 0; };
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend",  onTouchEnd);
    };

    const timer = setTimeout(init, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      try { canvas?.dispose(); } catch {}
      fabricRef.current    = null;
      imgRef.current       = null;
      guideBoundsRef.current = null;
    };
  }, [imageUrl, shape.id]);

  const centerImage = () => {
    const c = fabricRef.current, img = imgRef.current;
    if (!c || !img) return;
    const b = guideBoundsRef.current;
    img.set({ left: b?.cx ?? c.getWidth() / 2, top: b?.cy ?? c.getHeight() / 2, originX: "center", originY: "center" });
    c.renderAll();
  };

  const zoomImg = (dir: 1 | -1) => {
    const img = imgRef.current, c = fabricRef.current;
    if (!img || !c) return;
    const f = dir > 0 ? 1.15 : 0.87;
    img.scaleX = (img.scaleX || 1) * f;
    img.scaleY = (img.scaleY || 1) * f;
    c.renderAll();
  };

  const rotateImg = () => {
    const img = imgRef.current, c = fabricRef.current;
    if (!img || !c) return;
    img.rotate(((img.angle || 0) + 90) % 360);
    c.renderAll();
  };

  const handleSave = useCallback(() => {
    const c = fabricRef.current;
    const b = guideBoundsRef.current;
    if (!c) return;

    const cropL = b ? Math.max(0, Math.floor(b.cx - b.gw / 2)) : 0;
    const cropT = b ? Math.max(0, Math.floor(b.cy - b.gh / 2)) : 0;
    const cropW = b ? Math.ceil(b.gw) : c.getWidth();
    const cropH = b ? Math.ceil(b.gh) : c.getHeight();

    c.setBackgroundColor("#ffffff", () => {});
    c.renderAll();

    const dataUrl = c.toDataURL({
      format:     "jpeg",
      quality:    0.95,
      multiplier: 2,
      left:   cropL,
      top:    cropT,
      width:  Math.max(1, cropW),
      height: Math.max(1, cropH),
    });

    c.setBackgroundColor("#141414", () => {});
    c.renderAll();

    onSave(dataUrl);
  }, [onSave]);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: "#0c0c0c" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 shrink-0 border-b"
        style={{ height: 54, borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] transition-colors">
            <X className="w-4 h-4" /> Close
          </button>
          <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-white/60">
              Position on Crystal
            </span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 rounded-sm font-bold text-[11px] tracking-wide transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", color: "#000", boxShadow: "0 4px 20px -4px rgba(255,138,0,0.5)" }}
        >
          <Check className="w-3.5 h-3.5" /> Apply Position
        </button>
      </div>

      {/* Canvas + SVG guide overlay */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: "#141414", minHeight: 0 }}
      >
        <canvas ref={canvasElRef} className="absolute inset-0" />

        {/* SVG guide     sits above canvas via z-index, pointer-events:none so drags pass through */}
        {overlay && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
            width={overlay.w}
            height={overlay.h}
            viewBox={`0 0 ${overlay.w} ${overlay.h}`}
          >
            {overlay.svgEl}
          </svg>
        )}

        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[10px] text-white/30 pointer-events-none"
          style={{ zIndex: 11, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", whiteSpace: "nowrap" }}
        >
          Drag photo inside the orange outline · Orange border = crystal area
        </div>
      </div>

      {/* Controls */}
      <div
        className="shrink-0 flex items-center justify-center gap-2 py-3 px-4 border-t flex-wrap"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0e0e0e" }}
      >
        {[
          { label: "Zoom Out",   Icon: ZoomOut,    action: () => zoomImg(-1) },
          { label: "Center",     Icon: Move,       action: centerImage },
          { label: "Rotate 90°", Icon: RotateIcon, action: rotateImg },
          { label: "Zoom In",    Icon: ZoomIn,     action: () => zoomImg(1) },
        ].map(({ label, Icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-[11px] transition-all"
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
