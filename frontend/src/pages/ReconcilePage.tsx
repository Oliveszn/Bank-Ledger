import { AppShell } from "../components/layout/AppShell";
import { ReconcileForm } from "../components/reconcile/ReconcileForm";
import { ReconcileResultCard } from "../components/reconcile/ReconcileResult";
import { useAccounts } from "../hooks/useAccounts";
import { useReconcile } from "../hooks/useReconcile";
import { Button } from "../components/ui/button";
import { RotateCcw } from "lucide-react";

export function ReconcilePage() {
  const { data: accounts = [], isPending: accountsLoading } = useAccounts();

  const {
    mutate: reconcile,
    data: result,
    isPending: loading,
    error,
    reset,
  } = useReconcile();

  const handleSubmit = async (
    accountId: string,
    expectedBalance: number,
  ): Promise<void> => {
    await reconcile({ accountId, expectedBalance });
  };
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Reconcile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Verify that your expected balance matches the sum of all ledger
          entries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left — form */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold">Run a balance check</h2>
            <p className="text-xs text-muted-foreground mt-1">
              The system will sum all debit and credit entries for the selected
              account and compare against your expected figure.
            </p>
          </div>

          <ReconcileForm
            accounts={accounts}
            loading={loading || accountsLoading}
            error={error?.message}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right — result or explainer */}
        <div className="space-y-4">
          {result ? (
            <>
              <ReconcileResultCard result={result} accounts={accounts} />
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                className="w-full"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Run another check
              </Button>
            </>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold">
                How reconciliation works
              </h2>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Select an account",
                    desc: "Choose any active account you want to verify.",
                  },
                  {
                    step: "2",
                    title: "Enter your expected balance",
                    desc: "This is what you believe the account balance should be — from your own records or a bank statement.",
                  },
                  {
                    step: "3",
                    title: "We calculate from entries",
                    desc: "The system sums all credit and debit entries: SUM(credit) − SUM(debit) = calculated balance.",
                  },
                  {
                    step: "4",
                    title: "Result",
                    desc: "If your expected value matches the calculated value, the books balance. Any difference is shown with a clear explanation.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-medium flex items-center justify-center shrink-0 mt-0.5">
                      {step}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted px-3 py-2.5">
                <p className="text-xs font-mono text-muted-foreground">
                  calculated = SUM(credit) − SUM(debit)
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  reconciled = expected == calculated
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
