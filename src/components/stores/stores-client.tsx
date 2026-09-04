"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash, Pencil, FileCheck2 } from "lucide-react"
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
import { StoreActReconciliationDialog } from "./store-act-reconciliation-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { toast } from "sonner"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-500",
  INACTIVE: "bg-gray-500/10 text-gray-500",
  BLOCKED: "bg-red-500/10 text-red-500",
}
import { useEffect } from "react"
import { getStoredStores, getStoredOrders, deleteStoredStore, isRealSupabaseConfigured } from "@/lib/mock-data"

export function StoresClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [deletingStore, setDeletingStore] = useState<any>(null)
  const [actStore, setActStore] = useState<any>(null)
  const [isActOpen, setIsActOpen] = useState(false)
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
      let res = getStoredStores().map((s) => {
        const storeOrders = storedOrders.filter((o) => o.store_name === s.name)
        const debt = storeOrders.reduce((sum, o) => sum + Math.max(0, o.total_amount - (o.paid_amount || 0)), 0)
        return {
          ...s,
          current_balance: debt > 0 ? -debt : (s.current_balance || 0),
          created_at: s.created_at || new Date().toISOString(),
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
    const handleOrdersUpdated = () => refetch()
    const handleStoresUpdated = () => refetch()
    window.addEventListener("orders-updated", handleOrdersUpdated)
    window.addEventListener("stores-updated", handleStoresUpdated)
    return () => {
      window.removeEventListener("orders-updated", handleOrdersUpdated)
      window.removeEventListener("stores-updated", handleStoresUpdated)
    }
  }, [refetch])

  async function handleDelete() {
    if (!deletingStore) return
    try {
      if (isRealSupabaseConfigured()) {
        await supabase
          .from("stores")
          .update({ status: "INACTIVE" })
          .eq("id", deletingStore.id)
      }
      deleteStoredStore(deletingStore.id)
      toast.success("Do'kon o'chirildi")
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
                  <Link href={`/stores/${store.id}`}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Ko&apos;rish
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActStore(store)
                    setIsActOpen(true)
                  }}
                  className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                >
                  <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                  Akt Sverka
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingStore(store)
                    setIsFormOpen(true)
                  }}
                  className="px-3"
                  title="Tahrirlash"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {stores?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Ma&apos;lumot topilmadi</div>
        )}
      </div>

      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Manzil</TableHead>
              <TableHead>Mas&apos;ul shaxs</TableHead>
              <TableHead>Balans</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{store.name}</span>
                    <button
                      onClick={() => {
                        setEditingStore(store)
                        setIsFormOpen(true)
                      }}
                      className="p-1 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-md text-gray-400 hover:text-amber-600 transition cursor-pointer"
                      title="Nomni tahrirlash"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                </TableCell>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActStore(store)
                        setIsActOpen(true)
                      }}
                      className="h-8 px-2.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      <FileCheck2 className="mr-1 h-3.5 w-3.5" />
                      Akt Sverka
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingStore(store)
                        setIsFormOpen(true)
                      }}
                      className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Pencil className="h-4 w-4" />
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
                          <Link href={`/stores/${store.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ko&apos;rish
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingStore(store)
                          setIsFormOpen(true)
                        }}>
                          <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setActStore(store)
                          setIsActOpen(true)
                        }}>
                          <FileCheck2 className="mr-2 h-4 w-4 text-amber-600" />
                          Akt Sverka ko&apos;rish
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeletingStore(store)} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          O&apos;chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {stores?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Ma&apos;lumot topilmadi
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
      {actStore && (
        <StoreActReconciliationDialog
          open={isActOpen}
          onOpenChange={setIsActOpen}
          store={actStore}
        />
      )}
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
