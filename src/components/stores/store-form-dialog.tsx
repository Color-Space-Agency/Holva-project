"use client"

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
import { createAuditLog } from "@/lib/audit"

const formSchema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  phone: z.string().optional(),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  telegram: z.string().optional(),
  notes: z.string().optional(),
  payment_terms: z.string().optional(),
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
    defaultValues: initialData || {
      name: "",
      phone: "",
      address: "",
      contact_person: "",
      telegram: "",
      notes: "",
      payment_terms: "",
      credit_limit: 0,
      status: "ACTIVE" as const,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const { data: profile } = await supabase
        .from("profiles")
        .select("factory_id")
        .eq("id", user.id)
        .single()

      if (!profile?.factory_id) throw new Error("Factory not found")

      if (initialData) {
        const { error } = await supabase
          .from("stores")
          .update(values)
          .eq("id", initialData.id)

        if (error) throw error

        await createAuditLog({
          action: "UPDATE",
          tableName: "stores",
          recordId: initialData.id,
          oldValues: initialData,
          newValues: values,
        })
        toast.success("Do'kon yangilandi")
      } else {
        const { data, error } = await supabase
          .from("stores")
          .insert({
            ...values,
            factory_id: profile.factory_id,
            created_by: user.id,
            current_balance: 0,
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          await createAuditLog({
            action: "CREATE",
            tableName: "stores",
            recordId: data.id,
            newValues: data,
          })
        }
        toast.success("Do'kon qo'shildi")
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Do'konni tahrirlash" : "Yangi do'kon qo'shish"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomi *</FormLabel>
                    <FormControl>
                      <Input placeholder="Do'kon nomi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="+998..." {...field} value={field.value || ""} />
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
                    <FormLabel>Manzil</FormLabel>
                    <FormControl>
                      <Input placeholder="Manzil" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mas'ul shaxs</FormLabel>
                    <FormControl>
                      <Input placeholder="Ism familiya" {...field} value={field.value || ""} />
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
                    <FormLabel>Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To'lov shartlari</FormLabel>
                    <FormControl>
                      <Input placeholder="Masalan: 3 kun" {...field} value={field.value || ""} />
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
                    <FormLabel>Qarz limiti (so'm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>Holat</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Holatni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Faol</SelectItem>
                        <SelectItem value="INACTIVE">Nofaol</SelectItem>
                        <SelectItem value="BLOCKED">Bloklangan</SelectItem>
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
                  <FormLabel>Eslatma</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Qo'shimcha ma'lumotlar" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Saqlash
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
