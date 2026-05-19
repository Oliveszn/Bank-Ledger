import { cn } from "../../lib/utils";
import type { OperationType } from "../../types/transaction";

interface EntryBadgeProps {
  type: "debit" | "credit";
  amount: string;
  operationType?: OperationType;
}

const OP_LABELS: Record<OperationType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
};

export function EntryBadge({ type, amount }: EntryBadgeProps) {
  const isDebit = type === "debit";
  const value = parseFloat(amount);

  if (value === 0)
    return <span className="text-muted-foreground font-mono text-xs">—</span>;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs font-medium px-2 py-0.5 rounded border",
        isDebit
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200",
      )}
    >
      {isDebit ? "DR" : "CR"}{" "}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

export function OperationBadge({ type }: { type: OperationType }) {
  const colors: Record<OperationType, string> = {
    deposit: "bg-emerald-50 text-emerald-700 border-emerald-200",
    withdrawal: "bg-rose-50 text-rose-700 border-rose-200",
    transfer: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded border",
        colors[type],
      )}
    >
      {OP_LABELS[type]}
    </span>
  );
}
