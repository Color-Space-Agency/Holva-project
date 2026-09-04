"use client"

import { useState, useEffect } from "react"
import { ClipboardList, Plus, Search, ArrowUpRight, ArrowDownLeft, AlertCircle, RefreshCw, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { formatNumber } from "@/lib/utils"

interface Adjustment {
  id: string
  item_name: string
  item_type: "Xomashyo" | "Tayyor Mahsulot"
  adjustment_type: "IN" | "OUT" | "WASTE" | "CORRECTION"
  quantity: number
  unit: string
  reason: string
  created_at: string
}

const STORAGE_KEY = "holva_crm_stored_adjustments"

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Adjustment | null>(null)
  const [formData, setFormData] = useState<{
    item_name: string
    item_type: "Xomashyo" | "Tayyor Mahsulot"
    adjustment_type: "IN" | "OUT" | "WASTE" | "CORRECTION"
    quantity: string
    unit: string
    reason: string
  }>({
    item_name: "",
    item_type: "Xomashyo",
    adjustment_type: "IN",
    quantity: "",
    unit: "kg",
    reason: "",
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setAdjustments(parsed)
      }
    } catch {}
  }, [])

  const saveAdjustments = (newList: Adjustment[]) => {
    setAdjustments(newList)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({ item_name: "", item_type: "Xomashyo", adjustment_type: "IN", quantity: "", unit: "kg", reason: "" })
    setIsOpen(true)
  }

  const handleOpenEdit = (adj: Adjustment) => {
    setEditingItem(adj)
    setFormData({
      item_name: adj.item_name,
      item_type: adj.item_type,
      adjustment_type: adj.adjustment_type,
      quantity: String(adj.quantity),
      unit: adj.unit,
      reason: adj.reason,
    })
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.item_name.trim() || !formData.quantity) return

    if (editingItem) {
      const updated = adjustments.map((a) =>
        a.id === editingItem.id
          ? {
              ...a,
              item_name: formData.item_name,
              item_type: formData.item_type,
              adjustment_type: formData.adjustment_type,
              quantity: Number(formData.quantity),
              unit: formData.unit,
              reason: formData.reason || "Inventarizatsiya natijasi",
            }
          : a
      )
      saveAdjustments(updated)
      toast.success("Ombor amali tahrirlandi")
    } else {
      const newAdj: Adjustment = {
        id: `adj-${Date.now()}`,
        item_name: formData.item_name,
        item_type: formData.item_type,
        adjustment_type: formData.adjustment_type,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        reason: formData.reason || "Inventarizatsiya natijasi",
        created_at: new Date().toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      }
      saveAdjustments([newAdj, ...adjustments])
      toast.success("Ombor qoldig'i moslashtirildi va qayd etildi")
    }

    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    const filteredList = adjustments.filter((a) => a.id !== id)
    saveAdjustments(filteredList)
    toast.success("Ombor amali o'chirildi")
  }

  const filtered = adjustments.filter((a) =>
    a.item_name.toLowerCase().includes(search.toLowerCase()) ||
    a.reason.toLowerCase().includes(search.toLowerCase())
  )

  const getTypeBadge = (type: Adjustment["adjustment_type"]) => {
    switch (type) {
      case "IN":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 gap-1"><ArrowUpRight className="h-3 w-3" /> Kirim</Badge>
      case "OUT":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 gap-1"><ArrowDownLeft className="h-3 w-3" /> Chiqim</Badge>
      case "WASTE":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 gap-1"><AlertCircle className="h-3 w-3" /> Brak</Badge>
      case "CORRECTION":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 gap-1"><RefreshCw className="h-3 w-3" /> Qayta hisob</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-violet-600" />
            Omborni Moslashtirish & Kirim-Chiqim
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Qoldiqlarni to&apos;g&apos;rilash, brak va spetsifikatsiyalarni rasmiylashtirish
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi moslash
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot yoki sabab bo'yicha qidirish..."
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sana</th>
                <th className="px-5 py-3.5 font-semibold">Tovar / Xomashyo</th>
                <th className="px-5 py-3.5 font-semibold">Turi</th>
                <th className="px-5 py-3.5 font-semibold">Amal</th>
                <th className="px-5 py-3.5 font-semibold">Miqdor</th>
                <th className="px-5 py-3.5 font-semibold">Sabab / Izoh</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                    Hech qanday ombor moslashuvi kiritilmagan
                  </td>
                </tr>
              ) : (
                filtered.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{adj.created_at}</td>
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{adj.item_name}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{adj.item_type}</td>
                    <td className="px-5 py-4">{getTypeBadge(adj.adjustment_type)}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                      {formatNumber(adj.quantity)} {adj.unit}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{adj.reason}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(adj)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(adj.id)}
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
            <DialogTitle>{editingItem ? "Ombor amalini tahrirlash" : "Yangi ombor amali"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Tovar yoki xomashyo nomi *</label>
              <Input
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="Masalan: Oq kunjut"
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Tovar turi</label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="Xomashyo">Xomashyo</option>
                  <option value="Tayyor Mahsulot">Tayyor Mahsulot</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Amal turi</label>
                <select
                  value={formData.adjustment_type}
                  onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="IN">Kirim (+)</option>
                  <option value="OUT">Chiqim (-)</option>
                  <option value="WASTE">Brak / Yo&apos;qotish (-)</option>
                  <option value="CORRECTION">Tuzatish</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Miqdor *</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="100"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Birlik</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg / dona"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sabab / Hujjat raqami</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Faktura #123 yoki reja bo'yicha"
                className="rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                {editingItem ? "Saqlash" : "Tasdiqlash"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
