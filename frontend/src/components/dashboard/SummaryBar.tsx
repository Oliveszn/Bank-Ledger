import type { Account } from "@/types/accounts";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface SummaryBarProps {
  accounts: Account[];
  loading: boolean;
  onCreateAccount: () => void;
}

function sumBalances(accounts: Account[]): string {
  const total = accounts
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);
  return total.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SummaryBar({
  accounts,
  loading,
  onCreateAccount,
}: SummaryBarProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
          Total balance
        </p>
        {loading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <p className="text-3xl font-semibold tracking-tight">
            ${sumBalances(accounts)}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
          Active accounts
        </p>
        {loading ? (
          <Skeleton className="h-7 w-8 ml-auto" />
        ) : (
          <p className="text-2xl font-semibold">{activeAccounts.length}</p>
        )}
      </div>

      <Button onClick={onCreateAccount}>
        <Plus className="h-4 w-4" />
        New Account
      </Button>
    </div>
  );
}
