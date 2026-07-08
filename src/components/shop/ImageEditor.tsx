import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  X, RotateCcw, RotateCw, Check, Undo2, Redo2,
  Type, Scissors, SlidersHorizontal, Palette,
  FlipHorizontal, FlipVertical, ZoomIn, ZoomOut,
  RotateCcw as ResetIcon, Trash2, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronUp,
  Loader2,
} from "lucide-react";

/* ─────────────────── Types ─────────────────────────────── */
interface Props {
  imageUrl: string;
  onClose: () => void;
  onSave: (base64: string) => void;
}

interface Filters {
  brightness: number;   // -100 – +100
  contrast:   number;
  saturation: number;
  vibrance:   number;
  warmth:     number;   // hue-rotation proxy
  blur:       number;   // 0 – 20
  noise:      number;   // 0 – 100
  sharpen:    boolean;
  grayscale:  boolean;
  sepia:      boolean;
  invert:     boolean;
}

interface EditorState {
  filters:  Filters;
  rotation: number;   // 0 90 180 270
  flipH:    boolean;
  flipV:    boolean;
}

const DF: Filters = {
  brightness: 0, contrast: 0, saturation: 0,
  vibrance: 0, warmth: 0, blur: 0, noise: 0,
  sharpen: false, grayscale: false, sepia: false, invert: false,
};
const INIT: EditorState = { filters: { ...DF }, rotation: 0, flipH: false, flipV: false };

type Preset = { label: string; filters: Filters };
const PRESETS: Preset[] = [
  { label: "Original", filters: { ...DF } },
  { label: "B&W",      filters: { ...DF, grayscale: true, contrast: 10 } },
  { label: "Vintage",  filters: { ...DF, brightness: -5, contrast: 10, saturation: -30, warmth: 25, sepia: true } },
  { label: "Vivid",    filters: { ...DF, brightness: 5,  contrast: 15, saturation: 40, vibrance: 30 } },
  { label: "Soft",     filters: { ...DF, brightness: 10, contrast: -10, saturation: -15, blur: 2 } },
  { label: "Matte",    filters: { ...DF, brightness: 5,  contrast: -20, saturation: -20 } },
  { label: "Drama",    filters: { ...DF, contrast: 30, vibrance: 20, saturation: 10 } },
  { label: "Warm",     filters: { ...DF, warmth: 40, saturation: 10, brightness: 5 } },
  { label: "Cool",     filters: { ...DF, warmth: -40, saturation: 5 } },
  { label: "Invert",   filters: { ...DF, invert: true } },
];

/* ─── Fonts with categories ──────────────────────────────── */
const FONTS: { value: string; label: string; cat: string }[] = [
  { value: "Inter",               label: "Inter",               cat: "Sans"       },
  { value: "Montserrat",          label: "Montserrat",          cat: "Sans"       },
  { value: "Raleway",             label: "Raleway",             cat: "Sans"       },
  { value: "Oswald",              label: "Oswald",              cat: "Sans"       },
  { value: "Cormorant Garamond",  label: "Cormorant Garamond",  cat: "Serif"      },
  { value: "Playfair Display",    label: "Playfair Display",    cat: "Serif"      },
  { value: "Merriweather",        label: "Merriweather",        cat: "Serif"      },
  { value: "Cinzel",              label: "Cinzel",              cat: "Serif"      },
  { value: "Georgia",             label: "Georgia",             cat: "Serif"      },
  { value: "Bebas Neue",          label: "Bebas Neue",          cat: "Display"    },
  { value: "Dancing Script",      label: "Dancing Script",      cat: "Script"     },
  { value: "Great Vibes",         label: "Great Vibes",         cat: "Script"     },
  { value: "Pacifico",            label: "Pacifico",            cat: "Script"     },
  { value: "Lobster",             label: "Lobster",             cat: "Script"     },
  { value: "Permanent Marker",    label: "Permanent Marker",    cat: "Handwritten"},
];

/* ─── Quick text style presets ───────────────────────────── */
const TEXT_STYLES = [
  { name: "Minimal",     preview: "Minimal",         font: "Inter",              size: 38, color: "#ffffff", bold: false, italic: false },
  { name: "Elegant",     preview: "Elegant",         font: "Cormorant Garamond", size: 46, color: "#D4AF37", bold: false, italic: true  },
  { name: "Bold",        preview: "BOLD",            font: "Bebas Neue",         size: 54, color: "#ffffff", bold: false, italic: false },
  { name: "Script",      preview: "Script",          font: "Dancing Script",     size: 46, color: "#ffffff", bold: false, italic: false },
  { name: "Luxury",      preview: "LUXURY",          font: "Cinzel",             size: 34, color: "#C8A96E", bold: true,  italic: false },
  { name: "Modern",      preview: "Modern",          font: "Montserrat",         size: 36, color: "#ffffff", bold: true,  italic: false },
  { name: "Playful",     preview: "Playful",         font: "Pacifico",           size: 34, color: "#FFB347", bold: false, italic: false },
  { name: "Classic",     preview: "Classic",         font: "Playfair Display",   size: 36, color: "#ffffff", bold: false, italic: false },
  { name: "Calligraphy", preview: "Calligraphy",     font: "Great Vibes",        size: 46, color: "#ffffff", bold: false, italic: false },
  { name: "Marker",      preview: "Marker",          font: "Permanent Marker",   size: 32, color: "#ffffff", bold: false, italic: false },
];

