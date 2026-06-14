import { useShallow } from "zustand/react/shallow";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CRYPTO_ADDRESSES } from "@/lib/mock-data";
import { toast } from "sonner";
import { ArrowDownToLine, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/deposits")({
  head: () => ({ meta: [{ title: "Deposits — Apex Funded" }] }),
  component: Deposits,
});

function Deposits() {
  const userId = useStore((s) => s.currentUserId)!;
  const deposits = useStore(useShallow((s) => s.deposits.filter((d) => d.userId === userId)));
  const create = useStore((s) => s.createDeposit);
  const [amount, setAmount] = useState(100);
  const [asset, setAsset] = useState<keyof typeof CRYPTO_ADDRESSES>("USDT_TRC20");
  const [txid, setTxid] = useState("");

  const submit = () => {
    if (!txid) return toast.error("Enter TXID");
    create({ userId, amount, asset, txid });
    setTxid("");
    toast.success("Deposit submitted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Deposits</h1>
        <p className="text-muted-foreground mt-1">Add funds or submit a deposit request.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">New deposit</h2>
          <div>
            <label className="text-xs text-muted-foreground">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 w-full glass rounded-lg px-3 py-2.5 num bg-transparent outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Asset</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(Object.keys(CRYPTO_ADDRESSES) as (keyof typeof CRYPTO_ADDRESSES)[]).map((a) => (
                <button key={a} onClick={() => setAsset(a)} className={`px-3 py-2 rounded-lg text-xs ${asset === a ? "gradient-cyan-violet text-background font-semibold" : "glass"}`}>{a.replace("_", " ")}</button>
              ))}
            </div>
          </div>
          <div className="glass rounded-lg p-3 text-xs">
            <div className="text-muted-foreground mb-1">Send to:</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono break-all">{CRYPTO_ADDRESSES[asset]}</code>
              <button onClick={() => { navigator.clipboard.writeText(CRYPTO_ADDRESSES[asset]); toast.success("Copied"); }}><Copy className="h-3 w-3" /></button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">TXID</label>
            <input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="0x..." className="mt-1 w-full glass rounded-lg px-3 py-2.5 font-mono text-sm bg-transparent outline-none" />
          </div>
          <button onClick={submit} className="w-full py-3 rounded-xl gradient-cyan-violet text-background font-semibold">Submit deposit</button>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">History</h2>
          <div className="space-y-2">
            {deposits.map((d) => (
              <div key={d.id} className="glass rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-cyan/10 flex items-center justify-center">
                    <ArrowDownToLine className="h-4 w-4 text-cyan" />
                  </div>
                  <div>
                    <div className="font-semibold num">${d.amount}</div>
                    <div className="text-xs text-muted-foreground">{d.asset.replace("_", " ")} • {new Date(d.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <StatusPill status={d.status} />
              </div>
            ))}
            {deposits.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No deposits yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning",
    approved: "bg-success/15 text-success",
    rejected: "bg-destructive/15 text-destructive",
  };
  return <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${map[status]}`}>{status}</span>;
}
