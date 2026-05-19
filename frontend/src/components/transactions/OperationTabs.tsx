import { cn } from "../../lib/utils";

export type OperationTab = "deposit" | "withdraw" | "transfer";

const TABS: { id: OperationTab; label: string }[] = [
  { id: "deposit", label: "Deposit" },
  { id: "withdraw", label: "Withdraw" },
  { id: "transfer", label: "Transfer" },
];

interface OperationTabsProps {
  active: OperationTab;
  onChange: (tab: OperationTab) => void;
}

export function OperationTabs({ active, onChange }: OperationTabsProps) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
