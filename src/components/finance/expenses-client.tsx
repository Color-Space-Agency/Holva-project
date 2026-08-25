"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIALS: "#3b82f6",
  SALARY: "#10b981",
  RENT: "#f59e0b",
  ELECTRICITY: "#ef4444",
  TRANSPORT: "#8b5cf6",
  PACKAGING: "#ec4899",
  MAINTENANCE: "#64748b",
  OTHER: "#94a3b8"
};

export function ExpensesClient() {
  const supabase = createClient();
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ["expenses", categoryFilter],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("expenses")
            .select("*")
            .order("expense_date", { ascending: false });

          if (categoryFilter !== "ALL") {
            query = query.eq("category", categoryFilter);
          }

          const { data, error } = await query;
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }

      const defaultExpenses = [
        {
          id: "exp-1",
          category: "RAW_MATERIALS",
          amount: 6400000,
          expense_date: "25.08.2026",
          description: "200 kg oq kunjut xaridi (Agro Import)",
        },
        {
          id: "exp-2",
          category: "TRANSPORT",
          amount: 450000,
          expense_date: "24.08.2026",
          description: "Labo va Damas avtomobillari uchun yoqilg'i (Metan)",
        },
        {
          id: "exp-3",
          category: "PACKAGING",
          amount: 1200000,
          expense_date: "23.08.2026",
          description: "Holva qutilari va vakuum plyonka xaridi",
        },
        {
          id: "exp-4",
          category: "ELECTRICITY",
          amount: 2800000,
          expense_date: "20.08.2026",
          description: "Tsex elektr energiyasi va ishlab chiqarish pechlari",
        },
        {
          id: "exp-5",
          category: "SALARY",
          amount: 18500000,
          expense_date: "10.08.2026",
          description: "Oylik ish haqi va avans to'lovlari",
        },
      ];

      if (categoryFilter !== "ALL") {
        return defaultExpenses.filter((e) => e.category === categoryFilter);
      }
      return defaultExpenses;
    },
  });

  const chartData = expenses?.reduce((acc: any[], expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += Number(expense.amount);
    } else {
      acc.push({ name: expense.category, value: Number(expense.amount) });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <SelectItem key={cat} value={cat}>{cat.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 rounded-md border bg-card p-4 h-[300px]">
          <h3 className="text-sm font-medium mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.OTHER} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="col-span-2 rounded-md border bg-card">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : expenses?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-sm text-muted-foreground">No expenses found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.map((exp) => (
                    <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(exp.expense_date)}</td>
                      <td className="px-4 py-3 font-medium">{exp.category.replace("_", " ")}</td>
                      <td className="px-4 py-3 truncate max-w-[200px]">{exp.description || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-destructive">{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ExpenseFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={() => refetch()} 
      />
    </div>
  );
}
