import { NextRequest, NextResponse } from "next/server"
import { MockRecipe } from "@/lib/mock-data"

declare global {
  var __HOLVA_SERVER_RECIPES: MockRecipe[] | undefined
  var __HOLVA_DELETED_RECIPES: Set<string> | undefined
}

if (!globalThis.__HOLVA_SERVER_RECIPES) {
  globalThis.__HOLVA_SERVER_RECIPES = []
}
if (!globalThis.__HOLVA_DELETED_RECIPES) {
  globalThis.__HOLVA_DELETED_RECIPES = new Set<string>()
}

export async function GET() {
  try {
    const deletedSet = globalThis.__HOLVA_DELETED_RECIPES || new Set<string>()
    const recipes = (globalThis.__HOLVA_SERVER_RECIPES || []).filter(
      (r) => !deletedSet.has(r.id)
    )
    return NextResponse.json({
      success: true,
      recipes,
      deletedRecipeIds: Array.from(deletedSet),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      recipes: [],
      deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES || []),
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, recipe, recipes, recipeId, updates, deletedRecipeIds } = body

    if (!globalThis.__HOLVA_SERVER_RECIPES) {
      globalThis.__HOLVA_SERVER_RECIPES = []
    }
    if (!globalThis.__HOLVA_DELETED_RECIPES) {
      globalThis.__HOLVA_DELETED_RECIPES = new Set<string>()
    }

    if (Array.isArray(deletedRecipeIds)) {
      deletedRecipeIds.forEach((id: string) => globalThis.__HOLVA_DELETED_RECIPES!.add(id))
    }

    const isDeleted = (r: MockRecipe) => globalThis.__HOLVA_DELETED_RECIPES!.has(r.id)

    if (action === "sync" && Array.isArray(recipes)) {
      const map = new Map<string, MockRecipe>()
      for (const r of globalThis.__HOLVA_SERVER_RECIPES) {
        if (r && !isDeleted(r)) map.set(r.id, r)
      }
      for (const r of recipes) {
        if (r && !isDeleted(r)) map.set(r.id, r)
      }
      globalThis.__HOLVA_SERVER_RECIPES = Array.from(map.values()).filter((r) => !isDeleted(r))
      return NextResponse.json({
        success: true,
        recipes: globalThis.__HOLVA_SERVER_RECIPES,
        deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES),
      })
    }

    if (action === "create" && recipe) {
      if (!isDeleted(recipe)) {
        const exists = globalThis.__HOLVA_SERVER_RECIPES.some((r) => r.id === recipe.id)
        if (!exists) {
          globalThis.__HOLVA_SERVER_RECIPES = [recipe, ...globalThis.__HOLVA_SERVER_RECIPES]
        }
      }
      return NextResponse.json({
        success: true,
        recipes: globalThis.__HOLVA_SERVER_RECIPES,
        deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES),
      })
    }

    if (action === "update" && recipeId && updates) {
      globalThis.__HOLVA_SERVER_RECIPES = globalThis.__HOLVA_SERVER_RECIPES.map((r) =>
        r.id === recipeId ? { ...r, ...updates } : r
      )
      return NextResponse.json({
        success: true,
        recipes: globalThis.__HOLVA_SERVER_RECIPES,
        deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES),
      })
    }

    if (action === "delete" && recipeId) {
      globalThis.__HOLVA_DELETED_RECIPES.add(recipeId)
      globalThis.__HOLVA_SERVER_RECIPES = globalThis.__HOLVA_SERVER_RECIPES.filter(
        (r) => r.id !== recipeId && !isDeleted(r)
      )
      return NextResponse.json({
        success: true,
        recipes: globalThis.__HOLVA_SERVER_RECIPES,
        deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES),
      })
    }

    const filtered = globalThis.__HOLVA_SERVER_RECIPES.filter((r) => !isDeleted(r))
    return NextResponse.json({
      success: true,
      recipes: filtered,
      deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      recipes: globalThis.__HOLVA_SERVER_RECIPES || [],
      deletedRecipeIds: Array.from(globalThis.__HOLVA_DELETED_RECIPES || []),
    })
  }
}
