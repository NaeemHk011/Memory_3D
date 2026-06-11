import { Link } from "@tanstack/react-router";
import { ArrowRight, Gift } from "lucide-react";

export function AffiliateBanner() {
  return (
    <Link
      to="/affiliates"
      className="group flex items-center justify-between gap-4 w-full mt-6 px-5 py-4 rounded-sm border border-gold/25 bg-gold/4 hover:border-gold/50 hover:bg-gold/8 transition-all duration-300"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 w-8 h-8 grid place-items-center rounded-sm bg-gold/12 border border-gold/20">
          <Gift className="w-3.5 h-3.5 text-gold" />
        </span>
        <p className="text-[11px] tracking-[0.06em] text-foreground/70 leading-snug">
          <span className="font-semibold text-foreground">Love Memory3D?</span>
          {" "}Refer a friend and earn commissions on every sale.
        </p>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase font-bold text-gold whitespace-nowrap group-hover:gap-2 transition-all duration-200">
        Join Affiliate Program
        <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
