import { motion } from "framer-motion";

export function AnimatedBg({ variant = "default" }: { variant?: "default" | "minimal" }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.18] anim-grid-pan"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--cyan) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--cyan) 22%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />
      {/* Orbs */}
      <motion.div
        className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--cyan) 55%, transparent), transparent 70%)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-[520px] w-[520px] rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--violet) 50%, transparent), transparent 70%)" }}
        animate={{ x: [0, -80, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 bottom-0 h-[360px] w-[360px] rounded-full"
        style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--cyan) 40%, transparent), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {variant === "default" && (
        <>
          {/* Floating 3D-ish geometry */}
          <div className="absolute left-[10%] top-[18%] anim-float-slow">
            <div
              className="h-20 w-20 rounded-2xl border border-white/15"
              style={{
                background: "linear-gradient(135deg, color-mix(in oklab, var(--cyan) 30%, transparent), color-mix(in oklab, var(--violet) 30%, transparent))",
                transform: "perspective(600px) rotateX(45deg) rotateY(25deg)",
                boxShadow: "0 30px 60px -20px color-mix(in oklab, var(--cyan) 50%, transparent)",
              }}
            />
          </div>
          <div className="absolute right-[12%] top-[55%] anim-float-med">
            <div
              className="h-28 w-28 rounded-full border border-white/10"
              style={{
                background: "conic-gradient(from 0deg, var(--cyan), var(--violet), var(--cyan))",
                filter: "blur(0.5px)",
                boxShadow: "0 40px 80px -30px color-mix(in oklab, var(--violet) 60%, transparent)",
              }}
            />
          </div>
          <div className="absolute left-[55%] top-[12%] anim-float-slow" style={{ animationDelay: "-4s" }}>
            <div
              className="h-12 w-12 rotate-45 border border-white/20"
              style={{
                background: "linear-gradient(135deg, color-mix(in oklab, var(--cyan) 50%, transparent), transparent)",
              }}
            />
          </div>

          {/* Particles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/60"
              style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] }}
              transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </>
      )}
    </div>
  );
}
