"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Boxes, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  description?: string
  product_count?: number
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Klassik Holvalar", description: "An'anaviy resept bo'yicha holvalar", product_count: 5 },
  { id: "cat-2", name: "Premium Holvalar", description: "Oliy navli mahsulotlardan", product_count: 3 },
  { id: "cat-3", name: "Yong'oqli Holvalar", description: "Bodom va pista qo'shilgan", product_count: 4 },
  { id: "cat-4", name: "Shokoladli Holvalar", description: "Kakao va shokolad glazuri bilan", product_count: 2 },
]

const STORAGE_KEY = "holva_crm_stored_categories"

function getStoredCategories(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_CATEGORIES
}

function saveCategories(items: Category[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  useEffect(() => {
    setCategories(getStoredCategories())
  }, [])

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    let updated: Category[]
    if (editingId) {
      updated = categories.map((c) =>
        c.id === editingId ? { ...c, name, description: desc } : c
      )
      toast.success("Kategoriya tahrirlandi")
    } else {
      const newCat: Category = {
        id: `c-${Date.now()}`,
        name,
        description: desc,
        product_count: 0,
      }
      updated = [newCat, ...categories]
      toast.success("Kategoriya muvaffaqiyatli qo'shildi")
    }

    setCategories(updated)
    saveCategories(updated)
    setName("")
    setDesc("")
    setEditingId(null)
    setIsOpen(false)
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setDesc(cat.description || "")
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    const updated = categories.filter((c) => c.id !== id)
    setCategories(updated)
    saveCategories(updated)
    toast.success("Kategoriya o'chirildi")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-7 w-7 text-violet-600" />
            Mahsulot Kategoriyalari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Holva turlari va toifalarini boshqarish
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi kategoriya
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategoriya bo'yicha qidirish..."
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            Kategoriyalar mavjud emas
          </div>
        ) : (
          filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">{cat.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{cat.description || "Tavsif berilmagan"}</p>
                </div>
                <Badge variant="secondary" className="rounded-lg text-xs bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {cat.product_count || 0} ta mahsulot
                </Badge>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(cat)}
                  className="h-8 text-xs text-gray-600 hover:text-gray-900 rounded-lg gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Tahrirlash
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
                  className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> O&apos;chirish
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val)
          if (!val) {
            setEditingId(null)
            setName("")
            setDesc("")
          }
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Kategoriya nomi *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Maxsus Sovg'abop Holvalar"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tavsif</label>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Kategoriya haqida qisqacha ma'lumot"
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
