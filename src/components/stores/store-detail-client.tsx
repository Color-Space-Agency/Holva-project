"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge, OrderPaymentStatusBadge } from "@/components/orders/order-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileCheck2, Pencil, Printer, Download, Eye, Clock, ShoppingBag, ArrowUpRight, ArrowDownLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { StoreActReconciliationDialog } from "./store-act-reconciliation-dialog"
import { StoreFormDialog } from "./store-form-dialog"
import { AktSverkaDetailClient } from "../finance/akt-sverka-detail-client"
import { OrderViewDialog } from "@/components/orders/order-view-dialog"
import { getStoredStores, getStoredOrders, isRealSupabaseConfigured, syncStoresFromServer, syncOrdersFromServer } from "@/lib/mock-data"

interface StoreDetailClientProps {
  storeId: string
}

export function StoreDetailClient({ storeId }: StoreDetailClientProps) {
  const [isActOpen, setIsActOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const supabase = createClient()

  const { data: store, isLoading: isStoreLoading, refetch: refetchStore } = useQuery({
    queryKey: ["store-detail", storeId],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        await Promise.all([syncStoresFromServer(), syncOrdersFromServer()]).catch(() => {})
      }

      const allStores = getStoredStores()
      const found = allStores.find((s) => s.id === storeId || s.name === storeId)
      if (found) return found

      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .single()
          if (!error && data) return data
        } catch {}
      }

      return allStores[0]
    },
  })

  const { data: orders = [], isLoading: isOrdersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["store-detail-orders", storeId, store?.name],
    enabled: !!store,
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select(`
              *,
              stores(name, phone, address),
              profiles:agent_id(first_name, last_name),
              order_items(*, products(name))
            `)
            .eq("store_id", storeId)
            .order("created_at", { ascending: false })
          if (!error && data && data.length > 0) return data
        } catch {}
      }

      const allOrders = getStoredOrders()
      const sName = (store?.name || "").toLowerCase().trim()
      return allOrders.filter(
        (o: any) =>
          (o.stores?.name && o.stores.name.toLowerCase().trim() === sName) ||
          (o.store_name && o.store_name.toLowerCase().trim() === sName)
      )
    },
  })

  useEffect(() => {
    const handleUpdate = () => {
      refetchStore()
      refetchOrders()
    }
    window.addEventListener("stores-updated", handleUpdate)
    window.addEventListener("orders-updated", handleUpdate)
    return () => {
      window.removeEventListener("stores-updated", handleUpdate)
      window.removeEventListener("orders-updated", handleUpdate)
    }
  }, [refetchStore, refetchOrders])

  if (isStoreLoading) return <Skeleton className="h-[400px] w-full rounded-2xl" />
  if (!store) return <div className="p-8 text-center text-gray-500">Do&apos;kon topilmadi</div>

  const totalSales = orders.reduce((sum, o: any) => sum + (o.total_amount || 0), 0)
  const totalPaid = orders.reduce((sum, o: any) => sum + (o.paid_amount || 0), 0)
  const currentDebt = (store.initial_balance ? Math.abs(store.initial_balance) : 0) + (totalSales - totalPaid)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Profile Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
            <Badge variant="outline" className={store.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}>
              {store.status === "ACTIVE" ? "FAOL MIJOZ" : store.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
              title="Do'konni tahrirlash"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manzil: <span className="font-medium text-gray-800 dark:text-gray-200">{store.address || "Kiritilmagan"}</span> &bull; Mas&apos;ul: <span className="font-medium text-gray-800 dark:text-gray-200">{store.contact_person || store.name}</span> ({store.phone || "-"})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsActOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-sm gap-2 rounded-xl"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Akt Sverka (Solishtirma)</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 cursor-pointer rounded-xl"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600" />
            <span>Tahrirlash</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400">Joriy Qarzdorlik Balansi</CardTitle>
            <div className={`p-2 rounded-full ${currentDebt > 0 ? "bg-red-50 dark:bg-red-950/40" : "bg-emerald-50 dark:bg-emerald-950/40"}`}>
              {currentDebt > 0 ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${currentDebt > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatCurrency(currentDebt)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {currentDebt > 0 ? "To'lanishi kerak bo'lgan qarz" : "Qarzdorlik yo'q (Nol)"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400">Jami Xaridlari Summasi</CardTitle>
            <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-full">
              <ArrowUpRight className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalSales)}
            </div>
            <p className="text-xs text-gray-400 mt-1">Barcha rasmiylashtirilgan sotuvlar</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400">Qabul Qilingan To'lov</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-full">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-gray-400 mt-1">Mijoz tomonidan to'langan pul</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-gray-400">Sotuv Hujjatlari Soni</CardTitle>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-full">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {orders.length} ta
            </div>
            <p className="text-xs text-gray-400 mt-1">Rasmiylashtirilgan hujjatlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="Sotuvlar" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
          <TabsTrigger value="Sotuvlar" className="rounded-lg text-xs sm:text-sm font-medium">
            Harakatlar & Sotuvlar Tarixi ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="aksverka" className="rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <span>Akt Sverka Hujjati</span>
          </TabsTrigger>
          <TabsTrigger value="umumiy" className="rounded-lg text-xs sm:text-sm font-medium">Do'kon Rekvizitlari</TabsTrigger>
        </TabsList>

        {/* Sotuvlar va Harakatlar Tarixi Tab */}
        <TabsContent value="Sotuvlar" className="space-y-4 pt-1">
          <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 py-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Ushbu Mijoz Bo'yicha Barcha Sotuvlar va To'lovlar Tafsiloti</span>
                <span className="text-xs text-gray-400 font-normal">Sana/Vaqt va Mahsulotlar Ro'yxati bilan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold">
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Sana va vaqt</TableHead>
                      <TableHead className="whitespace-nowrap">Hujjat № / Agent</TableHead>
                      <TableHead className="whitespace-nowrap">Xarid qilgan mahsulotlari</TableHead>
                      <TableHead className="text-right text-gray-900 dark:text-white font-bold whitespace-nowrap">Xarid Summasi</TableHead>
                      <TableHead className="text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">Bergan Puli (To'ladi)</TableHead>
                      <TableHead className="text-right text-red-600 dark:text-red-400 font-bold whitespace-nowrap">Qolgan Qarzi</TableHead>
                      <TableHead className="w-[60px] text-right">Batafsil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isOrdersLoading ? (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center text-gray-400">Yuklanmoqda...</TableCell></TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center text-gray-400">Ushbu do'kon bo'yicha hali sotuv bajarilmagan.</TableCell></TableRow>
                    ) : (
                      orders.map((ord: any) => {
                        const dateStr = ord.created_at ? formatDateTime(ord.created_at) : "04.09.2026 14:30"
                        const agentStr = ord.profiles ? `${ord.profiles.first_name || ''} ${ord.profiles.last_name || ''}`.trim() : (ord.agent_name || "Sardor Rahimov")
                        const itemsList = ord.order_items || ord.items || []
                        const total = ord.total_amount || 0
                        const paid = ord.paid_amount || 0
                        const debt = Math.max(0, total - paid)

                        return (
                          <TableRow key={ord.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                            <TableCell className="whitespace-nowrap">
                              <div className="font-semibold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                {dateStr}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="font-bold text-sm text-gray-900 dark:text-white">{ord.order_number || `#${ord.id}`}</div>
                              <div className="text-xs text-gray-400">Agent: {agentStr}</div>
                            </TableCell>
                            <TableCell>
                              {itemsList.length > 0 ? (
                                <div className="space-y-1 text-xs">
                                  {itemsList.map((item: any, idx: number) => (
                                    <div key={idx} className="font-medium text-gray-800 dark:text-gray-200">
                                      &bull; {item.products?.name || item.product_name || "Mahsulot"} — <span className="font-bold text-amber-600">{formatNumber(item.quantity || 1)} dona</span> x {formatCurrency(item.unit_price || item.price || 0)}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 font-medium">Holva Mahsulotlari Xaridi</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {formatCurrency(total)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(paid)}
                            </TableCell>
                            <TableCell className="text-right font-bold whitespace-nowrap">
                              <Badge variant="outline" className={debt > 0 ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>
                                {debt > 0 ? `${formatCurrency(debt)} (Qarz)` : "To'langan"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600 cursor-pointer"
                                onClick={() => setViewingOrder(ord)}
                                title="Hujjatni to'liq ko'rish"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Akt Sverka Tab */}
        <TabsContent value="aksverka" className="space-y-4 pt-1">
          <AktSverkaDetailClient store={store} />
        </TabsContent>

        {/* Do'kon Rekvizitlari Tab */}
        <TabsContent value="umumiy" className="space-y-4 pt-1">
          <Card className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-bold">Mijoz (Do'kon) Ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Do'kon Nomi</span>
                  <p className="font-bold text-gray-900 dark:text-white">{store.name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Telefon Raqami</span>
                  <p className="font-bold text-gray-900 dark:text-white">{store.phone || "-"}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Joylashgan Manzili</span>
                  <p className="font-bold text-gray-900 dark:text-white">{store.address || "-"}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Mas'ul Shaxs</span>
                  <p className="font-bold text-gray-900 dark:text-white">{store.contact_person || "-"}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Qarz Limiti</span>
                  <p className="font-bold text-amber-600">{formatCurrency(store.credit_limit || 50000000)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-1">
                  <span className="text-xs text-gray-400 font-medium">Mijoz Holati</span>
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{store.status}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialoglar */}
      <StoreActReconciliationDialog
        open={isActOpen}
        onOpenChange={setIsActOpen}
        store={store}
      />
      <StoreFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialData={store}
        onSuccess={() => {
          refetchStore()
          refetchOrders()
        }}
      />
      <OrderViewDialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
        orderId={viewingOrder?.id}
        orderData={viewingOrder}
      />
    </div>
  )
}
