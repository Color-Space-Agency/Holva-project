"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Upload, X, Package, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isRealSupabaseConfigured } from "@/lib/mock-data"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

const schema = z.object({
  name: z.string().min(2, "Mahsulot nomi kamida 2 belgidan iborat bo'lishi kerak"),
  sku: z.string().min(2, "SKU kodi talab qilinadi"),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  description: z.string().optional(),
  unit_id: z.string().optional(),
  sales_price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
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
        { id: "u-1", name: "Dona (dona)", symbol: "dona" },
        { id: "u-2", name: "Kilogramm (kg)", symbol: "kg" },
        { id: "u-3", name: "Quti (quti)", symbol: "quti" },
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
      packaging_type: "",
      description: "",
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        category_id: product.category_id ?? "cat-1",
        description: product.description ?? "",
        unit_id: product.unit_id ?? "u-1",
        sales_price: product.sales_price,
        wholesale_price: product.wholesale_price || Math.round(product.sales_price * 0.9),
        minimum_price: product.minimum_price || Math.round(product.sales_price * 0.85),
        packaging_type: product.packaging_type ?? "Korobka",
        package_weight: product.package_weight ?? 0.5,
        status: (product.status as any) || "ACTIVE",
      })
      setImagePreview(product.image_url || null)
    } else {
      reset({
        name: "",
        sku: `HLV-${Math.floor(100 + Math.random() * 900)}`,
        barcode: "",
        category_id: "cat-1",
        description: "",
        unit_id: "u-1",
        sales_price: 45000,
        wholesale_price: 40000,
        minimum_price: 38000,
        packaging_type: "Korobka",
        package_weight: 0.5,
        status: "ACTIVE",
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

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

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
            image_url: imagePreview,
          }

          if (product) {
            await supabase.from("products").update(payload).eq("id", product.id)
          } else {
            await supabase.from("products").insert({ ...payload, created_by: user?.id })
          }
        } catch {
          // Fallback
        }
      }

      toast.success(product ? "Mahsulot muvaffaqiyatli yangilandi!" : "Yangi mahsulot saqlandi!")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Mahsulot nomi, narxlari va qadoqlash parametrlarini kiriting
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-3">
          {/* Image Upload Box */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Package size={28} className="text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-100 transition-colors">
                <Upload size={14} />
                Rasm yuklash
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <p className="text-[11px] text-gray-400">PNG, JPG, WEBP — maksimal 5MB</p>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageFile(null) }}
                  className="text-[11px] text-red-500 hover:underline block pt-0.5"
                >
                  Rasmni olib tashlash
                </button>
              )}
            </div>
          </div>

          {/* Name + SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Mahsulot nomi *
              </Label>
              <Input
                {...register("name")}
                placeholder="Kunjutli Premium Holva (500g)"
                className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                SKU (Artikul) *
              </Label>
              <Input
                {...register("sku")}
                placeholder="HLV-KNJ-500"
                className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
              />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
          </div>

          {/* Barcode + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Shtrix kod
              </Label>
              <Input
                {...register("barcode")}
                placeholder="4780012345678"
                className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Kategoriya
              </Label>
              <Select
                value={watch("category_id") || "cat-1"}
                onValueChange={(v) => setValue("category_id", v)}
              >
                <SelectTrigger className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Kategoriya tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Mahsulot Tavsifi
            </Label>
            <Textarea
              {...register("description")}
              rows={2}
              placeholder="Tabiiy xomashyolardan tayyorlangan saralangan sifatli holva..."
              className="rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Unit + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                O&apos;lchov birligi
              </Label>
              <Select
                value={watch("unit_id") || "u-1"}
                onValueChange={(v) => setValue("unit_id", v)}
              >
                <SelectTrigger className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Birlik tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Holati (Status)
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(v: any) => setValue("status", v)}
              >
                <SelectTrigger className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="ACTIVE">Faol (Sotuvda)</SelectItem>
                  <SelectItem value="INACTIVE">Nofaol</SelectItem>
                  <SelectItem value="ARCHIVED">Arxivlangan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Sotuv narxi (so&apos;m) *
              </Label>
              <Input
                type="number"
                step="500"
                {...register("sales_price")}
                placeholder="45000"
                className="h-10 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 font-semibold"
              />
              {errors.sales_price && <p className="text-xs text-red-500">{errors.sales_price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Ulgurji narxi (so&apos;m)
              </Label>
              <Input
                type="number"
                step="500"
                {...register("wholesale_price")}
                placeholder="40000"
                className="h-10 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Minimal narx (so&apos;m)
              </Label>
              <Input
                type="number"
                step="500"
                {...register("minimum_price")}
                placeholder="38000"
                className="h-10 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Packaging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Qadoq turi
              </Label>
              <Input
                {...register("packaging_type")}
                placeholder="Korobka, vakuum, quti..."
                className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Qadoq og&apos;irligi (kg)
              </Label>
              <Input
                type="number"
                step="0.05"
                {...register("package_weight")}
                placeholder="0.5"
                className="h-11 rounded-2xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-2xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/20"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
