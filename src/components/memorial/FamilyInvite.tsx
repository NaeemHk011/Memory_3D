import { useState } from "react";
import { inviteFamilyMember } from "@/lib/memorial-api";
import { Loader2, UserPlus, Check } from "lucide-react";

interface Props {
  memorialId: string;
}

export function FamilyInvite({ memorialId }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await inviteFamilyMember(memorialId, email, role);
      setStatus("success");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to send invite.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <UserPlus className="w-5 h-5 text-gold" />
        <h3 className="font-display text-xl text-foreground">Invite Family</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            placeholder="family@example.com"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Permission
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
          >
            <option value="viewer">Viewer     can view only</option>
            <option value="editor">Editor     can add photos &amp; stories</option>
          </select>
        </div>

        {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}

        {status === "success" && (
          <p className="flex items-center gap-2 text-sm text-green-400">
            <Check className="w-4 h-4" /> Invite sent successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-gradient-gold text-primary-foreground py-2.5 rounded-sm text-[11px] tracking-[0.25em] uppercase disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          Send Invite
        </button>
      </form>
    </div>
  );
}
