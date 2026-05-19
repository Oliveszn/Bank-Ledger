import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ScrollText,
  CheckSquare,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useLogout } from "@/hooks/useAuth";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/entries", icon: ScrollText, label: "Entries" },
  { to: "/reconcile", icon: CheckSquare, label: "Reconcile" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { mutate: logout, isPending: loading } = useLogout();
  const { user } = useAuthStore();

  return (
    // <aside className="flex flex-col h-full w-56 border-r border-border bg-card px-3 py-5 shrink-0">
    <aside
      className={cn(
        "fixed md:static z-50 top-0 left-0 h-full w-56 border-r border-border bg-card px-3 py-5 flex flex-col transition-transform duration-200",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="md:hidden flex justify-end mb-4">
        <button onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground text-xs font-mono font-medium">
            L
          </span>
        </div>
        <span className="text-sm font-mono font-medium tracking-widest uppercase text-muted-foreground">
          Ledger
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <div className="px-2 mb-3">
          <p className="text-xs font-medium truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground font-mono">
            Authenticated
          </p>
        </div>
        <button
          onClick={() => logout()}
          disabled={loading}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-full disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
