import { Metadata } from "next";
import { EmployeesClient } from "@/components/hr/employees-client";

export const metadata: Metadata = {
  title: "Xodimlar",
  description: "Manage HR employees",
};

export default function EmployeesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      </div>
      <EmployeesClient />
    </div>
  );
}
