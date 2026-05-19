import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/auth-store";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { TransactionsPage } from "./pages/TransactionPage";
import { EntriesPage } from "./pages/EnriesPage";
import { ReconcilePage } from "./pages/ReconcilePage";

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entries"
          element={
            <ProtectedRoute>
              <EntriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reconcile"
          element={
            <ProtectedRoute>
              <ReconcilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
