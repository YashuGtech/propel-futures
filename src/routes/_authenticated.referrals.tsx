import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Copy, Share2, Users, DollarSign, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Referrals — Apex Funded" }] }),
  component: Referrals,
});

function Referrals() {
  const userId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const allReferrals = useStore((s) => s.referrals);
  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);
  const referrals = useMemo(() => allReferrals.filter((r) => r.referrerId === userId), [allReferrals, userId]);
  const totalEarned = referrals.reduce((sum, r) => sum + r.reward, 0);

  const link = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${user?.referralCode}` : "";
  const copy = (s: string) => { navigator.clipboard.writeText(s); toast.success("Copied"); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground mt-1">Earn 10% commission on every challenge purchased by your referrals.</p>
      </div>

      <div className="glass-strong rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-30 gradient-cyan-violet anim-spin-slow" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Your code</div>
            <div className="text-3xl font-display font-bold mt-1 text-gradient num">{user?.referralCode}</div>
            <button onClick={() => copy(user?.referralCode ?? "")} className="mt-2 text-xs glass px-3 py-1.5 rounded-md inline-flex items-center gap-1"><Copy className="h-3 w-3" /> Copy code</button>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Referrals</div>
            <div className="text-3xl font-display font-bold num mt-1">{referrals.length}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Users className="h-3 w-3" /> Active</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Earned</div>
            <div className="text-3xl font-display font-bold num mt-1 text-success">${totalEarned.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Lifetime</div>
          </div>
        </div>

        <div className="mt-6 glass rounded-xl p-3 flex items-center gap-2">
          <code className="flex-1 text-xs font-mono break-all">{link}</code>
          <button onClick={() => copy(link)} className="px-3 py-1.5 rounded-md gradient-cyan-violet text-background text-xs font-semibold inline-flex items-center gap-1">
            <Share2 className="h-3 w-3" /> Share link
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Your referrals</h2>
        <div className="space-y-2">
          {referrals.map((r) => {
            const u = users.find((x) => x.id === r.referredId);
            return (
              <div key={r.referredId} className="glass rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-cyan-violet flex items-center justify-center text-background font-bold">
                    {u?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="font-semibold">{u?.name}</div>
                    <div className="text-xs text-muted-foreground">{u?.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-success num font-semibold">+${r.reward}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
          {referrals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto opacity-30" />
              <div className="mt-3 text-sm">No referrals yet — share your link to start earning</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
