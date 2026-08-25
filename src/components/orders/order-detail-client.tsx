"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface OrderDetailClientProps {
  orderId: string
}

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const supabase = createClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const { INITIAL_ORDERS, isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select(`
              *,
              stores(name, phone, address),
              profiles:agent_id(first_name, last_name),
              order_items(
                *,
                products(name)
              ),
              order_payments(*)
            `)
            .eq("id", orderId)
            .single()
          if (!error && data) return data
        } catch {
          // Fallback
        }
      }
      const ord = INITIAL_ORDERS.find(o => o.id === orderId) || INITIAL_ORDERS[0]
      return {
        id: ord.id,
        order_number: ord.order_number,
        total_amount: ord.total_amount,
        paid_amount: ord.paid_amount,
        status: ord.status,
        payment_status: ord.payment_status,
        created_at: ord.created_at,
        stores: { name: ord.store_name, phone: "+998 90 123 45 67", address: "Toshkent sh." },
        profiles: { first_name: ord.agent_name.split(' ')[0], last_name: ord.agent_name.split(' ')[1] || '' },
        order_items: [
          { id: "1", quantity: 10, unit_price: 38000, total_price: 380000, products: { name: "Klassik Samarqand Holvasi" } },
          { id: "2", quantity: 15, unit_price: 45000, total_price: 675000, products: { name: "Shokoladli Marmar Holva" } }
        ],
        order_payments: [
          { id: "p1", amount: ord.paid_amount, payment_method: "CASH", payment_date: ord.created_at }
        ]
      }
    },
  })

  if (isLoading) return <Skeleton className="h-[400px] w-full" />
  if (!order) return <div>Buyurtma topilmadi</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buyurtma ma'lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Raqam:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sana:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holat:</span>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To'lov holati:</span>
              <Badge variant="outline">{order.payment_status}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agent:</span>
              <span>{order.profiles?.first_name} {order.profiles?.last_name}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mijoz (Do'kon)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomi:</span>
              <span className="font-medium">{order.stores?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefon:</span>
              <span>{order.stores?.phone || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Manzil:</span>
              <span>{order.stores?.address || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahsulotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Narx</TableHead>
                <TableHead>Chegirma</TableHead>
                <TableHead className="text-right">Jami</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.products?.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell>{formatCurrency(item.discount_amount || 0)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_price)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold text-lg">
                  Umumiy summa:
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(order.total_amount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Payments card could go here */}
    </div>
  )
}
