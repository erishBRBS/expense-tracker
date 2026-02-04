import { useExpenseStore, getMonthName } from "@/lib/store";
import { YearSelector } from "./year-selector";
import { StatsCards } from "./stats-cards";
import { CategoryPieChart } from "./category-pie-chart";
import { BudgetBarChart } from "./budget-bar-chart";

export function DashboardContent() {
  const { expenses, categories, monthlyBudgets, selectedYear } =
    useExpenseStore();

  // Filter expenses by selected year
  const yearExpenses = expenses.filter(
    (exp) => new Date(exp.date).getFullYear() === selectedYear
  );

  // Calculate category totals for pie chart
  const categoryTotals = categories.map((cat) => {
    const total = yearExpenses
      .filter((exp) => exp.categoryId === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      name: cat.name,
      value: total,
      color: cat.color,
    };
  }).filter((cat) => cat.value > 0);

  // Calculate monthly data for bar chart
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = getMonthName(i);
    const monthExpenses = yearExpenses.filter(
      (exp) => new Date(exp.date).getMonth() === i
    );
    const totalExpense = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetEntry = monthlyBudgets.find(
      (b) => b.month === monthName && b.year === selectedYear
    );
    return {
      month: monthName,
      expense: totalExpense,
      budget: budgetEntry?.budget || 0,
    };
  });

  // Calculate stats
  const totalSpent = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = monthlyBudgets
    .filter((b) => b.year === selectedYear)
    .reduce((sum, b) => sum + b.budget, 0);
  const difference = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your expenses and budget
          </p>
        </div>
        <YearSelector />
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalSpent={totalSpent}
        totalBudget={totalBudget}
        difference={difference}
      />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryPieChart data={categoryTotals} />
        <BudgetBarChart data={monthlyData} />
      </div>
    </div>
  );
}
