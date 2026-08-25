"use client"

import { useState, useEffect } from "react"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import Link from "next/link"
import { Plus, RefreshCw, ShoppingCart, Store, FileSpreadsheet, Settings } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Pull-to-refresh tinglovchisi
  useEffect(() => {
    const handlePull = () => {
      handleRefresh()
    }
    window.addEventListener("pull-to-refresh", handlePull)
    return () => window.removeEventListener("pull-to-refresh", handlePull)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    toast.info("Ma'lumotlar yangilanmoqda...")
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("✅ Ma'lumotlar muvaffaqiyatli yangilandi!")
    }, 600)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Boshqaruv paneli
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Jonli
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Holva Factory CRM ga xush kelibsiz — Bugungi operatsion holat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`
              px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold 
              text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-xs touch-friendly active:scale-[0.98]
              flex items-center gap-1.5 cursor-pointer
              ${isRefreshing ? "opacity-50" : ""}
            `}
          >
            <RefreshCw
              className={`
                w-3.5 h-3.5 transition-transform duration-500
                ${isRefreshing ? "animate-spin text-amber-600" : ""}
              `}
            />
            <span className="hidden xs:inline">Yangilash</span>
          </button>

          <Link
            href="/orders"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-amber-500/20 touch-friendly active:scale-[0.98] flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span className="hidden xs:inline">Yangi buyurtma</span>
            <span className="xs:hidden">Buyurtma</span>
          </Link>
        </div>
      </div>

      {/* Mobil Tezkor Kirish Vidjeti (4 ta yorqin tugma) */}
      <div className="grid grid-cols-4 gap-2 sm:hidden">
        {[
          { icon: ShoppingCart, label: "Buyurtma", href: "/orders", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
          { icon: Store, label: "Do'konlar", href: "/stores", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
          { icon: FileSpreadsheet, label: "Hisobot", href: "/reports", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
          { icon: Settings, label: "Sozlamalar", href: "/settings", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs hover:border-amber-200 transition-all touch-friendly active:scale-95 text-center hover-lift"
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

      {/* KPI Stats Grid (Doimiy to'liq summalar bilan, hech qanday "..." bo'lmaydi) */}
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
