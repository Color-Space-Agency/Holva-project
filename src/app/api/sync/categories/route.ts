import { NextRequest, NextResponse } from "next/server"
import { MockCategory } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_CATEGORIES: MockCategory[] | undefined
  var __HOLVA_DELETED_CATEGORIES: Set<string> | undefined
}

if (!globalThis.__HOLVA_SERVER_CATEGORIES) {
  globalThis.__HOLVA_SERVER_CATEGORIES = []
}
if (!globalThis.__HOLVA_DELETED_CATEGORIES) {
  globalThis.__HOLVA_DELETED_CATEGORIES = new Set<string>()
}

export async function GET() {
  try {
    const deletedSet = globalThis.__HOLVA_DELETED_CATEGORIES || new Set<string>()
    const categories = (globalThis.__HOLVA_SERVER_CATEGORIES || []).filter(
      (c) => !deletedSet.has(c.id) && !deletedSet.has(c.name.toLowerCase().trim())
    )
    return NextResponse.json({
      success: true,
      categories,
      deletedCategoryIds: Array.from(deletedSet),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      categories: [],
      deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES || []),
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, categories, categoryId, updates, deletedCategoryIds } = body

    if (!globalThis.__HOLVA_SERVER_CATEGORIES) {
      globalThis.__HOLVA_SERVER_CATEGORIES = []
    }
    if (!globalThis.__HOLVA_DELETED_CATEGORIES) {
      globalThis.__HOLVA_DELETED_CATEGORIES = new Set<string>()
    }

    if (Array.isArray(deletedCategoryIds)) {
      deletedCategoryIds.forEach((id: string) => globalThis.__HOLVA_DELETED_CATEGORIES!.add(id))
    }

    const isDeleted = (c: MockCategory) =>
      globalThis.__HOLVA_DELETED_CATEGORIES!.has(c.id) ||
      globalThis.__HOLVA_DELETED_CATEGORIES!.has(c.name.toLowerCase().trim())

    if (action === "sync" && Array.isArray(categories)) {
      const map = new Map<string, MockCategory>()
      for (const c of globalThis.__HOLVA_SERVER_CATEGORIES) {
        if (c && c.name && !isDeleted(c)) map.set(c.id, c)
      }
      for (const c of categories) {
        if (c && c.name && !isDeleted(c)) map.set(c.id, c)
      }
      globalThis.__HOLVA_SERVER_CATEGORIES = Array.from(map.values()).filter((c) => !isDeleted(c))
      return NextResponse.json({
        success: true,
        categories: globalThis.__HOLVA_SERVER_CATEGORIES,
        deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES),
      })
    }

    if (action === "create" && category) {
      if (!isDeleted(category)) {
        const exists = globalThis.__HOLVA_SERVER_CATEGORIES.some((c) => c.id === category.id)
        if (!exists) {
          globalThis.__HOLVA_SERVER_CATEGORIES = [category, ...globalThis.__HOLVA_SERVER_CATEGORIES]
        }
      }
      return NextResponse.json({
        success: true,
        categories: globalThis.__HOLVA_SERVER_CATEGORIES,
        deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES),
      })
    }

    if (action === "update" && categoryId && updates) {
      globalThis.__HOLVA_SERVER_CATEGORIES = globalThis.__HOLVA_SERVER_CATEGORIES.map((c) =>
        c.id === categoryId ? { ...c, ...updates } : c
      )
      return NextResponse.json({
        success: true,
        categories: globalThis.__HOLVA_SERVER_CATEGORIES,
        deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES),
      })
    }

    if (action === "delete" && categoryId) {
      globalThis.__HOLVA_DELETED_CATEGORIES.add(categoryId)
      const found = globalThis.__HOLVA_SERVER_CATEGORIES.find((c) => c.id === categoryId)
      if (found) {
        globalThis.__HOLVA_DELETED_CATEGORIES.add(found.id)
        globalThis.__HOLVA_DELETED_CATEGORIES.add(found.name.toLowerCase().trim())
      }
      globalThis.__HOLVA_SERVER_CATEGORIES = globalThis.__HOLVA_SERVER_CATEGORIES.filter(
        (c) => c.id !== categoryId && !isDeleted(c)
      )
      return NextResponse.json({
        success: true,
        categories: globalThis.__HOLVA_SERVER_CATEGORIES,
        deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES),
      })
    }

    const filtered = globalThis.__HOLVA_SERVER_CATEGORIES.filter((c) => !isDeleted(c))
    return NextResponse.json({
      success: true,
      categories: filtered,
      deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      categories: globalThis.__HOLVA_SERVER_CATEGORIES || [],
      deletedCategoryIds: Array.from(globalThis.__HOLVA_DELETED_CATEGORIES || []),
    })
  }
}
