import { NextRequest, NextResponse } from "next/server"
import { MockOrder } from "@/lib/mock-data"

const ORDERS_CLOUD_URL = "https://api.restful-api.dev/objects/ff808181a067127101a06ced2af711c2"

declare global {
  var __HOLVA_SERVER_ORDERS: MockOrder[] | undefined
}

if (!globalThis.__HOLVA_SERVER_ORDERS) {
  globalThis.__HOLVA_SERVER_ORDERS = []
}

async function fetchCloudOrders(): Promise<MockOrder[]> {
  try {
    const res = await fetch(ORDERS_CLOUD_URL, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data.orders)) {
        globalThis.__HOLVA_SERVER_ORDERS = json.data.orders
        return json.data.orders
      }
    }
  } catch (e) {
    console.error("fetchCloudOrders error:", e)
  }
  return globalThis.__HOLVA_SERVER_ORDERS || []
}

async function updateCloudOrders(orders: MockOrder[]): Promise<boolean> {
  globalThis.__HOLVA_SERVER_ORDERS = orders
  try {
    const res = await fetch(ORDERS_CLOUD_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "holva_crm_orders_v1",
        data: { orders },
      }),
    })
    return res.ok
  } catch (e) {
    console.error("updateCloudOrders error:", e)
    return false
  }
}

// GET /api/sync/orders — Get all orders from cloud DB
export async function GET() {
  try {
    const orders = await fetchCloudOrders()
    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/sync/orders — Add, update or sync orders in cloud DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, order, orderId, amount, orders } = body

    let currentOrders = await fetchCloudOrders()

    if (action === "sync" && Array.isArray(orders)) {
      const orderMap = new Map<string, MockOrder>()
      for (const o of currentOrders) {
        if (o && o.id) orderMap.set(o.id, o)
      }
      for (const o of orders) {
        if (o && o.id) orderMap.set(o.id, o)
      }
      const merged = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      await updateCloudOrders(merged)
      return NextResponse.json({ success: true, orders: merged })
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

      const updated = [newOrder, ...currentOrders.filter((o) => o.id !== newOrder.id)]
      await updateCloudOrders(updated)

      return NextResponse.json({
        success: true,
        orders: updated,
        createdOrder: newOrder,
      })
    }

    if (action === "pay" && orderId && amount) {
      let updatedOrder: MockOrder | null = null
      const updated = currentOrders.map((ord) => {
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

      await updateCloudOrders(updated)

      return NextResponse.json({
        success: true,
        orders: updated,
        updatedOrder,
      })
    }

    if (action === "delete" && orderId) {
      const updated = currentOrders.filter((o) => o.id !== orderId && o.order_number !== orderId)
      await updateCloudOrders(updated)

      return NextResponse.json({
        success: true,
        orders: updated,
      })
    }

    return NextResponse.json({ success: true, orders: currentOrders })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
