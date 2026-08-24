"use client"

import { useState } from "react"
import { CalendarCheck, Plus, Search, Clock, CheckCircle2, AlertTriangle, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatNumber } from "@/lib/utils"

interface Plan {
  id: string
  product_name: string
  planned_kg: number
  target_date: string
  shift: "Kunduzgi (08:00 - 17:00)" | "Tungi (17:00 - 02:00)"
  responsible: string
  status: "PLANNED" | "IN_PROGRESS" | "DONE"
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: "plan-1",
    product_name: "Kunjutli Premium Holva (500g)",
    planned_kg: 800,
    target_date: "25.08.2026",
    shift: "Kunduzgi (08:00 - 17:00)",
    responsible: "Rustam Mahmudov",
    status: "IN_PROGRESS",
  },
  {
    id: "plan-2",
    product_name: "Shokoladli Yong'oqli Holva",
    planned_kg: 500,
    target_date: "25.08.2026",
    shift: "Tungi (17:00 - 02:00)",
    responsible: "Otabek Saidov",
    status: "PLANNED",
  },
  {
    id: "plan-3",
    product_name: "Samarqand Xandon Pistali",
    planned_kg: 350,
    target_date: "26.08.2026",
    shift: "Kunduzgi (08:00 - 17:00)",
    responsible: "Rustam Mahmudov",
    status: "PLANNED",
  },
  {
    id: "plan-4",
    product_name: "Kungaboqar Klassik Holvasi",
    planned_kg: 1200,
    target_date: "24.08.2026",
    shift: "Kunduzgi (08:00 - 17:00)",
    responsible: "Jahongir Aliyev",
    status: "DONE",
  },
]

export default function ProductionPlanningPage() {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    product_name: "",
    planned_kg: "",
    target_date: "",
    shift: "Kunduzgi (08:00 - 17:00)" as const,
    responsible: "",
  })

  const filtered = plans.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.responsible.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_name.trim() || !formData.planned_kg) return

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      product_name: formData.product_name,
      planned_kg: Number(formData.planned_kg),
      target_date: formData.target_date || new Date().toISOString().split("T")[0],
      shift: formData.shift,
      responsible: formData.responsible || "Usta Mahmudov",
      status: "PLANNED",
    }

    setPlans([newPlan, ...plans])
    setFormData({ product_name: "", planned_kg: "", target_date: "", shift: "Kunduzgi (08:00 - 17:00)", responsible: "" })
    setIsOpen(false)
    toast.success("Ishlab chiqarish rejasi tasdiqlandi")
  }

  const handleStatusChange = (id: string, nextStatus: Plan["status"]) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)))
    toast.success("Reja holati yangilandi")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="h-7 w-7 text-violet-600" />
            Ishlab Chiqarishni Rejalashtirish
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Smenalar, kunlik va haftalik ishlab chiqarish hajmlari jadvali
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi reja tuzish
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot yoki usta bo'yicha qidirish..."
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                  {plan.target_date} • {plan.shift}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mt-0.5">{plan.product_name}</h3>
              </div>
              <Badge
                className={
                  plan.status === "DONE"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : plan.status === "IN_PROGRESS"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }
              >
                {plan.status === "DONE" ? "Bajarildi" : plan.status === "IN_PROGRESS" ? "Jarayonda" : "Rejalashtirilgan"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 px-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl text-xs">
              <div>
                <span className="text-gray-400">Rejalashtirilgan hajm:</span>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{formatNumber(plan.planned_kg)} kg</p>
              </div>
              <div>
                <span className="text-gray-400">Mas&apos;ul texnolog:</span>
                <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <User className="h-3.5 w-3.5 text-gray-400" /> {plan.responsible}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
              {plan.status === "PLANNED" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(plan.id, "IN_PROGRESS")}
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-8 text-xs gap-1"
                >
                  <Clock className="h-3.5 w-3.5" /> Jarayonni boshlash
                </Button>
              )}
              {plan.status === "IN_PROGRESS" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(plan.id, "DONE")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-8 text-xs gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Tayyor deb belgilash
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yangi ishlab chiqarish rejasi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Mahsulot nomi *</label>
              <Input
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Kunjutli Premium Holva"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Hajmi (kg) *</label>
                <Input
                  type="number"
                  value={formData.planned_kg}
                  onChange={(e) => setFormData({ ...formData, planned_kg: e.target.value })}
                  placeholder="500"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Sana</label>
                <Input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Smena</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="Kunduzgi (08:00 - 17:00)">Kunduzgi (08:00 - 17:00)</option>
                <option value="Tungi (17:00 - 02:00)">Tungi (17:00 - 02:00)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Mas&apos;ul shaxs</label>
              <Input
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Rustam Mahmudov"
                className="rounded-xl"
              />
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
