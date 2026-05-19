import { format } from "date-fns";
import type { Transaction } from "../../types/transaction";
import { cn } from "../../lib/utils";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, X } from "lucide-react";

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

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetail({
  transaction,
  onClose,
}: TransactionDetailProps) {
  const config = OP_CONFIG[transaction.operation_type];
  const Icon = config.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bg)}>
            <Icon className={cn("h-4 w-4", config.color)} />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {transaction.description || config.label}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {format(new Date(transaction.created_at), "MMM d, yyyy · HH:mm")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded border",
              config.badge,
            )}
          >
            {config.label}
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transaction ID */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
        <p className="text-xs font-mono text-foreground break-all">
          {transaction.id}
        </p>
      </div>

      {/* Entries */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Ledger entries
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted text-xs font-medium text-muted-foreground">
            <span className="col-span-1">Account</span>
            <span className="text-right">Debit</span>
            <span className="text-right">Credit</span>
            <span className="text-right">Time</span>
          </div>

          {transaction.entries.map((entry, i) => {
            const hasDebit = parseFloat(entry.debit) > 0;
            const hasCredit = parseFloat(entry.credit) > 0;
            return (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-4 gap-2 px-3 py-2.5 text-xs",
                  i % 2 === 0 ? "bg-card" : "bg-muted/30",
                )}
              >
                <span className="font-mono truncate text-muted-foreground col-span-1">
                  {entry.account_id.slice(0, 8)}…
                </span>
                <span
                  className={cn(
                    "text-right font-mono",
                    hasDebit
                      ? "text-rose-600 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {hasDebit ? parseFloat(entry.debit).toFixed(2) : "—"}
                </span>
                <span
                  className={cn(
                    "text-right font-mono",
                    hasCredit
                      ? "text-emerald-600 font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {hasCredit ? parseFloat(entry.credit).toFixed(2) : "—"}
                </span>
                <span className="text-right text-muted-foreground">
                  {format(new Date(entry.created_at), "HH:mm:ss")}
                </span>
              </div>
            );
          })}

          {/* Totals row */}
          <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted border-t border-border text-xs font-semibold">
            <span className="col-span-1 text-muted-foreground">Total</span>
            <span className="text-right text-rose-600 font-mono">
              {transaction.entries
                .reduce((s, e) => s + parseFloat(e.debit), 0)
                .toFixed(2)}
            </span>
            <span className="text-right text-emerald-600 font-mono">
              {transaction.entries
                .reduce((s, e) => s + parseFloat(e.credit), 0)
                .toFixed(2)}
            </span>
            <span />
          </div>
        </div>

        {/* Double-entry balance check */}
        {(() => {
          const totalDebit = transaction.entries.reduce(
            (s, e) => s + parseFloat(e.debit),
            0,
          );
          const totalCredit = transaction.entries.reduce(
            (s, e) => s + parseFloat(e.credit),
            0,
          );
          const balanced = Math.abs(totalDebit - totalCredit) < 0.0001;
          return (
            <p
              className={cn(
                "text-xs font-mono mt-2 text-right",
                balanced ? "text-emerald-600" : "text-destructive",
              )}
            >
              {balanced ? "✓ Balanced" : "✗ Unbalanced — contact support"}
            </p>
          );
        })()}
      </div>
    </div>
  );
}
