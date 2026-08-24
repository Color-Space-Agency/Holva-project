"use client"

import { useState } from "react"
import { Banknote, Plus, Search, CheckCircle2, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface SalaryRecord {
  id: string
  name: string
  position: string
  base_salary: number
  kpi_bonus: number
  deductions: number
  total_salary: number
  status: "PAID" | "PENDING"
  payment_date: string
}

const DEFAULT_SALARIES: SalaryRecord[] = [
  {
    id: "sal-1",
    name: "Rustam Mahmudov",
    position: "Bosh texnolog",
    base_salary: 9500000,
    kpi_bonus: 1500000,
    deductions: 0,
    total_salary: 11000000,
    status: "PAID",
    payment_date: "10.08.2026",
  },
  {
    id: "sal-2",
    name: "Sardor Rahimov",
    position: "Katta sotuv agenti",
    base_salary: 5000000,
    kpi_bonus: 4725000, // 5% komissiya
    deductions: 0,
    total_salary: 9725000,
    status: "PAID",
    payment_date: "10.08.2026",
  },
  {
    id: "sal-3",
    name: "Jamshid Qodirov",
    position: "Sotuv agenti",
    base_salary: 4500000,
    kpi_bonus: 3105000,
    deductions: 0,
    total_salary: 7605000,
    status: "PAID",
    payment_date: "10.08.2026",
  },
  {
    id: "sal-4",
    name: "Nodira Karimova",
    position: "Bosh hisobchi",
    base_salary: 8000000,
    kpi_bonus: 800000,
    deductions: 0,
    total_salary: 8800000,
    status: "PENDING",
    payment_date: "Kutilmoqda",
  },
  {
    id: "sal-5",
    name: "Shavkat Ergashev",
    position: "Haydovchi",
    base_salary: 5500000,
    kpi_bonus: 500000,
    deductions: 200000, // Yoqilg'i me'yordan ortiq
    total_salary: 5800000,
    status: "PENDING",
    payment_date: "Kutilmoqda",
  },
]

export default function HRSalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>(DEFAULT_SALARIES)
  const [search, setSearch] = useState("")

  const filtered = salaries.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.position.toLowerCase().includes(search.toLowerCase())
  )

  const handlePay = (id: string) => {
    setSalaries(
      salaries.map((s) =>
        s.id === id ? { ...s, status: "PAID", payment_date: new Date().toLocaleDateString("uz-UZ") } : s
      )
    )
    toast.success("Ish haqi to'langan deb belgilandi")
  }

  const totalFund = salaries.reduce((sum, s) => sum + s.total_salary, 0)
  const paidFund = salaries.filter((s) => s.status === "PAID").reduce((sum, s) => sum + s.total_salary, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Banknote className="h-7 w-7 text-violet-600" />
            Ish Haqini Hisoblash & To&apos;lovlar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xodimlarning oylik maoshlari, bonuslar va ushlanmalar balansi
          </p>
        </div>
        <Button onClick={() => toast.success("Oylik vedomost Excel formatda yuklab olindi")} variant="outline" className="rounded-xl gap-2">
          <Download className="h-4 w-4" /> Vedomostni yuklash
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Jami Oylik Ish Haqi Jamg&apos;armasi</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalFund)}</h3>
          <p className="text-xs text-gray-400">Jami {salaries.length} nafar xodim uchun</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">To&apos;langan Miqdor</span>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(paidFund)}</h3>
          <p className="text-xs text-amber-500 font-medium">To&apos;lanishi kerak: {formatCurrency(totalFund - paidFund)}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Xodim yoki lavozim bo'yicha qidirish..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Xodim</th>
                <th className="px-5 py-3.5 font-semibold">Asosiy Oklad</th>
                <th className="px-5 py-3.5 font-semibold">Bonus / KPI</th>
                <th className="px-5 py-3.5 font-semibold">Ushlanma</th>
                <th className="px-5 py-3.5 font-semibold">Jami To&apos;lanadigan</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((sal) => (
                <tr key={sal.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    <div>{sal.name}</div>
                    <div className="text-xs text-gray-400 font-normal">{sal.position}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {formatCurrency(sal.base_salary)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-emerald-600">
                    +{formatCurrency(sal.kpi_bonus)}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-red-500">
                    {sal.deductions > 0 ? `-${formatCurrency(sal.deductions)}` : "—"}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white text-base">
                    {formatCurrency(sal.total_salary)}
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      className={
                        sal.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }
                    >
                      {sal.status === "PAID" ? "To'langan" : "Kutilmoqda"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {sal.status === "PENDING" ? (
                      <Button
                        size="sm"
                        onClick={() => handlePay(sal.id)}
                        className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-8 text-xs gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> To&apos;lash
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">{sal.payment_date}</span>
                    )}
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
