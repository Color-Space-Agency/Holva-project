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
      if (error) throw error
      return data
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
