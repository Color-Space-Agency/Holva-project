"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Search, Building, UserCheck, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Department {
  id: string
  name: string
  head: string
  employee_count: number
  description: string
}

const DEFAULT_DEPARTMENTS: Department[] = []

const STORAGE_KEY = "holva_crm_stored_departments"

function getStoredDepartments(): Department[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveDepartments(items: Department[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", head: "", description: "" })

  useEffect(() => {
    setDepartments(getStoredDepartments())
  }, [])

  const filtered = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.head.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    let updated: Department[]
    if (editingId) {
      updated = departments.map((d) =>
        d.id === editingId
          ? {
              ...d,
              name: formData.name,
              head: formData.head || "Belgilanmagan",
              description: formData.description,
            }
          : d
      )
      toast.success("Bo'lim tahrirlandi")
    } else {
      const newDep: Department = {
        id: `dep-${Date.now()}`,
        name: formData.name,
        head: formData.head || "Belgilanmagan",
        employee_count: 0,
        description: formData.description,
      }
      updated = [newDep, ...departments]
      toast.success("Bo'lim muvaffaqiyatli qo'shildi")
    }

    setDepartments(updated)
    saveDepartments(updated)
    setFormData({ name: "", head: "", description: "" })
    setEditingId(null)
    setIsOpen(false)
  }

  const handleEdit = (dep: Department) => {
    setEditingId(dep.id)
    setFormData({
      name: dep.name,
      head: dep.head,
      description: dep.description,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    const updated = departments.filter((d) => d.id !== id)
    setDepartments(updated)
    saveDepartments(updated)
    toast.success("Bo'lim o'chirildi")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="h-7 w-7 text-violet-600" />
            Fabrika Bo&apos;limlari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fabrika tuzilmasi, departamentlar va mas&apos;ul rahbarlar
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi bo&apos;lim
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Bo'lim yoki rahbar bo'yicha qidirish..."
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dep) => (
          <div
            key={dep.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">{dep.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{dep.description}</p>
              </div>
              <Badge variant="secondary" className="rounded-lg text-xs bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 whitespace-nowrap">
                {dep.employee_count} xodim
              </Badge>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400">Rahbar: <strong className="text-gray-700 dark:text-gray-300 font-medium">{dep.head}</strong></span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(dep)}
                  className="h-7 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-2 gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(dep.id)}
                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); if (!val) { setEditingId(null); setFormData({ name: "", head: "", description: "" }) } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Bo'limni tahrirlash" : "Yangi bo'lim ochish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Bo&apos;lim nomi *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masalan: Sifat Nazorati (Laboratoriya)"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Mas&apos;ul rahbar</label>
              <Input
                value={formData.head}
                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                placeholder="Ism Familiya"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tavsif</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bo'lim vazifalari"
                className="rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
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
  )
}
