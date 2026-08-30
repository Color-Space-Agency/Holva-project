"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { OrderStatusBadge, OrderPaymentStatusBadge } from "./order-status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, DollarSign, Send, Printer, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { OrderInvoice1CDialog } from "./order-invoice-1c-dialog"
import { OrderReceipt1CDialog } from "./order-receipt-1c-dialog"

interface OrderDetailClientProps {
  orderId: string
}

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
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
          { id: "1", quantity: 15, unit_price: 38000, total_price: 570000, products: { name: "Klassik Samarqand Holvasi (500g)" } },
          { id: "2", quantity: 20, unit_price: 45000, total_price: 900000, products: { name: "Kunjutli Premium Holva (500g)" } },
          { id: "3", quantity: 10, unit_price: 52000, total_price: 520000, products: { name: "Shokoladli Marmar Holva (500g)" } },
        ],
        order_payments: [
          { id: "p1", amount: ord.paid_amount, payment_method: "CASH", payment_date: ord.created_at }
        ]
      }
    },
  })

  if (isLoading) return <Skeleton className="h-[400px] w-full" />
  if (!order) return <div>Sotuv ma&apos;lumotlari topilmadi</div>

  return (
    <div className="space-y-6">
      {/* 1C Standartidagi Hujjat Paneli va Tezkor Harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="cursor-pointer">
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Sotuvlar
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Sotuv Hujjati #{order.order_number}
            </h1>
            <p className="text-xs text-muted-foreground">
              Mijoz: {order.stores?.name} &bull; Sana: {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsInvoiceOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer gap-1.5 shadow-sm text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>1C Yuk xati (ТОРГ-12)</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsReceiptOpen(true)}
            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer gap-1.5 text-xs"
          >
            <DollarSign className="w-4 h-4" />
            <span>Kassa Orderi (PKO)</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sotuv ma&apos;lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faktura/Yuk xati raqami:</span>
              <span className="font-bold">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sana:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sotuv holati:</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">To&apos;lov holati:</span>
              <OrderPaymentStatusBadge status={order.payment_status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sotuv agenti:</span>
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
      
      {/* 1C Hujjat Dialoglari */}
      <OrderInvoice1CDialog
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        order={order}
      />
      <OrderReceipt1CDialog
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        order={order}
      />
    </div>
  )
}
