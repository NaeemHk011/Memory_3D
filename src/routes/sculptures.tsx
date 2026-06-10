import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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

function SculpturesPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      {/* ── Hero ── */}
      <section className="pt-40 pb-16 bg-gradient-hero border-b border-border">
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
              Fill in the form below and our team will reach out within 24 hours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <Reveal>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle className="w-16 h-16 text-gold mb-6" />
                <h2 className="font-display text-4xl text-foreground mb-3">Request Received!</h2>
                <p className="text-muted-foreground max-w-sm">
                  Thank you for your interest. Our team will get back to you within 24 hours to
                  schedule your scan session.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 text-[11px] tracking-[0.2em] uppercase text-gold hover:underline font-medium"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast.success("Request sent – we'll be in touch within 24 hours.");
                }}
                className="space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name">
                    <input required className="input" placeholder="Your full name" />
                  </Field>
                  <Field label="Email">
                    <input required type="email" className="input" placeholder="you@email.com" />
                  </Field>
                </div>

                <Field label="Phone Number">
                  <input type="tel" className="input" placeholder="+1 (555) 000-0000" />
                </Field>

                <Field label="What would you like to sculpt?">
                  <select className="input">
                    <option>Individual (single person)</option>
                    <option>Couple</option>
                    <option>Family group</option>
                    <option>Pet</option>
                    <option>Group (5+ people)</option>
                    <option>Other</option>
                  </select>
                </Field>

                <Field label="Preferred scan date / location">
                  <input className="input" placeholder="e.g. Flexible, or a specific city / date" />
                </Field>

                <Field label="Tell us more about your project">
                  <textarea
                    required
                    rows={5}
                    className="input resize-none"
                    placeholder="The occasion, people involved, any special requests…"
                  />
                </Field>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-3 bg-gradient-gold text-white py-4 text-[11px] tracking-[0.3em] uppercase rounded-sm shadow-gold hover:opacity-90 transition font-bold"
                >
                  Send Request <Send className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-muted-foreground tracking-wider">
                  No payment required at this stage. We'll confirm availability and pricing.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <style>{`
        .input {
          width: 100%;
          background: var(--color-card);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          padding: 0.95rem 1rem;
          border-radius: 4px;
          font-size: 0.95rem;
          transition: border-color 0.2s;
          font-family: var(--font-sans);
        }
        .input:focus {
          outline: none;
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px oklch(0.62 0.14 79 / 0.08);
        }
        .input::placeholder {
          color: var(--color-muted-foreground);
        }
        select.input option {
          background: white;
          color: var(--color-foreground);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2 font-medium">
        {label}
      </span>
      {children}
    </label>
  );
}
