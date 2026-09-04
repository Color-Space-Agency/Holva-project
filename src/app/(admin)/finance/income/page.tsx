"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Plus, Store, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface IncomeItem {
  id: string
  source: string
  store_name: string
  amount: number
  payment_method: string
  date: string
  status: "Qabul qilindi" | "Kutilmoqda"
}

const STORAGE_KEY = "holva_crm_stored_incomes"

export default function FinanceIncomePage() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null)
  const [formData, setFormData] = useState<{
    store_name: string
    source: string
    amount: string
    payment_method: string
    status: "Qabul qilindi" | "Kutilmoqda"
  }>({
    store_name: "",
    source: "Sotuv to'lovi",
    amount: "",
    payment_method: "Bank o'tkazmasi",
    status: "Qabul qilindi",
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setIncomes(parsed)
      }
    } catch {}
  }, [])

  const saveIncomes = (newList: IncomeItem[]) => {
    setIncomes(newList)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    } catch {}
  }

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({ store_name: "", source: "Sotuv to'lovi", amount: "", payment_method: "Bank o'tkazmasi", status: "Qabul qilindi" })
    setIsOpen(true)
  }

  const handleOpenEdit = (inc: IncomeItem) => {
    setEditingItem(inc)
    setFormData({
      store_name: inc.store_name,
      source: inc.source,
      amount: String(inc.amount),
      payment_method: inc.payment_method,
      status: inc.status,
    })
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.store_name.trim()) return

    if (editingItem) {
      const updated = incomes.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              store_name: formData.store_name,
              source: formData.source,
              amount: Number(formData.amount),
              payment_method: formData.payment_method,
              status: formData.status,
            }
          : i
      )
      saveIncomes(updated)
      toast.success("Daromad tahrirlandi")
    } else {
      const newInc: IncomeItem = {
        id: `inc-${Date.now()}`,
        store_name: formData.store_name,
        source: formData.source,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        status: formData.status,
        date: new Date().toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }),
      }
      saveIncomes([newInc, ...incomes])
      toast.success("Yangi daromad kiritildi")
    }

    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    const updated = incomes.filter((i) => i.id !== id)
    saveIncomes(updated)
    toast.success("Daromad yozuvi o'chirildi")
  }

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
        <Button onClick={handleOpenCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi tushum kiritish
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">Jami Oylik Tushum</span>
          <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</h3>
          <p className="text-xs text-gray-400">Joriy oy hisobi</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-400">O&apos;rtacha Tushum Qiymati</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(incomes.length > 0 ? totalIncome / incomes.length : 0)}
          </h3>
          <p className="text-xs text-emerald-600 font-medium">Barcha tushumlar bo'yicha</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 space-y-1 shadow-lg shadow-emerald-500/20">
          <span className="text-xs font-semibold uppercase text-emerald-100">Kiritilgan Yozuvlar</span>
          <h3 className="text-2xl font-bold">{incomes.length} ta</h3>
          <p className="text-xs text-emerald-100">Umumiy tushum tranzaksiyalari</p>
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
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                    Daromad yozuvlari mavjud emas
                  </td>
                </tr>
              ) : (
                incomes.map((inc) => (
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
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Tushumni tahrirlash" : "Yangi tushum kiritish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Do&apos;kon / Mijoz nomi *</label>
              <Input
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="Korzinka Chilonzor"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Summa (so&apos;m) *</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5 000 000"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tushum manbai</label>
              <Input
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Sotuv to'lovi"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">To&apos;lov usuli</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="Bank o'tkazmasi">Bank o&apos;tkazmasi</option>
                <option value="Naqd pul">Naqd pul</option>
                <option value="Karta orqali">Karta orqali</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                {editingItem ? "Saqlash" : "Kiritish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
