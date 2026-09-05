"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  buildStoreTransactions,
  buildAllStoresFinancials,
  TransactionEntry,
} from "@/lib/store-financials"
import {
  getStoredStores,
  syncStoresFromServer,
  syncOrdersFromServer,
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
  Eye,
  Search,
  Store,
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
  // Boshlang'ich qoldiq
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
      {type}
    </span>
  )
}

// ─────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────

export function AktSverkaClient() {
  // ── Date defaults ────────────────────────────────────────────────────────
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), 0, 1)
  const lastDay = new Date(today.getFullYear(), 11, 31)

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")
  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0])
  const [search, setSearch] = useState("")
  const [stores, setStores] = useState(() => getStoredStores())

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data: entries = [], isLoading, refetch } = useQuery<TransactionEntry[]>({
    queryKey: ["akt-sverka-report", selectedStoreId, startDate, endDate],
    queryFn: () => buildStoreTransactions(selectedStoreId, startDate, endDate),
    staleTime: 0,
  })

  // ── Sync on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    syncStoresFromServer().then(() => setStores(getStoredStores()))
    syncOrdersFromServer().then(() => refetch())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Listen for store / order updates ─────────────────────────────────────
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
  const netDebt = totalDebit - totalCredit

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
      "Qarz (Debet)",
      "To'lov (Kredit)",
      "Qoldiq",
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
    <div className="space-y-6">
      {/* ── Filter Panel ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Store selector */}
          <div className="space-y-1.5 flex-1 max-w-sm">
            <Label className="text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Mijoz (Do'kon)
            </Label>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-950">
                <SelectValue placeholder="Do'konni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha mijozlar (Umumiy)</SelectItem>
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
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="w-4 h-4 text-emerald-600" /> Excel
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" /> Chop etish
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Debit */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami xarid (Debet)</p>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDebit)}</h3>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </div>
        </div>

        {/* Total Credit */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Jami to'lov (Kredit)</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCredit)}</h3>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        {/* Net Debt */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Umumiy qarz</p>
            <h3 className={`text-xl font-bold ${netDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatCurrency(Math.abs(netDebt))}
            </h3>
          </div>
          <div className={`p-2 rounded-full ${netDebt > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"}`}>
            {netDebt > 0 ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
          </div>
        </div>

        {/* Transaction count */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">Operatsiyalar soni</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayed.length}</h3>
          </div>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <FileCheck2 className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* ── Transaction Table ────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-gray-50/80 dark:bg-gray-800/80">
              <TableRow>
                <TableHead className="whitespace-nowrap">Sana</TableHead>
                {selectedStoreId === "all" && (
                  <TableHead className="whitespace-nowrap">Mijoz nomi</TableHead>
                )}
                <TableHead className="whitespace-nowrap">Hujjat №</TableHead>
                <TableHead className="whitespace-nowrap">Operatsiya turi</TableHead>
                <TableHead>Batafsil</TableHead>
                <TableHead className="whitespace-nowrap">Agent</TableHead>
                <TableHead className="text-right text-red-600 dark:text-red-400 whitespace-nowrap">
                  Qarz (Debet)
                </TableHead>
                <TableHead className="text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  To'lov (Kredit)
                </TableHead>
                <TableHead className="text-right font-bold whitespace-nowrap">Qoldiq</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileCheck2 className="w-12 h-12 opacity-30" />
                      <p className="text-sm font-medium">Ushbu sanada oldi-berdi topilmadi.</p>
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
                      <TableCell className="font-medium whitespace-nowrap">{item.storeName}</TableCell>
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
                    <TableCell className="max-w-xs">
                      <p className="text-[13px] text-gray-800 dark:text-gray-200 line-clamp-2">
                        {item.description}
                      </p>
                    </TableCell>

                    {/* Agent */}
                    <TableCell className="whitespace-nowrap text-xs text-gray-500">
                      {item.agentName}
                    </TableCell>

                    {/* Debit */}
                    <TableCell className="text-right font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                      {item.debit > 0 ? formatCurrency(item.debit) : "—"}
                    </TableCell>

                    {/* Credit */}
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.credit > 0 ? formatCurrency(item.credit) : "—"}
                    </TableCell>

                    {/* Balance */}
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          item.balance > 0
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                        }
                      >
                        {formatCurrency(Math.abs(item.balance))}
                        {item.balance > 0 ? " (Qarz)" : ""}
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
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-3 flex flex-wrap gap-4 justify-end text-sm font-semibold print:hidden">
            <span className="text-gray-500">
              Jami: {displayed.length} ta operatsiya
            </span>
            <span className="text-red-600">
              Debet: {formatCurrency(totalDebit)}
            </span>
            <span className="text-emerald-600">
              Kredit: {formatCurrency(totalCredit)}
            </span>
            <span className={netDebt > 0 ? "text-red-700" : "text-emerald-700"}>
              Qoldiq: {formatCurrency(Math.abs(netDebt))}{netDebt > 0 ? " (Qarz)" : " (Ortiqcha)"}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
