import { useLogout } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function DashboardPage() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending: loading } = useLogout();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-mono font-medium">
              L
            </span>
          </div>
          <span className="text-sm font-mono font-medium tracking-widest uppercase text-muted-foreground">
            Ledger
          </span>
        </div>
        <h1 className="text-xl font-semibold">You're in, {user?.email}</h1>
        <p className="text-sm text-muted-foreground">Dashboard coming soon.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          disabled={loading}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
