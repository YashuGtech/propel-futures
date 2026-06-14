import { useShallow } from "zustand/react/shallow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { PhaseBadge } from "./_authenticated.dashboard";
import { Progress } from "@/components/ui/progress";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "My Accounts — Apex Funded" }] }),
  component: Accounts,
});

function Accounts() {
  const accounts = useStore(useShallow((s) => s.accounts.filter((a) => a.userId === s.currentUserId)));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">My Accounts</h1>
          <p className="text-muted-foreground mt-1">All your trading & evaluation accounts.</p>
        </div>
        <Link to="/challenges" className="px-4 py-2 rounded-lg gradient-cyan-violet text-background text-sm font-semibold">+ New challenge</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accounts.map((a) => <AccountCard key={a.id} a={a} />)}
        {accounts.length === 0 && (
          <div className="col-span-2 glass rounded-2xl p-12 text-center text-muted-foreground">No accounts yet.</div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ a }: { a: any }) {
  const [showPw, setShowPw] = useState(false);
  const pnl = a.equity - a.startBalance;
  const pnlPct = ((pnl / a.startBalance) * 100);
  // Progress on profit target — assume 8% for evaluation
  const target = a.phase === "phase1" || a.phase === "phase2" ? 8 : a.phase === "welcome" ? 50 : 0;
  const targetPct = target ? Math.max(0, Math.min(100, (pnlPct / target) * 100)) : 0;
  const ddRemaining = Math.max(0, a.highWater * 0.1 - (a.highWater - a.equity));

  const copy = (s: string, label: string) => {
    navigator.clipboard.writeText(s);
    toast.success(`${label} copied`);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Account size</div>
          <div className="text-2xl font-display font-bold num">${a.size.toLocaleString()}</div>
        </div>
        <PhaseBadge phase={a.phase} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Balance", `$${a.balance.toFixed(2)}`],
          ["Equity", `$${a.equity.toFixed(2)}`],
          ["P&L", `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`],
          ["Free Margin", `$${(a.equity * 0.95).toFixed(2)}`],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-lg p-3">
            <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
            <div className="num font-semibold mt-0.5">{v}</div>
          </div>
        ))}
      </div>

      {target > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Profit target ({target}%)</span>
            <span className="num font-semibold">{pnlPct.toFixed(2)}%</span>
          </div>
          <Progress value={targetPct} className="h-2" />
        </div>
      )}

      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Drawdown remaining</span>
          <span className="num font-semibold text-success">${ddRemaining.toFixed(2)}</span>
        </div>
        <Progress value={(ddRemaining / (a.highWater * 0.1)) * 100} className="h-2" />
      </div>

      {a.serverLogin && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm">
          <Cred label="Login" val={a.serverLogin} onCopy={() => copy(a.serverLogin, "Login")} />
          <Cred label="Password" val={showPw ? a.serverPassword : "••••••••••"} onCopy={() => copy(a.serverPassword, "Password")} extra={
            <button onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
          } />
          <Cred label="Server" val={a.server} onCopy={() => copy(a.server, "Server")} />
        </div>
      )}
    </div>
  );
}

function Cred({ label, val, onCopy, extra }: { label: string; val: string; onCopy: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20">{label}</span>
      <code className="text-xs font-mono flex-1">{val}</code>
      {extra}
      <button onClick={onCopy} className="p-1 hover:bg-white/10 rounded"><Copy className="h-3 w-3" /></button>
    </div>
  );
}
