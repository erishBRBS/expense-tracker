"use client";

import React, { useEffect, useState } from "react";

import { useExpenseStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddExpenseForm() {
  const {
    categories,
    fetchCategories,
    createExpense,
    expensesPage,
    expensesLimit,
  } = useExpenseStore();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (categories.length === 0) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !categoryId) return;

    await createExpense(
      {
        name,
        amount: Number(amount),
        categoryId,
        date,
      },
      { page: expensesPage, limit: expensesLimit }
    );

    setName("");
    setAmount("");
    setCategoryId("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="name">Expense Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter expense name"
              className="mt-1.5"
            />
          </div>

          <div className="w-32">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="mt-1.5"
            />
          </div>

          <div className="w-48">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
