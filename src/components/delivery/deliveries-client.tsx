"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { isRealSupabaseConfigured } from "@/lib/mock-data"
import { Plus, Search, Truck, MapPin, User, CheckCircle2, Clock, AlertCircle, Trash2, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { DeliveryFormDialog } from "./delivery-form-dialog"

interface DeliveryItem {
  id: string
  delivery_number: string
  store_name: string
  driver_name: string
  vehicle_info: string
  total_amount: number
  delivery_date: string
  status: "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
}

const DEFAULT_DELIVERIES: DeliveryItem[] = []

const STORAGE_KEY = "holva_crm_stored_deliveries"

function getStoredDeliveries(): DeliveryItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveDeliveries(items: DeliveryItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function DeliveriesClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<DeliveryItem | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [localItems, setLocalItems] = useState<DeliveryItem[]>([])
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    setLocalItems(getStoredDeliveries())
  }, [])

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries", searchQuery, localItems],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("deliveries")
            .select(`
              *,
              stores(name),
              profiles:driver_id(first_name, last_name)
            `)
            .order("created_at", { ascending: false })

          if (searchQuery) {
            query = query.or(`delivery_number.ilike.%${searchQuery}%`)
          }

          const { data, error } = await query
          if (data && data.length > 0) return data as any[]
        } catch {
          // Fallback
        }
      }

      let res = localItems
      if (searchQuery) {
        res = res.filter(
          (d) =>
            d.delivery_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.driver_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return res
    },
  })

  const handleDelete = (id: string) => {
    const updated = localItems.filter((d) => d.id !== id)
    setLocalItems(updated)
    saveDeliveries(updated)
    queryClient.invalidateQueries({ queryKey: ["deliveries"] })
    toast.success("Yetkazma o'chirildi")
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDelivery) return

    const updated = localItems.map((d) => (d.id === editingDelivery.id ? editingDelivery : d))
    setLocalItems(updated)
    saveDeliveries(updated)
    queryClient.invalidateQueries({ queryKey: ["deliveries"] })
    setIsEditOpen(false)
    setEditingDelivery(null)
    toast.success("Yetkazma holati yangilandi")
  }

  const getStatusBadge = (status: DeliveryItem["status"]) => {
    switch (status) {
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Yetkazildi
          </Badge>
        )
      case "OUT_FOR_DELIVERY":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 gap-1 font-medium animate-pulse">
            <Truck className="h-3 w-3" /> Yo&apos;lda
          </Badge>
        )
      case "PREPARING":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 gap-1 font-medium">
            <Clock className="h-3 w-3" /> Yuklanmoqda
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 gap-1 font-medium">
            <Clock className="h-3 w-3" /> Kutilmoqda
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 gap-1 font-medium">
            <AlertCircle className="h-3 w-3" /> Bekor qilindi
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-violet-600" />
            Yetkazib Berish & Logistika
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Do&apos;konlarga mahsulot tarqatish, haydovchilar va mashinalar yo&apos;nalishi
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Yangi yetkazma
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Raqam, do'kon yoki haydovchi bo'yicha qidirish..."
          className="pl-10 rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Yetkazma #</th>
                <th className="px-5 py-3.5 font-semibold">Do&apos;kon (Manzil)</th>
                <th className="px-5 py-3.5 font-semibold">Haydovchi & Avto</th>
                <th className="px-5 py-3.5 font-semibold">Yetkazish Sanasi</th>
                <th className="px-5 py-3.5 font-semibold">Holat</th>
                <th className="px-5 py-3.5 font-semibold text-right">Yuk Qiymati</th>
                <th className="px-5 py-3.5 font-semibold text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                    Yetkazmalar mavjud emas
                  </td>
                </tr>
              ) : (
                deliveries.map((del: any) => (
                  <tr key={del.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-medium text-violet-600 text-xs">
                      {del.delivery_number}
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {del.stores?.name || del.store_name}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {del.driver_name || `${del.profiles?.first_name || ''} ${del.profiles?.last_name || ''}`}
                      </div>
                      <div className="text-gray-400 mt-0.5">{del.vehicle_info}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {del.delivery_date}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(del.status)}</td>
                    <td className="px-5 py-4 font-bold text-right text-gray-900 dark:text-white text-base">
                      {formatCurrency(del.total_amount || 0)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDelivery(del)
                            setIsEditOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(del.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          setLocalItems(getStoredDeliveries())
          queryClient.invalidateQueries({ queryKey: ["deliveries"] })
        }}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yetkazmani Tahrirlash</DialogTitle>
          </DialogHeader>
          {editingDelivery && (
            <form onSubmit={handleEditSave} className="space-y-3.5 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Do'kon nomi *</label>
                <Input
                  value={editingDelivery.store_name}
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, store_name: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Haydovchi</label>
                  <Input
                    value={editingDelivery.driver_name}
                    onChange={(e) => setEditingDelivery({ ...editingDelivery, driver_name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Avto (Transport)</label>
                  <Input
                    value={editingDelivery.vehicle_info}
                    onChange={(e) => setEditingDelivery({ ...editingDelivery, vehicle_info: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Yuk Qiymati (so'm)</label>
                  <Input
                    type="number"
                    value={editingDelivery.total_amount}
                    onChange={(e) => setEditingDelivery({ ...editingDelivery, total_amount: Number(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Yetkazish Sanasi</label>
                  <Input
                    value={editingDelivery.delivery_date}
                    onChange={(e) => setEditingDelivery({ ...editingDelivery, delivery_date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Holat</label>
                <select
                  value={editingDelivery.status}
                  onChange={(e) => setEditingDelivery({ ...editingDelivery, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="PENDING">Kutilmoqda</option>
                  <option value="PREPARING">Yuklanmoqda</option>
                  <option value="OUT_FOR_DELIVERY">Yo'lda</option>
                  <option value="DELIVERED">Yetkazildi</option>
                  <option value="CANCELLED">Bekor qilindi</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                  Bekor qilish
                </Button>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                  Saqlash
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
