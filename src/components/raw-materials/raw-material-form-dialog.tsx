"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAuditLog } from "@/lib/audit"
import type { Database } from "@/types/database"

type RawMaterial = Database["public"]["Tables"]["raw_materials"]["Row"]

const schema = z.object({
  name: z.string().min(1, "Nomi kerak"),
  sku: z.string().min(1, "SKU kerak"),
  category_id: z.string().optional(),
  unit_id: z.string().optional(),
  supplier_id: z.string().optional(),
  purchase_price: z.coerce.number().min(0),
  minimum_stock: z.coerce.number().min(0),
  maximum_stock: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: RawMaterial | null
}

export function RawMaterialFormDialog({ open, onOpenChange, item }: Props) {
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ["raw-material-categories"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data } = await supabase.from("raw_material_categories").select("id, name").order("name")
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return [
        { id: "cat-1", name: "Don va urug'lar" },
        { id: "cat-2", name: "Shirinlik va qiyomlar" },
        { id: "cat-3", name: "Yong'oqlar" },
      ]
    },
  })

  const { data: units = [] } = useQuery({
    queryKey: ["product-units"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data } = await supabase.from("product_units").select("id, name, symbol").order("name")
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return [
        { id: "u-1", name: "Kilogramm", symbol: "kg" },
        { id: "u-2", name: "Litr", symbol: "l" },
        { id: "u-3", name: "Qop", symbol: "qop" },
      ]
    },
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ["raw-material-suppliers"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data } = await supabase.from("raw_material_suppliers").select("id, name").eq("is_active", true).order("name")
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return [
        { id: "sup-1", name: "Agro Import MChJ" },
        { id: "sup-2", name: "Shakar Savdo Bazasi" },
        { id: "sup-3", name: "Samarqand Yong'oq MChJ" },
      ]
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { purchase_price: 0, minimum_stock: 0, maximum_stock: 0 },
  })

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        sku: item.sku,
        category_id: item.category_id ?? "",
        unit_id: item.unit_id ?? "",
        supplier_id: item.supplier_id ?? "",
        purchase_price: item.purchase_price,
        minimum_stock: item.minimum_stock,
        maximum_stock: item.maximum_stock,
      })
    } else {
      reset({ purchase_price: 0, minimum_stock: 0, maximum_stock: 0 })
    }
  }, [item, reset, open])

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from("profiles").select("factory_id").eq("id", user!.id).single()

      const payload = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id || null,
        unit_id: formData.unit_id || null,
        supplier_id: formData.supplier_id || null,
        purchase_price: formData.purchase_price,
        minimum_stock: formData.minimum_stock,
        maximum_stock: formData.maximum_stock,
        factory_id: profile!.factory_id!,
      }

      if (item) {
        const { error } = await supabase.from("raw_materials").update(payload).eq("id", item.id)
        if (error) throw error
        await createAuditLog({ action: "UPDATE", tableName: "raw_materials", recordId: item.id, newValues: payload })
      } else {
        const { data, error } = await supabase.from("raw_materials").insert({ ...payload, created_by: user!.id, status: "active" }).select().single()
        if (error) throw error
        await createAuditLog({ action: "CREATE", tableName: "raw_materials", recordId: data.id, newValues: payload })
      }
    },
    onSuccess: () => {
      toast.success(item ? "Yangilandi" : "Qo'shildi")
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Xomashyoni tahrirlash" : "Yangi xomashyo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nomi *</Label>
              <Input {...register("name")} placeholder="Shakar" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input {...register("sku")} placeholder="XOM-001" />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Kategoriya</Label>
              <Select value={watch("category_id") || ""} onValueChange={(v) => setValue("category_id", v)}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>O'lchov birligi</Label>
              <Select value={watch("unit_id") || ""} onValueChange={(v) => setValue("unit_id", v)}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ta'minotchi</Label>
            <Select value={watch("supplier_id") || ""} onValueChange={(v) => setValue("supplier_id", v)}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Narx (so'm)</Label>
              <Input {...register("purchase_price")} type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Min zaxira</Label>
              <Input {...register("minimum_stock")} type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Max zaxira</Label>
              <Input {...register("maximum_stock")} type="number" min={0} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Bekor qilish</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-violet-600 hover:bg-violet-700 text-white">
              {mutation.isPending ? <><Loader2 size={16} className="animate-spin mr-2" />Saqlanmoqda...</> : item ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
