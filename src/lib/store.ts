import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PACKAGES } from "./mock-data";

export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: number;
  referralCode: string;
  referredBy?: string;
};

export type TradingAccount = {
  id: string;
  userId: string;
  packageId: string;
  size: number;
  balance: number;
  equity: number;
  phase: "phase1" | "phase2" | "funded" | "welcome";
  status: "active" | "passed" | "failed" | "suspended";
  startedAt: number;
  highWater: number;
  startBalance: number;
  serverLogin?: string;
  serverPassword?: string;
  server?: string;
  tradingDays: number;
};

export type Trade = {
  id: string;
  accountId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  lots: number;
  openPrice: number;
  closePrice?: number;
  sl?: number;
  tp?: number;
  openTime: number;
  closeTime?: number;
  pnl: number;
  status: "open" | "closed" | "pending";
  comment?: string;
};

export type DepositRequest = {
  id: string;
  userId: string;
  packageId?: string;
  amount: number;
  asset: string;
  txid?: string;
  screenshot?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

export type WithdrawalRequest = {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  asset: string;
  address: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
};

export type Notification = {
  id: string;
  userId: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
};

type State = {
  users: User[];
  currentUserId: string | null;
  accounts: TradingAccount[];
  trades: Trade[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
  notifications: Notification[];
  referrals: { referrerId: string; referredId: string; reward: number; createdAt: number }[];

  signup: (email: string, password: string, name: string, refCode?: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  currentUser: () => User | null;

  createDeposit: (d: Omit<DepositRequest, "id" | "createdAt" | "status">) => string;
  approveDeposit: (id: string) => void;
  rejectDeposit: (id: string) => void;

  createWithdrawal: (w: Omit<WithdrawalRequest, "id" | "createdAt" | "status">) => string;
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;

  openTrade: (t: Omit<Trade, "id" | "openTime" | "pnl" | "status">) => void;
  closeTrade: (id: string, closePrice: number) => void;
  updateOpenPnL: (priceMap: Record<string, number>) => void;

  notify: (n: Omit<Notification, "id" | "createdAt" | "read" | "userId"> & { userId?: string }) => void;
  markAllRead: () => void;

  promotePhase: (accountId: string) => void;
  failAccount: (accountId: string, reason: string) => void;

  adjustBalance: (accountId: string, delta: number, note: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      accounts: [],
      trades: [],
      deposits: [],
      withdrawals: [],
      notifications: [],
      referrals: [],

      currentUser: () => get().users.find((u) => u.id === get().currentUserId) ?? null,

      signup: (email, password, name, refCode) => {
        const exists = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { ok: false, error: "Email already registered" };
        const id = uid();
        const referralCode = "REF-" + id.toUpperCase().slice(0, 6);
        const referrer = refCode ? get().users.find((u) => u.referralCode === refCode) : undefined;
        const user: User = { id, email, password, name, createdAt: Date.now(), referralCode, referredBy: referrer?.id };

        // Welcome $100 bonus account
        const welcome: TradingAccount = {
          id: uid(),
          userId: id,
          packageId: "welcome",
          size: 100,
          balance: 100,
          equity: 100,
          startBalance: 100,
          highWater: 100,
          phase: "welcome",
          status: "active",
          startedAt: Date.now(),
          tradingDays: 0,
          serverLogin: "10" + Math.floor(100000 + Math.random() * 899999),
          serverPassword: "Lv-" + uid(),
          server: "LovableFX-Demo",
        };

        set((s) => ({
          users: [...s.users, user],
          currentUserId: id,
          accounts: [...s.accounts, welcome],
          notifications: [
            {
              id: uid(),
              userId: id,
              type: "success",
              title: "Welcome to Apex Funded 🎉",
              message: "Your $100 welcome bonus account is live. Start trading the demo terminal.",
              read: false,
              createdAt: Date.now(),
            },
            ...s.notifications,
          ],
          referrals: referrer
            ? [...s.referrals, { referrerId: referrer.id, referredId: id, reward: 10, createdAt: Date.now() }]
            : s.referrals,
        }));
        return { ok: true };
      },

      login: (email, password) => {
        const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) return { ok: false, error: "Invalid credentials" };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

      createDeposit: (d) => {
        const id = uid();
        set((s) => ({
          deposits: [{ ...d, id, status: "pending", createdAt: Date.now() }, ...s.deposits],
        }));
        get().notify({ type: "info", title: "Payment submitted", message: "Awaiting admin verification." });
        return id;
      },

      approveDeposit: (id) => {
        const dep = get().deposits.find((d) => d.id === id);
        if (!dep) return;
        const pkg = PACKAGES.find((p) => p.id === dep.packageId);
        if (pkg) {
          const acc: TradingAccount = {
            id: uid(),
            userId: dep.userId,
            packageId: pkg.id,
            size: pkg.size,
            balance: pkg.size,
            equity: pkg.size,
            startBalance: pkg.size,
            highWater: pkg.size,
            phase: pkg.model === "Instant" ? "funded" : "phase1",
            status: "active",
            startedAt: Date.now(),
            tradingDays: 0,
            serverLogin: "10" + Math.floor(100000 + Math.random() * 899999),
            serverPassword: "Lv-" + uid(),
            server: "ApexFunded-Live",
          };
          set((s) => ({ accounts: [...s.accounts, acc] }));
        }
        set((s) => ({ deposits: s.deposits.map((d) => (d.id === id ? { ...d, status: "approved" } : d)) }));
        get().notify({
          userId: dep.userId,
          type: "success",
          title: "Payment approved",
          message: "Your funded account credentials have been issued. Check Accounts.",
        });
      },

      rejectDeposit: (id) => {
        const dep = get().deposits.find((d) => d.id === id);
        set((s) => ({ deposits: s.deposits.map((d) => (d.id === id ? { ...d, status: "rejected" } : d)) }));
        if (dep) get().notify({ userId: dep.userId, type: "error", title: "Payment rejected", message: "Please contact support." });
      },

      createWithdrawal: (w) => {
        const id = uid();
        set((s) => ({ withdrawals: [{ ...w, id, status: "pending", createdAt: Date.now() }, ...s.withdrawals] }));
        get().notify({ type: "info", title: "Withdrawal requested", message: `$${w.amount} pending review.` });
        return id;
      },

      approveWithdrawal: (id) => {
        const w = get().withdrawals.find((x) => x.id === id);
        set((s) => ({ withdrawals: s.withdrawals.map((x) => (x.id === id ? { ...x, status: "approved" } : x)) }));
        if (w) get().notify({ userId: w.userId, type: "success", title: "Withdrawal approved", message: `$${w.amount} on the way.` });
      },
      rejectWithdrawal: (id) => {
        const w = get().withdrawals.find((x) => x.id === id);
        set((s) => ({ withdrawals: s.withdrawals.map((x) => (x.id === id ? { ...x, status: "rejected" } : x)) }));
        if (w) get().notify({ userId: w.userId, type: "error", title: "Withdrawal rejected", message: "Contact support." });
      },

      openTrade: (t) => {
        const id = uid();
        set((s) => ({
          trades: [{ ...t, id, openTime: Date.now(), pnl: 0, status: t.type === "market" ? "open" : "pending" }, ...s.trades],
        }));
      },

      closeTrade: (id, closePrice) => {
        const tr = get().trades.find((x) => x.id === id);
        if (!tr || tr.status !== "open") return;
        const pnl = computePnL(tr, closePrice);
        set((s) => ({
          trades: s.trades.map((x) =>
            x.id === id ? { ...x, status: "closed", closePrice, closeTime: Date.now(), pnl } : x
          ),
          accounts: s.accounts.map((a) =>
            a.id === tr.accountId
              ? { ...a, balance: a.balance + pnl, equity: a.equity + pnl, highWater: Math.max(a.highWater, a.balance + pnl) }
              : a
          ),
        }));
      },

      updateOpenPnL: (priceMap) => {
        const trades = get().trades;
        const accounts = get().accounts;
        const accDelta: Record<string, number> = {};
        const newTrades = trades.map((t) => {
          if (t.status !== "open") return t;
          const p = priceMap[t.symbol];
          if (!p) return t;
          const pnl = computePnL(t, p);
          accDelta[t.accountId] = (accDelta[t.accountId] ?? 0) + pnl;
          return { ...t, pnl };
        });
        const newAccounts = accounts.map((a) => ({ ...a, equity: a.balance + (accDelta[a.id] ?? 0) }));
        set({ trades: newTrades, accounts: newAccounts });
      },

      notify: (n) => {
        const uidLocal = uid();
        const userId = n.userId ?? get().currentUserId ?? "all";
        set((s) => ({
          notifications: [
            { id: uidLocal, userId, type: n.type, title: n.title, message: n.message, read: false, createdAt: Date.now() },
            ...s.notifications,
          ],
        }));
      },

      markAllRead: () => {
        const uId = get().currentUserId;
        set((s) => ({ notifications: s.notifications.map((n) => (n.userId === uId ? { ...n, read: true } : n)) }));
      },

      promotePhase: (accountId) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === accountId
              ? { ...a, phase: a.phase === "phase1" ? "phase2" : "funded", balance: a.size, equity: a.size, startBalance: a.size, highWater: a.size }
              : a
          ),
        })),

      failAccount: (accountId, reason) => {
        set((s) => ({ accounts: s.accounts.map((a) => (a.id === accountId ? { ...a, status: "failed" } : a)) }));
        get().notify({ type: "error", title: "Account failed", message: reason });
      },

      adjustBalance: (accountId, delta, note) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === accountId ? { ...a, balance: a.balance + delta, equity: a.equity + delta } : a
          ),
          notifications: [
            { id: uid(), userId: s.accounts.find((a) => a.id === accountId)?.userId ?? "all", type: "info", title: "Balance adjusted", message: `${delta >= 0 ? "+" : ""}$${delta.toFixed(2)} • ${note}`, read: false, createdAt: Date.now() },
            ...s.notifications,
          ],
        })),
    }),
    { name: "apex-funded-store" }
  )
);

export function computePnL(t: { side: "buy" | "sell"; openPrice: number; lots: number; symbol: string }, price: number) {
  const diff = t.side === "buy" ? price - t.openPrice : t.openPrice - price;
  // Simplified: contract size 100k for forex, 1 for crypto/metal/index — approximate
  const contract = t.symbol.endsWith("USD") && t.symbol.length === 6 ? 100000 : t.symbol.includes("JPY") ? 1000 : 1;
  return diff * t.lots * contract / (t.symbol.includes("JPY") ? 100 : 1);
}
