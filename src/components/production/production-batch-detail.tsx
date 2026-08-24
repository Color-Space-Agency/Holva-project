"use client";

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
        .select(`*, raw_material:raw_materials(name), unit:units(short_name)`)
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
            reason: `Ishlab chiqarish: ${batch.batch_number}`,
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
          reason: `Ishlab chiqarish: ${batch.batch_number}`,
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
}