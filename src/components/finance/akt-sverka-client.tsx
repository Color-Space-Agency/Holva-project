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
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils"
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
  Phone,
  MapPin,
  Building2,
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
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
        📦 {type}
      </span>
    )
  if (type === "To'lov qabuli")
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
        💵 {type}
      </span>
    )
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
      ⏳ {type}
    </span>
  )
}

// ─────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────

export function AktSverkaClient() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), 0, 1)
  const lastDay = new Date(today.getFullYear(), 11, 31)

  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")
  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0])
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
        e.agentName.toLowerCase().includes(q)
    )
  }, [entries, search])

  // ── Summary totals ────────────────────────────────────────────────────────
  const totalDebit = displayed.reduce((s, e) => s + e.debit, 0)
  const totalCredit = displayed.reduce((s, e) => s + e.credit, 0)
  const totalOutstandingDebt = allStoresData.reduce((s, st) => s + Math.max(0, st.currentDebt), 0)
  const netDebt = selectedStoreId === "all" ? totalOutstandingDebt : totalDebit - totalCredit

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePrint = () => window.print()

  const handleExportCSV = () => {
    const headers = [
      "Sana",
      "Mijoz nomi",
      "Hujjat №",
      "Operatsiya turi",
      "Batafsil",
      "Agent",
      "Xarid (Debet)",
      "To'lov (Kredit)",
      "Qoldiq Qarz",
    ]
    const rows = displayed.map((e) => [
      e.fullDate,
      `"${e.storeName}"`,
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
    a.download = `Akt_Sverka_${startDate}_${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Filter Panel ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Store selector */}
          <div className="space-y-1.5 flex-1 max-w-sm">
            <Label className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-600" /> Mijoz (Do'konni tanlash)
            </Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-950 font-medium">
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

          {/* Start date */}
          <div className="space-y-1.5">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold">Boshlanish sanasi</Label>
            <Input
              type="date"
              className="bg-gray-50 dark:bg-gray-950"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End date */}
          <div className="space-y-1.5">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold">Tugash sanasi</Label>
            <Input
              type="date"
              className="bg-gray-50 dark:bg-gray-950"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Search */}
          <div className="space-y-1.5 flex-1 max-w-xs">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Qidirish
            </Label>
            <Input
              placeholder="Mijoz, hujjat, mahsulot..."
              className="bg-gray-50 dark:bg-gray-950"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto print:hidden">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 cursor-pointer rounded-xl">
              <Download className="w-4 h-4 text-emerald-600" /> Excel (CSV)
            </Button>
            <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white gap-2 cursor-pointer rounded-xl shadow-sm">
              <Printer className="w-4 h-4" /> Chop etish
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debit */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami xarid (Debet)</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalDebit)}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Tovar berildi</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Total Credit */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami to'lov (Kredit)</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCredit)}</h3>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Pul qabul qilindi</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Net Debt - PROMINENT HIGHLIGHT */}
        <div className={`rounded-2xl p-4 border shadow-sm flex items-center justify-between transition-all ${
          netDebt > 0
            ? "bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-2 ring-red-400/30"
            : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-1">
              {netDebt > 0 ? "⚠️ Umumiy Qarzdorlik" : "✅ Qoldiq Qarz"}
            </p>
            <h3 className={`text-2xl font-black ${netDebt > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {formatCurrency(Math.abs(netDebt))}
            </h3>
            <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300 mt-0.5">
              {netDebt > 0 ? "Mijozlardan olinishi kerak bo'lgan qarz" : "Qarzdorlik yo'q (0 so'm)"}
            </p>
          </div>
          <div className={`p-3 rounded-2xl ${netDebt > 0 ? "bg-red-100 dark:bg-red-900/40 text-red-600" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"}`}>
            {netDebt > 0 ? (
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
            <p className="text-[11px] text-gray-400 mt-0.5">{stores.length} ta mijoz bo'yicha</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <FileCheck2 className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* ── CUSTOMER DEBT BREAKDOWN CARD (Visible when All Stores is selected) ── */}
      {selectedStoreId === "all" && allStoresData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden print:border-none">
          <div className="bg-gray-50/80 dark:bg-gray-800/80 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Mijozlar Kesimida Qarzdorlik Balansi (Do'konlar Ro'yxati)
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Jami: {allStoresData.length} ta mijoz
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/40 text-xs">
                <TableRow>
                  <TableHead className="font-bold">Mijoz (Do'kon) Nomi</TableHead>
                  <TableHead>Telefon / Manzil</TableHead>
                  <TableHead className="text-right">Boshlang'ich qarz</TableHead>
                  <TableHead className="text-right">Jami xarid</TableHead>
                  <TableHead className="text-right text-emerald-600 dark:text-emerald-400">To'langan</TableHead>
                  <TableHead className="text-right font-black text-red-600 dark:text-red-400">Joriy Qarzdorlik</TableHead>
                  <TableHead className="text-right print:hidden">Batafsil</TableHead>
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
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px]">{storeObj?.address || "-"}</div>
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
                          className="h-8 gap-1 text-xs text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedStoreId(st.storeId)
                          }}
                        >
                          <span>Solishtirish</span>
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

      {/* ── Transaction Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="bg-gray-50/80 dark:bg-gray-800/80 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {selectedStoreId === "all"
                ? "Barcha Xaridlar va To'lovlar Tarixi (Xronologik jadval)"
                : `${stores.find((s) => s.id === selectedStoreId)?.name || 'Mijoz'} bo'yicha batafsil operatsiyalar`}
            </h3>
          </div>
          {selectedStoreId !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStoreId("all")}
              className="text-xs h-8 cursor-pointer"
            >
              ← Barcha mijozlarga qaytish
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[950px]">
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="whitespace-nowrap">Sana va vaqt</TableHead>
                {selectedStoreId === "all" && (
                  <TableHead className="whitespace-nowrap font-bold">Mijoz (Do'kon)</TableHead>
                )}
                <TableHead className="whitespace-nowrap">Hujjat №</TableHead>
                <TableHead className="whitespace-nowrap">Operatsiya turi</TableHead>
                <TableHead>Mahsulotlar va Izoh</TableHead>
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
                  <TableCell colSpan={selectedStoreId === "all" ? 9 : 8} className="h-32 text-center text-gray-500">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedStoreId === "all" ? 9 : 8} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileCheck2 className="w-12 h-12 opacity-30" />
                      <p className="text-sm font-medium">Ushbu davrda oldi-berdi operatsiyalari topilmadi.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Date */}
                    <TableCell className="whitespace-nowrap text-[13px] font-medium">
                      {item.fullDate}
                    </TableCell>

                    {/* Store name (all view) */}
                    {selectedStoreId === "all" && (
                      <TableCell className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {item.storeName}
                      </TableCell>
                    )}

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
        {displayed.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-5 py-4 flex flex-wrap gap-6 justify-end items-center text-sm font-bold print:hidden">
            <span className="text-gray-500 font-medium">
              Jami operatsiyalar: {displayed.length} ta
            </span>
            <span className="text-gray-900 dark:text-white">
              Jami Xarid: {formatCurrency(totalDebit)}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              Jami To'lov: {formatCurrency(totalCredit)}
            </span>
            <span className={`text-base px-3 py-1 rounded-xl ${
              netDebt > 0 
                ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800" 
                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            }`}>
              Umumiy Qarz Qoldig'i: {formatCurrency(Math.abs(netDebt))}{netDebt > 0 ? " (Qarz)" : " (0)"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
