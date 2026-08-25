import type { Metadata } from "next"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import Link from "next/link"
import { Plus, FileDown } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Holva Factory CRM — Bugungi operatsion holat va asosiy ko&apos;rsatkichlar
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs"
          >
            <FileDown size={15} />
            <span>Hisobot yuklash</span>
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-violet-500/20"
          >
            <Plus size={15} />
            <span>Yangi buyurtma</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <DashboardStats />

      {/* Charts & Recent Orders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div className="xl:col-span-1">
          <RecentOrders />
        </div>
      </div>
    </div>
  )
}
