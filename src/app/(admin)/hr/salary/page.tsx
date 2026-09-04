"use client"

import { useState, useEffect } from "react"
import { Banknote, Plus, Search, CheckCircle2, FileText, Download, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

const DEFAULT_SALARIES: SalaryRecord[] = []

const STORAGE_KEY = "holva_crm_stored_salaries"

function getStoredSalaries(): SalaryRecord[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveSalaries(items: SalaryRecord[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function HRSalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    base_salary: "",
    kpi_bonus: "0",
    deductions: "0",
    status: "PENDING" as "PAID" | "PENDING",
  })

  useEffect(() => {
    setSalaries(getStoredSalaries())
  }, [])

  const filtered = salaries.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.position.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.base_salary) return

    const base = Number(formData.base_salary) || 0
    const bonus = Number(formData.kpi_bonus) || 0
    const ded = Number(formData.deductions) || 0
    const total = Math.max(0, base + bonus - ded)

    let updated: SalaryRecord[]
    if (editingId) {
      updated = salaries.map((s) =>
        s.id === editingId
          ? {
              ...s,
              name: formData.name,
              position: formData.position || "Xodim",
              base_salary: base,
              kpi_bonus: bonus,
              deductions: ded,
              total_salary: total,
              status: formData.status,
              payment_date: formData.status === "PAID" ? new Date().toLocaleDateString("uz-UZ") : "Kutilmoqda",
            }
          : s
      )
      toast.success("Oylik maosh tahrirlandi")
    } else {
      const newSalary: SalaryRecord = {
        id: `sal-${Date.now()}`,
        name: formData.name,
        position: formData.position || "Xodim",
        base_salary: base,
        kpi_bonus: bonus,
        deductions: ded,
        total_salary: total,
        status: formData.status,
        payment_date: formData.status === "PAID" ? new Date().toLocaleDateString("uz-UZ") : "Kutilmoqda",
      }
      updated = [newSalary, ...salaries]
      toast.success("Oylik hisob-kitob qo'shildi")
    }

    setSalaries(updated)
    saveSalaries(updated)
    setFormData({ name: "", position: "", base_salary: "", kpi_bonus: "0", deductions: "0", status: "PENDING" })
    setEditingId(null)
    setIsOpen(false)
  }

  const handleEdit = (sal: SalaryRecord) => {
    setEditingId(sal.id)
    setFormData({
      name: sal.name,
      position: sal.position,
      base_salary: String(sal.base_salary),
      kpi_bonus: String(sal.kpi_bonus),
      deductions: String(sal.deductions),
      status: sal.status,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    const updated = salaries.filter((s) => s.id !== id)
    setSalaries(updated)
    saveSalaries(updated)
    toast.success("Yozuv o'chirildi")
  }

  const handlePay = (id: string) => {
    const updated = salaries.map((s) =>
      s.id === id ? { ...s, status: "PAID" as const, payment_date: new Date().toLocaleDateString("uz-UZ") } : s
    )
    setSalaries(updated)
    saveSalaries(updated)
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
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Yangi oylik hisob
          </Button>
          <Button onClick={() => toast.success("Oylik vedomost Excel formatda yuklab olindi")} variant="outline" className="rounded-xl gap-2">
            <Download className="h-4 w-4" /> Vedomost
          </Button>
        </div>
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
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                    Maosh yozuvlari mavjud emas
                  </td>
                </tr>
              ) : (
                filtered.map((sal) => (
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
                      <div className="flex items-center justify-end gap-1">
                        {sal.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handlePay(sal.id)}
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-8 text-xs gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> To&apos;lash
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(sal)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(sal.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val)
          if (!val) {
            setEditingId(null)
            setFormData({ name: "", position: "", base_salary: "", kpi_bonus: "0", deductions: "0", status: "PENDING" })
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Maosh yozuvini tahrirlash" : "Yangi oylik maosh hisobini kiritish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Xodim Ismi *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rustam Mahmudov"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Lavozimi</label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Bosh texnolog"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Asosiy Oklad *</label>
                <Input
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                  placeholder="5000000"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Bonus / KPI</label>
                <Input
                  type="number"
                  value={formData.kpi_bonus}
                  onChange={(e) => setFormData({ ...formData, kpi_bonus: e.target.value })}
                  placeholder="1000000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Ushlanma</label>
                <Input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">To'lov Holati</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="PENDING">Kutilmoqda</option>
                <option value="PAID">To'langan</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
