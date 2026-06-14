import { useShallow } from "zustand/react/shallow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { StatCard } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Activity, Target, Sparkles, ArrowRight, Gift } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Apex Funded" }] }),
  component: Dashboard,
});

function Dashboard() {
  const userId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const allAccounts = useStore((s) => s.accounts);
  const allTrades = useStore((s) => s.trades);
  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);
  const accounts = useMemo(() => allAccounts.filter((a) => a.userId === userId), [allAccounts, userId]);
  const accountIds = useMemo(() => new Set(accounts.map((a) => a.id)), [accounts]);
  const trades = useMemo(() => allTrades.filter((t) => accountIds.has(t.accountId)), [allTrades, accountIds]);
  const totalEquity = accounts.reduce((sum, a) => sum + a.equity, 0);
  const totalPnL = accounts.reduce((sum, a) => sum + (a.equity - a.startBalance), 0);
  const openTrades = trades.filter((t) => t.status === "open");
  const closedTrades = trades.filter((t) => t.status === "closed");
  const winRate = closedTrades.length ? (closedTrades.filter((t) => t.pnl > 0).length / closedTrades.length) * 100 : 0;

  // Generate equity curve from closed trades
  const equityData = (() => {
    let bal = accounts.reduce((s, a) => s + a.startBalance, 0);
    const sorted = [...closedTrades].sort((a, b) => (a.closeTime ?? 0) - (b.closeTime ?? 0));
    const points = [{ name: "Start", v: bal }];
    sorted.forEach((t, i) => { bal += t.pnl; points.push({ name: `T${i + 1}`, v: bal }); });
    if (points.length === 1) {
      for (let i = 0; i < 12; i++) points.push({ name: `${i}`, v: bal + Math.sin(i / 2) * 30 + i * 5 });
    }
    return points;
  })();

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Hero greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-3xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-30 bg-gradient-to-br from-cyan to-violet anim-spin-slow" />
        <div className="relative">
          <div className="text-sm text-muted-foreground">Welcome back,</div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold mt-1">{user?.name} 👋</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Your trading command center. Manage accounts, trade the markets, and track every metric in one place.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/terminal" className="px-4 py-2 rounded-lg gradient-cyan-violet text-background font-semibold text-sm inline-flex items-center gap-2">
              Open terminal <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/challenges" className="px-4 py-2 rounded-lg glass text-sm font-semibold">Buy challenge</Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Equity" value={`$${totalEquity.toFixed(2)}`} sub={`${accounts.length} accounts`} accent="cyan" />
        <StatCard label="Total P&L" value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`} sub="All time" accent={totalPnL >= 0 ? "success" : "warning"} />
        <StatCard label="Open Trades" value={String(openTrades.length)} sub={`${closedTrades.length} closed`} accent="violet" />
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} sub={`${closedTrades.length} trades`} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg">Equity Curve</h3>
              <p className="text-xs text-muted-foreground">Combined across all accounts</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Current</div>
              <div className="text-xl font-bold num text-cyan">${totalEquity.toFixed(2)}</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.72 0.18 220)" strokeWidth={2.5} fill="url(#eq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts list */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg">Accounts</h3>
            <Link to="/accounts" className="text-xs text-cyan">View all →</Link>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
            {accounts.map((a) => {
              const pnl = a.equity - a.startBalance;
              const isWelcome = a.phase === "welcome";
              return (
                <div key={a.id} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {isWelcome && <Gift className="h-3 w-3 text-gold" />}
                        {isWelcome ? "Welcome Bonus" : `Acc #${a.serverLogin}`}
                      </div>
                      <div className="font-bold num">${a.size.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <PhaseBadge phase={a.phase} />
                      <div className={`text-sm num font-semibold ${pnl >= 0 ? "text-success" : "text-destructive"}`}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No accounts yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Recent Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Side</th>
                <th className="text-right py-2">Lots</th>
                <th className="text-right py-2">Open</th>
                <th className="text-right py-2">Close</th>
                <th className="text-right py-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.slice(0, 8).map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-3 font-mono">{t.symbol}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${t.side === "buy" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                      {t.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right num">{t.lots}</td>
                  <td className="py-3 text-right num">{t.openPrice.toFixed(4)}</td>
                  <td className="py-3 text-right num">{t.closePrice?.toFixed(4) ?? "—"}</td>
                  <td className={`py-3 text-right num font-semibold ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>
                    {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No trades yet — head to the terminal</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function PhaseBadge({ phase }: { phase: string }) {
  const map: Record<string, { l: string; c: string }> = {
    welcome: { l: "Demo $100", c: "bg-gold/15 text-gold" },
    phase1: { l: "Phase 1", c: "bg-cyan/15 text-cyan" },
    phase2: { l: "Phase 2", c: "bg-violet/15 text-violet" },
    funded: { l: "Funded", c: "bg-success/15 text-success" },
  };
  const m = map[phase] ?? { l: phase, c: "bg-muted" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${m.c}`}>{m.l}</span>;
}
