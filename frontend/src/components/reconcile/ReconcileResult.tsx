import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { ReconcileResult } from "../../types/entry";
import { cn } from "../../lib/utils";
import type { Account } from "@/types/accounts";

interface ReconcileResultProps {
  result: ReconcileResult;
  accounts: Account[];
}

function StatRow({
  label,
  value,
  mono = true,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "success" | "error";
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          mono && "font-mono",
          highlight === "success" && "text-emerald-600",
          highlight === "error" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ReconcileResultCard({
  result,
  accounts,
}: ReconcileResultProps) {
  const account = accounts.find((a) => a.id === result.account_id);
  const discrepancy = parseFloat(result.discrepancy);
  const absDiscrepancy = Math.abs(discrepancy);
  const isOver = discrepancy > 0; // expected > calculated

  return (
    <div
      className={cn(
        "rounded-xl border p-5 space-y-5 animate-fade-in",
        result.reconciled
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-destructive/30 bg-destructive/5",
      )}
    >
      {/* Status banner */}
      <div className="flex items-center gap-3">
        {result.reconciled ? (
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 text-destructive shrink-0" />
        )}
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              result.reconciled ? "text-emerald-700" : "text-destructive",
            )}
          >
            {result.reconciled
              ? "Balanced — books check out"
              : "Discrepancy found"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {account?.name ?? "Account"} · {account?.currency ?? ""}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-card rounded-lg border border-border px-4">
        <StatRow
          label="Your expected balance"
          value={parseFloat(result.expected_balance).toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
        />
        <StatRow
          label="Calculated from entries"
          value={parseFloat(result.calculated_balance).toLocaleString("en-US", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
          })}
          highlight={result.reconciled ? "success" : undefined}
        />
        <StatRow
          label="Discrepancy"
          value={
            result.reconciled
              ? "0.0000"
              : `${isOver ? "+" : "-"}${absDiscrepancy.toLocaleString("en-US", {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4,
                })}`
          }
          highlight={result.reconciled ? "success" : "error"}
        />
      </div>

      {/* Explanation when unbalanced */}
      {!result.reconciled && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-700">
              What this means
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {isOver
                ? `Your expected balance is ${absDiscrepancy.toFixed(4)} higher than what the ledger entries sum to. There may be a missing credit entry or an extra debit.`
                : `The ledger entries sum to ${absDiscrepancy.toFixed(4)} more than your expected balance. There may be an extra credit entry or a missing debit.`}
            </p>
          </div>
        </div>
      )}

      {/* Account ID */}
      <p className="text-xs font-mono text-muted-foreground break-all">
        Account ID: {result.account_id}
      </p>
    </div>
  );
}
