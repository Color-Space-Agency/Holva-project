"use client"

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

interface StoreDetailClientProps {
  storeId: string
}

export function StoreDetailClient({ storeId }: StoreDetailClientProps) {
  const supabase = createClient()

  const { data: store, isLoading } = useQuery({
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
  if (!store) return <div>Do'kon topilmadi</div>

  return (
    <div className="space-y-4">
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
        {/* You can add more summary cards here */}
      </div>

      <Tabs defaultValue="umumiy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="umumiy">Umumiy</TabsTrigger>
          <TabsTrigger value="buyurtmalar">Buyurtmalar</TabsTrigger>
          <TabsTrigger value="tolovlar">To'lovlar</TabsTrigger>
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

        <TabsContent value="buyurtmalar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buyurtmalar tarixi</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raqam</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>To'lov holati</TableHead>
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
                          <Link href={`/orders/${order.id}`}>Ko'rish</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">Ma'lumot yo'q</TableCell>
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
              Tez orada qo'shiladi...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yetkazmalar">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Tez orada qo'shiladi...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
