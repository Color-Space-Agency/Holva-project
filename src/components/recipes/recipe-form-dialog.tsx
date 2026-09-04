"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isRealSupabaseConfigured, INITIAL_PRODUCTS, INITIAL_RAW_MATERIALS } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const itemSchema = z.object({
  raw_material_id: z.string().min(1, "Xomashyo tanlanishi shart"),
  quantity: z.coerce.number().min(0.01, "Miqdor noldan katta bo'lishi kerak"),
  unit_id: z.string().default("u-kg"),
  notes: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Retsept nomi kiritilishi shart"),
  product_id: z.string().min(1, "Mahsulot tanlanishi shart"),
  yield_quantity: z.coerce.number().min(0.1, "Chiqish miqdori kiritilishi shart"),
  yield_unit_id: z.string().default("u-kg"),
  instructions: z.string().optional(),
  is_active: z.boolean().default(true),
  items: z.array(itemSchema).min(1, "Kamida bitta xomashyo qo'shilishi kerak"),
});

export function RecipeFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("products").select("id, name");
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return INITIAL_PRODUCTS.map((p) => ({ id: p.id, name: p.name }));
    },
    enabled: open,
  });

  const { data: rawMaterials = [] } = useQuery({
    queryKey: ["raw-materials-list"],
    queryFn: async () => {
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase.from("raw_materials").select("id, name, purchase_price");
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }
      return INITIAL_RAW_MATERIALS.map((r) => ({
        id: r.id,
        name: r.name,
        purchase_price: r.purchase_price,
      }));
    },
    enabled: open,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      product_id: "p-1",
      yield_quantity: 100,
      yield_unit_id: "u-kg",
      instructions: "",
      is_active: true,
      items: [
        { raw_material_id: "rm-1", quantity: 60, unit_id: "u-kg", notes: "" },
        { raw_material_id: "rm-2", quantity: 35, unit_id: "u-kg", notes: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchYield = form.watch("yield_quantity") || 1;
  const watchItems = form.watch("items") || [];

  const calculatedTotalCost = watchItems.reduce((acc, current) => {
    const raw = rawMaterials.find((r) => r.id === current.raw_material_id);
    const price = Number(raw?.purchase_price) || 0;
    return acc + (Number(current.quantity) || 0) * price;
  }, 0);

  const costPerKg = watchYield > 0 ? calculatedTotalCost / watchYield : 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const selectedProduct = products.find((p) => p.id === values.product_id);
      const { createStoredRecipe, isRealSupabaseConfigured } = await import("@/lib/mock-data");

      createStoredRecipe({
        name: values.name,
        product_id: values.product_id,
        version: "v1.0",
        yield_quantity: values.yield_quantity,
        yield_unit_id: values.yield_unit_id,
        status: "ACTIVE",
        is_active: values.is_active,
        instructions: values.instructions,
        product: { name: selectedProduct?.name || "Mahsulot" },
        items: values.items,
      });

      if (isRealSupabaseConfigured()) {
        try {
          const { data: recipe } = await supabase
            .from("recipes")
            .insert({
              name: values.name,
              product_id: values.product_id,
              yield_quantity: values.yield_quantity,
              yield_unit_id: values.yield_unit_id,
              instructions: values.instructions,
              is_active: values.is_active,
              status: "ACTIVE",
            })
            .select()
            .single();

          if (recipe) {
            const recipeItems = values.items.map((it) => ({
              recipe_id: recipe.id,
              raw_material_id: it.raw_material_id,
              quantity: it.quantity,
              unit_id: it.unit_id,
              notes: it.notes,
            }));
            await supabase.from("recipe_items").insert(recipeItems);
          }
        } catch {
          // Fallback
        }
      }

      toast.success("Retsept muvaffaqiyatli saqlandi!");
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Yangi Retsept Qo&apos;shish
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Retsept Nomi *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masalan: Klassik Samarqand Standart"
                        className="h-11 rounded-2xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Mahsulot *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-2xl">
                          <SelectValue placeholder="Mahsulotni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="yield_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Chiqish Miqdori (kg) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" className="h-11 rounded-2xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3.5 border rounded-2xl mt-4">
                    <div>
                      <FormLabel className="text-xs font-bold">Faol Holat</FormLabel>
                      <p className="text-[11px] text-gray-400">Asosiy retsept sifatida ishlatish</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Ingredients block */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Xomashyolar Tarkibi
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      raw_material_id: rawMaterials[0]?.id || "rm-1",
                      quantity: 1,
                      unit_id: "u-kg",
                      notes: "",
                    })
                  }
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Xomashyo qo&apos;shish
                </Button>
              </div>

              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex-1 w-full">
                      <FormField
                        control={form.control}
                        name={`items.${index}.raw_material_id`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <Select onValueChange={itemField.onChange} value={itemField.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-xl">
                                  <SelectValue placeholder="Xomashyo tanlang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                {rawMaterials.map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.name} ({formatCurrency(Number(r.purchase_price))})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-full sm:w-28">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: qtyField }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Kg"
                                className="h-10 rounded-xl"
                                {...qtyField}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-xl"
                      aria-label="Ingredientni o'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800/40 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
                <Calculator className="h-5 w-5" />
                <div>
                  <span className="font-semibold">Tannarx kalkulyatsiyasi:</span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Jami material: {formatCurrency(calculatedTotalCost)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400">1 kg mahsulot tannarxi:</span>
                <div className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  {formatCurrency(costPerKg)}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Tayyorlash Yo&apos;riqnomasi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tayyorlash bosqichlari, harorat va aralashtirish vaqti..."
                      className="rounded-2xl"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Saqlanmoqda..." : "Retseptni Saqlash"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}