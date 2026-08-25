// Boy namunaviy ma'lumotlar va rasmlar (High-Quality Halva & Confectionery Photos)

export interface MockProduct {
  id: string
  name: string
  sku: string
  category: string
  price: number
  cost_price: number
  unit: string
  stock: number
  min_stock: number
  status: "ACTIVE" | "INACTIVE"
  image_url: string
  description?: string
}

export interface MockRawMaterial {
  id: string
  name: string
  sku: string
  category: string
  purchase_price: number
  unit: string
  current_stock: number
  minimum_stock: number
  supplier: string
}

export interface MockStore {
  id: string
  name: string
  phone: string
  address: string
  contact_person: string
  credit_limit: number
  current_balance: number
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
}

export interface MockOrder {
  id: string
  order_number: string
  store_name: string
  agent_name: string
  total_amount: number
  paid_amount: number
  status: "DRAFT" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERING" | "DELIVERED" | "CANCELLED"
  payment_status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE"
  created_at: string
}

export interface MockEmployee {
  id: string
  full_name: string
  phone: string
  department: string
  position: string
  salary_amount: number
  salary_type: string
  employment_status: "ACTIVE" | "INACTIVE" | "ON_LEAVE"
}

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: "p-1",
    name: "Kunjutli Premium Holva (500g)",
    sku: "HLV-KNJ-500",
    category: "Premium",
    price: 38000,
    cost_price: 24000,
    unit: "dona",
    stock: 420,
    min_stock: 100,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80",
    description: "Tabiiy oq kunjut va asal qiyomidan tayyorlangan klassik qandolat durdonasi",
  },
  {
    id: "p-2",
    name: "Shokoladli Yong'oqli Holva (400g)",
    sku: "HLV-SHOK-400",
    category: "Shokoladli",
    price: 45000,
    cost_price: 29000,
    unit: "dona",
    stock: 280,
    min_stock: 80,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
    description: "Belgiya kakaosi va maydalangan yong'oq bilan boyitilgan nozik shirinlik",
  },
  {
    id: "p-3",
    name: "Pista Mag'izli Samarqand Holvasi (1kg)",
    sku: "HLV-PST-1000",
    category: "Samarqand",
    price: 95000,
    cost_price: 62000,
    unit: "kg",
    stock: 65,
    min_stock: 50,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    description: "Maxsus qandolatchilik siri asosida xandon pista bilan tayyorlangan shohona holva",
  },
  {
    id: "p-4",
    name: "Kungaboqar Klassik Holvasi (350g)",
    sku: "HLV-KNG-350",
    category: "Klassik",
    price: 18000,
    cost_price: 11000,
    unit: "dona",
    stock: 850,
    min_stock: 200,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Tozalangan quyoshli kungaboqar mag'zidan an'anaviy xushbo'y retsept",
  },
  {
    id: "p-5",
    name: "Bodomli Qandolat Holvasi (500g)",
    sku: "HLV-BDM-500",
    category: "Premium",
    price: 60000,
    cost_price: 39000,
    unit: "dona",
    stock: 135,
    min_stock: 50,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    description: "Maydalangan shirin tog' bodomi va vanil xushbo'yligi",
  },
  {
    id: "p-6",
    name: "Kakao-Kunjutli Marmar Holva (450g)",
    sku: "HLV-MRM-450",
    category: "Shokoladli",
    price: 42000,
    cost_price: 27000,
    unit: "dona",
    stock: 310,
    min_stock: 60,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    description: "Oq kunjut va quyuq shokolad naqshlari uyg'unlashgan marmar holva",
  },
]

export const INITIAL_RAW_MATERIALS: MockRawMaterial[] = [
  {
    id: "rm-1",
    name: "Oq tozalangan Kunjut",
    sku: "RAW-KNJ-01",
    category: "Mag'izlar",
    purchase_price: 32000,
    unit: "kg",
    current_stock: 1450,
    minimum_stock: 300,
    supplier: "Agro Import MCHJ",
  },
  {
    id: "rm-2",
    name: "Shakar (1-nav)",
    sku: "RAW-SHK-01",
    category: "Qand",
    purchase_price: 9500,
    unit: "kg",
    current_stock: 3200,
    minimum_stock: 1000,
    supplier: "Xorazm Shakar",
  },
  {
    id: "rm-3",
    name: "Qiyom (Glyukoza siropi)",
    sku: "RAW-SIROP-01",
    category: "Qiyom",
    purchase_price: 14000,
    unit: "kg",
    current_stock: 800,
    minimum_stock: 250,
    supplier: "Toshkent Qandolat Xomashyo",
  },
  {
    id: "rm-4",
    name: "Kakao kukuni (Alkalizatsiyalangan)",
    sku: "RAW-KAK-01",
    category: "Qo'shimchalar",
    purchase_price: 68000,
    unit: "kg",
    current_stock: 180,
    minimum_stock: 100,
    supplier: "Choco Trade MCHJ",
  },
  {
    id: "rm-5",
    name: "Kungaboqar mag'zi (tozalangan)",
    sku: "RAW-KNG-01",
    category: "Mag'izlar",
    purchase_price: 18500,
    unit: "kg",
    current_stock: 2100,
    minimum_stock: 500,
    supplier: "Agro Yulduz",
  },
  {
    id: "rm-6",
    name: "Xandon pista (tozalangan)",
    sku: "RAW-PST-01",
    category: "Mag'izlar",
    purchase_price: 145000,
    unit: "kg",
    current_stock: 45,
    minimum_stock: 50,
    supplier: "Samarqand Yong'oq Savdo",
  },
]

