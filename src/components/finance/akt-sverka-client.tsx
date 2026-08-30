"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getStoredOrders, INITIAL_STORES } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { 
  FileCheck2, Download, Printer, ArrowUpRight, ArrowDownLeft, AlertCircle, Calendar as CalendarIcon, CheckCircle2 
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

export function AktSverkaClient() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all")
  
  // Default to this month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  const [startDate, setStartDate] = useState(firstDay.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDay.toISOString().split("T")[0])

  const stores = useMemo(() => INITIAL_STORES, [])
  
  const storeMap = useMemo(() => {
    const map = new Map()
    stores.forEach(s => map.set(s.id, s.name))
    return map
  }, [stores])

  const { data: entries, isLoading } = useQuery({
    queryKey: ["akt-sverka", selectedStoreId, startDate, endDate],
    queryFn: () => {
      const orders = getStoredOrders()
      let filtered = orders

      if (selectedStoreId && selectedStoreId !== "all") {
        const sName = storeMap.get(selectedStoreId)
        if (sName) {
          filtered = filtered.filter(o => o.store_name === sName)
        }
      }
      
      const list: any[] = []
      
      // Build transactions from orders
      filtered.forEach((ord) => {
        const ordDate = ord.created_at.split("T")[0]
        
        // Product Purchase (Debit)
        if (ord.total_amount > 0) {
          list.push({
            id: `ord-${ord.id}`,
            date: ordDate,
            timestamp: new Date(ord.created_at).getTime(),
            docNumber: ord.order_number,
            docType: "SOTUV",
            storeName: ord.store_name,
            description: "Mahsulotlar xaridi",
            debit: ord.total_amount,
            credit: 0,
          })
        }
        
        // Payment (Credit)
        if (ord.paid_amount > 0) {
          list.push({
            id: `pay-${ord.id}`,
            date: ordDate, // simplified logic
            timestamp: new Date(ord.created_at).getTime() + 1000,
            docNumber: `TOL-${ord.order_number.split("-").pop()}`,
            docType: "TOLOV",
            storeName: ord.store_name,
            description: "Mijoz tomonidan to'lov",
            debit: 0,
            credit: ord.paid_amount,
          })
        }
      })
      
      // Sort by time
      list.sort((a, b) => a.timestamp - b.timestamp)
      
      // Filter by date range
      const inRange = list.filter(item => item.date >= startDate && item.date <= endDate)
      
      // Calculate running balance
      let runningBalance = 0
      const processed = inRange.map(item => {
        runningBalance += (item.debit - item.credit)
        return { ...item, balance: runningBalance }
      })

      const totalDebit = processed.reduce((sum, i) => sum + i.debit, 0)
      const totalCredit = processed.reduce((sum, i) => sum + i.credit, 0)
      const finalBalance = processed.length > 0 ? processed[processed.length - 1].balance : 0

      return {
        entries: processed,
        totalDebit,
        totalCredit,
        finalBalance,
      }
    }
  })

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!entries) return
    const headers = ["T/r", "Sana", "Do'kon", "Hujjat raqami", "Hujjat turi", "Izoh", "Qarz (Sotib olgan)", "To'lov (To'lagan)", "Qoldiq qarz"]
    const rows = entries.entries.map((e, idx) => [
      idx + 1,
      e.date,
      `"${e.storeName}"`,
      e.docNumber,
      e.docType,
      `"${e.description}"`,
      e.debit,
      e.credit,
      e.balance,
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `Akt_Sverka_${startDate}_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-end gap-4 print:hidden">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label>Mijoz (Do&apos;kon)</Label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Barcha do'konlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha do&apos;konlar (Umumiy)</SelectItem>
              {stores.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1.5">
          <Label>Dan (Sana)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="date" 
              className="pl-9" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Gacha (Sana)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="date" 
              className="pl-9" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4 text-emerald-600" /> Excel
          </Button>
          <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Printer className="w-4 h-4" /> Chop etish
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {entries && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Berilgan mahsulot (Debet)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(entries.totalDebit)}</h3>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
              <ArrowUpRight className="w-6 h-6 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Qabul qilingan to'lov (Kredit)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(entries.totalCredit)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Umumiy qoldiq (Qarzdorlik)</p>
              <h3 className={`text-2xl font-bold ${entries.finalBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
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
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[100px]">Sana</TableHead>
              {selectedStoreId === "all" && <TableHead>Do&apos;kon</TableHead>}
              <TableHead>Hujjat raqami</TableHead>
              <TableHead>Amaliyot</TableHead>
              <TableHead className="text-right text-red-600 dark:text-red-400">Tovar (Qarzga)</TableHead>
              <TableHead className="text-right text-emerald-600 dark:text-emerald-400">To&apos;lov (Qarzdan)</TableHead>
              <TableHead className="text-right font-bold">Joriy qoldiq</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={selectedStoreId === "all" ? 7 : 6} className="h-32 text-center text-gray-500">
                  Yuklanmoqda...
                </TableCell>
              </TableRow>
            ) : entries?.entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectedStoreId === "all" ? 7 : 6} className="h-32 text-center text-gray-500">
                  Ushbu sanada oldi-berdi hujjatlari topilmadi.
                </TableCell>
              </TableRow>
            ) : (
              entries?.entries.map((item, index) => (
                <TableRow key={`${item.id}-${index}`}>
                  <TableCell className="font-medium">{item.date}</TableCell>
                  {selectedStoreId === "all" && <TableCell>{item.storeName}</TableCell>}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{item.docNumber}</span>
                      <span className="text-xs text-gray-500">{item.docType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                    {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <Badge variant="outline" className={item.balance > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                      {formatCurrency(Math.abs(item.balance))}
                      {item.balance > 0 ? " (Qarz)" : " (Haqdor)"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
