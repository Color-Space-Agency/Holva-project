"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, Users, ArrowUpRight } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { getStoredOrders, getStoredStores } from "@/lib/mock-data"

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6"]

export default function AnalyticsPage() {
  const orders = getStoredOrders()
  const stores = getStoredStores()

  const totalSales = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const totalPaid = orders.reduce((sum, o) => sum + (o.paid_amount || 0), 0)
  const activeStoresCount = stores.length

  const chartData = orders.length > 0 ? [
    { month: "Joriy davr", Sotuv: totalSales, Xarajat: 0, Foyda: totalPaid }
  ] : []

  const topProducts: any[] = []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-violet-600" />
          Biznes Analitika & Savdo Tahlili
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Oylik dinamika, daromadlilik va eng ko&apos;p sotilayotgan mahsulotlar ulushi
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Jami Oylik Savdo</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSales)}</h3>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> Real statistika
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Qabul Qilingan To'lov</span>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</h3>
          <p className="text-xs text-gray-400">Jami tushum</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Jami Buyurtmalar</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(orders.length)} ta</h3>
          <p className="text-xs text-emerald-600 font-medium">Barcha buyurtmalar</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Faol Hamkor Do&apos;konlar</span>
          <h3 className="text-2xl font-bold text-violet-600">{activeStoresCount} ta</h3>
          <p className="text-xs text-gray-400">Ro'yxatdan o'tgan do'konlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sotuv va Foyda Grafigi */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Oylik Sotuv, Xarajat va Foyda Trendi</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="Sotuv" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Xarajat" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Foyda" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Mahsulotlar Ulushi */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Top Holva Turlari Ulushi (%)</h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
