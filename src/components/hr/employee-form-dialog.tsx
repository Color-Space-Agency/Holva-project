"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const employeeSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  department_id: z.string().nullable().optional(),
  position_id: z.string().nullable().optional(),
  employment_date: z.string().min(1, "Date is required"),
  employment_status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]),
  salary_type: z.enum(["MONTHLY", "HOURLY", "DAILY", "PIECE_RATE"]),
  salary_amount: z.coerce.number().min(0),
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

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
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
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
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
      department_id: null,
      position_id: null,
      employment_date: new Date().toISOString().split("T")[0],
      employment_status: "ACTIVE",
      salary_type: "MONTHLY",
      salary_amount: 0,
      emergency_contact: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (employee && open) {
      form.reset({
        full_name: employee.full_name || "",
        phone: employee.phone || "",
        email: employee.email || "",
        department_id: employee.department_id || null,
        position_id: employee.position_id || null,
        employment_date: employee.employment_date || new Date().toISOString().split("T")[0],
        employment_status: employee.employment_status || "ACTIVE",
        salary_type: employee.salary_type || "MONTHLY",
        salary_amount: employee.salary_amount || 0,
        emergency_contact: employee.emergency_contact || "",
        notes: employee.notes || "",
      });
    } else if (open) {
      form.reset({
        full_name: "",
        phone: "",
        email: "",
        department_id: null,
        position_id: null,
        employment_date: new Date().toISOString().split("T")[0],
        employment_status: "ACTIVE",
        salary_type: "MONTHLY",
        salary_amount: 0,
        emergency_contact: "",
        notes: "",
      });
    }
  }, [employee, open, form]);

  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...values,
        department_id: values.department_id || null,
        position_id: values.position_id || null,
      };

      if (employee) {
        const { error } = await supabase.from("employees").update(dataToSave).eq("id", employee.id);
        if (error) throw error;
        toast.success("Employee updated successfully");
      } else {
        const { error } = await supabase.from("employees").insert([dataToSave]);
        if (error) throw error;
        toast.success("Employee created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="position_id"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select pos" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {positions?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="employment_date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Employment Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="employment_status"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="salary_type"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Salary Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="HOURLY">Hourly</SelectItem>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="PIECE_RATE">Piece Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <FormField
                control={form.control}
                name="salary_amount"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Salary Amount</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
