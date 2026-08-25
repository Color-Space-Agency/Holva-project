"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, Clock, CheckCircle2, Package, Truck, ArrowRight, Store } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { OrderStatusBadge, OrderPaymentStatusBadge } from "@/components/orders/order-status-badge"
import { INITIAL_ORDERS } from "@/lib/mock-data"

export function RecentOrders() {
  const [orders] = useState(INITIAL_ORDERS.slice(0, 5))

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between animate-fade-in-up">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              So&apos;nggi Buyurtmalar
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Oxirgi qabul qilinganlar</p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 hover:underline transition-all"
          >
            Barchasini ko&apos;rish <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 hover:bg-violet-50/50 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800/60 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-700 dark:text-violet-300 font-black text-xs flex-shrink-0 shadow-xs">
                  {order.order_number.split("-")[2] || "01"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                    {order.store_name}
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                    {order.order_number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <div className="mt-0.5">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                <Link
                  href={`/orders`}
                  className="p-2 text-gray-400 hover:text-violet-600 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Ko'rish"
                >
                  <Eye size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
        <Link
          href="/orders"
          className="w-full py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          Yangi Buyurtma Yaratish <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
