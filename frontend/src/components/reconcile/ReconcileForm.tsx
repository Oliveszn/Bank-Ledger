import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckSquare } from "lucide-react";
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
import type { Account } from "@/types/accounts";

const reconcileSchema = z.object({
  account_id: z.string().min(1, "Select an account"),
  expected_balance: z
    .string()
    .min(1, "Expected balance is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
      message: "Balance must be 0 or greater",
    }),
});

type FormValues = z.infer<typeof reconcileSchema>;

interface ReconcileFormProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onSubmit: (accountId: string, expectedBalance: number) => Promise<void>;
}

export function ReconcileForm({
  accounts,
  loading,
  error,
  onSubmit,
}: ReconcileFormProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(reconcileSchema),
  });

  const selectedAccountId = watch("account_id");
  const selectedAccount = activeAccounts.find(
    (a) => a.id === selectedAccountId,
  );

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values.account_id, parseFloat(values.expected_balance));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Account */}
      <div className="space-y-1.5">
        <Label>Account to reconcile</Label>
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
                    {a.name}
                    <span className="text-muted-foreground ml-2 font-mono text-xs">
                      {a.currency}
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
      </div>

      {/* Stored balance info */}
      {selectedAccount && (
        <div className="rounded-lg bg-muted px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground">Stored balance</p>
          <p className="text-sm font-mono font-semibold">
            {selectedAccount.currency}{" "}
            {parseFloat(selectedAccount.balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            This is what the system has on record. The reconciliation will
            compare your expected value against the sum of all ledger entries.
          </p>
        </div>
      )}

      {/* Expected balance */}
      <div className="space-y-1.5">
        <Label htmlFor="expected-balance">Your expected balance</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {selectedAccount?.currency ?? "$"}
          </span>
          <Input
            id="expected-balance"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.0000"
            className="pl-10 font-mono"
            {...register("expected_balance")}
          />
        </div>
        {errors.expected_balance && (
          <p className="text-xs text-destructive">
            {errors.expected_balance.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter what you believe the balance should be. We'll calculate it from
          entries and tell you if they match.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconciling…
          </>
        ) : (
          <>
            <CheckSquare className="h-4 w-4" />
            Run reconciliation
          </>
        )}
      </Button>
    </form>
  );
}
