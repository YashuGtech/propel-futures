import { useShallow } from "zustand/react/shallow";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  LineChart,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  BarChart3,
  Bell,
  Shield,
  LogOut,
  Search,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { AnimatedBg } from "./animated-bg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/challenges", label: "Marketplace", icon: ShoppingBag },
  { to: "/accounts", label: "My Accounts", icon: Wallet },
  { to: "/terminal", label: "Trading Terminal", icon: LineChart },
  { to: "/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useStore(useShallow((s) => s.currentUser()));
  const logout = useStore((s) => s.logout);
  const notifs = useStore(useShallow((s) =>
    s.notifications.filter((n) => n.userId === s.currentUserId && !n.read)
  ));

  return (
    <div className="min-h-screen text-foreground">
      <AnimatedBg />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 glass-strong border-r">
          <div className="p-5 border-b border-white/5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="relative h-9 w-9 rounded-xl gradient-cyan-violet glow-cyan flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <div>
                <div className="font-display text-lg font-bold leading-none">Apex Funded</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Pro Trader</div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-gradient-to-r from-primary/20 to-accent/15 text-foreground border border-white/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-cyan" : ""}`} />
                  <span className="flex-1">{label}</span>
                  {to === "/notifications" && notifs.length > 0 && (
                    <Badge className="h-5 px-1.5 bg-destructive text-destructive-foreground">{notifs.length}</Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/5">
            <div className="glass rounded-lg p-3 flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="gradient-cyan-violet text-background font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.name ?? "Trader"}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => { logout(); router.navigate({ to: "/auth" }); }}
                className="p-2 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-20 glass-strong border-b border-white/5">
            <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
              <div className="lg:hidden flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-cyan-violet flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-background" />
                </div>
                <span className="font-display font-bold">Apex</span>
              </div>
              <div className="flex-1 max-w-md hidden md:flex items-center gap-2 glass rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search instruments, accounts…"
                  className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
                />
                <kbd className="text-[10px] text-muted-foreground border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
              </div>
              <div className="flex-1 lg:hidden" />
              <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/5">
                <Bell className="h-5 w-5" />
                {notifs.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive anim-pulse-glow" />}
              </Link>
              <Link
                to="/challenges"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-cyan-violet text-background text-sm font-semibold hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Get Funded
              </Link>
            </div>
            {/* Live ticker */}
            <Ticker />
          </header>

          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-4 lg:p-8"
          >
            {children}
          </motion.main>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-t border-white/10 flex justify-around p-2">
            {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link key={to} to={to} className={`flex flex-col items-center gap-1 px-2 py-1 ${active ? "text-cyan" : "text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px]">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

function Ticker() {
  const items = [
    { s: "BTCUSD", p: "67,234.50", c: "+1.24%" },
    { s: "ETHUSD", p: "3,542.10", c: "+2.18%" },
    { s: "EURUSD", p: "1.08650", c: "-0.12%" },
    { s: "GBPUSD", p: "1.27340", c: "+0.34%" },
    { s: "XAUUSD", p: "2,342.10", c: "+0.78%" },
    { s: "NAS100", p: "17,234.5", c: "+1.05%" },
    { s: "USDJPY", p: "151.420", c: "-0.21%" },
    { s: "SOLUSD", p: "178.90", c: "+3.42%" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="border-t border-white/5 overflow-hidden">
      <div className="flex anim-ticker whitespace-nowrap py-2">
        {doubled.map((it, i) => {
          const up = it.c.startsWith("+");
          return (
            <div key={i} className="flex items-center gap-2 px-5 text-xs">
              <span className="font-mono font-semibold">{it.s}</span>
              <span className="num text-muted-foreground">{it.p}</span>
              <span className={`num font-semibold ${up ? "text-success" : "text-destructive"}`}>{it.c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "cyan" | "violet" | "success" | "warning" }) {
  const color = accent === "violet" ? "text-violet" : accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : "text-cyan";
  const glow = accent === "violet" ? "glow-violet" : accent === "success" ? "glow-success" : "glow-cyan";
  return (
    <div className={`glass rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 ${glow} bg-gradient-to-br from-primary to-accent`} />
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-display font-bold num ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
