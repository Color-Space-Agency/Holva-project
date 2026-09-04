import { NextRequest, NextResponse } from "next/server";
import { MockProduct } from "@/lib/mock-data";

// Global server in-memory store across requests and devices
declare global {
  var __HOLVA_SERVER_PRODUCTS: MockProduct[] | undefined;
  var __HOLVA_DELETED_PRODUCTS: Set<string> | undefined;
}

if (!globalThis.__HOLVA_SERVER_PRODUCTS) {
  globalThis.__HOLVA_SERVER_PRODUCTS = [];
}
if (!globalThis.__HOLVA_DELETED_PRODUCTS) {
  globalThis.__HOLVA_DELETED_PRODUCTS = new Set<string>();
}

// GET /api/sync/products — Get all synchronized products
export async function GET(request: NextRequest) {
  try {
    const deletedSet = globalThis.__HOLVA_DELETED_PRODUCTS || new Set<string>();
    const products = (globalThis.__HOLVA_SERVER_PRODUCTS || []).filter(
      (p) => !deletedSet.has(p.id) && !deletedSet.has(p.name.toLowerCase().trim())
    );

    return NextResponse.json({
      success: true,
      products,
      deletedProductIds: Array.from(deletedSet),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/products — Create, update, delete or sync products list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, product, productId, productsList, deletedProductIds } = body;

    if (!globalThis.__HOLVA_SERVER_PRODUCTS) {
      globalThis.__HOLVA_SERVER_PRODUCTS = [];
    }
    if (!globalThis.__HOLVA_DELETED_PRODUCTS) {
      globalThis.__HOLVA_DELETED_PRODUCTS = new Set<string>();
    }

    if (Array.isArray(deletedProductIds)) {
      deletedProductIds.forEach((id: string) => globalThis.__HOLVA_DELETED_PRODUCTS!.add(id));
    }

    const isDeleted = (p: MockProduct) =>
      globalThis.__HOLVA_DELETED_PRODUCTS!.has(p.id) ||
      globalThis.__HOLVA_DELETED_PRODUCTS!.has(p.name.toLowerCase().trim());

    if (action === "sync_all" && Array.isArray(productsList)) {
      const map = new Map<string, MockProduct>();
      globalThis.__HOLVA_SERVER_PRODUCTS.forEach((p) => {
        if (!isDeleted(p)) map.set(p.id, p);
      });
      productsList.forEach((p: MockProduct) => {
        if (!isDeleted(p)) map.set(p.id, { ...map.get(p.id), ...p });
      });
      globalThis.__HOLVA_SERVER_PRODUCTS = Array.from(map.values()).filter((p) => !isDeleted(p));

      return NextResponse.json({
        success: true,
        products: globalThis.__HOLVA_SERVER_PRODUCTS,
        deletedProductIds: Array.from(globalThis.__HOLVA_DELETED_PRODUCTS),
      });
    }

    if (action === "update" && product && product.id) {
      if (!isDeleted(product)) {
        const exists = globalThis.__HOLVA_SERVER_PRODUCTS.some((p) => p.id === product.id);
        if (exists) {
          globalThis.__HOLVA_SERVER_PRODUCTS = globalThis.__HOLVA_SERVER_PRODUCTS.map((p) =>
            p.id === product.id ? { ...p, ...product } : p
          );
        } else {
          globalThis.__HOLVA_SERVER_PRODUCTS = [product, ...globalThis.__HOLVA_SERVER_PRODUCTS];
        }
      }
      return NextResponse.json({
        success: true,
        products: globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => !isDeleted(p)),
        deletedProductIds: Array.from(globalThis.__HOLVA_DELETED_PRODUCTS),
      });
    }

    if (action === "create" && product) {
      if (!isDeleted(product)) {
        const newProd: MockProduct = {
          ...product,
          id: product.id || `p-${Date.now()}`,
        };

        globalThis.__HOLVA_SERVER_PRODUCTS = [
          newProd,
          ...globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => p.id !== newProd.id && !isDeleted(p)),
        ];
      }
      return NextResponse.json({
        success: true,
        products: globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => !isDeleted(p)),
        deletedProductIds: Array.from(globalThis.__HOLVA_DELETED_PRODUCTS),
      });
    }

    if (action === "delete" && productId) {
      globalThis.__HOLVA_DELETED_PRODUCTS.add(productId);
      const target = globalThis.__HOLVA_SERVER_PRODUCTS.find((p) => p.id === productId || p.name === productId);
      if (target) {
        globalThis.__HOLVA_DELETED_PRODUCTS.add(target.id);
        globalThis.__HOLVA_DELETED_PRODUCTS.add(target.name.toLowerCase().trim());
      }
      globalThis.__HOLVA_SERVER_PRODUCTS = globalThis.__HOLVA_SERVER_PRODUCTS.filter(
        (p) => p.id !== productId && p.name !== productId && !isDeleted(p)
      );

      return NextResponse.json({
        success: true,
        products: globalThis.__HOLVA_SERVER_PRODUCTS,
        deletedProductIds: Array.from(globalThis.__HOLVA_DELETED_PRODUCTS),
      });
    }

    const filtered = globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => !isDeleted(p));
    return NextResponse.json({
      success: true,
      products: filtered,
      deletedProductIds: Array.from(globalThis.__HOLVA_DELETED_PRODUCTS),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
