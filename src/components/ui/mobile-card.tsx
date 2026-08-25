"use client";

import { useState } from "react";
import { ChevronRight, CheckCircle2, Clock, Package, Truck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MobileOrder {
  id: string;
  order_number: string;
  store_name: string;
  agent_name?: string;
  total_amount: number;
  status: string;
  payment_status?: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DRAFT: { label: "Qoralama", icon: Clock, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  CONFIRMED: { label: "Tasdiqlangan", icon: CheckCircle2, color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900" },
  PREPARING: { label: "Tayyorlanmoqda", icon: Package, color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
  READY: { label: "Tayyor", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" },
  DELIVERING: { label: "Yetkazilmoqda", icon: Truck, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900" },
  DELIVERED: { label: "Yetkazildi", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300" },
  CANCELLED: { label: "Bekor qilingan", icon: AlertCircle, color: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900" },
};

export function MobileCard({ order, onPress }: { order: MobileOrder; onPress?: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const status = statusMap[order.status] || statusMap.CONFIRMED;
  const StatusIcon = status.icon;

  return (
    <div
      className={`
        bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800
        transition-all duration-150 touch-friendly card-shadow card-enter
        ${isPressed ? "scale-[0.98] bg-gray-50 dark:bg-gray-800/80" : "hover:border-violet-200 dark:hover:border-gray-700"}
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => {
        setIsPressed(false);
        onPress?.();
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => {
        setIsPressed(false);
        onPress?.();
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-black flex-shrink-0">
            {order.order_number.slice(-3)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{order.store_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString("uz-UZ")}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-black text-gray-900 dark:text-white text-sm">{formatCurrency(order.total_amount)}</p>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${status.color}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span className="font-mono">№ {order.order_number}</span>
        <span className="flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
          <span>Batafsil</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export function MobileCardList({
  orders,
  onCardPress,
}: {
  orders: MobileOrder[];
  onCardPress?: (order: MobileOrder) => void;
}) {
  return (
    <div className="space-y-2.5">
      {orders.map((order) => (
        <MobileCard key={order.id} order={order} onPress={() => onCardPress?.(order)} />
      ))}
    </div>
  );
}

export default MobileCard;
