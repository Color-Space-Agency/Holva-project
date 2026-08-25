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

      const defaultEmployees = [
        {
          id: "emp-1",
          full_name: "Rustam Mahmudov",
          phone: "+998 90 123 45 67",
          department: { name: "Ishlab chiqarish (Tsex)" },
          position: { name: "Bosh texnolog" },
          employment_status: "ACTIVE",
          salary_type: "MONTHLY",
          salary_amount: 9500000,
          photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        },
        {
          id: "emp-2",
          full_name: "Sardor Rahimov",
          phone: "+998 93 345 67 89",
          department: { name: "Sotuv va Marketing" },
          position: { name: "Katta savdo agenti" },
          employment_status: "ACTIVE",
          salary_type: "PERFORMANCE",
          salary_amount: 5000000,
          photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        },
        {
          id: "emp-3",
          full_name: "Jamshid Qodirov",
          phone: "+998 94 456 78 90",
          department: { name: "Sotuv va Marketing" },
          position: { name: "Sotuv agenti" },
          employment_status: "ACTIVE",
          salary_type: "PERFORMANCE",
          salary_amount: 4500000,
          photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        },
        {
          id: "emp-4",
          full_name: "Nodira Karimova",
          phone: "+998 97 789 01 23",
          department: { name: "Buxgalteriya va Moliya" },
          position: { name: "Bosh hisobchi" },
          employment_status: "ACTIVE",
          salary_type: "MONTHLY",
          salary_amount: 8000000,
          photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
        },
        {
          id: "emp-5",
          full_name: "Shavkat Ergashev",
          phone: "+998 99 890 12 34",
          department: { name: "Logistika va Yetkazish" },
          position: { name: "Ekspeditor-haydovchi" },
          employment_status: "ACTIVE",
          salary_type: "MONTHLY",
          salary_amount: 5500000,
          photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        },
      ];

      if (statusFilter !== "ALL") {
        return defaultEmployees.filter((e) => e.employment_status === statusFilter);
      }
      return defaultEmployees;
    },
  });

  const filteredEmployees = employees?.filter((emp) =>
    emp.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from("employees")
        .update({ deleted_at: new Date().toISOString(), employment_status: "TERMINATED" })
        .eq("id", deletingId);

      if (error) throw error;
      toast.success("Employee deleted successfully");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete employee");
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
              placeholder="Search employees..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredEmployees?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees?.map((emp) => (
                  <tr key={emp.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={emp.photo_url || ""} />
                          <AvatarFallback>{emp.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.full_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{emp.department?.name || "-"}</td>
                    <td className="px-4 py-3">{emp.position?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={emp.employment_status === "ACTIVE" ? "default" : "secondary"}>
                        {emp.employment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(emp.salary_amount)} <span className="text-xs text-muted-foreground">/{emp.salary_type === "MONTHLY" ? "mo" : "hr"}</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingEmployee(emp); setIsFormOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingId(emp.id)}>
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
        title="Delete Employee" 
        description="Are you sure you want to remove this employee? This action cannot be undone." 
      />
    </div>
  );
}
