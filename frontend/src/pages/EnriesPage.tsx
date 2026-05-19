import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { EntryFilters } from "../components/entries/EntryFilters";
import { EntryTable } from "../components/entries/EntryTable";
import { useAccounts } from "../hooks/useAccounts";
import { useEntries } from "../hooks/useEntries";

export function EntriesPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const [page, setPage] = useState(1);
  const { data: accounts = [], isPending: accountsLoading } = useAccounts();

  const {
    data: entries = [],
    isPending: loading,
    error,
  } = useEntries(selectedAccountId, page);
  const hasMore = entries.length === 20;
  const handleAccountChange = (id: string | null) => {
    setSelectedAccountId(id);
    setPage(1);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Entries</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Full ledger entry history with running balance per account.
        </p>
      </div>

      <div className="space-y-5">
        <EntryFilters
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
          page={page}
          hasMore={hasMore}
          onPageChange={setPage}
          loading={loading || accountsLoading}
        />

        <EntryTable
          entries={entries}
          loading={loading}
          error={error?.message}
          hasAccount={!!selectedAccountId}
        />
      </div>
    </AppShell>
  );
}
