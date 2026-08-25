"use client";

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

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["production_batches"],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          const { data } = await supabase
            .from("production_batches")
            .select(`
              *,
              product:products(name),
              recipe:recipes(version),
              unit:units(short_name)
            `)
            .order("created_at", { ascending: false });
          if (data && data.length > 0) return data;
        } catch {
          // Fallback
        }
      }

      return [
        {
          id: "batch-104",
          batch_number: "PRD-2026-00104",
          product_id: "p-1",
          recipe_id: "rec-1",
          planned_quantity: 800,
          actual_quantity: 800,
          status: "COMPLETED",
          production_date: "25.08.2026",
          product: { name: "Kunjutli Premium Holva (500g)" },
          recipe: { version: "v1.2" },
          unit: { short_name: "kg" },
        },
        {
          id: "batch-105",
          batch_number: "PRD-2026-00105",
          product_id: "p-2",
          recipe_id: "rec-2",
          planned_quantity: 500,
          actual_quantity: 0,
          status: "IN_PROGRESS",
          production_date: "25.08.2026",
          product: { name: "Shokoladli Yong'oqli Holva (400g)" },
          recipe: { version: "v1.0" },
          unit: { short_name: "kg" },
        },
        {
          id: "batch-106",
          batch_number: "PRD-2026-00106",
          product_id: "p-3",
          recipe_id: "rec-3",
          planned_quantity: 350,
          actual_quantity: 0,
          status: "PLANNED",
          production_date: "26.08.2026",
          product: { name: "Pista Mag'izli Samarqand Holvasi (1kg)" },
          recipe: { version: "v2.1" },
          unit: { short_name: "kg" },
        },
      ];
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
}