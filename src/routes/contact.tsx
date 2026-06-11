import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Mail, Phone, MapPin, Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Schedule a Scan -  Memory3D" },
      {
        name: "description",
        content:
          "Reach our studio, schedule a 3D body scan or get help personalizing your crystal keepsake.",
      },
      { property: "og:title", content: "Contact -  Memory3D" },
      { property: "og:description", content: "Talk to our crystal specialists." },
    ],
  }),
  component: Contact,
});

function ContactForm() {
  useEffect(() => {
    const existing = document.getElementById("webtechs-contact-script");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://link.webtechs.dev/js/form_embed.js";
    script.id = "webtechs-contact-script";
    document.body.appendChild(script);

    return () => {
      const s = document.getElementById("webtechs-contact-script");
      if (s) s.remove();
    };
  }, []);

  return (
    <iframe
      src="https://link.webtechs.dev/widget/form/ExdOaElPn6UXK5XTg0mX"
      style={{ width: "100%", minHeight: 465, border: "none", borderRadius: "6px", display: "block" }}
      id="inline-ExdOaElPn6UXK5XTg0mX"
      data-layout="{'id':'INLINE'}"
      data-trigger-type="alwaysShow"
      data-trigger-value=""
      data-activation-type="alwaysActivated"
      data-activation-value=""
      data-deactivation-type="neverDeactivate"
      data-deactivation-value=""
      data-form-name="Form 1"
      data-height="465"
      data-layout-iframe-id="inline-ExdOaElPn6UXK5XTg0mX"
      data-form-id="ExdOaElPn6UXK5XTg0mX"
      title="Form 1"
    />
  );
}

function Contact() {
  return (
    <div className="bg-background">

      {/* ───────── HERO ───────── */}
      <section className="pt-40 pb-20 bg-gradient-hero border-b border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Reveal>
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              Get In Touch
            </span>
            <h1 className="font-display text-6xl md:text-8xl mt-4 leading-[0.95] text-foreground">
              Let's make <br />
              <em className="text-gradient-gold not-italic">something forever.</em>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg font-light leading-relaxed">
              Have a question, want to place a custom order, or ready to book a scan? We're here for you.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10">
              <a
                href="#contact-form"
                className="btn-shine inline-flex items-center gap-2 pl-6 pr-5 py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-gold text-white rounded-full font-bold shadow-gold hover:shadow-[0_8px_28px_-4px_oklch(0.62_0.14_79/0.55)] hover:-translate-y-px transition-all duration-300"
              >
                Send a Message
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── FORM + INFO ───────── */}
      <section id="contact-form" className="py-20 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16">

          {/* ── Iframe Form ── */}
          <Reveal>
            <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden p-2">
              <ContactForm />
            </div>
          </Reveal>

          {/* ── Contact Info ── */}
          <Reveal delay={0.15}>
            <div className="space-y-10">
              <div>
                <h3 className="font-display text-3xl text-foreground mb-2">Studio</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By appointment only. We host scan days in cities nationwide, book yours below.
                </p>
              </div>

              <ul className="space-y-5">
                {[
                  { icon: Mail,     t: "support@memory3d.com",    href: "mailto:support@memory3d.com" },
                  { icon: Phone,    t: "888-936-3667",             href: "tel:888-936-3667" },
                  { icon: MapPin,   t: "Nationwide pop-up scans",  href: undefined },
                  { icon: Calendar, t: "Mon – Sat, 9am – 7pm",    href: undefined },
                ].map(({ icon: I, t, href }) => (
                  <li key={t} className="flex items-center gap-4">
                    <span className="w-11 h-11 grid place-items-center border border-gold/40 rounded-sm bg-gold/5 shrink-0">
                      <I className="w-4 h-4 text-gold" />
                    </span>
                    {href ? (
                      <a href={href} className="text-foreground/90 hover:text-gold transition-colors">
                        {t}
                      </a>
                    ) : (
                      <span className="text-foreground/90">{t}</span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Wedding & Event inquiries */}
              <div className="hairline pt-8">
                <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3 font-semibold">
                  Wedding & Event Inquiries
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  For wedding parties, corporate gifting, sports teams, and group scans (10+
                  people), email{" "}
                  <a
                    href="mailto:support@memory3d.com"
                    className="text-gold hover:underline font-medium"
                  >
                    support@memory3d.com
                  </a>{" "}
                  for a custom quote.
                </p>
              </div>

              {/* Quick links */}
              <div className="p-6 bg-card border border-border rounded-sm shadow-sm">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4 font-medium">
                  Quick Links
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Browse all products",     href: "/shop" },
                    { label: "Learn about our process", href: "/about" },
                  ].map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="flex items-center justify-between text-sm text-foreground/80 hover:text-gold transition-colors group py-1"
                    >
                      {l.label}
                      <span className="text-gold text-lg group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
