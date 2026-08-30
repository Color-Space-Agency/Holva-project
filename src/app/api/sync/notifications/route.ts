import { NextRequest, NextResponse } from "next/server";

export interface ServerNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "STOCK" | "PAYMENT" | "PRODUCTION";
  time: string;
  read: boolean;
  timestamp: number;
}

const DEFAULT_SERVER_NOTIFICATIONS: ServerNotificationItem[] = [
  {
    id: "notif-1",
    title: "Yangi sotuv qabul qilindi",
    message: "Sardor Rahimov tomonidan Korzinka Chilonzor do'koni uchun 14.8 mln so'mlik yangi buyurtma yaratildi.",
    type: "ORDER",
    time: "10 daqiqa oldin",
    read: false,
    timestamp: Date.now() - 10 * 60 * 1000,
  },
  {
    id: "notif-2",
    title: "Xomashyo kam qoldi ogohlantirishi!",
    message: "Omborda 'Xandon pista (tozalangan)' qoldig'i 45 kg (minimal chegara: 50 kg). Yangi partiya buyurtma qilish tavsiya etiladi.",
    type: "STOCK",
    time: "45 daqiqa oldin",
    read: false,
    timestamp: Date.now() - 45 * 60 * 1000,
  },
  {
    id: "notif-3",
    title: "To'lov qabul qilindi",
    message: "Makro Supermarket hisobidan 9.2 mln so'm to'lov kelib tushdi va qarz yopildi.",
    type: "PAYMENT",
    time: "2 soat oldin",
    read: true,
    timestamp: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: "notif-4",
    title: "Ishlab chiqarish partiyasi yakunlandi",
    message: "104-partiya bo'yicha 640 kg Kunjutli Premium holva tayyorlandi va tayyor mahsulotlar omboriga topshirildi.",
    type: "PRODUCTION",
    time: "Bugun 11:30",
    read: true,
    timestamp: Date.now() - 4 * 3600 * 1000,
  },
];

declare global {
  var __HOLVA_SERVER_NOTIFICATIONS: ServerNotificationItem[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_NOTIFICATIONS) {
  globalThis.__HOLVA_SERVER_NOTIFICATIONS = [...DEFAULT_SERVER_NOTIFICATIONS];
}

// GET /api/sync/notifications
export async function GET(request: NextRequest) {
  try {
    const notifications = globalThis.__HOLVA_SERVER_NOTIFICATIONS || [...DEFAULT_SERVER_NOTIFICATIONS];
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notification, notificationId } = body;

    if (!globalThis.__HOLVA_SERVER_NOTIFICATIONS) {
      globalThis.__HOLVA_SERVER_NOTIFICATIONS = [...DEFAULT_SERVER_NOTIFICATIONS];
    }

    if (action === "add" && notification) {
      const newItem: ServerNotificationItem = {
        id: notification.id || `notif-${Date.now()}`,
        title: notification.title,
        message: notification.message,
        type: notification.type || "ORDER",
        time: notification.time || "Hozirgina",
        read: false,
        timestamp: Date.now(),
      };
      globalThis.__HOLVA_SERVER_NOTIFICATIONS = [newItem, ...globalThis.__HOLVA_SERVER_NOTIFICATIONS];
      return NextResponse.json({
        success: true,
        notifications: globalThis.__HOLVA_SERVER_NOTIFICATIONS,
      });
    }

    if (action === "mark_all_read") {
      globalThis.__HOLVA_SERVER_NOTIFICATIONS = globalThis.__HOLVA_SERVER_NOTIFICATIONS.map((n) => ({
        ...n,
        read: true,
      }));
      return NextResponse.json({
        success: true,
        notifications: globalThis.__HOLVA_SERVER_NOTIFICATIONS,
      });
    }

    if (action === "mark_read" && notificationId) {
      globalThis.__HOLVA_SERVER_NOTIFICATIONS = globalThis.__HOLVA_SERVER_NOTIFICATIONS.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      return NextResponse.json({
        success: true,
        notifications: globalThis.__HOLVA_SERVER_NOTIFICATIONS,
      });
    }

    if (action === "clear_all") {
      globalThis.__HOLVA_SERVER_NOTIFICATIONS = [];
      return NextResponse.json({
        success: true,
        notifications: [],
      });
    }

    return NextResponse.json({ success: false, error: "Noma'lum harakat" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
