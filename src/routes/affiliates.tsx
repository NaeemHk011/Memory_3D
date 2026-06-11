import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Reveal } from "@/components/site/Reveal";
import { ArrowRight, DollarSign, Users, Share2, Headphones, Gift, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/affiliates")({
  head: () => ({
    meta: [
      { title: "Affiliate Program - Memory3D" },
      {
        name: "description",
        content:
          "Join the Memory3D affiliate program. Refer customers and earn commissions on every sale of our premium crystal keepsakes.",
      },
      { property: "og:title", content: "Affiliate Program - Memory3D" },
      { property: "og:description", content: "Earn with Memory3D. Share our crystals and get paid." },
    ],
  }),
  component: Affiliates,
});

const perks = [
  {
    icon: DollarSign,
    title: "Competitive Commissions",
    desc: "Earn generous commissions on every sale you refer. The more you share, the more you earn.",
  },
  {
    icon: Users,
    title: "No Minimum Referrals",
    desc: "Start earning from your very first referral. No thresholds, no complicated tiers.",
  },
  {
    icon: Share2,
    title: "Easy Sharing Tools",
    desc: "Get a personal referral link and marketing materials ready to share with your audience.",
  },
  {
    icon: Headphones,
    title: "Dedicated Partner Support",
    desc: "Our partner team is here to help you succeed at every step of the way.",
  },
  {
    icon: Gift,
    title: "Exclusive Perks",
    desc: "Enjoy early access to new products, special discounts, and partner-only offers.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Tracking",
    desc: "Monitor your referrals, clicks, and earnings through a transparent dashboard.",
  },
];

const steps = [
  {
    step: "01",
    title: "Submit Your Details",
    desc: "Fill out the referral form below with your information and how you plan to promote Memory3D.",
  },
  {
    step: "02",
    title: "Get Approved & Linked",
    desc: "Once approved, receive a unique referral link and access to our partner resource library.",
  },
  {
    step: "03",
    title: "Earn Commissions",
    desc: "Share your link. Every sale your referrals make is automatically tracked and paid monthly.",
  },
];

function AffiliateForm() {
  useEffect(() => {
    const existing = document.getElementById("webtechs-form-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://link.webtechs.dev/js/form_embed.js";
    script.id = "webtechs-form-script";
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById("webtechs-form-script");
      if (s) s.remove();
    };
  }, []);

  return (
    <iframe
      src="https://link.webtechs.dev/widget/form/AZZmeRcudVyreZrsDekD"
      style={{ width: "100%", minHeight: 667, border: "none", borderRadius: "6px", display: "block" }}
      id="inline-AZZmeRcudVyreZrsDekD"
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Referral Submission Form"
      data-height="667"
      data-layout-iframe-id="inline-AZZmeRcudVyreZrsDekD"
      data-form-id="AZZmeRcudVyreZrsDekD"
      title="Referral Submission Form"
    />
  );
}

function Affiliates() {
  return (
    <div className="bg-background">

      {/* ───────── HERO ───────── */}
      <section className="pt-40 pb-20 bg-gradient-hero border-b border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              Partner Program
            </span>
            <h1 className="font-display text-6xl md:text-8xl mt-4 leading-[0.95] text-foreground">
              Earn with <br />
              <em className="text-gradient-gold not-italic">Memory3D.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl font-light leading-relaxed">
              Love our crystals? Share them. Refer customers to Memory3D and earn
              commissions on every sale — no minimums, no hassle.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#join"
                className="btn-shine inline-flex items-center gap-2 pl-6 pr-5 py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-gold text-white rounded-full font-bold shadow-gold hover:shadow-[0_8px_28px_-4px_oklch(0.62_0.14_79/0.55)] hover:-translate-y-px transition-all duration-300"
              >
                Join the Program
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </a>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-[11px] tracking-[0.22em] uppercase border border-gold/40 text-foreground/70 rounded-full font-bold hover:border-gold hover:text-gold transition-all duration-300"
              >
                Browse Products
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── PERKS GRID ───────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal>
            <span className="label-chip mb-3">Why Partner With Us</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2">
              Everything you need <br />
              <em className="text-gradient-gold not-italic">to succeed.</em>
            </h2>
          </Reveal>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 0.07}>
                <div className="card-lift h-full p-7 bg-card border border-border rounded-sm">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-sm bg-gold/10 border border-gold/20 mb-5">
                    <perk.icon className="w-5 h-5 text-gold" />
                  </span>
                  <h3 className="font-display text-xl text-foreground mb-2">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <Reveal>
            <span className="label-chip mb-3">Simple 3-Step Process</span>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2">
              How it <em className="text-gradient-gold not-italic">works.</em>
            </h2>
          </Reveal>

          <div className="mt-16 grid sm:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div>
                  <span className="font-display text-[5.5rem] leading-none text-border font-light select-none block">
                    {s.step}
                  </span>
                  <div className="-mt-5">
                    <h3 className="font-display text-2xl text-foreground mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FORM SECTION ───────── */}
      <section id="join" className="py-24 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-[1fr_1.5fr] gap-16 items-start">

          {/* Left — info panel */}
          <Reveal>
            <div className="lg:sticky lg:top-32 space-y-8">
              <div>
                <span className="label-chip mb-3">Apply Now</span>
                <h2 className="font-display text-4xl md:text-5xl text-foreground mt-2">
                  Ready to <br />
                  <em className="text-gradient-gold not-italic">start earning?</em>
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">
                  Fill out the referral form and our partner team will review your application.
                  We'll be in touch within 2 business days.
                </p>
              </div>

              <div className="space-y-5 hairline pt-6">
                {[
                  { label: "Response Time", value: "Within 2 business days" },
                  { label: "Commission Payouts", value: "Monthly via bank or PayPal" },
                  { label: "Questions?", value: "support@memory3d.com" },
                ].map((item) => (
                  <div key={item.label}>
                    <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-medium mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-foreground/80 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-card border border-border rounded-sm">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-medium">
                  Quick Links
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Browse all products", to: "/shop" },
                    { label: "Learn about Memory3D", to: "/about" },
                    { label: "Contact our team", to: "/contact" },
                  ].map((l) => (
                    <Link
                      key={l.label}
                      to={l.to}
                      className="flex items-center justify-between text-sm text-foreground/80 hover:text-gold transition-colors group py-1"
                    >
                      {l.label}
                      <span className="text-gold text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — iframe form */}
          <Reveal delay={0.15}>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden p-2">
              <AffiliateForm />
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
