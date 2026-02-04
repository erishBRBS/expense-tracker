"use client";

import { useState } from "react";
import { useExpenseStore } from "@/lib/store";
import { AddExpenseForm } from "./add-expense-form";
import { ExpensesTable } from "./expenses-table";
import { ExpenseFilters } from "./expense-filters";

export type FilterType = "all" | "category" | "date";

export function ExpensesContent() {
  const { expenses, categories } = useExpenseStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "category" && selectedCategory) {
      return expense.categoryId === selectedCategory;
    }
    if (filter === "date") {
      const expenseDate = new Date(expense.date);
      if (startDate && endDate) {
        return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
      }
      if (startDate) {
        return expenseDate >= new Date(startDate);
      }
      if (endDate) {
        return expenseDate <= new Date(endDate);
      }
    }
    return true;
  });

  // Sort by date descending
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Add and manage your expenses
        </p>
      </div>

      {/* Add Expense Form */}
      <AddExpenseForm />

      {/* Filters */}
      <ExpenseFilters
        filter={filter}
        setFilter={handleFilterChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        startDate={startDate}
        setStartDate={handleStartDateChange}
        endDate={endDate}
        setEndDate={handleEndDateChange}
        categories={categories}
      />

      {/* Table */}
      <ExpensesTable
        expenses={sortedExpenses}
        categories={categories}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
      />
    </div>
  );
}
