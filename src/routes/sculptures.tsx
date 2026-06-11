import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Reveal } from "@/components/site/Reveal";
import { AffiliateBanner } from "@/components/site/AffiliateBanner";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/sculptures")({
  head: () => ({
    meta: [
      { title: "3D Sculptures – Book Your Scan | Memory3D" },
      {
        name: "description",
        content:
          "Book a 3D sculpture session. Tell us about your project and we'll be in touch within 24 hours.",
      },
      { property: "og:title", content: "3D Sculptures – Memory3D" },
      { property: "og:description", content: "Book your 3D sculpture scan with Memory3D." },
    ],
  }),
  component: SculpturesPage,
});

function SculptureForm() {
  useEffect(() => {
    const existing = document.getElementById("webtechs-sculpture-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://link.webtechs.dev/js/form_embed.js";
    script.id = "webtechs-sculpture-script";
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById("webtechs-sculpture-script");
      if (s) s.remove();
    };
  }, []);

  return (
    <iframe
      src="https://link.webtechs.dev/widget/form/ExdOaElPn6UXK5XTg0mX"
      style={{ width: "100%", minHeight: 465, border: "none", borderRadius: "6px", display: "block" }}
      id="inline-ExdOaElPn6UXK5XTg0mX-sculpt"
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Form 1"
      data-height="465"
      data-layout-iframe-id="inline-ExdOaElPn6UXK5XTg0mX-sculpt"
      data-form-id="ExdOaElPn6UXK5XTg0mX"
      title="3D Sculpture Inquiry"
    />
  );
}

function SculpturesPage() {
  return (
    <div className="bg-background min-h-screen">

      {/* ── Hero ── */}
      <section className="pt-40 pb-20 bg-gradient-hero border-b border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              3D Sculptures
            </span>
            <h1 className="font-display text-6xl md:text-8xl mt-4 leading-[0.95] text-foreground">
              You, in <br />
              <em className="text-gradient-gold not-italic">miniature.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl font-light leading-relaxed">
              Full-color, hand-finished figurines crafted from a single 12-second 3D scan.
              Fill in the form and our team will reach out within 24 hours.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10">
              <a
                href="#sculpture-form"
                className="btn-shine inline-flex items-center gap-2 pl-6 pr-5 py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-gold text-white rounded-full font-bold shadow-gold hover:shadow-[0_8px_28px_-4px_oklch(0.62_0.14_79/0.55)] hover:-translate-y-px transition-all duration-300"
              >
                Book Your Scan
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Form ── */}
      <section id="sculpture-form" className="py-24 scroll-mt-24">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <Reveal>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden p-2">
              <SculptureForm />
            </div>
            <AffiliateBanner />
          </Reveal>
        </div>
      </section>

    </div>
  );
}
