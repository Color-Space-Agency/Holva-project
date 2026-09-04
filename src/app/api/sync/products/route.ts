import { NextRequest, NextResponse } from "next/server";
import { MockProduct, INITIAL_PRODUCTS } from "@/lib/mock-data";

// Global server in-memory store across requests and devices
declare global {
  var __HOLVA_SERVER_PRODUCTS: MockProduct[] | undefined;
}

if (!globalThis.__HOLVA_SERVER_PRODUCTS || globalThis.__HOLVA_SERVER_PRODUCTS.length === 0) {
  globalThis.__HOLVA_SERVER_PRODUCTS = [...INITIAL_PRODUCTS];
}

// GET /api/sync/products — Get all synchronized products
export async function GET(request: NextRequest) {
  try {
    if (!globalThis.__HOLVA_SERVER_PRODUCTS || globalThis.__HOLVA_SERVER_PRODUCTS.length === 0) {
      globalThis.__HOLVA_SERVER_PRODUCTS = [...INITIAL_PRODUCTS];
    }

    return NextResponse.json({
      success: true,
      products: globalThis.__HOLVA_SERVER_PRODUCTS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/sync/products — Create, update, delete or sync products list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, product, productId, productsList } = body;

    if (!globalThis.__HOLVA_SERVER_PRODUCTS) {
      globalThis.__HOLVA_SERVER_PRODUCTS = [...INITIAL_PRODUCTS];
    }

    if (action === "sync_all" && Array.isArray(productsList)) {
      // Merge products by id
      const map = new Map<string, MockProduct>();
      globalThis.__HOLVA_SERVER_PRODUCTS.forEach((p) => map.set(p.id, p));
      productsList.forEach((p: MockProduct) => map.set(p.id, { ...map.get(p.id), ...p }));
      globalThis.__HOLVA_SERVER_PRODUCTS = Array.from(map.values());

      return NextResponse.json({ success: true, products: globalThis.__HOLVA_SERVER_PRODUCTS });
    }

    if (action === "update" && product && product.id) {
      const exists = globalThis.__HOLVA_SERVER_PRODUCTS.some((p) => p.id === product.id);
      if (exists) {
        globalThis.__HOLVA_SERVER_PRODUCTS = globalThis.__HOLVA_SERVER_PRODUCTS.map((p) =>
          p.id === product.id ? { ...p, ...product } : p
        );
      } else {
        globalThis.__HOLVA_SERVER_PRODUCTS = [product, ...globalThis.__HOLVA_SERVER_PRODUCTS];
      }
      return NextResponse.json({ success: true, products: globalThis.__HOLVA_SERVER_PRODUCTS });
    }

    if (action === "create" && product) {
      const newProd: MockProduct = {
        ...product,
        id: product.id || `p-${Date.now()}`,
      };

      // Ensure no duplicates
      globalThis.__HOLVA_SERVER_PRODUCTS = [
        newProd,
        ...globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => p.id !== newProd.id),
      ];

      return NextResponse.json({ success: true, products: globalThis.__HOLVA_SERVER_PRODUCTS });
    }

    if (action === "delete" && productId) {
      globalThis.__HOLVA_SERVER_PRODUCTS = globalThis.__HOLVA_SERVER_PRODUCTS.filter((p) => p.id !== productId);
      return NextResponse.json({ success: true, products: globalThis.__HOLVA_SERVER_PRODUCTS });
    }

    return NextResponse.json({ success: false, error: "Noma'lum harakat" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
