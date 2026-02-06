import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/protected-route";
import LoginPage from "@/components/auth/login";

import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { ExpensesContent } from "@/components/expenses/expenses-content";
import { CategoriesContent } from "@/components/categories/categories-content";
import ProfileContent from "@/components/profile/profile";
import { Wallet } from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="md:pl-80 p-2 md:p-6">
        {/*  MOBILE TOP BAR (STICKY) */}
        <div className="md:hidden sticky top-0 z-50 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Wallet className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-base font-semibold">ExpenseTracker</span>
          </div>
        </div>

        {children}
      </main>
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
