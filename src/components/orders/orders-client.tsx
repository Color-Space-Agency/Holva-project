"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash, Pencil, FileCheck2, AlertTriangle } from "lucide-react"
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
import { StoreActReconciliationDialog } from "@/components/stores/store-act-reconciliation-dialog"

export function OrdersClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<any>(null)
  const [isAktSverkaOpen, setIsAktSverkaOpen] = useState(false)
  const [aktSverkaStore, setAktSverkaStore] = useState<{ id: string; name: string } | null>(null)
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

    // Cross-device polling har 2 soniyada serverdan yangi Sotuvlarni tekshiradi
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
      toast.success("Sotuv Sotuvsi o'chirildi")
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

      <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[180px]">Hujjat</TableHead>
              <TableHead>Mijoz (Do&apos;kon)</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Qarzdorlik</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow 
                key={order.id} 
                className="cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group"
                onClick={() => window.location.href = `/orders/${order.id}`}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                      {order.order_number}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(order.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">{order.stores?.name}</span>
                    <span className="text-[11px] text-gray-500">Agent: {order.profiles?.first_name} {order.profiles?.last_name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1.5">
                    <OrderStatusBadge status={order.status} />
                    <OrderPaymentStatusBadge status={order.payment_status} />
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const debt = (order.total_amount || 0) - (order.paid_amount || 0)
                    if (debt <= 0) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900 text-[10px]">Qarz yo&apos;q</Badge>
                    return (
                      <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-1 rounded-md w-fit">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrency(debt)}</span>
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <DropdownMenuItem
                        onClick={() => {
                          setAktSverkaStore({
                            id: order.stores?.name || order.id,
                            name: order.stores?.name || "Do'kon",
                          })
                          setIsAktSverkaOpen(true)
                        }}
                      >
                        <FileCheck2 className="mr-2 h-4 w-4 text-amber-600" />
                        Akt Sverka (Solishtirma)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        O&apos;chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  Sotuv hujjatlari topilmadi
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
        description="Haqiqatan ham bu sotuv hujjatini o'chirmoqchimisiz?"
      />
      {aktSverkaStore && (
        <StoreActReconciliationDialog
          open={isAktSverkaOpen}
          onOpenChange={setIsAktSverkaOpen}
          store={{ id: aktSverkaStore.id, name: aktSverkaStore.name }}
        />
      )}
    </div>
  )
}