const ASPECT_RATIOS: { label: string; ratio: number | undefined }[] = [
  { label: "Free",  ratio: undefined },
  { label: "1 : 1", ratio: 1 },
  { label: "4 : 3", ratio: 4 / 3 },
  { label: "3 : 4", ratio: 3 / 4 },
  { label: "16 : 9",ratio: 16 / 9 },
  { label: "9 : 16",ratio: 9 / 16 },
];

/* ─── filters → CSS string (for live thumbnails) ─────────── */
function filtersToCss(f: Filters): string {
  const p: string[] = [];
  if (f.brightness !== 0) p.push(`brightness(${1 + f.brightness / 100})`);
  if (f.contrast   !== 0) p.push(`contrast(${1 + f.contrast / 100})`);
  if (f.saturation !== 0) p.push(`saturate(${Math.max(0, 1 + f.saturation / 100)})`);
  if (f.warmth     !== 0) p.push(`hue-rotate(${f.warmth * 0.3}deg) sepia(${Math.abs(f.warmth) / 300})`);
  if (f.blur        > 0)  p.push(`blur(${f.blur * 0.25}px)`);
  if (f.grayscale)         p.push("grayscale(1)");
  if (f.sepia)             p.push("sepia(0.8)");
  if (f.invert)            p.push("invert(1)");
  return p.join(" ") || "none";
}

/* ─── Apply filters to Fabric.js image ───────────────────── */
function applyFabricFilters(img: fabric.Image, f: Filters) {
  (img as any).filters = [];
  const push = (filter: any) => (img as any).filters.push(filter);
  const F = fabric.Image.filters as any;

  if (f.brightness !== 0) push(new F.Brightness({ brightness: f.brightness / 100 }));
  if (f.contrast   !== 0) push(new F.Contrast  ({ contrast:   f.contrast / 100 }));
  if (f.saturation !== 0) push(new F.Saturation ({ saturation: f.saturation / 100 }));
  if (f.vibrance   !== 0) push(new F.Vibrance   ({ vibrance:   f.vibrance / 100 }));
  if (f.warmth     !== 0) push(new F.HueRotation({ rotation:   f.warmth / 500 }));
  if (f.blur        > 0)  push(new F.Blur        ({ blur:       f.blur / 100 }));
  if (f.noise       > 0)  push(new F.Noise       ({ noise:      f.noise }));
  if (f.grayscale)         push(new F.Grayscale());
  if (f.sepia)             push(new F.Sepia());
  if (f.invert)            push(new F.Invert());
  if (f.sharpen)           push(new F.Convolute ({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] }));

  img.applyFilters();
}

/* ─── Radix Slider component ─────────────────────────────── */
function AdjustSlider({
  label, value, min = -100, max = 100, step = 1,
  onChange, unit = "",
}: {
  label: string; value: number; min?: number; max?: number;
  step?: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-white/50">{label}</span>
        <span className="text-[11px] font-mono text-[#FF8A00] min-w-[36px] text-right">
          {value > 0 ? `+${value}` : value}{unit}
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center cursor-pointer"
        min={min} max={max} step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track className="relative h-[3px] w-full grow rounded-full bg-white/10">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-[#FF8A00]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-4 w-4 rounded-full border-2 border-[#FF8A00] bg-[#1a1a1a] shadow-md focus:outline-none transition-transform hover:scale-110 active:scale-95"
        />
      </SliderPrimitive.Root>
    </div>
  );
}

/* ─── Collapsible section ─────────────────────────────────── */
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/40">{title}</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-white/30" />
          : <ChevronDown className="w-3.5 h-3.5 text-white/30" />
        }
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

