import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowDown } from "lucide-react";
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
import { transferSchema } from "@/lib/transactionSchema";

type FormValues = z.infer<typeof transferSchema>;

interface TransferFormProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onSubmit: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
  ) => Promise<boolean>;
}

export function TransferForm({
  accounts,
  loading,
  error,
  onSubmit,
}: TransferFormProps) {
  const activeAccounts = accounts.filter((a) => a.is_active);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(transferSchema),
  });

  const fromAccountId = useWatch({ control, name: "from_account_id" });
  const fromAccount = activeAccounts.find((a) => a.id === fromAccountId);

  const handleFormSubmit = async (values: FormValues) => {
    const success = await onSubmit(
      values.from_account_id,
      values.to_account_id,
      parseFloat(values.amount),
      values.description || undefined,
    );
    if (success) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* From */}
      <div className="space-y-1.5">
        <Label>From</Label>
        <Controller
          name="from_account_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Source account" />
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
        {errors.from_account_id && (
          <p className="text-xs text-destructive">
            {errors.from_account_id.message}
          </p>
        )}
        {fromAccount && (
          <p className="text-xs text-muted-foreground font-mono">
            Available:{" "}
            <span className="text-foreground">
              {fromAccount.currency}{" "}
              {parseFloat(fromAccount.balance).toFixed(2)}
            </span>
          </p>
        )}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-full p-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* To */}
      <div className="space-y-1.5">
        <Label>To</Label>
        <Controller
          name="to_account_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Destination account" />
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
        {errors.to_account_id && (
          <p className="text-xs text-destructive">
            {errors.to_account_id.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="transfer-amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="transfer-amount"
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

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="transfer-desc">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="transfer-desc"
          placeholder="e.g. Monthly savings transfer"
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
          "Transfer funds"
        )}
      </Button>
    </form>
  );
}
