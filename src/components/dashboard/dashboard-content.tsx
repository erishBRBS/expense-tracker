"use client";

import { useEffect } from "react";
import { useExpenseStore, getMonthName } from "@/lib/store";
import { YearSelector } from "./year-selector";
import { StatsCards } from "./stats-cards";
import { CategoryPieChart } from "./category-pie-chart";
import { BudgetBarChart } from "./budget-bar-chart";

export function DashboardContent() {
  const {
    categories,
    selectedYear,
    fetchBudgets,
    fetchCategories,
    fetchAvailableYears,

    // ✅ from /dashboard/summary (whole year)
    dashboardCards,
    dashboardMonthly,
    dashboardSpendingByCategory,
  } = useExpenseStore();

  useEffect(() => {
    fetchBudgets(selectedYear);
    fetchAvailableYears(selectedYear);

    if (categories.length === 0) fetchCategories();
  }, [selectedYear, fetchBudgets, fetchAvailableYears, fetchCategories, categories.length]);

  // ✅ PIE: use backend aggregated totals (not paginated expenses)
  const categoryTotals = (dashboardSpendingByCategory ?? [])
    .map((c) => ({
      name: c.name,
      value: Number(c.total ?? 0),
      color: c.color,
    }))
    .filter((c) => c.value > 0);

  // ✅ BAR: backend returns {month:0-11, budget, spent} but chart expects {month:"Jan", expense, budget}
  const monthlyData = (dashboardMonthly ?? []).map((m) => ({
    month: getMonthName(m.month),
    expense: Number(m.spent ?? 0),
    budget: Number(m.budget ?? 0),
  }));

  // ✅ CARDS: use backend computed totals (accurate for whole year)
  const totalSpent = Number(dashboardCards?.totalSpent ?? 0);
  const totalBudget = Number(dashboardCards?.totalBudget ?? 0);
  const difference = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your expenses and budget
          </p>
        </div>
        <YearSelector />
      </div>

      <StatsCards totalSpent={totalSpent} totalBudget={totalBudget} difference={difference} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart data={categoryTotals} />
        <BudgetBarChart data={monthlyData} />
      </div>
    </div>
  );
}
