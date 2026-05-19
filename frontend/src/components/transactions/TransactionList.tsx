import { formatDistanceToNow } from "date-fns";
import type { Transaction } from "../../types/transaction";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ScrollText,
} from "lucide-react";
import type { Account } from "@/types/accounts";

const OP_CONFIG = {
  deposit: {
    icon: ArrowDownLeft,
    label: "Deposit",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  withdrawal: {
    icon: ArrowUpRight,
    label: "Withdrawal",
    color: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  transfer: {
    icon: ArrowLeftRight,
    label: "Transfer",
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
} as const;

function getPrimaryAmount(tx: Transaction): string {
  const amounts = tx.entries.map((e) => {
    const d = parseFloat(e.debit);
    const c = parseFloat(e.credit);
    return Math.max(d, c);
  });
  const max = Math.max(...amounts);
  return max.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getAccountName(accountId: string, accounts: Account[]): string {
  return (
    accounts.find((a) => a.id === accountId)?.name ??
    accountId.slice(0, 8) + "…"
  );
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-0 border border-border rounded-xl overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0"
        >
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (tx: Transaction) => void;
}

export function TransactionList({
  transactions,
  accounts,
  loading,
  selectedId,
  onSelect,
}: TransactionListProps) {
  if (loading) return <TransactionListSkeleton />;

  if (transactions.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-10 text-center">
        <ScrollText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">No transactions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Select an account and make your first deposit.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {transactions.map((tx) => {
        const config = OP_CONFIG[tx.operation_type];
        const Icon = config.icon;
        const primaryEntry = tx.entries[0];

        return (
          <button
            key={tx.id}
            onClick={() => onSelect(tx)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 text-left transition-colors hover:bg-muted/40",
              selectedId === tx.id && "bg-muted/60",
            )}
          >
            <div className={cn("p-1.5 rounded-lg shrink-0", config.bg)}>
              <Icon className={cn("h-3.5 w-3.5", config.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {tx.description || config.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium",
                    config.badge,
                  )}
                >
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {primaryEntry
                  ? getAccountName(primaryEntry.account_id, accounts)
                  : "—"}{" "}
                ·{" "}
                {formatDistanceToNow(new Date(tx.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <p className="text-sm font-mono font-medium shrink-0">
              ${getPrimaryAmount(tx)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
