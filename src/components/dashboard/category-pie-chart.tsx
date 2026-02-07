"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/store";

interface CategoryPieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

type PieTooltipItem = {
  name?: string | number;
  value?: number | string;
};

type SimplePieTooltipProps = {
  active?: boolean;
  payload?: PieTooltipItem[];
};

function CategoryPieTooltip({ active, payload }: SimplePieTooltipProps) {
  if (active && payload && payload.length) {
    const p = payload[0];
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-lg">
        <p className="font-medium">{String(p.name ?? "")}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(Number(p.value ?? 0))}
        </p>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>No expenses recorded for this year</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">Add expenses to see the breakdown</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Where your money goes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CategoryPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
