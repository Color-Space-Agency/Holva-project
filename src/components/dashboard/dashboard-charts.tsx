"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useState, useEffect } from "react"
import { isRealSupabaseConfigured, getStoredOrders } from "@/lib/mock-data"

type DateRange = "today" | "week" | "month" | "year"

interface BucketData {
  date: string
  Tushum: number
  Sotuvlar: number
}

async function fetchOrdersForCharts() {
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .neq("status", "CANCELLED")
        .order("created_at")

      if (orders && orders.length > 0) {
        return orders
      }
    } catch {
      // Fallback
    }
  }

  return getStoredOrders()
}

function processChartBuckets(range: DateRange, orders: any[]): BucketData[] {
  const now = new Date()

  if (range === "today") {
    const todayStr = now.toISOString().split("T")[0]
    const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
    const buckets: Record<string, { revenue: number; orders: number }> = {}
    hours.forEach((h) => (buckets[h] = { revenue: 0, orders: 0 }))

    orders.forEach((o) => {
      const oDate = o.created_at || new Date().toISOString()
      if (oDate.startsWith(todayStr)) {
        const d = new Date(oDate)
        const hour = d.getHours()
        let bKey = "20:00"
        if (hour < 9) bKey = "08:00"
        else if (hour < 11) bKey = "10:00"
        else if (hour < 13) bKey = "12:00"
        else if (hour < 15) bKey = "14:00"
        else if (hour < 17) bKey = "16:00"
        else if (hour < 19) bKey = "18:00"

        buckets[bKey].revenue += o.total_amount || 0
        buckets[bKey].orders += 1
      }
    })

    return hours.map((h) => ({
      date: h,
      Tushum: buckets[h].revenue,
      Sotuvlar: buckets[h].orders,
    }))
  }

  if (range === "week") {
    const weekDaysUz = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"]
    const result: BucketData[] = []
    const dayMap: Record<string, { revenue: number; orders: number; label: string }> = {}

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const label = `${weekDaysUz[d.getDay()]} (${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")})`
      dayMap[dateStr] = { revenue: 0, orders: 0, label }
    }

    orders.forEach((o) => {
      const dateStr = (o.created_at || new Date().toISOString()).split("T")[0]
      if (dayMap[dateStr]) {
        dayMap[dateStr].revenue += o.total_amount || 0
        dayMap[dateStr].orders += 1
      }
    })

    Object.values(dayMap).forEach((val) => {
      result.push({
        date: val.label,
        Tushum: val.revenue,
        Sotuvlar: val.orders,
      })
    })

    return result
  }

  if (range === "month") {
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const dayMap: Record<string, { revenue: number; orders: number; label: string }> = {}

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const label = `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}`
      dayMap[dateStr] = { revenue: 0, orders: 0, label }
    }

    orders.forEach((o) => {
      const dateStr = (o.created_at || new Date().toISOString()).split("T")[0]
      if (dayMap[dateStr]) {
        dayMap[dateStr].revenue += o.total_amount || 0
        dayMap[dateStr].orders += 1
      }
    })

    return Object.values(dayMap).map((val) => ({
      date: val.label,
      Tushum: val.revenue,
      Sotuvlar: val.orders,
    }))
  }

  if (range === "year") {
    const monthNamesUz = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"]
    const year = now.getFullYear()
    const monthMap: Record<number, { revenue: number; orders: number }> = {}

    for (let m = 0; m < 12; m++) {
      monthMap[m] = { revenue: 0, orders: 0 }
    }

    orders.forEach((o) => {
      const d = new Date(o.created_at || new Date().toISOString())
      if (d.getFullYear() === year) {
        const m = d.getMonth()
        monthMap[m].revenue += o.total_amount || 0
        monthMap[m].orders += 1
      }
    })

    return monthNamesUz.map((name, index) => ({
      date: name,
      Tushum: monthMap[index].revenue,
      Sotuvlar: monthMap[index].orders,
    }))
  }

  return []
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
  )
}

export function DashboardCharts() {
  const [range, setRange] = useState<DateRange>("month")

  const { data: allOrders = [], isLoading, refetch } = useQuery({
    queryKey: ["dashboard-orders-raw"],
    queryFn: fetchOrdersForCharts,
    refetchInterval: 5000,
  })

  useEffect(() => {
    const handleUpdate = () => refetch()
    window.addEventListener("orders-updated", handleUpdate)
    return () => window.removeEventListener("orders-updated", handleUpdate)
  }, [refetch])

  const chartData = processChartBuckets(range, allOrders)

  const ranges: { key: DateRange; label: string }[] = [
    { key: "today", label: "Bugun" },
    { key: "week", label: "Hafta" },
    { key: "month", label: "Oy" },
    { key: "year", label: "Yil" },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Sotuv trendi</h3>
          <p className="text-xs text-gray-400 mt-0.5">Tushum va Sotuvlar dinamikasi</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 self-start sm:self-auto overflow-x-auto">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : chartData.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          Bu davr uchun ma'lumot yo'q
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-500 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-500 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
                if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
                return String(v)
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-gray-500 dark:text-gray-400"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg, #fff)",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => {
                if (name === "Tushum") return [formatCurrency(value), name]
                return [value, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Tushum"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#7c3aed" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Sotuvlar"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
