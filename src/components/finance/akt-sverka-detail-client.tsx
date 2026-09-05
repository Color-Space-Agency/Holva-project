"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  buildStoreTransactions,
  getStoreSummary,
  TransactionEntry,
} from "@/lib/store-financials"
import { getStoredStores } from "@/lib/mock-data"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Wallet,
  ShoppingCart,
} from "lucide-react"
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

// ─────────────────────────────────────────────────────
// DocType badge
// ─────────────────────────────────────────────────────
function DocTypeBadge({ type }: { type: string }) {
  if (type === "Mahsulot xaridi")
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
        {type}
      </span>
    )
  if (type === "To'lov qabuli")
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        {type}
      </span>
    )
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
      {type}
    </span>
  )
}

// ─────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────
interface Props {
  store?: any
  storeId?: string
}

// ─────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────
export function AktSverkaDetailClient({ store, storeId }: Props) {
  // Resolve active store from prop or storeId
  const [activeStore, setActiveStore] = useState<any>(store || null)

  useEffect(() => {
    if (store) {
      setActiveStore(store)
    } else if (storeId) {
      const found = getStoredStores().find((s) => s.id === storeId)
      if (found) setActiveStore(found)
    }
  }, [store, storeId])

  // Date range defaults: current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0])

  // Summary (all-time, no date filter) for top cards
  const summary = useMemo(() => {
    if (!activeStore) return { initialDebt: 0, totalDebit: 0, totalCredit: 0, currentDebt: 0 }
    return getStoreSummary(activeStore.id)
  }, [activeStore])

  // Filtered entries for the table
  const { data: entries = [], isLoading, refetch } = useQuery<TransactionEntry[]>({
    queryKey: ["akt-sverka-detail", activeStore?.id, startDate, endDate],
    enabled: !!activeStore,
    queryFn: () => buildStoreTransactions(activeStore!.id, startDate, endDate),
    staleTime: 0,
  })

  // Listen for store / order updates
  useEffect(() => {
    const handle = () => refetch()
    window.addEventListener("orders-updated", handle)
    window.addEventListener("stores-updated", handle)
    return () => {
      window.removeEventListener("orders-updated", handle)
      window.removeEventListener("stores-updated", handle)
    }
  }, [refetch])

  // Totals for the filtered period
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    if (!entries.length) return
    const headers = [
      "Sana",
      "Hujjat №",
      "Operatsiya turi",
      "Batafsil",
      "Agent",
      "Qarz (Debet)",
      "To'lov (Kredit)",
      "Qoldiq",
    ]
    const rows = entries.map((e) => [
      e.fullDate,
      e.docNumber,
      e.docType,
      `"${e.description.replace(/"/g, "'")}"`,
      e.agentName,
      e.debit,
      e.credit,
      e.balance,
    ])
    const csv =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Akt_Sverka_${activeStore?.name || "do'kon"}_${startDate}_${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Guard: no store yet
  if (!activeStore) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-gray-400 gap-4">
        <FileCheck2 className="w-14 h-14 opacity-30" />
        <p className="text-sm font-medium">Do'kon ma'lumotlari yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Cards 2x2 ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Initial debt */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Boshlang'ich qoldiq</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.initialDebt)}
            </h3>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-full">
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Total purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami xaridlar</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalDebit)}
            </h3>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Total payments */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami to'lovlar</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalCredit)}
            </h3>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Current debt — RED & prominent */}
        <div
          className={`rounded-xl p-4 border shadow-sm flex items-center justify-between transition-all ${
            summary.currentDebt > 0
              ? "bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-2 ring-red-400/30"
              : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
              {summary.currentDebt > 0 ? "⚠️ Joriy Qarzdorlik" : "✅ Qoldiq Qarz"}
            </p>
            <h3
              className={`text-2xl font-black ${
                summary.currentDebt > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(Math.abs(summary.currentDebt))}
            </h3>
            <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300 mt-0.5">
              {summary.currentDebt > 0 ? "To'lanishi lozim bo'lgan qarz" : "Qarz to'liq yopilgan"}
            </p>
          </div>
          <div
            className={`p-2.5 rounded-full ${
              summary.currentDebt > 0
                ? "bg-red-100 dark:bg-red-900/40 text-red-600"
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
            }`}
          >
            {summary.currentDebt > 0 ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
        </div>
      </div>

      {/* ── Date Range Filter + Actions ──────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-end gap-4 print:hidden">
        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400">Dan (Sana)</Label>
          <Input
            type="date"
            className="bg-gray-50 dark:bg-gray-950"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400">Gacha (Sana)</Label>
          <Input
            type="date"
            className="bg-gray-50 dark:bg-gray-950"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
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

      {/* ── Transaction Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[850px]">
            <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80">
              <TableRow>
                <TableHead className="whitespace-nowrap">Sana va vaqt</TableHead>
                <TableHead className="whitespace-nowrap">Hujjat №</TableHead>
                <TableHead className="whitespace-nowrap">Operatsiya turi</TableHead>
                <TableHead>Mahsulotlar va Batafsil izoh</TableHead>
                <TableHead className="whitespace-nowrap">Mas'ul</TableHead>
                <TableHead className="text-right text-gray-900 dark:text-white font-bold whitespace-nowrap">
                  Xarid (Debet)
                </TableHead>
                <TableHead className="text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                  To'lov (Kredit)
                </TableHead>
                <TableHead className="text-right font-black text-red-600 dark:text-red-400 whitespace-nowrap">
                  Qoldiq Qarz
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileCheck2 className="w-12 h-12 opacity-30" />
                      <p className="text-sm font-medium">Ushbu davrda oldi-berdi operatsiyalari topilmadi.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-[13px] font-medium">
                      {item.fullDate}
                    </TableCell>

                    {/* Doc number */}
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-[13px]">
                        {item.docNumber}
                      </span>
                    </TableCell>

                    {/* Doc type badge */}
                    <TableCell className="whitespace-nowrap">
                      <DocTypeBadge type={item.docType} />
                    </TableCell>

                    {/* Description */}
                    <TableCell className="max-w-md">
                      <p className="text-[13px] text-gray-800 dark:text-gray-200 font-medium">
                        {item.description}
                      </p>
                    </TableCell>

                    {/* Agent */}
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                      {item.agentName}
                    </TableCell>

                    {/* Debit */}
                    <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                    </TableCell>

                    {/* Credit */}
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                    </TableCell>

                    {/* Running Debt Balance */}
                    <TableCell className="text-right whitespace-nowrap font-black">
                      <Badge
                        variant="outline"
                        className={
                          item.balance > 0
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 text-xs px-2.5 py-1 font-bold"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 text-xs px-2.5 py-1 font-bold"
                        }
                      >
                        {formatCurrency(Math.abs(item.balance))}
                        {item.balance > 0 ? " (Qarz)" : " (0)"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer totals row */}
        {entries.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-5 py-4 flex flex-wrap gap-6 justify-end items-center text-sm font-bold print:hidden">
            <span className="text-gray-500 font-medium">
              Jami operatsiyalar: {entries.length} ta
            </span>
            <span className="text-gray-900 dark:text-white">
              Davr xaridi: {formatCurrency(totalDebit)}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Davr to'lovi: {formatCurrency(totalCredit)}
            </span>
            <span className={`text-base px-3 py-1 rounded-lg ${
              finalBalance > 0 
                ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" 
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            }`}>
              Davr oxiriga Qarz Qoldig'i: {formatCurrency(Math.abs(finalBalance))}{finalBalance > 0 ? " (Qarz)" : " (0)"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