export const INITIAL_STORES: MockStore[] = [
  {
    id: "st-1",
    name: "Korzinka — Chilonzor filiali",
    phone: "+998 71 140 14 14",
    address: "Toshkent sh., Chilonzor 9-mavze",
    contact_person: "Bobur Aliyev",
    credit_limit: 50000000,
    current_balance: -8400000,
    status: "ACTIVE",
  },
  {
    id: "st-2",
    name: "Makro Supermarket — Buyuk Ipak Yo'li",
    phone: "+998 71 205 12 25",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    contact_person: "Aziz Karimov",
    credit_limit: 40000000,
    current_balance: 0,
    status: "ACTIVE",
  },
  {
    id: "st-3",
    name: "Havas Discounter — Yunusobod",
    phone: "+998 71 200 00 20",
    address: "Toshkent sh., Yunusobod 14-mavze",
    contact_person: "Dilshod Saidov",
    credit_limit: 30000000,
    current_balance: -14200000,
    status: "ACTIVE",
  },
  {
    id: "st-4",
    name: "Baraka Qandolat Do'koni",
    phone: "+998 90 123 45 67",
    address: "Toshkent sh., Qo'yliq bozori 12-do'kon",
    contact_person: "Olim aka",
    credit_limit: 10000000,
    current_balance: -2100000,
    status: "ACTIVE",
  },
  {
    id: "st-5",
    name: "Shirin Dunyo Savdo Markazi",
    phone: "+998 93 987 65 43",
    address: "Samarqand sh., Registon ko'chasi 45",
    contact_person: "Mansur Jo'rayev",
    credit_limit: 25000000,
    current_balance: 3500000,
    status: "ACTIVE",
  },
]

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "ord-1",
    order_number: "HLV-2026-00104",
    store_name: "Korzinka — Chilonzor filiali",
    agent_name: "Sardor Rahimov",
    total_amount: 14800000,
    paid_amount: 6400000,
    status: "DELIVERED",
    payment_status: "PARTIAL",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "ord-2",
    order_number: "HLV-2026-00105",
    store_name: "Makro Supermarket — Buyuk Ipak Yo'li",
    agent_name: "Jamshid Qodirov",
    total_amount: 9200000,
    paid_amount: 9200000,
    status: "DELIVERED",
    payment_status: "PAID",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "ord-3",
    order_number: "HLV-2026-00106",
    store_name: "Havas Discounter — Yunusobod",
    agent_name: "Sardor Rahimov",
    total_amount: 21500000,
    paid_amount: 7300000,
    status: "DELIVERING",
    payment_status: "PARTIAL",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "ord-4",
    order_number: "HLV-2026-00107",
    store_name: "Baraka Qandolat Do'koni",
    agent_name: "Jamshid Qodirov",
    total_amount: 4600000,
    paid_amount: 0,
    status: "READY",
    payment_status: "PENDING",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: "ord-5",
    order_number: "HLV-2026-00108",
    store_name: "Shirin Dunyo Savdo Markazi",
    agent_name: "Sardor Rahimov",
    total_amount: 18400000,
    paid_amount: 18400000,
    status: "CONFIRMED",
    payment_status: "PAID",
    created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
  },
]

// Tezkor tekshirish helper: Haqiqiy Supabase bormi yoki yo'q?
export function isRealSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    key &&
    url.startsWith("https://") &&
    !url.includes("mock-") &&
    !url.includes("your_supabase") &&
    !url.includes("placeholder") &&
    key.length > 30
  )
}

// Brauzer localStorage'da mahsulotlarni saqlash va boshqarish
const STORAGE_KEY_PRODUCTS = "holva_crm_stored_products"

export function getStoredProducts(): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error("Error reading stored products:", e)
  }
  // Initialize storage
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
  } catch {}
  return INITIAL_PRODUCTS
}

export function saveStoredProduct(updated: Partial<MockProduct> & { id: string }): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  const list = getStoredProducts()
  const updatedList = list.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

export function createStoredProduct(newItem: Omit<MockProduct, "id"> & { id?: string }): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  const list = getStoredProducts()
  const product: MockProduct = {
    ...newItem,
    id: newItem.id || `p-${Date.now()}`,
  }
  const updatedList = [product, ...list]
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

export function deleteStoredProduct(id: string): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  const list = getStoredProducts()
  const updatedList = list.filter((item) => item.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

