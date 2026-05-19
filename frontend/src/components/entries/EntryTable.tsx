import { format } from "date-fns";
import type { Entry } from "../../types/entry";
import { EntryBadge, OperationBadge } from "./EntryBadge";
import { Skeleton } from "../ui/skeleton";
import { ScrollText } from "lucide-react";

interface EntryTableProps {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  hasAccount: boolean;
}

function EntryTableSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-5 gap-3 px-4 py-2.5 bg-muted text-xs font-medium text-muted-foreground border-b border-border">
        <span className="col-span-1">Date</span>
        <span className="col-span-1">Type</span>
        <span className="col-span-1">Description</span>
        <span className="text-right">Debit</span>
        <span className="text-right">Credit</span>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-3 px-4 py-3 border-b border-border last:border-0"
        >
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-5 w-16 ml-auto rounded" />
          <Skeleton className="h-5 w-16 ml-auto rounded" />
        </div>
      ))}
    </div>
  );
}

export function EntryTable({
  entries,
  loading,
  error,
  hasAccount,
}: EntryTableProps) {
  if (!hasAccount) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center">
        <ScrollText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">Select an account</p>
        <p className="text-xs text-muted-foreground mt-1">
          Choose an account above to view its ledger entries.
        </p>
      </div>
    );
  }

  if (loading) return <EntryTableSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center">
        <ScrollText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">No entries found</p>
        <p className="text-xs text-muted-foreground mt-1">
          This account has no ledger entries yet.
        </p>
      </div>
    );
  }

  // Running balance column — calculated from entries in display order
  let runningBalance = 0;
  const entriesWithBalance = entries.map((e) => {
    const credit = parseFloat(e.credit) || 0;
    const debit = parseFloat(e.debit) || 0;
    runningBalance += credit - debit;
    return { entry: e, runningBalance };
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-muted text-xs font-medium text-muted-foreground border-b border-border">
        <span className="col-span-1">Date & time</span>
        <span className="col-span-1">Type</span>
        <span className="col-span-2">Description</span>
        <span className="text-right">Debit / Credit</span>
        <span className="text-right">Running balance</span>
      </div>

      {/* Rows */}
      {entriesWithBalance.map(({ entry, runningBalance: balance }, i) => {
        const hasDebit = parseFloat(entry.debit) > 0;
        const isNegativeBalance = balance < 0;

        return (
          <div
            key={entry.id}
            className={
              i % 2 === 0
                ? "grid grid-cols-6 gap-2 px-4 py-3 border-b border-border last:border-0 bg-card"
                : "grid grid-cols-6 gap-2 px-4 py-3 border-b border-border last:border-0 bg-muted/20"
            }
          >
            {/* Date */}
            <div className="col-span-1">
              <p className="text-xs font-mono text-foreground">
                {format(new Date(entry.created_at), "MMM d, yyyy")}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {format(new Date(entry.created_at), "HH:mm:ss")}
              </p>
            </div>

            {/* Op type */}
            <div className="col-span-1 flex items-center">
              <OperationBadge type={entry.operation_type} />
            </div>

            {/* Description */}
            <div className="col-span-2 flex items-center">
              <p className="text-xs text-foreground truncate">
                {entry.description || "—"}
              </p>
            </div>

            {/* Debit / Credit badge */}
            <div className="flex items-center justify-end">
              <EntryBadge
                type={hasDebit ? "debit" : "credit"}
                amount={hasDebit ? entry.debit : entry.credit}
                operationType={entry.operation_type}
              />
            </div>

            {/* Running balance */}
            <div className="flex items-center justify-end">
              <span
                className={
                  isNegativeBalance
                    ? "text-xs font-mono font-medium text-destructive"
                    : "text-xs font-mono font-medium text-foreground"
                }
              >
                {isNegativeBalance ? "-" : ""}
                {Math.abs(balance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        );
      })}

      {/* Footer totals */}
      <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-muted border-t border-border text-xs font-semibold">
        <span className="col-span-4 text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
        <span className="text-right text-rose-600 font-mono">
          DR{" "}
          {entries
            .reduce((s, e) => s + (parseFloat(e.debit) || 0), 0)
            .toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </span>
        <span className="text-right text-emerald-600 font-mono">
          CR{" "}
          {entries
            .reduce((s, e) => s + (parseFloat(e.credit) || 0), 0)
            .toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        </span>
      </div>
    </div>
  );
}
