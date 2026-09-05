"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, MoreHorizontal, Eye, Trash, Pencil, FileCheck2, Store, Users, AlertTriangle, TrendingDown } from "lucide-react"
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
import { useRouter } from "next/navigation"
import { getStoredStores, getStoredOrders, deleteStoredStore, isRealSupabaseConfigured, syncStoresFromServer, syncOrdersFromServer } from "@/lib/mock-data"

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600 border-green-200 dark:text-green-400",
  INACTIVE: "bg-gray-500/10 text-gray-500 border-gray-200",
  BLOCKED: "bg-red-500/10 text-red-500 border-red-200",
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Faol",
  INACTIVE: "Nofaol",
  BLOCKED: "Bloklangan",
}

export function StoresClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<any>(null)
  const [deletingStore, setDeletingStore] = useState<any>(null)
  const [actStore, setActStore] = useState<any>(null)
  const [isActOpen, setIsActOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ["stores", searchQuery],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        await Promise.all([syncStoresFromServer(), syncOrdersFromServer()]).catch(() => {})
      }

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
          if (!error && data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }

      const storedOrders = getStoredOrders()
      let res = getStoredStores().map((s) => {
        const storeOrders = storedOrders.filter((o) =>
          o.store_name?.toLowerCase().trim() === s.name.toLowerCase().trim() ||
          (o as any).stores?.name?.toLowerCase().trim() === s.name.toLowerCase().trim() ||
          (o as any).store_id === s.id
        )
        const debtFromOrders = storeOrders.reduce(
          (sum, o) => sum + Math.max(0, (o.total_amount || 0) - (o.paid_amount || 0)),
          0
        )
        const initialDebt = Math.abs(s.initial_balance || 0)
        const currentDebt = initialDebt + debtFromOrders
        return {
          ...s,
          _currentDebt: currentDebt,
          _orderCount: storeOrders.length,
          current_balance: currentDebt > 0 ? -currentDebt : (s.current_balance || 0),
          created_at: s.created_at || new Date().toISOString(),
        }
      })

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        res = res.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.phone || "").includes(q) ||
            (s.contact_person || "").toLowerCase().includes(q)
        )
      }

      return res
    },
  })

  useEffect(() => {
    syncStoresFromServer().then(() => refetch())
    syncOrdersFromServer().then(() => refetch())

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
      toast.success("Do’kon o’chirildi")
      refetch()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
      console.error(error)
    } finally {
      setDeletingStore(null)
    }
  }

  const totalStores = stores?.length ?? 0
  const totalDebtors = stores?.filter((s) => (s as any)._currentDebt > 0).length ?? 0
  const totalCombinedDebt = stores?.reduce((sum, s) => sum + ((s as any)._currentDebt || 0), 0) ?? 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-[300px]" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Summary Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Jami Do&apos;konlar</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalStores} ta</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl">
            <Users className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Qarzdor Do&apos;konlar</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{totalDebtors} ta</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Umumiy Qarz</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalCombinedDebt)}</p>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingStore(null)
            setIsFormOpen(true)
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-11 rounded-2xl px-5 shadow-lg shadow-emerald-600/30 gap-2 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Do&apos;kon qo&apos;shish
        </Button>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {stores?.map((store) => {
          const currentDebt = (store as any)._currentDebt ?? 0
          const orderCount = (store as any)._orderCount ?? 0
          return (
            <Card
              key={store.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-gray-100 dark:border-gray-800"
              onClick={() => router.push(`/stores/${store.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-base">{store.name}</div>
                    {store.contact_person && (
                      <div className="text-xs text-gray-500 mt-0.5">Mas&apos;ul: {store.contact_person}</div>
                    )}
                    {store.phone && (
                      <div className="text-xs text-gray-500">{store.phone}</div>
                    )}
                  </div>
                  <Badge variant="outline" className={STATUS_COLORS[store.status]}>
                    {STATUS_LABELS[store.status] || store.status}
                  </Badge>
                </div>
                {store.address && (
                  <div className="text-xs text-gray-400 truncate">📍 {store.address}</div>
                )}
                <div className="flex items-center justify-between">
                  {currentDebt > 0 ? (
                    <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 font-bold px-3 py-1 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Qarzdorlik: {formatCurrency(currentDebt)}
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-semibold px-3 py-1 text-xs">
                      ✓ Qarz yo&apos;q
                    </Badge>
                  )}
                  <span className="text-xs text-gray-400">{orderCount} ta sotuv</span>
                </div>
                <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/stores/${store.id}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Ko&apos;rish
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setActStore(store); setIsActOpen(true) }}
                    className="flex-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                    Akt Sverka
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingStore(store); setIsFormOpen(true) }}
                    className="px-3"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-600" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingStore(store)}
                    className="px-3"
                    title="O’chirish"
                  >
                    <Trash className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {stores?.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
            Ma&apos;lumot topilmadi
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="font-semibold">Do&apos;kon nomi / Holat</TableHead>
              <TableHead className="font-semibold">Mas&apos;ul / Telefon</TableHead>
              <TableHead className="font-semibold">Manzil</TableHead>
              <TableHead className="font-semibold text-center">Sotuvlar</TableHead>
              <TableHead className="font-semibold">Qarzdorlik</TableHead>
              <TableHead className="text-right font-semibold">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores?.map((store) => {
              const currentDebt = (store as any)._currentDebt ?? 0
              const orderCount = (store as any)._orderCount ?? 0
              return (
                <TableRow
                  key={store.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/stores/${store.id}`)}
                >
                  <TableCell>
                    <div className="font-bold text-gray-900 dark:text-white">{store.name}</div>
                    <Badge variant="outline" className={`${STATUS_COLORS[store.status]} mt-1 text-xs`}>
                      {STATUS_LABELS[store.status] || store.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">{store.contact_person || "—"}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{store.phone || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-[180px] truncate" title={store.address || ""}>
                      {store.address || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-amber-600">{orderCount}</span>
                    <span className="text-xs text-gray-400 ml-1">ta</span>
                  </TableCell>
                  <TableCell>
                    {currentDebt > 0 ? (
                      <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 font-bold whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                        Qarzdorlik: {formatCurrency(currentDebt)}
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-semibold">
                        ✓ Qarz yo&apos;q
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setActStore(store); setIsActOpen(true) }}
                        className="h-8 px-2.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                      >
                        <FileCheck2 className="mr-1 h-3.5 w-3.5" />
                        Akt Sverka
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingStore(store); setIsFormOpen(true) }}
                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Menyu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/stores/${store.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ko&apos;rish (Batafsil)
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingStore(store); setIsFormOpen(true) }}>
                            <Pencil className="mr-2 h-4 w-4 text-amber-600" />
                            Tahrirlash
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setActStore(store); setIsActOpen(true) }}>
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
              )
            })}
            {stores?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
        title="Do’konni o’chirish"
        description="Haqiqatan ham bu do’konni o’chirmoqchimisiz?"
      />
    </div>
  )
}
