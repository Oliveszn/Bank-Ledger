import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Account } from "@/types/accounts";

interface EntryFiltersProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onAccountChange: (id: string | null) => void;
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function EntryFilters({
  accounts,
  selectedAccountId,
  onAccountChange,
  page,
  hasMore,
  onPageChange,
  loading,
}: EntryFiltersProps) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Account</Label>
        <Select
          value={selectedAccountId ?? ""}
          onValueChange={(v) => onAccountChange(v || null)}
        >
          <SelectTrigger className="h-9 w-56 text-sm">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
                <span className="text-muted-foreground ml-2 font-mono text-xs">
                  {a.currency}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination */}
      {selectedAccountId && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground font-mono min-w-[3rem] text-center">
            p. {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore || loading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
