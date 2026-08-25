import type { Metadata } from "next"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import Link from "next/link"
import { Plus, FileDown, ShoppingCart, Store, FileSpreadsheet, Settings } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Boshqaruv paneli
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Holva Factory CRM ga xush kelibsiz — Bugungi operatsion holat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs touch-friendly active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5">
              <FileDown size={15} />
              <span className="hidden xs:inline">Hisobot</span>
            </span>
          </Link>
          <Link
            href="/orders"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-violet-500/20 touch-friendly active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5">
              <Plus size={15} />
              <span className="hidden xs:inline">Yangi buyurtma</span>
              <span className="xs:hidden">Buyurtma</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Mobil Tezkor Kirish Vidjeti (4 ta icon) */}
      <div className="grid grid-cols-4 gap-2 sm:hidden animate-fade-in-up">
        {[
          { icon: ShoppingCart, label: "Buyurtma", href: "/orders", color: "text-violet-600 bg-violet-50 dark:bg-violet-950/50" },
          { icon: Store, label: "Do'konlar", href: "/stores", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
          { icon: FileSpreadsheet, label: "Hisobot", href: "/reports", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
          { icon: Settings, label: "Sozlamalar", href: "/settings", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs hover:border-violet-200 transition-all touch-friendly active:scale-95 text-center"
          >
            <div className={`p-2 rounded-xl mb-1.5 ${item.color}`}>
              <item.icon size={18} />
            </div>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200 tracking-tight">
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <DashboardStats />

      {/* Charts & Recent Orders Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
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
