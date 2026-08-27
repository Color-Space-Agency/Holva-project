"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatNumber } from "@/lib/utils"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Factory,
  Truck,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isRealSupabaseConfigured, getStoredOrders, getStoredProducts, getStoredEmployees, syncOrdersFromServer } from "@/lib/mock-data"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
  bgColor: string
  change?: string
  trend?: "up" | "down"
  subtitle?: string
  delayClass?: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  trend = "up",
  subtitle,
  delayClass = "",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm card-hover animate-fade-in-up flex flex-col justify-between",
        delayClass
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1.5 text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
            {value}
          </p>
        </div>
        <div className={cn("p-3 rounded-2xl flex-shrink-0 shadow-xs", bgColor)}>
          <Icon size={20} className={color} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800/60 text-[11px]">
        {change && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
              trend === "up"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50"
            )}
          >
            {trend === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
        )}
        <span className="text-gray-400 truncate">
          {subtitle || "o'tgan oyga nisbatan"}
        </span>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 skeleton h-32">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-28" />
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  )
}

async function fetchStats() {
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const [
        ordersRes,
        productsRes,
        attendanceRes,
        deliveriesRes,
        batchesRes,
        storesRes,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("total_amount, status")
          .gte("created_at", today),
        supabase.from("products").select("id", { count: "exact" }).eq("status", "ACTIVE"),
        supabase.from("employee_attendance").select("status").eq("date", today),
        supabase
          .from("deliveries")
          .select("id", { count: "exact" })
          .in("status", ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"]),
        supabase
          .from("production_batches")
          .select("actual_quantity")
          .gte("production_date", today),
        supabase.from("stores").select("current_balance"),
      ])

      const todayOrders = ordersRes.data?.length ?? 24
      const todayRevenue =
        ordersRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) ?? 128500000
      const totalProducts = productsRes.count ?? 12
      const presentEmployees =
        attendanceRes.data?.filter((a) => a.status === "PRESENT").length ?? 18
      const absentEmployees =
        attendanceRes.data?.filter((a) => a.status === "ABSENT_UNEXCUSED" || a.status === "ABSENT_EXCUSED").length ?? 2
      const pendingDeliveries = deliveriesRes.count ?? 4
      const producedKg =
        batchesRes.data?.reduce((sum, b) => sum + (b.actual_quantity || 0), 0) ?? 4200
      const totalDebt =
        storesRes.data
          ?.filter((s) => (s.current_balance || 0) < 0)
          .reduce((sum, s) => sum + Math.abs(s.current_balance || 0), 0) ?? 14200000

      return {
        todayOrders,
        todayRevenue,
        totalProducts,
        presentEmployees,
        absentEmployees,
        pendingDeliveries,
        producedKg,
        totalDebt,
      }
    } catch {
      // Fallback
    }
  }

  // Stored live sync state
  const storedOrders = getStoredOrders()
  const storedProducts = getStoredProducts()
  const storedEmployees = getStoredEmployees()

  const todayOrders = storedOrders.length || 24
  const totalPaid = storedOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0)
  const todayRevenue = totalPaid > 0 ? (120000000 + totalPaid) : 128500000
  const totalDebt = storedOrders.reduce((sum, o) => sum + Math.max(0, o.total_amount - (o.paid_amount || 0)), 0)

  return {
    todayOrders,
    todayRevenue,
    totalProducts: storedProducts.length || 12,
    presentEmployees: storedEmployees.filter((e) => e.employment_status === "ACTIVE").length || 18,
    absentEmployees: 2,
    pendingDeliveries: 4,
    producedKg: 4200,
    totalDebt: totalDebt || 14200000,
  }
}

export function DashboardStats() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  })

  // Real-time synchronization (Cross-device)
  useEffect(() => {
    const handleSync = () => {
      refetch()
    }
    window.addEventListener("orders-updated", handleSync)
    window.addEventListener("storage", handleSync)

    const interval = setInterval(() => {
      syncOrdersFromServer().then(() => refetch())
    }, 3000)

    return () => {
      window.removeEventListener("orders-updated", handleSync)
      window.removeEventListener("storage", handleSync)
      clearInterval(interval)
    }
  }, [refetch])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const stats: StatCardProps[] = [
    {
      title: "Bugungi buyurtmalar",
      value: `${data?.todayOrders ?? 24} ta`,
      icon: ShoppingCart,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      change: "+12%",
      trend: "up",
      subtitle: "bugungi jami",
      delayClass: "delay-100",
    },
    {
      title: "Oylik tushum",
      value: "128.5 mln so'm",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      change: "+8.2%",
      trend: "up",
      subtitle: "o'tgan oyga nisbatan",
      delayClass: "delay-200",
    },
    {
      title: "Bugungi ishlab chiqarish",
      value: `${formatNumber(data?.producedKg ?? 4200)} kg`,
      icon: Factory,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      change: "+5.0%",
      trend: "up",
      subtitle: "rejaga nisbatan",
      delayClass: "delay-300",
    },
    {
      title: "Faol mahsulotlar",
      value: `${data?.totalProducts ?? 12} xil`,
      icon: Package,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/40",
      change: "+2 xil",
      trend: "up",
      subtitle: "sotuvdagi turlar",
      delayClass: "delay-400",
    },
    {
      title: "Kutayotgan yetkazmalar",
      value: `${data?.pendingDeliveries ?? 4} ta`,
      icon: Truck,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
      subtitle: "yo'ldagi va rejadagi",
    },
    {
      title: "Kelgan ishchilar",
      value: `${data?.presentEmployees ?? 18} nafar`,
      icon: UserCheck,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      subtitle: "bugun smenada",
    },
    {
      title: "Kelmagan ishchilar",
      value: `${data?.absentEmployees ?? 2} nafar`,
      icon: UserX,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      subtitle: "sababli / ruxsatli",
    },
    {
      title: "Do'konlar qarzdorligi",
      value: "14.2 mln so'm",
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/40",
      subtitle: "umumiy kutilayotgan",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )
}
