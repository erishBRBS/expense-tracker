import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
}

export interface MonthlyBudget {
  month: string; // "Jan"..."Dec"
  year: number;
  budget: number;
}

export type SortBy = "date" | "amount" | "name" | "category";
export type SortOrder = "asc" | "desc";
export type FilterType = "all" | "category" | "date";

type ExpensesQuery = {
  page: number;
  limit: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

type ExpenseListResponse = {
  items: Array<{
    _id: string;
    name: string;
    amount: number;
    categoryId: string;
    date: string;
  }>;
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

// ✅ categories backend returns array directly
type CategoryDoc = {
  _id: string;
  name: string;
  color: string;
};
type CategoriesResponse = CategoryDoc[];

// ✅ budgets backend response
type MonthlyBudgetApi = {
  month: number; // 0-11
  year: number;
  budget: number;
};

interface ExpenseStore {
  categories: Category[];
  expenses: Expense[];

  // backend pagination meta
  expensesPage: number;
  expensesLimit: number;
  expensesTotalItems: number;
  expensesTotalPages: number;

  loadingExpenses: boolean;
  loadingCategories: boolean;
  expensesError: string;
  categoriesError: string;

  // Budgets
  monthlyBudgets: MonthlyBudget[];
  selectedYear: number;

  // Categories
  fetchCategories: () => Promise<void>;
  addCategory: (payload: { name: string; color: string }) => Promise<void>;
  updateCategory: (
    id: string,
    payload: Partial<Pick<Category, "name" | "color">>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Expenses
  fetchExpenses: (q: ExpensesQuery) => Promise<void>;
  createExpense: (
    payload: { name: string; amount: number; categoryId: string; date: string },
    q?: ExpensesQuery
  ) => Promise<void>;
  updateExpense: (
    id: string,
    payload: Partial<Pick<Expense, "name" | "amount" | "categoryId" | "date">>,
    q?: ExpensesQuery
  ) => Promise<void>;
  deleteExpense: (id: string, q?: ExpensesQuery) => Promise<void>;

  // Budgets (NEW)
  fetchBudgets: (year: number) => Promise<void>;
  updateBudget: (month: string, year: number, budget: number) => Promise<void>;

  setSelectedYear: (year: number) => void;
}

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const getMonthName = (monthIndex: number): string => months[monthIndex];

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const monthToIndex = (monthName: string) => months.indexOf(monthName);

const makeZeroBudgets = (year: number): MonthlyBudget[] =>
  months.map((m) => ({ month: m, year, budget: 0 }));

function toDateOnly(v: string) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function buildQueryString(q: ExpensesQuery) {
  const p = new URLSearchParams();
  p.set("page", String(q.page));
  p.set("limit", String(q.limit));

  if (q.categoryId) p.set("categoryId", q.categoryId);
  if (q.startDate) p.set("startDate", q.startDate);
  if (q.endDate) p.set("endDate", q.endDate);
  if (q.sortBy) p.set("sortBy", q.sortBy);
  if (q.sortOrder) p.set("sortOrder", q.sortOrder);

  return p.toString();
}

const mapCategory = (c: CategoryDoc): Category => ({
  id: c._id,
  name: c.name,
  color: c.color,
});

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  categories: [],
  expenses: [],

  expensesPage: 1,
  expensesLimit: 12,
  expensesTotalItems: 0,
  expensesTotalPages: 1,

  loadingExpenses: false,
  loadingCategories: false,
  expensesError: "",
  categoriesError: "",

  selectedYear: 2026,
  monthlyBudgets: makeZeroBudgets(2026),

  // =========================
  // CATEGORIES (UNCHANGED STYLE)
  // =========================
  fetchCategories: async () => {
    try {
      set({ loadingCategories: true, categoriesError: "" });

      const res = await apiFetch<CategoriesResponse>("/categories/get-categories", {
        method: "GET",
      });

      set({ categories: (res ?? []).map(mapCategory) });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load categories";
      set({ categoriesError: msg });
    } finally {
      set({ loadingCategories: false });
    }
  },

  addCategory: async (payload) => {
    try {
      set({ categoriesError: "" });

      const created = await apiFetch<CategoryDoc>("/categories/create-category", {
        method: "POST",
        body: JSON.stringify({
          name: payload.name,
          color: payload.color,
        }),
        headers: { "Content-Type": "application/json" },
      });

      set((state) => ({ categories: [...state.categories, mapCategory(created)] }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add category";
      set({ categoriesError: msg });
    }
  },

  updateCategory: async (id, payload) => {
    try {
      set({ categoriesError: "" });

      const updated = await apiFetch<CategoryDoc>(`/categories/update-category/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? mapCategory(updated) : c)),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      set({ categoriesError: msg });
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ categoriesError: "" });

      await apiFetch(`/categories/delete-category/${id}`, { method: "DELETE" });

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        expenses: state.expenses.filter((e) => e.categoryId !== id),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete category";
      set({ categoriesError: msg });
    }
  },

  // =========================
  // EXPENSES (UNCHANGED STYLE)
  // =========================
  fetchExpenses: async (q: ExpensesQuery) => {
    try {
      set({ loadingExpenses: true, expensesError: "" });

      const qs = buildQueryString(q);
      const res = await apiFetch<ExpenseListResponse>(`/expenses/get-expenses?${qs}`, {
        method: "GET",
      });

      const mapped: Expense[] = (res.items ?? []).map((e) => ({
        id: e._id,
        name: e.name,
        amount: Number(e.amount),
        categoryId: String(e.categoryId),
        date: toDateOnly(e.date),
      }));

      set({
        expenses: mapped,
        expensesPage: res.page ?? q.page,
        expensesLimit: res.limit ?? q.limit,
        expensesTotalItems: res.totalItems ?? 0,
        expensesTotalPages: res.totalPages ?? 1,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load expenses";
      set({ expensesError: msg });
    } finally {
      set({ loadingExpenses: false });
    }
  },

  createExpense: async (payload, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit };

    await apiFetch("/expenses/create-expense", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        amount: payload.amount,
        categoryId: payload.categoryId,
        date: payload.date,
      }),
      headers: { "Content-Type": "application/json" },
    });

    await get().fetchExpenses(query);
  },

  updateExpense: async (id, payload, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit };

    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.amount !== undefined) body.amount = payload.amount;
    if (payload.categoryId !== undefined) body.categoryId = payload.categoryId;
    if (payload.date !== undefined) body.date = payload.date;

    await apiFetch(`/expenses/update-expense/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await get().fetchExpenses(query);
  },

  deleteExpense: async (id, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit };

    await apiFetch(`/expenses/delete-expense/${id}`, { method: "DELETE" });
    await get().fetchExpenses(query);
  },

  // =========================
  // BUDGETS (ONLY ADDITION)
  // =========================
  fetchBudgets: async (year: number) => {
    try {
      // ✅ keep same style (no /api prefix here)
      const res = await apiFetch<MonthlyBudgetApi[]>(
        `/budgets/get-budgets?year=${year}`,
        { method: "GET" }
      );

      const mapped: MonthlyBudget[] = (res ?? []).map((b) => ({
        month: months[b.month] ?? "Jan",
        year: b.year,
        budget: Number(b.budget ?? 0),
      }));

      // if backend returns something weird, fallback to 12 months 0
      set({ monthlyBudgets: mapped.length === 12 ? mapped : makeZeroBudgets(year) });
    } catch (err) {
      console.error("fetchBudgets error:", err);
      set({ monthlyBudgets: makeZeroBudgets(year) });
    }
  },

  updateBudget: async (month: string, year: number, budget: number) => {
    const monthIndex = monthToIndex(month);
    if (monthIndex < 0) return;

    // optimistic
    set((state) => {
      const idx = state.monthlyBudgets.findIndex(
        (b) => b.month === month && b.year === year
      );
      if (idx >= 0) {
        const copy = [...state.monthlyBudgets];
        copy[idx] = { month, year, budget };
        return { monthlyBudgets: copy };
      }
      return { monthlyBudgets: [...state.monthlyBudgets, { month, year, budget }] };
    });

    try {
      // ✅ keep same style (no /api prefix here)
      await apiFetch(`/budgets/upsert-budget`, {
        method: "PUT",
        body: JSON.stringify({
          year,
          month: monthIndex, // 0-11
          budget,
        }),
        headers: { "Content-Type": "application/json" },
      });

      // make sure DB state reflected
      await get().fetchBudgets(year);
    } catch (err) {
      console.error("updateBudget error:", err);
      await get().fetchBudgets(year); // rollback
    }
  },

  setSelectedYear: (year) => {
    set({ selectedYear: year });
    // optional auto-load budgets for that year
    get().fetchBudgets(year);
  },
}));
