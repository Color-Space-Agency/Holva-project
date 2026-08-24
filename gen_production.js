const fs = require('fs');
const path = require('path');

const files = {
  "src/app/(admin)/production/page.tsx": `import { ProductionClient } from "@/components/production/production-client";

export default function ProductionPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ishlab chiqarish</h2>
      </div>
      <ProductionClient />
    </div>
  );
}`,

  "src/components/production/production-client.tsx": `"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductionBatchFormDialog } from "./production-batch-form-dialog";
import { ProductionBatchDetail } from "./production-batch-detail";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Plus, Play, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/audit";

export function ProductionClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewBatch, setViewBatch] = useState<any>(null);

  const { data: batches, isLoading } = useQuery({
    queryKey: ["production_batches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("production_batches")
        .select(\`
          *,
          product:products(name),
          recipe:recipes(version),
          unit:units(short_name)
        \`)
        .order("created_at", { ascending: false });
      return data || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("production_batches").update({ status }).eq("id", id);
      if (error) throw error;
      await createAuditLog({ action: "UPDATE", tableName: "production_batches", recordId: id, newValues: { status } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_batches"] });
      toast.success("Holat yangilandi");
    },
    onError: (error: any) => toast.error(error.message)
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PLANNED": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Rejalashtirilgan</Badge>;
      case "IN_PROGRESS": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Jarayonda</Badge>;
      case "COMPLETED": return <Badge className="bg-green-500">Yakunlangan</Badge>;
      case "CANCELLED": return <Badge variant="destructive">Bekor qilingan</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Yangi partiya
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partiya №</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Mahsulot</TableHead>
              <TableHead>Retsept</TableHead>
              <TableHead className="text-right">Reja miqdor</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Harakatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                </TableRow>
              ))
            ) : batches?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Ma'lumot topilmadi</TableCell>
              </TableRow>
            ) : (
              batches?.map(batch => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.batch_number}</TableCell>
                  <TableCell>{new Date(batch.production_date).toLocaleDateString()}</TableCell>
                  <TableCell>{batch.product?.name}</TableCell>
                  <TableCell>v{batch.recipe?.version}</TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(batch.planned_quantity)} {batch.unit?.short_name}</TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewBatch(batch)} title="Ko'rish">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {batch.status === "PLANNED" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => updateStatusMutation.mutate({ id: batch.id, status: "IN_PROGRESS" })} title="Boshlash">
                            <Play className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => updateStatusMutation.mutate({ id: batch.id, status: "CANCELLED" })} title="Bekor qilish">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductionBatchFormDialog open={formOpen} onOpenChange={setFormOpen} />
      
      {viewBatch && (
        <ProductionBatchDetail 
          batch={viewBatch} 
          open={!!viewBatch} 
          onOpenChange={(o) => !o && setViewBatch(null)} 
        />
      )}
    </div>
  );
}`,

  "src/components/production/production-batch-form-dialog.tsx": `"use client";

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

  const { data: products } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name").eq("is_active", true);
      return data || [];
    }
  });

  const { data: recipes } = useQuery({
    queryKey: ["recipes-by-product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data } = await supabase.from("recipes").select("*").eq("product_id", productId);
      return data || [];
    },
    enabled: !!productId
  });

  const selectedRecipe = recipes?.find(r => r.id === recipeId);

  const { data: recipeItems } = useQuery({
    queryKey: ["recipe-items", recipeId],
    queryFn: async () => {
      if (!recipeId) return [];
      const { data } = await supabase
        .from("recipe_items")
        .select(\`*, raw_material:raw_materials(name), unit:units(short_name)\`)
        .eq("recipe_id", recipeId);
      return data || [];
    },
    enabled: !!recipeId
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory-materials"],
    queryFn: async () => {
      const { data } = await supabase.from("inventory").select("raw_material_id, current_stock, reserved_stock").not("raw_material_id", "is", null);
      return data || [];
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

      const batchNumber = \`BATCH-\${Date.now().toString().slice(-6)}\`;

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
                        <span className={\`w-32 text-right \${isEnough ? 'text-green-600' : 'text-destructive'}\`}>
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
}`,

  "src/components/production/production-batch-detail.tsx": `"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import { createAuditLog } from "@/lib/audit";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export function ProductionBatchDetail({ batch, open, onOpenChange }: { batch: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [actualQty, setActualQty] = useState(batch?.planned_quantity || 0);
  const [wasteQty, setWasteQty] = useState(0);

  const { data: consumptions } = useQuery({
    queryKey: ["batch-consumptions", batch?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("production_consumptions")
        .select(\`*, raw_material:raw_materials(name), unit:units(short_name)\`)
        .eq("batch_id", batch.id);
      return data || [];
    },
    enabled: !!batch
  });

  const [actualConsumptions, setActualConsumptions] = useState<Record<string, number>>({});

  const completeMutation = useMutation({
    mutationFn: async () => {
      // Complete batch
      const { error: batchError } = await supabase.from("production_batches").update({
        status: "COMPLETED",
        actual_quantity: actualQty,
        waste_quantity: wasteQty,
        end_date: new Date().toISOString()
      }).eq("id", batch.id);
      
      if (batchError) throw batchError;

      const { data: auth } = await supabase.auth.getUser();

      // For each consumption, update actual and deduct from inventory
      for (const cons of consumptions || []) {
        const actual = actualConsumptions[cons.id] ?? cons.planned_quantity;
        
        await supabase.from("production_consumptions").update({
          actual_quantity: actual
        }).eq("id", cons.id);

        // Deduct from inventory & remove from reserved
        // Simple strategy: find an inventory row with this material and deduct
        const { data: invs } = await supabase.from("inventory")
          .select("*")
          .eq("raw_material_id", cons.raw_material_id)
          .gt("current_stock", 0);
          
        if (invs && invs.length > 0) {
          const inv = invs[0];
          await supabase.from("inventory").update({
            current_stock: inv.current_stock - actual,
            reserved_stock: Math.max(0, (inv.reserved_stock || 0) - cons.planned_quantity) // release reservation
          }).eq("id", inv.id);

          // Add movement OUT
          await supabase.from("inventory_movements").insert({
            inventory_id: inv.id,
            movement_type: "OUT",
            quantity: actual,
            before_stock: inv.current_stock,
            after_stock: inv.current_stock - actual,
            reason: \`Ishlab chiqarish: \${batch.batch_number}\`,
            created_by: auth.user?.id
          });
        }
      }

      // Add finished product to inventory
      // Find default warehouse for finished goods (using first available or making one)
      const { data: warehouses } = await supabase.from("warehouses").select("id").limit(1);
      const wid = warehouses?.[0]?.id;
      
      if (wid) {
        // Upsert inventory for product
        const { data: prodInv } = await supabase.from("inventory")
          .select("*")
          .eq("product_id", batch.product_id)
          .eq("warehouse_id", wid)
          .maybeSingle();

        let invId = "";
        let before = 0;
        let after = actualQty;

        if (prodInv) {
          invId = prodInv.id;
          before = prodInv.current_stock;
          after = before + actualQty;
          await supabase.from("inventory").update({ current_stock: after }).eq("id", invId);
        } else {
          const { data: newInv } = await supabase.from("inventory").insert({
            product_id: batch.product_id,
            warehouse_id: wid,
            unit_id: batch.unit_id,
            current_stock: actualQty,
            minimum_stock: 0
          }).select().single();
          invId = newInv.id;
        }

        // Add movement IN
        await supabase.from("inventory_movements").insert({
          inventory_id: invId,
          movement_type: "IN",
          quantity: actualQty,
          before_stock: before,
          after_stock: after,
          reason: \`Ishlab chiqarish: \${batch.batch_number}\`,
          created_by: auth.user?.id
        });
      }

      await createAuditLog({ action: "UPDATE", tableName: "production_batches", recordId: batch.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production_batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Partiya muvaffaqiyatli yakunlandi");
      onOpenChange(false);
    },
    onError: (error: any) => toast.error(error.message)
  });

  if (!batch) return null;

  const isCompleted = batch.status === "COMPLETED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Partiya: {batch.batch_number}
            <Badge variant="outline">{batch.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Mahsulot</p>
            <p className="font-medium">{batch.product?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sana</p>
            <p className="font-medium">{new Date(batch.production_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reja miqdor</p>
            <p className="font-medium">{formatNumber(batch.planned_quantity)} {batch.unit?.short_name}</p>
          </div>
          {isCompleted && (
            <div>
              <p className="text-sm text-muted-foreground">Haqiqiy miqdor / Chiqindi</p>
              <p className="font-medium text-green-600">
                {formatNumber(batch.actual_quantity)} / {formatNumber(batch.waste_quantity)} {batch.unit?.short_name}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Xomashyo sarfi</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Xomashyo</TableHead>
                <TableHead className="text-right">Reja (norma)</TableHead>
                <TableHead className="text-right">Haqiqiy sarf</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumptions?.map(cons => (
                <TableRow key={cons.id}>
                  <TableCell>{cons.raw_material?.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(cons.planned_quantity)} {cons.unit?.short_name}</TableCell>
                  <TableCell className="text-right">
                    {batch.status === "IN_PROGRESS" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Input 
                          type="number" 
                          step="0.01" 
                          className="w-24 text-right" 
                          value={actualConsumptions[cons.id] ?? cons.planned_quantity}
                          onChange={(e) => setActualConsumptions({...actualConsumptions, [cons.id]: parseFloat(e.target.value) || 0})}
                        />
                        <span className="text-sm text-muted-foreground">{cons.unit?.short_name}</span>
                      </div>
                    ) : (
                      <span>{formatNumber(cons.actual_quantity || cons.planned_quantity)} {cons.unit?.short_name}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {batch.status === "IN_PROGRESS" && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Natijani kiritish</h3>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Haqiqiy ishlab chiqarilgan miqdor</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.01" value={actualQty} onChange={(e) => setActualQty(parseFloat(e.target.value) || 0)} />
                  <span className="text-sm text-muted-foreground">{batch.unit?.short_name}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Yaroqsiz / Chiqindi (brak)</p>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.01" value={wasteQty} onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)} />
                  <span className="text-sm text-muted-foreground">{batch.unit?.short_name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Partiyani yakunlash
              </Button>
            </div>
          </div>
        )}
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
