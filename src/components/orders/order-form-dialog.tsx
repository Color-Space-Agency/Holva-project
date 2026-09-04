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
  syncStoresFromServer,
  syncProductsFromServer,
  syncOrdersFromServer,
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
import { Trash, Plus, ChevronRight, Store, UserCheck, ShoppingBag, CreditCard, Building2, Check, Sparkles } from "lucide-react"

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
      const updateData = () => {
        const storedStores = getStoredStores()
        const storedProds = getStoredProducts()
        if (storedStores.length > 0) setAvailableStores(storedStores)
        if (storedProds.length > 0) setAvailableProducts(storedProds)
      }

      syncStoresFromServer().then((st) => { if (st?.length) setAvailableStores(st) })
      syncProductsFromServer().then((pr) => { if (pr?.length) setAvailableProducts(pr) })
      syncOrdersFromServer()

      updateData()

      const storedProds = getStoredProducts()
      const storedStores = getStoredStores()
      const storedEmps = getStoredEmployees()

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
                  product_name: storedProds[0]?.name || "Kunjutli Premium Holva (500g)",
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

      window.addEventListener("products-updated", updateData)
      window.addEventListener("stores-updated", updateData)
      window.addEventListener("orders-updated", updateData)

      const interval = setInterval(() => {
        syncProductsFromServer().then((pr) => { if (pr?.length) setAvailableProducts(pr) })
        syncStoresFromServer().then((st) => { if (st?.length) setAvailableStores(st) })
      }, 3000)

      return () => {
        window.removeEventListener("products-updated", updateData)
        window.removeEventListener("stores-updated", updateData)
        window.removeEventListener("orders-updated", updateData)
        clearInterval(interval)
      }
    }
  }, [open, initialData])

  const handleAddItem = () => {
    const unselected = availableProducts.find(
      (p) => !items.some((it) => it.product_name === p.name)
    ) || availableProducts[0] || { name: "Kunjutli Premium Holva (500g)", price: 38000 }

    setItems([
      ...items,
      {
        product_name: unselected.name,
        quantity: 1,
        unit_price: unselected.price || 38000,
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

      // Save new store if written
      if (!availableStores.some((s) => s.name.toLowerCase().trim() === finalStore.toLowerCase().trim())) {
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
      <DialogContent className="w-[96vw] sm:max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl p-4 sm:p-8 border-2 border-violet-200 dark:border-violet-900 shadow-2xl space-y-6">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-violet-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {initialData ? "Sotuvni Tahrirlash" : "Yangi Sotuv Yaratish (Sotuv Ramkasi)"}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Do'konlar, mahsulotlar va to'lov ma'lumotlarini qulay boshqarish oynasi
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation Step Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-violet-50/80 dark:bg-gray-900 p-2 rounded-2xl border border-violet-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              step === 1
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.01]"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100/50"
            }`}
          >
            <Store className="w-4 h-4" /> 1. Do'kon tanlash
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              step === 2
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.01]"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100/50"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> 2. Mahsulotlar ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              step === 3
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.01]"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-violet-100/50"
            }`}
          >
            <CreditCard className="w-4 h-4" /> 3. To'lov va Qabul
          </button>
        </div>

        {/* STEP 1: STORE & AGENT */}
        {step === 1 && (
          <div className="space-y-6 pt-1">
            {/* Quick Store Selection Pills */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-violet-900 dark:text-violet-300 flex items-center justify-between uppercase tracking-wider">
                <span className="flex items-center gap-2 text-sm">
                  <Building2 className="w-5 h-5 text-violet-600" />
                  Mavjud Do'konlar (Tezkor tanlov):
                </span>
                <span className="text-xs font-normal text-gray-500">Jami: {availableStores.length} ta do'kon</span>
              </label>

              {availableStores.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border rounded-2xl bg-gray-50/50 dark:bg-gray-900/40">
                  {availableStores.map((s) => {
                    const isSelected = selectedStoreName === s.name
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStoreName(s.name)
                          setCustomStoreInput("")
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-400"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-violet-300 hover:bg-violet-50/30"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="font-bold text-sm truncate">{s.name}</div>
                          <div className={`text-xs truncate ${isSelected ? "text-violet-100" : "text-gray-500"}`}>
                            {s.address || "Toshkent"}
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 shrink-0 text-white" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dropdown & Direct Write-in Input */}
            <div className="bg-violet-50/60 dark:bg-violet-950/20 p-4 sm:p-5 rounded-3xl border border-violet-200/80 dark:border-violet-900/60 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Do'konni Ro'yxatdan Tanlash yoki Yangi Nom Kiritish:
                </label>
                <Select
                  value={selectedStoreName}
                  onValueChange={(val) => {
                    setSelectedStoreName(val)
                    if (val !== "new") setCustomStoreInput("")
                  }}
                >
                  <SelectTrigger className="h-13 rounded-2xl bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-base font-semibold px-4">
                    <SelectValue placeholder="Do'konni tanlang..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-60">
                    {availableStores.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="py-2.5 text-sm font-medium">
                        {s.name} ({s.address || "Toshkent"})
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-violet-600 font-bold border-t py-2.5">
                      + Yangi do'kon nomi yozish...
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedStoreName === "new" || availableStores.length === 0) && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-bold text-violet-800 dark:text-violet-300">
                    Yangi Do'kon Nomi (Ruchnoy kiritish):
                  </label>
                  <Input
                    value={customStoreInput}
                    onChange={(e) => setCustomStoreInput(e.target.value)}
                    placeholder="Masalan: Fayz Supermarket, Chilonzor 19"
                    className="h-13 rounded-2xl bg-white dark:bg-gray-900 text-base font-medium px-4 border-violet-300 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>

            {/* Sales Agent Field */}
            <div className="bg-gray-50 dark:bg-gray-900/60 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-violet-600" />
                Mas'ul Sotuv Agenti
              </label>
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent F.I.SH."
                className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-semibold px-4"
              />
            </div>

            <div className="flex justify-end pt-2">
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
                className="h-13 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-8 text-base font-bold shadow-lg shadow-violet-600/30 cursor-pointer gap-2"
              >
                Keyingisi: Mahsulotlar qo'shish <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCTS */}
        {step === 2 && (
          <div className="space-y-6 pt-1">
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item, index) => {
                const rowSelectableProducts = availableProducts.filter(
                  (p) => p.name === item.product_name || !items.some((it, i) => i !== index && it.product_name === p.name)
                )

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white dark:bg-gray-900 p-4 rounded-3xl border-2 border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-bold text-gray-500">Mahsulot Nomi</label>
                      {availableProducts.length > 0 ? (
                        <Select
                          value={item.product_name}
                          onValueChange={(val) => updateItem(index, "product_name", val)}
                        >
                          <SelectTrigger className="h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-bold border-gray-200">
                            <SelectValue placeholder="Mahsulotni tanlang" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl max-h-56">
                            {rowSelectableProducts.map((p) => (
                              <SelectItem key={p.id} value={p.name} className="py-2 text-sm font-medium">
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
                          className="h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-bold"
                        />
                      )}
                    </div>

                    <div className="w-full sm:w-44 space-y-1">
                      <label className="text-xs font-bold text-violet-700 dark:text-violet-300">Soni (Klaviatura / dona)</label>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-10 shrink-0 rounded-2xl text-lg font-bold border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            const currentQty = Number(item.quantity) || 1
                            updateItem(index, "quantity", Math.max(1, currentQty - 1))
                          }}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          className="h-12 w-20 sm:w-24 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 text-base font-black text-center border-2 border-violet-300 dark:border-violet-700 focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
                          value={item.quantity === 0 || item.quantity === "" ? "" : item.quantity}
                          onChange={(e) => {
                            const val = e.target.value
                            updateItem(index, "quantity", val === "" ? "" : Math.max(0, parseInt(val) || 0))
                          }}
                          onBlur={() => {
                            if (!item.quantity || Number(item.quantity) <= 0) {
                              updateItem(index, "quantity", 1)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-10 shrink-0 rounded-2xl text-lg font-bold border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            const currentQty = Number(item.quantity) || 0
                            updateItem(index, "quantity", currentQty + 1)
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="w-full sm:w-40 space-y-1">
                      <label className="text-xs font-bold text-gray-500">Dona narxi (so'm)</label>
                      <Input
                        type="number"
                        step="500"
                        className="h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-bold"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                      />
                    </div>

                    <div className="self-end sm:self-center mt-2 sm:mt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl cursor-pointer"
                        onClick={() => removeItem(index)}
                        aria-label="O'chirish"
                      >
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full h-13 rounded-2xl border-2 border-dashed border-violet-200 dark:border-violet-900 gap-2 text-sm font-bold cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/30 text-violet-700 dark:text-violet-300"
            >
              <Plus className="h-5 w-5 text-violet-600" /> Yangi Mahsulot Qatori Qo'shish
            </Button>

            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-violet-200">
                  Jami Hisoblangan Summa:
                </span>
                <span className="text-2xl sm:text-3xl font-black">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <Sparkles className="w-8 h-8 opacity-80" />
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-13 rounded-2xl px-8 text-sm font-bold cursor-pointer"
              >
                Ortga
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="h-13 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl px-8 text-base font-bold shadow-lg shadow-violet-600/30 cursor-pointer gap-2"
              >
                Keyingisi: To'lov <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & CONFIRM */}
        {step === 3 && (
          <div className="space-y-6 pt-1">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                To'lov Usuli
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-13 rounded-2xl bg-white dark:bg-gray-900 text-base font-semibold border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="CASH">Naqd pul</SelectItem>
                  <SelectItem value="CARD">Plastik karta</SelectItem>
                  <SelectItem value="BANK">Bank o'tkazmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Oldindan To'langan Summa (so'm)
              </label>
              <Input
                type="number"
                step="10000"
                className="h-13 rounded-2xl text-lg font-black bg-white dark:bg-gray-900 px-4 border-gray-300"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0"
              />
              <div className="flex justify-between items-center text-sm font-medium px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <span>Jami sotuv: <strong>{formatCurrency(totalAmount)}</strong></span>
                <span className={totalAmount - paidAmount > 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                  {totalAmount - paidAmount > 0 ? `Qarzdorlik: ${formatCurrency(totalAmount - paidAmount)}` : "To'liq to'langan"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Qo'shimcha Izoh
              </label>
              <Input
                className="h-13 rounded-2xl bg-white dark:bg-gray-900 text-sm px-4"
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
                className="h-13 rounded-2xl px-8 text-sm font-bold cursor-pointer"
              >
                Ortga
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-10 text-base font-bold shadow-xl shadow-emerald-600/30 cursor-pointer"
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
