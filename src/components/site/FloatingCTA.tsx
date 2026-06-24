import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!dismissed && window.scrollY > 500) setVisible(true);
      else if (window.scrollY <= 500) setVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-5 z-40 w-[280px] rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_oklch(0_0_0/0.55),0_0_0_1px_oklch(1_0_0/0.07)]"
        >
          {/* Gold top stripe */}
          <div className="h-[2px] bg-gradient-to-r from-[#FF9B26] to-[#FF8A00]" />

          {/* Card body */}
          <div className="bg-[#0d0d0d] px-5 pt-5 pb-5">

            {/* Close button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 w-6 h-6 grid place-items-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all duration-200"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-gold/[0.12] border border-gold/25">
              <Sparkles className="w-3 h-3 text-gold" />
              <span className="text-[9px] tracking-[0.3em] uppercase text-gold font-semibold">
                Now Enrolling
              </span>
            </div>

            {/* Heading */}
            <h3 className="font-display text-[1.35rem] text-white leading-[1.1] mb-2 pr-4">
              Preserve your{" "}
              <em className="not-italic" style={{ background: "linear-gradient(135deg,#FF9B26,#FF8A00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                memories
              </em>{" "}
              forever.
            </h3>

            {/* Sub text */}
            <p className="text-[11px] text-white/38 leading-relaxed mb-5">
              3D crystals, acrylic prints, canvas &amp; sculptures — gift-ready in 10–14 days.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2">
              <Link
                to="/shop"
                className="btn-shine flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-[#FF9B26] to-[#FF8A00] text-white rounded-full text-[9.5px] tracking-[0.22em] uppercase font-bold shadow-[0_6px_20px_-4px_rgba(255,138,0,0.5)]"
              >
                Shop Now <ArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/contact"
                className="flex items-center justify-center w-full py-2.5 border border-white/12 text-white/45 hover:text-white hover:border-white/25 rounded-full text-[9.5px] tracking-[0.22em] uppercase font-medium transition-all duration-200"
              >
                Schedule a Scan
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
