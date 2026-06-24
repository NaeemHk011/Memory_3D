import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Gift,
  Calendar,
  Star,
  Camera,
  Cog,
  Truck,
  Trophy,
  Check,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

import { QuickConfigModal } from "@/components/shop/QuickConfigModal";
import { Shape, shapes } from "@/data/products";

import heroCover from "@/assets/hero_cover.avif";
import familyCover from "@/assets/Family_Cover.avif";
import jamesCover from "@/assets/James_Castle-Cover.avif";
import sculpturesCover1 from "@/assets/Memory3D_Sculptures_1.avif";
import bannerAcrylic from "@/assets/banner-acrylic.png";
import bannerCanvas from "@/assets/banner-canvas.png";

import crystalHero from "@/assets/crystal_hero.jpeg";
import c1 from "@/assets/3D_Crystals_1.avif";
import c2 from "@/assets/3D_Crystals_2.avif";
import c3 from "@/assets/3D_Crystals_3.avif";
import c4 from "@/assets/3D_Crystals_4.avif";
import c5 from "@/assets/3D_Crystals_5.avif";
import c6 from "@/assets/3D_Crystals_6.avif";

import s1 from "@/assets/3D-Sculp-1.avif";
import s2 from "@/assets/3D-Sculp-2.avif";
import s4 from "@/assets/3D-Sculp-4.jpg";
import s5 from "@/assets/3D-Sculp-5.jpg";
import s6 from "@/assets/3D-Sculp-6.jpg";
import s7 from "@/assets/3D-Sculp-7.jpg";

import m4 from "@/assets/memory_4.avif";
import m8 from "@/assets/memory_8.avif";
import m9 from "@/assets/memory_9.avif";

import pHeart from "@/assets/product-rotating-heart.webp";
import pSilver from "@/assets/product-lightbase-silver-heart.webp";
import pKey from "@/assets/product-keychain.webp";
import pWood from "@/assets/product-wooden-premium.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memory3D    Forever in Crystal | 3D Laser-Engraved Gifts" },
      {
        name: "description",
        content:
          "Turn your most precious moments into stunning 3D laser-engraved crystals, acrylic prints, canvas art, and full-color sculptures. Preserved forever.",
      },
      { property: "og:title", content: "Memory3D    Forever in Crystal" },
      {
        property: "og:description",
        content:
          "Premium 3D crystals, acrylic prints, canvas prints, and sculptures    personalized for the moments that matter.",
      },
      { property: "og:image", content: heroCover },
    ],
  }),
  component: Home,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const trustItems = [
  "50,000+ Memories Preserved",
  "4.9★ Average Rating",
  "12,000+ Happy Customers",
  "Free Shipping Over $100",
  "Ships in 10–14 Days",
  "Lifetime Satisfaction Guarantee",
  "Hand-Inspected & Gift-Boxed",
];

const services = [
  {
    num: "01",
    title: "3D Crystals",
    to: "/shop",
    img: c1,
    tagline: "Forever in Crystal",
    desc: "Laser-engraved 3D portraits inside premium optical crystal. Perfect for weddings, memorials, and milestones.",
    from: "$69",
    features: ["Premium optical crystal", "LED lightbase available", "Gift-boxed & ready to give"],
  },
  {
    num: "02",
    title: "Acrylic Prints",
    to: "/acrylic-prints",
    img: bannerAcrylic,
    tagline: "Photo-Perfect Clarity",
    desc: "Glossy, vibrant acrylic wall art ready to hang. Your favourite photos into stunning display pieces.",
    from: "$17.99",
    features: ["Sleek glossy finish", "Ready to hang", "Vivid true-to-life colour"],
  },
  {
    num: "03",
    title: "Canvas Prints",
    to: "/canvas-prints",
    img: bannerCanvas,
    tagline: "Gallery-Quality Walls",
    desc: "Fade-resistant custom canvas prints with customizable frames. Available in sizes for any space.",
    from: "$5.20",
    features: ["Archival-grade inks", "Customizable frames", "Multiple sizes available"],
  },
  {
    num: "04",
    title: "3D Sculptures",
    to: "/sculptures",
    img: crystalHero,
    tagline: "You, In Miniature",
    desc: "Full-color 3D figurines capturing every detail. Families, pets, couples    scanned in just 12 seconds.",
    from: "$199",
    features: ["Scanned in 12 seconds", "Full-color detail", "Hand-finished figurine"],
  },
];

