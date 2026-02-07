"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function YearSelector() {
  const { selectedYear, setSelectedYear, availableYears, fetchAvailableYears } =
    useExpenseStore();

  useEffect(() => {
    fetchAvailableYears(selectedYear);
  }, [selectedYear, fetchAvailableYears]);

  const years = availableYears?.length ? availableYears : [selectedYear];

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
