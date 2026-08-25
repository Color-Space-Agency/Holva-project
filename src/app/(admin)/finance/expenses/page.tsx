import { Metadata } from "next";
import { ExpensesClient } from "@/components/finance/expenses-client";

export const metadata: Metadata = {
  title: "Xarajatlar | Holva Factory CRM",
  description: "Zavod xarajatlarini boshqarish",
};

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Xarajatlar Boshqaruvi
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Zavodning barcha toifadagi xarajatlari, kommunal va operatsion to&apos;lovlari
        </p>
      </div>
      <ExpensesClient />
    </div>
  );
}
