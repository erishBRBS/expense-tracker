import { create } from "zustand"
import { apiFetch } from "@/lib/api"

export interface Category {
  id: string
  name: string
  color: string
}

export interface Expense {
  id: string
  name: string
  amount: number
  categoryId: string
  date: string // YYYY-MM-DD
}

export interface MonthlyBudget {
  month: string
  year: number
  budget: number
}

export type SortBy = "date" | "amount" | "name" | "category"
export type SortOrder = "asc" | "desc"
export type FilterType = "all" | "category" | "date"

type ExpensesQuery = {
  page: number
  limit: number
  categoryId?: string
  startDate?: string
  endDate?: string
  sortBy?: SortBy
  sortOrder?: SortOrder
}

type ExpenseListResponse = {
  items: Array<{
    _id: string
    name: string
    amount: number
    categoryId: string
    date: string
  }>
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

type CategoriesResponse = {
  items: Array<{
    _id: string
    name: string
    color: string
  }>
}

interface ExpenseStore {
  categories: Category[]
  expenses: Expense[]

  // backend pagination meta
  expensesPage: number
  expensesLimit: number
  expensesTotalItems: number
  expensesTotalPages: number

  loadingExpenses: boolean
  loadingCategories: boolean
  expensesError: string
  categoriesError: string

  monthlyBudgets: MonthlyBudget[]
  selectedYear: number

  // Categories
  fetchCategories: () => Promise<void>

  // Expenses
  fetchExpenses: (q: ExpensesQuery) => Promise<void>
  createExpense: (payload: { name: string; amount: number; categoryId: string; date: string }, q?: ExpensesQuery) => Promise<void>
  updateExpense: (id: string, payload: Partial<Pick<Expense, "name" | "amount" | "categoryId" | "date">>, q?: ExpensesQuery) => Promise<void>
  deleteExpense: (id: string, q?: ExpensesQuery) => Promise<void>

  updateBudget: (month: string, year: number, budget: number) => void
  setSelectedYear: (year: number) => void
}

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const generateDefaultBudgets = (): MonthlyBudget[] =>
  months.map((month) => ({
    month,
    year: 2026,
    budget: Math.floor(Math.random() * 1000) + 1500,
  }))

function toDateOnly(v: string) {
  if (!v) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

function buildQueryString(q: ExpensesQuery) {
  const p = new URLSearchParams()
  p.set("page", String(q.page))
  p.set("limit", String(q.limit))

  if (q.categoryId) p.set("categoryId", q.categoryId)
  if (q.startDate) p.set("startDate", q.startDate)
  if (q.endDate) p.set("endDate", q.endDate)
  if (q.sortBy) p.set("sortBy", q.sortBy)
  if (q.sortOrder) p.set("sortOrder", q.sortOrder)

  return p.toString()
}

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

  monthlyBudgets: generateDefaultBudgets(),
  selectedYear: 2026,

  fetchCategories: async () => {
    try {
      set({ loadingCategories: true, categoriesError: "" })

      // ✅ use your existing backend category route
      // change this path IF your route name differs:
      // examples: "/category/get-categories" OR "/categories/get-categories"
      const res = await apiFetch<CategoriesResponse>("/category/get-categories", { method: "GET" })

      const mapped: Category[] = (res.items ?? []).map((c) => ({
        id: c._id,
        name: c.name,
        color: c.color,
      }))

      set({ categories: mapped })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load categories"
      set({ categoriesError: msg })
    } finally {
      set({ loadingCategories: false })
    }
  },

  fetchExpenses: async (q: ExpensesQuery) => {
    try {
      set({ loadingExpenses: true, expensesError: "" })

      const qs = buildQueryString(q)
      const res = await apiFetch<ExpenseListResponse>(`/expenses/get-expenses?${qs}`, { method: "GET" })

      const mapped: Expense[] = (res.items ?? []).map((e) => ({
        id: e._id,
        name: e.name,
        amount: Number(e.amount),
        categoryId: String(e.categoryId),
        date: toDateOnly(e.date),
      }))

      set({
        expenses: mapped,
        expensesPage: res.page ?? q.page,
        expensesLimit: res.limit ?? q.limit,
        expensesTotalItems: res.totalItems ?? 0,
        expensesTotalPages: res.totalPages ?? 1,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load expenses"
      set({ expensesError: msg })
    } finally {
      set({ loadingExpenses: false })
    }
  },

  createExpense: async (payload, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit }

    await apiFetch("/expenses/create-expense", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        amount: payload.amount,
        categoryId: payload.categoryId,
        date: payload.date,
      }),
      headers: { "Content-Type": "application/json" },
    })

    await get().fetchExpenses(query)
  },

  updateExpense: async (id, payload, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit }

    const body: Record<string, unknown> = {}
    if (payload.name !== undefined) body.name = payload.name
    if (payload.amount !== undefined) body.amount = payload.amount
    if (payload.categoryId !== undefined) body.categoryId = payload.categoryId
    if (payload.date !== undefined) body.date = payload.date // only works if backend allows date update

    await apiFetch(`/expenses/update-expense/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })

    await get().fetchExpenses(query)
  },

  deleteExpense: async (id, q) => {
    const query = q ?? { page: get().expensesPage, limit: get().expensesLimit }

    await apiFetch(`/expenses/delete-expense/${id}`, { method: "DELETE" })

    // refresh
    await get().fetchExpenses(query)
  },

  updateBudget: (month, year, budget) =>
    set((state) => {
      const idx = state.monthlyBudgets.findIndex((b) => b.month === month && b.year === year)
      if (idx >= 0) {
        const copy = [...state.monthlyBudgets]
        copy[idx] = { month, year, budget }
        return { monthlyBudgets: copy }
      }
      return { monthlyBudgets: [...state.monthlyBudgets, { month, year, budget }] }
    }),

  setSelectedYear: (year) => set({ selectedYear: year }),
}))

export const getMonthName = (monthIndex: number): string => months[monthIndex]

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount)
