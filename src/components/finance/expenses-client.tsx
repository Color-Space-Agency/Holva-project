"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, DollarSign, TrendingDown, Calendar, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const CATEGORY_NAMES: Record<string, string> = {
  RAW_MATERIALS: "Xomashyo xaridi",
  SALARY: "Ish haqi va avans",
  RENT: "Bino ijarasi",
  ELECTRICITY: "Elektr va kommunal",
  TRANSPORT: "Transport va logistika",
  PACKAGING: "Qadoqlash materiallari",
  MAINTENANCE: "Uskuna ta'mirlash",
  OTHER: "Boshqa xarajatlar",
};

const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIALS: "#3b82f6",
  SALARY: "#10b981",
  RENT: "#f59e0b",
  ELECTRICITY: "#ef4444",
  TRANSPORT: "#8b5cf6",
  PACKAGING: "#ec4899",
  MAINTENANCE: "#64748b",
  OTHER: "#94a3b8",
};

const DEFAULT_EXPENSES = [
  {
    id: "exp-1",
    category: "RAW_MATERIALS",
    amount: 6400000,
    expense_date: new Date().toISOString(),
    description: "200 kg oq kunjut xaridi (Agro Import)",
    payment_method: "BANK",
  },
  {
    id: "exp-2",
    category: "TRANSPORT",
    amount: 450000,
    expense_date: new Date(Date.now() - 86400000).toISOString(),
    description: "Labo va Damas avtomobillari uchun yoqilg'i (Metan)",
    payment_method: "CASH",
  },
  {
    id: "exp-3",
    category: "PACKAGING",
    amount: 1200000,
    expense_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    description: "Holva qutilari va vakuum plyonka xaridi",
    payment_method: "CARD",
  },
  {
    id: "exp-4",
    category: "ELECTRICITY",
    amount: 2800000,
    expense_date: new Date(Date.now() - 86400000 * 4).toISOString(),
    description: "Tsex elektr energiyasi va ishlab chiqarish pechlari",
    payment_method: "BANK",
  },
  {
    id: "exp-5",
    category: "SALARY",
    amount: 18500000,
    expense_date: new Date(Date.now() - 86400000 * 10).toISOString(),
    description: "Oylik ish haqi va avans to'lovlari",
    payment_method: "BANK",
  },
  {
    id: "exp-6",
    category: "MAINTENANCE",
    amount: 850000,
    expense_date: new Date(Date.now() - 86400000 * 12).toISOString(),
    description: "Qandolat qozonining reduktor podshipniklarini almashtirish",
    payment_method: "CASH",
  },
];

export function ExpensesClient() {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (CATEGORY_NAMES[e.category] || "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const chartData = Object.keys(CATEGORY_NAMES).map((catKey) => {
    const total = expenses
      .filter((e) => e.category === catKey)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: CATEGORY_NAMES[catKey],
      key: catKey,
      value: total,
    };
  }).filter((item) => item.value > 0);

  const handleExpenseCreated = (newExpense: any) => {
    setExpenses([
      {
        id: `exp-${Date.now()}`,
        category: newExpense.category || "OTHER",
        amount: Number(newExpense.amount) || 0,
        expense_date: newExpense.expense_date || new Date().toISOString(),
        description: newExpense.description || "Xarajat",
        payment_method: newExpense.payment_method || "CASH",
      },
      ...expenses,
    ]);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Jami Xarajatlar</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenseAmount)}
          </div>
          <span className="text-xs text-gray-400">Tanlangan toifa bo&apos;yicha</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Operatsiyalar</span>
            <Calendar className="h-4 w-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredExpenses.length} ta
          </div>
          <span className="text-xs text-gray-400">Ro&apos;yxatga olingan to&apos;lovlar</span>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Eng Katta Xarajat</span>
            <Wallet className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            Ish haqi fondi
          </div>
          <span className="text-xs text-emerald-600 font-medium">Jami xarajatning 61% qismi</span>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Xarajat bo'yicha qidirish..."
              className="pl-10 h-11 rounded-2xl bg-white dark:bg-gray-900 text-sm border-gray-200 dark:border-gray-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] h-11 rounded-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-xs font-medium">
              <SelectValue placeholder="Kategoriya filtri" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL">Barcha kategoriyalar</SelectItem>
              {Object.keys(CATEGORY_NAMES).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_NAMES[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold gap-2 shadow-md shadow-violet-500/20"
        >
          <Plus className="h-4 w-4" /> Yangi Xarajat Qo&apos;shish
        </Button>
      </div>

      {/* Main Grid: Chart and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Xarajatlar Tuzilmasi</h3>
            <p className="text-xs text-gray-400">Kategoriyalar bo&apos;yicha ulush</p>
          </div>

          <div className="h-[240px] w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.key] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-gray-400">Ma&apos;lumot yo&apos;q</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800 max-h-40 overflow-y-auto pr-1">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.key] || "#94a3b8" }}
                  />
                  <span className="text-gray-600 dark:text-gray-300 truncate max-w-[140px]">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Xarajatlar Ro&apos;yxati</h3>
            <span className="text-xs text-gray-400">{filteredExpenses.length} ta yozuv</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800 text-[11px] font-semibold">
                <tr>
                  <th className="pb-3 px-3">Sana</th>
                  <th className="pb-3 px-3">Kategoriya</th>
                  <th className="pb-3 px-3">Tavsif</th>
                  <th className="pb-3 px-3">To&apos;lov turi</th>
                  <th className="pb-3 px-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px]">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[exp.category] || "#94a3b8" }}
                        />
                        {CATEGORY_NAMES[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300 max-w-[220px] truncate">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-3 text-gray-400 whitespace-nowrap">
                      {exp.payment_method === "CASH" ? "Naqd" : exp.payment_method === "BANK" ? "Bank hisobi" : "Karta"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                      -{formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      Hech qanday xarajat topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Expense Form Dialog */}
      <ExpenseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleExpenseCreated}
      />
    </div>
  );
}
