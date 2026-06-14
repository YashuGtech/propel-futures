import { useShallow } from "zustand/react/shallow";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { INSTRUMENTS } from "@/lib/mock-data";
import { useStore, computePnL } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, X, Search, Star } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip, ReferenceLine } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/terminal")({
  head: () => ({ meta: [{ title: "Trading Terminal — Apex Funded" }] }),
  component: Terminal,
});

type Candle = { t: number; o: number; h: number; l: number; c: number };

function Terminal() {
  const accounts = useStore((s) => s.accounts.filter((a) => a.userId === s.currentUserId && a.status === "active"));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const trades = useStore((s) => s.trades.filter((t) => t.accountId === account?.id));
  const openTrade = useStore((s) => s.openTrade);
  const closeTrade = useStore((s) => s.closeTrade);
  const updateOpenPnL = useStore((s) => s.updateOpenPnL);

  const [symbol, setSymbol] = useState<string>("EURUSD");
  const inst = INSTRUMENTS.find((i) => i.symbol === symbol)!;
  const [prices, setPrices] = useState<Record<string, number>>(() => Object.fromEntries(INSTRUMENTS.map((i) => [i.symbol, i.basePrice])));
  const [candles, setCandles] = useState<Record<string, Candle[]>>({});
  const [showIndicators, setShowIndicators] = useState({ sma: true, ema: false, bb: false });

  // Initialize candles per symbol
  useEffect(() => {
    if (candles[symbol]) return;
    const init: Candle[] = [];
    let p = inst.basePrice;
    const now = Date.now();
    for (let i = 60; i > 0; i--) {
      const change = (Math.random() - 0.5) * inst.basePrice * 0.004;
      const o = p;
      const c = p + change;
      const h = Math.max(o, c) + Math.random() * Math.abs(change) * 0.5;
      const l = Math.min(o, c) - Math.random() * Math.abs(change) * 0.5;
      init.push({ t: now - i * 60000, o, h, l, c });
      p = c;
    }
    setCandles((prev) => ({ ...prev, [symbol]: init }));
  }, [symbol, inst.basePrice]);

  // Price tick
  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        INSTRUMENTS.forEach((i) => {
          const cur = next[i.symbol] ?? i.basePrice;
          const change = (Math.random() - 0.5) * i.basePrice * 0.0008;
          next[i.symbol] = Math.max(0.0001, cur + change);
        });
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // Push candles
  useEffect(() => {
    const id = setInterval(() => {
      setCandles((prev) => {
        const next = { ...prev };
        const arr = next[symbol] ? [...next[symbol]] : [];
        const last = arr[arr.length - 1];
        const p = prices[symbol] ?? inst.basePrice;
        if (last && Date.now() - last.t < 6000) {
          // update last
          arr[arr.length - 1] = { ...last, c: p, h: Math.max(last.h, p), l: Math.min(last.l, p) };
        } else {
          arr.push({ t: Date.now(), o: last?.c ?? p, h: p, l: p, c: p });
          if (arr.length > 80) arr.shift();
        }
        next[symbol] = arr;
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, [symbol, prices, inst.basePrice]);

  // Update open trade P&L + check SL/TP
  useEffect(() => { updateOpenPnL(prices); }, [prices, updateOpenPnL]);

  // SL/TP/Drawdown checks
  useEffect(() => {
    trades.forEach((t) => {
      if (t.status !== "open") return;
      const p = prices[t.symbol];
      if (!p) return;
      const hitSL = t.sl && (t.side === "buy" ? p <= t.sl : p >= t.sl);
      const hitTP = t.tp && (t.side === "buy" ? p >= t.tp : p <= t.tp);
      if (hitSL || hitTP) {
        closeTrade(t.id, p);
        toast(hitTP ? "TP hit ✓" : "SL hit", { description: `${t.symbol} closed at ${p.toFixed(inst.digits)}` });
      }
    });
  }, [prices, trades, closeTrade, inst.digits]);

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market");
  const [lots, setLots] = useState(0.1);
  const [price, setPrice] = useState<number>(inst.basePrice);
  const [sl, setSl] = useState<number | "">("");
  const [tp, setTp] = useState<number | "">("");

  useEffect(() => { setPrice(prices[symbol] ?? inst.basePrice); }, [symbol]);

  const place = () => {
    if (!account) return toast.error("No active account");
    const p = orderType === "market" ? prices[symbol] : price;
    openTrade({
      accountId: account.id,
      symbol,
      side,
      type: orderType,
      lots,
      openPrice: p,
      sl: sl === "" ? undefined : Number(sl),
      tp: tp === "" ? undefined : Number(tp),
    });
    toast.success(`${side.toUpperCase()} ${lots} ${symbol} @ ${p.toFixed(inst.digits)}`);
  };

  const chartData = useMemo(() => (candles[symbol] ?? []).map((c, i) => ({ i, v: c.c, h: c.h, l: c.l, o: c.o })), [candles, symbol]);
  const smaData = useMemo(() => {
    const period = 10;
    return chartData.map((d, i) => {
      if (i < period) return { ...d, sma: undefined };
      const slice = chartData.slice(i - period, i);
      return { ...d, sma: slice.reduce((s, x) => s + x.v, 0) / period };
    });
  }, [chartData]);

  if (!account) {
    return (
      <div className="glass-strong rounded-2xl p-12 text-center">
        <h2 className="text-2xl font-display font-bold">No active trading account</h2>
        <p className="text-muted-foreground mt-2">Purchase a challenge or use your $100 welcome demo.</p>
      </div>
    );
  }

  const curPrice = prices[symbol] ?? inst.basePrice;

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-9rem)] pb-20 lg:pb-0">
      {/* Market Watch */}
      <div className="col-span-12 lg:col-span-3 glass rounded-2xl p-3 flex flex-col">
        <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 mb-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search symbol" className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
          {INSTRUMENTS.map((i) => {
            const p = prices[i.symbol] ?? i.basePrice;
            const change = ((p - i.basePrice) / i.basePrice) * 100;
            const up = change >= 0;
            return (
              <button
                key={i.symbol}
                onClick={() => setSymbol(i.symbol)}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all ${symbol === i.symbol ? "bg-gradient-to-r from-cyan/15 to-violet/10 border border-cyan/30" : "hover:bg-white/5"}`}
              >
                <div>
                  <div className="font-mono text-xs font-semibold">{i.symbol}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{i.type}</div>
                </div>
                <div className="text-right">
                  <div className="num text-sm">{p.toFixed(i.digits)}</div>
                  <div className={`text-[10px] num ${up ? "text-success" : "text-destructive"}`}>{up ? "+" : ""}{change.toFixed(2)}%</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart + Positions */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-0">
        {/* Header */}
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{symbol}</h2>
              <span className="text-xs text-muted-foreground">{inst.name}</span>
            </div>
            <div className="text-3xl num font-bold text-cyan mt-1">{curPrice.toFixed(inst.digits)}</div>
          </div>
          <div className="text-right">
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none">
              {accounts.map((a) => <option key={a.id} value={a.id} className="bg-card">
                {a.phase === "welcome" ? "Demo $100" : `${a.serverLogin} • $${a.size.toLocaleString()}`}
              </option>)}
            </select>
            <div className="text-xs text-muted-foreground mt-1">Equity: <span className="num text-foreground font-semibold">${account.equity.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass rounded-2xl p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xs text-muted-foreground">Indicators:</div>
            {(["sma", "ema", "bb"] as const).map((k) => (
              <button key={k} onClick={() => setShowIndicators((s) => ({ ...s, [k]: !s[k] }))} className={`text-xs px-2 py-1 rounded ${showIndicators[k] ? "bg-cyan/20 text-cyan" : "glass text-muted-foreground"}`}>
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={smaData}>
                <defs>
                  <linearGradient id="px" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.18 220)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={["dataMin", "dataMax"]} orientation="right" tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }} width={70} tickFormatter={(v) => v.toFixed(inst.digits)} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.025 265)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} formatter={(v: number) => v.toFixed(inst.digits)} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.72 0.18 220)" strokeWidth={2} fill="url(#px)" />
                {showIndicators.sma && <Area type="monotone" dataKey="sma" stroke="oklch(0.82 0.14 85)" strokeWidth={1.5} fill="transparent" dot={false} />}
                {trades.filter((t) => t.status === "open" && t.symbol === symbol).map((t) => (
                  <ReferenceLine key={t.id} y={t.openPrice} stroke={t.side === "buy" ? "oklch(0.72 0.18 155)" : "oklch(0.65 0.24 25)"} strokeDasharray="4 4" />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Positions */}
        <div className="glass rounded-2xl p-4 max-h-56 overflow-y-auto scrollbar-thin">
          <div className="text-sm font-semibold mb-3">Open Positions ({trades.filter((t) => t.status === "open").length})</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr><th className="text-left">Symbol</th><th>Side</th><th className="text-right">Lots</th><th className="text-right">Open</th><th className="text-right">Cur</th><th className="text-right">P&L</th><th></th></tr>
            </thead>
            <tbody>
              {trades.filter((t) => t.status === "open").map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="font-mono py-2">{t.symbol}</td>
                  <td className="text-center">{t.side === "buy" ? <TrendingUp className="h-3 w-3 text-success inline" /> : <TrendingDown className="h-3 w-3 text-destructive inline" />}</td>
                  <td className="text-right num">{t.lots}</td>
                  <td className="text-right num">{t.openPrice.toFixed(4)}</td>
                  <td className="text-right num">{(prices[t.symbol] ?? 0).toFixed(4)}</td>
                  <td className={`text-right num font-semibold ${t.pnl >= 0 ? "text-success" : "text-destructive"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</td>
                  <td><button onClick={() => closeTrade(t.id, prices[t.symbol])} className="p-1 hover:bg-destructive/20 rounded text-destructive"><X className="h-3 w-3" /></button></td>
                </tr>
              ))}
              {trades.filter((t) => t.status === "open").length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-4">No open positions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Panel */}
      <div className="col-span-12 lg:col-span-3 glass rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
        <div className="text-sm font-semibold">New Order</div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setSide("buy")} className={`py-3 rounded-lg font-semibold text-sm ${side === "buy" ? "bg-success text-success-foreground glow-success" : "glass"}`}>
            BUY <span className="num text-xs block">{(curPrice + inst.spread).toFixed(inst.digits)}</span>
          </button>
          <button onClick={() => setSide("sell")} className={`py-3 rounded-lg font-semibold text-sm ${side === "sell" ? "bg-destructive text-destructive-foreground" : "glass"}`}>
            SELL <span className="num text-xs block">{curPrice.toFixed(inst.digits)}</span>
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Order type</label>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {(["market", "limit", "stop"] as const).map((t) => (
              <button key={t} onClick={() => setOrderType(t)} className={`py-1.5 rounded text-xs capitalize ${orderType === t ? "bg-cyan/20 text-cyan" : "glass text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        <NumField label="Lot size" value={lots} onChange={setLots} step={0.01} />
        {orderType !== "market" && <NumField label="Price" value={price} onChange={setPrice} step={inst.spread} digits={inst.digits} />}
        <NumField label="Stop Loss" value={sl === "" ? 0 : sl} onChange={(v) => setSl(v || "")} step={inst.spread} digits={inst.digits} allowEmpty />
        <NumField label="Take Profit" value={tp === "" ? 0 : tp} onChange={(v) => setTp(v || "")} step={inst.spread} digits={inst.digits} allowEmpty />

        <button onClick={place} className={`mt-2 py-3 rounded-xl font-semibold ${side === "buy" ? "bg-success text-success-foreground glow-success" : "bg-destructive text-destructive-foreground"}`}>
          Place {side.toUpperCase()} order
        </button>

        <div className="glass rounded-lg p-3 mt-2 text-xs space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="num">${account.balance.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Equity</span><span className="num">${account.equity.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Free margin</span><span className="num">${(account.equity * 0.95).toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Margin level</span><span className="num">{((account.equity / Math.max(1, account.size * 0.01)) * 100).toFixed(0)}%</span></div>
        </div>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, step = 1, digits = 2, allowEmpty }: { label: string; value: number; onChange: (v: number) => void; step?: number; digits?: number; allowEmpty?: boolean }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="number"
        step={step}
        value={value || (allowEmpty ? "" : 0)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none num"
      />
    </div>
  );
}
