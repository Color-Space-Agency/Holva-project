"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Search, Edit2, Trash2, Archive, Copy, Package, Filter, MoreVertical, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { ProductFormDialog } from "./product-form-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { createAuditLog } from "@/lib/audit"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  product_categories: { name: string } | null
  product_units: { name: string; symbol: string } | null
}

import {
  INITIAL_PRODUCTS,
  isRealSupabaseConfigured,
  getStoredProducts,
  saveStoredProduct,
  createStoredProduct,
  deleteStoredProduct,
  syncProductsFromServer,
} from "@/lib/mock-data"

async function fetchProducts(): Promise<Product[]> {
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_categories(name), product_units(name, symbol)`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })

      if (data && data.length > 0) return data as Product[]
    } catch {
      // Fallback
    }
  }

  // Persistent localStorage demo products
  const stored = getStoredProducts()
  return stored.map((p) => ({
    id: p.id,
    factory_id: "demo",
    name: p.name,
    sku: p.sku,
    category_id: null,
    unit_id: "u-1",
    barcode: null,
    description: p.description || null,
    cost_price: p.cost_price,
    sales_price: p.price,
    wholesale_price: Math.round(p.price * 0.9),
    minimum_price: Math.round(p.price * 0.85),
    minimum_order_qty: 1,
    weight_gross: null,
    weight_net: null,
    packaging_type: "Korobka",
    package_weight: 0.5,
    shelf_life_days: 180,
    storage_conditions: "Salqin va quruq joyda",
    notes: null,
    image_url: p.image_url || null,
    status: p.status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    deleted_at: null,
    product_categories: { name: p.category },
    product_units: { name: p.unit, symbol: p.unit },
  })) as unknown as Product[]
}

const statusColors = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  INACTIVE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ARCHIVED: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
}

const statusLabels = {
  ACTIVE: "Faol",
  INACTIVE: "Nofaol",
  ARCHIVED: "Arxivlangan",
}

export function ProductsClient() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 30 * 1000,
  })

  // Real-time server synchronization for products and images
  useEffect(() => {
    syncProductsFromServer().then(() => refetch())

    const handleProductsUpdated = () => {
      refetch()
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "holva_crm_stored_products") {
        refetch()
      }
    }

    window.addEventListener("products-updated", handleProductsUpdated)
    window.addEventListener("storage", handleStorage)

    const interval = setInterval(() => {
      syncProductsFromServer().then(() => refetch())
    }, 3000)

    return () => {
      window.removeEventListener("products-updated", handleProductsUpdated)
      window.removeEventListener("storage", handleStorage)
      clearInterval(interval)
    }
  }, [refetch])

  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => {
      deleteStoredProduct(product.id)
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          await supabase
            .from("products")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", product.id)
          await createAuditLog({ action: "DELETE", tableName: "products", recordId: product.id, oldValues: product })
        } catch {}
      }
    },
    onSuccess: () => {
      toast.success("Mahsulot o'chirildi")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setDeleteProduct(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const duplicateMutation = useMutation({
    mutationFn: async (product: Product) => {
      createStoredProduct({
        name: `${product.name} (nusxa)`,
        sku: `${product.sku}-copy-${Date.now().toString().slice(-4)}`,
        category: (product as any).product_categories?.name || "Klassik Holvalar",
        price: product.sales_price,
        cost_price: (product as any).cost_price || Math.round(product.sales_price * 0.6),
        unit: (product as any).product_units?.name || "dona",
        stock: 50,
        min_stock: 10,
        status: "ACTIVE",
        image_url: product.image_url || "",
        description: product.description || undefined,
      })

      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { id, created_at, updated_at, product_categories, product_units, ...rest } = product
          await supabase.from("products").insert({
            ...rest,
            name: `${product.name} (nusxa)`,
            sku: `${product.sku}-copy-${Date.now()}`,
            status: "INACTIVE" as const,
          })
        } catch {}
      }
    },
    onSuccess: () => {
      toast.success("Mahsulot nusxalandi")
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 text-center">
        <Package className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 dark:text-red-400 font-medium">Xatolik yuz berdi</p>
        <p className="text-sm text-red-400 mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Mahsulot nomi yoki SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="ALL">Barcha status</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Nofaol</option>
            <option value="ARCHIVED">Arxivlangan</option>
          </select>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi mahsulot</span>
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {search ? "Mahsulot topilmadi" : "Mahsulotlar yo'q"}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {search ? "Boshqa kalit so'z bilan qidiring" : "Birinchi mahsulotingizni qo'shing"}
          </p>
          {!search && (
            <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Plus size={16} />
              Mahsulot qo'shish
            </Button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md dark:hover:shadow-gray-950/50 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                {/* Image / Icon */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <Package size={24} className="text-violet-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                        <button
                          onClick={() => setEditProduct(product)}
                          className="p-1 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-md text-gray-400 hover:text-amber-600 transition cursor-pointer"
                          title="Mahsulotni tahrirlash"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[product.status]}`}>
                      {statusLabels[product.status]}
                    </span>
                  </div>

                  {product.product_categories && (
                    <p className="text-xs text-gray-400 mt-1">{product.product_categories.name}</p>
                  )}
                </div>
              </div>

              {/* Prices */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl py-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Sotuv narxi</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                    {formatCurrency(product.sales_price)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl py-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Tan narxi</p>
                  <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 truncate">
                    {formatCurrency((product as any).cost_price || Math.round(product.sales_price * 0.6))}
                  </p>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl py-2">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mb-0.5">Sof foyda</p>
                  <p className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 truncate">
                    +{formatCurrency(product.sales_price - ((product as any).cost_price || Math.round(product.sales_price * 0.6)))}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                  onClick={() => setEditProduct(product)}
                >
                  <Pencil size={13} className="text-amber-600" />
                  Tahrirlash
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => duplicateMutation.mutate(product)}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy size={13} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:border-red-200 dark:text-red-400"
                  onClick={() => setDeleteProduct(product)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ProductFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        product={null}
      />
      {editProduct && (
        <ProductFormDialog
          open={!!editProduct}
          onOpenChange={(open) => !open && setEditProduct(null)}
          product={editProduct}
        />
      )}
      {deleteProduct && (
        <DeleteConfirmDialog
          open={!!deleteProduct}
          onOpenChange={(open) => !open && setDeleteProduct(null)}
          title="Mahsulotni o'chirish"
          description={`"${deleteProduct.name}" mahsulotini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
          onConfirm={() => deleteMutation.mutate(deleteProduct)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}
