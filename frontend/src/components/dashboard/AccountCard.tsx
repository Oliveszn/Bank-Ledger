import { format } from "date-fns";
import { cn } from "../../lib/utils";
import type { Account } from "@/types/accounts";

interface AccountCardProps {
  account: Account;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NGN: "₦",
  GHS: "₵",
};

function formatBalance(balance: string, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  const num = parseFloat(balance || "0");
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AccountCard({ account }: AccountCardProps) {
  const balance = parseFloat(account.balance || "0");
  const isNegative = balance < 0;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-sm",
        !account.is_active && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{account.name}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {account.currency}
          </p>
        </div>
        {!account.is_active && (
          <span className="shrink-0 text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
            inactive
          </span>
        )}
      </div>

      <div>
        <p
          className={cn(
            "text-2xl font-semibold tracking-tight",
            isNegative && "text-destructive",
          )}
        >
          {formatBalance(account.balance, account.currency)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Since {format(new Date(account.created_at), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}
