"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, ArrowUpRight, Calendar, Store, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface IncomeItem {
  id: string
  source: string
  store_name: string
  amount: number
  payment_method: string
  date: string
  status: "Qabul qilindi" | "Kutilmoqda"
}

const DEFAULT_INCOMES: IncomeItem[] = [
  {
    id: "inc-1",
    source: "Sotuv to'lovi",
    store_name: "Korzinka — Chilonzor filiali",
    amount: 14800000,
    payment_method: "Bank o'tkazmasi",
    date: "24.08.2026",
    status: "Qabul qilindi",
  },
  {
    id: "inc-2",
    source: "Sotuv to'lovi",
    store_name: "Makro Supermarket",
    amount: 9200000,
    payment_method: "Bank o'tkazmasi",
    date: "24.08.2026",
    status: "Qabul qilindi",
  },
  {
    id: "inc-3",
    source: "Qisman to'lov",
    store_name: "Havas Discounter",
    amount: 7300000,
    payment_method: "Bank o'tkazmasi",
    date: "23.08.2026",
    status: "Qabul qilindi",
  },
  {
    id: "inc-4",
    source: "To'liq to'lov",
    store_name: "Shirin Dunyo Savdo Markazi",
    amount: 18400000,
    payment_method: "Naqd pul",
    date: "22.08.2026",
    status: "Qabul qilindi",
  },
  {
    id: "inc-5",
    source: "Ulgurji sotuv",
    store_name: "Andijon Qandolat MCHJ",
    amount: 32000000,
    payment_method: "Bank o'tkazmasi",
    date: "20.08.2026",
    status: "Qabul qilindi",
  },
]

export default function FinanceIncomePage() {
  const [incomes] = useState<IncomeItem[]>(DEFAULT_INCOMES)
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-emerald-600" />
            Daromadlar & Sotuv Tushumlari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Barcha do&apos;konlar va mijozlardan kelib tushgan tushumlar tahlili
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Jami Oylik Tushum</span>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</h3>
          <p className="text-xs text-gray-400">Joriy oy hisobi</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">O&apos;rtacha Chek Qiymati</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome / incomes.length)}</h3>
          <p className="text-xs text-emerald-600 font-medium">+14% o&apos;tgan oyga nisbatan</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 space-y-1 shadow-lg shadow-emerald-500/20">
          <span className="text-xs font-semibold uppercase text-emerald-100">Sof Foyda Marjasi</span>
          <h3 className="text-2xl font-bold">~38.5%</h3>
          <p className="text-xs text-emerald-100">Xomashyo va xarajatlar chiqarilgandan so&apos;ng</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white text-base">
          Tushumlar Tarixi
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sana</th>
                <th className="px-5 py-3.5 font-semibold">Mijoz / Do&apos;kon</th>
                <th className="px-5 py-3.5 font-semibold">Tushum Manbai</th>
                <th className="px-5 py-3.5 font-semibold">To&apos;lov Usuli</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{inc.date}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-violet-500" />
                    {inc.store_name}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{inc.source}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{inc.payment_method}</td>
                  <td className="px-5 py-4">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {inc.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-bold text-right text-emerald-600 text-base">
                    +{formatCurrency(inc.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
