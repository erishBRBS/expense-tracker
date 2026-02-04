import type { Category } from "@/lib/store"
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
import type { FilterType } from "./expenses-content";

interface ExpenseFiltersProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  categories: Category[];
}

export function ExpenseFilters({
  filter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
}: ExpenseFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => {
            setFilter("all");
            setSelectedCategory("");
            setStartDate("");
            setEndDate("");
          }}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === "category" ? "default" : "outline"}
          onClick={() => setFilter("category")}
          size="sm"
        >
          By Category
        </Button>
        <Button
          variant={filter === "date" ? "default" : "outline"}
          onClick={() => setFilter("date")}
          size="sm"
        >
          By Date
        </Button>
      </div>

      {filter === "category" && (
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
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
      )}

      {filter === "date" && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
