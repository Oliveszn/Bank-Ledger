import { AccountCard } from "./AccountCard";
import { Skeleton } from "../ui/skeleton";
import { Wallet } from "lucide-react";
import type { Account } from "@/types/accounts";

interface AccountListProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

function AccountListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-5 space-y-4"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AccountList({ accounts, loading, error }: AccountListProps) {
  if (loading) return <AccountListSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-10 text-center">
        <Wallet className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">No accounts yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first account to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}
