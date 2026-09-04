"use client";

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
      const { isRealSupabaseConfigured, getStoredRecipes } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("recipes")
            .select(`*, product:products(name)`)
            .order("created_at", { ascending: false });

          if (statusFilter !== "all") {
            query = query.eq("is_active", statusFilter === "active");
          }
          
          const { data, error } = await query;
          if (data && data.length > 0) {
            if (search) {
              return data.filter(r => 
                r.name.toLowerCase().includes(search.toLowerCase()) || 
                r.product?.name.toLowerCase().includes(search.toLowerCase())
              );
            }
            return data;
          }
        } catch {
          // Fallback
        }
      }

      const storedRecipes = getStoredRecipes();
      let res = storedRecipes;
      if (statusFilter !== "all") {
        res = res.filter(r => statusFilter === "active" ? r.is_active : !r.is_active);
      }
      if (search) {
        res = res.filter(r => 
          r.name.toLowerCase().includes(search.toLowerCase()) || 
          r.product?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res;
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active, product_id }: { id: string, is_active: boolean, product_id: string }) => {
      const { isRealSupabaseConfigured, getStoredRecipes, saveStoredRecipes } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          if (is_active) {
            await supabase.from("recipes").update({ is_active: false }).eq("product_id", product_id);
          }
          await supabase.from("recipes").update({ is_active }).eq("id", id);
          await createAuditLog({ action: "UPDATE", tableName: "recipes", recordId: id, newValues: { is_active } });
        } catch {}
      }
      const list = getStoredRecipes();
      const updated = list.map(r => {
        if (r.id === id) return { ...r, is_active };
        if (is_active && r.product_id === product_id) return { ...r, is_active: false };
        return r;
      });
      saveStoredRecipes(updated);
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
      const { isRealSupabaseConfigured, deleteStoredRecipe } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          await supabase.from("recipes").delete().eq("id", id);
          await createAuditLog({ action: "DELETE", tableName: "recipes", recordId: id });
        } catch {}
      }
      deleteStoredRecipe(id);
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
            <SelectValue placeholder="Holati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha holatlar</SelectItem>
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
              <TableHead>Chiqish hajmi</TableHead>
              <TableHead>Holati</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : recipes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Ma&apos;lumot topilmadi
                </TableCell>
              </TableRow>
            ) : (
              recipes?.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.name}</TableCell>
                  <TableCell>{recipe.product?.name}</TableCell>
                  <TableCell>{recipe.yield_quantity} kg</TableCell>
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
                      <Button variant="ghost" size="icon" asChild aria-label="Retseptni ko'rish">
                        <Link href={`/recipes/${recipe.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(recipe.id)} aria-label="Retseptni o'chirish">
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
}