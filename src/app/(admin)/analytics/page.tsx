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

const SALES_BY_MONTH = [
  { month: "Mart", Sotuv: 42000000, Xarajat: 24000000, Foyda: 18000000 },
  { month: "Aprel", Sotuv: 55000000, Xarajat: 31000000, Foyda: 24000000 },
  { month: "May", Sotuv: 68000000, Xarajat: 38000000, Foyda: 30000000 },
  { month: "Iyun", Sotuv: 74000000, Xarajat: 41000000, Foyda: 33000000 },
  { month: "Iyul", Sotuv: 89000000, Xarajat: 49000000, Foyda: 40000000 },
  { month: "Avgust", Sotuv: 98500000, Xarajat: 52000000, Foyda: 46500000 },
]

const TOP_PRODUCTS = [
  { name: "Kunjutli Premium", value: 38 },
  { name: "Shokoladli Yong'oq", value: 27 },
  { name: "Samarqand Pista", value: 19 },
  { name: "Kungaboqar Klassik", value: 16 },
]

const COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6"]

export default function AnalyticsPage() {
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
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(98500000)}</h3>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> +10.7% o&apos;tgan oyga nisbatan
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Sof Foyda</span>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(46500000)}</h3>
          <p className="text-xs text-gray-400">Marja: 47.2%</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Ishlab chiqarildi</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">18,400 kg</h3>
          <p className="text-xs text-emerald-600 font-medium">Reja 108% bajarildi</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Faol Hamkor Do&apos;konlar</span>
          <h3 className="text-2xl font-bold text-violet-600">42 ta</h3>
          <p className="text-xs text-gray-400">+5 ta yangi do&apos;kon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sotuv va Foyda Grafigi */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">Oylik Sotuv, Xarajat va Foyda Trendi</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_BY_MONTH}>
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
                  data={TOP_PRODUCTS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {TOP_PRODUCTS.map((entry, index) => (
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
