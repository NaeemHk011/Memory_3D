import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Loader2, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [status,   setStatus]   = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setStatus("error");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await signUp(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(err.message ?? "Sign up failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f5f3ef" }}>

      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: "#1e2340" }}
      >
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7" style={{ color: "#b8962e" }} />
          <span className="text-white font-semibold text-lg">Memory3D Memorials</span>
        </div>
        <div>
          <blockquote className="text-2xl font-light leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.85)" }}>
            "To live in hearts we leave behind is not to die."
          </blockquote>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Build a beautiful, lasting memorial for someone you love.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <Heart className="w-9 h-9 mb-4 lg:hidden" style={{ color: "#b8962e" }} />
            <h1 className="text-3xl font-semibold" style={{ color: "#1a1a1a" }}>Create an account</h1>
            <p className="mt-1 text-sm" style={{ color: "#9d9590" }}>Build a lasting memorial for someone you love</p>
          </div>

          <div className="rounded-2xl p-8 shadow-sm" style={{ background: "#fff", border: "1px solid #e9e5de" }}>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#6b6560" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#b8b0a8" }} />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition-colors"
                    style={{ background: "#faf9f7", border: "1px solid #e9e5de", color: "#1a1a1a" }}
                    placeholder="you@example.com"
                    onFocus={(e) => (e.target.style.borderColor = "#b8962e")}
                    onBlur={(e) => (e.target.style.borderColor = "#e9e5de")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#6b6560" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#b8b0a8" }} />
                  <input
                    type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition-colors"
                    style={{ background: "#faf9f7", border: "1px solid #e9e5de", color: "#1a1a1a" }}
                    placeholder="Min. 6 characters"
                    onFocus={(e) => (e.target.style.borderColor = "#b8962e")}
                    onBlur={(e) => (e.target.style.borderColor = "#e9e5de")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#6b6560" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#b8b0a8" }} />
                  <input
                    type="password" required value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition-colors"
                    style={{ background: "#faf9f7", border: "1px solid #e9e5de", color: "#1a1a1a" }}
                    placeholder="••••••••"
                    onFocus={(e) => (e.target.style.borderColor = "#b8962e")}
                    onBlur={(e) => (e.target.style.borderColor = "#e9e5de")}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="text-sm rounded-lg px-4 py-3" style={{ background: "#fff5f5", color: "#c0392b", border: "1px solid #fcc" }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit" disabled={status === "loading"}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background: "#1e2340" }}
              >
                {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>

            <p className="text-center text-sm mt-5" style={{ color: "#9d9590" }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: "#b8962e" }}>
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#b8b0a8" }}>
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
