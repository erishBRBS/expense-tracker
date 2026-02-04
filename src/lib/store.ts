import { create } from "zustand"

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
  date: string
}

export interface MonthlyBudget {
  month: string
  year: number
  budget: number
}

interface ExpenseStore {
  categories: Category[]
  expenses: Expense[]
  monthlyBudgets: MonthlyBudget[]
  selectedYear: number

  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void

  addExpense: (expense: Omit<Expense, "id">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void

  updateBudget: (month: string, year: number, budget: number) => void
  setSelectedYear: (year: number) => void
}

const defaultCategories: Category[] = [
  { id: "1", name: "Food & Dining", color: "#6366f1" },
  { id: "2", name: "Transportation", color: "#22c55e" },
  { id: "3", name: "Shopping", color: "#eab308" },
  { id: "4", name: "Entertainment", color: "#ef4444" },
  { id: "5", name: "Bills & Utilities", color: "#a855f7" },
  { id: "6", name: "Healthcare", color: "#06b6d4" },
]

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const getRandomExpenseName = (categoryId: number): string => {
  const names: Record<number, string[]> = {
    1: ["Grocery Shopping", "Restaurant Dinner", "Coffee", "Lunch"],
    2: ["Gas", "Uber Ride", "Bus Ticket", "Car Maintenance"],
    3: ["Clothes", "Electronics", "Home Decor", "Online Shopping"],
    4: ["Movie Tickets", "Concert", "Streaming Service", "Games"],
    5: ["Electricity", "Internet", "Phone Bill", "Water Bill"],
    6: ["Medicine", "Doctor Visit", "Gym Membership", "Vitamins"],
  }
  const list = names[categoryId] || names[1]
  return list[Math.floor(Math.random() * list.length)]
}

const generateMockExpenses = (): Expense[] => {
  const expenses: Expense[] = []
  const currentYear = 2026

  for (let month = 0; month < 12; month++) {
    const numExpenses = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < numExpenses; i++) {
      const day = Math.floor(Math.random() * 28) + 1
      expenses.push({
        id: `expense-${month}-${i}`,
        name: getRandomExpenseName(Math.floor(Math.random() * 6) + 1),
        amount: Math.floor(Math.random() * 300) + 20,
        categoryId: String(Math.floor(Math.random() * 6) + 1),
        date: `${currentYear}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      })
    }
  }
  return expenses
}

const generateDefaultBudgets = (): MonthlyBudget[] =>
  months.map((month) => ({
    month,
    year: 2026,
    budget: Math.floor(Math.random() * 1000) + 1500,
  }))

export const useExpenseStore = create<ExpenseStore>((set) => ({
  categories: defaultCategories,
  expenses: generateMockExpenses(),
  monthlyBudgets: generateDefaultBudgets(),
  selectedYear: 2026,

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, { ...category, id: `cat-${Date.now()}` }],
    })),

  updateCategory: (id, updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updatedCategory } : cat
      ),
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
      expenses: state.expenses.filter((exp) => exp.categoryId !== id),
    })),

  addExpense: (expense) =>
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: `exp-${Date.now()}` }],
    })),

  updateExpense: (id, updatedExpense) =>
    set((state) => ({
      expenses: state.expenses.map((exp) =>
        exp.id === id ? { ...exp, ...updatedExpense } : exp
      ),
    })),

  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((exp) => exp.id !== id),
    })),

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
