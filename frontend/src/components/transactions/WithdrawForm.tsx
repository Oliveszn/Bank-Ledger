import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";
import type { Account } from "@/types/accounts";
import { withdrawSchema } from "@/lib/transactionSchema";

type FormValues = z.infer<typeof withdrawSchema>;

interface WithdrawFormProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onSubmit: (
    accountId: string,
    amount: number,
    description?: string,
  ) => Promise<boolean>;
}

export function WithdrawForm({
  accounts,
  loading,
  error,
  onSubmit,
}: WithdrawFormProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(withdrawSchema),
  });

  // Watch fields to show live balance warning
  const selectedAccountId = useWatch({ control, name: "account_id" });
  const amountStr = useWatch({ control, name: "amount" });

  const selectedAccount = activeAccounts.find(
    (a) => a.id === selectedAccountId,
  );
  const enteredAmount = parseFloat(amountStr) || 0;
  const availableBalance = parseFloat(selectedAccount?.balance ?? "0");
  const willOverdraft = selectedAccount && enteredAmount > availableBalance;

  const handleFormSubmit = async (values: FormValues) => {
    const success = await onSubmit(
      values.account_id,
      parseFloat(values.amount),
      values.description || undefined,
    );
    if (success) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Account</Label>
        <Controller
          name="account_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span>{a.name}</span>
                    <span className="text-muted-foreground ml-2 font-mono text-xs">
                      {a.currency} {parseFloat(a.balance).toFixed(2)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.account_id && (
          <p className="text-xs text-destructive">
            {errors.account_id.message}
          </p>
        )}
        {selectedAccount && (
          <p className="text-xs text-muted-foreground font-mono">
            Available:{" "}
            <span className="text-foreground">
              {selectedAccount.currency} {availableBalance.toFixed(2)}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="withdraw-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="withdraw-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={cn(
              "pl-6",
              willOverdraft &&
                "border-destructive focus-visible:ring-destructive",
            )}
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
        {willOverdraft && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Amount exceeds available balance
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="withdraw-desc">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="withdraw-desc"
          placeholder="e.g. Rent payment"
          {...register("description")}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !!willOverdraft}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          "Withdraw funds"
        )}
      </Button>
    </form>
  );
}
