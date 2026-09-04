import { NextRequest, NextResponse } from "next/server"
import { MockOrder } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_ORDERS: MockOrder[] | undefined
}

if (!globalThis.__HOLVA_SERVER_ORDERS) {
  globalThis.__HOLVA_SERVER_ORDERS = []
}

// GET /api/sync/orders — Get all orders
export async function GET() {
  try {
    const orders = globalThis.__HOLVA_SERVER_ORDERS || []
    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error: any) {
    return NextResponse.json({ success: true, orders: globalThis.__HOLVA_SERVER_ORDERS || [] })
  }
}

// POST /api/sync/orders — Add, update or sync orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, order, orderId, amount, orders } = body

    if (!globalThis.__HOLVA_SERVER_ORDERS) {
      globalThis.__HOLVA_SERVER_ORDERS = []
    }

    if (action === "sync" && Array.isArray(orders)) {
      const orderMap = new Map<string, MockOrder>()
      for (const o of globalThis.__HOLVA_SERVER_ORDERS) {
        if (o && o.id) orderMap.set(o.id, o)
      }
      for (const o of orders) {
        if (o && o.id) orderMap.set(o.id, o)
      }
      globalThis.__HOLVA_SERVER_ORDERS = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      return NextResponse.json({ success: true, orders: globalThis.__HOLVA_SERVER_ORDERS })
    }

    if (action === "create" && order) {
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
      }

      globalThis.__HOLVA_SERVER_ORDERS = [newOrder, ...globalThis.__HOLVA_SERVER_ORDERS.filter((o) => o.id !== newOrder.id)]

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        createdOrder: newOrder,
      })
    }

    if (action === "pay" && orderId && amount) {
      let updatedOrder: MockOrder | null = null
      globalThis.__HOLVA_SERVER_ORDERS = globalThis.__HOLVA_SERVER_ORDERS.map((ord) => {
        if (ord.id === orderId || ord.order_number === orderId) {
          const currentPaid = ord.paid_amount || 0
          const newPaid = currentPaid + Number(amount)
          const isFull = newPaid >= ord.total_amount
          const newPaymentStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" = isFull
            ? "PAID"
            : newPaid > 0
            ? "PARTIAL"
            : "PENDING"

          const res: MockOrder = {
            ...ord,
            paid_amount: newPaid,
            payment_status: newPaymentStatus,
            status: isFull && ord.status === "CONFIRMED" ? "DELIVERED" : ord.status,
          }
          updatedOrder = res
          return res
        }
        return ord
      })

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        updatedOrder,
      })
    }

    if (action === "delete" && orderId) {
      globalThis.__HOLVA_SERVER_ORDERS = globalThis.__HOLVA_SERVER_ORDERS.filter(
        (o) => o.id !== orderId && o.order_number !== orderId
      )

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
      })
    }

    return NextResponse.json({ success: true, orders: globalThis.__HOLVA_SERVER_ORDERS })
  } catch (error: any) {
    return NextResponse.json({ success: true, orders: globalThis.__HOLVA_SERVER_ORDERS || [] })
  }
}
