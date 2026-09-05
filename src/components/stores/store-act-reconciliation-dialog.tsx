"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2, 
  Trash, 
  Eye,
  Calendar,
  Clock,
  Package,
  CreditCard,
  Filter
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  getStoredOrders, 
  getStoredStores, 
  deleteStoredOrder, 
  updateStoredOrder 
} from "@/lib/mock-data"
import { 
  buildStoreTransactions, 
  getStoreSummary, 
  TransactionEntry 
} from "@/lib/store-financials"
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
  const currentYear = today.getFullYear()
  const firstDayOfYear = `${currentYear}-01-01`
  const lastDayOfYear = `${currentYear}-12-31`

  const [startDate, setStartDate] = useState<string>(firstDayOfYear)
  const [endDate, setEndDate] = useState<string>(lastDayOfYear)
  const [datePreset, setDatePreset] = useState<"all" | "year" | "month" | "today">("year")
  const [refreshKey, setRefreshKey] = useState(0)

  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)

  // Date presets
  const setPreset = (preset: "all" | "year" | "month" | "today") => {
    setDatePreset(preset)
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")

    if (preset === "all") {
      setStartDate("2024-01-01")
      setEndDate("2030-12-31")
    } else if (preset === "year") {
      setStartDate(`${y}-01-01`)
      setEndDate(`${y}-12-31`)
    } else if (preset === "month") {
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
      setStartDate(`${y}-${m}-01`)
      setEndDate(`${y}-${m}-${lastDay}`)
    } else if (preset === "today") {
      setStartDate(`${y}-${m}-${d}`)
      setEndDate(`${y}-${m}-${d}`)
    }
  }

  // Fetch summary & transactions
  const storeIdentifier = store.id || store.name
  const summary = useMemo(() => getStoreSummary(storeIdentifier), [storeIdentifier, refreshKey])
  const entries: TransactionEntry[] = useMemo(
    () => buildStoreTransactions(storeIdentifier, startDate, endDate),
    [storeIdentifier, startDate, endDate, refreshKey]
  )

  const totalDebit = entries.reduce((sum, i) => sum + i.debit, 0)
  const totalCredit = entries.reduce((sum, i) => sum + i.credit, 0)
  const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : summary.currentDebt

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
    const headers = [
      "№", 
      "Sana", 
      "Vaqt", 
      "Hujjat №", 
      "Operatsiya turi", 
      "Nima xarid qilingan / Tafsilot", 
      "Mas'ul", 
      "Xarid (Debet)", 
      "To'lov (Kredit)", 
      "Qoldiq Qarz"
    ]
    const rows = entries.map((e, idx) => [
      idx + 1,
      e.date,
      e.time,
      e.docNumber,
      e.docType,
      `"${e.description.replace(/"/g, '""')}"`,
      e.agentName,
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

  const handleDeleteItem = () => {
    if (!deletingItem) return
    try {
      if (deletingItem.orderId) {
        deleteStoredOrder(deletingItem.orderId)
      } else if (deletingItem.docNumber) {
        deleteStoredOrder(deletingItem.docNumber)
      }
      toast.success("Hujjat o'chirildi")
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
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 text-xs">
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              CSV
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white">
              <Printer className="w-3.5 h-3.5" />
              Chop etish
            </Button>
          </div>
        </DialogHeader>

        {/* DATE PRESETS + PICKER */}
        <div className="flex flex-wrap items-end gap-3 print:hidden py-3 bg-gray-50/80 dark:bg-gray-800/40 p-3 rounded-2xl border">
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Davr
            </Label>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-xl border">
              <button
                type="button"
                onClick={() => setPreset("all")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  datePreset === "all" ? "bg-amber-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Barchasi
              </button>
              <button
                type="button"
                onClick={() => setPreset("year")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  datePreset === "year" ? "bg-amber-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Shu yil
              </button>
              <button
                type="button"
                onClick={() => setPreset("month")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  datePreset === "month" ? "bg-amber-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Shu oy
              </button>
              <button
                type="button"
                onClick={() => setPreset("today")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  datePreset === "today" ? "bg-amber-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bugun
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Dan</Label>
            <Input
              type="date"
              className="h-8 text-xs bg-white dark:bg-gray-900 w-32"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setDatePreset("year")
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Gacha</Label>
            <Input
              type="date"
              className="h-8 text-xs bg-white dark:bg-gray-900 w-32"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setDatePreset("year")
              }}
            />
          </div>
        </div>

        {/* AKT SVERKA ASOSIY HUJJAT BLOKI */}
        <div className="space-y-5 pt-1 text-gray-900 dark:text-gray-100 print:text-black">
          <div className="text-center space-y-1 border-b pb-3">
            <h2 className="text-base sm:text-xl font-black uppercase tracking-wide text-gray-900 dark:text-white print:text-black">
              O&apos;ZARO HISOB-KITOBLARNI SOLISHTIRISH DALOLATNOMASI
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Mijoz: <strong>{store.name}</strong> &bull; Sana: {formatDate(new Date().toISOString())}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Davr: <strong>{startDate}</strong> dan <strong>{endDate}</strong> gacha
            </p>
          </div>

          {/* Party details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-gray-800/40 border border-amber-200/60 dark:border-gray-700 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
                YETKAZIB BERUVCHI:
              </span>
              <div className="font-bold text-sm text-gray-900 dark:text-white">&ldquo;HOLVA FACTORY&rdquo; MCHJ</div>
              <div>Toshkent sh., Chilonzor tumani</div>
              <div>Tel: +998 (71) 200-00-55</div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l sm:pl-4 border-amber-200/60 dark:border-gray-700 pt-2 sm:pt-0">
              <span className="font-bold text-amber-900 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
                XARIDOR (MIJOZ):
              </span>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{store.name}</div>
              <div>Manzil: {store.address || "Toshkent shahri"}</div>
              <div>Tel: {store.phone || "+998 90 000 00 00"}</div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border">
              <span className="text-[11px] text-gray-500 font-medium block">Boshlang&apos;ich Qoldiq</span>
              <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(summary.initialDebt)}
              </span>
            </div>
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">Jami Xarid (Debet)</span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                +{formatCurrency(totalDebit)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Jami To&apos;lov (Kredit)</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                -{formatCurrency(totalCredit)}
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                finalBalance > 0
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-700 dark:text-red-400"
                  : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                {finalBalance > 0 ? "⚠️ Joriy Qoldiq Qarz" : "✅ Qoldiq Qarz"}
              </span>
              <span className="text-base font-black">
                {formatCurrency(Math.abs(finalBalance))}
                {finalBalance > 0 ? " (Qarz)" : " (0)"}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-2xl overflow-x-auto shadow-xs bg-white dark:bg-gray-900">
            <table className="w-full text-xs text-left border-collapse min-w-full">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-b">
                <tr>
                  <th className="p-2.5 w-8 text-center whitespace-nowrap">№</th>
                  <th className="p-2.5 whitespace-nowrap">Sana va vaqt</th>
                  <th className="p-2.5 whitespace-nowrap">Hujjat №</th>
                  <th className="p-2.5 whitespace-nowrap">Hujjat turi</th>
                  <th className="p-2.5 min-w-[280px]">Nima xarid qilingan / Tafsilot</th>
                  <th className="p-2.5 text-right whitespace-nowrap">Xarid (Debet)</th>
                  <th className="p-2.5 text-right whitespace-nowrap">To&apos;lov (Kredit)</th>
                  <th className="p-2.5 text-right whitespace-nowrap font-black">Qoldiq Qarz</th>
                  <th className="p-2.5 text-right w-16 print:hidden">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Ushbu davrda operatsiyalar topilmadi.
                    </td>
                  </tr>
                ) : (
                  entries.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-amber-50/30 dark:hover:bg-gray-800/50 transition">
                      <td className="p-2.5 text-center text-gray-400">{idx + 1}</td>
                      <td className="p-2.5 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>{item.date}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 ml-4">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.time}</span>
                        </div>
                      </td>
                      <td className="p-2.5 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                        {item.docNumber}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        {item.docType === "Mahsulot xaridi" ? (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 font-bold">
                            <Package className="w-3 h-3 mr-1" />
                            Xarid
                          </Badge>
                        ) : item.docType === "To'lov qabuli" ? (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                            <CreditCard className="w-3 h-3 mr-1" />
                            To&apos;lov
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 font-bold">
                            Boshlang&apos;ich
                          </Badge>
                        )}
                      </td>
                      <td className="p-2.5">
                        {item.docType === "Mahsulot xaridi" && item.orderItems && item.orderItems.length > 0 ? (
                          <div className="space-y-1">
                            {item.orderItems.map((prod, pIdx) => (
                              <div key={pIdx} className="flex items-center justify-between text-[11px] bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded-lg">
                                <span className="font-bold text-gray-900 dark:text-white">📦 {prod.name}</span>
                                <span className="text-gray-500 font-medium">
                                  {prod.quantity} {prod.unit} × {formatCurrency(prod.unitPrice)} = <strong>{formatCurrency(prod.totalPrice)}</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">{item.description}</div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold text-blue-700 dark:text-blue-400">
                        {item.debit > 0 ? `+${formatCurrency(item.debit)}` : "-"}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        {item.credit > 0 ? `-${formatCurrency(item.credit)}` : "-"}
                      </td>
                      <td className="p-2.5 text-right font-black">
                        <Badge
                          variant="outline"
                          className={
                            item.balance > 0
                              ? "bg-red-50 text-red-700 border-red-200 font-black text-xs"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs"
                          }
                        >
                          {formatCurrency(Math.abs(item.balance))}
                          {item.balance > 0 ? " (Qarz)" : " (0)"}
                        </Badge>
                      </td>
                      <td className="p-2.5 print:hidden text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.orderId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 cursor-pointer"
                              onClick={() => setViewingOrder(item)}
                              title="Tafsilotlarni ko'rish"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {item.orderId && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 cursor-pointer"
                              onClick={() => setDeletingItem(item)}
                              title="O'chirish"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer signatures */}
          <div className="pt-4 border-t grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="font-bold">Yetkazib beruvchi vakili:</div>
              <div className="border-b border-gray-400 w-48 h-6"></div>
              <div className="text-gray-400 text-[10px]">(imzo, sana, muhr)</div>
            </div>
            <div className="space-y-4 text-right">
              <div className="font-bold">Xaridor (Mijoz) vakili:</div>
              <div className="border-b border-gray-400 w-48 h-6 ml-auto"></div>
              <div className="text-gray-400 text-[10px]">(imzo, sana, muhr)</div>
            </div>
          </div>
        </div>

        {/* VIEW ORDER DIALOG */}
        <OrderViewDialog
          open={!!viewingOrder}
          onOpenChange={(open) => !open && setViewingOrder(null)}
          orderId={viewingOrder?.orderId}
          orderData={viewingOrder}
        />

        {/* DELETE CONFIRM */}
        <DeleteConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          onConfirm={handleDeleteItem}
          title="Hujjatni o'chirish"
          description="Haqiqatan ham ushbu yozuvni o'chirmoqchimisiz?"
        />
      </DialogContent>
    </Dialog>
  )
}
