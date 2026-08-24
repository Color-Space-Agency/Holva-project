import { SettingsClient } from "@/components/settings/settings-client";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sozlamalar</h2>
      </div>
      <SettingsClient />
    </div>
  );
}