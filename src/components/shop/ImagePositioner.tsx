import { useState, useEffect, useRef, useCallback } from "react";
import { fabric } from "fabric";
import { X, Check, Move, ZoomIn, ZoomOut, RotateCcw as RotateIcon, Sliders, Sparkles } from "lucide-react";
import type { Shape } from "@/data/products";

interface Props {
  imageUrl: string;
  shape: Shape;
  onClose: () => void;
  onSave: (base64: string) => void;
}

interface GuideBounds { cx: number; cy: number; gw: number; gh: number; }
interface GuideOverlay { svgEl: React.ReactNode; bounds: GuideBounds; w: number; h: number; }
interface AdjState    { brightness: number; contrast: number; saturation: number; }

type Tab = "position" | "adjust" | "filters";

const PRESETS = [
  { id: "original", label: "Original" },
  { id: "bw",       label: "B&W"      },
  { id: "vintage",  label: "Vintage"  },
  { id: "vivid",    label: "Vivid"    },
  { id: "soft",     label: "Soft"     },
  { id: "warm",     label: "Warm"     },
  { id: "cool",     label: "Cool"     },
  { id: "drama",    label: "Drama"    },
];

// ── SVG guide (no Fabric.js) ────────────────────────────────────
function computeGuide(W: number, H: number, shapeId: string): GuideOverlay {
  const capW = Math.min(W * 0.38, 420);
  const capH = Math.min(H * 0.52, 380);
  const cx = W / 2, cy = H / 2;
  const S = { fill: "none", stroke: "rgba(255,138,0,0.95)", strokeWidth: 3, strokeDasharray: "10 5" } as const;

  if (shapeId === "ball") {
    const r = Math.min(capW, capH) / 2;
    return { svgEl: <circle cx={cx} cy={cy} r={r} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />, bounds: { cx, cy, gw: r*2, gh: r*2 }, w: W, h: H };
  }
  if (shapeId.includes("heart")) {
    const gw = Math.min(capW, capH*(1.04/0.84)), gh = gw*(0.84/1.04);
    const l = cx-gw/2, t = cy-gh/2, xs = gw/1.04, ys = gh/0.84;
    const ox = l+0.02*xs, oy = t;
    const pxx = (n: number) => +(ox+n*xs).toFixed(1);
    const pyy = (n: number) => +(oy+n*ys).toFixed(1);
    const d = [`M ${pxx(0.5)} ${pyy(0.22)}`,`C ${pxx(0.5)} ${pyy(0.02)} ${pxx(0.22)} ${pyy(0)} ${pxx(0.08)} ${pyy(0.14)}`,`C ${pxx(-0.02)} ${pyy(0.27)} ${pxx(-0.02)} ${pyy(0.5)} ${pxx(0.5)} ${pyy(0.84)}`,`C ${pxx(1.02)} ${pyy(0.5)} ${pxx(1.02)} ${pyy(0.27)} ${pxx(0.92)} ${pyy(0.14)}`,`C ${pxx(0.78)} ${pyy(0)} ${pxx(0.5)} ${pyy(0.02)} ${pxx(0.5)} ${pyy(0.22)} Z`].join(" ");
    return { svgEl: <path d={d} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />, bounds: { cx, cy, gw, gh }, w: W, h: H };
  }
  if (shapeId.includes("diamond")) {
    const s = Math.min(capW*0.95, capH*0.95);
    const pts = [[cx,cy-s*0.47],[cx+s*0.45,cy-s*0.10],[cx+s*0.28,cy+s*0.47],[cx-s*0.28,cy+s*0.47],[cx-s*0.45,cy-s*0.10]].map(p=>p.join(",")).join(" ");
    return { svgEl: <polygon points={pts} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />, bounds: { cx, cy, gw: s*0.90, gh: s*0.94 }, w: W, h: H };
  }
  if (shapeId === "ornament") {
    const rw = capW/2, rh = Math.min(capH, capW*1.1)/2;
    return { svgEl: <ellipse cx={cx} cy={cy} rx={rw} ry={rh} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />, bounds: { cx, cy, gw: rw*2, gh: rh*2 }, w: W, h: H };
  }
  const isWide=shapeId.includes("wide"), isCandle=shapeId==="candle";
  const isKey=shapeId.includes("key")||shapeId==="heart-necklace", isDogH=shapeId==="dog-bone-horizontal";
  const ratio = isKey?0.44:isDogH?1.6:isCandle?0.38:isWide?1/0.75:0.72;
  let gw: number, gh: number;
  if (isWide||isDogH) { gw=capW; gh=gw/ratio; if(gh>capH){gh=capH;gw=gh*ratio;} }
  else                { gh=capH; gw=gh*ratio; if(gw>capW){gw=capW;gh=gw/ratio;} }
  const l=cx-gw/2, t=cy-gh/2, rx=isCandle?Math.min(gw,gh)/2:8;
  return { svgEl: <rect x={l} y={t} width={gw} height={gh} rx={rx} ry={rx} fill={S.fill} stroke={S.stroke} strokeWidth={S.strokeWidth} strokeDasharray={S.strokeDasharray} />, bounds: { cx, cy, gw, gh }, w: W, h: H };
}

