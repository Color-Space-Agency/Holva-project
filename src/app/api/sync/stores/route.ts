import { NextRequest, NextResponse } from "next/server"
import { MockStore } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_STORES: MockStore[] | undefined
}

if (!globalThis.__HOLVA_SERVER_STORES) {
  globalThis.__HOLVA_SERVER_STORES = []
}

// GET /api/sync/stores — Get all stores
export async function GET() {
  try {
    const stores = globalThis.__HOLVA_SERVER_STORES || []
    return NextResponse.json({
      success: true,
      stores,
    })
  } catch (error: any) {
    return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES || [] })
  }
}

// POST /api/sync/stores — Add, update or sync stores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, store, stores, storeId, updates } = body

    if (!globalThis.__HOLVA_SERVER_STORES) {
      globalThis.__HOLVA_SERVER_STORES = []
    }

    if (action === "sync" && Array.isArray(stores)) {
      const storeMap = new Map<string, MockStore>()
      for (const s of globalThis.__HOLVA_SERVER_STORES) {
        if (s && s.name) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      for (const s of stores) {
        if (s && s.name) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      globalThis.__HOLVA_SERVER_STORES = Array.from(storeMap.values())
      return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES })
    }

    if (action === "create" && store) {
      const exists = globalThis.__HOLVA_SERVER_STORES.some((s) => s.name.toLowerCase().trim() === store.name.toLowerCase().trim())
      if (!exists) {
        globalThis.__HOLVA_SERVER_STORES = [store, ...globalThis.__HOLVA_SERVER_STORES]
      }
      return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES, createdStore: store })
    }

    if (action === "update" && storeId && updates) {
      globalThis.__HOLVA_SERVER_STORES = globalThis.__HOLVA_SERVER_STORES.map((s) => (s.id === storeId || s.name === storeId ? { ...s, ...updates } : s))
      return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES })
    }

    if (action === "delete" && storeId) {
      globalThis.__HOLVA_SERVER_STORES = globalThis.__HOLVA_SERVER_STORES.filter((s) => s.id !== storeId && s.name !== storeId)
      return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES })
    }

    return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES })
  } catch (error: any) {
    return NextResponse.json({ success: true, stores: globalThis.__HOLVA_SERVER_STORES || [] })
  }
}
