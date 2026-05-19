import { formatDistanceToNow } from "date-fns";
import type { Transaction } from "../../types/transaction";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import type { Account } from "@/types/accounts";

interface RecentTransactionsProps {
  accounts: Account[];
  loading: boolean;
}

const OP_CONFIG = {
  deposit: {
    icon: ArrowDownLeft,
    label: "Deposit",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  withdrawal: {
    icon: ArrowUpRight,
    label: "Withdrawal",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  transfer: {
    icon: ArrowLeftRight,
    label: "Transfer",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
} as const;

function getAmountFromEntries(tx: Transaction, accountId: string): string {
  const entry = tx.entries.find((e) => e.account_id === accountId);
  if (!entry) return "—";
  const amount = parseFloat(entry.credit) > 0 ? entry.credit : entry.debit;
  return parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isCredit(tx: Transaction, accountId: string): boolean {
  const entry = tx.entries.find((e) => e.account_id === accountId);
  return entry ? parseFloat(entry.credit) > 0 : false;
}

interface TransactionRowProps {
  tx: Transaction;
  accountId: string;
}

function TransactionRow({ tx, accountId }: TransactionRowProps) {
  const config = OP_CONFIG[tx.operation_type];
  const Icon = config.icon;
  const credit = isCredit(tx, accountId);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className={cn("p-1.5 rounded-md", config.bg)}>
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {tx.description || config.label}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
        </p>
      </div>
      <p
        className={cn(
          "text-sm font-mono font-medium shrink-0",
          credit ? "text-emerald-600" : "text-foreground",
        )}
      >
        {credit ? "+" : "-"}${getAmountFromEntries(tx, accountId)}
      </p>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="h-7 w-7 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

interface RecentTransactionsPropsWithData extends RecentTransactionsProps {
  transactionsByAccount: Record<string, Transaction[]>;
  txLoading: boolean;
}

export function RecentTransactions({
  loading,
  transactionsByAccount,
  txLoading,
}: RecentTransactionsPropsWithData) {
  // Flatten all transactions across accounts, deduplicate by tx id, sort by date
  const allTransactions = Object.entries(transactionsByAccount)
    .flatMap(([accountId, txs]) => txs.map((tx) => ({ tx, accountId })))
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.tx.id === item.tx.id),
    )
    .sort(
      (a, b) =>
        new Date(b.tx.created_at).getTime() -
        new Date(a.tx.created_at).getTime(),
    )
    .slice(0, 8);

  if (loading || txLoading) return <TransactionsSkeleton />;

  if (allTransactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No transactions yet. Make a deposit to get started.
      </p>
    );
  }

  return (
    <div>
      {allTransactions.map(({ tx, accountId }) => (
        <TransactionRow key={tx.id} tx={tx} accountId={accountId} />
      ))}
    </div>
  );
}
