import { Routes, Route, Navigate } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { ExpensesContent } from "@/components/expenses/expenses-content"
import { CategoriesContent } from "@/components/categories/categories-content"

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      <main className="pl-80 p-6">
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/expenses" element={<ExpensesContent />} />
          <Route path="/categories" element={<CategoriesContent />} />

          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
