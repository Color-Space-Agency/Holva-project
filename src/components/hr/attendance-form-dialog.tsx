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
import { format } from "date-fns";

const attendanceSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  check_in: z.string().optional().or(z.literal("")),
  check_out: z.string().optional().or(z.literal("")),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "VACATION", "CHECKED_OUT"]),
  notes: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AttendanceFormDialog({ open, onOpenChange, onSuccess }: AttendanceFormDialogProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-active"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("employees").select("id, full_name").eq("employment_status", "ACTIVE").is("deleted_at", null).order("full_name");
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { id: "emp-1", full_name: "Azizbek Karimov" },
        { id: "emp-2", full_name: "Nodir Zokirov" },
        { id: "emp-3", full_name: "Malika Usmonova" },
        { id: "emp-4", full_name: "Rustam Aliyev" },
        { id: "emp-5", full_name: "Dilshod Qodirov" },
      ];
    }
  });

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: "",
      date: format(new Date(), "yyyy-MM-dd"),
      check_in: "",
      check_out: "",
      status: "PRESENT",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        employee_id: "",
        date: format(new Date(), "yyyy-MM-dd"),
        check_in: "",
        check_out: "",
        status: "PRESENT",
        notes: "",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: AttendanceFormValues) => {
    setIsSubmitting(true);
    try {
      // Basic duplicate check
      const { data: existing } = await supabase
        .from("attendance")
        .select("id")
        .eq("employee_id", values.employee_id)
        .eq("date", values.date)
        .single();
      
      if (existing) {
        throw new Error("Attendance record already exists for this employee on this date.");
      }

      let working_hours = 0;
      if (values.check_in && values.check_out) {
        const d1 = new Date(`2000-01-01T${values.check_in}`);
        const d2 = new Date(`2000-01-01T${values.check_out}`);
        working_hours = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
      }

      const { error } = await supabase.from("attendance").insert([{
        ...values,
        check_in: values.check_in || null,
        check_out: values.check_out || null,
        working_hours: working_hours > 0 ? parseFloat(working_hours.toFixed(2)) : 0,
      }]);
      
      if (error) throw error;
      toast.success("Attendance added");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attendance</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {employees?.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="PRESENT">Present</SelectItem>
                        <SelectItem value="LATE">Late</SelectItem>
                        <SelectItem value="ABSENT">Absent</SelectItem>
                        <SelectItem value="VACATION">Vacation</SelectItem>
                        <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_out"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
