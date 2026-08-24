import type { Metadata } from "next"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bugungi holat va statistika
        </p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts */}
      <DashboardCharts />
    </div>
  )
}
