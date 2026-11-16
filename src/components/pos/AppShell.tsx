import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, ChefHat, ClipboardList, LayoutGrid, LogOut, Receipt, Settings, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePos } from "@/lib/pos/store";

const NAV = [
  { to: "/tables", label: "Tables", icon: LayoutGrid },
  { to: "/menu", label: "New Order", icon: UtensilsCrossed },
  { to: "/orders", label: "My Orders", icon: ClipboardList },
  { to: "/kitchen", label: "Kitchen Tickets", icon: ChefHat },
  { to: "/payments", label: "Open Bills", icon: Receipt },
] as const;
const MANAGER_NAV = [
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/team", label: "Settings & Team", icon: Settings },
] as const;

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);
  if (!now) return null;
  return (
    <div className="hidden text-right leading-tight md:block">
      <p className="text-sm font-semibold">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      <p className="text-xs text-muted-foreground">{now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, state } = usePos();
  const navigate = useNavigate();
  const queued = state.tickets.filter((t) => t.status === "queued").length;
  if (!user) return null;
  const items = user.role === "manager" ? [...NAV.map((n) => n.to === "/orders" ? { ...n, label: "All Orders" } : n), ...MANAGER_NAV] : NAV;
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="no-print flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-ink font-display text-lg text-ink-foreground">S</div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold">Sorin Hotel</p>
            <p className="text-[11px] text-muted-foreground">POS-01 · Demo</p>
          </div>
        </div>
        <div className="flex-1" />
        <Clock />
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="grid size-10 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {user.name.split(" ").map((p) => p[0]).join("")}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
          </div>
          <Button variant="outline" size="touch" onClick={() => { logout(); navigate({ to: "/" }); }} aria-label="Sign out or switch account">
            <LogOut /> <span className="hidden lg:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav aria-label="Main" className="no-print flex w-[88px] shrink-0 flex-col gap-1 bg-sidebar p-2 text-sidebar-foreground xl:w-52">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to as "/"}
              className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-center text-[11px] font-medium transition hover:bg-sidebar-accent xl:flex-row xl:justify-start xl:gap-3 xl:px-3 xl:text-sm"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-primary/50" }}>
              <Icon className="size-5" />{label}
              {to === "/kitchen" && queued > 0 && (
                <span className="absolute right-2 top-1.5 grid min-w-5 place-items-center rounded-full bg-status-occupied px-1 text-[11px] font-bold text-primary-foreground xl:static xl:ml-auto">{queued}</span>
              )}
            </Link>
          ))}
          <div className="mt-auto rounded-lg border border-sidebar-border p-2 text-center text-[10px] leading-snug text-sidebar-foreground/70 xl:text-left xl:text-[11px]">
            Prototype · demo data only
          </div>
        </nav>
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, crumb, children }: { title: string; crumb?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {crumb && <div className="mb-1 text-sm text-muted-foreground">{crumb}</div>}
        <h1 className="text-3xl font-semibold">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, children }: { icon: typeof LayoutGrid; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-input bg-card px-6 py-14 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-full bg-accent text-accent-foreground"><Icon className="size-7" /></div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-muted-foreground">{text}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
