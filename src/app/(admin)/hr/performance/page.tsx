"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Search, Award, Star, CheckCircle, Flame, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
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

const DEFAULT_KPIS: WorkerKPI[] = []

const STORAGE_KEY = "holva_crm_stored_kpis"

function getStoredKPIs(): WorkerKPI[] {
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

function saveKPIs(items: WorkerKPI[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function HRPerformancePage() {
  const [kpis, setKpis] = useState<WorkerKPI[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "",
    target_output: "",
    actual_output: "",
    unit: "kg",
  })

  useEffect(() => {
    setKpis(getStoredKPIs())
  }, [])

  const filtered = kpis.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.target_output || !formData.actual_output) return

    const target = Number(formData.target_output) || 1
    const actual = Number(formData.actual_output) || 0
    const score = Math.round((actual / target) * 100)

    let updated: WorkerKPI[]
    if (editingId) {
      updated = kpis.map((k) =>
        k.id === editingId
          ? {
              ...k,
              name: formData.name,
              department: formData.department || "Boshqa",
              role: formData.role || "Xodim",
              target_output: target,
              actual_output: actual,
              unit: formData.unit,
              score,
            }
          : k
      )
      toast.success("KPI yozuvi tahrirlandi")
    } else {
      const newKpi: WorkerKPI = {
        id: `kpi-${Date.now()}`,
        name: formData.name,
        department: formData.department || "Boshqa",
        role: formData.role || "Xodim",
        target_output: target,
        actual_output: actual,
        unit: formData.unit,
        score,
        rank: kpis.length + 1,
      }
      updated = [newKpi, ...kpis]
      toast.success("KPI yozuvi qo'shildi")
    }

    // Re-rank based on score descending
    updated = updated
      .sort((a, b) => b.score - a.score)
      .map((k, idx) => ({ ...k, rank: idx + 1 }))

    setKpis(updated)
    saveKPIs(updated)
    setFormData({ name: "", department: "", role: "", target_output: "", actual_output: "", unit: "kg" })
    setEditingId(null)
    setIsOpen(false)
  }

  const handleEdit = (kpi: WorkerKPI) => {
    setEditingId(kpi.id)
    setFormData({
      name: kpi.name,
      department: kpi.department,
      role: kpi.role,
      target_output: String(kpi.target_output),
      actual_output: String(kpi.actual_output),
      unit: kpi.unit,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    const updated = kpis
      .filter((k) => k.id !== id)
      .map((k, idx) => ({ ...k, rank: idx + 1 }))
    setKpis(updated)
    saveKPIs(updated)
    toast.success("KPI yozuvi o'chirildi")
  }

  const topSeller = kpis.find((k) => k.department.toLowerCase().includes("sotuv") || k.unit.toLowerCase().includes("so'm"))
  const topProducer = kpis.find((k) => k.department.toLowerCase().includes("ishlab") || k.unit.toLowerCase().includes("kg"))
  const avgScore = kpis.length > 0 ? (kpis.reduce((acc, k) => acc + k.score, 0) / kpis.length).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-violet-600" />
            Ishchilar Samaradorligi (KPI & Reyting)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ishlab chiqarish va sotuv bo&apos;yicha xodimlarning oylik ko&apos;rsatkichlari
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi KPI yozuvi
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl p-5 shadow-lg shadow-violet-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-100">Eng yaxshi sotuvchi</span>
            <Flame className="h-5 w-5 text-amber-300 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold">{topSeller ? topSeller.name : "Ma'lumot yo'q"}</h3>
          <p className="text-xs text-violet-100">
            {topSeller
              ? `${formatNumber(topSeller.actual_output)} ${topSeller.unit} (${topSeller.score}% samaradorlik)`
              : "0 so'm"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-lg shadow-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Ishlab chiqarish ustasi</span>
            <Award className="h-5 w-5 text-yellow-300" />
          </div>
          <h3 className="text-xl font-bold">{topProducer ? topProducer.name : "Ma'lumot yo'q"}</h3>
          <p className="text-xs text-emerald-100">
            {topProducer
              ? `${formatNumber(topProducer.actual_output)} ${topProducer.unit} (${topProducer.score}% samaradorlik)`
              : "0 kg"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">O&apos;rtacha jamoa KPI</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</h3>
          <p className="text-xs text-emerald-600 font-medium">
            {kpis.length > 0 ? "Ko'rsatkichlar tahlil qilindi" : "Hali KPI yozuvlari mavjud emas"}
          </p>
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
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                    KPI yozuvlari topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((kpi) => (
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
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(kpi)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(kpi.id)}
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
            setFormData({ name: "", department: "", role: "", target_output: "", actual_output: "", unit: "kg" })
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "KPI yozuvini tahrirlash" : "Yangi KPI yozuvi qo'shish"}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Bo'lim</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ishlab chiqarish"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Lavozim</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Bosh texnolog"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Reja *</label>
                <Input
                  type="number"
                  value={formData.target_output}
                  onChange={(e) => setFormData({ ...formData, target_output: e.target.value })}
                  placeholder="12000"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Amalda *</label>
                <Input
                  type="number"
                  value={formData.actual_output}
                  onChange={(e) => setFormData({ ...formData, actual_output: e.target.value })}
                  placeholder="13400"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Birlik</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg / so'm"
                  className="rounded-xl"
                />
              </div>
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
