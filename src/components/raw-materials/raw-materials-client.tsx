"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Search, Edit2, Trash2, AlertTriangle, Boxes } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { RawMaterialFormDialog } from "./raw-material-form-dialog"
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog"
import { createAuditLog } from "@/lib/audit"
import type { Database } from "@/types/database"

type RawMaterial = Database["public"]["Tables"]["raw_materials"]["Row"] & {
  raw_material_categories: { name: string } | null
  product_units: { name: string; symbol: string } | null
  raw_material_suppliers: { name: string } | null
}

import { INITIAL_RAW_MATERIALS, isRealSupabaseConfigured } from "@/lib/mock-data"

async function fetchRawMaterials(): Promise<RawMaterial[]> {
  if (isRealSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("raw_materials")
        .select(`*, raw_material_categories(name), product_units(name, symbol), raw_material_suppliers(name)`)
        .is("deleted_at", null)
        .order("name")
      if (data && data.length > 0) return data as RawMaterial[]
    } catch {
      // Fallback
    }
  }

  // Instant demo raw materials
  return INITIAL_RAW_MATERIALS.map((rm) => ({
    id: rm.id,
    factory_id: "demo",
    name: rm.name,
    sku: rm.sku,
    category_id: null,
    unit_id: "u-kg",
    supplier_id: null,
    purchase_price: rm.purchase_price,
    minimum_stock: rm.minimum_stock,
    current_stock: rm.current_stock,
    image_url: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    deleted_at: null,
    raw_material_categories: { name: rm.category },
    product_units: { name: rm.unit, symbol: rm.unit },
    raw_material_suppliers: { name: rm.supplier },
  })) as unknown as RawMaterial[]
}

export function RawMaterialsClient() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<RawMaterial | null>(null)
  const [deleteItem, setDeleteItem] = useState<RawMaterial | null>(null)

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["raw-materials"],
    queryFn: fetchRawMaterials,
  })

  const deleteMutation = useMutation({
    mutationFn: async (item: RawMaterial) => {
      const supabase = createClient()
      const { error } = await supabase
        .from("raw_materials")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", item.id)
      if (error) throw error
      await createAuditLog({ action: "DELETE", tableName: "raw_materials", recordId: item.id })
    },
    onSuccess: () => {
      toast.success("Xomashyo o'chirildi")
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] })
      setDeleteItem(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const filtered = items.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase())
  )

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 dark:text-red-400">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Nomi yoki SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Qo'shish</span>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse h-16" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Boxes className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Xomashyo topilmadi</h3>
          <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 mt-4">
            <Plus size={16} /> Qo'shish
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Nomi</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">SKU</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Kategoriya</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Zaxira</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Min zaxira</th>
                <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Narx</th>
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((m) => {
                const isLowStock = m.current_stock <= m.minimum_stock
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</div>
                      {m.raw_material_suppliers && (
                        <div className="text-xs text-gray-400">{m.raw_material_suppliers.name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{m.sku}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {m.raw_material_categories?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-sm font-semibold ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                        {formatNumber(m.current_stock)} {m.product_units?.symbol}
                      </span>
                      {isLowStock && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                      {formatNumber(m.minimum_stock)} {m.product_units?.symbol}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(m.purchase_price)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.status === "active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {m.status === "active" ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditItem(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(m)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((m) => {
            const isLowStock = m.current_stock <= m.minimum_stock
            return (
              <div key={m.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.sku}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditItem(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteItem(m)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Zaxira:</span>
                  <span className={`font-semibold ${isLowStock ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                    {formatNumber(m.current_stock)} {m.product_units?.symbol}
                    {isLowStock && <AlertTriangle size={12} className="inline ml-1" />}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">Narx:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(m.purchase_price)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RawMaterialFormDialog open={createOpen} onOpenChange={setCreateOpen} item={null} />
      {editItem && (
        <RawMaterialFormDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem}
        />
      )}
      {deleteItem && (
        <DeleteConfirmDialog
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          title="Xomashyoni o'chirish"
          description={`"${deleteItem.name}" xomashyosini o'chirishni tasdiqlaysizmi?`}
          onConfirm={() => deleteMutation.mutate(deleteItem)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}
