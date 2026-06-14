import { useShallow } from "zustand/react/shallow";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Apex Funded" }] }),
  component: Notifications,
});

function Notifications() {
  const userId = useStore((s) => s.currentUserId);
  const list = useStore((s) => s.notifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt - a.createdAt));
  const markAll = useStore((s) => s.markAllRead);

  const iconFor = (t: string) => t === "success" ? CheckCircle2 : t === "warning" ? AlertTriangle : t === "error" ? XCircle : Info;
  const colorFor = (t: string) => t === "success" ? "text-success" : t === "warning" ? "text-warning" : t === "error" ? "text-destructive" : "text-cyan";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">{list.filter((n) => !n.read).length} unread</p>
        </div>
        <button onClick={markAll} className="text-sm glass px-4 py-2 rounded-lg inline-flex items-center gap-2"><Check className="h-4 w-4" /> Mark all read</button>
      </div>

      <div className="space-y-2">
        {list.map((n) => {
          const I = iconFor(n.type);
          return (
            <div key={n.id} className={`glass rounded-2xl p-4 flex gap-4 ${!n.read ? "border-cyan/30" : ""}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-white/5 ${colorFor(n.type)}`}>
                <I className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{n.title}</div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-cyan" />}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{n.message}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto opacity-30" />
            <div className="mt-3 text-sm">No notifications</div>
          </div>
        )}
      </div>
    </div>
  );
}
