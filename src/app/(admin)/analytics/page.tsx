"use client"

import { useState, useMemo, useEffect } from "react"
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, Users, ArrowUpRight, Calendar } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { getStoredOrders, getStoredStores, getStoredProducts } from "@/lib/mock-data"
import { BackButton } from "@/components/shared/back-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"]

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const orders = useMemo(() => getStoredOrders(), [])
  const stores = useMemo(() => getStoredStores(), [])

  // Key KPI metrics
  const totalSales = useMemo(() => orders.reduce((sum, o) => sum + (o.total_amount || 0), 0), [orders])
  const totalPaid = useMemo(() => orders.reduce((sum, o) => sum + (o.paid_amount || 0), 0), [orders])
  const totalDebt = useMemo(() => Math.max(0, totalSales - totalPaid), [totalSales, totalPaid])
  const activeStoresCount = stores.length

  // Monthly Sales & Expense trend calculation
  const chartData = useMemo(() => {
    const monthMap: Record<string, { Sotuv: number; Foyda: number; Xarajat: number }> = {}

    // Pre-fill last 4 months
    const now = new Date()
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mName = d.toLocaleString("uz-UZ", { month: "short" })
      monthMap[mName] = { Sotuv: 0, Foyda: 0, Xarajat: 0 }
    }

    orders.forEach((o) => {
      const d = o.created_at ? new Date(o.created_at) : new Date()
      const mName = d.toLocaleString("uz-UZ", { month: "short" })
      if (!monthMap[mName]) {
        monthMap[mName] = { Sotuv: 0, Foyda: 0, Xarajat: 0 }
      }
      monthMap[mName].Sotuv += o.total_amount || 0
      monthMap[mName].Foyda += o.paid_amount || 0
    })

    return Object.entries(monthMap).map(([month, vals]) => ({
      month,
      Sotuv: vals.Sotuv,
      Foyda: vals.Foyda,
      Xarajat: Math.round(vals.Sotuv * 0.4),
    }))
  }, [orders])

  // Top Products breakdown calculation
  const topProducts = useMemo(() => {
    const prodMap: Record<string, number> = {}
    const list: any[] = orders || []
    list.forEach((o: any) => {
      const items = o.order_items || o.items || []
      if (items.length > 0) {
        items.forEach((item: any) => {
          const name = item.products?.name || item.product_name || "Samarqand Holvasi"
          const total = item.total_price || (item.quantity || 1) * (item.price || item.unit_price || 0)
          prodMap[name] = (prodMap[name] || 0) + total
        })
      } else {
        const fallbackName = "Kunjutli Premium Holva"
        prodMap[fallbackName] = (prodMap[fallbackName] || 0) + (o.total_amount || 0)
      }
    })

    const result = Object.entries(prodMap).map(([name, value]) => ({
      name: name.length > 18 ? name.slice(0, 18) + "..." : name,
      value: Math.round(value),
    }))

    if (result.length === 0) {
      return [
        { name: "Kunjutli Premium", value: 45 },
        { name: "Shokoladli Holva", value: 30 },
        { name: "Bodomli Samarqand", value: 25 },
      ]
    }

    return result.sort((a, b) => b.value - a.value).slice(0, 5)
  }, [orders])

  if (!mounted) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-amber-600" />
              Biznes Analitika & Savdo Tahlili
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Oylik savdo dinamikasi, mijozlar qarzdorligi va sotuv ulushi tahlili
            </p>
          </div>
        </div>

        <div className="w-48">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <Calendar className="w-4 h-4 mr-2 text-amber-600" />
              <SelectValue placeholder="Davrni tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha davr</SelectItem>
              <SelectItem value="this_month">Ushbu oy</SelectItem>
              <SelectItem value="last_month">O'tgan oy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Sotuv Summasi</span>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(totalSales)}</h3>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="h-3.5 w-3.5" /> Savdo balansi
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tushgan To'lovlar</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</h3>
          <p className="text-xs text-gray-400">Kassaga tushgan naqd/karta</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Jami Nasiya (Qarz)</span>
          <h3 className="text-2xl font-black text-red-600 dark:text-red-400">{formatCurrency(totalDebt)}</h3>
          <p className="text-xs text-red-500 font-medium">Kutilayotgan tushum</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Do'konlar Soni</span>
          <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{activeStoresCount} ta</h3>
          <p className="text-xs text-gray-400">Faol hamkor do'konlar</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Oylik Sotuv va Tushum Dinamikasi</h3>
            <span className="text-xs text-gray-400 font-medium">So'm hisobida</span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val) || 0), "Summa"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="Sotuv" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Sotuv Hujjati" />
                <Bar dataKey="Foyda" fill="#10b981" radius={[6, 6, 0, 0]} name="Tushgan To'lov" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Share Pie Chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Top Mahsulotlar Ulushi</h3>
          <div className="h-[320px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatCurrency(Number(val) || 0)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