const statsData = [
  { value: "50K+", label: "Memories Preserved" },
  { value: "4.9★", label: "Customer Rating" },
  { value: "12K+", label: "Happy Customers" },
  { value: "10–14", label: "Days to Deliver" },
];

const categories = [
  { title: "Weddings",      img: familyCover, to: "/weddings",  copy: "The first dance, captured in light." },
  { title: "Memorials",     img: jamesCover,  to: "/memorials", copy: "Hold their memory in your hands." },
  { title: "Sports Events", img: m4,          to: "/shop",      copy: "Trophy moments preserved in crystal." },
  { title: "Custom Gifts",  img: c2,          to: "/shop",      copy: "Birthdays, anniversaries, milestones." },
];

const featured = [
  { img: pHeart,  title: "Rotating Heart Crystal",   price: 95,  tag: "Bestseller", shapeId: "heart" },
  { img: pSilver, title: "Silver Lightbase Heart",    price: 85,  tag: "New",        shapeId: "heart" },
  { img: pWood,   title: "Wooden Premium Lightbase",  price: 145, tag: "Premium",    shapeId: "rectangle-tall" },
  { img: pKey,    title: "Engraved Keychain",         price: 35,  tag: "Gift",       shapeId: "vertical-keychain" },
];

const memoryWall = [
  { src: c1, tall: false }, { src: c2, tall: true  }, { src: c3, tall: false },
  { src: c4, tall: false }, { src: c5, tall: true  }, { src: m8, tall: false },
  { src: m9, tall: false }, { src: c6, tall: false },
];

const sculptureShots = [
  { src: s4, pos: "object-[center_top]" },
  { src: s1, pos: "object-cover" },
  { src: s5, pos: "object-cover" },
  { src: s7, pos: "object-cover" },
  { src: s2, pos: "object-cover" },
  { src: s6, pos: "object-cover" },
];

const steps = [
  { icon: Camera, title: "Scan",    body: "We capture you in 12 seconds with our pop-up 3D scanner or upload a single photo from anywhere." },
  { icon: Cog,    title: "Craft",   body: "Master artisans render your model and laser-etch millions of micro-points inside premium optical crystal." },
  { icon: Truck,  title: "Cherish", body: "Hand-inspected, gift-boxed and delivered to your door in 10–14 days. Forever yours." },
];

// ─── Component ───────────────────────────────────────────────────────────────

