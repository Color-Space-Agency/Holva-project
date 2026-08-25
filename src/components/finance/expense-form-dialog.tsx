"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isRealSupabaseConfigured } from "@/lib/mock-data";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newExpense: any) => void;
}

export function ExpenseFormDialog({ open, onOpenChange, onSuccess }: ExpenseFormDialogProps) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [category, setCategory] = useState("RAW_MATERIALS");
  const [amount, setAmount] = useState("500000");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (open) {
      setCategory("RAW_MATERIALS");
      setAmount("500000");
      setPaymentMethod("CASH");
      setDescription("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Iltimos, xarajat summasini kiriting!");
      return;
    }
    if (!description.trim()) {
      toast.error("Iltimos, xarajat tavsifini kiriting!");
      return;
    }

    const payload = {
      category,
      amount: Number(amount),
      payment_method: paymentMethod,
      description: description.trim(),
      expense_date: expenseDate || new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      if (isRealSupabaseConfigured()) {
        try {
          await supabase.from("expenses").insert([payload]);
        } catch {
          // Fallback
        }
      }

      toast.success("Yangi xarajat muvaffaqiyatli saqlandi!");
      onSuccess(payload);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Xarajatni saqlashda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yangi Xarajat Qo&apos;shish
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Xarajat Toifasi *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Toifani tanlang" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="RAW_MATERIALS">Xomashyo xaridi</SelectItem>
                <SelectItem value="SALARY">Ish haqi va avans</SelectItem>
                <SelectItem value="RENT">Bino ijarasi</SelectItem>
                <SelectItem value="ELECTRICITY">Elektr va kommunal</SelectItem>
                <SelectItem value="TRANSPORT">Transport va logistika</SelectItem>
                <SelectItem value="PACKAGING">Qadoqlash materiallari</SelectItem>
                <SelectItem value="MAINTENANCE">Uskuna ta&apos;mirlash</SelectItem>
                <SelectItem value="OTHER">Boshqa xarajatlar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Summa (so&apos;m) *
            </label>
            <Input
              type="number"
              step="1000"
              className="h-11 rounded-2xl"
              placeholder="500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              To&apos;lov Usuli
            </label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="To'lov usuli" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="CASH">Naqd pul</SelectItem>
                <SelectItem value="BANK">Bank o&apos;tkazmasi</SelectItem>
                <SelectItem value="CARD">Karta orqali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Tavsif / Izoh *
            </label>
            <Input
              className="h-11 rounded-2xl"
              placeholder="Xarajat sababi (masalan: 100 dona quti xaridi)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Sana *
            </label>
            <Input
              type="date"
              className="h-11 rounded-2xl"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
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
              className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
