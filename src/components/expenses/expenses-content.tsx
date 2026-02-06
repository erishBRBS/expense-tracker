"use client";

import { useEffect, useState } from "react";
import { useExpenseStore } from "@/lib/store";
import { AddExpenseForm } from "./add-expense-form";
import { ExpensesTable } from "./expenses-table";
import { ExpenseFilters } from "./expense-filters";

export type FilterType = "all" | "category" | "date";

export function ExpensesContent() {
  const {
    expenses,
    categories,
    fetchExpenses,
    fetchCategories,
    expensesTotalItems,
    expensesTotalPages,
  } = useExpenseStore();

  type FetchExpensesQuery = {
  page: number;
  limit: number;
  sortBy: "date";
  sortOrder: "asc" | "desc";
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q: FetchExpensesQuery = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: "date",
      sortOrder: "desc",
    };

    if (filter === "category" && selectedCategory) q.categoryId = selectedCategory;

    if (filter === "date") {
      if (startDate) q.startDate = startDate;
      if (endDate) q.endDate = endDate;
    }

    fetchExpenses(q);
  }, [filter, selectedCategory, startDate, endDate, currentPage, itemsPerPage, fetchExpenses]);

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground">Add and manage your expenses</p>
      </div>

      <AddExpenseForm />

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

      <ExpensesTable
        expenses={expenses}              // ✅ backend items already per-page
        categories={categories}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={handleItemsPerPageChange}
        totalItems={expensesTotalItems}   // ✅ NEW
        totalPages={expensesTotalPages}   // ✅ NEW
      />
    </div>
  );
}