function Home() {
  const [quickConfigOpen, setQuickConfigOpen] = useState(false);
  const [quickConfigShape, setQuickConfigShape] = useState<Shape | null>(null);

  const handleOpenQuickConfig = (shapeId: string) => {
    const shape = shapes.find((s) => s.id === shapeId);
    if (shape) {
      setQuickConfigShape(shape);
      setQuickConfigOpen(true);
    }
  };

  return (
    <div className="bg-background overflow-x-hidden">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative min-h-screen flex items-end pt-24 pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <video src="/home_cover_vid.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
                className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full border border-gold/35 bg-gold/[0.12] backdrop-blur-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] tracking-[0.38em] uppercase text-gold font-semibold">
                  Premium 3D Memory Studio
                </span>
              </motion.div>

              <h1 className="text-[clamp(1.8rem,3.8vw,3.2rem)] leading-[1.1] tracking-[0.02em] text-white mt-6" style={{ fontFamily: "var(--font-hero)" }}>
                Your most cherished <br />
                moments,{" "}
                <em className="text-gradient-gold not-italic font-light">preserved</em>
                <br />forever in crystal.
              </h1>

              <p className="mt-8 text-[14px] md:text-[15px] text-white/55 max-w-lg leading-relaxed font-light">
                3D laser-engraved crystals, acrylic prints, canvas art, and full-color sculptures   
                crafted from your photos and delivered gift-ready in 10–14 days.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/shop"
                  className="btn-shine group inline-flex items-center justify-center gap-3 bg-gradient-gold text-white px-8 py-4 text-[10px] tracking-[0.28em] uppercase shadow-gold rounded-full font-bold hover:-translate-y-px transition-all duration-300 hover:shadow-[0_8px_28px_-4px_oklch(0.62_0.14_79/0.6)]"
                >
                  Shop All Products
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 border border-white/30 text-white px-8 py-4 text-[10px] tracking-[0.28em] uppercase hover:bg-white/10 hover:border-white/55 rounded-full transition-all duration-300 font-medium"
                >
                  Schedule a Scan
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mt-8 flex flex-wrap gap-2"
              >
                {["3D Crystals", "Acrylic Prints", "Canvas Prints", "3D Sculptures"].map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-[9px] tracking-[0.2em] uppercase text-white/35 border border-white/12 backdrop-blur-sm">
                    {s}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 hidden lg:flex flex-col gap-7 items-end pb-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="flex flex-col gap-7 text-right"
            >
              {statsData.slice(0, 2).map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.55 + i * 0.15 }}
                  className="hairline pt-5"
                >
                  <div className="font-display text-[2.8rem] text-gradient-gold leading-none">{s.value}</div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/38 mt-2">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.5em] uppercase text-white/25">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ══════════════════ TRUST TICKER ══════════════════ */}
      <div className="bg-background overflow-hidden border-y border-border py-4">
        <motion.div
          className="flex items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 38, ease: "linear", repeat: Infinity }}
          style={{ width: "fit-content" }}
        >
          {[...trustItems, ...trustItems].map((item, i) => (
            <span key={i} className="flex items-center gap-5 px-7 shrink-0">
              <span className="text-[10px] tracking-[0.32em] uppercase text-foreground/45 font-medium whitespace-nowrap">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold/60 shrink-0" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════ SERVICES ══════════════════ */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.05] blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <Reveal>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
              <div>
                <span className="label-chip mb-5 block">Our Craft</span>
                <h2 className="font-display font-semibold text-[clamp(2.6rem,5.5vw,4.5rem)] text-foreground leading-[0.95]">
                  Four ways we{" "}
                  <em className="text-gradient-gold not-italic">preserve</em>
                  <br />your story.
                </h2>
              </div>
              <p className="text-muted-foreground text-[13px] leading-relaxed max-w-[260px] lg:text-right font-light">
                Every product is hand-inspected,<br className="hidden lg:block" />
                gift-boxed, and delivered in 10–14 days.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {services.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 0.08}>
                <Link
                  to={svc.to}
                  className="group block rounded-2xl overflow-hidden border border-border hover:border-gold/45 transition-all duration-400 shadow-card hover:shadow-card-hover bg-card"
                >
                  {/* Large image */}
                  <div className="p-3 pb-0 relative">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl relative">
                      <img
                        src={svc.img}
                        alt={svc.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                    <div className="absolute top-6 left-6">
                      <span className="bg-gradient-gold text-white text-[9px] tracking-[0.3em] uppercase font-bold px-3 py-1.5 rounded-full shadow-gold">
                        {svc.tagline}
                      </span>
                    </div>
                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/30 grid place-items-center backdrop-blur-sm bg-black/20">
                      <span className="text-[9px] text-white/70 font-semibold">{svc.num}</span>
                    </div>
                  </div>

                  {/* Content below image */}
                  <div className="p-6 lg:p-7">
                    <h3 className="font-display text-[1.8rem] text-foreground mb-2 leading-tight">
                      {svc.title}
                    </h3>
                    <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
                      {svc.desc}
                    </p>
                    <ul className="space-y-2 mb-5">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                          <Check className="w-3 h-3 text-gold shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-[12px] text-muted-foreground font-medium">From {svc.from}</span>
                      <span className="inline-flex items-center gap-1.5 text-[9.5px] tracking-[0.28em] uppercase text-gold font-bold group-hover:gap-2.5 transition-all duration-300">
                        Explore <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ STATS    BOLD & BRIGHT ══════════════════ */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full bg-gold/[0.06] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x divide-border/60">
            {statsData.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.1}>
                <div className="text-center lg:px-10">
                  <div className="font-display text-[clamp(3.2rem,8vw,5.5rem)] text-gradient-gold leading-none">
                    {stat.value}
                  </div>
                  <div className="w-10 h-[1.5px] bg-gradient-gold mx-auto mt-4 mb-3 opacity-55" />
                  <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ OCCASIONS    ASYMMETRIC GRID ══════════════════ */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[700px] rounded-full bg-gold/[0.04] blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
              <div>
                <span className="label-chip mb-5 block">Collections</span>
                <h2 className="font-display font-semibold text-[clamp(2.4rem,5vw,4.2rem)] text-foreground leading-[1.0]">
                  A keepsake for every
                  <br />
                  <em className="text-gradient-gold not-italic">chapter.</em>
                </h2>
              </div>
              <p className="text-muted-foreground text-[13px] max-w-xs leading-relaxed">
                From wedding halls to memorial shelves    every milestone deserves to be preserved in light.
              </p>
            </div>
          </Reveal>

          {/* 1 large left + 3 stacked right */}
          <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5">
            <Reveal>
              <Link to={categories[0].to} className="group relative h-64 lg:h-[620px] overflow-hidden rounded-2xl block">
                <img
                  src={categories[0].img}
                  alt={categories[0].title}
                  className="w-full h-full object-cover transition-transform duration-[1600ms] group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-transparent" />
                <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-gold/45 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-9 lg:p-11">
                  <span className="text-[9px] tracking-[0.42em] uppercase text-gold/80 font-bold block mb-2">
                    {categories[0].copy}
                  </span>
                  <h3 className="font-display text-[2.4rem] lg:text-[3.2rem] text-white mb-5 leading-tight">
                    {categories[0].title}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-gold font-semibold border border-gold/35 px-5 py-2.5 rounded-full hover:bg-gold/8 transition-all">
                    Explore <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>

            <div className="grid grid-rows-3 gap-5">
              {categories.slice(1).map((cat, i) => (
                <Reveal key={cat.title} delay={(i + 1) * 0.09}>
                  <Link to={cat.to} className="group relative overflow-hidden rounded-2xl block h-44 lg:h-auto">
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/15 to-transparent" />
                    <div className="absolute inset-0 rounded-2xl border border-white/0 group-hover:border-gold/45 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                      <div>
                        <h3 className="font-display text-[1.55rem] text-white leading-tight">{cat.title}</h3>
                        <p className="text-[11px] text-white/50 mt-1">{cat.copy}</p>
                      </div>
                      <span className="w-8 h-8 rounded-full border border-gold/40 grid place-items-center shrink-0 ml-4 opacity-0 group-hover:opacity-100 group-hover:border-gold transition-all duration-300 group-hover:bg-gold/10">
                        <ArrowRight className="w-3.5 h-3.5 text-gold" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURED PRODUCTS ══════════════════ */}
      <section className="py-28 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.06] blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-14 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <Reveal>
              <div>
                <span className="label-chip mb-5 block">Featured</span>
                <h2 className="font-display font-semibold text-[clamp(2.2rem,5vw,4rem)] text-foreground">
                  The pieces everyone's gifting.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                to="/shop"
                className="text-[10px] tracking-[0.3em] uppercase text-gold inline-flex items-center gap-2 hover:gap-3 transition-all font-semibold border border-gold/30 px-5 py-2.5 rounded-full hover:border-gold hover:bg-gold/[0.07] self-start md:self-auto"
              >
                View all crystals <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="relative">
          <motion.div
            className="flex gap-5 px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 50, ease: "linear", repeat: Infinity }}
            style={{ width: "fit-content" }}
          >
            {[...featured, ...featured, ...featured, ...featured].map((p, i) => (
              <div key={i} className="w-[260px] md:w-[290px] shrink-0 group">
                <div className="relative aspect-square overflow-hidden bg-[#111] border border-white/[0.09] rounded-2xl group-hover:border-gold/30 transition-colors duration-300">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 badge-gold">{p.tag}</span>
                  <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleOpenQuickConfig(p.shapeId)}
                      className="btn-shine w-full bg-gradient-gold text-white py-3 rounded-full text-[9.5px] tracking-[0.22em] uppercase font-bold flex items-center justify-center gap-2 shadow-gold cursor-pointer"
                    >
                      Customize Now
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex items-start justify-between gap-4">
                  <h3 className="font-display text-[1.1rem] text-foreground/75 leading-snug">{p.title}</h3>
                  <span className="text-[13px] font-semibold text-gold shrink-0 mt-0.5">${p.price}</span>
                </div>
              </div>
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.05] blur-[110px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 lg:px-10 relative">
          <Reveal>
            <div className="text-center mb-20">
              <span className="label-chip justify-center mb-5 block">The Process</span>
              <h2 className="font-display font-semibold text-[clamp(2.2rem,5vw,4rem)] text-foreground">
                From <em className="text-gradient-gold not-italic">photo</em> to masterpiece.
              </h2>
              <p className="mt-5 text-muted-foreground max-w-sm mx-auto text-[13.5px] leading-relaxed">
                Simple, seamless, and in your hands within 2 weeks.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-16 relative">
            <div className="hidden md:block absolute top-[56px] left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.15} className="text-center relative">
                {/* Large decorative background number */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-display text-[9rem] text-foreground/[0.025] leading-none select-none pointer-events-none tabular-nums">
                  {i + 1}
                </div>

                <div className="relative inline-flex items-center justify-center w-28 h-28 mb-8">
                  <div className="absolute inset-0 bg-gradient-gold rounded-full opacity-[0.12] blur-2xl" />
                  <div className="relative w-28 h-28 rounded-full border border-gold/30 bg-card shadow-card grid place-items-center">
                    <s.icon className="w-9 h-9 text-gold" />
                    <span className="absolute -top-2.5 -right-2.5 w-8 h-8 grid place-items-center rounded-full bg-gradient-gold text-white text-xs font-bold shadow-gold">
                      {i + 1}
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-[2rem] mb-3 text-foreground">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto text-[13.5px]">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ MEMORY IN MOTION ══════════════════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold/[0.05] blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <Reveal>
              <div className="grid grid-cols-2 gap-4 [grid-auto-rows:200px]">
                <div className="row-span-2 relative overflow-hidden rounded-2xl border border-border shadow-card group">
                  <img src={pHeart} alt="Rotating Heart Crystal" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4"><span className="badge-gold">Bestseller</span></div>
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gold/35 transition-colors duration-500 pointer-events-none" />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-border shadow-card group">
                  <img src={pSilver} alt="Silver Lightbase" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gold/35 transition-colors duration-500 pointer-events-none" />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-border shadow-card group">
                  <img src={pWood} alt="Wooden Premium Base" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4"><span className="badge-gold">Premium</span></div>
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-gold/35 transition-colors duration-500 pointer-events-none" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div>
                <span className="label-chip mb-5 block">Illuminated Collection</span>
                <h2 className="font-display font-semibold text-[clamp(2.6rem,5vw,4.2rem)] mt-4 leading-[1.0] text-foreground">
                  Memory <br />
                  <em className="text-gradient-gold not-italic">in Motion.</em>
                </h2>
                <p className="mt-6 text-[14px] text-muted-foreground leading-relaxed max-w-md">
                  Place your crystal on one of our premium LED lightbases and watch your memory
                  come alive. Rotating platforms, colour-changing bases    every angle reveals something new.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "360° rotating lightbase    never the same angle twice",
                    "Warm LED glow enhances every engraved detail",
                    "Available in silver, wooden & colour-changing finishes",
                    "Pairs with any crystal shape in our collection",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground/80">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-gold shrink-0" />
                      <span className="text-[14px] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link to="/shop" className="btn-shine bg-gradient-gold text-white px-8 py-4 text-[10px] tracking-[0.3em] uppercase rounded-full shadow-gold font-bold hover:-translate-y-px transition-all duration-300 inline-flex items-center gap-2">
                    Shop Lightbases <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/shop" className="border border-gold/40 px-8 py-4 text-[10px] tracking-[0.3em] uppercase rounded-full hover:border-gold hover:bg-gold/5 transition-all duration-300 text-foreground font-medium">
                    View All Crystals
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════ SCULPTURES FEATURE ══════════════════ */}
      <section className="py-32 bg-card/40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[600px] rounded-full bg-gold/[0.05] blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[0.75fr_1.25fr] gap-12 lg:gap-20 items-center relative">
          <Reveal>
            <div>
              <span className="label-chip mb-5 block">Full-Color 3D Sculptures</span>
              <h2 className="font-display font-semibold text-[clamp(2.4rem,5vw,4rem)] mt-4 leading-[1.05] text-foreground">
                You. <br />
                <em className="text-gradient-gold not-italic">In miniature.</em> <br />
                Down to the last freckle.
              </h2>
              <p className="mt-6 text-[14px] text-muted-foreground leading-relaxed max-w-lg">
                Step into our scanner. In twelve seconds we capture every detail    your favourite
                jacket, your dog mid-tail-wag, the way you hold your kid. A hand-finished, full-color
                figurine you'll keep on your shelf forever.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/sculptures" className="btn-shine bg-gradient-gold text-white px-8 py-4 text-[10px] tracking-[0.3em] uppercase rounded-full shadow-gold font-bold hover:-translate-y-px transition-all duration-300">
                  Explore Sculptures
                </Link>
                <Link to="/contact" className="border border-gold/35 px-8 py-4 text-[10px] tracking-[0.3em] uppercase rounded-full hover:border-gold hover:bg-gold/[0.07] transition-all duration-300 text-foreground/60 font-medium">
                  Book a Scan
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 h-[600px]">
              <div className="relative overflow-hidden rounded-2xl shadow-luxe border border-white/[0.09]">
                <img src={sculpturesCover1} alt="3D Sculpture Showcase" className="w-full h-full object-cover object-[center_10%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="grid grid-cols-2 grid-rows-3 gap-4">
                {sculptureShots.map((img, idx) => (
                  <div key={idx} className="overflow-hidden rounded-xl border border-white/[0.09]">
                    <img src={img.src} alt="" className={`w-full h-full ${img.pos}`} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════ MEMORY WALL ══════════════════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-[100vw] px-6 md:px-12">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
              <div className="flex-1">
                <span className="text-[11px] tracking-[0.5em] uppercase text-gold font-bold">
                  The Memory Wall
                </span>
                <h2 className="font-display text-[clamp(3rem,9vw,8rem)] mt-6 leading-[0.85] text-foreground">
                  Preserved <br />
                  <em className="text-gradient-gold not-italic">Chapters.</em>
                </h2>
              </div>
              <div className="max-w-md">
                <p className="text-muted-foreground text-lg leading-relaxed font-light mb-10">
                  Every crystal is a masterpiece of light and memory. Explore our archive of
                  thousands of stories carved for eternity.
                </p>
                <div className="h-[2px] w-full bg-gradient-gold opacity-35" />
              </div>
            </div>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.07 } },
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 [grid-auto-rows:220px]"
          >
            {memoryWall.map((item, i) => (
              <Link key={i} to="/shop" className={item.tall ? "row-span-2" : ""}>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={{ y: -6 }}
                  className="relative overflow-hidden rounded-2xl group h-full bg-card border border-border shadow-sm"
                >
                  <motion.img
                    src={item.src}
                    alt=""
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-[filter] duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-6">
                    <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
                      <span className="text-[9px] tracking-[0.4em] uppercase text-gold font-bold flex items-center gap-3">
                        View Story <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 transition-colors duration-700 pointer-events-none" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════ SCHEDULE A SCAN ══════════════════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] rounded-full bg-gold/[0.04] blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-20 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-32 items-center relative">
          <Reveal>
            <div className="relative rounded-2xl overflow-hidden shadow-luxe aspect-[3/4] max-w-[300px] mx-auto lg:ml-12 border border-gold/20">
              <video src="/schedule_vid.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/85 backdrop-blur px-3 py-1.5 rounded-full text-[9px] tracking-[0.2em] uppercase text-foreground font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> Live Scan
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="lg:pr-12">
              <span className="label-chip mb-5 block">Schedule a Scan</span>
              <h2 className="font-display font-semibold text-[clamp(2.4rem,5.5vw,4.2rem)] mt-4 leading-[1.05] text-foreground">
                We're coming to <em className="text-gradient-gold not-italic">your city.</em>
              </h2>
              <p className="mt-6 text-[14px] text-muted-foreground max-w-md leading-relaxed font-light">
                Our pop-up 3D scanners travel nationwide. Sessions take twelve seconds. Book a spot
                for your family, your team, or your wedding party.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Calendar, t: "Same-day appointments" },
                  { icon: Heart,    t: "Pets, kids, couples    all welcome" },
                  { icon: Trophy,   t: "Sports teams & corporate events" },
                  { icon: Gift,     t: "Sculptures and crystals from one scan" },
                ].map(({ icon: I, t }) => (
                  <li key={t} className="flex items-center gap-4 group">
                    <span className="w-11 h-11 grid place-items-center border border-gold/35 rounded-xl group-hover:border-gold group-hover:bg-gold/[0.07] bg-card transition-all duration-200">
                      <I className="w-4.5 h-4.5 text-gold" />
                    </span>
                    <span className="text-[14px] text-foreground/80 font-medium">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link
                  to="/contact"
                  className="btn-shine inline-flex items-center gap-3 bg-gradient-gold text-white px-9 py-4 text-[10px] tracking-[0.3em] uppercase rounded-full shadow-gold font-bold hover:-translate-y-px transition-all duration-300"
                >
                  Reserve Your Scan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold/[0.06] blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 lg:px-10 relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center justify-center gap-3 text-[10px] tracking-[0.42em] uppercase text-gold font-semibold mb-6">
                <span className="w-10 h-px bg-gradient-gold inline-block" />
                Loved by thousands
                <span className="w-10 h-px bg-gradient-gold inline-block" />
              </span>
              <h2 className="font-display font-semibold text-[clamp(2.4rem,5vw,4rem)] text-foreground">
                Words from the keepers.
              </h2>
            </div>
          </Reveal>

          {/* Featured large testimonial */}
          <Reveal>
            <figure className="relative border border-white/[0.09] rounded-2xl p-10 md:p-14 mb-6 hover:border-gold/30 transition-colors duration-500 overflow-hidden group bg-[#111]">
              <div className="absolute top-4 right-8 font-display text-[10rem] text-gold/[0.08] leading-none select-none pointer-events-none group-hover:text-gold/[0.13] transition-colors duration-500">
                "
              </div>
              <div className="flex gap-0.5 mb-8">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4.5 h-4.5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="relative font-display text-[clamp(1.5rem,3.2vw,2.3rem)] text-white/78 leading-snug max-w-3xl mb-10">
                "I cried when I unboxed it. My mother is gone but I see her every morning now. Thank you."
              </blockquote>
              <figcaption className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-gold grid place-items-center text-white font-bold shadow-gold shrink-0 text-base">
                  S
                </div>
                <div>
                  <div className="text-[14px] text-white/75 font-semibold">Sarah L.</div>
                  <div className="text-[10px] tracking-[0.28em] uppercase text-gold mt-0.5">Memorial Crystal</div>
                </div>
              </figcaption>
            </figure>
          </Reveal>

          {/* Two smaller testimonials */}
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { q: "We surprised my husband with a sculpture of him and our daughter. He hasn't moved it from his desk since.", a: "Priya K.", c: "Family Sculpture" },
              { q: "The wedding crystal was on every guest's mind. Best money we spent on the day, by far.", a: "Marcus & Jen", c: "Wedding Heart" },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <figure className="border border-white/[0.09] p-8 rounded-2xl hover:border-gold/30 transition-colors duration-300 bg-[#111]">
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="font-display text-[1.22rem] text-white/65 leading-snug mb-8">
                    "{t.q}"
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                    <div className="w-9 h-9 rounded-full bg-gradient-gold grid place-items-center text-white text-xs font-bold shadow-gold shrink-0">
                      {t.a[0]}
                    </div>
                    <div>
                      <div className="text-[13px] text-white/65 font-semibold">{t.a}</div>
                      <div className="text-[10px] tracking-[0.25em] uppercase text-gold mt-0.5">{t.c}</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FINAL CTA ══════════════════ */}
      <section className="relative py-48 overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-gold/[0.09] blur-[190px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        </div>
        <Reveal>
          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 rounded-full border border-gold/25 bg-gold/[0.08]">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-[10px] tracking-[0.38em] uppercase text-gold font-semibold">
                Begin Your Story
              </span>
            </div>
            <h2 className="font-display text-[clamp(3.2rem,9vw,7.8rem)] leading-[0.88] text-white">
              Some memories <br />
              deserve{" "}
              <em className="text-gradient-gold not-italic">forever.</em>
            </h2>
            <p className="mt-10 text-[14px] text-white/35 max-w-sm mx-auto leading-relaxed">
              Start with one photo. We'll craft something they'll keep for a lifetime.
            </p>
            <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/shop"
                className="btn-shine bg-gradient-gold text-white px-12 py-5 text-[10px] tracking-[0.3em] uppercase rounded-full shadow-gold font-bold hover:-translate-y-px transition-all duration-300 inline-flex items-center justify-center gap-3"
              >
                Start Your Crystal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="border border-white/18 px-12 py-5 text-[10px] tracking-[0.3em] uppercase rounded-full hover:border-white/40 hover:bg-white/[0.04] transition-all duration-300 text-white/50 hover:text-white font-medium"
              >
                Talk to a Specialist
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <QuickConfigModal
        isOpen={quickConfigOpen}
        onClose={() => {
          setQuickConfigOpen(false);
          setQuickConfigShape(null);
        }}
        defaultShape={quickConfigShape || shapes[0]}
      />

    </div>
  );
}
