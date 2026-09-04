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

const DEFAULT_SERVER_NOTIFICATIONS: ServerNotificationItem[] = [];

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
