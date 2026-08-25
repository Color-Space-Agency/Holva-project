"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/shared/delete-confirm-dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EmployeesClient() {
  const supabase = createClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ["employees", statusFilter],
    queryFn: async () => {
      const { isRealSupabaseConfigured } = await import("@/lib/mock-data");
      if (isRealSupabaseConfigured()) {
        try {
          let query = supabase
            .from("employees")
            .select(`
              *,
              department:departments(name),
              position:positions(name)
            `)
            .is("deleted_at", null)
            .order("full_name", { ascending: true });

          if (statusFilter !== "ALL") {
            query = query.eq("employment_status", statusFilter);
          }

          const { data, error } = await query;
          if (data && data.length > 0) return data as any[];
        } catch {
          // Fallback
        }
      }

      const { getStoredEmployees } = await import("@/lib/mock-data");
      const stored = getStoredEmployees();
      const mapped = stored.map((e) => ({
        id: e.id,
        full_name: e.full_name,
        phone: e.phone,
        department: { name: e.department },
        position: { name: e.position },
        employment_status: e.employment_status,
        salary_type: e.salary_type,
        salary_amount: e.salary_amount,
        photo_url: e.photo_url,
      }));

      if (statusFilter !== "ALL") {
        return mapped.filter((e) => e.employment_status === statusFilter);
      }
      return mapped;
    },
  });

  const filteredEmployees = employees?.filter((emp) =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { deleteStoredEmployee, isRealSupabaseConfigured } = await import("@/lib/mock-data");
      deleteStoredEmployee(deletingId);

      if (isRealSupabaseConfigured()) {
        try {
          await supabase
            .from("employees")
            .update({ deleted_at: new Date().toISOString(), employment_status: "TERMINATED" })
            .eq("id", deletingId);
        } catch {}
      }

      toast.success("Xodim muvaffaqiyatli o'chirildi!");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Xodimni o'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Xodimlarni qidirish..."
              className="pl-8 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="Holati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barcha holatlar</SelectItem>
              <SelectItem value="ACTIVE">Faol</SelectItem>
              <SelectItem value="ON_LEAVE">Ta&apos;tilda</SelectItem>
              <SelectItem value="TERMINATED">Bo&apos;shatilgan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }} className="rounded-xl bg-violet-600 hover:bg-violet-700 font-bold">
          <Plus className="mr-2 h-4 w-4" /> Yangi xodim qo&apos;shish
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredEmployees?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hech qanday xodim topilmadi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-bold">
                <tr>
                  <th className="px-4 py-3.5">Xodim</th>
                  <th className="px-4 py-3.5">Bo&apos;lim</th>
                  <th className="px-4 py-3.5">Lavozim</th>
                  <th className="px-4 py-3.5">Holati</th>
                  <th className="px-4 py-3.5">Ish haqi</th>
                  <th className="px-4 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredEmployees?.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={emp.photo_url || ""} />
                          <AvatarFallback className="bg-violet-100 text-violet-700 font-bold">{emp.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{emp.full_name}</p>
                          <p className="text-xs text-gray-400">{emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{emp.department?.name || "-"}</td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{emp.position?.name || "-"}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={emp.employment_status === "ACTIVE" ? "default" : "secondary"} className={emp.employment_status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200" : ""}>
                        {emp.employment_status === "ACTIVE" ? "Faol" : emp.employment_status === "ON_LEAVE" ? "Ta'tilda" : "Bo'shatilgan"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(emp.salary_amount)} <span className="text-xs text-gray-400 font-normal">/{emp.salary_type === "MONTHLY" ? "oy" : "soat"}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-gray-800" onClick={() => { setEditingEmployee(emp); setIsFormOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" onClick={() => setDeletingId(emp.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        employee={editingEmployee} 
        onSuccess={() => refetch()} 
      />

      <DeleteConfirmDialog 
        open={!!deletingId} 
        onOpenChange={(v) => !v && setDeletingId(null)} 
        onConfirm={handleDelete} 
        title="Xodimni o'chirish" 
        description="Ushbu xodimni ro'yxatdan o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi." 
      />
    </div>
  );
}
