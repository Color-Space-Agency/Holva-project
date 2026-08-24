"use client"

import { useState } from "react"
import { Bell, CheckCheck, AlertTriangle, ShoppingCart, DollarSign, Package, Factory, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "ORDER" | "STOCK" | "PAYMENT" | "PRODUCTION"
  time: string
  read: boolean
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Yangi buyurtma qabul qilindi",
    message: "Sardor Rahimov tomonidan Korzinka Chilonzor do'koni uchun 14.8 mln so'mlik yangi buyurtma #104 yaratildi.",
    type: "ORDER",
    time: "10 daqiqa oldin",
    read: false,
  },
  {
    id: "notif-2",
    title: "Xomashyo kam qoldi ogohlantirishi!",
    message: "Omborda 'Xandon pista (tozalangan)' qoldig'i 45 kg (minimal chegara: 50 kg). Yangi partiya buyurtma qilish tavsiya etiladi.",
    type: "STOCK",
    time: "45 daqiqa oldin",
    read: false,
  },
  {
    id: "notif-3",
    title: "To'lov qabul qilindi",
    message: "Makro Supermarket hisobidan 9.2 mln so'm to'liq to'lov kelib tushdi va qarz yopildi.",
    type: "PAYMENT",
    time: "2 soat oldin",
    read: true,
  },
  {
    id: "notif-4",
    title: "Ishlab chiqarish partiyasi yakunlandi",
    message: "104-partiya bo'yicha 640 kg Kunjutli Premium holva tayyorlandi va tayyor mahsulotlar omboriga topshirildi.",
    type: "PRODUCTION",
    time: "Bugun 11:30",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS)

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ORDER":
        return <ShoppingCart className="h-5 w-5 text-violet-600" />
      case "STOCK":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "PAYMENT":
        return <DollarSign className="h-5 w-5 text-emerald-600" />
      case "PRODUCTION":
        return <Factory className="h-5 w-5 text-blue-600" />
    }
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi")
  }

  const clearAll = () => {
    setNotifications([])
    toast.success("Bildirishnomalar tozalandi")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-violet-600" />
            Tizim Bildirishnomalari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Yangi buyurtmalar, ombor qoldiqlari va muhim voqealar xabarnomalari
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="rounded-xl gap-1 text-xs">
            <CheckCheck className="h-4 w-4" /> Barchasini o&apos;qilgan qilish
          </Button>
          <Button onClick={clearAll} variant="ghost" size="sm" className="rounded-xl text-red-500 text-xs">
            Tozalash
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            Hozircha yangi bildirishnomalar yo&apos;q
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                n.read
                  ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-80"
                  : "bg-violet-50/40 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-800/40 shadow-sm"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</h3>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
