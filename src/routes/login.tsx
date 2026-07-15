import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await signIn(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErrorMsg(err.message ?? "Login failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Heart className="w-10 h-10 text-gold mx-auto mb-4" />
          <h1 className="font-display text-4xl text-foreground">Welcome back</h1>
          <p className="mt-2 text-muted-foreground text-sm">Sign in to manage your memorials</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-8 space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-gold text-primary-foreground py-3 rounded-sm text-[11px] tracking-[0.3em] uppercase font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            No account?{" "}
            <Link to="/signup" className="text-gold hover:underline">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
