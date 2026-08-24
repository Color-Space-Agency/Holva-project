"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";

const formSchema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  product_id: z.string().uuid("Mahsulot tanlanishi shart"),
  yield_quantity: z.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
  yield_unit_id: z.string().uuid("O'lchov birligi tanlanishi shart"),
  instructions: z.string().optional(),
  is_active: z.boolean().default(true),
  items: z.array(z.object({
    raw_material_id: z.string().uuid("Xomashyo tanlanishi shart"),
    quantity: z.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
    unit_id: z.string().uuid("Birlik tanlanishi shart"),
    notes: z.string().optional()
  })).min(1, "Kamida bitta xomashyo qo'shilishi kerak")
});

export function RecipeFormDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name");
      return data || [];
    }
  });

  const { data: units } = useQuery({
    queryKey: ["units-list"],
    queryFn: async () => {
      const { data } = await supabase.from("units").select("id, name, short_name");
      return data || [];
    }
  });

  const { data: rawMaterials } = useQuery({
    queryKey: ["raw-materials-list"],
    queryFn: async () => {
      const { data } = await supabase.from("raw_materials").select("id, name, purchase_price");
      return data || [];
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      product_id: "",
      yield_quantity: 1,
      yield_unit_id: "",
      instructions: "",
      is_active: true,
      items: [{ raw_material_id: "", quantity: 1, unit_id: "", notes: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const watchYield = form.watch("yield_quantity") || 1;
  const watchItems = form.watch("items");

  const totalCost = watchItems.reduce((sum, item) => {
    const rm = rawMaterials?.find(r => r.id === item.raw_material_id);
    return sum + (rm?.purchase_price || 0) * (item.quantity || 0);
  }, 0);

  const costPerKg = totalCost / watchYield;

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Get max version for product
      const { data: versions } = await supabase
        .from("recipes")
        .select("version")
        .eq("product_id", values.product_id)
        .order("version", { ascending: false })
        .limit(1);
      
      const newVersion = (versions?.[0]?.version || 0) + 1;

      if (values.is_active) {
        await supabase.from("recipes").update({ is_active: false }).eq("product_id", values.product_id);
      }

      const { data: recipe, error: recipeError } = await supabase.from("recipes").insert({
        name: values.name,
        product_id: values.product_id,
        version: newVersion,
        yield_quantity: values.yield_quantity,
        yield_unit_id: values.yield_unit_id,
        instructions: values.instructions,
        is_active: values.is_active
      }).select().single();

      if (recipeError) throw recipeError;

      const itemsToInsert = values.items.map(item => ({
        recipe_id: recipe.id,
        raw_material_id: item.raw_material_id,
        quantity: item.quantity,
        unit_id: item.unit_id,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase.from("recipe_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      await createAuditLog({ action: "CREATE", tableName: "recipes", recordId: recipe.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Retsept yaratildi");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yangi retsept qo'shish</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(((d: any) => mutation.mutate(d)) as any)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nomi *</Label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && <span className="text-sm text-destructive">{form.formState.errors.name.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label>Mahsulot *</Label>
              <Select onValueChange={(v) => form.setValue("product_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chiqish hajmi *</Label>
              <Input type="number" step="0.01" {...form.register("yield_quantity", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>O'lchov birligi *</Label>
              <Select onValueChange={(v) => form.setValue("yield_unit_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {units?.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tarkibi</Label>
            <div className="border rounded-md p-4 space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Xomashyo</Label>
                    <Select onValueChange={(v) => form.setValue(`items.${index}.raw_material_id`, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rawMaterials?.map(r => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Miqdor</Label>
                    <Input type="number" step="0.01" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-xs">Birlik</Label>
                    <Select onValueChange={(v) => form.setValue(`items.${index}.unit_id`, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent>
                        {units?.map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.short_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ raw_material_id: "", quantity: 1, unit_id: "", notes: "" })}>
                <Plus className="h-4 w-4 mr-2" /> Qo'shish
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Umumiy tannarx</p>
              <p className="text-lg font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">1 birlik uchun tannarx</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(costPerKg)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ko'rsatmalar</Label>
            <Textarea {...form.register("instructions")} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={form.watch("is_active")} onCheckedChange={(c) => form.setValue("is_active", c)} />
            <Label>Faol retsept</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={mutation.isPending}>Saqlash</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}