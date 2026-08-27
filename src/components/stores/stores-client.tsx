"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
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
import { Card, CardContent } from "@/components/ui/card"
import { StoreFormDialog } from "./store-form-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { toast } from "sonner"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  INACTIVE: "bg-gray-500/10 text-gray-500",
  BLOCKED: "bg-red-500/10 text-red-500",
}
import { useEffect } from "react"
import { INITIAL_STORES, getStoredOrders, isRealSupabaseConfigured } from "@/lib/mock-data"

export function StoresClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [deletingStore, setDeletingStore] = useState<any>(null)
  const supabase = createClient()

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ["stores", searchQuery],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("stores")
            .select("*")
            .order("created_at", { ascending: false })

          if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
          }

          const { data, error } = await query
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }

      const storedOrders = getStoredOrders()
      let res = INITIAL_STORES.map((s) => {
        const storeOrders = storedOrders.filter((o) => o.store_name === s.name)
        const debt = storeOrders.reduce((sum, o) => sum + Math.max(0, o.total_amount - (o.paid_amount || 0)), 0)
        return {
          ...s,
          current_balance: debt > 0 ? -debt : (s.current_balance || 0),
          created_at: new Date().toISOString(),
        }
      })
      if (searchQuery) {
        res = res.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery))
      }
      return res
    },
  })

  // Real-time synchronization with orders & payments
  useEffect(() => {
    const handleSync = () => {
      refetch()
    }
    window.addEventListener("orders-updated", handleSync)
    window.addEventListener("storage", handleSync)

    return () => {
      window.removeEventListener("orders-updated", handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [refetch])

  const handleDelete = async () => {
    if (!deletingStore) return

    try {
      const { error } = await supabase
        .from("stores")
        .update({ status: "INACTIVE" })
        .eq("id", deletingStore.id)

      if (error) throw error
      
      toast.success("Do'kon o'chirildi (INACTIVE holatiga o'tkazildi)")
      refetch()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
      console.error(error)
    } finally {
      setDeletingStore(null)
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
            placeholder="Qidirish (nomi yoki tel)..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setEditingStore(null)
          setIsFormOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Do'kon qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {stores?.map((store) => (
          <Card key={store.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{store.name}</div>
                  <div className="text-sm text-muted-foreground">{store.phone}</div>
                </div>
                <Badge variant="outline" className={STATUS_COLORS[store.status]}>
                  {store.status}
                </Badge>
              </div>
              <div className="text-sm">Manzil: {store.address}</div>
              <div className="text-sm">Mas'ul: {store.contact_person}</div>
              <div className={`font-semibold ${store.current_balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                Balans: {formatCurrency(store.current_balance)}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/stores/${store.id}`}>Ko'rish</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setEditingStore(store)
                  setIsFormOpen(true)
                }} className="flex-1">Tahrirlash</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {stores?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Ma'lumot topilmadi</div>
        )}
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Manzil</TableHead>
              <TableHead>Mas'ul shaxs</TableHead>
              <TableHead>Balans</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.phone}</TableCell>
                <TableCell>{store.address}</TableCell>
                <TableCell>{store.contact_person}</TableCell>
                <TableCell className={`font-semibold ${store.current_balance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatCurrency(store.current_balance)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_COLORS[store.status]}>
                    {store.status}
                  </Badge>
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
                        <Link href={`/stores/${store.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ko'rish
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setEditingStore(store)
                        setIsFormOpen(true)
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeletingStore(store)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        O'chirish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {stores?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StoreFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        initialData={editingStore}
        onSuccess={refetch}
      />
      <DeleteConfirmDialog
        open={!!deletingStore}
        onOpenChange={(open) => !open && setDeletingStore(null)}
        onConfirm={handleDelete}
        title="Do'konni o'chirish"
        description="Haqiqatan ham bu do'konni o'chirmoqchimisiz?"
      />
    </div>
  )
}
