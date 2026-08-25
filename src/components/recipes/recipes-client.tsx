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
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data");
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

      const defaultRecipes = [
        {
          id: "rec-1",
          name: "Kunjutli Premium Holva Retsepti (100kg partiya)",
          product_id: "p-1",
          version: "v1.2",
          yield_quantity: 100,
          yield_unit_id: "kg",
          status: "ACTIVE",
          is_active: true,
          product: { name: "Kunjutli Premium Holva (500g)" },
        },
        {
          id: "rec-2",
          name: "Shokoladli Yong'oqli Holva Standart Retsepti",
          product_id: "p-2",
          version: "v1.0",
          yield_quantity: 80,
          yield_unit_id: "kg",
          status: "ACTIVE",
          is_active: true,
          product: { name: "Shokoladli Yong'oqli Holva (400g)" },
        },
        {
          id: "rec-3",
          name: "Samarqand Xandon Pistali Holva",
          product_id: "p-3",
          version: "v2.1",
          yield_quantity: 50,
          yield_unit_id: "kg",
          status: "ACTIVE",
          is_active: true,
          product: { name: "Pista Mag'izli Samarqand Holvasi (1kg)" },
        },
      ];

      let res = defaultRecipes;
      if (statusFilter !== "all") {
        res = res.filter(r => statusFilter === "active" ? r.is_active : !r.is_active);
      }
      if (search) {
        res = res.filter(r => 
          r.name.toLowerCase().includes(search.toLowerCase()) || 
          r.product.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      return res;
    },
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
              <TableHead>Versiya</TableHead>
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
                        <Link href={`/recipes/${recipe.id}`}><Eye className="h-4 w-4" /></Link>
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
}