// ── Slider sub-component ────────────────────────────────────────
function AdjSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-white/40 w-20 uppercase tracking-wider shrink-0">{label}</span>
      <input
        type="range" min={-100} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1 rounded-full cursor-pointer accent-[#FF8A00]"
      />
      <span className="text-[10px] text-white/40 w-8 text-right tabular-nums shrink-0">{value > 0 ? `+${value}` : value}</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export function ImagePositioner({ imageUrl, shape, onClose, onSave }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasElRef    = useRef<HTMLCanvasElement>(null);
  const fabricRef      = useRef<fabric.Canvas | null>(null);
  const imgRef         = useRef<fabric.Image | null>(null);
  const guideBoundsRef = useRef<GuideBounds | null>(null);

  const [overlay,      setOverlay]      = useState<GuideOverlay | null>(null);
  const [activeTab,    setActiveTab]    = useState<Tab>("position");
  const [adj,          setAdj]          = useState<AdjState>({ brightness: 0, contrast: 0, saturation: 0 });
  const [activePreset, setActivePreset] = useState("original");

  // ── Apply Fabric.js image filters ──────────────────────────────
  const applyFilters = useCallback((newAdj: AdjState, preset: string) => {
    const img = imgRef.current, c = fabricRef.current;
    if (!img || !c) return;
    const F = fabric.Image.filters as any;
    const filters: any[] = [];

    // Preset
    if      (preset === "bw")      { filters.push(new F.Grayscale()); }
    else if (preset === "vintage")  { filters.push(new F.Sepia()); filters.push(new F.Brightness({ brightness: -0.1 })); filters.push(new F.Contrast({ contrast: 0.1 })); }
    else if (preset === "vivid")    { filters.push(new F.Saturation({ saturation: 0.8 })); filters.push(new F.Contrast({ contrast: 0.2 })); }
    else if (preset === "soft")     { filters.push(new F.Brightness({ brightness: 0.08 })); filters.push(new F.Saturation({ saturation: -0.2 })); }
    else if (preset === "warm")     { filters.push(new F.ColorMatrix({ matrix: [1.1,0,0,0,0.05, 0,1,0,0,0, 0,0,0.85,0,0, 0,0,0,1,0] })); }
    else if (preset === "cool")     { filters.push(new F.ColorMatrix({ matrix: [0.85,0,0,0,0, 0,1,0,0,0, 0,0,1.15,0,0.05, 0,0,0,1,0] })); }
    else if (preset === "drama")    { filters.push(new F.Contrast({ contrast: 0.35 })); filters.push(new F.Saturation({ saturation: -0.2 })); }

    // Adjustments on top of preset
    if (newAdj.brightness !== 0) filters.push(new F.Brightness({ brightness: newAdj.brightness / 100 }));
    if (newAdj.contrast   !== 0) filters.push(new F.Contrast  ({ contrast:   newAdj.contrast   / 100 }));
    if (newAdj.saturation !== 0) filters.push(new F.Saturation ({ saturation: newAdj.saturation / 100 }));

    img.filters = filters;
    img.applyFilters();
    c.renderAll();
  }, []);

  // ── Canvas init ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current, el = canvasElRef.current;
    if (!container || !el) return;
    let canvas: fabric.Canvas | null = null, cancelled = false;

    const init = () => {
      if (cancelled) return;
      const W = container.clientWidth  > 0 ? container.clientWidth  : window.innerWidth;
      const H = container.clientHeight > 0 ? container.clientHeight : window.innerHeight - 120;

      const guide = computeGuide(W, H, shape.id);
      guideBoundsRef.current = guide.bounds;
      setOverlay(guide);

      canvas = new fabric.Canvas(el, { width: W, height: H, backgroundColor: "#141414", selection: false });
      fabricRef.current = canvas;

      const isBlobOrData = imageUrl.startsWith("blob:") || imageUrl.startsWith("data:");
      fabric.Image.fromURL(imageUrl, (img) => {
        if (cancelled || !img || !img.width || !canvas) return;
        const b = guideBoundsRef.current;
        const scale = Math.max((b?.gw ?? W*0.4) / img.width!, (b?.gh ?? H*0.5) / img.height!);
        img.set({ left: b?.cx ?? W/2, top: b?.cy ?? H/2, originX: "center", originY: "center", scaleX: scale, scaleY: scale, cornerColor: "#FF8A00", cornerStrokeColor: "#FF8A00", borderColor: "rgba(255,138,0,0.8)", transparentCorners: false, cornerSize: 12 });
        canvas.add(img);
        imgRef.current = img;
        canvas.setActiveObject(img);
        canvas.renderAll();
      }, isBlobOrData ? {} : { crossOrigin: "anonymous" });

      // Touch pinch-to-zoom
      let lastDist = 0;
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 2 || !canvas) return;
        e.preventDefault();
        const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        if (lastDist > 0) {
          const z = Math.max(0.3, Math.min(8, canvas.getZoom()*(dist/lastDist)));
          const rect = el.getBoundingClientRect();
          canvas.zoomToPoint({ x: (e.touches[0].clientX+e.touches[1].clientX)/2-rect.left, y: (e.touches[0].clientY+e.touches[1].clientY)/2-rect.top } as fabric.Point, z);
        }
        lastDist = dist;
      };
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend",  () => { lastDist = 0; });
    };

    const timer = setTimeout(init, 80);
    return () => { cancelled = true; clearTimeout(timer); try { canvas?.dispose(); } catch {} fabricRef.current = null; imgRef.current = null; guideBoundsRef.current = null; };
  }, [imageUrl, shape.id]);

  // ── Controls ───────────────────────────────────────────────────
  const centerImage = () => {
    const c=fabricRef.current, img=imgRef.current; if(!c||!img)return;
    const b=guideBoundsRef.current;
    img.set({ left: b?.cx??c.getWidth()/2, top: b?.cy??c.getHeight()/2, originX:"center", originY:"center" });
    c.renderAll();
  };
  const zoomImg = (dir: 1|-1) => {
    const img=imgRef.current, c=fabricRef.current; if(!img||!c)return;
    const f=dir>0?1.15:0.87; img.scaleX=(img.scaleX||1)*f; img.scaleY=(img.scaleY||1)*f; c.renderAll();
  };
  const rotateImg = () => {
    const img=imgRef.current, c=fabricRef.current; if(!img||!c)return;
    img.rotate(((img.angle||0)+90)%360); c.renderAll();
  };

  const handleSave = useCallback(() => {
    const c=fabricRef.current, b=guideBoundsRef.current; if(!c)return;
    const cropL=b?Math.max(0,Math.floor(b.cx-b.gw/2)):0, cropT=b?Math.max(0,Math.floor(b.cy-b.gh/2)):0;
    const cropW=b?Math.ceil(b.gw):c.getWidth(), cropH=b?Math.ceil(b.gh):c.getHeight();
    c.setBackgroundColor("#ffffff", ()=>{}); c.renderAll();
    const dataUrl = c.toDataURL({ format:"jpeg", quality:0.95, multiplier:2, left:cropL, top:cropT, width:Math.max(1,cropW), height:Math.max(1,cropH) });
    c.setBackgroundColor("#141414", ()=>{}); c.renderAll();
    onSave(dataUrl);
  }, [onSave]);

  // ── Tab content ─────────────────────────────────────────────────
  const renderTabContent = () => {
    if (activeTab === "position") {
      return (
        <div className="flex items-center justify-center gap-2 py-3 px-4 flex-wrap">
          {([
            { label: "Zoom Out",   Icon: ZoomOut,    action: () => zoomImg(-1) },
            { label: "Center",     Icon: Move,       action: centerImage },
            { label: "Rotate 90°", Icon: RotateIcon, action: rotateImg },
            { label: "Zoom In",    Icon: ZoomIn,     action: () => zoomImg(1) },
          ] as const).map(({ label, Icon, action }) => (
            <button key={label} onClick={action} className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-[11px] transition-all">
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      );
    }

    if (activeTab === "adjust") {
      return (
        <div className="py-4 px-6 space-y-4">
          {(["brightness", "contrast", "saturation"] as const).map(key => (
            <AdjSlider
              key={key}
              label={key}
              value={adj[key]}
              onChange={v => {
                const n = { ...adj, [key]: v };
                setAdj(n);
                applyFilters(n, activePreset);
              }}
            />
          ))}
          <button
            onClick={() => { const z={brightness:0,contrast:0,saturation:0}; setAdj(z); applyFilters(z,activePreset); }}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
          >
            Reset adjustments
          </button>
        </div>
      );
    }

    if (activeTab === "filters") {
      return (
        <div className="flex gap-2 py-3 px-4 overflow-x-auto">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePreset(p.id); applyFilters(adj, p.id); }}
              className={`shrink-0 px-4 py-2 rounded-sm text-[10px] tracking-widest uppercase font-bold transition-all border ${
                activePreset === p.id
                  ? "bg-[#FF8A00] text-black border-[#FF8A00]"
                  : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: "#0c0c0c" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 shrink-0 border-b" style={{ height: 54, borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[11px] transition-colors">
            <X className="w-4 h-4" /> Close
          </button>
          <div className="w-px h-4" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-white/60">Edit & Position</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2 rounded-sm font-bold text-[11px] tracking-wide transition hover:opacity-90"
          style={{ background:"linear-gradient(135deg,#FF9B26,#FF8A00)", color:"#000", boxShadow:"0 4px 20px -4px rgba(255,138,0,0.5)" }}
        >
          <Check className="w-3.5 h-3.5" /> Apply
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ background: "#141414", minHeight: 0 }}>
        <canvas ref={canvasElRef} className="absolute inset-0" />

        {/* SVG guide overlay — always on top */}
        {overlay && (
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }} width={overlay.w} height={overlay.h} viewBox={`0 0 ${overlay.w} ${overlay.h}`}>
            {overlay.svgEl}
          </svg>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[10px] text-white/25 pointer-events-none" style={{ zIndex:11, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", whiteSpace:"nowrap" }}>
          Drag photo · Orange outline = crystal area
        </div>
      </div>

      {/* Tab bar + content */}
      <div className="shrink-0" style={{ background: "#0e0e0e", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {([
            { id: "position", label: "Position", Icon: Move     },
            { id: "adjust",   label: "Adjust",   Icon: Sliders  },
            { id: "filters",  label: "Filters",  Icon: Sparkles },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] tracking-widest uppercase font-bold transition-colors ${
                activeTab === id
                  ? "text-[#FF8A00] border-b-2 border-[#FF8A00]"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
