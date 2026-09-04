"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText,
  FileCheck2,
  X,
  Edit,
  Trash,
  Eye
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getStoredOrders, getStoredStores, deleteStoredOrder, updateStoredOrder, updateStoredStore, MockOrder } from "@/lib/mock-data"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { OrderViewDialog } from "@/components/orders/order-view-dialog"
import { toast } from "sonner"

interface StoreActReconciliationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: {
    id?: string
    name: string
    phone?: string | null
    address?: string | null
    contact_person?: string | null
    initial_balance?: number
    current_balance?: number
    credit_limit?: number
  }
}

export function StoreActReconciliationDialog({
  open,
  onOpenChange,
  store,
}: StoreActReconciliationDialogProps) {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0]
  const lastDay = new Date(today.getFullYear(), 11, 31).toISOString().split("T")[0]
  const [startDate, setStartDate] = useState<string>(firstDay)
  const [endDate, setEndDate] = useState<string>(lastDay)
  const [refreshKey, setRefreshKey] = useState(0)

  const [editItem, setEditItem] = useState<any>(null)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editDebitVal, setEditDebitVal] = useState<number>(0)
  const [editCreditVal, setEditCreditVal] = useState<number>(0)
  const [editDescVal, setEditDescVal] = useState<string>("")

  // Do'konning Sotuvlari va to'lovlari
  const { entries, totalDebit, totalCredit, initialBalance, finalBalance } = useMemo(() => {
    const orders = getStoredOrders().filter(
      (o) => o.store_name.toLowerCase().trim() === store.name.toLowerCase().trim() ||
        o.store_name.toLowerCase().includes(store.name.toLowerCase()) || 
        store.name.toLowerCase().includes(o.store_name.toLowerCase())
    )

    // Boshlang'ich qoldiq
    const storeObj = getStoredStores().find((s: any) => (store.id && s.id === store.id) || s.name.toLowerCase().trim() === store.name.toLowerCase().trim())
    const rawInit = store.initial_balance ?? storeObj?.initial_balance ?? 0
    const initBal = Math.abs(rawInit)
    let runningBalance = initBal

    const list: Array<{
      id: string
      rawOrdId: string
      date: string
      docNumber: string
      docType: "Sotuv" | "TOLOV"
      description: string
      debit: number
      credit: number
      balance: number
    }> = []

    const sorted = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    for (const ord of sorted) {
      runningBalance += ord.total_amount
      list.push({
        id: `ord-${ord.id}`,
        rawOrdId: ord.id,
        date: ord.created_at.split("T")[0] || "2026-08-15",
        docNumber: ord.order_number,
        docType: "Sotuv",
        description: `Tayyor holva mahsulotlari partiyasi (#${ord.order_number})`,
        debit: ord.total_amount,
        credit: 0,
        balance: runningBalance,
      })

      if (ord.paid_amount && ord.paid_amount > 0) {
        runningBalance -= ord.paid_amount
        list.push({
          id: `pay-${ord.id}`,
          rawOrdId: ord.id,
          date: ord.created_at.split("T")[0] || "2026-08-15",
          docNumber: `TO'L-${ord.order_number.replace("HLV-", "").replace("ORD-", "")}`,
          docType: "TOLOV",
          description: `Kassa orqali to'lov qabuli (${ord.payment_status === "PAID" ? "To'liq" : "Qisman"})`,
          debit: 0,
          credit: ord.paid_amount,
          balance: runningBalance,
        })
      }
    }

    const filtered = list.filter((item) => item.date >= startDate && item.date <= endDate)
    const tDeb = filtered.reduce((sum, i) => sum + i.debit, 0)
    const tCred = filtered.reduce((sum, i) => sum + i.credit, 0)
    const finBal = filtered.length > 0 ? filtered[filtered.length - 1].balance : initBal

    return {
      entries: filtered,
      totalDebit: tDeb,
      totalCredit: tCred,
      initialBalance: initBal,
      finalBalance: finBal,
    }
  }, [store, startDate, endDate, refreshKey])

  useEffect(() => {
    const handleUpdate = () => setRefreshKey((prev) => prev + 1)
    window.addEventListener("orders-updated", handleUpdate)
    window.addEventListener("stores-updated", handleUpdate)
    return () => {
      window.removeEventListener("orders-updated", handleUpdate)
      window.removeEventListener("stores-updated", handleUpdate)
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    const headers = ["T/r", "Sana", "Hujjat raqami", "Hujjat turi", "Izoh", "Tovar berildi (Debet)", "To'lov qilindi (Kredit)", "Qoldiq qarz"]
    const rows = entries.map((e, idx) => [
      idx + 1,
      e.date,
      e.docNumber,
      e.docType,
      `"${e.description.replace(/"/g, '""')}"`,
      e.debit,
      e.credit,
      e.balance,
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Akt_Sverka_${store.name}_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openEdit = (item: any) => {
    setEditItem(item)
    setEditDebitVal(item.debit || 0)
    setEditCreditVal(item.credit || 0)
    setEditDescVal(item.description || "")
  }

  const handleSaveEdit = () => {
    if (!editItem) return
    try {
      if (editItem.id.startsWith("ord-")) {
        const ordId = editItem.rawOrdId || editItem.id.replace("ord-", "")
        updateStoredOrder(ordId, { total_amount: Number(editDebitVal) || 0, updated_at: new Date().toISOString() })
      } else if (editItem.id.startsWith("pay-")) {
        const ordId = editItem.rawOrdId || editItem.id.replace("pay-", "")
        const newCred = Number(editCreditVal) || 0
        const ords = getStoredOrders()
        const targetOrd = ords.find(o => o.id === ordId || o.order_number === ordId)
        const total = targetOrd?.total_amount || 0
        updateStoredOrder(ordId, {
          paid_amount: newCred,
          payment_status: newCred >= total && total > 0 ? "PAID" : newCred > 0 ? "PARTIAL" : "PENDING",
          updated_at: new Date().toISOString(),
        })
      }
      toast.success("O'zgarishlar muvaffaqiyatli saqlandi!")
      setEditItem(null)
      setRefreshKey((prev) => prev + 1)
    } catch {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleDeleteItem = () => {
    if (!deletingItem) return
    try {
      if (deletingItem.id.startsWith("ord-")) {
        const ordId = deletingItem.rawOrdId || deletingItem.id.replace("ord-", "")
        deleteStoredOrder(ordId)
        if (deletingItem.docNumber) deleteStoredOrder(deletingItem.docNumber)
        toast.success("Sotuv hujjati muvaffaqiyatli o'chirildi")
      } else if (deletingItem.id.startsWith("pay-")) {
        const ordId = deletingItem.rawOrdId || deletingItem.id.replace("pay-", "")
        updateStoredOrder(ordId, { paid_amount: 0, payment_status: "PENDING", updated_at: new Date().toISOString() })
        toast.success("To'lov yozuvi o'chirildi")
      }
      setRefreshKey((prev) => prev + 1)
    } catch {
      toast.error("Xatolik yuz berdi")
    } finally {
      setDeletingItem(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:max-w-5xl max-h-[92vh] overflow-y-auto p-3 sm:p-6 print:p-0 print:max-w-full print:shadow-none print:border-none">
        <DialogHeader className="print:hidden border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Solishtirma Dalolatnoma (Akt Sverka)
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Do&apos;kon: <strong className="text-gray-900 dark:text-white">{store.name}</strong> bilan o&apos;zaro hisob-kitoblar hujjati
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="cursor-pointer gap-1.5">
              <Download className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Excel (CSV)</span>
            </Button>
            <Button size="sm" onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5 shadow-sm">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Chop etish</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Filtr paneli (Faqat ekranda ko'rinadi, printda yashiriladi) */}
        <div className="print:hidden bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold text-gray-500">Davr:</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs w-32 sm:w-36 bg-white dark:bg-gray-900"
              />
              <span className="text-xs text-gray-400">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs w-32 sm:w-36 bg-white dark:bg-gray-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={() => {
                const now = new Date()
                setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0])
                setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0])
              }}
            >
              Shu oy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs cursor-pointer"
              onClick={() => {
                const now = new Date()
                setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0])
                setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0])
              }}
            >
              Yillik
            </Button>
          </div>
        </div>

        {/* AKT SVERKA ASOSIY HUJJAT BLOKI */}
        <div className="space-y-5 pt-1 text-gray-900 dark:text-gray-100 print:text-black">
          
          <div className="text-center space-y-1 border-b pb-3">
            <h2 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white print:text-black">
              O&apos;ZARO HISOB-KITOBLARNI SOLISHTIRISH DALOLATNOMASI
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              № AKT-{store.name.slice(0, 3).toUpperCase()}-2026/08 &bull; Sana: {formatDate(new Date().toISOString())}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Davr: <strong>{startDate}</strong> dan <strong>{endDate}</strong> gacha
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-gray-800/40 border border-amber-200/60 dark:border-gray-700 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
                YETKAZIB BERUVCHI:
              </span>
              <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">&ldquo;HOLVA FACTORY&rdquo; MCHJ</div>
              <div>Manzil: Toshkent sh., Chilonzor tumani, Sanoat hududi 12</div>
              <div>Tel: +998 (71) 200-00-55</div>
              <div>Hisob raqam: 20208000900000123456</div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l sm:pl-4 border-amber-200/60 dark:border-gray-700 pt-2 sm:pt-0">
              <span className="font-bold text-amber-900 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
                XARIDOR (DO&apos;KON):
              </span>
              <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{store.name}</div>
              <div>Manzil: {store.address || "Toshkent shahri"}</div>
              <div>Mas&apos;ul: {store.contact_person || "Do'kon mudiri"}</div>
              <div>Tel: {store.phone || "+998 90 000 00 00"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border">
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium block">Boshlang&apos;ich Qoldiq</span>
              <span className="text-xs sm:text-base font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(initialBalance)}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
              <span className="text-[10px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium block">Jami Tovar Berildi</span>
              <span className="text-xs sm:text-base font-bold text-blue-700 dark:text-blue-300">
                +{formatCurrency(totalDebit)}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Jami To&apos;lov Qilindi</span>
              <span className="text-xs sm:text-base font-bold text-emerald-700 dark:text-emerald-300">
                -{formatCurrency(totalCredit)}
              </span>
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl border ${finalBalance > 0 ? "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-700 dark:text-red-400" : "bg-green-50 dark:bg-green-950/20 border-green-200 text-green-700 dark:text-green-400"}`}>
              <span className="text-[10px] sm:text-[11px] font-medium block">Yakuniy Qoldiq Qarz</span>
              <span className="text-xs sm:text-base font-bold">
                {formatCurrency(finalBalance)}
              </span>
            </div>
          </div>

          <div className="border rounded-2xl overflow-x-auto shadow-xs bg-white dark:bg-gray-900">
            <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-b">
                <tr>
                  <th className="p-2 sm:p-3 w-8 text-center whitespace-nowrap">№</th>
                  <th className="p-2 sm:p-3 w-20 sm:w-28 whitespace-nowrap">Sana</th>
                  <th className="p-2 sm:p-3 whitespace-nowrap">Hujjat / Amal</th>
                  <th className="p-2 sm:p-3 text-right whitespace-nowrap">Tovar berildi (Debet)</th>
                  <th className="p-2 sm:p-3 text-right whitespace-nowrap">To&apos;lov qilindi (Kredit)</th>
                  <th className="p-2 sm:p-3 text-right whitespace-nowrap">Qoldiq (Qarz)</th>
                  <th className="p-2 sm:p-3 text-right w-16 print:hidden">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr className="bg-gray-50/50 dark:bg-gray-800/30 italic text-gray-500 font-medium">
                  <td className="p-2.5 sm:p-3 text-center">-</td>
                  <td className="p-2.5 sm:p-3">{startDate}</td>
                  <td className="p-2.5 sm:p-3">Davr boshidagi qoldiq</td>
                  <td className="p-2.5 sm:p-3 text-right">-</td>
                  <td className="p-2.5 sm:p-3 text-right">-</td>
                  <td className="p-2.5 sm:p-3 text-right font-semibold">{formatCurrency(initialBalance)}</td>
                  <td className="p-2.5 sm:p-3 print:hidden"></td>
                </tr>

                {entries.map((item, idx) => (
                  <tr key={item.id} className="group hover:bg-amber-50/30 dark:hover:bg-gray-800/50 transition">
                    <td className="p-2.5 sm:p-3 text-center text-gray-400">{idx + 1}</td>
                    <td className="p-2.5 sm:p-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{item.date}</td>
                    <td className="p-2.5 sm:p-3">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {item.docType === "Sotuv" ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">Yuk xati</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">To&apos;lov cheki</Badge>
                        )}
                        <span>{item.docNumber}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">{item.description}</div>
                    </td>
                    <td className="p-2.5 sm:p-3 text-right font-medium text-blue-700 dark:text-blue-400">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </td>
                    <td className="p-2.5 sm:p-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </td>
                    <td className="p-2.5 sm:p-3 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.balance)}
                    </td>
                    <td className="p-2.5 sm:p-3 print:hidden text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                          onClick={() => setViewingOrder(item)}
                          title="Mahsulotlar tarkibini ko'rish (Batafsil)"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-gray-400 hover:text-amber-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEdit(item)}
                          title="Tahrirlash"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeletingItem(item)}
                          title="O'chirish"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                <tr className="bg-amber-100/40 dark:bg-amber-950/30 font-bold border-t-2 border-amber-300 dark:border-amber-700">
                  <td colSpan={3} className="p-2.5 sm:p-3 text-right uppercase tracking-wider text-xs">
                    DAVR BO&apos;YICHA JAMI OBOROT VA YAKUNIY QARZ:
                  </td>
                  <td className="p-2.5 sm:p-3 text-right text-blue-800 dark:text-blue-300">
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className="p-2.5 sm:p-3 text-right text-emerald-800 dark:text-emerald-300">
                    {formatCurrency(totalCredit)}
                  </td>
                  <td className={`p-2.5 sm:p-3 text-right text-base ${finalBalance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatCurrency(finalBalance)}
                  </td>
                  <td className="print:hidden"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              <strong>{endDate}</strong> holatiga ko&apos;ra, &ldquo;HOLVA FACTORY&rdquo; MCHJ foydasiga <strong>{store.name}</strong> ning qarzdorligi <strong>{formatCurrency(finalBalance)}</strong> so&apos;mni tashkil etadi.
            </p>
            <p className="text-gray-500 text-[11px]">
              Tomonlar hisob-kitoblar natijasini to&apos;liq tasdiqlaydilar va hech qanday e&apos;tirozlari mavjud emas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-6 pb-2 text-xs sm:text-sm">
            <div className="space-y-8">
              <div>
                <span className="font-bold block">&ldquo;HOLVA FACTORY&rdquo; MCHJ nomidan:</span>
                <span className="text-gray-500 text-xs">Bosh direktor / Bosh hisobchi</span>
              </div>
              <div className="flex items-end justify-between border-b border-black dark:border-white pb-1">
                <span className="text-gray-400 text-xs">Imzo: _______________</span>
                <span className="font-semibold text-xs">F.I.SH. ____________</span>
              </div>
              <div className="text-[11px] text-gray-400">M.O&apos;. (Muhr o&apos;rni)</div>
            </div>

            <div className="space-y-8">
              <div>
                <span className="font-bold block">&ldquo;{store.name}&rdquo; nomidan:</span>
                <span className="text-gray-500 text-xs">Do&apos;kon rahbari / Mas&apos;ul shaxs</span>
              </div>
              <div className="flex items-end justify-between border-b border-black dark:border-white pb-1">
                <span className="text-gray-400 text-xs">Imzo: _______________</span>
                <span className="font-semibold text-xs">F.I.SH. ____________</span>
              </div>
              <div className="text-[11px] text-gray-400">M.O&apos;. (Muhr o&apos;rni)</div>
            </div>
          </div>

        </div>

        {/* Edit Dialog */}
        {editItem && (
          <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yozuvni tahrirlash</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Harakat (Izoh)</Label>
                  <Input value={editDescVal} onChange={(e) => setEditDescVal(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Xarid Summasi (Debet)</Label>
                    <Input type="number" value={editDebitVal} onChange={(e) => setEditDebitVal(Number(e.target.value))} disabled={editItem.debit === 0} />
                  </div>
                  <div className="space-y-2">
                    <Label>To'lov Summasi (Kredit)</Label>
                    <Input type="number" value={editCreditVal} onChange={(e) => setEditCreditVal(Number(e.target.value))} disabled={editItem.credit === 0} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditItem(null)}>Bekor qilish</Button>
                <Button onClick={handleSaveEdit} className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer">
                  Saqlash
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DeleteConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onConfirm={handleDeleteItem}
          title="Yozuvni o'chirish"
          description="Haqiqatan ham ushbu solishtirma dalolatnoma yozuvini o'chirmoqchimisiz?"
        />
        <OrderViewDialog
          open={!!viewingOrder}
          onOpenChange={(open) => !open && setViewingOrder(null)}
          orderData={viewingOrder}
        />
      </DialogContent>
    </Dialog>
  )
}
