import { NextRequest, NextResponse } from "next/server";
import { MockOrder, INITIAL_ORDERS } from "@/lib/mock-data";

// Global server in-memory store across requests
declare global {
  var __HOLVA_SERVER_ORDERS: MockOrder[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_ORDERS) {
  globalThis.__HOLVA_SERVER_ORDERS = [...INITIAL_ORDERS];
}

// GET /api/sync/orders — Barcha buyurtmalarni olish
export async function GET(request: NextRequest) {
  try {
    const orders = globalThis.__HOLVA_SERVER_ORDERS || [...INITIAL_ORDERS];
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/orders — Yangi buyurtma yoki to'lov qo'shish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, order, orderId, amount, paymentMethod } = body;

    if (!globalThis.__HOLVA_SERVER_ORDERS) {
      globalThis.__HOLVA_SERVER_ORDERS = [...INITIAL_ORDERS];
    }

    if (action === "create" && order) {
      // Yangi buyurtma
      const newOrder: MockOrder = {
        id: order.id || `ord-${Date.now()}`,
        order_number: order.order_number || `ORD-${Date.now().toString().slice(-6)}`,
        store_name: order.store_name || "Do'kon",
        agent_name: order.agent_name || "Sardor Rahimov",
        total_amount: Number(order.total_amount) || 0,
        paid_amount: Number(order.paid_amount) || 0,
        status: order.status || "CONFIRMED",
        payment_status: order.payment_status || "PENDING",
        created_at: order.created_at || new Date().toISOString(),
        items_count: order.items_count || 1,
      };

      globalThis.__HOLVA_SERVER_ORDERS = [newOrder, ...globalThis.__HOLVA_SERVER_ORDERS];

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        createdOrder: newOrder,
      });
    }

    if (action === "pay" && orderId && amount) {
      // To'lov qabul qilish
      let updatedOrder: MockOrder | null = null;
      globalThis.__HOLVA_SERVER_ORDERS = globalThis.__HOLVA_SERVER_ORDERS.map((ord) => {
        if (ord.id === orderId || ord.order_number === orderId) {
          const currentPaid = ord.paid_amount || 0;
          const newPaid = currentPaid + Number(amount);
          const isFull = newPaid >= ord.total_amount;
          const newPaymentStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" = isFull ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING";

          const res: MockOrder = {
            ...ord,
            paid_amount: newPaid,
            payment_status: newPaymentStatus,
            status: isFull && ord.status === "CONFIRMED" ? "DELIVERED" : ord.status,
          };
          updatedOrder = res;
          return res;
        }
        return ord;
      });

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        updatedOrder,
      });
    }

    if (action === "delete" && orderId) {
      // Buyurtmani o'chirish
      globalThis.__HOLVA_SERVER_ORDERS = globalThis.__HOLVA_SERVER_ORDERS.filter(
        (o) => o.id !== orderId && o.order_number !== orderId
      );

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
      });
    }

    return NextResponse.json({ success: false, error: "Noma'lum harakat" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
