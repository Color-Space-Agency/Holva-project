"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Upload, Package, TrendingUp } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isRealSupabaseConfigured } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { Database } from "@/types/database"

type Product = Database["public"]["Tables"]["products"]["Row"]

const schema = z.object({
  name: z.string().min(2, "Mahsulot nomi kiritilishi kerak"),
  unit_id: z.string().optional(),
  cost_price: z.coerce.number().min(0, "Tan narx 0 dan kam bo'lmasligi kerak"),
  sales_price: z.coerce.number().min(0, "Sotuv narxi manfiy bo'lishi mumkin emas"),
})

type FormData = z.infer<typeof schema>

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: (Product & { product_categories?: { name: string } | null; product_units?: { name: string; symbol: string } | null; cost_price?: number }) | null
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const queryClient = useQueryClient()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: units = [] } = useQuery({
    queryKey: ["product-units"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data } = await supabase.from("product_units").select("id, name, symbol").order("name")
          if (data && data.length > 0) return data
        } catch {}
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
      name: "",
      unit_id: "u-1",
      cost_price: 2200,
      sales_price: 3800,
    },
  })

  const watchedCostPrice = watch("cost_price") || 0
  const watchedSalesPrice = watch("sales_price") || 0
  const profitPerItem = watchedSalesPrice - watchedCostPrice
  const marginPercentage = watchedCostPrice > 0 ? ((profitPerItem / watchedCostPrice) * 100).toFixed(1) : "0"

  useEffect(() => {
    if (product) {
      const estimatedCost = (product as any).cost_price || Math.round(product.sales_price * 0.6)
      reset({
        name: product.name,
        unit_id: product.unit_id ?? "u-1",
        cost_price: estimatedCost,
        sales_price: product.sales_price,
      })
      setImagePreview(product.image_url || null)
    } else {
      reset({
        name: "",
        unit_id: "u-1",
        cost_price: 2200,
        sales_price: 3800,
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
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const uName = units.find((u: any) => u.id === formData.unit_id)?.name || "dona"
      const finalImageUrl = imagePreview !== null ? imagePreview : (product?.image_url || "")
      const skuVal = product?.sku || `HLV-${Math.floor(100 + Math.random() * 900)}`

      if (product) {
        const { saveStoredProduct } = await import("@/lib/mock-data")
        saveStoredProduct({
          id: product.id,
          name: formData.name,
          sku: skuVal,
          category: "Umumiy",
          price: formData.sales_price,
          cost_price: formData.cost_price,
          unit: uName,
          status: "ACTIVE",
          image_url: finalImageUrl,
        })
      } else {
        const { createStoredProduct } = await import("@/lib/mock-data")
        createStoredProduct({
          name: formData.name,
          sku: skuVal,
          category: "Umumiy",
          price: formData.sales_price,
          cost_price: formData.cost_price,
          unit: uName,
          stock: 50,
          min_stock: 10,
          status: "ACTIVE",
          image_url: finalImageUrl,
        })
      }

      if (isRealSupabaseConfigured()) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          const payload = {
            name: formData.name,
            unit_id: formData.unit_id || null,
            cost_price: formData.cost_price,
            sales_price: formData.sales_price,
            image_url: imagePreview,
          }

          if (product) {
            await supabase.from("products").update(payload).eq("id", product.id)
          } else {
            await supabase.from("products").insert({ ...payload, sku: skuVal, created_by: user?.id })
          }
        } catch {}
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
      <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-6 shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
            {product ? "Mahsulotni Tahrirlash" : "Yangi Mahsulot Qo'shish"}
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Mahsulot nomi, narxlari va sof foyda hisobi
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-3">
          {/* Image Upload Box */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Package size={24} className="text-gray-400" />
              )}
            </div>
            <div className="space-y-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-100 transition-colors">
                <Upload size={13} />
                Rasm yuklash
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              <p className="text-[10px] text-gray-400">PNG, JPG, WEBP — maks 5MB</p>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[11px] text-red-500 hover:underline block pt-0.5 cursor-pointer"
                >
                  Rasmni olib tashlash
                </button>
              )}
            </div>
          </div>

          {/* Mahsulot Nomi & O'lchov birligi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Mahsulot nomi *
              </Label>
              <Input
                {...register("name")}
                placeholder="Kunjutli Premium Holva (500g)"
                className="h-10 rounded-xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                O&apos;lchov birligi
              </Label>
              <Select
                value={watch("unit_id") || "u-1"}
                onValueChange={(v) => setValue("unit_id", v)}
              >
                <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Birlik" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tan Narx, Sotuv Narxi va Sof Foyda Hisob-kitobi */}
          <div className="space-y-3 p-3.5 bg-gradient-to-br from-violet-50/60 to-emerald-50/60 dark:from-violet-950/20 dark:to-emerald-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" />
                Narxlar va Sof Foyda Hisob-kitobi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Tan narxi */}
              <div className="space-y-1 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <Label className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  Tan narxi (so&apos;m) *
                </Label>
                <Input
                  type="number"
                  step="100"
                  {...register("cost_price")}
                  placeholder="2200"
                  className="h-9 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 font-bold text-amber-900 dark:text-amber-200 text-xs"
                />
              </div>

              {/* Sotuv narxi */}
              <div className="space-y-1 bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <Label className="text-[11px] font-bold text-violet-700 dark:text-violet-400">
                  Sotuv narxi (so&apos;m) *
                </Label>
                <Input
                  type="number"
                  step="100"
                  {...register("sales_price")}
                  placeholder="3800"
                  className="h-9 rounded-lg bg-violet-50/50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 font-bold text-violet-900 dark:text-violet-200 text-xs"
                />
              </div>
            </div>

            {/* Sof Foyda Ko'rsatkichi */}
            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  %
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    1 dona mahsulotdan sof foyda:
                  </p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(profitPerItem)}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-black">
                +{marginPercentage}%
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 rounded-xl text-xs"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
