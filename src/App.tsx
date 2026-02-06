import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/protected-route";
import LoginPage from "@/components/auth/login";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ExpensesContent } from "@/components/expenses/expenses-content";
import { CategoriesContent } from "@/components/categories/categories-content";
import ProfileContent from "./components/profile/profile";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-80 p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell>
              <DashboardContent />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Shell>
              <ExpensesContent />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Shell>
              <CategoriesContent />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Shell>
              <ProfileContent />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
