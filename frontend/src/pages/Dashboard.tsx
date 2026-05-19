import { useState } from "react";
import { useAccounts, useCreateAccount } from "@/hooks/useAccounts";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryBar } from "@/components/dashboard/SummaryBar";
import { AccountList } from "@/components/dashboard/AccountList";
import { CreateAccountModal } from "@/components/dashboard/CreateAccountModal";

export function DashboardPage() {
  const [open, setOpen] = useState(false);

  const { data: accounts = [], isLoading, error } = useAccounts();

  const {
    mutateAsync: createAccount,
    isPending: creating,
    error: createError,
  } = useCreateAccount();

  return (
    <AppShell>
      <div className="space-y-8">
        <SummaryBar
          accounts={accounts}
          loading={isLoading}
          onCreateAccount={() => setOpen(true)}
        />

        <AccountList
          accounts={accounts}
          loading={isLoading}
          error={error instanceof Error ? error.message : null}
        />
      </div>

      <CreateAccountModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (values) => {
          try {
            await createAccount(values);
            return true;
          } catch {
            return false;
          }
        }}
        loading={creating}
        error={createError instanceof Error ? createError.message : null}
      />
    </AppShell>
  );
}
