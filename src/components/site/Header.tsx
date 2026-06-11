import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Phone, X, ChevronDown, Gem, Frame, Box, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/Memory_3D_Logo (1) (3).png";

type SimpleNavItem = { label: string; to: string };
type DropdownItem = { label: string; to: string; icon: React.ElementType; desc: string };

const collections: DropdownItem[] = [
  { label: "3D Crystals",     to: "/shop",           icon: Gem,    desc: "Laser-engraved photo crystals" },
  { label: "Acrylic Prints",  to: "/acrylic-prints", icon: Frame,  desc: "Premium wall-ready prints" },
  { label: "Canvas Prints",   to: "/canvas-prints",  icon: Layers, desc: "Gallery-quality canvas art" },
  { label: "3D Sculptures",   to: "/sculptures",     icon: Box,    desc: "Full-color 3D figurines" },
];

const primaryNav: SimpleNavItem[] = [
  { label: "Home",       to: "/" },
  { label: "About Us",   to: "/about" },
  { label: "Affiliates", to: "/affiliates" },
  { label: "Contact Us", to: "/contact" },
];

const mobileNav: SimpleNavItem[] = [
  { label: "Home",        to: "/" },
  { label: "About Us",    to: "/about" },
  { label: "3D Crystals", to: "/shop" },
  { label: "Acrylic Prints", to: "/acrylic-prints" },
  { label: "Canvas Prints",  to: "/canvas-prints" },
  { label: "3D Sculptures",  to: "/sculptures" },
  { label: "Affiliates",  to: "/affiliates" },
  { label: "Contact Us",  to: "/contact" },
];

