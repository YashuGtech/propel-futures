import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check, Upload, ArrowLeft } from "lucide-react";
import { PACKAGES, CRYPTO_ADDRESSES } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout/$packageId")({
  head: () => ({ meta: [{ title: "Checkout — Apex Funded" }] }),
  component: Checkout,
});

function Checkout() {
  const { packageId } = Route.useParams();
  const pkg = PACKAGES.find((p) => p.id === packageId);
  const navigate = useNavigate();
  const userId = useStore((s) => s.currentUserId)!;
  const createDeposit = useStore((s) => s.createDeposit);

  const [asset, setAsset] = useState<keyof typeof CRYPTO_ADDRESSES>("USDT_TRC20");
  const [txid, setTxid] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!pkg) return <div>Package not found.</div>;

  const copy = () => {
    navigator.clipboard.writeText(CRYPTO_ADDRESSES[asset]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshot(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!txid && !screenshot) return toast.error("Provide TXID or screenshot");
    createDeposit({ userId, packageId: pkg.id, amount: pkg.fee, asset, txid, screenshot });
    toast.success("Payment submitted — awaiting admin verification");
    navigate({ to: "/deposits" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/challenges" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Summary */}
        <div className="lg:col-span-2 glass-strong rounded-2xl p-6">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Order summary</div>
          <div className="mt-2 text-3xl font-display font-bold">${(pkg.size / 1000).toFixed(0)}K {pkg.model}</div>
          <div className="text-muted-foreground text-sm">Funded evaluation challenge</div>
          <div className="mt-6 space-y-2 text-sm">
            {[["Profit target", `${pkg.profitTarget}%`], ["Daily DD", `${pkg.dailyDD}%`], ["Max DD", `${pkg.maxDD}%`], ["Profit split", `${pkg.split}%`]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="num font-semibold">{v}</span></div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
            <div className="text-muted-foreground">Total due</div>
            <div className="text-3xl font-display font-bold num text-gradient">${pkg.fee}</div>
          </div>
        </div>

        {/* Payment */}
        <div className="lg:col-span-3 glass rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="font-display font-semibold text-lg">Pay with crypto</h2>
            <p className="text-sm text-muted-foreground">Send exact amount and submit proof below.</p>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Select asset</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CRYPTO_ADDRESSES) as (keyof typeof CRYPTO_ADDRESSES)[]).map((a) => (
                <button key={a} onClick={() => setAsset(a)} className={`px-3 py-2 rounded-lg text-xs font-semibold ${asset === a ? "gradient-cyan-violet text-background" : "glass text-muted-foreground"}`}>
                  {a.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="text-xs text-muted-foreground">Deposit address</div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 text-xs font-mono break-all">{CRYPTO_ADDRESSES[asset]}</code>
              <button onClick={copy} className="p-2 rounded-md glass hover:bg-white/10">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-3 text-sm">
              Send exactly <span className="text-cyan font-bold num">${pkg.fee}</span> equivalent.
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Transaction Hash (TXID)</label>
            <input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="0x... or T..." className="mt-1 w-full glass rounded-lg px-3 py-2.5 text-sm bg-transparent outline-none font-mono" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Or upload screenshot</label>
            <label className="mt-1 block glass rounded-lg p-6 border-dashed border-white/10 text-center cursor-pointer hover:border-cyan/40">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-sm mt-2">{screenshot ? "Screenshot uploaded ✓" : "Click to upload"}</div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>

          <button onClick={submit} className="w-full py-3 rounded-xl gradient-cyan-violet text-background font-semibold glow-cyan">
            Submit payment for verification
          </button>
        </div>
      </div>
    </div>
  );
}
