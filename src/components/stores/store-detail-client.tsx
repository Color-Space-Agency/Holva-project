"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
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
import { FileCheck2, Pencil, Printer, Download } from "lucide-react"
import { StoreActReconciliationDialog } from "./store-act-reconciliation-dialog"
import { StoreFormDialog } from "./store-form-dialog"

interface StoreDetailClientProps {
  storeId: string
}

export function StoreDetailClient({ storeId }: StoreDetailClientProps) {
  const [isActOpen, setIsActOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const supabase = createClient()

  const { data: store, isLoading, refetch } = useQuery({
    queryKey: ["stores", storeId],
    queryFn: async () => {
      const { INITIAL_STORES, isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("id", storeId)
            .single()
          if (!error && data) return data
        } catch {
          // Fallback
        }
      }
      return INITIAL_STORES.find(s => s.id === storeId) || INITIAL_STORES[0]
    },
  })

  const { data: orders } = useQuery({
    queryKey: ["stores", storeId, "orders"],
    queryFn: async () => {
      const { INITIAL_ORDERS, isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false })
          if (!error && data) return data
        } catch {
          // Fallback
        }
      }
      return INITIAL_ORDERS.slice(0, 4)
    },
  })

  if (isLoading) return <Skeleton className="h-[400px] w-full" />
  if (!store) return <div>Do&apos;kon topilmadi</div>

  return (
    <div className="space-y-4">
      {/* Sarlavha va Asosiy amallar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{store.name}</h1>
            <Badge variant="outline">{store.status}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 cursor-pointer"
              title="Do'konni tahrirlash"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manzil: {store.address || "-"} &bull; Mas&apos;ul: {store.contact_person || "-"} ({store.phone || "-"})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsActOpen(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white cursor-pointer shadow-sm gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Akt Sverka (Solishtirma)</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600" />
            <span>Tahrirlash</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joriy balans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${store.current_balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {formatCurrency(store.current_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {store.current_balance < 0 ? "Qarzdorlik" : "Ortiqcha to'lov"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="umumiy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="umumiy">Umumiy</TabsTrigger>
          <TabsTrigger value="aksverka" className="flex items-center gap-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Akt Sverka</span>
          </TabsTrigger>
          <TabsTrigger value="Sotuvlar">Sotuvlar</TabsTrigger>
          <TabsTrigger value="tolovlar">To&apos;lovlar</TabsTrigger>
          <TabsTrigger value="yetkazmalar">Yetkazmalar</TabsTrigger>
        </TabsList>

        <TabsContent value="umumiy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nomi</div>
                  <div className="font-medium">{store.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Telefon</div>
                  <div className="font-medium">{store.phone || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Manzil</div>
                  <div className="font-medium">{store.address || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Mas'ul shaxs</div>
                  <div className="font-medium">{store.contact_person || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Holat</div>
                  <div>
                    <Badge variant="outline">{store.status}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Qarz limiti</div>
                  <div className="font-medium">{formatCurrency(store.credit_limit || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aksverka" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-600" />
                  <span>Solishtirma Dalolatnoma (Akt Sverka)</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Ushbu do&apos;kon bilan barcha o&apos;zaro hisob-kitoblar va qarzlar tarixi
                </p>
              </div>
              <Button
                onClick={() => setIsActOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>To&apos;liq Akt Sverka Ochish va Chop etish</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border">
                <div>
                  <span className="text-xs text-muted-foreground block">Boshlang&apos;ich Qoldiq</span>
                  <span className="text-base font-bold text-gray-800 dark:text-gray-200">0 so&apos;m</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Jami Berilgan Tovar (Debet)</span>
                  <span className="text-base font-bold text-blue-600">
                    +{formatCurrency(orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Joriy Yakuniy Qoldiq Qarz</span>
                  <span className={`text-base font-bold ${store.current_balance < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {formatCurrency(store.current_balance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="Sotuvlar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sotuvlar tarixi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raqam</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>To&apos;lov holati</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                      <TableCell><OrderPaymentStatusBadge status={order.payment_status} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>Ko&apos;rish</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">Ma&apos;lumot yo&apos;q</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tolovlar">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tez orada qo&apos;shiladi...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yetkazmalar">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tez orada qo&apos;shiladi...
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
        onSuccess={refetch}
      />
    </div>
  )
}
