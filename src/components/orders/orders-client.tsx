"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
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
import { toast } from "sonner"
import Link from "next/link"

export function OrdersClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingOrder, setDeletingOrder] = useState<any>(null)
  const supabase = createClient()

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["orders", searchQuery],
    queryFn: async () => {
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
      if (error) throw error
      return data
    },
  })

  const handleDelete = async () => {
    if (!deletingOrder) return
    if (deletingOrder.status !== 'DRAFT') {
      toast.error("Faqat DRAFT holatidagi buyurtmalarni o'chirish mumkin")
      return
    }

    try {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", deletingOrder.id)

      if (error) throw error
      
      toast.success("Buyurtma o'chirildi")
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
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish (buyurtma raqami)..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Buyurtma qo'shish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Raqam</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Do'kon</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>To'lov</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>{order.stores?.name}</TableCell>
                <TableCell>{order.profiles?.first_name} {order.profiles?.last_name}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(order.total_amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{order.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{order.payment_status}</Badge>
                </TableCell>
                <TableCell className="text-right">
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
                          Ko'rish
                        </Link>
                      </DropdownMenuItem>
                      {order.status === 'DRAFT' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeletingOrder(order)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            O'chirish
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Ma'lumot topilmadi
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
        title="Buyurtmani o'chirish"
        description="Haqiqatan ham bu buyurtmani o'chirmoqchimisiz?"
      />
    </div>
  )
}
