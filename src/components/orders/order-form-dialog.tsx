"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { isRealSupabaseConfigured, INITIAL_STORES, INITIAL_PRODUCTS, createStoredOrder, updateStoredOrder, MockOrder } from "@/lib/mock-data"
import { toast } from "sonner"
import { useEffect } from "react"
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
import { Trash, Plus, ChevronRight } from "lucide-react"

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: any
}

export function OrderFormDialog({ open, onOpenChange, onSuccess, initialData }: OrderFormDialogProps) {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [storeId, setStoreId] = useState("")
  const [agentId, setAgentId] = useState("agent-1")
  const [items, setItems] = useState<any[]>([
    { product_id: "p-1", quantity: 5, unit_price: 38000, discount_amount: 0 },
  ])
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setStoreId(initialData.stores?.name ? INITIAL_STORES.find(s => s.name === initialData.stores.name)?.id || "" : (initialData.store_name ? INITIAL_STORES.find(s => s.name === initialData.store_name)?.id || "" : ""))
        setPaidAmount(initialData.paid_amount || 0)
        setNotes(initialData.notes || "")
        // Mock items for edit if real items are not present
        setItems(initialData.order_items?.length ? initialData.order_items : [
          { product_id: "p-1", quantity: initialData.items_count || 1, unit_price: (initialData.total_amount || 0) / (initialData.items_count || 1), discount_amount: 0 }
        ])
      } else {
        setStoreId("")
        setItems([{ product_id: "p-1", quantity: 5, unit_price: 38000, discount_amount: 0 }])
        setPaidAmount(0)
        setNotes("")
      }
      setStep(1)
    }
  }, [open, initialData])

  const { data: stores } = useQuery({
    queryKey: ["stores-select"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("stores").select("id, name").eq("status", "ACTIVE")
          if (data && data.length > 0) return data
        } catch {}
      }
      return INITIAL_STORES.map((s) => ({ id: s.id, name: s.name }))
    },
    enabled: open,
  })

  const { data: agents } = useQuery({
    queryKey: ["agents-select"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("role", "SALES_AGENT")
          if (data && data.length > 0) return data
        } catch {}
      }
      return [
        { id: "agent-1", first_name: "Sardor", last_name: "Rahimov" },
        { id: "agent-2", first_name: "Jasur", last_name: "Qodirov" },
      ]
    },
    enabled: open,
  })

  const { data: products } = useQuery({
    queryKey: ["products-select"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("products").select("id, name, price").eq("status", "ACTIVE")
          if (data && data.length > 0) return data
        } catch {}
      }
      return INITIAL_PRODUCTS.map((p) => ({ id: p.id, name: p.name, price: p.price }))
    },
    enabled: open,
  })

  const handleAddItem = () => {
    const defaultProduct = products?.[0] || { id: "p-1", price: 38000 }
    setItems([
      ...items,
      {
        product_id: defaultProduct.id,
        quantity: 1,
        unit_price: defaultProduct.price || 38000,
        discount_amount: 0,
      },
    ])
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

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price - (item.discount_amount || 0),
    0
  )

  const handleSubmit = async () => {
    if (!storeId || items.length === 0) {
      toast.error("Iltimos, do'kon va mahsulotlarni tanlang")
      return
    }

    setIsSubmitting(true)
    try {
      const orderNumber = initialData?.order_number || `ORD-${Date.now().toString().slice(-6)}`
      const selectedStore = stores?.find((s) => s.id === storeId)
      const selectedAgent = agents?.find((a) => a.id === agentId)
      const agentName = selectedAgent ? `${selectedAgent.first_name} ${selectedAgent.last_name || ""}`.trim() : "Sardor Rahimov"
      const storeName = selectedStore?.name || "Do'kon"

      if (isRealSupabaseConfigured()) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (initialData) {
            await supabase.from("orders").update({
              store_id: storeId,
              agent_id: agentId,
              total_amount: totalAmount,
              notes,
              payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
            }).eq("id", initialData.id)
          } else {
            await supabase.from("orders").insert({
              store_id: storeId,
              agent_id: agentId,
              order_number: orderNumber,
              total_amount: totalAmount,
              notes,
              status: "CONFIRMED",
              payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
              created_by: user?.id,
            })
          }
        } catch {
          // Fallback
        }
      }

      // Synchronize in local/shared state so Sales Agent sees it immediately
      if (initialData) {
        updateStoredOrder(initialData.id, {
          store_name: storeName,
          agent_name: agentName,
          total_amount: totalAmount,
          paid_amount: paidAmount || 0,
          payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
          items_count: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        })
        toast.success("Sotuv muvaffaqiyatli tahrirlandi!")
      } else {
        const newMockOrder: MockOrder = {
          id: `ord-${Date.now()}`,
          order_number: orderNumber,
          store_name: storeName,
          agent_name: agentName,
          total_amount: totalAmount,
          paid_amount: paidAmount || 0,
          status: "CONFIRMED",
          payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
          created_at: new Date().toISOString(),
          items_count: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
        }
        createStoredOrder(newMockOrder)
        toast.success("Yangi sotuv muvaffaqiyatli rasmiylashtirildi!")
      }

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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yangi Sotuv Rasmiylashtirish (1C Faktura)
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Do&apos;kon & Agent
            </span>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Mahsulotlar
            </span>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              3
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">To&apos;lov</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Do&apos;kon (Mijoz) *
              </label>
              <Select value={storeId} onValueChange={setStoreId}>
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Mas&apos;ul Sotuv Agenti *
              </label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue placeholder="Agentni tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {agents?.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.first_name} {a.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                onClick={() => setStep(2)}
                disabled={!storeId}
                className="h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-6 text-xs font-bold"
              >
                Keyingisi: Mahsulotlar
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">Mahsulot</label>
                    <Select
                      value={item.product_id}
                      onValueChange={(val) => updateItem(index, "product_id", val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {formatCurrency(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-24 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">Soni (dona)</label>
                    <Input
                      type="number"
                      min="1"
                      className="h-10 rounded-xl"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    />
                  </div>

                  <div className="w-full sm:w-32 space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500">Narx</label>
                    <Input
                      type="number"
                      className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800"
                      value={item.unit_price}
                      readOnly
                    />
                  </div>

                  <div className="self-end sm:self-center mt-2 sm:mt-5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleAddItem}
              className="w-full h-11 rounded-2xl border-dashed gap-2 text-xs font-bold"
            >
              <Plus className="h-4 w-4" /> Mahsulot qo&apos;shish
            </Button>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Jami Hisoblangan Summa:
              </span>
              <span className="text-xl font-bold text-violet-600 dark:text-violet-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 rounded-2xl text-xs"
              >
                Ortga
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold"
              >
                Keyingisi: To&apos;lov
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                To&apos;lov Usuli
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-11 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="CASH">Naqd pul</SelectItem>
                  <SelectItem value="CARD">Plastik karta</SelectItem>
                  <SelectItem value="BANK">Bank o&apos;tkazmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Oldindan To&apos;langan Summa (so&apos;m)
              </label>
              <Input
                type="number"
                step="10000"
                className="h-11 rounded-2xl"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0"
              />
              <span className="text-[11px] text-gray-400">
                Jami summa: {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Qo&apos;shimcha Izoh
              </label>
              <Input
                className="h-11 rounded-2xl"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Yetkazish vaqti yoki maxsus talablar..."
              />
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-11 rounded-2xl text-xs"
              >
                Ortga
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold"
              >
                {isSubmitting ? "Saqlanmoqda..." : "Sotuvni Tasdiqlash"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
