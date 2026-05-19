import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { depositSchema } from "@/lib/transactionSchema";

type FormValues = z.infer<typeof depositSchema>;

interface DepositFormProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onSubmit: (
    accountId: string,
    amount: number,
    description?: string,
  ) => Promise<boolean>;
}

export function DepositForm({
  accounts,
  loading,
  error,
  onSubmit,
}: DepositFormProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(depositSchema),
  });

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
                    {a.name} — {a.currency}
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

      <div className="space-y-1.5">
        <Label htmlFor="deposit-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="deposit-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="pl-6"
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deposit-desc">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="deposit-desc"
          placeholder="e.g. Salary payment"
          {...register("description")}
        />
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
            Processing…
          </>
        ) : (
          "Deposit funds"
        )}
      </Button>
    </form>
  );
}
