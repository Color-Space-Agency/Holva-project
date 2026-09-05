"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  buildStoreTransactions,
  getStoreSummary,
  TransactionEntry,
} from "@/lib/store-financials"
import { getStoredStores } from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/utils"
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
  Calendar,
  Clock,
  Package,
  CreditCard,
  User,
  Filter,
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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-xs">
        <Package className="w-3 h-3 text-blue-600" />
        {type}
      </span>
    )
  if (type === "To'lov qabuli")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
        <CreditCard className="w-3 h-3 text-emerald-600" />
        {type}
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs">
      <Clock className="w-3 h-3 text-amber-600" />
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
      const found = getStoredStores().find(
        (s) => s.id === storeId || s.name.toLowerCase().trim() === storeId.toLowerCase().trim()
      )
      if (found) setActiveStore(found)
    }
  }, [store, storeId])

  // Date range defaults: current year
  const today = new Date()
  const currentYear = today.getFullYear()
  const firstDayOfYear = `${currentYear}-01-01`
  const lastDayOfYear = `${currentYear}-12-31`

  const [startDate, setStartDate] = useState<string>(firstDayOfYear)
  const [endDate, setEndDate] = useState<string>(lastDayOfYear)
  const [datePreset, setDatePreset] = useState<"all" | "year" | "month" | "today">("year")

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
  const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : summary.currentDebt

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    if (!entries.length) return
    const headers = [
      "Sana",
      "Vaqt",
      "Hujjat №",
      "Operatsiya turi",
      "Nima xarid qilingan / Tafsilotlar",
      "Mas'ul",
      "Xarid (Debet)",
      "To'lov (Kredit)",
      "Qoldiq Qarz",
    ]
    const rows = entries.map((e) => [
      e.date,
      e.time,
      e.docNumber,
      e.docType,
      `"${e.description.replace(/"/g, "'")}"`,
      e.agentName,
      e.debit,
      e.credit,
      e.balance,
    ])
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Boshlang'ich qoldiq</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.initialDebt)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Avvalgi davrdan qarz</p>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Total purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami xaridlar</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.totalDebit)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Tovar berildi</p>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Total payments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami to'lovlar</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalCredit)}
            </h3>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Qabul qilindi</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Current debt — RED & prominent */}
        <div
          className={`rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
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
                summary.currentDebt > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(Math.abs(summary.currentDebt))}
            </h3>
            <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300 mt-0.5">
              {summary.currentDebt > 0 ? "To'lanishi lozim bo'lgan qarz" : "Qarz to'liq yopilgan (0 so'm)"}
            </p>
          </div>
          <div
            className={`p-2.5 rounded-2xl ${
              summary.currentDebt > 0 ? "bg-red-100 dark:bg-red-900/40 text-red-600" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
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

      {/* ── Date Range Filter + Presets + Actions ──────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap items-end gap-4 print:hidden">
        {/* Quick Date Presets */}
        <div className="space-y-1.5">
          <Label className="text-gray-600 dark:text-gray-400 font-semibold text-xs flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Davr
          </Label>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setPreset("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                datePreset === "all"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Hamma vaqt
            </button>
            <button
              type="button"
              onClick={() => setPreset("year")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                datePreset === "year"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Shu yil
            </button>
            <button
              type="button"
              onClick={() => setPreset("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                datePreset === "month"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Shu oy
            </button>
            <button
              type="button"
              onClick={() => setPreset("today")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                datePreset === "today"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Bugun
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400 text-xs">Dan (Sana)</Label>
          <Input
            type="date"
            className="bg-gray-50 dark:bg-gray-950 h-10 rounded-xl"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setDatePreset("year")
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-semibold text-gray-600 dark:text-gray-400 text-xs">Gacha (Sana)</Label>
          <Input
            type="date"
            className="bg-gray-50 dark:bg-gray-950 h-10 rounded-xl"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setDatePreset("year")
            }}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-white rounded-xl h-10">
            <Download className="w-4 h-4 text-emerald-600" /> Excel (CSV)
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm rounded-xl h-10"
          >
            <Printer className="w-4 h-4" /> Chop etish
          </Button>
        </div>
      </div>

      {/* ── Transaction Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[950px]">
            <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80 text-xs">
              <TableRow>
                <TableHead className="whitespace-nowrap font-bold">Sana va vaqt</TableHead>
                <TableHead className="whitespace-nowrap font-bold">Hujjat №</TableHead>
                <TableHead className="whitespace-nowrap font-bold">Operatsiya turi</TableHead>
                <TableHead className="font-bold min-w-[320px]">Nima xarid qilingan / Tafsilotlar</TableHead>
                <TableHead className="whitespace-nowrap font-bold">Mas'ul</TableHead>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreset("all")}
                        className="text-xs text-amber-600 border-amber-300"
                      >
                        Barcha vaqtdagi operatsiyalarni ko'rish
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Date and Time */}
                    <TableCell className="whitespace-nowrap py-3">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5 ml-5">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{item.time}</span>
                      </div>
                    </TableCell>

                    {/* Doc number */}
                    <TableCell className="whitespace-nowrap py-3">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                        {item.docNumber}
                      </span>
                    </TableCell>

                    {/* Doc type badge */}
                    <TableCell className="whitespace-nowrap py-3">
                      <DocTypeBadge type={item.docType} />
                    </TableCell>

                    {/* WHAT WAS BOUGHT (ITEMIZED DETAILS) */}
                    <TableCell className="py-3 max-w-[380px]">
                      {item.docType === "Mahsulot xaridi" && item.orderItems && item.orderItems.length > 0 ? (
                        <div className="space-y-1.5">
                          {item.orderItems.map((prod, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between gap-2 text-xs bg-gray-50/80 dark:bg-gray-800/60 p-2 rounded-xl border border-gray-100 dark:border-gray-800"
                            >
                              <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>{prod.name}</span>
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 font-medium text-[11px] shrink-0">
                                <span className="text-amber-700 dark:text-amber-400 font-bold">
                                  {prod.quantity} {prod.unit}
                                </span>
                                <span className="mx-1 text-gray-400">×</span>
                                <span>{formatCurrency(prod.unitPrice)}</span>
                                <span className="mx-1 text-gray-400">=</span>
                                <span className="font-black text-gray-900 dark:text-white">
                                  {formatCurrency(prod.totalPrice)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : item.docType === "To'lov qabuli" ? (
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Mijoz tomonidan to'lov amalga oshirildi ({formatCurrency(item.credit)})</span>
                        </div>
                      ) : (
                        <div className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{item.description}</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Agent */}
                    <TableCell className="whitespace-nowrap text-xs text-gray-500 py-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{item.agentName}</span>
                      </div>
                    </TableCell>

                    {/* Debit */}
                    <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap py-3">
                      {item.debit > 0 ? (
                        <span className="text-blue-700 dark:text-blue-400">+{formatCurrency(item.debit)}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Credit */}
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap py-3">
                      {item.credit > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">-{formatCurrency(item.credit)}</span>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    {/* Running Debt Balance */}
                    <TableCell className="text-right whitespace-nowrap font-black py-3">
                      <Badge
                        variant="outline"
                        className={
                          item.balance > 0
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 text-xs px-2.5 py-1 font-black shadow-xs"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 text-xs px-2.5 py-1 font-bold shadow-xs"
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
            <span className="text-gray-500 font-medium">Jami operatsiyalar: {entries.length} ta</span>
            <span className="text-gray-900 dark:text-white">
              Davr xaridi: <span className="text-blue-600">{formatCurrency(totalDebit)}</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Davr to'lovi: {formatCurrency(totalCredit)}
            </span>
            <span
              className={`text-base px-3 py-1.5 rounded-xl font-black ${
                finalBalance > 0
                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                  : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              Davr oxiriga Qarz Qoldig'i: {formatCurrency(Math.abs(finalBalance))}
              {finalBalance > 0 ? " (Qarz)" : " (0)"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
