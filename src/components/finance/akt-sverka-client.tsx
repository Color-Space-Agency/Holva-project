"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  buildStoreTransactions,
  buildAllStoresFinancials,
  TransactionEntry,
  StoreFinancials,
} from "@/lib/store-financials"
import {
  getStoredStores,
  getStoredOrders,
  syncStoresFromServer,
  syncOrdersFromServer,
  INITIAL_STORES,
  INITIAL_ORDERS,
} from "@/lib/mock-data"
import { formatCurrency, formatNumber } from "@/lib/utils"
import {
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Search,
  Store as StoreIcon,
  ChevronRight,
  Building2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─────────────────────────────────────────────────────
// Helper: docType badge
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
// Main component
// ─────────────────────────────────────────────────────
export function AktSverkaClient() {
  const today = new Date()
  const currentYear = today.getFullYear()
  const firstDayOfYear = `${currentYear}-01-01`
  const lastDayOfYear = `${currentYear}-12-31`

  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>(firstDayOfYear)
  const [endDate, setEndDate] = useState<string>(lastDayOfYear)
  const [datePreset, setDatePreset] = useState<"all" | "year" | "month" | "today">("year")
  const [search, setSearch] = useState("")
  const [stores, setStores] = useState(() => getStoredStores())

  // Force seed if empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const curStores = getStoredStores()
      const curOrders = getStoredOrders()
      if (curStores.length === 0) {
        localStorage.setItem("holva_crm_stored_stores", JSON.stringify(INITIAL_STORES))
        setStores(INITIAL_STORES)
      }
      if (curOrders.length === 0) {
        localStorage.setItem("holva_crm_stored_orders", JSON.stringify(INITIAL_ORDERS))
      }
    }
  }, [])

  // ── Date presets handlers ──────────────────────────────────────────────────
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

  // ── Query for transactions ────────────────────────────────────────────────
  const { data: entries = [], isLoading, refetch } = useQuery<TransactionEntry[]>({
    queryKey: ["akt-sverka-report", selectedStoreId, startDate, endDate],
    queryFn: () => buildStoreTransactions(selectedStoreId, startDate, endDate),
    staleTime: 0,
  })

  // ── Query for all store financials summary ────────────────────────────────
  const allStoresData = useMemo(() => buildAllStoresFinancials(), [stores, entries])

  // ── Sync on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    syncStoresFromServer().then(() => setStores(getStoredStores()))
    syncOrdersFromServer().then(() => refetch())
  }, [refetch])

  // ── Listen for updates ───────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      setStores(getStoredStores())
      refetch()
    }
    window.addEventListener("stores-updated", handle)
    window.addEventListener("orders-updated", handle)
    return () => {
      window.removeEventListener("stores-updated", handle)
      window.removeEventListener("orders-updated", handle)
    }
  }, [refetch])

  // ── Client-side search filter ─────────────────────────────────────────────
  const displayed = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(
      (e) =>
        e.storeName.toLowerCase().includes(q) ||
        e.docNumber.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.agentName.toLowerCase().includes(q) ||
        e.orderItems.some((it) => it.name.toLowerCase().includes(q))
    )
  }, [entries, search])

  // ── Summary totals ────────────────────────────────────────────────────────
  const totalDebit = displayed.reduce((s, e) => s + e.debit, 0)
  const totalCredit = displayed.reduce((s, e) => s + e.credit, 0)
  const totalOutstandingDebt = allStoresData.reduce((s, st) => s + Math.max(0, st.currentDebt), 0)

  // Single store active debt vs all stores
  const selectedStoreDebt = useMemo(() => {
    if (selectedStoreId === "all") return totalOutstandingDebt
    const matched = allStoresData.find((st) => st.storeId === selectedStoreId || st.storeName.toLowerCase() === selectedStoreId.toLowerCase())
    return matched ? matched.currentDebt : totalDebit - totalCredit
  }, [selectedStoreId, allStoresData, totalOutstandingDebt, totalDebit, totalCredit])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const headers = [
      "Sana",
      "Vaqt",
      "Mijoz nomi",
      "Hujjat №",
      "Operatsiya turi",
      "Nima xarid qilingan",
      "Mas'ul",
      "Xarid (Debet)",
      "To'lov (Kredit)",
      "Qoldiq Qarz",
    ]
    const rows = displayed.map((e) => [
      e.date,
      e.time,
      `"${e.storeName}"`,
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
    a.download = `Akt_Sverka_${selectedStoreId === "all" ? "Barcha_Mijozlar" : "Mijoz"}_${startDate}_${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Filter Panel ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Store selector */}
          <div className="space-y-1.5 flex-1 max-w-sm">
            <Label className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-600" /> Mijoz (Kontragent tanlash)
            </Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-950 font-medium h-10 rounded-xl">
                <SelectValue placeholder="Do'konni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold text-amber-700 dark:text-amber-400">
                  🏢 Barcha mijozlar (Umumiy solishtirma)
                </SelectItem>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          {/* Start date */}
          <div className="space-y-1.5">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold text-xs">Dan (Sana)</Label>
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

          {/* End date */}
          <div className="space-y-1.5">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold text-xs">Gacha (Sana)</Label>
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

          {/* Search */}
          <div className="space-y-1.5 flex-1 max-w-xs">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold text-xs flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Qidiruv
            </Label>
            <Input
              placeholder="Mijoz, mahsulot, hujjat..."
              className="bg-gray-50 dark:bg-gray-950 h-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto print:hidden">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 cursor-pointer rounded-xl h-10">
              <Download className="w-4 h-4 text-emerald-600" /> CSV
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 cursor-pointer rounded-xl h-10 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Chop etish
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debit */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami xarid (Debet)</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalDebit)}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Mijozga tovar berildi</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Total Credit */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Qabul qilingan to'lov (Kredit)</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCredit)}</h3>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Pul qabul qilindi</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Net Debt - PROMINENT HIGHLIGHT */}
        <div
          className={`rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
            selectedStoreDebt > 0
              ? "bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-2 ring-red-400/30"
              : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
              {selectedStoreDebt > 0 ? "⚠️ Joriy Qarzdorlik Qoldig'i" : "✅ Qoldiq Qarzdorlik"}
            </p>
            <h3
              className={`text-2xl font-black ${
                selectedStoreDebt > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(Math.abs(selectedStoreDebt))}
            </h3>
            <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300 mt-0.5">
              {selectedStoreDebt > 0 ? "Mijozdan olinishi lozim bo'lgan qarz" : "Qarz to'liq yopilgan (0 so'm)"}
            </p>
          </div>
          <div
            className={`p-3 rounded-2xl ${
              selectedStoreDebt > 0
                ? "bg-red-100 dark:bg-red-900/40 text-red-600"
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"
            }`}
          >
            {selectedStoreDebt > 0 ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
        </div>

        {/* Transaction count */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Operatsiyalar soni</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayed.length} ta</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {selectedStoreId === "all" ? `${stores.length} ta mijoz bo'yicha` : "Ushbu mijoz bo'yicha"}
            </p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <FileCheck2 className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* ── CUSTOMER DEBT BREAKDOWN (Visible when All is selected) ────────── */}
      {selectedStoreId === "all" && allStoresData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden print:border-none">
          <div className="bg-gray-50/80 dark:bg-gray-800/80 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Mijozlar Ro'yxati va Ularning Joriy Qoldiq Qarzdorligi
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">Jami: {allStoresData.length} ta mijoz</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/40 text-xs">
                <TableRow>
                  <TableHead className="font-bold">Mijoz (Do'kon) Nomi</TableHead>
                  <TableHead>Telefon / Manzil</TableHead>
                  <TableHead className="text-right">Boshlang'ich qarz</TableHead>
                  <TableHead className="text-right">Jami xarid (Debet)</TableHead>
                  <TableHead className="text-right text-emerald-600 dark:text-emerald-400">To'langan (Kredit)</TableHead>
                  <TableHead className="text-right font-black text-red-600 dark:text-red-400">Joriy Qarzdorlik</TableHead>
                  <TableHead className="text-right print:hidden">Batafsil ko'rish</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allStoresData.map((st) => {
                  const storeObj = stores.find((s) => s.id === st.storeId || s.name === st.storeName)
                  return (
                    <TableRow
                      key={st.storeId}
                      className="hover:bg-amber-50/30 dark:hover:bg-gray-800/50 transition cursor-pointer"
                      onClick={() => setSelectedStoreId(st.storeId)}
                    >
                      <TableCell className="font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <StoreIcon className="w-4 h-4 text-amber-600" />
                          <span>{st.storeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        <div>{storeObj?.phone || "-"}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                          {storeObj?.address || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(st.initialDebt)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-gray-900 dark:text-white">
                        {formatCurrency(st.totalDebit)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(st.totalCredit)}
                      </TableCell>
                      <TableCell className="text-right font-black">
                        <Badge
                          variant="outline"
                          className={
                            st.currentDebt > 0
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 text-xs px-3 py-1 font-bold"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900 text-xs px-3 py-1 font-bold"
                          }
                        >
                          {formatCurrency(Math.abs(st.currentDebt))}
                          {st.currentDebt > 0 ? " (Qarz)" : " (0)"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer font-semibold"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStoreId(st.storeId)
                          }}
                        >
                          <span>Akt Sverka</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Chronological Ledger Table ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 dark:bg-gray-800/80 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {selectedStoreId === "all"
                ? "Barcha Mijozlar Bo'yicha Xaridlar, To'lovlar va Qarzlar Xronologiyasi"
                : `${stores.find((s) => s.id === selectedStoreId)?.name || "Mijoz"} bilan o'zaro hisob-kitoblar (Akt Sverka)`}
            </h3>
          </div>
          {selectedStoreId !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStoreId("all")}
              className="text-xs h-8 cursor-pointer rounded-lg"
            >
              ← Barcha mijozlarga qaytish
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1050px]">
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 text-xs">
              <TableRow>
                <TableHead className="whitespace-nowrap font-bold">Sana va vaqt</TableHead>
                {selectedStoreId === "all" && (
                  <TableHead className="whitespace-nowrap font-bold">Mijoz (Do'kon)</TableHead>
                )}
                <TableHead className="whitespace-nowrap font-bold">Hujjat №</TableHead>
                <TableHead className="whitespace-nowrap font-bold">Operatsiya turi</TableHead>
                <TableHead className="font-bold min-w-[320px]">Nima xarid qilingan / Tafsilotlar</TableHead>
                <TableHead className="whitespace-nowrap font-bold">Mas'ul</TableHead>
                <TableHead className="text-right text-gray-900 dark:text-white font-bold whitespace-nowrap">
                  Xarid (Debet)
                </TableHead>
                <TableHead className="text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                  To'langan (Kredit)
                </TableHead>
                <TableHead className="text-right font-black text-red-600 dark:text-red-400 whitespace-nowrap">
                  Qoldiq Qarz
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={selectedStoreId === "all" ? 9 : 8} className="h-32 text-center text-gray-500">
                    Ma'lumotlar yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedStoreId === "all" ? 9 : 8} className="h-40 text-center">
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
                displayed.map((item) => (
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

                    {/* Store name (all view) */}
                    {selectedStoreId === "all" && (
                      <TableCell className="py-3">
                        <div
                          className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 cursor-pointer hover:text-amber-600 transition"
                          onClick={() => setSelectedStoreId(item.storeId)}
                        >
                          <StoreIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{item.storeName}</span>
                        </div>
                      </TableCell>
                    )}

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
        {displayed.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-5 py-4 flex flex-wrap gap-6 justify-end items-center text-sm font-bold print:hidden">
            <span className="text-gray-500 font-medium">Jami operatsiyalar: {displayed.length} ta</span>
            <span className="text-gray-900 dark:text-white">
              Jami Xarid: <span className="text-blue-600">{formatCurrency(totalDebit)}</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Jami To'lov: {formatCurrency(totalCredit)}
            </span>
            <span
              className={`text-base px-3 py-1.5 rounded-xl font-black ${
                selectedStoreDebt > 0
                  ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800"
                  : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              Umumiy Qarz Qoldig'i: {formatCurrency(Math.abs(selectedStoreDebt))}
              {selectedStoreDebt > 0 ? " (Qarz)" : " (0)"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
