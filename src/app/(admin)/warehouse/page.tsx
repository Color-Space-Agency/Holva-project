import { WarehouseClient } from "@/components/warehouse/warehouse-client";
import { BackButton } from "@/components/shared/back-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ombor",
};

export default function WarehousePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h2 className="text-3xl font-bold tracking-tight">Ombor (Inventar)</h2>
      </div>
      <WarehouseClient />
    </div>
  );
}