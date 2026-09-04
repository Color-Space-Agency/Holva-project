"use client"

import { useState, useEffect } from "react"
import { DollarSign, Search, CheckCircle2, Clock, Plus, Store, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { DebtAgingAnalysis } from "@/components/finance/debt-aging-analysis"

interface Payment {
  id: string
  order_number: string
  store_name: string
  amount: number
  payment_method: string
  status: "COMPLETED" | "PENDING"
  created_at: string
}

const STORAGE_KEY = "holva_crm_stored_payments"

export default function FinancePaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Payment | null>(null)
  const [formData, setFormData] = useState({
    store_name: "",
    order_number: "",
    amount: "",
    payment_method: "Bank o'tkazmasi",
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setPayments(parsed)
      }
    } catch {}
  }, [])

  const savePayments = (newList: Payment[]) => {
    setPayments(newList)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
    } catch {}
  }

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({ store_name: "", order_number: "", amount: "", payment_method: "Bank o'tkazmasi" })
    setIsOpen(true)
  }

  const handleOpenEdit = (pay: Payment) => {
    setEditingItem(pay)
    setFormData({
      store_name: pay.store_name,
      order_number: pay.order_number,
      amount: String(pay.amount),
      payment_method: pay.payment_method,
    })
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.store_name.trim()) return

    if (editingItem) {
      const updated = payments.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              store_name: formData.store_name,
              order_number: formData.order_number || p.order_number,
              amount: Number(formData.amount),
              payment_method: formData.payment_method,
            }
          : p
      )
      savePayments(updated)
      toast.success("To'lov tahrirlandi")
    } else {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        store_name: formData.store_name,
        order_number: formData.order_number || `HLV-2026-00${Math.floor(Math.random() * 900 + 100)}`,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        status: "COMPLETED",
        created_at: new Date().toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      }
      savePayments([newPayment, ...payments])
      toast.success("To'lov qabul qilindi va saqlandi")
    }

    setIsOpen(false)
  }

  const handleConfirm = (id: string) => {
    const updated = payments.map((p) => (p.id === id ? { ...p, status: "COMPLETED" as const } : p))
    savePayments(updated)
    toast.success("To'lov tasdiqlandi")
  }

  const handleDelete = (id: string) => {
    const updated = payments.filter((p) => p.id !== id)
    savePayments(updated)
    toast.success("To'lov yozuvi o'chirildi")
  }

  const filtered = payments.filter((p) =>
    p.store_name.toLowerCase().includes(search.toLowerCase()) ||
    p.order_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <DebtAgingAnalysis />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-amber-600" />
            Sotuv To&apos;lovlari & Qarz Yopilishi (1C Kassa)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Do&apos;konlar va agentlardan tushgan savdo to&apos;lovlari va kassa kirimlari
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2 cursor-pointer shadow-sm">
          <Plus className="h-4 w-4" /> Kassa to&apos;lovi qabul qilish
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Do'kon yoki sotuv raqami bo'yicha qidirish..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sana</th>
                <th className="px-5 py-3.5 font-semibold">Sotuv #</th>
                <th className="px-5 py-3.5 font-semibold">Do&apos;kon / Mijoz</th>
                <th className="px-5 py-3.5 font-semibold">To&apos;lov Usuli</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold text-right">Summa</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                    To'lov yozuvlari mavjud emas
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{pay.created_at}</td>
                    <td className="px-5 py-4 font-mono font-medium text-violet-600 text-xs">{pay.order_number}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Store className="h-4 w-4 text-gray-400" />
                      {pay.store_name}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{pay.payment_method}</td>
                    <td className="px-5 py-4">
                      <Badge
                        className={
                          pay.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 gap-1"
                        }
                      >
                        {pay.status === "COMPLETED" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {pay.status === "COMPLETED" ? "Qabul qilindi" : "Kutilmoqda"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-bold text-right text-emerald-600 text-base">
                      +{formatCurrency(pay.amount)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {pay.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(pay.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-7 text-xs mr-1"
                          >
                            Tasdiqlash
                          </Button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(pay)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(pay.id)}
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
            <DialogTitle>{editingItem ? "To'lovni tahrirlash" : "To'lovni qabul qilish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Do&apos;kon nomi *</label>
              <Input
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                placeholder="Korzinka Chilonzor"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sotuv raqami</label>
              <Input
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                placeholder="HLV-2026-00104"
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
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">
                {editingItem ? "Saqlash" : "Kiritish"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
