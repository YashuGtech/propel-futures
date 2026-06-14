import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { ArrowUpFromLine } from "lucide-react";
import { StatusPill } from "./_authenticated.deposits";

export const Route = createFileRoute("/_authenticated/withdrawals")({
  head: () => ({ meta: [{ title: "Withdrawals — Apex Funded" }] }),
  component: Withdrawals,
});

function Withdrawals() {
  const userId = useStore((s) => s.currentUserId)!;
  const allAccounts = useStore((s) => s.accounts);
  const allWithdrawals = useStore((s) => s.withdrawals);
  const accounts = useMemo(() => allAccounts.filter((a) => a.userId === userId), [allAccounts, userId]);
  const withdrawals = useMemo(() => allWithdrawals.filter((w) => w.userId === userId), [allWithdrawals, userId]);
  const create = useStore((s) => s.createWithdrawal);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState(50);
  const [asset, setAsset] = useState("USDT_TRC20");
  const [address, setAddress] = useState("");

  const account = accounts.find((a) => a.id === accountId);
  const available = account ? Math.max(0, account.equity - account.startBalance) : 0;

  const submit = () => {
    if (!address) return toast.error("Enter wallet address");
    if (amount > available) return toast.error("Exceeds available profit");
    create({ userId, accountId, amount, asset, address });
    setAddress("");
    toast.success("Withdrawal requested");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Withdrawals</h1>
        <p className="text-muted-foreground mt-1">Request a payout of your trading profits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg">New withdrawal</h2>
          <div>
            <label className="text-xs text-muted-foreground">From account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 w-full glass rounded-lg px-3 py-2.5 bg-transparent outline-none">
              {accounts.map((a) => <option key={a.id} value={a.id} className="bg-card">
                {a.phase === "welcome" ? "Demo" : `#${a.serverLogin}`} — ${a.size.toLocaleString()} ({a.phase})
              </option>)}
            </select>
            <div className="text-xs text-muted-foreground mt-1">Available profit: <span className="text-success num font-semibold">${available.toFixed(2)}</span></div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Amount (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 w-full glass rounded-lg px-3 py-2.5 num bg-transparent outline-none" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Asset</label>
            <select value={asset} onChange={(e) => setAsset(e.target.value)} className="mt-1 w-full glass rounded-lg px-3 py-2.5 bg-transparent outline-none">
              {["USDT_TRC20", "USDT_ERC20", "BTC", "ETH"].map((a) => <option key={a} value={a} className="bg-card">{a.replace("_", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Wallet address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your wallet address" className="mt-1 w-full glass rounded-lg px-3 py-2.5 font-mono text-sm bg-transparent outline-none" />
          </div>
          <button onClick={submit} className="w-full py-3 rounded-xl gradient-cyan-violet text-background font-semibold">Request withdrawal</button>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-4">History</h2>
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="glass rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet/10 flex items-center justify-center">
                    <ArrowUpFromLine className="h-4 w-4 text-violet" />
                  </div>
                  <div>
                    <div className="font-semibold num">${w.amount}</div>
                    <div className="text-xs text-muted-foreground">{w.asset.replace("_", " ")} • {new Date(w.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <StatusPill status={w.status} />
              </div>
            ))}
            {withdrawals.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No withdrawals yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
