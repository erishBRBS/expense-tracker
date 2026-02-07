"use client";

import { useEffect } from "react";
import { useExpenseStore, getMonthName } from "@/lib/store";
import { YearSelector } from "./year-selector";
import { StatsCards } from "./stats-cards";
import { CategoryPieChart } from "./category-pie-chart";
import { BudgetBarChart } from "./budget-bar-chart";

export function DashboardContent() {
  const {
    expenses,
    categories,
    monthlyBudgets,
    selectedYear,
    fetchBudgets,
    fetchCategories,
    fetchExpenses,
    expensesPage,
    expensesLimit,
  } = useExpenseStore();

  useEffect(() => {
    fetchBudgets(selectedYear);

    if (categories.length === 0) fetchCategories();

    // For charts, better to fetch more than 12 so totals are correct
    if (expenses.length === 0) {
      fetchExpenses({ page: expensesPage || 1, limit: 9999 });
    }
  }, [
    selectedYear,
    fetchBudgets,
    fetchCategories,
    fetchExpenses,
    categories.length,
    expenses.length,
    expensesPage,
    expensesLimit,
  ]);

  // expenses for selected year
  const yearExpenses = expenses.filter(
    (exp) => new Date(exp.date).getFullYear() === selectedYear
  );

  // pie data
  const categoryTotals = categories
    .map((cat) => {
      const total = yearExpenses
        .filter((exp) => exp.categoryId === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return { name: cat.name, value: total, color: cat.color };
    })
    .filter((c) => c.value > 0);

  // bar data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = getMonthName(i);

    const totalExpense = yearExpenses
      .filter((exp) => new Date(exp.date).getMonth() === i)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const budgetEntry = monthlyBudgets.find(
      (b) => b.month === monthName && b.year === selectedYear
    );

    return {
      month: monthName,
      expense: totalExpense,
      budget: budgetEntry?.budget ?? 0,
    };
  });

  const totalSpent = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = monthlyBudgets
    .filter((b) => b.year === selectedYear)
    .reduce((sum, b) => sum + b.budget, 0);
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
