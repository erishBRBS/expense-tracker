"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/store";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface StatsCardsProps {
  totalSpent: number;
  totalBudget: number;
  difference: number;
}

export function StatsCards({
  totalSpent,
  totalBudget,
  difference,
}: StatsCardsProps) {
  const isSaved = difference >= 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent
          </CardTitle>
          <div className="rounded-lg bg-destructive/10 p-2">
            <Wallet className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">This year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Budget
          </CardTitle>
          <div className="rounded-lg bg-primary/10 p-2">
            <PiggyBank className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          <p className="text-xs text-muted-foreground">Yearly allocation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isSaved ? "Saved" : "Over Budget"}
          </CardTitle>
          <div
            className={`rounded-lg p-2 ${
              isSaved ? "bg-success/10" : "bg-destructive/10"
            }`}
          >
            {isSaved ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isSaved ? "text-success" : "text-destructive"
            }`}
          >
            {formatCurrency(Math.abs(difference))}
          </div>
          <p className="text-xs text-muted-foreground">
            {isSaved ? "Under budget" : "Overspent"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget Usage
          </CardTitle>
          <div className="rounded-lg bg-warning/10 p-2">
            <TrendingUp className="h-4 w-4 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalBudget > 0
              ? `${Math.round((totalSpent / totalBudget) * 100)}%`
              : "0%"}
          </div>
          <p className="text-xs text-muted-foreground">Of total budget used</p>
        </CardContent>
      </Card>
    </div>
  );
}