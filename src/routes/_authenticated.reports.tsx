import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Apex Funded" }] }),
  component: Reports,
});

function Reports() {
  const userId = useStore((s) => s.currentUserId);
  const accounts = useStore((s) => s.accounts);
  const allTrades = useStore((s) => s.trades);
  const accountIds = useMemo(
    () => new Set(accounts.filter((a) => a.userId === userId).map((a) => a.id)),
    [accounts, userId],
  );
  const trades = useMemo(() => allTrades.filter((t) => accountIds.has(t.accountId)), [allTrades, accountIds]);
  const closed = trades.filter((t) => t.status === "closed");
  const wins = closed.filter((t) => t.pnl > 0);
  const losses = closed.filter((t) => t.pnl <= 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const rr = avgLoss ? avgWin / avgLoss : 0;
  const total = closed.reduce((s, t) => s + t.pnl, 0);

  // Daily P&L
  const dailyMap: Record<string, number> = {};
  closed.forEach((t) => {
    const d = new Date(t.closeTime ?? 0).toLocaleDateString();
    dailyMap[d] = (dailyMap[d] ?? 0) + t.pnl;
  });
  const daily = Object.entries(dailyMap).map(([d, v]) => ({ d, v }));

  // Equity curve
  let bal = 0;
  const eq = [{ i: 0, v: 0 }, ...closed.map((t, i) => { bal += t.pnl; return { i: i + 1, v: bal }; })];

  // Symbol breakdown
  const symMap: Record<string, number> = {};
  closed.forEach((t) => { symMap[t.symbol] = (symMap[t.symbol] ?? 0) + 1; });
  const symbols = Object.entries(symMap).map(([name, value]) => ({ name, value }));
  const COLORS = ["oklch(0.72 0.18 220)", "oklch(0.65 0.22 295)", "oklch(0.72 0.18 155)", "oklch(0.82 0.14 85)", "oklch(0.65 0.24 25)"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Performance insights across all your accounts.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total P&L", `${total >= 0 ? "+" : ""}$${total.toFixed(2)}`, total >= 0 ? "text-success" : "text-destructive"],
          ["Win Rate", `${winRate.toFixed(1)}%`, "text-cyan"],
          ["R/R Ratio", rr.toFixed(2), "text-violet"],
          ["Total Trades", String(closed.length), "text-gold"],
        ].map(([l, v, c]) => (
          <div key={l} className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
            <div className={`text-2xl font-display font-bold num mt-1 ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Equity Curve">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={eq}>
              <defs>
                <linearGradient id="eqr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis dataKey="i" tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} />
              <YAxis tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.72 0.18 220)" strokeWidth={2.5} fill="url(#eqr)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily P&L">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis dataKey="d" tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} />
              <YAxis tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
              <Bar dataKey="v" radius={[8, 8, 0, 0]}>
                {daily.map((d, i) => <Cell key={i} fill={d.v >= 0 ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.24 25)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Win vs Loss">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={[{ n: "Wins", v: wins.length }, { n: "Losses", v: losses.length }]} dataKey="v" nameKey="n" innerRadius={60} outerRadius={100} paddingAngle={4}>
                <Cell fill="oklch(0.72 0.18 155)" />
                <Cell fill="oklch(0.65 0.24 25)" />
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-success" /> Wins ({wins.length})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-destructive" /> Losses ({losses.length})</div>
          </div>
        </ChartCard>

        <ChartCard title="Symbols traded">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={symbols} dataKey="value" nameKey="name" outerRadius={100} label>
                {symbols.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Full trade history</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Symbol</th>
                <th className="text-left py-2">Side</th>
                <th className="text-right py-2">Lots</th>
                <th className="text-right py-2">Open</th>
                <th className="text-right py-2">Close</th>
                <th className="text-right py-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {closed.slice(0, 30).map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="py-2 text-xs text-muted-foreground">{new Date(t.closeTime ?? 0).toLocaleString()}</td>
                  <td className="py-2 font-mono">{t.symbol}</td>
                  <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded ${t.side === "buy" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{t.side.toUpperCase()}</span></td>
                  <td className="py-2 text-right num">{t.lots}</td>
                  <td className="py-2 text-right num">{t.openPrice.toFixed(4)}</td>
                  <td className="py-2 text-right num">{t.closePrice?.toFixed(4)}</td>
                  <td className={`py-2 text-right num font-semibold ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</td>
                </tr>
              ))}
              {closed.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No closed trades yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
