"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Building2, Store, Phone, MapPin, User, Send, CreditCard, ShieldCheck, FileText, CheckCircle2 } from "lucide-react"
import { createStoredStore, updateStoredStore, isRealSupabaseConfigured, MockStore } from "@/lib/mock-data"

const formSchema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  phone: z.string().optional(),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  telegram: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
  initial_balance: z.coerce.number().min(0).optional().default(0),
  credit_limit: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).default("ACTIVE"),
})

interface StoreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: any
  onSuccess: () => void
}

export function StoreFormDialog({ open, onOpenChange, initialData, onSuccess }: StoreFormDialogProps) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      contact_person: "",
      telegram: "",
      notes: "",
      payment_terms: "",
      initial_balance: 0,
      credit_limit: 0,
      status: "ACTIVE",
    },
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          contact_person: initialData.contact_person || "",
          telegram: initialData.telegram || "",
          notes: initialData.notes || "",
          payment_terms: initialData.payment_terms || "",
          initial_balance: initialData.initial_balance || 0,
          credit_limit: initialData.credit_limit || 0,
          status: initialData.status || "ACTIVE",
        })
      } else {
        form.reset({
          name: "",
          phone: "",
          address: "",
          contact_person: "",
          telegram: "",
          notes: "",
          payment_terms: "",
          initial_balance: 0,
          credit_limit: 0,
          status: "ACTIVE",
        })
      }
    }
  }, [open, initialData, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const initBal = values.initial_balance || 0
      if (initialData) {
        if (isRealSupabaseConfigured()) {
          try {
            await supabase.from("stores").update(values).eq("id", initialData.id)
          } catch {}
        }
        updateStoredStore(initialData.id, {
          ...values,
          initial_balance: initBal,
          current_balance: initBal > 0 ? -initBal : (initialData.current_balance || 0),
        })
        toast.success("Do'kon ma'lumotlari yangilandi!")
      } else {
        const newStore: MockStore = {
          id: `s-${Date.now()}`,
          name: values.name.trim(),
          phone: values.phone || "",
          address: values.address || "",
          contact_person: values.contact_person || "",
          initial_balance: initBal,
          credit_limit: values.credit_limit || 0,
          current_balance: initBal > 0 ? -initBal : 0,
          status: values.status || "ACTIVE",
          created_at: new Date().toISOString(),
        }
        if (isRealSupabaseConfigured()) {
          try {
            await supabase.from("stores").insert(values)
          } catch {}
        }
        createStoredStore(newStore)
        toast.success("Yangi do'kon muvaffaqiyatli qo'shildi!")
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7 border-2 border-emerald-300 dark:border-emerald-800 shadow-2xl space-y-6 bg-white dark:bg-gray-950">
        <DialogHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-950">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 dark:text-emerald-300">
                {initialData ? "Do'kon Ma'lumotlarini Tahrirlash" : "Yangi Do'kon Yaratish (Yashil Frame)"}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-emerald-700/70 dark:text-emerald-400/70 mt-0.5 font-medium">
                Mijoz do'koningiz atributlari va aloqa ma'lumotlarini kiritish oynasi
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Essential Main Fields Block */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      Do&apos;kon Nomi (Mijoz) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masalan: Korzinka Chilonzor yoki Fayz Supermarket"
                        {...field}
                        className="h-13 rounded-2xl bg-white dark:bg-gray-900 text-base font-bold border-emerald-200 dark:border-emerald-800 focus:ring-2 focus:ring-emerald-500 px-4 shadow-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Telefon raqami
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+998 90 123 45 67"
                          {...field}
                          value={field.value || ""}
                          className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-semibold border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Manzil (Hudud)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Chilonzor 19-mavze, 44-uy"
                          {...field}
                          value={field.value || ""}
                          className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-semibold border-gray-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Contact & Credit Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Mas&apos;ul Shaxs (Mudir)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masalan: Sardor aka"
                        {...field}
                        value={field.value || ""}
                        className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-600" /> Telegram Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        {...field}
                        value={field.value || ""}
                        className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initial_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Boshlang&apos;ich Qarz Summasi (so&apos;m)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0 (masalan: 5000000)"
                        {...field}
                        className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-bold border-amber-200 dark:border-amber-800 focus:ring-amber-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Qarz Limiti (so&apos;m)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000000"
                        {...field}
                        className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Ishlash Holati
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-gray-900 text-sm font-semibold">
                          <SelectValue placeholder="Holatni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="ACTIVE" className="font-semibold text-emerald-600">Faol (Active)</SelectItem>
                        <SelectItem value="INACTIVE">Nofaol (Inactive)</SelectItem>
                        <SelectItem value="BLOCKED" className="text-red-600">Bloklangan (Blocked)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> Qo&apos;shimcha Izoh
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Do'kon haqida qo'shimcha ma'lumotlar..."
                      {...field}
                      value={field.value || ""}
                      className="rounded-2xl bg-white dark:bg-gray-900 text-sm p-3 min-h-[70px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-13 rounded-2xl px-6 text-sm font-bold cursor-pointer"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl px-8 shadow-xl shadow-emerald-600/30 cursor-pointer gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                {form.formState.isSubmitting ? "Saqlanmoqda..." : "Do'konni Saqlash"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
