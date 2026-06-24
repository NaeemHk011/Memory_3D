import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/Memory_3D_Logo (1) (3).png";

type NavItem = { label: string; to: string };

const nav: NavItem[] = [
  { label: "Home",           to: "/" },
  { label: "About Us",       to: "/about" },
  { label: "3D Crystals",    to: "/shop" },
  { label: "Acrylic Prints", to: "/acrylic-prints" },
  { label: "Canvas Prints",  to: "/canvas-prints" },
  { label: "3D Sculptures",  to: "/sculptures" },
  { label: "Contact Us",     to: "/contact" },
];

const mobileNav: NavItem[] = [
  { label: "Home",           to: "/" },
  { label: "About Us",       to: "/about" },
  { label: "3D Crystals",    to: "/shop" },
  { label: "Acrylic Prints", to: "/acrylic-prints" },
  { label: "Canvas Prints",  to: "/canvas-prints" },
  { label: "3D Sculptures",  to: "/sculptures" },
  { label: "Contact Us",     to: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      {/* ══════════════ MAIN HEADER ══════════════ */}
      <motion.header
        animate={{ top: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed inset-x-0 z-50 transition-[background,box-shadow,border-color] duration-500 ${
          scrolled
            ? "bg-[#0a0a0a]/98 backdrop-blur-2xl shadow-[0_1px_0_0_oklch(0.62_0.14_79/0.25),0_8px_32px_-8px_oklch(0_0_0/0.55)] border-b border-white/[0.06]"
            : "bg-[#0a0a0a]/88 backdrop-blur-xl border-b border-transparent"
        }`}
      >
        {/* Thin gold accent stripe */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-gold opacity-90" />

        <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="Memory3D Home">
            <img src={logo} alt="Memory3D" className="h-8 md:h-9 w-auto brightness-0 invert" />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 xl:gap-5">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="nav-link text-[9px] xl:text-[9.5px] tracking-[0.15em] text-white/45 hover:text-white transition-colors duration-200 uppercase font-semibold whitespace-nowrap"
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
              className="lg:hidden relative flex items-center justify-center w-9 h-9 rounded-full text-white/50 hover:text-gold hover:bg-gold/10 transition-all duration-200"
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
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col"
            style={{ paddingTop: "68px" }}
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
                {mobileNav.map((n) => (
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
                      className="group flex items-center justify-between py-4 border-b border-white/[0.08]"
                      activeProps={{}}
                    >
                      <span className="font-display text-[clamp(1.6rem,6vw,2.6rem)] text-white/75 group-hover:text-gold transition-colors duration-200 leading-tight">
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
              className="px-8 py-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-[0.18em] uppercase text-white/30"
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