function CollectionsDropdown() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const hide = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className="nav-link inline-flex items-center gap-1 text-[10px] xl:text-[11px] tracking-[0.18em] text-foreground/50 hover:text-foreground transition-colors duration-200 uppercase font-semibold whitespace-nowrap"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Collections
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={show}
            onMouseLeave={hide}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[340px] bg-white/98 backdrop-blur-2xl border border-border rounded-sm shadow-[0_8px_40px_-8px_oklch(0_0_0/0.12),0_2px_8px_-2px_oklch(0_0_0/0.06)] overflow-hidden z-50"
          >
            {/* Gold top accent */}
            <div className="h-[2px] bg-gradient-gold" />

            <div className="p-2">
              {collections.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center gap-4 px-3 py-3 rounded-[3px] hover:bg-gold/5 transition-colors duration-150"
                >
                  <span className="flex-shrink-0 w-9 h-9 grid place-items-center rounded-sm bg-gold/8 border border-gold/15 group-hover:bg-gold/15 group-hover:border-gold/30 transition-colors duration-150">
                    <item.icon className="w-4 h-4 text-gold" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] tracking-[0.12em] uppercase font-semibold text-foreground group-hover:text-gold transition-colors duration-150">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gold/0 group-hover:text-gold/70 ml-auto flex-shrink-0 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              ))}
            </div>

            <div className="border-t border-border/60 px-5 py-3 bg-card/60">
              <Link
                to="/shop"
                className="text-[10px] tracking-[0.22em] uppercase font-semibold text-gold hover:text-gold/70 transition-colors inline-flex items-center gap-1.5"
              >
                View all products
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileCollectionsAccordion({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -24 },
        show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="group w-full flex items-center justify-between py-4 border-b border-border/60"
      >
        <span className="font-display text-[clamp(1.6rem,6vw,2.6rem)] text-foreground group-hover:text-gold transition-colors duration-200 leading-tight">
          Collections
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-gold" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border/60"
          >
            {collections.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 pl-4 text-foreground/70 hover:text-gold transition-colors duration-150 group"
                >
                  <span className="w-7 h-7 grid place-items-center rounded-sm bg-gold/8 border border-gold/15 flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-gold" />
                  </span>
                  <span className="font-display text-[1.35rem] leading-tight group-hover:text-gold transition-colors">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ══════════════ ANNOUNCEMENT BANNER ══════════════ */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 inset-x-0 z-[60] bg-gradient-gold overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 h-[34px] flex items-center justify-between">
              <div className="flex-1" />
              <p className="text-white text-[9.5px] tracking-[0.32em] uppercase font-bold text-center flex-[3]">
                ✦ &nbsp; Free Shipping on Orders Over $100 &nbsp;·&nbsp; Ships in 10–14 Days &nbsp; ✦
              </p>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={() => setBannerVisible(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ MAIN HEADER ══════════════ */}
      <motion.header
        animate={{ top: bannerVisible ? 34 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-x-0 z-50 transition-[background,box-shadow] duration-500 ${
          scrolled
            ? "bg-white/98 backdrop-blur-2xl shadow-[0_1px_0_0_oklch(0.87_0.006_80/0.6),0_6px_24px_-6px_oklch(0_0_0/0.07)]"
            : "bg-white/85 backdrop-blur-xl"
        }`}
      >
        {/* Thin gold accent stripe */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-gold opacity-90" />

        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="Memory3D Home">
            <img src={logo} alt="Memory3D" className="h-8 md:h-9 w-auto" />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-7 xl:gap-9">
            {primaryNav.slice(0, 2).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="nav-link text-[10px] xl:text-[11px] tracking-[0.18em] text-foreground/50 hover:text-foreground transition-colors duration-200 uppercase font-semibold whitespace-nowrap"
                activeProps={{ className: "nav-link nav-link-active !text-gold" }}
              >
                {n.label}
              </Link>
            ))}

            <CollectionsDropdown />

            {primaryNav.slice(2).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="nav-link text-[10px] xl:text-[11px] tracking-[0.18em] text-foreground/50 hover:text-foreground transition-colors duration-200 uppercase font-semibold whitespace-nowrap"
                activeProps={{ className: "nav-link nav-link-active !text-gold" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <Link
              to="/shop"
              className="btn-shine hidden sm:inline-flex items-center gap-2 pl-5 pr-4 py-2.5 text-[10px] tracking-[0.22em] uppercase bg-gradient-gold text-white rounded-full font-bold shadow-gold transition-all duration-300 hover:shadow-[0_8px_28px_-4px_oklch(0.62_0.14_79/0.55)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
            >
              Order Now
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden relative flex items-center justify-center w-9 h-9 rounded-full text-foreground/60 hover:text-gold hover:bg-gold/10 transition-all duration-200"
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <div className="w-[18px] h-[14px] relative flex flex-col justify-between">
                <motion.span
                  className="block h-[1.5px] bg-current rounded-full origin-left"
                  animate={open ? { rotate: 45, y: -1, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.span
                  className="block h-[1.5px] bg-current rounded-full"
                  animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.18 }}
                />
                <motion.span
                  className="block h-[1.5px] bg-current rounded-full origin-left"
                  animate={open ? { rotate: -45, y: 1, x: 2 } : { rotate: 0, y: 0, x: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ══════════════ MOBILE FULL-SCREEN MENU ══════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white flex flex-col"
            style={{ paddingTop: bannerVisible ? "calc(34px + 68px)" : "68px" }}
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-gold" />

            <div className="flex-1 flex flex-col justify-center px-8 py-6 overflow-y-auto">
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                }}
                className="space-y-0"
              >
                {/* Home & About */}
                {mobileNav.slice(0, 2).map((n) => (
                  <motion.li
                    key={n.to}
                    variants={{
                      hidden: { opacity: 0, x: -24 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between py-4 border-b border-border/60"
                      activeProps={{}}
                    >
                      <span className="font-display text-[clamp(1.6rem,6vw,2.6rem)] text-foreground group-hover:text-gold transition-colors duration-200 leading-tight">
                        {n.label}
                      </span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 text-gold transition-all duration-200 group-hover:translate-x-1" />
                    </Link>
                  </motion.li>
                ))}

                {/* Collections accordion */}
                <MobileCollectionsAccordion onClose={() => setOpen(false)} />

                {/* Affiliates & Contact */}
                {mobileNav.slice(6).map((n) => (
                  <motion.li
                    key={n.to}
                    variants={{
                      hidden: { opacity: 0, x: -24 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between py-4 border-b border-border/60"
                      activeProps={{}}
                    >
                      <span className="font-display text-[clamp(1.6rem,6vw,2.6rem)] text-foreground group-hover:text-gold transition-colors duration-200 leading-tight">
                        {n.label}
                      </span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 text-gold transition-all duration-200 group-hover:translate-x-1" />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <Link
                  to="/shop"
                  onClick={() => setOpen(false)}
                  className="btn-shine flex items-center justify-center gap-3 w-full py-4 bg-gradient-gold text-white rounded-full text-[11px] tracking-[0.3em] uppercase font-bold shadow-gold"
                >
                  Order Now
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              className="px-8 py-6 border-t border-border/50 flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
            >
              <a
                href="tel:888-936-3667"
                className="flex items-center gap-2 hover:text-gold transition-colors font-medium"
              >
                <Phone className="w-3 h-3 text-gold" />
                888-936-3667
              </a>
              <a
                href="mailto:support@memory3d.com"
                className="hover:text-gold transition-colors font-medium"
              >
                support@memory3d.com
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
