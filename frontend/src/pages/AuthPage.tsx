import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

type Tab = "login" | "register";

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("login");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(20 10% 8%) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-mono font-medium">
                L
              </span>
            </div>
            <span className="text-sm font-mono font-medium tracking-widest uppercase text-muted-foreground">
              Ledger
            </span>
          </div>
        </div>

        <div className="md:hidden mb-6 rounded-lg border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground text-center">
            For the best experience, we recommend using a laptop or larger
            screen.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-border">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-3 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`py-3 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form area */}
          <div className="p-6">
            <div className="mb-5">
              <h1 className="text-base font-semibold">
                {activeTab === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeTab === "login"
                  ? "Enter your credentials to access your ledger."
                  : "Start tracking your finances with double-entry precision."}
              </p>
            </div>

            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6 font-mono">
          {new Date().getFullYear()} · All transactions are final
        </p>
      </div>
    </div>
  );
}
