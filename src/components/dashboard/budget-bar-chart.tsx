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

export function BudgetBarChart({ data }: BudgetBarChartProps) {
  const { updateBudget, selectedYear } = useExpenseStore();
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState("");

  const handleBarClick = (data: { month: string; budget: number }) => {
    setEditingMonth(data.month);
    setBudgetValue(String(data.budget));
  };

  const handleSaveBudget = () => {
    if (editingMonth && budgetValue) {
      updateBudget(editingMonth, selectedYear, Number(budgetValue));
      setEditingMonth(null);
      setBudgetValue("");
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "budget" ? "Budget" : "Expense"}:{" "}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Compute colors in JavaScript for Recharts
  const budgetColor = "#6366f1"; // primary color
  const expenseColor = "#22c55e"; // accent/success color

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
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
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
                  onClick={(data) => handleBarClick(data)}
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
            <Label htmlFor="budget">Budget Amount ($)</Label>
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
