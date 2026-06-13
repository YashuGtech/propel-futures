import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";
import { Check, X, Users, ShoppingBag, ArrowDownToLine, ArrowUpFromLine, Activity } from "lucide-react";
import { StatusPill } from "./_authenticated.deposits";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Apex Funded" }] }),
  component: Admin,
});

function Admin() {
  const users = useStore((s) => s.users);
  const accounts = useStore((s) => s.accounts);
  const trades = useStore((s) => s.trades);
  const deposits = useStore((s) => s.deposits);
  const withdrawals = useStore((s) => s.withdrawals);
  const approveDep = useStore((s) => s.approveDeposit);
  const rejectDep = useStore((s) => s.rejectDeposit);
  const approveW = useStore((s) => s.approveWithdrawal);
  const rejectW = useStore((s) => s.rejectWithdrawal);
  const promote = useStore((s) => s.promotePhase);
  const failAccount = useStore((s) => s.failAccount);
  const adjust = useStore((s) => s.adjustBalance);

  const [tab, setTab] = useState<"deposits" | "withdrawals" | "users" | "accounts">("deposits");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Demo admin — anyone logged in can manage data.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat icon={Users} label="Users" value={users.length} />
        <Stat icon={ShoppingBag} label="Accounts" value={accounts.length} />
        <Stat icon={Activity} label="Trades" value={trades.length} />
        <Stat icon={ArrowDownToLine} label="Pending deposits" value={deposits.filter((d) => d.status === "pending").length} />
        <Stat icon={ArrowUpFromLine} label="Pending withdrawals" value={withdrawals.filter((w) => w.status === "pending").length} />
      </div>

      <div className="glass rounded-2xl p-2 inline-flex gap-1">
        {(["deposits", "withdrawals", "users", "accounts"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "gradient-cyan-violet text-background font-semibold" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "deposits" && (
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th className="text-left py-2">User</th><th className="text-left">Package</th><th className="text-right">Amount</th><th>Asset</th><th>TXID</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {deposits.map((d) => {
                const u = users.find((x) => x.id === d.userId);
                return (
                  <tr key={d.id} className="border-t border-white/5">
                    <td className="py-2">{u?.email}</td>
                    <td>{d.packageId ?? "—"}</td>
                    <td className="text-right num">${d.amount}</td>
                    <td>{d.asset.replace("_", " ")}</td>
                    <td className="font-mono text-xs truncate max-w-[140px]">{d.txid ?? (d.screenshot ? "📎 screenshot" : "—")}</td>
                    <td><StatusPill status={d.status} /></td>
                    <td className="text-right">
                      {d.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { approveDep(d.id); toast.success("Approved"); }} className="p-1.5 rounded bg-success/20 text-success"><Check className="h-3 w-3" /></button>
                          <button onClick={() => { rejectDep(d.id); toast("Rejected"); }} className="p-1.5 rounded bg-destructive/20 text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {deposits.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No deposits</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th className="text-left py-2">User</th><th className="text-right">Amount</th><th>Asset</th><th>Address</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const u = users.find((x) => x.id === w.userId);
                return (
                  <tr key={w.id} className="border-t border-white/5">
                    <td className="py-2">{u?.email}</td>
                    <td className="text-right num">${w.amount}</td>
                    <td>{w.asset.replace("_", " ")}</td>
                    <td className="font-mono text-xs truncate max-w-[160px]">{w.address}</td>
                    <td><StatusPill status={w.status} /></td>
                    <td className="text-right">
                      {w.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => approveW(w.id)} className="p-1.5 rounded bg-success/20 text-success"><Check className="h-3 w-3" /></button>
                          <button onClick={() => rejectW(w.id)} className="p-1.5 rounded bg-destructive/20 text-destructive"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {withdrawals.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No withdrawals</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th className="text-left py-2">Name</th><th className="text-left">Email</th><th>Code</th><th className="text-right">Accounts</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="font-mono">{u.referralCode}</td>
                  <td className="text-right num">{accounts.filter((a) => a.userId === u.id).length}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "accounts" && (
        <div className="glass rounded-2xl p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr><th className="text-left py-2">User</th><th>Login</th><th className="text-right">Size</th><th className="text-right">Balance</th><th>Phase</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const u = users.find((x) => x.id === a.userId);
                return (
                  <tr key={a.id} className="border-t border-white/5">
                    <td className="py-2">{u?.email}</td>
                    <td className="font-mono text-xs">{a.serverLogin}</td>
                    <td className="text-right num">${a.size.toLocaleString()}</td>
                    <td className="text-right num">${a.balance.toFixed(2)}</td>
                    <td className="capitalize">{a.phase}</td>
                    <td className="capitalize">{a.status}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => { promote(a.id); toast.success("Promoted"); }} className="text-[10px] px-2 py-1 rounded bg-success/20 text-success">Promote</button>
                        <button onClick={() => { failAccount(a.id, "Admin action"); toast("Failed"); }} className="text-[10px] px-2 py-1 rounded bg-destructive/20 text-destructive">Fail</button>
                        <button onClick={() => { const v = Number(prompt("Adjust amount (+/-)?", "100") ?? 0); if (v) adjust(a.id, v, "Admin adjust"); }} className="text-[10px] px-2 py-1 rounded bg-cyan/20 text-cyan">Adjust</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: I, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><I className="h-3 w-3" /> {label}</div>
      <div className="text-2xl font-display font-bold num mt-1">{value}</div>
    </div>
  );
}
