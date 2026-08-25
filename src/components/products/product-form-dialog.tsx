"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAuditLog } from "@/lib/audit"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

const schema = z.object({
  name: z.string().min(1, "Mahsulot nomi kerak"),
  sku: z.string().min(1, "SKU kerak"),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  description: z.string().optional(),
  unit_id: z.string().optional(),
  sales_price: z.coerce.number().min(0, "Narx 0 dan kam bo'lmasin"),
  wholesale_price: z.coerce.number().min(0),
  minimum_price: z.coerce.number().min(0),
  packaging_type: z.string().optional(),
  package_weight: z.coerce.number().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
})

type FormData = z.infer<typeof schema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: (Product & { product_categories?: { name: string } | null; product_units?: { name: string; symbol: string } | null }) | null
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const queryClient = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data } = await supabase.from("product_categories").select("id, name").order("name")
          if (data && data.length > 0) return data
        } catch {
          // Fallback
        }
      }
      return [
        { id: "cat-1", name: "Klassik Holvalar" },
        { id: "cat-2", name: "Premium Holvalar" },
        { id: "cat-3", name: "Yong'oqli Holvalar" },
        { id: "cat-4", name: "Shokoladli Holvalar" },
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
        { id: "u-1", name: "Dona", symbol: "dona" },
        { id: "u-2", name: "Kilogramm", symbol: "kg" },
        { id: "u-3", name: "Quti", symbol: "quti" },
      ]
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "ACTIVE",
      sales_price: 0,
      wholesale_price: 0,
      minimum_price: 0,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        category_id: product.category_id ?? "",
        description: product.description ?? "",
        unit_id: product.unit_id ?? "",
        sales_price: product.sales_price,
        wholesale_price: product.wholesale_price,
        minimum_price: product.minimum_price,
        packaging_type: product.packaging_type ?? "",
        package_weight: product.package_weight ?? undefined,
        status: product.status,
      })
      if (product.image_url) setImagePreview(product.image_url)
    } else {
      reset({
        status: "ACTIVE",
        sales_price: 0,
        wholesale_price: 0,
        minimum_price: 0,
      })
      setImagePreview(null)
      setImageFile(null)
    }
  }, [product, reset, open])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasin")
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const fileName = `products/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from("factory-assets")
      .upload(fileName, file, { upsert: true })

    if (error) {
      toast.error("Rasmni yuklashda xatolik: " + error.message)
      return null
    }

    const { data } = supabase.storage.from("factory-assets").getPublicUrl(fileName)
    return data.publicUrl
  }

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const supabase = createClient()

      let imageUrl = product?.image_url ?? null
      if (imageFile) {
        setUploadingImage(true)
        imageUrl = await uploadImage(imageFile)
        setUploadingImage(false)
      }

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from("profiles")
        .select("factory_id")
        .eq("id", user!.id)
        .single()

      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || null,
        category_id: formData.category_id || null,
        description: formData.description || null,
        unit_id: formData.unit_id || null,
        sales_price: formData.sales_price,
        wholesale_price: formData.wholesale_price,
        minimum_price: formData.minimum_price,
        packaging_type: formData.packaging_type || null,
        package_weight: formData.package_weight || null,
        status: formData.status,
        image_url: imageUrl,
        factory_id: profile!.factory_id!,
      }

      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id)
        if (error) throw error
        await createAuditLog({ action: "UPDATE", tableName: "products", recordId: product.id, newValues: payload })
      } else {
        const { data, error } = await supabase.from("products").insert({ ...payload, created_by: user!.id }).select().single()
        if (error) throw error
        await createAuditLog({ action: "CREATE", tableName: "products", recordId: data.id, newValues: payload })
      }
    },
    onSuccess: () => {
      toast.success(product ? "Mahsulot yangilandi" : "Mahsulot qo'shildi")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onOpenChange(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center flex-shrink-0">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={24} className="text-gray-400" />
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
                  Rasm yuklash
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG — max 5MB</p>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="text-xs text-red-500 hover:text-red-600 mt-1"
                >
                  Rasmni olib tashlash
                </button>
              )}
            </div>
          </div>

          {/* Name + SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mahsulot nomi *</Label>
              <Input {...register("name")} placeholder="Oddiy holva" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>SKU *</Label>
              <Input {...register("sku")} placeholder="HOL-001" />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
          </div>

          {/* Barcode + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Shtrix kod</Label>
              <Input {...register("barcode")} placeholder="123456789" />
            </div>
            <div className="space-y-1.5">
              <Label>Kategoriya</Label>
              <Select
                value={watch("category_id") || ""}
                onValueChange={(v) => setValue("category_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Tavsif</Label>
            <Textarea {...register("description")} rows={2} placeholder="Mahsulot haqida..." />
          </div>

          {/* Unit + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>O'lchov birligi</Label>
              <Select
                value={watch("unit_id") || ""}
                onValueChange={(v) => setValue("unit_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Birlik tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", v as "ACTIVE" | "INACTIVE" | "ARCHIVED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Faol</SelectItem>
                  <SelectItem value="INACTIVE">Nofaol</SelectItem>
                  <SelectItem value="ARCHIVED">Arxivlangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Sotuv narxi (so'm) *</Label>
              <Input {...register("sales_price")} type="number" min={0} />
              {errors.sales_price && <p className="text-xs text-red-500">{errors.sales_price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Ulgurji narxi (so'm)</Label>
              <Input {...register("wholesale_price")} type="number" min={0} />
            </div>
            <div className="space-y-1.5">
              <Label>Minimal narx (so'm)</Label>
              <Input {...register("minimum_price")} type="number" min={0} />
            </div>
          </div>

          {/* Packaging */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Qadoq turi</Label>
              <Input {...register("packaging_type")} placeholder="Korobka, qop..." />
            </div>
            <div className="space-y-1.5">
              <Label>Qadoq og'irligi (kg)</Label>
              <Input {...register("package_weight")} type="number" min={0} step={0.01} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || uploadingImage}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {mutation.isPending || uploadingImage ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Saqlanmoqda...</>
              ) : product ? "Saqlash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
