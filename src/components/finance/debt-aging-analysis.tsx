"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getStoredStores, MockStore } from "@/lib/mock-data"

export function DebtAgingAnalysis() {
  const [stores, setStores] = useState<MockStore[]>([])

  useEffect(() => {
    setStores(getStoredStores())
    const handleUpdate = () => setStores(getStoredStores())
    window.addEventListener("stores-updated", handleUpdate)
    return () => window.removeEventListener("stores-updated", handleUpdate)
  }, [])

  const stats = useMemo(() => {
    const storesWithDebt = stores.filter((s) => (s.current_balance || 0) < 0)
    const totalDebt = storesWithDebt.reduce((sum, s) => sum + Math.abs(s.current_balance), 0)

    return {
      current: { amount: totalDebt, count: storesWithDebt.length },
      overdueShort: { amount: 0, count: 0 },
      overdueMedium: { amount: 0, count: 0 },
      critical: { amount: 0, count: 0 },
      totalDebt,
    }
  }, [stores])

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            1C Debitorlik Qarzdorlik Muddati Tahlili (Aging)
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
            Jami qarz: {formatCurrency(stats.totalDebt)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Do&apos;konlarning to&apos;lov muddati kechikishi bo&apos;yicha 1C standarti tahlili
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 0-7 kun */}
          <div className="p-3.5 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>0 — 7 kun</span>
              <Badge variant="outline" className="text-[10px] bg-emerald-100/60 text-emerald-800 border-emerald-300">Joriy</Badge>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300">
              {formatCurrency(stats.current.amount)}
            </div>
            <p className="text-[11px] text-gray-500">{stats.current.count} ta do&apos;kon</p>
          </div>

          {/* 8-15 kun */}
          <div className="p-3.5 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span>8 — 15 kun</span>
              <Badge variant="outline" className="text-[10px] bg-amber-100/60 text-amber-800 border-amber-300">Kechikkan</Badge>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300">
              {formatCurrency(stats.overdueShort.amount)}
            </div>
            <p className="text-[11px] text-gray-500">{stats.overdueShort.count} ta do&apos;kon</p>
          </div>

          {/* 16-30 kun */}
          <div className="p-3.5 rounded-xl border bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-orange-700 dark:text-orange-400">
              <span>16 — 30 kun</span>
              <Badge variant="outline" className="text-[10px] bg-orange-100/60 text-orange-800 border-orange-300">Xavfli</Badge>
            </div>
            <div className="text-base sm:text-lg font-black text-orange-800 dark:text-orange-300">
              {formatCurrency(stats.overdueMedium.amount)}
            </div>
            <p className="text-[11px] text-gray-500">{stats.overdueMedium.count} ta do&apos;kon</p>
          </div>

          {/* 30+ kun */}
          <div className="p-3.5 rounded-xl border bg-red-50/40 dark:bg-red-950/20 border-red-200/60 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-red-700 dark:text-red-400">
              <span>30+ kundan oshiq</span>
              <Badge variant="outline" className="text-[10px] bg-red-100/60 text-red-800 border-red-300">Tanqidiy</Badge>
            </div>
            <div className="text-base sm:text-lg font-black text-red-800 dark:text-red-300">
              {formatCurrency(stats.critical.amount)}
            </div>
            <p className="text-[11px] text-gray-500">{stats.critical.count} ta do&apos;kon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
