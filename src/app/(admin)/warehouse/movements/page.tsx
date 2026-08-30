import { MovementsClient } from "@/components/warehouse/movements-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harakatlar",
};

export default function MovementsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Harakatlar tarixi</h2>
      </div>
      <MovementsClient />
    </div>
  );
}