/* ─── Toggle button ─────────────────────────────────────── */
function ToggleBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm border text-[11px] transition-all cursor-pointer select-none ${
        active
          ? "bg-[rgba(255,138,0,0.15)] border-[rgba(255,138,0,0.5)] text-[#FF8A00]"
          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

type Tab = "adjust" | "filters" | "crop" | "text";

/* ════════════════════════ MAIN COMPONENT ═══════════════════ */
export function ImageEditor({ imageUrl, onClose, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef  = useRef<HTMLCanvasElement>(null);
  const fabricRef    = useRef<fabric.Canvas | null>(null);
  const fabricImgRef = useRef<fabric.Image | null>(null);
  const cropperRef   = useRef<any>(null);

  const [ready,     setReady]     = useState(false);
  const [tab,       setTab]       = useState<Tab>("adjust");
  const [cropMode,  setCropMode]  = useState(false);
  const [cropRatio, setCropRatio] = useState<number | undefined>(undefined);
  const [currentSrc, setCurrentSrc] = useState(imageUrl);

  /* History */
  const [history, setHistory] = useState<EditorState[]>([INIT]);
  const [histIdx, setHistIdx] = useState(0);
  const state = history[histIdx];

  /* Text */
  const [textInput,      setTextInput]      = useState("Your text");
  const [textFont,       setTextFont]       = useState("Inter");
  const [textSize,       setTextSize]       = useState(40);
  const [textColor,      setTextColor]      = useState("#ffffff");
  const [textBold,       setTextBold]       = useState(false);
  const [textItalic,     setTextItalic]     = useState(false);
  const [textAlign,      setTextAlign]      = useState<"left" | "center" | "right">("center");
  const [hasSelectedText,  setHasSelectedText]  = useState(false);
  const [fontDropOpen,     setFontDropOpen]     = useState(false);
  const selectedTextRef = useRef<fabric.IText | null>(null);

  /* Apply props to currently selected text on canvas */
  const applyToSelected = useCallback((props: Record<string, unknown>) => {
    const obj = fabricRef.current?.getActiveObject() as any;
    if (!obj || (obj.type !== "i-text" && obj.type !== "textbox")) return;
    obj.set(props);
    fabricRef.current?.renderAll();
  }, []);

  /* Load extra Google Fonts once */
  useEffect(() => {
    const id = "editor-gfonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id   = id;
    link.rel  = "stylesheet";
    link.href = [
      "https://fonts.googleapis.com/css2?",
      "family=Dancing+Script:wght@400;600;700",
      "&family=Oswald:wght@300;400;600",
      "&family=Lobster",
      "&family=Pacifico",
      "&family=Merriweather:ital,wght@0,300;0,700;1,300",
      "&family=Montserrat:wght@300;400;600;700;900",
      "&family=Raleway:wght@300;400;600;700",
      "&family=Permanent+Marker",
      "&family=Great+Vibes",
      "&family=Cinzel:wght@400;600;700",
      "&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600",
      "&family=Playfair+Display:ital,wght@0,400;0,700;1,400",
      "&family=Bebas+Neue",
      "&display=swap",
    ].join("");
    document.head.appendChild(link);
  }, []);

  /* ── History helpers ── */
  const push = useCallback((next: EditorState) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next]);
    setHistIdx(i => i + 1);
  }, [histIdx]);

  const undo = () => histIdx > 0 && setHistIdx(i => i - 1);
  const redo = () => histIdx < history.length - 1 && setHistIdx(i => i + 1);

  /* ── Init Fabric canvas ── */
  useEffect(() => {
    let alive = true;
    setReady(false);

    const container = containerRef.current;
    const el        = canvasElRef.current;
    if (!container || !el) return;

    if (fabricRef.current) {
      try { fabricRef.current.dispose(); } catch {}
      fabricRef.current = null;
    }

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 600;

    const canvas = new fabric.Canvas(el, {
      width: W, height: H,
      backgroundColor: "#1a1a1a",
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;

    /* Delete key removes selected text */
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if ((e.key === "Delete" || e.key === "Backspace") && tag !== "INPUT" && tag !== "TEXTAREA") {
        const obj = canvas.getActiveObject();
        if (obj && obj !== fabricImgRef.current && (obj as any).type !== "i-text") {
          canvas.remove(obj);
          canvas.renderAll();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    /* ── Text selection sync ── */
    const syncTextToPanel = (obj: any) => {
      if (!obj || (obj.type !== "i-text" && obj.type !== "textbox")) return;
      selectedTextRef.current = obj;
      setHasSelectedText(true);
      setTextFont(obj.fontFamily || "Inter");
      setTextSize(obj.fontSize || 40);
      setTextColor((obj.fill as string) || "#ffffff");
      setTextBold(obj.fontWeight === "bold");
      setTextItalic(obj.fontStyle === "italic");
      setTextAlign((obj.textAlign as "left" | "center" | "right") || "center");
      setTab("text");
    };

    canvas.on("selection:created", (e: any) => syncTextToPanel(e.selected?.[0]));
    canvas.on("selection:updated", (e: any) => syncTextToPanel(e.selected?.[0]));
    canvas.on("selection:cleared", () => {
      selectedTextRef.current = null;
      setHasSelectedText(false);
    });

    fabric.Image.fromURL(
      currentSrc,
      (img) => {
        if (!alive) return;
        const scale = Math.min(W / img.width!, H / img.height!) * 0.88;
        img.set({
          left: W / 2, top: H / 2,
          originX: "center", originY: "center",
          scaleX: scale, scaleY: scale,
          selectable: false, evented: false,
          angle: state.rotation, flipX: state.flipH, flipY: state.flipV,
        });
        applyFabricFilters(img, state.filters);
        canvas.add(img);
        canvas.sendToBack(img);
        fabricImgRef.current = img;
        canvas.renderAll();
        setReady(true);
      },
      { crossOrigin: "anonymous" }
    );

    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey);
      try { canvas.dispose(); } catch {}
      fabricRef.current    = null;
      fabricImgRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  /* Sync filters */
  useEffect(() => {
    const img = fabricImgRef.current;
    if (!img || !ready) return;
    applyFabricFilters(img, state.filters);
    fabricRef.current?.renderAll();
  }, [state.filters, ready]);

  /* Sync transform */
  useEffect(() => {
    const img = fabricImgRef.current;
    if (!img || !ready) return;
    img.set({ angle: state.rotation, flipX: state.flipH, flipY: state.flipV });
    fabricRef.current?.renderAll();
  }, [state.rotation, state.flipH, state.flipV, ready]);

  /* ── Handlers ── */
  const setFilter = (key: keyof Filters, val: number | boolean) =>
    push({ ...state, filters: { ...state.filters, [key]: val } });

  const applyPreset = (f: Filters) =>
    push({ ...state, filters: { ...f } });

  const rotate = (dir: 1 | -1) =>
    push({ ...state, rotation: (state.rotation + dir * 90 + 360) % 360 });

  const flip = (axis: "H" | "V") =>
    push({ ...state, ...(axis === "H" ? { flipH: !state.flipH } : { flipV: !state.flipV }) });

  const resetAll = () => push(INIT);

  const zoom = (dir: 1 | -1) => {
    const c = fabricRef.current;
    if (!c) return;
    const z = Math.max(0.3, Math.min(5, c.getZoom() + dir * 0.2));
    c.zoomToPoint({ x: c.getWidth() / 2, y: c.getHeight() / 2 } as fabric.Point, z);
  };

  const resetZoom = () => {
    fabricRef.current?.setZoom(1);
    fabricRef.current?.setViewportTransform([1, 0, 0, 1, 0, 0]);
  };

  /* Apply a full text style preset */
  const applyTextStyle = (s: typeof TEXT_STYLES[0]) => {
    setTextFont(s.font);
    setTextSize(s.size);
    setTextColor(s.color);
    setTextBold(s.bold);
    setTextItalic(s.italic);
    applyToSelected({
      fontFamily: s.font,
      fontSize:   s.size,
      fill:       s.color,
      fontWeight: s.bold   ? "bold"   : "normal",
      fontStyle:  s.italic ? "italic" : "normal",
    });
  };

  /* Text property handlers — update state AND apply to canvas if text selected */
  const txtFont = (v: string) => { setTextFont(v);  setFontDropOpen(false); applyToSelected({ fontFamily: v }); };
  const txtSize = (v: number) => { setTextSize(v);  applyToSelected({ fontSize: v }); };
  const txtColor= (v: string) => { setTextColor(v); applyToSelected({ fill: v }); };
  const txtBold = () => {
    const next = !textBold;
    setTextBold(next);
    applyToSelected({ fontWeight: next ? "bold" : "normal" });
  };
  const txtItalic = () => {
    const next = !textItalic;
    setTextItalic(next);
    applyToSelected({ fontStyle: next ? "italic" : "normal" });
  };
  const txtAlign = (v: "left" | "center" | "right") => {
    setTextAlign(v);
    applyToSelected({ textAlign: v });
  };

  const addText = () => {
    const c = fabricRef.current;
    if (!c) return;
    const t = new fabric.IText(textInput || "Text", {
      left: c.getWidth() / 2, top: c.getHeight() / 2,
      originX: "center", originY: "center",
      fontFamily: textFont, fontSize: textSize,
      fill: textColor,
      fontWeight: textBold ? "bold" : "normal",
      fontStyle: textItalic ? "italic" : "normal",
      textAlign: textAlign,
    });
    c.add(t);
    c.setActiveObject(t);
    c.renderAll();
  };

  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    const obj = c.getActiveObject();
    if (obj && obj !== fabricImgRef.current) {
      c.remove(obj);
      c.renderAll();
      setHasSelectedText(false);
    }
  };

  const applyCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const dataUrl = cropper
      .getCroppedCanvas({ maxWidth: 4096, maxHeight: 4096 })
      .toDataURL("image/jpeg", 0.92);
    setCurrentSrc(dataUrl);
    setHistory([INIT]);
    setHistIdx(0);
    setCropMode(false);
    setTab("adjust");
  };

  const handleSave = useCallback(() => {
    const c = fabricRef.current;
    if (!c) return;

    // Find bounding box of all content (image + text overlays)
    const objects = c.getObjects();
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    objects.forEach(obj => {
      const bnd = obj.getBoundingRect(true, true);
      l = Math.min(l, bnd.left);
      t = Math.min(t, bnd.top);
      r = Math.max(r, bnd.left + bnd.width);
      b = Math.max(b, bnd.top  + bnd.height);
    });
    l = Math.max(0, Math.floor(l));
    t = Math.max(0, Math.floor(t));
    r = Math.min(c.getWidth(),  Math.ceil(r));
    b = Math.min(c.getHeight(), Math.ceil(b));

    // Temporarily use white background so no dark canvas bg leaks into JPEG
    c.setBackgroundColor("#ffffff", () => {});
    c.renderAll();

    const dataUrl = c.toDataURL({
      format: "jpeg",
      quality: 0.95,
      multiplier: 2,
      left:   l,
      top:    t,
      width:  Math.max(1, r - l),
      height: Math.max(1, b - t),
    });

    c.setBackgroundColor("#1a1a1a", () => {});
    c.renderAll();

    onSave(dataUrl);
  }, [onSave]);

  /* ── Tab icons / labels ── */
  const TABS: { id: Tab; Icon: any; label: string }[] = [
    { id: "adjust",  Icon: SlidersHorizontal, label: "Adjust"  },
    { id: "filters", Icon: Palette,           label: "Filters" },
    { id: "crop",    Icon: Scissors,          label: "Crop"    },
    { id: "text",    Icon: Type,              label: "Text"    },
  ];

  /* ═══════════════════════ JSX ═══════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "#0c0c0c", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* ════ HEADER ════ */}
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
          <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-white/60">
            Image Editor
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={undo} disabled={histIdx === 0}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-sm border text-[10px] transition-all cursor-pointer select-none ${histIdx === 0 ? "opacity-25 pointer-events-none border-white/5 text-white/30" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"}`}
          >
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={redo} disabled={histIdx >= history.length - 1}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-sm border text-[10px] transition-all cursor-pointer select-none ${histIdx >= history.length - 1 ? "opacity-25 pointer-events-none border-white/5 text-white/30" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"}`}
          >
            <Redo2 className="w-3.5 h-3.5" /> Redo
          </button>

          <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-sm font-bold text-[11px] tracking-wide transition hover:opacity-90 cursor-pointer"
            style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", color: "#000", boxShadow: "0 4px 20px -4px rgba(255,138,0,0.5)" }}
          >
            <Check className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {/* ════ BODY ════ */}
      <div className="flex-1 flex min-h-0">

        {/* ════ LEFT VERTICAL TAB BAR ════ */}
        <div
          className="shrink-0 flex flex-col items-center py-3 gap-1 border-r"
          style={{ width: 72, background: "#0e0e0e", borderColor: "rgba(255,255,255,0.07)" }}
        >
          {TABS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); if (id !== "crop") setCropMode(false); }}
              className={`w-full flex flex-col items-center justify-center gap-1.5 py-4 px-1 text-[8px] tracking-[0.12em] uppercase font-bold transition-all cursor-pointer relative ${
                tab === id
                  ? "text-[#FF8A00]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {tab === id && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                  style={{ background: "#FF8A00" }}
                />
              )}
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                  tab === id
                    ? "bg-[rgba(255,138,0,0.12)]"
                    : "hover:bg-white/5"
                }`}
              >
                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              </div>
              {label}
            </button>
          ))}
        </div>

        {/* ════ CONTENT PANEL ════ */}
        <div
          className="shrink-0 flex flex-col border-r"
          style={{ width: 280, background: "#111", borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Panel title */}
          <div
            className="px-4 shrink-0 flex items-center border-b"
            style={{ height: 44, borderColor: "rgba(255,255,255,0.07)" }}
          >
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-white/40">
              {tab === "adjust" ? "Adjustments" : tab === "filters" ? "Filters" : tab === "crop" ? "Crop" : "Text"}
            </span>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>

            {/* ══ ADJUST TAB ══ */}
            {tab === "adjust" && (
              <div className="p-4 space-y-1">
                <Section title="Light">
                  <AdjustSlider label="Brightness" value={state.filters.brightness} onChange={v => setFilter("brightness", v)} />
                  <AdjustSlider label="Contrast"   value={state.filters.contrast}   onChange={v => setFilter("contrast", v)} />
                </Section>

                <Section title="Color">
                  <AdjustSlider label="Saturation" value={state.filters.saturation} onChange={v => setFilter("saturation", v)} />
                  <AdjustSlider label="Vibrance"   value={state.filters.vibrance}   onChange={v => setFilter("vibrance", v)} />
                  <AdjustSlider label="Warmth"     value={state.filters.warmth}     onChange={v => setFilter("warmth", v)} />
                </Section>

                <Section title="Detail">
                  <AdjustSlider label="Blur"  value={state.filters.blur}  min={0} max={20} onChange={v => setFilter("blur", v)} />
                  <AdjustSlider label="Noise" value={state.filters.noise} min={0} max={100} onChange={v => setFilter("noise", v)} />
                  <div className="flex gap-2 pt-1">
                    <ToggleBtn active={state.filters.sharpen} onClick={() => setFilter("sharpen", !state.filters.sharpen)}>
                      Sharpen
                    </ToggleBtn>
                    <ToggleBtn active={state.filters.grayscale} onClick={() => setFilter("grayscale", !state.filters.grayscale)}>
                      B&amp;W
                    </ToggleBtn>
                    <ToggleBtn active={state.filters.sepia} onClick={() => setFilter("sepia", !state.filters.sepia)}>
                      Sepia
                    </ToggleBtn>
                  </div>
                  <ToggleBtn active={state.filters.invert} onClick={() => setFilter("invert", !state.filters.invert)}>
                    Invert Colors
                  </ToggleBtn>
                </Section>

                <Section title="Transform">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => rotate(-1)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/60 hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Left 90°
                    </button>
                    <button
                      onClick={() => rotate(1)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/60 hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Right 90°
                    </button>
                    <ToggleBtn active={state.flipH} onClick={() => flip("H")}>
                      <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                    </ToggleBtn>
                    <ToggleBtn active={state.flipV} onClick={() => flip("V")}>
                      <FlipVertical className="w-3.5 h-3.5" /> Flip V
                    </ToggleBtn>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => zoom(1)}
                      className="flex items-center justify-center gap-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/60 hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => zoom(-1)}
                      className="flex items-center justify-center gap-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/60 hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={resetZoom}
                      className="flex items-center justify-center gap-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/60 hover:text-white text-[10px] transition-all cursor-pointer"
                    >
                      1:1
                    </button>
                  </div>
                </Section>

                <div className="pt-3 pb-1">
                  <button
                    onClick={resetAll}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white/40 hover:text-white text-[11px] transition-all cursor-pointer"
                  >
                    <ResetIcon className="w-3.5 h-3.5" /> Reset All Adjustments
                  </button>
                </div>
              </div>
            )}

            {/* ══ FILTERS TAB ══ */}
            {tab === "filters" && (
              <div className="p-4">
                <p className="text-[10px] text-white/30 mb-4">
                  Click any style to apply it to your image instantly.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {PRESETS.map(({ label, filters }) => (
                    <button
                      key={label}
                      onClick={() => applyPreset(filters)}
                      className="group relative overflow-hidden rounded-sm border border-white/10 hover:border-[#FF8A00]/60 transition-all cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={currentSrc}
                          alt={label}
                          className="w-full h-full object-cover"
                          style={{ filter: filtersToCss(filters) }}
                          draggable={false}
                        />
                      </div>
                      <div
                        className="py-1.5 px-2 text-center text-[10px] font-semibold text-white/60 group-hover:text-[#FF8A00] transition-colors"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                      >
                        {label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ══ CROP TAB ══ */}
            {tab === "crop" && (
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-[10px] text-white/30 mb-3 uppercase tracking-wider">Aspect Ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(({ label, ratio }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setCropRatio(ratio);
                          if (cropMode && cropperRef.current?.cropper) {
                            cropperRef.current.cropper.setAspectRatio(ratio ?? NaN);
                          }
                        }}
                        className={`py-2 text-[10px] rounded-sm border transition-all cursor-pointer ${
                          cropRatio === ratio
                            ? "bg-[rgba(255,138,0,0.15)] border-[rgba(255,138,0,0.5)] text-[#FF8A00]"
                            : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="p-3 rounded-sm text-[10px] text-white/30 leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  Drag the crop handles to select the area. You can also drag inside to move.
                </div>

                {!cropMode ? (
                  <button
                    onClick={() => setCropMode(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-[rgba(255,138,0,0.4)] text-[#FF8A00] text-[11px] font-semibold hover:bg-[rgba(255,138,0,0.1)] transition-all cursor-pointer"
                  >
                    <Scissors className="w-4 h-4" /> Start Cropping
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={applyCrop}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-sm font-bold text-[11px] transition hover:opacity-90 cursor-pointer"
                      style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", color: "#000" }}
                    >
                      <Check className="w-4 h-4" /> Apply Crop
                    </button>
                    <button
                      onClick={() => setCropMode(false)}
                      className="w-full py-2.5 rounded-sm border border-white/10 text-white/40 hover:text-white text-[11px] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══ TEXT TAB ══ */}
            {tab === "text" && (
              <div className="p-4 space-y-5">

                {hasSelectedText ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: "rgba(255,138,0,0.08)", border: "1px solid rgba(255,138,0,0.25)" }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] animate-pulse shrink-0" />
                    <span className="text-[10px] text-[#FF8A00]">Text selected — all changes apply live</span>
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-sm text-[10px] text-white/25" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    Click text on canvas to edit it, or type below &amp; click Add.
                  </div>
                )}

                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  rows={2}
                  placeholder="Type your text here..."
                  className="w-full rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none resize-none transition-colors"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", fontFamily: textFont }}
                />

                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2.5">Quick Styles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEXT_STYLES.map(s => (
                      <button
                        key={s.name}
                        onClick={() => applyTextStyle(s)}
                        className="group relative overflow-hidden rounded-sm border border-white/8 hover:border-[#FF8A00]/50 transition-all cursor-pointer"
                        style={{ background: "#1a1a1a", minHeight: 64 }}
                      >
                        <div className="flex flex-col items-center justify-center h-full py-3 px-2 gap-1">
                          <span style={{
                            fontFamily: s.font,
                            fontSize: Math.min(s.size * 0.42, 20),
                            color: s.color,
                            fontWeight: s.bold ? "bold" : "normal",
                            fontStyle: s.italic ? "italic" : "normal",
                            lineHeight: 1.1,
                          }}>
                            {s.preview}
                          </span>
                          <span className="text-[8px] text-white/25 uppercase tracking-wider group-hover:text-white/50 transition-colors">
                            {s.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Font</p>
                  <div className="relative">
                    <button
                      onClick={() => setFontDropOpen(v => !v)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm border cursor-pointer transition-colors hover:border-white/20"
                      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <span className="text-sm text-white" style={{ fontFamily: textFont }}>{textFont}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${fontDropOpen ? "rotate-180" : ""}`} />
                    </button>

                    {fontDropOpen && (
                      <div
                        className="absolute z-50 left-0 right-0 top-full mt-1 rounded-sm border overflow-hidden"
                        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
                      >
                        <div className="overflow-y-auto" style={{ maxHeight: 220, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                          {["Sans", "Serif", "Display", "Script", "Handwritten"].map(cat => {
                            const items = FONTS.filter(f => f.cat === cat);
                            if (!items.length) return null;
                            return (
                              <div key={cat}>
                                <div className="px-3 py-1.5 text-[8px] tracking-[0.2em] uppercase text-white/20 sticky top-0" style={{ background: "#141414" }}>
                                  {cat}
                                </div>
                                {items.map(f => (
                                  <button
                                    key={f.value}
                                    onClick={() => txtFont(f.value)}
                                    className={`w-full text-left px-3 py-2.5 text-[15px] hover:bg-white/5 cursor-pointer transition-colors ${textFont === f.value ? "text-[#FF8A00] bg-[rgba(255,138,0,0.05)]" : "text-white/70"}`}
                                    style={{ fontFamily: f.value }}
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Size</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => txtSize(Math.max(8, textSize - 4))} className="w-8 h-9 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white/60 hover:text-white text-base cursor-pointer transition-colors">−</button>
                      <input
                        type="number" min={8} max={300} value={textSize}
                        onChange={e => txtSize(+e.target.value)}
                        className="flex-1 text-center rounded-sm py-2 text-sm text-white focus:outline-none"
                        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
                      />
                      <button onClick={() => txtSize(Math.min(300, textSize + 4))} className="w-8 h-9 flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white/60 hover:text-white text-base cursor-pointer transition-colors">+</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-2">Color</p>
                    <div className="relative">
                      <input type="color" value={textColor} onChange={e => txtColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="h-9 rounded-sm border border-white/10 flex items-center px-2.5 gap-2 cursor-pointer" style={{ background: "#1a1a1a" }}>
                        <div className="w-5 h-5 rounded border border-white/20 shrink-0" style={{ background: textColor }} />
                        <span className="text-[10px] text-white/40 font-mono uppercase">{textColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {["#ffffff","#000000","#FF8A00","#D4AF37","#C8A96E","#FFB347","#ff4444","#44bbff","#44ff88","#cc88ff"].map(c => (
                    <button key={c} onClick={() => txtColor(c)} title={c} className="w-6 h-6 rounded-sm border cursor-pointer transition-all hover:scale-110" style={{ background: c, borderColor: textColor === c ? "#FF8A00" : "rgba(255,255,255,0.15)", boxShadow: textColor === c ? "0 0 0 2px #FF8A00" : "none" }} />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <ToggleBtn active={textBold} onClick={txtBold}><Bold className="w-3.5 h-3.5" /></ToggleBtn>
                    <ToggleBtn active={textItalic} onClick={txtItalic}><Italic className="w-3.5 h-3.5" /></ToggleBtn>
                  </div>
                  <div className="flex gap-1.5">
                    {(["left","center","right"] as const).map(a => {
                      const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                      return <ToggleBtn key={a} active={textAlign === a} onClick={() => txtAlign(a)}><Icon className="w-3.5 h-3.5" /></ToggleBtn>;
                    })}
                  </div>
                </div>

                <div className="rounded-sm overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", minHeight: 64 }}>
                  <div className="px-2 py-1.5" style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className="text-[8px] tracking-[0.2em] uppercase text-white/20">Preview</span>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <span style={{
                      fontFamily: textFont,
                      fontSize: Math.min(textSize * 0.5, 26),
                      color: textColor,
                      fontWeight: textBold ? "bold" : "normal",
                      fontStyle: textItalic ? "italic" : "normal",
                      textAlign: textAlign,
                      display: "block", width: "100%", lineHeight: 1.2,
                    }}>
                      {textInput || "Preview Text"}
                    </span>
                  </div>
                </div>

                <button onClick={addText} className="w-full flex items-center justify-center gap-2 py-3 rounded-sm font-bold text-[11px] tracking-wide transition hover:opacity-90 cursor-pointer" style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", color: "#000" }}>
                  <Type className="w-4 h-4" /> Add Text to Image
                </button>

                <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 text-[11px] transition-all cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected Text
                </button>

                <p className="text-[9px] text-white/20 leading-relaxed text-center">
                  Double-click text on canvas to edit inline • Drag corners to resize
                </p>

              </div>
            )}

          </div>
        </div>

        {/* ════ CANVAS AREA ════ */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          style={{ background: "#141414" }}
        >
          {!ready && !cropMode && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#141414]">
              <Loader2 className="w-8 h-8 text-[#FF8A00] animate-spin" />
            </div>
          )}

          <div className={`w-full h-full ${cropMode ? "hidden" : "block"}`}>
            <canvas ref={canvasElRef} />
          </div>

          {/* Floating context bar when text selected */}
          {hasSelectedText && !cropMode && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full border backdrop-blur-sm"
              style={{ background: "rgba(10,10,10,0.92)", borderColor: "rgba(255,138,0,0.3)" }}
            >
              <span className="text-[9px] text-[#FF8A00] uppercase tracking-wider mr-1.5 font-bold">
                Text Selected
              </span>
              <div className="w-px h-3 bg-white/10 mx-0.5" />
              <button onClick={txtBold} title="Bold" className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${textBold ? "text-[#FF8A00]" : "text-white/50 hover:text-white"}`}>B</button>
              <button onClick={txtItalic} title="Italic" className={`px-2 py-1 rounded text-[11px] italic transition-all cursor-pointer ${textItalic ? "text-[#FF8A00]" : "text-white/50 hover:text-white"}`}>I</button>
              <div className="w-px h-3 bg-white/10 mx-0.5" />
              <button onClick={() => txtSize(Math.max(8, textSize - 4))} title="Smaller" className="px-2 py-1 rounded text-[13px] text-white/50 hover:text-white transition-all cursor-pointer leading-none">−</button>
              <span className="text-[10px] text-white/40 w-7 text-center">{textSize}</span>
              <button onClick={() => txtSize(Math.min(300, textSize + 4))} title="Larger" className="px-2 py-1 rounded text-[13px] text-white/50 hover:text-white transition-all cursor-pointer leading-none">+</button>
              <div className="w-px h-3 bg-white/10 mx-0.5" />
              <button onClick={deleteSelected} title="Delete" className="px-2 py-1 rounded text-[10px] text-red-400/70 hover:text-red-400 transition-all cursor-pointer">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {cropMode && (
            <div className="w-full h-full">
              <Cropper
                src={currentSrc}
                style={{ width: "100%", height: "100%" }}
                guides
                viewMode={1}
                dragMode="move"
                autoCropArea={0.8}
                aspectRatio={cropRatio}
                background={false}
                responsive
                ref={cropperRef}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
