"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { OrderStatusBadge, OrderPaymentStatusBadge } from "./order-status-badge"
import { Printer, Package, Store, User, ShoppingBag } from "lucide-react"

interface OrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId?: string | null
  orderData?: any | null
}

export function OrderViewDialog({
  open,
  onOpenChange,
  orderId,
  orderData,
}: OrderViewDialogProps) {
  const supabase = createClient()

  const targetId = orderId || orderData?.id || orderData?.rawOrdId

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-view-details", targetId],
    enabled: open && !!targetId,
    queryFn: async () => {
      const { getStoredOrders, isRealSupabaseConfigured } = await import("@/lib/mock-data")

      if (isRealSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select(`
              *,
              stores(name, phone, address, contact_person),
              profiles:agent_id(first_name, last_name),
              order_items(
                *,
                products(name, image_url)
              )
            `)
            .eq("id", targetId)
            .single()

          if (!error && data) return data
        } catch {}
      }

      const storedList = getStoredOrders()
      const found = storedList.find((o) => o.id === targetId || o.order_number === targetId || o.id === orderData?.id) || orderData

      if (found) {
        const storeName = found.stores?.name || found.store_name || "Do'kon"
        const agentName = found.profiles ? `${found.profiles.first_name || ""} ${found.profiles.last_name || ""}` : (found.agent_name || "Agent")
        const total = found.total_amount || 0
        const paid = found.paid_amount || 0

        const mockItems = found.items || found.order_items || [
          {
            id: "item-1",
            quantity: Math.max(1, Math.round(total / 38000)),
            unit_price: 38000,
            total_price: total,
            products: { name: "Kunjutli Premium Holva (500g)" },
          },
        ]

        return {
          id: found.id,
          order_number: found.order_number || `ORD-${found.id}`,
          total_amount: total,
          paid_amount: paid,
          status: found.status || "CONFIRMED",
          payment_status: found.payment_status || (paid >= total && total > 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING"),
          created_at: found.created_at || new Date().toISOString(),
          stores: {
            name: storeName,
            phone: found.stores?.phone || "+998 90 123 45 67",
            address: found.stores?.address || "Toshkent shahri",
          },
          profiles: {
            first_name: agentName.split(" ")[0] || "Agent",
            last_name: agentName.split(" ")[1] || "",
          },
          order_items: mockItems,
        }
      }

      return null
    },
  })

  const handlePrint = () => {
    window.print()
  }

  const currentOrder = order || orderData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-5 shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 print:shadow-none print:border-none print:max-w-full">
        <DialogHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              Sotuv Hujjati: {currentOrder?.order_number || `#${targetId}`}
            </DialogTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Sana: {currentOrder?.created_at ? formatDate(currentOrder.created_at) : formatDate(new Date().toISOString())}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden rounded-xl text-xs gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Chop etish</span>
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Yuklanmoqda...</div>
        ) : !currentOrder ? (
          <div className="py-8 text-center text-sm text-gray-400">Sotuv ma&apos;lumotlari topilmadi</div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Meta info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white text-sm">
                  <Store className="w-4 h-4 text-amber-600" />
                  {currentOrder.stores?.name || currentOrder.store_name || "Do'kon"}
                </div>
                <p className="text-gray-500">Tel: {currentOrder.stores?.phone || "+998 90 000 00 00"}</p>
                <p className="text-gray-500">Manzil: {currentOrder.stores?.address || "Toshkent"}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                  <User className="w-4 h-4 text-gray-400" />
                  Agent: {currentOrder.profiles?.first_name} {currentOrder.profiles?.last_name || ""}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <OrderStatusBadge status={currentOrder.status} />
                  <OrderPaymentStatusBadge status={currentOrder.payment_status} />
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="border rounded-2xl overflow-hidden border-gray-100 dark:border-gray-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/60 font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="p-2.5">Mahsulot Nomi</th>
                    <th className="p-2.5 text-center">Miqdori</th>
                    <th className="p-2.5 text-right">Narxi</th>
                    <th className="p-2.5 text-right">Jami Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                    currentOrder.order_items.map((item: any, idx: number) => {
                      const pName = item.products?.name || item.product_name || `Mahsulot #${idx + 1}`
                      const qty = item.quantity || 1
                      const price = item.unit_price || item.price || 0
                      const tot = item.total_price || (qty * price)
                      return (
                        <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="p-2.5 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>{pName}</span>
                          </td>
                          <td className="p-2.5 text-center font-bold">{qty} {item.unit || "dona"}</td>
                          <td className="p-2.5 text-right font-medium">{formatCurrency(price)}</td>
                          <td className="p-2.5 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(tot)}</td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">
                        Mahsulotlar tarkibi kiritilmagan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-3 bg-gradient-to-br from-amber-50/50 to-emerald-50/50 dark:from-amber-950/20 dark:to-emerald-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-500">To&apos;langan:</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(currentOrder.paid_amount || 0)}
                </p>
              </div>

              <div className="space-y-0.5 text-center">
                <span className="text-gray-500">Qarzdorlik (Qoldiq):</span>
                <p className="font-bold text-red-600 dark:text-red-400">
                  {formatCurrency((currentOrder.total_amount || 0) - (currentOrder.paid_amount || 0))}
                </p>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-gray-500 font-medium">Jami sotuv summasi:</span>
                <p className="text-base font-black text-amber-600 dark:text-amber-400">
                  {formatCurrency(currentOrder.total_amount || 0)}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 print:hidden">
              <Button onClick={() => onOpenChange(false)} variant="outline" className="rounded-xl text-xs px-6">
                Yopish
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
