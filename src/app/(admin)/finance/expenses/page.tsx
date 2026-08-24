import { Metadata } from "next";
import { ExpensesClient } from "@/components/finance/expenses-client";

export const metadata: Metadata = {
  title: "Expenses | Holva Factory CRM",
  description: "Manage factory expenses",
};

export default function ExpensesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
      </div>
      <ExpensesClient />
    </div>
  );
}
