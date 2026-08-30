"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { OrderFormDialog } from "./order-form-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { useEffect } from "react"
import { OrderStatusBadge, OrderPaymentStatusBadge } from "./order-status-badge"
import { toast } from "sonner"
import Link from "next/link"
import { getStoredOrders, deleteStoredOrder, isRealSupabaseConfigured, syncOrdersFromServer } from "@/lib/mock-data"

export function OrdersClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<any>(null)
  const supabase = createClient()

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["orders", searchQuery],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("orders")
            .select(`
              *,
              stores:store_id(name),
              profiles:agent_id(first_name, last_name)
            `)
            .order("created_at", { ascending: false })

          if (searchQuery) {
            query = query.or(`order_number.ilike.%${searchQuery}%`)
          }

          const { data, error } = await query
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }

      const stored = getStoredOrders()
      let res = stored.map((o) => ({
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount,
        paid_amount: o.paid_amount,
        status: o.status,
        payment_status: o.payment_status,
        created_at: o.created_at,
        stores: { name: o.store_name },
        profiles: { first_name: o.agent_name.split(" ")[0], last_name: o.agent_name.split(" ")[1] || "" },
      }))
      if (searchQuery) {
        res = res.filter((o) => o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) || o.stores.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }
      return res
    },
  })

  // Real-time synchronization with Sales Agent orders & payments (Cross-device)
  useEffect(() => {
    syncOrdersFromServer().then(() => refetch())

    const handleOrdersUpdated = () => {
      refetch()
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "holva_crm_stored_orders") {
        refetch()
      }
    }

    window.addEventListener("orders-updated", handleOrdersUpdated)
    window.addEventListener("storage", handleStorage)

    // Cross-device polling har 2 soniyada serverdan yangi buyurtmalarni tekshiradi
    const interval = setInterval(() => {
      syncOrdersFromServer().then(() => refetch())
    }, 2000)

    return () => {
      window.removeEventListener("orders-updated", handleOrdersUpdated)
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [refetch])

  const handleDelete = async () => {
    if (!deletingOrder) return

    try {
      if (isRealSupabaseConfigured()) {
        try {
          await supabase.from("orders").delete().eq("id", deletingOrder.id)
        } catch {}
      }
      
      deleteStoredOrder(deletingOrder.id)
      toast.success("Sotuv buyurtmasi o'chirildi")
      refetch()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
      console.error(error)
    } finally {
      setDeletingOrder(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-[300px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish (raqam yoki do'kon)..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white cursor-pointer shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Yangi sotuv yaratish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raqam</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Do&apos;kon</TableHead>
              <TableHead>Sotuv Agenti</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>To&apos;lov</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>{order.order_number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-6 w-6 p-0 text-gray-400 hover:text-amber-600 cursor-pointer"
                      title="Tahrirlash / ko'rish"
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Pencil className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell className="font-medium">{order.stores?.name}</TableCell>
                <TableCell>{order.profiles?.first_name} {order.profiles?.last_name}</TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <OrderPaymentStatusBadge status={order.payment_status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs text-amber-600 hover:bg-amber-50 cursor-pointer">
                      <Link href={`/orders/${order.id}`}>
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Tahrirlash
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menyu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Batafsil ko&apos;rish
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                            Tahrirlash
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          O&apos;chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Sotuvlar topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <OrderFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={refetch}
      />
      <DeleteConfirmDialog
        open={!!deletingOrder}
        onOpenChange={(open) => !open && setDeletingOrder(null)}
        onConfirm={handleDelete}
        title="Sotuvni o'chirish"
        description="Haqiqatan ham bu sotuv buyurtmasini o'chirmoqchimisiz?"
      />
    </div>
  )
}
