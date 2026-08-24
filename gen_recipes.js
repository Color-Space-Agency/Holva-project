const fs = require('fs');
const path = require('path');

const files = {
  "src/app/(admin)/recipes/page.tsx": `import { RecipesClient } from "@/components/recipes/recipes-client";

export default function RecipesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Retseptlar</h2>
      </div>
      <RecipesClient />
    </div>
  );
}`,
  
  "src/components/recipes/recipes-client.tsx": `"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RecipeFormDialog } from "./recipe-form-dialog";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { createAuditLog } from "@/lib/audit";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Plus, Trash2, Copy } from "lucide-react";
import Link from "next/link";

export function RecipesClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes", search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("recipes")
        .select(\`*, product:products(name)\`)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (search) {
        return data.filter(r => 
          r.name.toLowerCase().includes(search.toLowerCase()) || 
          r.product?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return data;
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active, product_id }: { id: string, is_active: boolean, product_id: string }) => {
      // If setting to active, we might need to deactivate others for same product, but let's just toggle this one
      // based on instructions: "Setting is_active=true deactivates all other versions for same product" is handled in form, but for toggle:
      if (is_active) {
        await supabase.from("recipes").update({ is_active: false }).eq("product_id", product_id);
      }
      const { error } = await supabase.from("recipes").update({ is_active }).eq("id", id);
      if (error) throw error;
      await createAuditLog({ action: "UPDATE", tableName: "recipes", recordId: id, newValues: { is_active } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Status o'zgartirildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
      await createAuditLog({ action: "DELETE", tableName: "recipes", recordId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Retsept o'chirildi");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input 
          placeholder="Qidirish..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="active">Faol</SelectItem>
            <SelectItem value="inactive">Nofaol</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setFormOpen(true)} className="ml-auto">
          <Plus className="mr-2 h-4 w-4" /> Yangi retsept
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomi</TableHead>
              <TableHead>Mahsulot</TableHead>
              <TableHead>Versiya</TableHead>
              <TableHead>Chiqish hajmi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Harakatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : recipes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            ) : (
              recipes?.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.product?.name}</TableCell>
                  <TableCell>v{recipe.version}</TableCell>
                  <TableCell>{recipe.yield_quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={recipe.is_active} 
                        onCheckedChange={(c) => toggleActiveMutation.mutate({ id: recipe.id, is_active: c, product_id: recipe.product_id })}
                      />
                      <Badge variant={recipe.is_active ? "default" : "secondary"}>
                        {recipe.is_active ? "Faol" : "Nofaol"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={\`/recipes/\${recipe.id}\`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(recipe.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RecipeFormDialog open={formOpen} onOpenChange={setFormOpen} />
      
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Retseptni o'chirish"
        description="Haqiqatan ham bu retseptni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi."
      />
    </div>
  );
}`,
  
  "src/components/recipes/recipe-form-dialog.tsx": `"use client";

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
    resolver: zodResolver(formSchema),
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

        <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
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
                    <Select onValueChange={(v) => form.setValue(\`items.\${index}.raw_material_id\`, v)}>
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
                    <Input type="number" step="0.01" {...form.register(\`items.\${index}.quantity\`, { valueAsNumber: true })} />
                  </div>
                  <div className="w-32 space-y-1">
                    <Label className="text-xs">Birlik</Label>
                    <Select onValueChange={(v) => form.setValue(\`items.\${index}.unit_id\`, v)}>
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
}`
};

Object.entries(files).forEach(([filepath, content]) => {
  const fullPath = path.join(process.cwd(), filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filepath);
});
