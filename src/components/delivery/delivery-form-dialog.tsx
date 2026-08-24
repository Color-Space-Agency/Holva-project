"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
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
import { Textarea } from "@/components/ui/textarea"

interface DeliveryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeliveryFormDialog({ open, onOpenChange, onSuccess }: DeliveryFormDialogProps) {
  const supabase = createClient()
  const [orderId, setOrderId] = useState("")
  const [storeId, setStoreId] = useState("")
  const [driverName, setDriverName] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: orders } = useQuery({
    queryKey: ["orders-ready"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("id, order_number, store_id").in("status", ["CONFIRMED", "READY"])
      return data || []
    },
    enabled: open,
  })

  const { data: stores } = useQuery({
    queryKey: ["stores-list"],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").eq("status", "ACTIVE")
      return data || []
    },
    enabled: open,
  })

  const handleSubmit = async () => {
    if (!storeId) {
      toast.error("Do'konni tanlang")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from("profiles").select("factory_id").eq("id", user?.id).single()
      
      const deliveryNumber = `DEL-${Date.now()}`
      
      const { error } = await supabase
        .from("deliveries")
        .insert({
          factory_id: profile?.factory_id,
          order_id: orderId || null,
          store_id: storeId,
          delivery_number: deliveryNumber,
          driver_name: driverName,
          vehicle_info: vehicleInfo,
          notes,
          status: "PENDING",
          created_by: user?.id,
          delivery_date: new Date().toISOString()
        })

      if (error) throw error

      toast.success("Yetkazma yaratildi")
      onSuccess()
      onOpenChange(false)
      // Reset
      setOrderId("")
      setStoreId("")
      setDriverName("")
      setVehicleInfo("")
      setNotes("")
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-select store if order is selected
  const handleOrderChange = (val: string) => {
    setOrderId(val)
    const order = orders?.find(o => o.id === val)
    if (order) {
      setStoreId(order.store_id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yangi yetkazma</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buyurtma (ixtiyoriy)</label>
            <Select value={orderId} onValueChange={handleOrderChange}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Yo'q</SelectItem>
                {orders?.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Do'kon</label>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>
                {stores?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Haydovchi ismi</label>
            <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Transport ma'lumoti</label>
            <Input value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Izoh</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
