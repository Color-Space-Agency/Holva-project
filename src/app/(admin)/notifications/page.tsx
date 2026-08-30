"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, AlertTriangle, ShoppingCart, DollarSign, Package, Factory, Trash2, Check } from "lucide-react"
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
    title: "Yangi sotuv qabul qilindi",
    message: "Sardor Rahimov tomonidan Korzinka Chilonzor do'koni uchun 14.8 mln so'mlik yangi buyurtma yaratildi.",
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/sync/notifications", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
        }
      }
    } catch (e) {
      console.error("fetchNotifications error:", e)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 3000)
    return () => clearInterval(interval)
  }, [])

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

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi")
    try {
      await fetch("/api/sync/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      })
    } catch {}
  }

  const markAsRead = async (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await fetch("/api/sync/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      })
    } catch {}
  }

  const clearAll = async () => {
    setNotifications([])
    toast.success("Bildirishnomalar tozalandi")
    try {
      await fetch("/api/sync/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      })
    } catch {}
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-amber-600" />
            Tizim Bildirishnomalari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Yangi sotuvlar, ombor qoldiqlari, to&apos;lovlar va muhim zavod voqealari
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={markAllAsRead} variant="outline" size="sm" className="rounded-xl gap-1 text-xs cursor-pointer">
            <CheckCheck className="h-4 w-4" /> Barchasini o&apos;qilgan qilish
          </Button>
          <Button onClick={clearAll} variant="ghost" size="sm" className="rounded-xl text-red-500 text-xs cursor-pointer hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-1" />
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
              onClick={() => !n.read && markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                n.read
                  ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-80 hover:opacity-100"
                  : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40 shadow-xs"
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    )}
                  </div>
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
