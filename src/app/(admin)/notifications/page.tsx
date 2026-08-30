"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
    message: "Sardor Rahimov tomonidan Korzinka Chilonzor do'koni uchun 14.8 mln so'mlik yangi sotuv rasmiylashtirildi.",
    type: "ORDER",
    time: "10 daqiqa oldin",
    read: false,
  },
  {
    id: "notif-2",
    title: "Xomashyo kam qoldi ogohlantirishi!",
    message: "Omborda 'Xandon pista (tozalangan)' qoldig'i 45 kg (minimal chegara: 50 kg). Yangi partiya sotib olish tavsiya etiladi.",
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

const STORAGE_KEY = "holva_crm_notifications"
const READ_IDS_KEY = "holva_crm_notifications_read"

function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as NotificationItem[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_NOTIFICATIONS
}

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = localStorage.getItem(READ_IDS_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch {}
  return new Set()
}

function saveNotifications(notifications: NotificationItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    // Also save read IDs separately for cross-tab consistency
    const readIds = notifications.filter(n => n.read).map(n => n.id)
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(readIds))
    // Dispatch event for header badge sync
    window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { notifications } }))
  } catch {}
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const initializedRef = useRef(false)

  // Initialize from localStorage once on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    const stored = getStoredNotifications()
    const readIds = getReadIds()
    // Apply read state from localStorage
    const merged = stored.map(n => ({
      ...n,
      read: readIds.has(n.id) ? true : n.read,
    }))
    setNotifications(merged)
    saveNotifications(merged)
  }, [])

  // Listen for cross-tab storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setNotifications(parsed)
        } catch {}
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // Sync with server — but NEVER overwrite local read state
  useEffect(() => {
    const fetchAndMerge = async () => {
      try {
        const res = await fetch("/api/sync/notifications", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.notifications)) {
            const readIds = getReadIds()
            // Merge server notifications but preserve local read state
            const serverNotifs = data.notifications as NotificationItem[]
            const localMap = new Map(notifications.map(n => [n.id, n]))
            
            // Find truly NEW notifications from server (not in local)
            const newFromServer = serverNotifs.filter(sn => !localMap.has(sn.id))
            
            if (newFromServer.length > 0) {
              const merged = [...newFromServer, ...notifications]
              // Apply read IDs 
              const final = merged.map(n => ({
                ...n,
                read: readIds.has(n.id) ? true : n.read,
              }))
              setNotifications(final)
              saveNotifications(final)
            }
          }
        }
      } catch {}
    }

    // Only poll every 10 seconds (not 3s) to reduce server thrashing
    const interval = setInterval(fetchAndMerge, 10000)
    // Initial fetch after 2 seconds
    const timeout = setTimeout(fetchAndMerge, 2000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [notifications])

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
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    saveNotifications(updated)
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
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    saveNotifications(updated)
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
    saveNotifications([])
    toast.success("Bildirishnomalar tozalandi")
    try {
      await fetch("/api/sync/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      })
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-amber-600" />
            Tizim Bildirishnomalari
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {unreadCount}
              </Badge>
            )}
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
