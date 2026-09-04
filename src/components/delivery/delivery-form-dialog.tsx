"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { isRealSupabaseConfigured, getStoredStores, getStoredOrders } from "@/lib/mock-data"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DeliveryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeliveryFormDialog({ open, onOpenChange, onSuccess }: DeliveryFormDialogProps) {
  const supabase = createClient()
  const [orderId, setOrderId] = useState("")
  const [storeId, setStoreId] = useState("")
  const [driverName, setDriverName] = useState("Shavkat Ergashev")
  const [vehicleInfo, setVehicleInfo] = useState("Labo (01 450 TAA)")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-ready"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("orders")
            .select("id, order_number, store_id")
            .in("status", ["CONFIRMED", "READY"])
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return getStoredOrders().map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        store_id: o.store_id || "s-1",
      }))
    },
    enabled: open,
  })

  const { data: stores = [] } = useQuery({
    queryKey: ["stores-list"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("stores").select("id, name").eq("status", "ACTIVE")
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return getStoredStores().map((s) => ({ id: s.id, name: s.name }))
    },
    enabled: open,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) {
      toast.error("Iltimos, do'konni tanlang")
      return
    }

    setIsSubmitting(true)
    try {
      const selectedStore = stores.find((s) => s.id === storeId)
      const deliveryNumber = `DEL-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
      const newDelivery = {
        id: `del-${Date.now()}`,
        delivery_number: deliveryNumber,
        store_name: selectedStore?.name || "Do'kon",
        driver_name: driverName || "Shavkat Ergashev",
        vehicle_info: vehicleInfo || "Labo (01 450 TAA)",
        total_amount: 15000000,
        delivery_date: new Date().toLocaleDateString("uz-UZ"),
        status: "OUT_FOR_DELIVERY" as const,
      }

      if (isRealSupabaseConfigured()) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          await supabase.from("deliveries").insert({
            order_id: orderId || null,
            store_id: storeId,
            delivery_number: deliveryNumber,
            driver_name: driverName,
            vehicle_info: vehicleInfo,
            notes,
            status: "OUT_FOR_DELIVERY",
            created_by: user?.id,
            delivery_date: new Date().toISOString(),
          })
        } catch {
          // Fallback
        }
      }

      try {
        const raw = localStorage.getItem("holva_crm_stored_deliveries")
        const currentList = raw ? JSON.parse(raw) : []
        const updatedList = [newDelivery, ...currentList]
        localStorage.setItem("holva_crm_stored_deliveries", JSON.stringify(updatedList))
      } catch {}

      toast.success("Yangi yetkazma muvaffaqiyatli rejalashtirildi!")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yangi Yetkazma Rejalashtirish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Do&apos;kon (Mijoz) *
            </label>
            <Select
              value={storeId}
              onValueChange={(val) => {
                setStoreId(val)
                const matchedOrder = orders.find((o) => o.store_id === val)
                if (matchedOrder) setOrderId(matchedOrder.id)
              }}
            >
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Do'konni tanlang" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {stores?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Biriktirilgan Sotuv (Ixtiyoriy)
            </label>
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Sotuv raqamini tanlang" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {orders?.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.order_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Haydovchi Ismi *
            </label>
            <Input
              className="h-11 rounded-2xl"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Shavkat Ergashev"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Avtomobil Ma&apos;lumoti *
            </label>
            <Input
              className="h-11 rounded-2xl"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              placeholder="Labo (01 450 TAA)"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Izoh</label>
            <Input
              className="h-11 rounded-2xl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Maxsus ko'rsatmalar..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-2xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Yetkazmani Chiqarish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
