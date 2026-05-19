import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import {
  OperationTabs,
  type OperationTab,
} from "../components/transactions/OperationTabs";
import { DepositForm } from "../components/transactions/DepositForm";
import { WithdrawForm } from "../components/transactions/WithdrawForm";
import { TransferForm } from "../components/transactions/TransferForm";
import { TransactionList } from "../components/transactions/TransactionList";
import { TransactionDetail } from "../components/transactions/TransactionDetail";
import { useAccounts } from "../hooks/useAccounts";
import {
  useDeposit,
  useTransactions,
  useTransfer,
  useWithdraw,
} from "../hooks/useTransactions";
import type { Transaction } from "../types/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";

export function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<OperationTab>("deposit");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [filterAccountId, setFilterAccountId] = useState<string | null>(null);

  const { data: accounts = [], isPending: accountsLoading } = useAccounts();
  const { data: transactions = [], isPending: txLoading } =
    useTransactions(filterAccountId);
  const { mutate: withdraw, isPending: withdrawLoading } = useWithdraw();
  const { mutate: transfer, isPending: transferLoading } = useTransfer();
  const { mutate: deposit, isPending: depositLoading } = useDeposit();

  const handleTabChange = (tab: OperationTab) => {
    setActiveTab(tab);
  };

  const handleDeposit = async (
    accountId: string,
    amount: number,
    description?: string,
  ): Promise<boolean> => {
    await deposit({
      account_id: accountId,
      amount,
      description,
    });

    return true;
  };

  const handleWithdraw = async (
    accountId: string,
    amount: number,
    description?: string,
  ): Promise<boolean> => {
    await withdraw({
      account_id: accountId,
      amount,
      description,
    });

    return true;
  };

  const handleTransfer = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description?: string,
  ): Promise<boolean> => {
    await transfer({
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount,
      description,
    });

    return true;
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Deposit, withdraw, or transfer funds between accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
            <OperationTabs active={activeTab} onChange={handleTabChange} />

            <div className="mt-5">
              {activeTab === "deposit" && (
                <DepositForm
                  accounts={accounts}
                  loading={depositLoading}
                  error={null}
                  onSubmit={handleDeposit}
                />
              )}
              {activeTab === "withdraw" && (
                <WithdrawForm
                  accounts={accounts}
                  loading={withdrawLoading}
                  error={null}
                  onSubmit={handleWithdraw}
                />
              )}
              {activeTab === "transfer" && (
                <TransferForm
                  accounts={accounts}
                  loading={transferLoading}
                  error={null}
                  onSubmit={handleTransfer}
                />
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {/* Account filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs space-y-1">
              <Label className="text-xs text-muted-foreground">
                Filter by account
              </Label>
              <Select
                value={filterAccountId ?? "all"}
                onValueChange={(v) =>
                  setFilterAccountId(v === "all" ? null : v)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All accounts</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTx && (
            <TransactionDetail
              transaction={selectedTx}
              onClose={() => setSelectedTx(null)}
            />
          )}

          <TransactionList
            transactions={transactions}
            accounts={accounts}
            loading={txLoading || accountsLoading}
            selectedId={selectedTx?.id ?? null}
            onSelect={(tx) =>
              setSelectedTx((prev) => (prev?.id === tx.id ? null : tx))
            }
          />
        </div>
      </div>
    </AppShell>
  );
}
