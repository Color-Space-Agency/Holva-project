"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/audit";
import { formatNumber } from "@/lib/utils";

const formSchema = z.object({
  product_id: z.string().uuid("Mahsulot tanlanishi shart"),
  recipe_id: z.string().uuid("Retsept tanlanishi shart"),
  planned_quantity: z.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
  production_date: z.string().min(1, "Sana kiritilishi shart")
});

export function ProductionBatchFormDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      recipe_id: "",
      planned_quantity: 0,
      production_date: new Date().toISOString().split('T')[0]
    }
  });

  const productId = form.watch("product_id");
  const recipeId = form.watch("recipe_id");
  const plannedQty = form.watch("planned_quantity") || 0;

  const { data: products = [] } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { isRealSupabaseConfigured, getStoredProducts } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("products").select("id, name").eq("is_active", true);
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return getStoredProducts().map(p => ({ id: p.id, name: p.name }));
    }
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes-by-product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("recipes").select("*").eq("product_id", productId);
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { id: "rec-1", name: "Standart Retsept v1.0", product_id: productId, yield_quantity: 100 }
      ];
    },
    enabled: !!productId
  });

  const selectedRecipe = recipes?.find(r => r.id === recipeId);

  const { data: recipeItems = [] } = useQuery({
    queryKey: ["recipe-items", recipeId],
    queryFn: async () => {
      if (!recipeId) return [];
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("recipe_items")
            .select(`*, raw_material:raw_materials(name)`)
            .eq("recipe_id", recipeId);
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { id: "ri-1", raw_material_id: "rm-1", quantity: 60, raw_material: { name: "Oq kunjut" } },
        { id: "ri-2", raw_material_id: "rm-2", quantity: 35, raw_material: { name: "Shakar kukuni" } },
      ];
    },
    enabled: !!recipeId
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory-materials"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data")
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("inventory").select("raw_material_id, current_stock, reserved_stock").not("raw_material_id", "is", null);
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return [
        { raw_material_id: "rm-1", current_stock: 450, reserved_stock: 0 },
        { raw_material_id: "rm-2", current_stock: 800, reserved_stock: 0 },
      ];
    }
  });

  const getRequiredQty = (baseQty: number) => {
    if (!selectedRecipe || !selectedRecipe.yield_quantity) return 0;
    return (plannedQty / selectedRecipe.yield_quantity) * baseQty;
  };

  const getStock = (rmId: string) => {
    const inv = inventory?.filter(i => i.raw_material_id === rmId) || [];
    return inv.reduce((sum, i) => sum + (i.current_stock - (i.reserved_stock || 0)), 0);
  };

  const hasEnoughStock = recipeItems?.every(item => getStock(item.raw_material_id) >= getRequiredQty(item.quantity));

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!hasEnoughStock) throw new Error("Omborda yetarli xomashyo yo'q");

      const { data: auth } = await supabase.auth.getUser();

      const batchNumber = `BATCH-${Date.now().toString().slice(-6)}`;

      const { data: batch, error: batchError } = await supabase.from("production_batches").insert({
        batch_number: batchNumber,
        product_id: values.product_id,
        recipe_id: values.recipe_id,
        planned_quantity: values.planned_quantity,
        unit_id: selectedRecipe?.yield_unit_id,
        production_date: values.production_date,
        status: "PLANNED",
        created_by: auth.user?.id
      }).select().single();

      if (batchError) throw batchError;

      // Add consumptions and reserve stock
      for (const item of recipeItems || []) {
        const reqQty = getRequiredQty(item.quantity);
        
        await supabase.from("production_consumptions").insert({
          batch_id: batch.id,
          raw_material_id: item.raw_material_id,
          planned_quantity: reqQty,
          unit_id: item.unit_id
        });

        // Reserve stock in first available warehouse that has it
        const { data: invs } = await supabase.from("inventory")
          .select("*")
          .eq("raw_material_id", item.raw_material_id)
          .gt("current_stock", 0);
          
        if (invs && invs.length > 0) {
          // For simplicity, just add to reserved on first one
          await supabase.from("inventory").update({
            reserved_stock: invs[0].reserved_stock + reqQty
          }).eq("id", invs[0].id);
        }
      }

      await createAuditLog({ action: "CREATE", tableName: "production_batches", recordId: batch.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Partiya yaratildi");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Yangi ishlab chiqarish partiyasi</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mahsulot</Label>
              <Select onValueChange={(v) => form.setValue("product_id", v)}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Retsept</Label>
              <Select onValueChange={(v) => form.setValue("recipe_id", v)} disabled={!productId}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>
                  {recipes?.map(r => <SelectItem key={r.id} value={r.id}>{r.name} (v{r.version})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sana</Label>
              <Input type="date" {...form.register("production_date")} />
            </div>

            <div className="space-y-2">
              <Label>Rejalashtirilgan miqdor</Label>
              <Input type="number" step="0.01" {...form.register("planned_quantity", { valueAsNumber: true })} />
            </div>
          </div>

          {recipeItems && recipeItems.length > 0 && plannedQty > 0 && (
            <div className="space-y-2">
              <Label>Kerakli xomashyolar</Label>
              <div className="border rounded-md p-4 bg-muted/30 space-y-2">
                {recipeItems.map(item => {
                  const req = getRequiredQty(item.quantity);
                  const stock = getStock(item.raw_material_id);
                  const isEnough = stock >= req;
                  return (
                    <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span>{item.raw_material?.name}</span>
                      <div className="flex items-center gap-4">
                        <span>Talab: <strong className="ml-1">{formatNumber(req)} {item.unit?.short_name}</strong></span>
                        <span className={`w-32 text-right ${isEnough ? 'text-green-600' : 'text-destructive'}`}>
                          Omborda: {formatNumber(stock)} {item.unit?.short_name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!hasEnoughStock && <p className="text-sm text-destructive font-medium mt-1">Omborda yetarli xomashyo yo'q!</p>}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={mutation.isPending || !hasEnoughStock || !plannedQty}>Saqlash</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}