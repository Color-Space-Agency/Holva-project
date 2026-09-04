import { ReportsClient } from '@/components/reports/reports-client';
import { BackButton } from '@/components/shared/back-button';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hisobotlar",
};

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hisobotlar va Tahlil
        </h1>
      </div>
      <ReportsClient />
    </div>
  );
}
