"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExpenseStore, formatCurrency } from "@/lib/store";

interface BudgetBarChartProps {
  data: {
    month: string;
    expense: number;
    budget: number;
  }[];
}

/** ✅ minimal tooltip prop types (works across recharts versions) */
type TooltipItem = {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
};

type SimpleTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
};

function BudgetBarTooltip({ active, payload, label }: SimpleTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
        <p className="font-medium">{label}</p>

        {payload.map((entry: TooltipItem, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === "budget" ? "Budget" : "Expense"}:{" "}
            {formatCurrency(Number(entry.value ?? 0))}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/** ✅ helper for safe typing without `any` */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function BudgetBarChart({ data }: BudgetBarChartProps) {
  const { updateBudget, selectedYear } = useExpenseStore();
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState("");

  const handleBarClick = (item: unknown) => {
    // Recharts gives a "rectangle item" with `.payload`
    if (!isRecord(item)) return;

    const payload = item["payload"];
    if (!isRecord(payload)) return;

    const month = payload["month"];
    const budget = payload["budget"];

    if (typeof month !== "string") return;

    const budgetNum = typeof budget === "number" ? budget : Number(budget ?? 0);

    setEditingMonth(month);
    setBudgetValue(String(Number.isFinite(budgetNum) ? budgetNum : 0));
  };

  const handleSaveBudget = async () => {
    if (!editingMonth) return;

    const n = Number(budgetValue);
    if (Number.isNaN(n) || n < 0) return;

    await updateBudget(editingMonth, selectedYear, n);

    setEditingMonth(null);
    setBudgetValue("");
  };

  const budgetColor = "#6366f1";
  const expenseColor = "#22c55e";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget vs Expenses</CardTitle>
          <CardDescription>
            Click on a budget bar to edit the value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 45, left: 55, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />
                <Tooltip content={<BudgetBarTooltip />} />
                <Legend
                  formatter={(value) =>
                    value === "budget" ? "Budget" : "Expense"
                  }
                />
                <Bar
                  dataKey="budget"
                  fill={budgetColor}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                  onClick={handleBarClick}
                  minPointSize={6}
                />

                <Bar
                  dataKey="expense"
                  fill={expenseColor}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingMonth} onOpenChange={() => setEditingMonth(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget for {editingMonth}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="budget">Budget Amount</Label>
            <Input
              id="budget"
              type="number"
              value={budgetValue}
              onChange={(e) => setBudgetValue(e.target.value)}
              placeholder="Enter budget amount"
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMonth(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBudget}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
