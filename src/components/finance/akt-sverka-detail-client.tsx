"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getStoredOrders, deleteStoredOrder, updateStoredOrder, updateStoredStore, getStoredStores, MockStore } from "@/lib/mock-data"
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils"
import { 
  Download, Printer, ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar as CalendarIcon, CheckCircle2, 
  Clock, Edit, FileCheck2, Trash, Eye
} from "lucide-react"
import { OrderViewDialog } from "@/components/orders/order-view-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { toast } from "sonner"

interface Props {
  store?: MockStore | any
  storeId?: string
}

export function AktSverkaDetailClient({ store, storeId }: Props) {
  const [activeStore, setActiveStore] = useState<any>(store || null)

  useEffect(() => {
    if (store) {
      setActiveStore(store)
    } else if (storeId) {
      const found = getStoredStores().find((s) => s.id === storeId)
      if (found) setActiveStore(found)
    }
  }, [store, storeId])

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0])

  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [editDebitVal, setEditDebitVal] = useState<number>(0)
  const [editCreditVal, setEditCreditVal] = useState<number>(0)
  const [editDescVal, setEditDescVal] = useState<string>("")

  const { data: entries, isLoading, refetch } = useQuery({
    queryKey: ["akt-sverka-detail", activeStore?.id, startDate, endDate],
    enabled: !!activeStore,
    queryFn: () => {
      const orders = getStoredOrders().filter((o: any) => o.stores?.name === activeStore.name || o.store_name === activeStore.name || o.store_id === activeStore.id)
      
      const list: any[] = []
      
      orders.forEach((ord: any) => {
        const ordDate = ord.created_at ? ord.created_at.split("T")[0] : "2026-08-29"
        const agentName = ord.agent_name || (ord.profiles?.first_name ? `${ord.profiles.first_name} ${ord.profiles.last_name || ''}`.trim() : null) || "Sardor Rahimov"
        
        let editedAtStr: string | null = null
        if (ord.updated_at && ord.created_at && ord.updated_at !== ord.created_at) {
          try {
            const cTime = new Date(ord.created_at).getTime()
            const uTime = new Date(ord.updated_at).getTime()
            if (!isNaN(cTime) && !isNaN(uTime) && uTime > cTime) {
              const formatted = formatDateTime(ord.updated_at)
              if (formatted && !formatted.toLowerCase().includes("invalid") && formatted !== "—") {
                editedAtStr = formatted
              }
            }
          } catch {}
        }
        
        // Debit
        if (ord.order_items && ord.order_items.length > 0) {
          ord.order_items.forEach((item: any, idx: number) => {
            const itemTotal = (item.quantity || 0) * (item.price || 0)
            if (itemTotal > 0) {
              list.push({
                id: `ord-${ord.id}-item-${idx}`,
                rawOrdId: ord.id,
                date: ordDate,
                fullDate: ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? formatDateTime(ord.created_at) : ordDate,
                timestamp: (ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? new Date(ord.created_at).getTime() : Date.now()) + idx,
                docNumber: ord.order_number,
                docType: "Mahsulot xaridi",
                description: `${item.products?.name || 'Mahsulot'} - ${formatNumber(item.quantity || 0)} ${item.products?.unit || 'dona'} x ${formatCurrency(item.price || 0)}`,
                receiver: agentName,
                debit: itemTotal,
                credit: 0,
                editedAt: editedAtStr,
                editedBy: editedAtStr ? "Super Admin" : null,
              })
            }
          })
        } else if (ord.total_amount > 0) {
          list.push({
            id: `ord-${ord.id}`,
            rawOrdId: ord.id,
            date: ordDate,
            fullDate: ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? formatDateTime(ord.created_at) : ordDate,
            timestamp: (ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? new Date(ord.created_at).getTime() : Date.now()),
            docNumber: ord.order_number,
            docType: "Umumiy xarid",
            description: "Mahsulotlar xaridi (qisqacha)",
            receiver: agentName,
            debit: ord.total_amount,
            credit: 0,
            editedAt: editedAtStr,
            editedBy: editedAtStr ? "Super Admin" : null,
          })
        }
        
        // Credit
        if (ord.paid_amount > 0) {
          list.push({
            id: `pay-${ord.id}`,
            rawOrdId: ord.id,
            date: ordDate,
            fullDate: ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? formatDateTime(ord.created_at) : ordDate,
            timestamp: (ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? new Date(ord.created_at).getTime() : Date.now()) + 1000,
            docNumber: `TOL-${ord.order_number.replace("HLV-", "").replace("ORD-", "")}`,
            docType: "To'lov qabuli",
            description: "Mijoz tomonidan to'lov amalga oshirildi",
            receiver: agentName,
            debit: 0,
            credit: ord.paid_amount,
            editedAt: null,
            editedBy: null,
          })
        }
      })
      
      list.sort((a, b) => a.timestamp - b.timestamp)
      const inRange = list.filter(item => item.date >= startDate && item.date <= endDate)
      
      let runningBalance = 0
      const processed = inRange.map(item => {
        runningBalance += (item.debit - item.credit)
        return { ...item, balance: runningBalance }
      })

      const totalDebit = processed.reduce((sum, i) => sum + i.debit, 0)
      const totalCredit = processed.reduce((sum, i) => sum + i.credit, 0)
      const finalBalance = processed.length > 0 ? processed[processed.length - 1].balance : 0

      return { entries: processed, totalDebit, totalCredit, finalBalance }
    }
  })

  useEffect(() => {
    const handleUpdate = () => refetch()
    window.addEventListener("orders-updated", handleUpdate)
    window.addEventListener("stores-updated", handleUpdate)
    return () => {
      window.removeEventListener("orders-updated", handleUpdate)
      window.removeEventListener("stores-updated", handleUpdate)
    }
  }, [refetch])

  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    if (!entries) return
    const headers = ["Sana", "Hujjat", "Operatsiya", "Batafsil / Mahsulot", "Qabul qildi", "Qarz (Debet)", "To'lov (Kredit)", "Qoldiq"]
    const rows = entries.entries.map((e) => [
      e.fullDate, e.docNumber, e.docType, `"${e.description}"`, e.receiver, e.debit, e.credit, e.balance
    ])
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Akt_Sverka_Batafsil_${store?.name}.csv`)
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
        const ordId = editItem.rawOrdId || editItem.id.replace("ord-", "").split("-item-")[0]
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
      refetch()
    } catch {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleDeleteItem = () => {
    if (!deletingItem) return
    try {
      if (deletingItem.id.startsWith("ord-")) {
        const ordId = deletingItem.rawOrdId || deletingItem.id.replace("ord-", "").split("-item-")[0]
        deleteStoredOrder(ordId)
        if (deletingItem.docNumber) deleteStoredOrder(deletingItem.docNumber)
        toast.success("Sotuv hujjati o'chirildi")
      } else if (deletingItem.id.startsWith("pay-")) {
        const ordId = deletingItem.rawOrdId || deletingItem.id.replace("pay-", "")
        updateStoredOrder(ordId, { paid_amount: 0, payment_status: "PENDING", updated_at: new Date().toISOString() })
        toast.success("To'lov yozuvi o'chirildi")
      }
      refetch()
    } catch {
      toast.error("Xatolik yuz berdi")
    } finally {
      setDeletingItem(null)
    }
  }

  if (!store) return null

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-end gap-4 print:hidden shadow-sm">
        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400">Dan (Sana)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="date" className="pl-9 bg-gray-50 dark:bg-gray-950" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400">Gacha (Sana)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="date" className="pl-9 bg-gray-50 dark:bg-gray-950" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-white">
            <Download className="w-4 h-4 text-emerald-600" /> Excel
          </Button>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Chop etish
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {entries && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Jami xarid (Debet)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(entries.totalDebit)}</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
              <ArrowUpRight className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Qabul qilingan to'lov</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(entries.totalCredit)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Qarzdorlik qoldig'i</p>
              <h3 className={`text-xl sm:text-2xl font-bold ${entries.finalBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(Math.abs(entries.finalBalance))}
              </h3>
            </div>
            <div className={`p-3 rounded-full ${entries.finalBalance > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
              {entries.finalBalance > 0 ? <AlertCircle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/80">
              <TableRow>
                <TableHead className="whitespace-nowrap">Sana va vaqt</TableHead>
                <TableHead className="whitespace-nowrap">Hujjat / Qabul qildi</TableHead>
                <TableHead className="whitespace-nowrap">Mahsulot / Harakat batafsil</TableHead>
                <TableHead className="text-right text-red-600 dark:text-red-400 whitespace-nowrap">Xarid (Qarz)</TableHead>
                <TableHead className="text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">To'lov qildi</TableHead>
                <TableHead className="text-right font-bold whitespace-nowrap">Joriy qoldiq</TableHead>
                <TableHead className="w-[80px] print:hidden text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-gray-500">Yuklanmoqda...</TableCell></TableRow>
              ) : entries?.entries.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-gray-500">Bu davrda oldi-berdi topilmadi.</TableCell></TableRow>
              ) : (
                entries?.entries.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium text-[13px]">{item.fullDate}</div>
                      {item.editedAt && (
                        <div className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium" title={`O'zgartirgan: ${item.editedBy}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          Tahrirlangan: {item.editedAt}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{item.docNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Agent: {item.receiver}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[13px] text-gray-800 dark:text-gray-200 font-medium">{item.description}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                        {item.docType || "Harakat"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
                      <Badge variant="outline" className={item.balance > 0 ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"}>
                        {formatCurrency(Math.abs(item.balance))}
                        {item.balance > 0 ? " (Qarz)" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="print:hidden text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingOrder(item)
                          }}
                          title="Hujjatni to'liq ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600" onClick={() => openEdit(item)} title="Tahrirlash">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-600" onClick={() => setDeletingItem(item)} title="O'chirish">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Yozuvni tahrirlash</DialogTitle></DialogHeader>
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
              <Button onClick={handleSaveEdit} className="bg-amber-600 hover:bg-amber-700 text-white">Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <DeleteConfirmDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteItem}
        title="Yozuvni o'chirish"
        description="Haqiqatan ham solishtirma dalolatnomadagi ushbu yozuvni o'chirmoqchimisiz?"
      />

      <OrderViewDialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
        orderId={viewingOrder?.rawOrdId}
        orderData={viewingOrder}
      />
    </div>
  )
}
