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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const expenseSchema = z.object({
  category: z.enum(["RAW_MATERIALS", "SALARY", "RENT", "ELECTRICITY", "TRANSPORT", "PACKAGING", "MAINTENANCE", "OTHER"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
  expense_date: z.string().min(1, "Date is required"),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseFormDialog({ open, onOpenChange, onSuccess }: ExpenseFormDialogProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "OTHER",
      amount: 0,
      description: "",
      expense_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        category: "OTHER",
        amount: 0,
        description: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [open, form]);

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("expenses").insert([{
        ...values,
      }]);
      
      if (error) throw error;
      toast.success("Expense added");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="RAW_MATERIALS">Raw Materials</SelectItem>
                      <SelectItem value="SALARY">Salary</SelectItem>
                      <SelectItem value="RENT">Rent</SelectItem>
                      <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                      <SelectItem value="TRANSPORT">Transport</SelectItem>
                      <SelectItem value="PACKAGING">Packaging</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expense_date"
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
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
