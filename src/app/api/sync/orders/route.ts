import { NextRequest, NextResponse } from "next/server"
import { INITIAL_ORDERS, MockOrder } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_ORDERS: (MockOrder & { order_items?: any[] })[] | undefined
  var __HOLVA_DELETED_ORDERS: Set<string> | undefined
}

if (!globalThis.__HOLVA_SERVER_ORDERS || globalThis.__HOLVA_SERVER_ORDERS.length === 0) {
  globalThis.__HOLVA_SERVER_ORDERS = [...INITIAL_ORDERS]
}
const DUMMY_ORDERS_PURGED = ["ord-101", "ord-102", "ord-103", "ord-104", "hlv-8401", "hlv-8402", "hlv-8403", "hlv-8404"]
if (!globalThis.__HOLVA_DELETED_ORDERS) {
  globalThis.__HOLVA_DELETED_ORDERS = new Set<string>(DUMMY_ORDERS_PURGED)
} else {
  DUMMY_ORDERS_PURGED.forEach((id) => globalThis.__HOLVA_DELETED_ORDERS!.add(id))
}

// GET /api/sync/orders — Get all orders
export async function GET() {
  try {
    const deletedSet = globalThis.__HOLVA_DELETED_ORDERS || new Set<string>()
    let orders = (globalThis.__HOLVA_SERVER_ORDERS || []).filter(
      (o) => !deletedSet.has(o.id) && !deletedSet.has(o.order_number)
    )
    if (orders.length === 0 && deletedSet.size === 0) {
      orders = [...INITIAL_ORDERS]
      globalThis.__HOLVA_SERVER_ORDERS = [...INITIAL_ORDERS]
    }
    return NextResponse.json({
      success: true,
      orders,
      deletedOrderIds: Array.from(deletedSet),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      orders: [],
      deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS || []),
    })
  }
}

// POST /api/sync/orders — Add, update or sync orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, order, orderId, amount, orders, deletedOrderIds } = body

    if (!globalThis.__HOLVA_SERVER_ORDERS) {
      globalThis.__HOLVA_SERVER_ORDERS = []
    }
    if (!globalThis.__HOLVA_DELETED_ORDERS) {
      globalThis.__HOLVA_DELETED_ORDERS = new Set<string>()
    }

    if (Array.isArray(deletedOrderIds)) {
      deletedStoreIdsOrOrderIds:
      deletedOrderIds.forEach((id: string) => globalThis.__HOLVA_DELETED_ORDERS!.add(id))
    }

    const isDeleted = (id: string) => globalThis.__HOLVA_DELETED_ORDERS!.has(id)

    if (action === "sync" && Array.isArray(orders)) {
      globalThis.__HOLVA_SERVER_ORDERS = orders
        .filter((o) => !isDeleted(o.id) && !isDeleted(o.order_number))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS),
      })
    }

    if (action === "create" && order) {
      if (!isDeleted(order.id) && !isDeleted(order.order_number)) {
        const newOrder: any = {
          ...order,
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
          order_items: order.order_items || order.items || [],
        }

        globalThis.__HOLVA_SERVER_ORDERS = [
          newOrder,
          ...globalThis.__HOLVA_SERVER_ORDERS.filter((o) => o.id !== newOrder.id && !isDeleted(o.id) && !isDeleted(o.order_number)),
        ]

        return NextResponse.json({
          success: true,
          orders: globalThis.__HOLVA_SERVER_ORDERS,
          createdOrder: newOrder,
          deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS),
        })
      }
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
        orders: globalThis.__HOLVA_SERVER_ORDERS.filter((o) => !isDeleted(o.id) && !isDeleted(o.order_number)),
        updatedOrder,
        deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS),
      })
    }

    if (action === "delete" && orderId) {
      globalThis.__HOLVA_DELETED_ORDERS.add(orderId)
      
      const found = globalThis.__HOLVA_SERVER_ORDERS.find((o) => o.id === orderId || o.order_number === orderId)
      if (found) {
        globalThis.__HOLVA_DELETED_ORDERS.add(found.id)
        globalThis.__HOLVA_DELETED_ORDERS.add(found.order_number)
      }

      globalThis.__HOLVA_SERVER_ORDERS = globalThis.__HOLVA_SERVER_ORDERS.filter(
        (o) => o.id !== orderId && o.order_number !== orderId && !isDeleted(o.id) && !isDeleted(o.order_number)
      )

      return NextResponse.json({
        success: true,
        orders: globalThis.__HOLVA_SERVER_ORDERS,
        deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS),
      })
    }

    const filtered = (globalThis.__HOLVA_SERVER_ORDERS || []).filter(
      (o) => !isDeleted(o.id) && !isDeleted(o.order_number)
    )
    return NextResponse.json({
      success: true,
      orders: filtered,
      deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      orders: globalThis.__HOLVA_SERVER_ORDERS || [],
      deletedOrderIds: Array.from(globalThis.__HOLVA_DELETED_ORDERS || []),
    })
  }
}
