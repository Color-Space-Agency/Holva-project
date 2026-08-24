"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Plus, Search, Boxes, Edit2, Trash2, FolderPlus } from "lucide-react"
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
  { id: "c-1", name: "Premium Holvalar", description: "Oq kunjut va bodomli elita holvalar", product_count: 5 },
  { id: "c-2", name: "Shokoladli Holvalar", description: "Belgiya shokoladi bilan boyitilgan assorti", product_count: 3 },
  { id: "c-3", name: "Samarqand Qandolat", description: "An'anaviy xandon pistali Samarqand retsepti", product_count: 4 },
  { id: "c-4", name: "Klassik Kungaboqar", description: "Ommabop kundalik kungaboqar holvalari", product_count: 6 },
  { id: "c-5", name: "Dietik & Shakarsiz", description: "Asal va fruktoza asosidagi tabiiy mahsulotlar", product_count: 2 },
]

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const newCat: Category = {
      id: `c-${Date.now()}`,
      name,
      description: desc,
      product_count: 0,
    }
    setCategories([newCat, ...categories])
    setName("")
    setDesc("")
    setIsOpen(false)
    toast.success("Kategoriya muvaffaqiyatli qo'shildi")
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
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
        {filtered.map((cat) => (
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
                {cat.product_count} ta mahsulot
              </Badge>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-gray-800/60">
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
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Yangi kategoriya qo&apos;shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
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
