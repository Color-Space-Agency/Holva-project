"use client"

import { useState } from "react"
import { Truck, Plus, Search, Phone, MapPin, Mail, Trash2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  address: string
  materials: string[]
  status: "ACTIVE" | "INACTIVE"
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Agro Import MCHJ",
    contact_person: "Olimjon Rahmonov",
    phone: "+998 90 333 44 55",
    address: "Toshkent sh., Sergeli sanoat zonasi",
    materials: ["Kunjut", "Kungaboqar mag'zi"],
    status: "ACTIVE",
  },
  {
    id: "sup-2",
    name: "Xorazm Shakar Zavodi",
    contact_person: "Mansur Boboyev",
    phone: "+998 93 456 78 90",
    address: "Xorazm viloyati, Xonqa tumani",
    materials: ["Shakar 1-nav"],
    status: "ACTIVE",
  },
  {
    id: "sup-3",
    name: "Choco Trade MCHJ",
    contact_person: "Nodir Akramov",
    phone: "+998 97 123 00 11",
    address: "Toshkent sh., Yakkasaroy tumani",
    materials: ["Kakao kukuni", "Shokolad glazuri"],
    status: "ACTIVE",
  },
  {
    id: "sup-4",
    name: "Samarqand Yong'oq Savdo",
    contact_person: "Ilhom aka",
    phone: "+998 91 888 99 00",
    address: "Samarqand sh., Ulug'bek ko'chasi",
    materials: ["Xandon pista", "Bodom mag'zi", "Yong'oq"],
    status: "ACTIVE",
  },
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    address: "",
    materials: "",
  })

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: formData.name,
      contact_person: formData.contact_person,
      phone: formData.phone,
      address: formData.address,
      materials: formData.materials.split(",").map((m) => m.trim()).filter(Boolean),
      status: "ACTIVE",
    }

    setSuppliers([newSupplier, ...suppliers])
    setFormData({ name: "", contact_person: "", phone: "", address: "", materials: "" })
    setIsOpen(false)
    toast.success("Ta'minotchi muvaffaqiyatli qo'shildi")
  }

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id))
    toast.success("Ta'minotchi o'chirildi")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="h-7 w-7 text-violet-600" />
            Xomashyo Ta&apos;minotchilari
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Xomashyo yetkazib beruvchi korxonalar va hamkorlar bazasi
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Yangi ta&apos;minotchi
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki mas'ul shaxs bo'yicha qidirish..."
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map((sup) => (
          <div
            key={sup.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">{sup.name}</h3>
                  <p className="text-xs text-gray-500">{sup.contact_person}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
                Faol hamkor
              </Badge>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <span>{sup.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span>{sup.address}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {sup.materials.map((m, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                    {m}
                  </span>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(sup.id)}
                className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg gap-1"
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
            <DialogTitle>Yangi ta&apos;minotchi qo&apos;shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Kompaniya nomi *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Agro Standart MCHJ"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Mas&apos;ul shaxs</label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Alisher Zokirov"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Telefon raqam</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Manzil</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Toshkent sh., Bektemir tumani"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Yetkazib beradigan xomashyolari (vergul bilan)</label>
              <Input
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="Kunjut, Shakar, Qiyom"
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
