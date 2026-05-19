import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 border-b border-border bg-background flex items-center px-3 z-50">
        <button onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
