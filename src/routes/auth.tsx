import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User } from "lucide-react";
import { AnimatedBg } from "@/components/animated-bg";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Log in or Sign up — Apex Funded" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const navigate = useNavigate();
  const { signup, login } = useStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", ref: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      const r = signup(form.email, form.password, form.name || form.email.split("@")[0], form.ref);
      if (!r.ok) return toast.error(r.error);
      toast.success("Account created — $100 welcome bonus applied 🎉");
      navigate({ to: "/dashboard" });
    } else {
      const r = login(form.email, form.password);
      if (!r.ok) return toast.error(r.error);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBg />
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl gradient-cyan-violet flex items-center justify-center"><Sparkles className="h-5 w-5 text-background" /></div>
        <span className="font-display font-bold">Apex Funded</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-strong rounded-3xl p-8 relative">
        <div className="flex gap-1 p-1 glass rounded-xl mb-6">
          {(["signup", "login"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 text-sm rounded-lg transition-all ${mode === m ? "gradient-cyan-violet text-background font-semibold" : "text-muted-foreground"}`}>
              {m === "signup" ? "Sign up" : "Log in"}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-display font-bold">
          {mode === "signup" ? <>Start with <span className="text-gradient">$100 free</span></> : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signup" ? "Get a demo account instantly on sign up." : "Log in to your dashboard."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <Field icon={User} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          )}
          <Field icon={Mail} type="email" required placeholder="you@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={Lock} type="password" required placeholder="Password (min 6)" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          {mode === "signup" && (
            <Field icon={Sparkles} placeholder="Referral code (optional)" value={form.ref} onChange={(v) => setForm({ ...form, ref: v })} />
          )}
          <button type="submit" className="w-full py-3 rounded-xl gradient-cyan-violet text-background font-semibold glow-cyan">
            {mode === "signup" ? "Create account & claim $100" : "Log in"}
          </button>
        </form>

        <div className="mt-6 text-xs text-center text-muted-foreground">
          By continuing you agree to our Terms and Privacy policy.
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, ...p }: any) {
  return (
    <div className="flex items-center gap-2 glass rounded-xl px-3 py-3 focus-within:border-cyan/50">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        {...p}
        onChange={(e) => p.onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
}
