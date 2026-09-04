import { NextRequest, NextResponse } from "next/server"
import { MockStore } from "@/lib/mock-data"

const STORES_CLOUD_URL = "https://api.restful-api.dev/objects/ff808181a067127101a06ced297f11c1"

declare global {
  var __HOLVA_SERVER_STORES: MockStore[] | undefined
}

if (!globalThis.__HOLVA_SERVER_STORES) {
  globalThis.__HOLVA_SERVER_STORES = []
}

async function fetchCloudStores(): Promise<MockStore[]> {
  try {
    const res = await fetch(STORES_CLOUD_URL, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      if (json.data && Array.isArray(json.data.stores)) {
        globalThis.__HOLVA_SERVER_STORES = json.data.stores
        return json.data.stores
      }
    }
  } catch (e) {
    console.error("fetchCloudStores error:", e)
  }
  return globalThis.__HOLVA_SERVER_STORES || []
}

async function updateCloudStores(stores: MockStore[]): Promise<boolean> {
  globalThis.__HOLVA_SERVER_STORES = stores
  try {
    const res = await fetch(STORES_CLOUD_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "holva_crm_stores_v1",
        data: { stores },
      }),
    })
    return res.ok
  } catch (e) {
    console.error("updateCloudStores error:", e)
    return false
  }
}

// GET /api/sync/stores — Get all stores from cloud DB
export async function GET() {
  try {
    const stores = await fetchCloudStores()
    return NextResponse.json({
      success: true,
      stores,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/sync/stores — Add, update or sync stores in cloud DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, store, stores, storeId, updates } = body

    let currentStores = await fetchCloudStores()

    if (action === "sync" && Array.isArray(stores)) {
      // Merge client stores with cloud stores
      const storeMap = new Map<string, MockStore>()
      for (const s of currentStores) {
        if (s && s.name) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      for (const s of stores) {
        if (s && s.name) storeMap.set(s.name.toLowerCase().trim(), s)
      }
      const merged = Array.from(storeMap.values())
      await updateCloudStores(merged)
      return NextResponse.json({ success: true, stores: merged })
    }

    if (action === "create" && store) {
      const exists = currentStores.some((s) => s.name.toLowerCase().trim() === store.name.toLowerCase().trim())
      if (!exists) {
        const updated = [store, ...currentStores]
        await updateCloudStores(updated)
        return NextResponse.json({ success: true, stores: updated, createdStore: store })
      }
      return NextResponse.json({ success: true, stores: currentStores })
    }

    if (action === "update" && storeId && updates) {
      const updated = currentStores.map((s) => (s.id === storeId || s.name === storeId ? { ...s, ...updates } : s))
      await updateCloudStores(updated)
      return NextResponse.json({ success: true, stores: updated })
    }

    if (action === "delete" && storeId) {
      const updated = currentStores.filter((s) => s.id !== storeId && s.name !== storeId)
      await updateCloudStores(updated)
      return NextResponse.json({ success: true, stores: updated })
    }

    return NextResponse.json({ success: true, stores: currentStores })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
