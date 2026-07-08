import { useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { X, Check, Move, ZoomIn, ZoomOut, RotateCcw as RotateIcon } from "lucide-react";
import type { Shape } from "@/data/products";

interface Props {
  imageUrl: string;
  shape: Shape;
  onClose: () => void;
  onSave: (base64: string) => void;
}

function drawGuide(canvas: fabric.Canvas, shapeId: string) {
  const W = canvas.getWidth();
  const H = canvas.getHeight();
  const margin = 44;

  const style: fabric.IObjectOptions = {
    fill: "rgba(255,138,0,0.05)",
    stroke: "rgba(255,138,0,0.55)",
    strokeWidth: 2,
    strokeDashArray: [8, 4],
    selectable: false,
    evented: false,
    hoverCursor: "default",
    name: "guide",
  };

  if (shapeId === "ball") {
    const r = (Math.min(W, H) - margin * 2) / 2;
    canvas.add(new fabric.Circle({ left: W / 2 - r, top: H / 2 - r, radius: r, ...style }));
    return;
  }

  if (shapeId.includes("heart")) {
    const s = Math.min(W, H) * 0.68;
    const cx = W / 2, cy = H / 2 + s * 0.04;
    const path = `M ${cx} ${cy - s * 0.26}
      C ${cx} ${cy - s * 0.46} ${cx - s * 0.5} ${cy - s * 0.46} ${cx - s * 0.38} ${cy - s * 0.24}
      C ${cx - s * 0.5} ${cy - s * 0.08} ${cx - s * 0.5} ${cy + s * 0.18} ${cx} ${cy + s * 0.44}
      C ${cx + s * 0.5} ${cy + s * 0.18} ${cx + s * 0.5} ${cy - s * 0.08} ${cx + s * 0.38} ${cy - s * 0.24}
      C ${cx + s * 0.5} ${cy - s * 0.46} ${cx} ${cy - s * 0.46} ${cx} ${cy - s * 0.26} Z`;
    canvas.add(new fabric.Path(path, { ...style, left: 0, top: 0 }));
    return;
  }

  if (shapeId.includes("diamond")) {
    const w = W - margin * 2, h = H - margin * 2;
    const x0 = (W - w) / 2, y0 = (H - h) / 2;
    canvas.add(new fabric.Polygon([
      { x: W / 2,           y: y0 + h * 0.05 },
      { x: x0 + w * 0.92,  y: y0 + h * 0.40 },
      { x: x0 + w * 0.78,  y: y0 + h * 0.97 },
      { x: x0 + w * 0.22,  y: y0 + h * 0.97 },
      { x: x0 + w * 0.08,  y: y0 + h * 0.40 },
    ], { ...style }));
    return;
  }

  if (shapeId === "ornament") {
    const rw = (W - margin * 2) / 2, rh = (H - margin * 2) / 2;
    canvas.add(new fabric.Ellipse({ left: W / 2 - rw, top: H / 2 - rh, rx: rw, ry: rh, ...style }));
    return;
  }

  // Rect fallback (tall / wide / prestige / candle / etc.)
  const isWide   = shapeId.includes("wide");
  const isCandle = shapeId === "candle";
  const maxW = W - margin * 2, maxH = H - margin * 2;
  let w: number, h: number;
  if (isCandle)     { w = maxH * 0.38; h = maxH; }
  else if (isWide)  { w = maxW; h = maxW * 0.75; }
  else              { w = maxH * 0.72; h = maxH; }
  if (w > maxW) { h = isWide ? maxW * 0.75 : (maxW / 0.72); w = maxW; }
  if (h > maxH) { w = isWide ? maxH / 0.75 : (maxH * 0.72); h = maxH; }
  const rx = isCandle ? Math.min(w, h) / 2 : 8;
  canvas.add(new fabric.Rect({
    left: (W - w) / 2, top: (H - h) / 2,
    width: w, height: h, rx, ry: rx, ...style,
  }));
}

export function ImagePositioner({ imageUrl, shape, onClose, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef  = useRef<HTMLCanvasElement>(null);
  const fabricRef    = useRef<fabric.Canvas | null>(null);
  const imgRef       = useRef<fabric.Image | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const el        = canvasElRef.current;
    if (!container || !el) return;

    const W = container.clientWidth  || 600;
    const H = container.clientHeight || 520;

    const canvas = new fabric.Canvas(el, {
      width: W, height: H,
      backgroundColor: "#141414",
      selection: false,
    });
    fabricRef.current = canvas;

    fabric.Image.fromURL(imageUrl, (img) => {
      const scale = Math.min((W * 0.72) / img.width!, (H * 0.72) / img.height!);
      img.set({
        left: W / 2, top: H / 2,
        originX: "center", originY: "center",
        scaleX: scale, scaleY: scale,
        cornerColor: "#FF8A00",
        cornerStrokeColor: "#FF8A00",
        borderColor: "rgba(255,138,0,0.8)",
        transparentCorners: false,
        cornerSize: 10,
      });
      canvas.add(img);
      imgRef.current = img;
      drawGuide(canvas, shape.id);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: "anonymous" });

    // Native pinch-to-zoom
    let lastDist = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastDist > 0) {
        const z = Math.max(0.3, Math.min(8, canvas.getZoom() * (dist / lastDist)));
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = el.getBoundingClientRect();
        canvas.zoomToPoint({ x: mx - rect.left, y: my - rect.top } as fabric.Point, z);
      }
      lastDist = dist;
    };
    const onTouchEnd = () => { lastDist = 0; };
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      try { canvas.dispose(); } catch {}
      fabricRef.current = null;
      imgRef.current    = null;
    };
  }, [imageUrl, shape.id]);

  const centerImage = () => {
    const c = fabricRef.current, img = imgRef.current;
    if (!c || !img) return;
    img.set({ left: c.getWidth() / 2, top: c.getHeight() / 2, originX: "center", originY: "center" });
    c.renderAll();
  };

  const zoomImg = (dir: 1 | -1) => {
    const img = imgRef.current, c = fabricRef.current;
    if (!img || !c) return;
    const factor = dir > 0 ? 1.15 : 0.87;
    img.scaleX = (img.scaleX || 1) * factor;
    img.scaleY = (img.scaleY || 1) * factor;
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
    const img = imgRef.current;
    if (!c || !img) return;

    // Crop to just the photo's bounding rect — no surrounding canvas space
    const bnd = img.getBoundingRect(true, true);
    const l = Math.max(0, Math.floor(bnd.left));
    const t = Math.max(0, Math.floor(bnd.top));
    const w = Math.min(c.getWidth()  - l, Math.ceil(bnd.width));
    const h = Math.min(c.getHeight() - t, Math.ceil(bnd.height));

    // Remove guide + clear dark bg before export
    const guides = c.getObjects().filter(o => (o as any).name === "guide");
    guides.forEach(g => c.remove(g));
    c.setBackgroundColor("#ffffff", () => {});
    c.renderAll();

    const dataUrl = c.toDataURL({ format: "jpeg", quality: 0.95, multiplier: 2, left: l, top: t, width: Math.max(1, w), height: Math.max(1, h) });

    // Restore guide + bg
    guides.forEach(g => c.add(g));
    c.setBackgroundColor("#141414", () => {});
    c.renderAll();

    onSave(dataUrl);
  }, [onSave]);

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: "#0c0c0c", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 shrink-0 border-b"
        style={{ height: 54, borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] transition-colors cursor-pointer"
          >
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
          className="flex items-center gap-2 px-5 py-2 rounded-sm font-bold text-[11px] tracking-wide cursor-pointer transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", color: "#000", boxShadow: "0 4px 20px -4px rgba(255,138,0,0.5)" }}
        >
          <Check className="w-3.5 h-3.5" /> Apply Position
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        style={{ background: "#141414" }}
      >
        <canvas ref={canvasElRef} />

        {/* Hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[10px] text-white/30 pointer-events-none"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          Drag to move · Pinch or use buttons to resize · Orange outline = crystal guide
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="shrink-0 flex items-center justify-center gap-2 py-3 px-4 border-t flex-wrap"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0e0e0e" }}
      >
        {[
          { label: "Zoom Out",  Icon: ZoomOut,    action: () => zoomImg(-1)  },
          { label: "Center",    Icon: Move,       action: centerImage         },
          { label: "Rotate 90°",Icon: RotateIcon, action: rotateImg           },
          { label: "Zoom In",   Icon: ZoomIn,     action: () => zoomImg(1)   },
        ].map(({ label, Icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-[11px] cursor-pointer transition-all"
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
