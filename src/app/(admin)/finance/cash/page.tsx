"use client"

import { useState } from "react"
import { Banknote, Plus, ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface Transaction {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: number
  category: string
  description: string
  payment_method: "NAQD" | "KARTA" | "HISOB_RAQAM"
  date: string
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "INCOME",
    amount: 14800000,
    category: "Sotuv tushumi",
    description: "Korzinka Chilonzor — Buyurtma #104 uchun to'lov",
    payment_method: "HISOB_RAQAM",
    date: "24.08.2026 16:45",
  },
  {
    id: "tx-2",
    type: "INCOME",
    amount: 9200000,
    category: "Sotuv tushumi",
    description: "Makro Supermarket — Buyurtma #105 to'liq to'landi",
    payment_method: "HISOB_RAQAM",
    date: "24.08.2026 14:20",
  },
  {
    id: "tx-3",
    type: "EXPENSE",
    amount: 6400000,
    category: "Xomashyo xaridi",
    description: "Agro Import — 200 kg kunjut uchun avans",
    payment_method: "HISOB_RAQAM",
    date: "24.08.2026 11:30",
  },
  {
    id: "tx-4",
    type: "EXPENSE",
    amount: 450000,
    category: "Xo'jalik xarajatlari",
    description: "Tsex uchun qadoqlash plyonkalari va skotch",
    payment_method: "NAQD",
    date: "23.08.2026 17:10",
  },
]

export default function FinanceCashPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "INCOME" as const,
    amount: "",
    category: "",
    description: "",
    payment_method: "NAQD" as const,
  })

  const totalCash = 18450000
  const totalBank = 84200000

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category.trim()) return

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: formData.type,
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description || "Kassa amaliyati",
      payment_method: formData.payment_method,
      date: new Date().toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    }

    setTransactions([newTx, ...transactions])
    setFormData({ type: "INCOME", amount: "", category: "", description: "", payment_method: "NAQD" })
    setIsOpen(false)
    toast.success("Kassa amaliyati muvaffaqiyatli saqlandi")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-7 w-7 text-violet-600" />
            Kassa va Hisob-raqamlar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Naqd pul va bank hisobidagi joriy mablag&apos;lar oqimi
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi tranzaksiya
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Naqd Pul Kassasi</span>
            <Wallet className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCash)}</h3>
          <p className="text-xs text-emerald-600 font-medium">Asosiy zavod seyfi</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Bank Hisob-Raqami</span>
            <Building2 className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBank)}</h3>
          <p className="text-xs text-blue-600 font-medium">Ipak Yo&apos;li Banki</p>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-5 space-y-1 shadow-lg shadow-violet-500/20">
          <span className="text-xs font-semibold uppercase text-violet-200">Jami Moliyaviy Qoldiq</span>
          <h3 className="text-2xl font-bold">{formatCurrency(totalCash + totalBank)}</h3>
          <p className="text-xs text-violet-200">Barcha aktivlar summasi</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white text-base">
          Oxirgi Kassa Harakatlari
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Sana</th>
                <th className="px-5 py-3.5 font-semibold">Amal</th>
                <th className="px-5 py-3.5 font-semibold">Toifa</th>
                <th className="px-5 py-3.5 font-semibold">Tavsif</th>
                <th className="px-5 py-3.5 font-semibold">To&apos;lov Usuli</th>
                <th className="px-5 py-3.5 font-semibold text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{tx.date}</td>
                  <td className="px-5 py-4">
                    <Badge
                      className={
                        tx.type === "INCOME"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 gap-1"
                      }
                    >
                      {tx.type === "INCOME" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {tx.type === "INCOME" ? "Kirim" : "Chiqim"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white text-xs">{tx.category}</td>
                  <td className="px-5 py-4 text-xs text-gray-500">{tx.description}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {tx.payment_method === "HISOB_RAQAM" ? "Bank o'tkazmasi" : "Naqd pul"}
                  </td>
                  <td
                    className={`px-5 py-4 font-bold text-right text-base ${
                      tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Kassa operatsiyasini kiritish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Amal turi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="INCOME">Kirim (Tushum)</option>
                <option value="EXPENSE">Chiqim (Xarajat)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Summa (so&apos;m) *</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1 000 000"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Kategoriya *</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Masalan: Sotuv tushumi, Xomashyo xaridi"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">To&apos;lov usuli</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="NAQD">Naqd pul</option>
                <option value="HISOB_RAQAM">Bank hisob-raqami</option>
                <option value="KARTA">Korporativ karta</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Izoh</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Operatsiya tafsilotlari"
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
