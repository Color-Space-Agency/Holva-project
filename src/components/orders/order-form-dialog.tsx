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
import { formatCurrency } from "@/lib/utils"
import { Trash } from "lucide-react"

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function OrderFormDialog({ open, onOpenChange, onSuccess }: OrderFormDialogProps) {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState("")
  const [agentId, setAgentId] = useState("")
  const [items, setItems] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: stores } = useQuery({
    queryKey: ["stores-list"],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").eq("status", "ACTIVE")
      return data || []
    },
    enabled: open,
  })

  const { data: agents } = useQuery({
    queryKey: ["agents-list"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, first_name, last_name").eq("role", "SALES_AGENT")
      return data || []
    },
    enabled: open,
  })

  const { data: products } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price").eq("status", "ACTIVE")
      return data || []
    },
    enabled: open,
  })

  const handleAddItem = () => {
    setItems([...items, { product_id: "", quantity: 1, unit_price: 0, discount_amount: 0 }])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === "product_id") {
      const product = products?.find((p) => p.id === value)
      if (product) newItems[index].unit_price = product.price
    }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price) - (item.discount_amount || 0), 0)

  const handleSubmit = async () => {
    if (!storeId || !agentId || items.length === 0) {
      toast.error("Barcha maydonlarni to'ldiring")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from("profiles").select("factory_id").eq("id", user?.id).single()
      
      const orderNumber = `ORD-${Date.now()}`
      
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          factory_id: profile?.factory_id,
          store_id: storeId,
          agent_id: agentId,
          order_number: orderNumber,
          total_amount: totalAmount,
          notes,
          status: "DRAFT",
          payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
          created_by: user?.id
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map(item => ({
        order_id: order.id,
        factory_id: profile?.factory_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        total_price: (item.quantity * item.unit_price) - (item.discount_amount || 0)
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      if (paidAmount > 0) {
        await supabase.from("order_payments").insert({
          order_id: order.id,
          factory_id: profile?.factory_id,
          amount: paidAmount,
          payment_method: paymentMethod,
          status: "COMPLETED",
          created_by: user?.id
        })
      }

      toast.success("Buyurtma yaratildi")
      onSuccess()
      onOpenChange(false)
      // Reset
      setStep(1)
      setStoreId("")
      setAgentId("")
      setItems([])
      setPaidAmount(0)
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yangi buyurtma - Qadam {step}/3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Do'kon</label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Do'konni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Agentni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {agents?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.first_name} {a.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setStep(2)} disabled={!storeId || !agentId}>
                Keyingi
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end border p-4 rounded-md">
                <div className="flex-1 space-y-2">
                  <label className="text-xs">Mahsulot</label>
                  <Select value={item.product_id} onValueChange={(val) => updateItem(index, "product_id", val)}>
                    <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                    <SelectContent>
                      {products?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-2">
                  <label className="text-xs">Miqdor</label>
                  <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-xs">Narx</label>
                  <Input type="number" value={item.unit_price} readOnly />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-xs">Chegirma</label>
                  <Input type="number" value={item.discount_amount} onChange={(e) => updateItem(index, "discount_amount", Number(e.target.value))} />
                </div>
                <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddItem} className="w-full">
              Mahsulot qo'shish
            </Button>
            
            <div className="text-right font-bold text-lg pt-4">
              Jami: {formatCurrency(totalAmount)}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Ortga</Button>
              <Button onClick={() => setStep(3)} disabled={items.length === 0}>Keyingi</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">To'lov usuli</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Naqd pul</SelectItem>
                  <SelectItem value="CARD">Plastik karta</SelectItem>
                  <SelectItem value="BANK">Bank o'tkazmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To'langan summa</label>
              <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Jami summa: {formatCurrency(totalAmount)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Izoh</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Ortga</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
