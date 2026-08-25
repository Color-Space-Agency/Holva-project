"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, User, Trash2 } from "lucide-react";
import { isRealSupabaseConfigured } from "@/lib/mock-data";

const employeeSchema = z.object({
  full_name: z.string().min(2, "Xodim ismi kamida 2 belgidan iborat bo'lishi kerak"),
  phone: z.string().optional(),
  email: z.string().email("Noto'g'ri email formati").optional().or(z.literal("")),
  department_id: z.string().nullable().optional(),
  position_id: z.string().nullable().optional(),
  employment_date: z.string().min(1, "Ishga qabul sanasi talab qilinadi"),
  employment_status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]),
  salary_type: z.enum(["MONTHLY", "HOURLY", "DAILY", "PIECE_RATE"]),
  salary_amount: z.coerce.number().min(0, "Ish haqi 0 dan kam bo'lmasligi kerak"),
  emergency_contact: z.string().optional(),
  notes: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: any;
  onSuccess: () => void;
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: EmployeeFormDialogProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("departments").select("*").order("name");
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { id: "dep-1", name: "Ishlab chiqarish (Tsex)" },
        { id: "dep-2", name: "Qadoqlash bo'limi" },
        { id: "dep-3", name: "Sotuv va Logistika" },
        { id: "dep-4", name: "Omborxona" },
      ];
    }
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("positions").select("*").order("name");
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { id: "pos-1", name: "Bosh texnolog" },
        { id: "pos-2", name: "Qandolatchi usta" },
        { id: "pos-3", name: "Qadoqlovchi" },
        { id: "pos-4", name: "Sotuv agenti" },
        { id: "pos-5", name: "Haydovchi" },
      ];
    }
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      department_id: "dep-1",
      position_id: "pos-1",
      employment_date: new Date().toISOString().split("T")[0],
      employment_status: "ACTIVE",
      salary_type: "MONTHLY",
      salary_amount: 5000000,
      emergency_contact: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (employee && open) {
      const depId =
        employee.department_id ||
        departments.find((d: any) => d.name === employee.department?.name)?.id ||
        "dep-1";
      const posId =
        employee.position_id ||
        positions.find((p: any) => p.name === employee.position?.name)?.id ||
        "pos-1";

      form.reset({
        full_name: employee.full_name || "",
        phone: employee.phone || "",
        email: employee.email || "",
        department_id: depId,
        position_id: posId,
        employment_date: employee.employment_date || new Date().toISOString().split("T")[0],
        employment_status: employee.employment_status || "ACTIVE",
        salary_type: employee.salary_type || "MONTHLY",
        salary_amount: employee.salary_amount || 0,
        emergency_contact: employee.emergency_contact || "",
        notes: employee.notes || "",
      });
      setPhotoPreview(employee.photo_url || null);
    } else if (open) {
      form.reset({
        full_name: "",
        phone: "+998 90 123 45 67",
        email: "",
        department_id: "dep-1",
        position_id: "pos-1",
        employment_date: new Date().toISOString().split("T")[0],
        employment_status: "ACTIVE",
        salary_type: "MONTHLY",
        salary_amount: 5000000,
        emergency_contact: "",
        notes: "",
      });
      setPhotoPreview(null);
    }
  }, [employee, open, form]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasin");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const depName = departments.find((d: any) => d.id === values.department_id)?.name || "Ishlab chiqarish (Tsex)";
      const posName = positions.find((p: any) => p.id === values.position_id)?.name || "Xodim";

      if (employee) {
        const { saveStoredEmployee } = await import("@/lib/mock-data");
        saveStoredEmployee({
          id: employee.id,
          full_name: values.full_name,
          phone: values.phone || "",
          department: depName,
          position: posName,
          salary_amount: values.salary_amount,
          salary_type: values.salary_type,
          employment_status: values.employment_status,
          photo_url: photoPreview || "",
        });
      } else {
        const { createStoredEmployee } = await import("@/lib/mock-data");
        createStoredEmployee({
          full_name: values.full_name,
          phone: values.phone || "",
          department: depName,
          position: posName,
          salary_amount: values.salary_amount,
          salary_type: values.salary_type,
          employment_status: values.employment_status,
          photo_url: photoPreview || "",
        });
      }

      if (isRealSupabaseConfigured()) {
        try {
          const dataToSave = {
            ...values,
            department_id: values.department_id || null,
            position_id: values.position_id || null,
            photo_url: photoPreview,
          };
          if (employee) {
            await supabase.from("employees").update(dataToSave).eq("id", employee.id);
          } else {
            await supabase.from("employees").insert([dataToSave]);
          }
        } catch {
          // Fallback
        }
      }

      toast.success(employee ? "Xodim ma'lumotlari yangilandi!" : "Yangi xodim muvaffaqiyatli qo'shildi!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Xodimni saqlashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {employee ? "Xodim Ma'lumotlarini Tahrirlash" : "Yangi Xodim Qo'shish"}
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Xodimning shaxsiy ma&apos;lumotlari, lavozimi va maosh shartlarini kiriting
          </p>
        </DialogHeader>

        {/* Ruchnoy rasm yuklash / o'chirish */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mt-2">
          <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-gray-400" />
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
                onChange={handlePhotoChange}
              />
            </label>
            <p className="text-[11px] text-gray-400">JPG, PNG, WEBP — maksimal 5MB</p>
            {photoPreview && (
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:underline pt-0.5"
              >
                <Trash2 size={12} />
                Rasmni olib tashlash
              </button>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      F.I.SH. (To&apos;liq ismi) *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Rustam Mahmudov" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Telefon raqami
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+998 90 123 45 67" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Bo&apos;lim
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-2xl">
                          <SelectValue placeholder="Bo'limni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position_id"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Lavozim
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-2xl">
                          <SelectValue placeholder="Lavozimni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employment_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ishga qabul sanasi *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Xodim holati
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Faol (Ishlamoqda)</SelectItem>
                        <SelectItem value="ON_LEAVE">Ta&apos;tilda</SelectItem>
                        <SelectItem value="TERMINATED">Bo&apos;shatilgan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ish haqi bloki */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
              <FormField
                control={form.control}
                name="salary_type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Ish haqi turi
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-gray-800">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Oylik (Oklad)</SelectItem>
                        <SelectItem value="HOURLY">Soatbay</SelectItem>
                        <SelectItem value="DAILY">Kunbay</SelectItem>
                        <SelectItem value="PIECE_RATE">Ishbay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_amount"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Oklad miqdori (so&apos;m) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="100000"
                        placeholder="5000000"
                        className="h-10 rounded-xl bg-white dark:bg-gray-800 font-semibold"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergency_contact"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Shoshilinch aloqa raqami
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+998 90 999 88 77 (Turmush o'rtog'i)" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Elektron pochta (Ixtiyoriy)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="xodim@holva.uz" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Qo&apos;shimcha eslatmalar
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Qo'shimcha ma'lumotlar..." className="rounded-2xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
