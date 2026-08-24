"use client"

import { useState } from "react"
import { TrendingUp, Search, Award, Star, CheckCircle, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils"

interface WorkerKPI {
  id: string
  name: string
  department: string
  role: string
  target_output: number
  actual_output: number
  unit: string
  score: number // percentage
  rank: number
}

const DEFAULT_KPIS: WorkerKPI[] = [
  {
    id: "kpi-1",
    name: "Rustam Mahmudov",
    department: "Ishlab chiqarish",
    role: "Bosh texnolog",
    target_output: 12000,
    actual_output: 13400,
    unit: "kg",
    score: 111,
    rank: 1,
  },
  {
    id: "kpi-2",
    name: "Sardor Rahimov",
    department: "Sotuv bo'limi",
    role: "Katta agent",
    target_output: 80000000,
    actual_output: 94500000,
    unit: "so'm",
    score: 118,
    rank: 2,
  },
  {
    id: "kpi-3",
    name: "Jamshid Qodirov",
    department: "Sotuv bo'limi",
    role: "Sotuv agenti",
    target_output: 60000000,
    actual_output: 62100000,
    unit: "so'm",
    score: 103,
    rank: 3,
  },
  {
    id: "kpi-4",
    name: "Otabek Saidov",
    department: "Ishlab chiqarish",
    role: "Qandolatchi usta",
    target_output: 8000,
    actual_output: 7800,
    unit: "kg",
    score: 97,
    rank: 4,
  },
  {
    id: "kpi-5",
    name: "Shavkat Ergashev",
    department: "Logistika",
    role: "Haydovchi",
    target_output: 45,
    actual_output: 44,
    unit: "reys",
    score: 98,
    rank: 5,
  },
]

export default function HRPerformancePage() {
  const [search, setSearch] = useState("")

  const filtered = DEFAULT_KPIS.filter((k) =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-violet-600" />
          Ishchilar Samaradorligi (KPI & Reyting)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ishlab chiqarish va sotuv bo&apos;yicha xodimlarning oylik ko&apos;rsatkichlari
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg shadow-violet-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-100">Eng yaxshi sotuvchi</span>
            <Flame className="h-5 w-5 text-amber-300 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold">Sardor Rahimov</h3>
          <p className="text-xs text-violet-100">94.5 mln so&apos;m savdo (+18% rejadan ortiq)</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Ishlab chiqarish ustasi</span>
            <Award className="h-5 w-5 text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold">Rustam Mahmudov</h3>
          <p className="text-xs text-emerald-100">13,400 kg tayyor mahsulot (111% samaradorlik)</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">O&apos;rtacha jamoa KPI</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">105.4%</h3>
          <p className="text-xs text-emerald-600 font-medium">Barcha bo&apos;limlar bo&apos;yicha reja bajarilmoqda</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Xodim yoki bo'lim bo'yicha qidirish..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">O&apos;rin</th>
                <th className="px-5 py-3.5 font-semibold">Xodim</th>
                <th className="px-5 py-3.5 font-semibold">Bo&apos;lim & Lavozim</th>
                <th className="px-5 py-3.5 font-semibold">Reja</th>
                <th className="px-5 py-3.5 font-semibold">Amalda</th>
                <th className="px-5 py-3.5 font-semibold">Bajarilish (% Progress)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-violet-600">#{kpi.rank}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{kpi.name}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    <div>{kpi.department}</div>
                    <div className="text-gray-400">{kpi.role}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-500">
                    {formatNumber(kpi.target_output)} {kpi.unit}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white text-sm">
                    {formatNumber(kpi.actual_output)} {kpi.unit}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3 w-48">
                      <Progress value={Math.min(kpi.score, 100)} className="h-2" />
                      <span className={`text-xs font-bold ${kpi.score >= 100 ? "text-emerald-600" : "text-amber-600"}`}>
                        {kpi.score}%
                      </span>
                    </div>
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
