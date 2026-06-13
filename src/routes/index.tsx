import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, ShieldCheck, Zap, DollarSign, BarChart3, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { AnimatedBg } from "@/components/animated-bg";
import { PACKAGES } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apex Funded — Get Funded up to $200K" },
      { name: "description", content: "Premium proprietary trading firm with 90% profit split, instant payouts, and a beautiful MT5-style terminal." },
      { property: "og:title", content: "Apex Funded — Premium Prop Trading" },
      { property: "og:description", content: "Trade our capital. Keep up to 90% of the profits." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBg />
      <Nav />
      <Hero />
      <Stats />
      <Marketplace />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-cyan-violet glow-cyan flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-background" />
          </div>
          <span className="font-display text-lg font-bold">Apex Funded</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#challenges" className="hover:text-foreground">Challenges</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="text-sm px-4 py-2 rounded-lg hover:bg-white/5">Log in</Link>
          <Link to="/auth" className="text-sm px-4 py-2 rounded-lg gradient-cyan-violet text-background font-semibold">Start now</Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mb-6">
          <span className="h-2 w-2 rounded-full bg-success anim-pulse-glow" />
          <span>Live now — Welcome bonus of $100 for every new trader</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] tracking-tight">
          Trade <span className="text-gradient">our capital.</span><br />Keep up to <span className="text-gradient">90%.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A premium proprietary trading firm built for serious traders. Pass our evaluation
          and trade accounts up to $200,000 with industry-leading payouts.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-cyan-violet text-background font-semibold glow-cyan">
            Get funded <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#challenges" className="px-6 py-3 rounded-xl glass text-sm font-semibold">View challenges</a>
        </div>
      </motion.div>

      {/* 3D card cluster */}
      <div className="relative mt-20 mx-auto max-w-5xl h-[400px] hidden md:block">
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 glass-strong rounded-3xl p-6 w-[640px] shadow-2xl"
          style={{ transform: "perspective(1200px) rotateX(12deg)" }}
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
        >
          <MockDashboard />
        </motion.div>
        <motion.div
          className="absolute left-[5%] top-32 glass rounded-2xl p-4 w-64"
          animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity }}
        >
          <div className="text-xs text-muted-foreground">Equity</div>
          <div className="text-2xl font-bold num text-success">+$12,432.18</div>
          <div className="mt-2 h-12 flex items-end gap-1">
            {[30, 45, 38, 60, 52, 70, 65, 85, 78, 92, 88, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-success/40 to-success" style={{ height: `${h}%` }} />
            ))}
          </div>
        </motion.div>
        <motion.div
          className="absolute right-[5%] top-40 glass rounded-2xl p-4 w-56"
          animate={{ y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity }}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-cyan-violet flex items-center justify-center"><DollarSign className="h-4 w-4 text-background" /></div>
            <div>
              <div className="text-xs text-muted-foreground">Payout</div>
              <div className="text-sm font-semibold">$8,432 sent</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approved in 2h</div>
        </motion.div>
      </div>
    </section>
  );
}

function MockDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted-foreground">Account #100482</div>
          <div className="font-display text-lg font-semibold">$100,000 Funded</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="num font-bold text-success">$108,432.18</div>
        </div>
      </div>
      <div className="h-32 relative rounded-xl bg-black/30 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.18 220)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="oklch(0.72 0.18 220)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,90 L40,80 L80,85 L120,60 L160,68 L200,40 L240,55 L280,30 L320,38 L360,18 L400,25 L400,120 L0,120 Z" fill="url(#g)" />
          <path d="M0,90 L40,80 L80,85 L120,60 L160,68 L200,40 L240,55 L280,30 L320,38 L360,18 L400,25" stroke="oklch(0.72 0.18 220)" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[["Profit Target", "8.4%"], ["Daily DD", "1.2%"], ["Max DD", "3.1%"]].map(([l, v]) => (
          <div key={l} className="glass rounded-lg p-2.5">
            <div className="text-[10px] text-muted-foreground">{l}</div>
            <div className="text-sm font-semibold num">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const items = [
    { v: "$42M+", l: "Paid to traders" },
    { v: "120K+", l: "Active traders" },
    { v: "90%", l: "Max profit split" },
    { v: "< 24h", l: "Payout time" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((s) => (
          <div key={s.l} className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-display font-bold text-gradient">{s.v}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Marketplace() {
  const featured = PACKAGES.filter((p) => p.model === "2-Step").slice(0, 5);
  return (
    <section id="challenges" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <div className="inline-block glass rounded-full px-3 py-1 text-xs text-muted-foreground mb-4">Funded Account Marketplace</div>
        <h2 className="text-4xl md:text-5xl font-display font-bold">Pick your <span className="text-gradient">challenge</span></h2>
        <p className="mt-3 text-muted-foreground">2-Step, 1-Step, and Instant Funding — compare and choose.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {featured.map((p) => (
          <motion.div key={p.id} whileHover={{ y: -6 }} className={`glass rounded-2xl p-5 relative ${p.popular ? "border-cyan/50 glow-cyan" : ""}`}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest gradient-cyan-violet text-background px-3 py-1 rounded-full font-bold">
                Popular
              </div>
            )}
            <div className="text-xs text-muted-foreground">{p.model}</div>
            <div className="text-3xl font-display font-bold num mt-1">${(p.size / 1000)}K</div>
            <div className="mt-4 space-y-1.5 text-xs">
              <Row k="Profit target" v={`${p.profitTarget}%`} />
              <Row k="Daily DD" v={`${p.dailyDD}%`} />
              <Row k="Max DD" v={`${p.maxDD}%`} />
              <Row k="Split" v={`${p.split}%`} />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">Fee</div>
                <div className="font-bold num">${p.fee}</div>
              </div>
              <Link to="/auth" className="text-xs font-semibold gradient-cyan-violet text-background px-3 py-2 rounded-lg">
                Start →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium num">{v}</span></div>;
}

function Features() {
  const items = [
    { i: TrendingUp, t: "MT5-style terminal", d: "Pro charts, indicators, market depth, one-click trading." },
    { i: ShieldCheck, t: "Transparent rules", d: "Clear daily / max drawdown. No hidden conditions." },
    { i: Zap, t: "Instant payouts", d: "Bi-weekly payouts via crypto. Under 24h." },
    { i: BarChart3, t: "Deep analytics", d: "Equity curve, win-rate, R/R, journal — built-in." },
    { i: Users, t: "Refer & earn", d: "Earn 10% commission on every referred trader's challenge." },
    { i: DollarSign, t: "Up to 90% split", d: "Industry-leading profit share on scaled accounts." },
  ];
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold">Everything a <span className="text-gradient">pro trader</span> needs</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ i: I, t, d }) => (
          <div key={t} className="glass rounded-2xl p-6 hover:border-cyan/30 transition-colors">
            <div className="h-11 w-11 rounded-xl gradient-cyan-violet flex items-center justify-center mb-4">
              <I className="h-5 w-5 text-background" />
            </div>
            <h3 className="font-display text-lg font-semibold">{t}</h3>
            <p className="text-sm text-muted-foreground mt-2">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Pick a challenge", d: "Choose your size & evaluation model." },
    { n: "02", t: "Pay in crypto", d: "Submit TXID or screenshot for approval." },
    { n: "03", t: "Pass the evaluation", d: "Hit profit target while respecting drawdowns." },
    { n: "04", t: "Get funded & paid", d: "Trade live capital. Keep up to 90%." },
  ];
  return (
    <section id="how" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold">Four steps to <span className="text-gradient">funded</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((s) => (
          <div key={s.n} className="glass rounded-2xl p-6">
            <div className="text-5xl font-display font-bold text-gradient">{s.n}</div>
            <div className="mt-4 font-semibold">{s.t}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--cyan) 30%, transparent), transparent 70%)" }} />
        <h2 className="text-4xl md:text-5xl font-display font-bold">Ready to <span className="text-gradient">get funded</span>?</h2>
        <p className="mt-4 text-muted-foreground">Sign up and claim your $100 welcome demo account instantly.</p>
        <Link to="/auth" className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-cyan-violet text-background font-semibold glow-cyan">
          Create free account <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-white/5 mt-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-cyan-violet flex items-center justify-center"><Sparkles className="h-4 w-4 text-background" /></div>
          <span>© 2026 Apex Funded. Simulated demo platform.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}
