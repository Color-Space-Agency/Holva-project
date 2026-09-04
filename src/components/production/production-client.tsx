"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isRealSupabaseConfigured } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductionBatchFormDialog } from "./production-batch-form-dialog";
import { ProductionBatchDetail } from "./production-batch-detail";
import { formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Plus, Play, CheckCircle2, XCircle, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createAuditLog } from "@/lib/audit";

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id?: string;
  recipe_id?: string;
  planned_quantity: number;
  actual_quantity: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  production_date: string;
  product?: { name: string };
  recipe?: { version?: string; name?: string };
  unit?: { short_name: string };
}

const DEFAULT_PRODUCTION_BATCHES: ProductionBatch[] = [];

const STORAGE_KEY = "holva_crm_stored_production_batches";

function getStoredBatches(): ProductionBatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveStoredBatches(items: ProductionBatch[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function ProductionClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewBatch, setViewBatch] = useState<any>(null);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localBatches, setLocalBatches] = useState<ProductionBatch[]>([]);

  const [editFormData, setEditFormData] = useState({
    product_name: "",
    planned_quantity: "",
    actual_quantity: "",
    production_date: "",
    status: "PLANNED" as ProductionBatch["status"],
  });

  useEffect(() => {
    setLocalBatches(getStoredBatches());
  }, []);

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["production_batches", localBatches],
    queryFn: async () => {
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
          if (data && data.length > 0) return data as ProductionBatch[];
        } catch {
          // Fallback
        }
      }

      return localBatches;
    },
  });

  const updateStatus = (id: string, status: ProductionBatch["status"]) => {
    const updated = localBatches.map((b) => (b.id === id ? { ...b, status } : b));
    setLocalBatches(updated);
    saveStoredBatches(updated);
    queryClient.invalidateQueries({ queryKey: ["production_batches"] });
    toast.success("Partiya holati yangilandi");

    try {
      supabase.from("production_batches").update({ status }).eq("id", id).then(() => {});
      createAuditLog({ action: "UPDATE", tableName: "production_batches", recordId: id, newValues: { status } });
    } catch {}
  };

  const handleOpenEdit = (batch: ProductionBatch) => {
    setEditingBatch(batch);
    setEditFormData({
      product_name: batch.product?.name || "Kunjutli Premium Holva",
      planned_quantity: String(batch.planned_quantity),
      actual_quantity: String(batch.actual_quantity || 0),
      production_date: batch.production_date,
      status: batch.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;

    const updated = localBatches.map((b) =>
      b.id === editingBatch.id
        ? {
            ...b,
            product: { name: editFormData.product_name },
            planned_quantity: Number(editFormData.planned_quantity) || 0,
            actual_quantity: Number(editFormData.actual_quantity) || 0,
            production_date: editFormData.production_date,
            status: editFormData.status,
          }
        : b
    );

    setLocalBatches(updated);
    saveStoredBatches(updated);
    queryClient.invalidateQueries({ queryKey: ["production_batches"] });
    setIsEditOpen(false);
    setEditingBatch(null);
    toast.success("Partiya tahrirlandi");
  };

  const handleDelete = (id: string) => {
    const updated = localBatches.filter((b) => b.id !== id);
    setLocalBatches(updated);
    saveStoredBatches(updated);
    queryClient.invalidateQueries({ queryKey: ["production_batches"] });
    toast.success("Partiya o'chirib yuborildi");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PLANNED":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Rejalashtirilgan</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Jarayonda</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-600 text-white">Yakunlangan</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Bekor qilingan</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi partiya
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="font-semibold">Partiya №</TableHead>
              <TableHead className="font-semibold">Sana</TableHead>
              <TableHead className="font-semibold">Mahsulot</TableHead>
              <TableHead className="font-semibold">Retsept</TableHead>
              <TableHead className="text-right font-semibold">Reja miqdor</TableHead>
              <TableHead className="font-semibold">Holat</TableHead>
              <TableHead className="text-right font-semibold">Amallar</TableHead>
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
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Ishlab chiqarish partiyalari mavjud emas
                </TableCell>
              </TableRow>
            ) : (
              batches?.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <TableCell className="font-mono font-semibold text-violet-600 text-xs">{batch.batch_number}</TableCell>
                  <TableCell className="text-xs text-gray-500">{batch.production_date}</TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{batch.product?.name || "Nomsiz mahsulot"}</TableCell>
                  <TableCell className="text-xs text-gray-500">{batch.recipe?.name || `Retsept ${batch.recipe?.version || 'v1.0'}`}</TableCell>
                  <TableCell className="text-right font-bold text-gray-900 dark:text-white text-sm">
                    {formatNumber(batch.planned_quantity)} {batch.unit?.short_name || "kg"}
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewBatch(batch)} title="Ko'rish" className="h-8 w-8 text-gray-500 hover:text-gray-900 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {batch.status === "PLANNED" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(batch.id, "IN_PROGRESS")} title="Boshlash" className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => updateStatus(batch.id, "CANCELLED")} title="Bekor qilish" className="h-8 w-8 text-amber-500 hover:bg-amber-50 rounded-lg">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(batch)} title="Tahrirlash" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon" onClick={() => handleDelete(batch.id)} title="O'chirish" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductionBatchFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) {
            setLocalBatches(getStoredBatches());
            queryClient.invalidateQueries({ queryKey: ["production_batches"] });
          }
        }}
      />
      
      {viewBatch && (
        <ProductionBatchDetail 
          batch={viewBatch} 
          open={!!viewBatch} 
          onOpenChange={(o) => !o && setViewBatch(null)} 
        />
      )}

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Partiyani Tahrirlash</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Mahsulot nomi *</label>
              <Input
                value={editFormData.product_name}
                onChange={(e) => setEditFormData({ ...editFormData, product_name: e.target.value })}
                required
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Rejalashtirilgan hajm *</label>
                <Input
                  type="number"
                  value={editFormData.planned_quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, planned_quantity: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Amaldagi hajm</label>
                <Input
                  type="number"
                  value={editFormData.actual_quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, actual_quantity: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Ishlab chiqarish sanasi</label>
                <Input
                  type="date"
                  value={editFormData.production_date}
                  onChange={(e) => setEditFormData({ ...editFormData, production_date: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Holat</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="PLANNED">Rejalashtirilgan</option>
                  <option value="IN_PROGRESS">Jarayonda</option>
                  <option value="COMPLETED">Yakunlangan</option>
                  <option value="CANCELLED">Bekor qilingan</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">
                Bekor qilish
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl">
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}