import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const userId = useStore((s) => s.currentUserId);
  const navigate = useNavigate();
  useEffect(() => {
    if (!userId) navigate({ to: "/auth", replace: true });
  }, [userId, navigate]);
  if (!userId) return null;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
