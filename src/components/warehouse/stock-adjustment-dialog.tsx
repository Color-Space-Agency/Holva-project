"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/audit";

const formSchema = z.object({
  movement_type: z.enum(["IN", "OUT", "ADJUSTMENT", "WASTE"]),
  quantity: z.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
  reason: z.string().optional()
});

export function StockAdjustmentDialog({ item, open, onOpenChange }: { item: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movement_type: "ADJUSTMENT",
      quantity: 0,
      reason: ""
    }
  });

  const movementType = form.watch("movement_type");
  const qty = form.watch("quantity") || 0;
  
  let newStock = item?.current_stock || 0;
  if (movementType === "IN") newStock += qty;
  else if (movementType === "OUT" || movementType === "WASTE") newStock -= qty;
  // For ADJUSTMENT, we could interpret it as exact stock or offset, let's treat it as setting exact stock or adding/subtracting?
  // Often adjustment means replacing. Let's make "quantity" the DIFFERENCE for simplicity, or just use IN/OUT/WASTE.
  else if (movementType === "ADJUSTMENT") newStock = qty; // If ADJUSTMENT, user sets absolute new stock

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      let finalNewStock = item.current_stock;
      if (values.movement_type === "IN") finalNewStock += values.quantity;
      else if (values.movement_type === "OUT" || values.movement_type === "WASTE") finalNewStock -= values.quantity;
      else if (values.movement_type === "ADJUSTMENT") finalNewStock = values.quantity;

      if (finalNewStock < 0) {
        throw new Error("Ombordagi zaxira manfiy bo'lishi mumkin emas!");
      }

      // We need to calculate the actual diff for the movement log
      const diff = finalNewStock - item.current_stock;

      const { data: userResp } = await supabase.auth.getUser();
      
      const { error: moveError } = await supabase.from("inventory_movements").insert({
        inventory_id: item.id,
        movement_type: values.movement_type,
        quantity: Math.abs(diff), // absolute quantity moved
        before_stock: item.current_stock,
        after_stock: finalNewStock,
        reason: values.reason,
        created_by: userResp.user?.id
      });
      if (moveError) throw moveError;

      const { error: invError } = await supabase.from("inventory").update({
        current_stock: finalNewStock
      }).eq("id", item.id);
      if (invError) throw invError;

      await createAuditLog({ action: "UPDATE", tableName: "inventory", recordId: item.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Zaxira yangilandi");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  if (!item) return null;
  const itemName = item.product?.name || item.raw_material?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zaxirani tahrirlash: {itemName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="bg-muted p-3 rounded-md flex justify-between">
            <span className="text-sm">Joriy zaxira:</span>
            <span className="font-bold">{item.current_stock} {item.unit?.short_name}</span>
          </div>

          <div className="space-y-2">
            <Label>Amaliyot turi</Label>
            <Select onValueChange={(v: any) => form.setValue("movement_type", v)} defaultValue="ADJUSTMENT">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Kirim (IN)</SelectItem>
                <SelectItem value="OUT">Chiqim (OUT)</SelectItem>
                <SelectItem value="WASTE">Yaroqsiz/Chiqindi (WASTE)</SelectItem>
                <SelectItem value="ADJUSTMENT">To'g'rilash (Absolute stock)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{movementType === 'ADJUSTMENT' ? 'Yangi aniq qoldiq' : 'Miqdor'}</Label>
            <Input type="number" step="0.01" {...form.register("quantity", { valueAsNumber: true })} />
          </div>

          <div className="bg-muted/50 p-3 rounded-md flex justify-between">
            <span className="text-sm">Yangi qoldiq:</span>
            <span className={`font-bold ${newStock < 0 ? 'text-destructive' : ''}`}>{newStock} {item.unit?.short_name}</span>
          </div>

          <div className="space-y-2">
            <Label>Sabab / Izoh</Label>
            <Textarea {...form.register("reason")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}