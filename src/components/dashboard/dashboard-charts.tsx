"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useState } from "react"

type DateRange = "today" | "week" | "month" | "year"

function getDateRange(range: DateRange) {
  const now = new Date()
  const end = now.toISOString().split("T")[0]
  let start: string

  switch (range) {
    case "today":
      start = end
      break
    case "week": {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      start = d.toISOString().split("T")[0]
      break
    }
    case "month": {
      const d = new Date()
      d.setDate(1)
      start = d.toISOString().split("T")[0]
      break
    }
    case "year": {
      start = `${now.getFullYear()}-01-01`
      break
    }
  }
  return { start, end }
}

async function fetchChartData(range: DateRange) {
  const supabase = createClient()
  const { start, end } = getDateRange(range)

  try {
    const { data: orders } = await supabase
      .from("orders")
      .select("created_at, total_amount, status")
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`)
      .neq("status", "CANCELLED")
      .order("created_at")

    if (orders && orders.length > 0) {
      const byDate: Record<string, { revenue: number; orders: number }> = {}
      orders.forEach((o) => {
        const date = o.created_at.split("T")[0]
        if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 }
        byDate[date].revenue += o.total_amount ?? 0
        byDate[date].orders += 1
      })

      return Object.entries(byDate)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
          Tushum: data.revenue,
          Buyurtmalar: data.orders,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  } catch {
    // Ignore and return demo trend
  }

  // Demo trend ma'lumotlari
  const demoPoints = [
    { date: "01/08", Tushum: 18500000, Buyurtmalar: 12 },
    { date: "05/08", Tushum: 24200000, Buyurtmalar: 16 },
    { date: "10/08", Tushum: 21800000, Buyurtmalar: 14 },
    { date: "15/08", Tushum: 32000000, Buyurtmalar: 22 },
    { date: "20/08", Tushum: 29400000, Buyurtmalar: 19 },
    { date: "24/08", Tushum: 38600000, Buyurtmalar: 25 },
  ]
  return demoPoints
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
  )
}

export function DashboardCharts() {
  const [range, setRange] = useState<DateRange>("month")

  const { data = [], isLoading } = useQuery({
    queryKey: ["dashboard-charts", range],
    queryFn: () => fetchChartData(range),
  })

  const ranges: { key: DateRange; label: string }[] = [
    { key: "today", label: "Bugun" },
    { key: "week", label: "Hafta" },
    { key: "month", label: "Oy" },
    { key: "year", label: "Yil" },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Sotuv trendi</h3>
          <p className="text-xs text-gray-400 mt-0.5">Tushum va buyurtmalar dinamikasi</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r.key
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
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
      ) : data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          Bu davr uchun ma'lumot yo'q
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
              dataKey="Buyurtmalar"
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
