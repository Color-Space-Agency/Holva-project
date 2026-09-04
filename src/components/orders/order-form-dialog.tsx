"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  isRealSupabaseConfigured,
  getStoredStores,
  getStoredProducts,
  getStoredEmployees,
  createStoredOrder,
  updateStoredOrder,
  MockOrder,
  createStoredStore,
} from "@/lib/mock-data"
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
import { Trash, Plus, ChevronRight, Store, UserCheck, ShoppingBag, CreditCard, Building2 } from "lucide-react"

interface OrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: any
}

export function OrderFormDialog({ open, onOpenChange, onSuccess, initialData }: OrderFormDialogProps) {
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [selectedStoreName, setSelectedStoreName] = useState("")
  const [customStoreInput, setCustomStoreInput] = useState("")
  const [agentName, setAgentName] = useState("Sardor Rahimov")
  const [items, setItems] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [paidAmount, setPaidAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Local state for stores and products
  const [availableStores, setAvailableStores] = useState<any[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      const storedStores = getStoredStores()
      const storedProds = getStoredProducts()
      const storedEmps = getStoredEmployees()

      setAvailableStores(storedStores)
      setAvailableProducts(storedProds)

      if (initialData) {
        setSelectedStoreName(initialData.stores?.name || initialData.store_name || "")
        setAgentName(initialData.agent_name || "Sardor Rahimov")
        setPaidAmount(initialData.paid_amount || 0)
        setNotes(initialData.notes || "")
        setItems(
          initialData.order_items?.length
            ? initialData.order_items
            : [
                {
                  product_name: storedProds[0]?.name || "Kunjutli Premium Holva",
                  quantity: initialData.items_count || 1,
                  unit_price: storedProds[0]?.price || (initialData.total_amount || 0) / (initialData.items_count || 1) || 38000,
                  discount_amount: 0,
                },
              ]
        )
      } else {
        setSelectedStoreName(storedStores[0]?.name || "")
        setCustomStoreInput("")
        setAgentName(storedEmps.find((e) => e.department.toLowerCase().includes("sotuv"))?.full_name || "Sardor Rahimov")
        setItems([
          {
            product_name: storedProds[0]?.name || "Kunjutli Premium Holva (500g)",
            quantity: 5,
            unit_price: storedProds[0]?.price || 38000,
            discount_amount: 0,
          },
        ])
        setPaidAmount(0)
        setNotes("")
      }
      setStep(1)
    }
  }, [open, initialData])

  const handleAddItem = () => {
    const defaultProd = availableProducts[0] || { name: "Kunjutli Premium Holva", price: 38000 }
    setItems([
      ...items,
      {
        product_name: defaultProd.name,
        quantity: 1,
        unit_price: defaultProd.price || 38000,
        discount_amount: 0,
      },
    ])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    if (field === "product_name") {
      const match = availableProducts.find((p) => p.name === value)
      if (match) newItems[index].unit_price = match.price
    }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0) - (Number(item.discount_amount) || 0),
    0
  )

  const handleSubmit = async () => {
    const finalStore = selectedStoreName === "new" || !selectedStoreName ? customStoreInput.trim() : selectedStoreName
    if (!finalStore) {
      toast.error("Iltimos, do'kon nomini kiriting yoki tanlang")
      return
    }
    if (items.length === 0) {
      toast.error("Iltimos, kamida bitta mahsulot qo'shing")
      return
    }

    setIsSubmitting(true)
    try {
      const orderNumber = initialData?.order_number || `ORD-${Date.now().toString().slice(-6)}`

      // If new store was typed, save it to stored stores list too
      if (!availableStores.some((s) => s.name.toLowerCase() === finalStore.toLowerCase())) {
        createStoredStore({
          id: `s-${Date.now()}`,
          name: finalStore,
          phone: "+998 90 000 00 00",
          address: "Toshkent shahri",
          contact_person: "Mijoz",
          credit_limit: 50000000,
          current_balance: 0,
          status: "ACTIVE",
        })
      }

      if (isRealSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (initialData) {
            await supabase.from("orders").update({
              total_amount: totalAmount,
              notes,
              payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
            }).eq("id", initialData.id)
          } else {
            await supabase.from("orders").insert({
              order_number: orderNumber,
              total_amount: totalAmount,
              notes,
              status: "CONFIRMED",
              payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
              created_by: user?.id,
            })
          }
        } catch {}
      }

      if (initialData) {
        updateStoredOrder(initialData.id, {
          store_name: finalStore,
          agent_name: agentName,
          total_amount: totalAmount,
          paid_amount: paidAmount || 0,
          payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
          items_count: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
        })
        toast.success("Sotuv tahrirlandi!")
      } else {
        const newMockOrder: MockOrder = {
          id: `ord-${Date.now()}`,
          order_number: orderNumber,
          store_name: finalStore,
          agent_name: agentName,
          total_amount: totalAmount,
          paid_amount: paidAmount || 0,
          status: "CONFIRMED",
          payment_status: paidAmount > 0 ? (paidAmount >= totalAmount ? "PAID" : "PARTIAL") : "PENDING",
          created_at: new Date().toISOString(),
          items_count: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
        }
        createStoredOrder(newMockOrder)
        toast.success("Yangi sotuv rasmiylashtirildi!")
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
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 border-2 border-violet-100 dark:border-violet-950 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                {initialData ? "Sotuvni Tahrirlash" : "Yangi Sotuv Rasmiylashtirish (Frame)"}
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">Do'kon va agentga biriktirilgan sotuv hujjati</p>
            </div>
          </div>
        </DialogHeader>

        {/* Structured Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 my-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 1
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            }`}
          >
            <Store className="w-3.5 h-3.5" /> 1. Do'kon
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 2
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> 2. Mahsulotlar
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              step === 3
                ? "bg-violet-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> 3. To'lov
          </button>
        </div>

        {/* STEP 1: STORE & AGENT */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-violet-600" />
                  Do&apos;kon (Mijoz) *
                </label>
                <span className="text-[11px] text-gray-500">Mavjud: {availableStores.length} ta do'kon</span>
              </div>

              {availableStores.length > 0 ? (
                <div className="space-y-2">
                  <Select value={selectedStoreName} onValueChange={setSelectedStoreName}>
                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm font-semibold">
                      <SelectValue placeholder="Do'konni ro'yxatdan tanlang..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-56">
                      {availableStores.map((s) => (
                        <SelectItem key={s.id} value={s.name} className="py-2 text-sm font-medium">
                          {s.name} ({s.address || "Manzil ko'rsatilmadi"})
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="text-violet-600 font-bold border-t">
                        + Yangi do'kon nomi yozish...
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {selectedStoreName === "new" && (
                    <Input
                      value={customStoreInput}
                      onChange={(e) => setCustomStoreInput(e.target.value)}
                      placeholder="Do'kon nomini kiriting (masalan: Korzinka Chilonzor)"
                      className="h-11 rounded-xl bg-white dark:bg-gray-900 text-sm"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    value={customStoreInput}
                    onChange={(e) => setCustomStoreInput(e.target.value)}
                    placeholder="Do'kon nomini kiriting (masalan: Korzinka Chilonzor)"
                    className="h-12 rounded-xl bg-white dark:bg-gray-900 text-sm"
                  />
                  <p className="text-[11px] text-amber-600 font-medium">
                    Hozircha do'konlar bazasi bo'sh. Yuqorida nomini kiriting, avtomatik biriktiriladi.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-violet-600" />
                Mas&apos;ul Sotuv Agenti
              </label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent ismi familiyasi"
                className="h-11 rounded-xl bg-white dark:bg-gray-900 text-sm"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="button"
                onClick={() => {
                  const finalStore = selectedStoreName === "new" || !selectedStoreName ? customStoreInput.trim() : selectedStoreName
                  if (!finalStore) {
                    toast.error("Iltimos, do'kon nomini tanlang yoki kiriting")
                    return
                  }
                  setStep(2)
                }}
                className="h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-6 text-sm font-bold shadow-md cursor-pointer gap-2"
              >
                Keyingisi: Mahsulotlar <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCTS */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center bg-gray-50 dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs"
                >
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] font-bold text-gray-500">Mahsulot Nomi</label>
                    {availableProducts.length > 0 ? (
                      <Select
                        value={item.product_name}
                        onValueChange={(val) => updateItem(index, "product_name", val)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-gray-800 text-sm font-semibold">
                          <SelectValue placeholder="Mahsulotni tanlang" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl max-h-48">
                          {availableProducts.map((p) => (
                            <SelectItem key={p.id} value={p.name} className="text-sm font-medium">
                              {p.name} — {formatCurrency(p.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={item.product_name}
                        onChange={(e) => updateItem(index, "product_name", e.target.value)}
                        placeholder="Mahsulot nomi"
                        className="h-11 rounded-xl bg-white dark:bg-gray-800 text-sm font-semibold"
                      />
                    )}
                  </div>

                  <div className="w-full sm:w-28 space-y-1">
                    <label className="text-[11px] font-bold text-gray-500">Soni (dona)</label>
                    <Input
                      type="number"
                      min="1"
                      className="h-11 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold text-center"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    />
                  </div>

                  <div className="w-full sm:w-36 space-y-1">
                    <label className="text-[11px] font-bold text-gray-500">Dona narxi (so'm)</label>
                    <Input
                      type="number"
                      step="500"
                      className="h-11 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                    />
                  </div>

                  <div className="self-end sm:self-center mt-2 sm:mt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                      onClick={() => removeItem(index)}
                      aria-label="O'chirish"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full h-11 rounded-2xl border-dashed border-gray-300 dark:border-gray-700 gap-2 text-xs font-bold cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/30"
            >
              <Plus className="h-4 w-4 text-violet-600" /> Mahsulot qatori qo&apos;shish
            </Button>

            <div className="flex items-center justify-between p-4 bg-violet-50/60 dark:bg-violet-950/40 rounded-2xl border border-violet-100 dark:border-violet-900/60">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Jami Hisoblangan Summa:
              </span>
              <span className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 rounded-2xl px-6 text-sm font-bold cursor-pointer"
              >
                Ortga
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-6 text-sm font-bold shadow-md cursor-pointer gap-2"
              >
                Keyingisi: To&apos;lov <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & CONFIRM */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                To&apos;lov Usuli
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-semibold">
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
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Oldindan To&apos;langan Summa (so&apos;m)
              </label>
              <Input
                type="number"
                step="10000"
                className="h-12 rounded-2xl text-base font-bold bg-white dark:bg-gray-900"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0"
              />
              <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                <span>Jami sotuv summasi: <strong>{formatCurrency(totalAmount)}</strong></span>
                <span className={totalAmount - paidAmount > 0 ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                  {totalAmount - paidAmount > 0 ? `Qarz: ${formatCurrency(totalAmount - paidAmount)}` : "To'liq to'langan"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Qo&apos;shimcha Izoh
              </label>
              <Input
                className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Yetkazish vaqti yoki maxsus ko'rsatmalar..."
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12 rounded-2xl px-6 text-sm font-bold cursor-pointer"
              >
                Ortga
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-8 text-sm font-bold shadow-lg cursor-pointer"
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
