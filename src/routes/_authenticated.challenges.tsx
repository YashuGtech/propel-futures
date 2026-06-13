import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PACKAGES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/challenges")({
  head: () => ({ meta: [{ title: "Marketplace — Apex Funded" }] }),
  component: Marketplace,
});

function Marketplace() {
  const [model, setModel] = useState<"all" | "1-Step" | "2-Step" | "Instant">("all");
  const filtered = PACKAGES.filter((p) => model === "all" || p.model === model);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Challenge Marketplace</h1>
        <p className="text-muted-foreground mt-1">Compare funded account packages and pick your evaluation model.</p>
      </div>

      <div className="glass rounded-2xl p-2 flex gap-2 w-fit">
        {(["all", "1-Step", "2-Step", "Instant"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${model === m ? "gradient-cyan-violet text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            {m === "all" ? "All" : m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -6 }}
            className={`glass rounded-2xl p-6 relative ${p.popular ? "border-cyan/50 glow-cyan" : ""}`}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest gradient-cyan-violet text-background px-3 py-1 rounded-full font-bold">
                Most popular
              </div>
            )}
            <div className="text-xs text-muted-foreground uppercase tracking-widest">{p.model}</div>
            <div className="text-4xl font-display font-bold num mt-2">${(p.size / 1000).toFixed(0)}K</div>
            <div className="text-xs text-muted-foreground">Account size</div>

            <ul className="mt-5 space-y-2 text-sm">
              {[
                ["Profit target", `${p.profitTarget}%`],
                ["Daily drawdown", `${p.dailyDD}%`],
                ["Max drawdown", `${p.maxDD}%`],
                ["Profit split", `${p.split}%`],
                ["Min trading days", p.model === "Instant" ? "0" : "3"],
                ["News trading", "Allowed"],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground flex-1">{k}</span>
                  <span className="font-semibold num">{v}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-end justify-between">
              <div>
                <div className="text-xs text-muted-foreground">One-time fee</div>
                <div className="text-2xl font-display font-bold num">${p.fee}</div>
              </div>
              <Link
                to="/checkout/$packageId"
                params={{ packageId: p.id }}
                className="px-4 py-2.5 rounded-lg gradient-cyan-violet text-background text-sm font-semibold glow-cyan"
              >
                Buy now
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
