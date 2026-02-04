"use client";

import { useExpenseStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const years = [2024, 2025, 2026];

export function YearSelector() {
  const { selectedYear, setSelectedYear } = useExpenseStore();

  return (
    <Select
      value={String(selectedYear)}
      onValueChange={(value) => setSelectedYear(Number(value))}
    >
      <SelectTrigger className="w-32 bg-card">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
