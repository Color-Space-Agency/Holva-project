import { NextRequest, NextResponse } from "next/server"
import { INITIAL_STORES, MockStore } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_STORES: MockStore[] | undefined
  var __HOLVA_DELETED_STORES: Set<string> | undefined
}

if (!globalThis.__HOLVA_SERVER_STORES || globalThis.__HOLVA_SERVER_STORES.length === 0) {
  globalThis.__HOLVA_SERVER_STORES = [...INITIAL_STORES]
}
if (!globalThis.__HOLVA_DELETED_STORES) {
  globalThis.__HOLVA_DELETED_STORES = new Set<string>()
}

// GET /api/sync/stores — Get all stores
export async function GET() {
  try {
    const deletedSet = globalThis.__HOLVA_DELETED_STORES || new Set<string>()
    let stores = (globalThis.__HOLVA_SERVER_STORES || []).filter(
      (s) => !deletedSet.has(s.id) && !deletedSet.has(s.name.toLowerCase().trim())
    )
    if (stores.length === 0 && deletedSet.size === 0) {
      stores = [...INITIAL_STORES]
      globalThis.__HOLVA_SERVER_STORES = [...INITIAL_STORES]
    }
    return NextResponse.json({
      success: true,
      stores,
      deletedStoreIds: Array.from(deletedSet),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      stores: [],
      deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES || []),
    })
  }
}

// POST /api/sync/stores — Add, update or sync stores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, store, stores, storeId, updates, deletedStoreIds } = body

    if (!globalThis.__HOLVA_SERVER_STORES) {
      globalThis.__HOLVA_SERVER_STORES = []
    }
    if (!globalThis.__HOLVA_DELETED_STORES) {
      globalThis.__HOLVA_DELETED_STORES = new Set<string>()
    }

    if (Array.isArray(deletedStoreIds)) {
      deletedStoreIds.forEach((id: string) => globalThis.__HOLVA_DELETED_STORES!.add(id))
    }

    const isDeleted = (s: MockStore) =>
      globalThis.__HOLVA_DELETED_STORES!.has(s.id) ||
      globalThis.__HOLVA_DELETED_STORES!.has(s.name.toLowerCase().trim())

    if (action === "sync" && Array.isArray(stores)) {
      const storeMap = new Map<string, MockStore>()
      for (const s of globalThis.__HOLVA_SERVER_STORES) {
        if (s && s.name && !isDeleted(s)) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      for (const s of stores) {
        if (s && s.name && !isDeleted(s)) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      globalThis.__HOLVA_SERVER_STORES = Array.from(storeMap.values()).filter((s) => !isDeleted(s))
      return NextResponse.json({
        success: true,
        stores: globalThis.__HOLVA_SERVER_STORES,
        deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES),
      })
    }

    if (action === "create" && store) {
      if (!isDeleted(store)) {
        const exists = globalThis.__HOLVA_SERVER_STORES.some(
          (s) => s.name.toLowerCase().trim() === store.name.toLowerCase().trim()
        )
        if (!exists) {
          globalThis.__HOLVA_SERVER_STORES = [store, ...globalThis.__HOLVA_SERVER_STORES]
        }
      }
      return NextResponse.json({
        success: true,
        stores: globalThis.__HOLVA_SERVER_STORES,
        createdStore: store,
        deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES),
      })
    }

    if (action === "update" && storeId && updates) {
      globalThis.__HOLVA_SERVER_STORES = globalThis.__HOLVA_SERVER_STORES.map((s) =>
        s.id === storeId || s.name === storeId ? { ...s, ...updates } : s
      )
      return NextResponse.json({
        success: true,
        stores: globalThis.__HOLVA_SERVER_STORES,
        deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES),
      })
    }

    if (action === "delete" && storeId) {
      globalThis.__HOLVA_DELETED_STORES.add(storeId)
      const found = globalThis.__HOLVA_SERVER_STORES.find((s) => s.id === storeId || s.name === storeId)
      if (found) {
        globalThis.__HOLVA_DELETED_STORES.add(found.id)
        globalThis.__HOLVA_DELETED_STORES.add(found.name.toLowerCase().trim())
      }

      globalThis.__HOLVA_SERVER_STORES = globalThis.__HOLVA_SERVER_STORES.filter(
        (s) => s.id !== storeId && s.name !== storeId && !isDeleted(s)
      )
      return NextResponse.json({
        success: true,
        stores: globalThis.__HOLVA_SERVER_STORES,
        deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES),
      })
    }

    const filtered = globalThis.__HOLVA_SERVER_STORES.filter((s) => !isDeleted(s))
    return NextResponse.json({
      success: true,
      stores: filtered,
      deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      stores: globalThis.__HOLVA_SERVER_STORES || [],
      deletedStoreIds: Array.from(globalThis.__HOLVA_DELETED_STORES || []),
    })
  }
}
