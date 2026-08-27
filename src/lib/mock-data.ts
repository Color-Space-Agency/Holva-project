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
  items_count?: number
}

export interface MockEmployee {
  id: string
  full_name: string
  phone: string
  department: string
  position: string
  salary_amount: number
  salary_type: string
  employment_status: "ACTIVE" | "ON_LEAVE" | "TERMINATED"
  photo_url: string
}

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: "p-1",
    name: "Kunjutli Premium Holva (500g)",
    sku: "HLV-KNJ-500",
    category: "Premium",
    price: 38000,
    cost_price: 22000,
    unit: "dona",
    stock: 145,
    min_stock: 30,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
    description: "Tabiiy oq kunjut va asal qiyomidan tayyorlangan klassik qandolat durdonasi.",
  },
  {
    id: "p-2",
    name: "Shokoladli Yong'oqli Holva (400g)",
    sku: "HLV-SHOK-400",
    category: "Shokoladli",
    price: 45000,
    cost_price: 27000,
    unit: "dona",
    stock: 84,
    min_stock: 25,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=600&q=80",
    description: "Belgiya kakao kukuni va maydalangan bodom mag'izi bilan to'yintirilgan shokoladli holva.",
  },
  {
    id: "p-3",
    name: "Pista Mag'izli Samarqand Holvasi (1kg)",
    sku: "HLV-PST-1000",
    category: "Samarqand",
    price: 95000,
    cost_price: 58000,
    unit: "dona",
    stock: 42,
    min_stock: 15,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    description: "Eron xandon pistasi va tabiiy sariyog' qo'shib pishirilgan maxsus Samarqand holvasi.",
  },
  {
    id: "p-4",
    name: "Kungaboqar Klassik Holvasi (350g)",
    sku: "HLV-KNG-350",
    category: "Klassik",
    price: 18000,
    cost_price: 11000,
    unit: "dona",
    stock: 320,
    min_stock: 50,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Qovurilgan kungaboqar mag'izidan tayyorlangan an'anaviy hamyonbop xalqona holva.",
  },
  {
    id: "p-5",
    name: "Bodomli Qandolat Holvasi (500g)",
    sku: "HLV-BDM-500",
    category: "Premium",
    price: 60000,
    cost_price: 36000,
    unit: "dona",
    stock: 65,
    min_stock: 20,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
    description: "Saralangan mayin bodom uni va tabiiy vanil aromatli nozik qandolat mahsuloti.",
  },
  {
    id: "p-6",
    name: "Kakao-Kunjutli Marmar Holva (450g)",
    sku: "HLV-MRM-450",
    category: "Shokoladli",
    price: 42000,
    cost_price: 25000,
    unit: "dona",
    stock: 110,
    min_stock: 30,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    description: "Oq kunjut va quyuq shokoladli qatlamlarning uyg'unlashgan marmar naqshli ko'rinishi.",
  },
]

export const INITIAL_RAW_MATERIALS: MockRawMaterial[] = [
  {
    id: "rm-1",
    name: "Oq kunjut (tozalangan)",
    sku: "RM-KNJ-01",
    category: "Don va urug'lar",
    purchase_price: 28000,
    unit: "kg",
    current_stock: 450,
    minimum_stock: 100,
    supplier: "Agro Import MChJ",
  },
  {
    id: "rm-2",
    name: "Shakar kukuni (I-nav)",
    sku: "RM-SHK-02",
    category: "Shirinlik va qiyomlar",
    purchase_price: 13500,
    unit: "kg",
    current_stock: 800,
    minimum_stock: 200,
    supplier: "Shakar Savdo Bazasi",
  },
  {
    id: "rm-3",
    name: "Xandon pista mag'zi",
    sku: "RM-PST-03",
    category: "Yong'oqlar",
    purchase_price: 140000,
    unit: "kg",
    current_stock: 45,
    minimum_stock: 50, // Past qoldiq
    supplier: "Samarqand Yong'oq MChJ",
  },
  {
    id: "rm-4",
    name: "Tozalangan bodom mag'zi",
    sku: "RM-BDM-04",
    category: "Yong'oqlar",
    purchase_price: 98000,
    unit: "kg",
    current_stock: 90,
    minimum_stock: 30,
    supplier: "Samarqand Yong'oq MChJ",
  },
  {
    id: "rm-5",
    name: "Tabiiy Belgiya kakao kukuni",
    sku: "RM-KKO-05",
    category: "Qo'shimchalar",
    purchase_price: 65000,
    unit: "kg",
    current_stock: 60,
    minimum_stock: 25,
    supplier: "Choco Import Distribution",
  },
]

export const INITIAL_STORES: MockStore[] = [
  {
    id: "s-1",
    name: "Korzinka — Chilonzor",
    phone: "+998 71 140 14 14",
    address: "Toshkent sh., Chilonzor tumani, 9-mavze",
    contact_person: "Bobur Rahmonov",
    credit_limit: 50000000,
    current_balance: -8400000, // Qarzdorlik
    status: "ACTIVE",
  },
  {
    id: "s-2",
    name: "Makro Supermarket — Sergeli",
    phone: "+998 71 205 12 22",
    address: "Toshkent sh., Yangi Sergeli ko'chasi, 12",
    contact_person: "Dilshod Ergashev",
    credit_limit: 40000000,
    current_balance: 0,
    status: "ACTIVE",
  },
  {
    id: "s-3",
    name: "Havas Diskaunter — Qo'yliq",
    phone: "+998 71 200 00 07",
    address: "Toshkent sh., Farg'ona yo'li, 45",
    contact_person: "Azizbek Karimov",
    credit_limit: 30000000,
    current_balance: -3200000, // Qarzdorlik
    status: "ACTIVE",
  },
  {
    id: "s-4",
    name: "Baraka Qandolat Do'koni",
    phone: "+998 90 987 65 43",
    address: "Samarqand sh., Registon ko'chasi, 88",
    contact_person: "Olimjon Toirov",
    credit_limit: 15000000,
    current_balance: -2600000, // Qarzdorlik
    status: "ACTIVE",
  },
  {
    id: "s-5",
    name: "Shirin Dunyo Savdo Markazi",
    phone: "+998 93 555 44 33",
    address: "Farg'ona sh., Al-Farg'oniy ko'chasi, 104",
    contact_person: "Zokirjon Madumarov",
    credit_limit: 20000000,
    current_balance: 1500000,
    status: "ACTIVE",
  },
]

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: "ord-1",
    order_number: "HLV-2026-00104",
    store_name: "Korzinka — Chilonzor",
    agent_name: "Sardor Rahimov",
    total_amount: 14800000,
    paid_amount: 6400000,
    status: "DELIVERED",
    payment_status: "PARTIAL",
    created_at: new Date().toISOString(),
  },
  {
    id: "ord-2",
    order_number: "HLV-2026-00105",
    store_name: "Makro Supermarket — Sergeli",
    agent_name: "Jamshid Qodirov",
    total_amount: 9200000,
    paid_amount: 9200000,
    status: "CONFIRMED",
    payment_status: "PAID",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "ord-3",
    order_number: "HLV-2026-00106",
    store_name: "Havas Diskaunter — Qo'yliq",
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

export const INITIAL_EMPLOYEES: MockEmployee[] = [
  {
    id: "emp-1",
    full_name: "Rustam Mahmudov",
    phone: "+998 90 123 45 67",
    department: "Ishlab chiqarish (Tsex)",
    position: "Bosh texnolog",
    employment_status: "ACTIVE",
    salary_type: "MONTHLY",
    salary_amount: 9500000,
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "emp-2",
    full_name: "Sardor Rahimov",
    phone: "+998 93 345 67 89",
    department: "Sotuv va Logistika",
    position: "Katta savdo agenti",
    employment_status: "ACTIVE",
    salary_type: "PERFORMANCE",
    salary_amount: 5000000,
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "emp-3",
    full_name: "Jamshid Qodirov",
    phone: "+998 94 456 78 90",
    department: "Sotuv va Logistika",
    position: "Sotuv agenti",
    employment_status: "ACTIVE",
    salary_type: "PERFORMANCE",
    salary_amount: 4500000,
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "emp-4",
    full_name: "Nodira Karimova",
    phone: "+998 97 789 01 23",
    department: "Moliya va Buxgalteriya",
    position: "Bosh hisobchi",
    employment_status: "ACTIVE",
    salary_type: "MONTHLY",
    salary_amount: 8000000,
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "emp-5",
    full_name: "Shavkat Ergashev",
    phone: "+998 91 890 12 34",
    department: "Sotuv va Logistika",
    position: "Haydovchi-yetkazuvchi",
    employment_status: "ACTIVE",
    salary_type: "MONTHLY",
    salary_amount: 5500000,
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
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

// ==========================================
// MAHSULOTLAR UCHUN LOCALSTORAGE PERSISTENCE
// ==========================================
const STORAGE_KEY_PRODUCTS = "holva_crm_stored_products"

export function getStoredProducts(): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error("Error reading stored products:", e)
  }
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

// ==========================================
// XODIMLAR UCHUN LOCALSTORAGE PERSISTENCE
// ==========================================
const STORAGE_KEY_EMPLOYEES = "holva_crm_stored_employees"

export function getStoredEmployees(): MockEmployee[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error("Error reading stored employees:", e)
  }
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES))
  } catch {}
  return INITIAL_EMPLOYEES
}

export function saveStoredEmployee(updated: Partial<MockEmployee> & { id: string }): MockEmployee[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES
  const list = getStoredEmployees()
  const updatedList = list.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

export function createStoredEmployee(newItem: Omit<MockEmployee, "id"> & { id?: string }): MockEmployee[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES
  const list = getStoredEmployees()
  const emp: MockEmployee = {
    ...newItem,
    id: newItem.id || `emp-${Date.now()}`,
  }
  const updatedList = [emp, ...list]
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

export function deleteStoredEmployee(id: string): MockEmployee[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES
  const list = getStoredEmployees()
  const updatedList = list.filter((item) => item.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updatedList))
  } catch {}
  return updatedList
}

// ==========================================
// TASHRIFLAR (VISITS) LOCALSTORAGE PERSISTENCE
// ==========================================
export interface MockVisit {
  id: string
  store_name: string
  address: string
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED"
  start_time: string
  duration: string
  notes: string
}

export const INITIAL_VISITS: MockVisit[] = [
  {
    id: "vis-1",
    store_name: "Korzinka — Chilonzor",
    address: "Toshkent sh., Chilonzor 9-mavze",
    status: "COMPLETED",
    start_time: "Bugun 10:15",
    duration: "25 daqiqa",
    notes: "Yangi 14.8 mln so'mlik buyurtma rasmiylashtirildi va vitrina tekshirildi",
  },
  {
    id: "vis-2",
    store_name: "Makro Supermarket — Sergeli",
    address: "Toshkent sh., Yangi Sergeli ko'chasi, 12",
    status: "COMPLETED",
    start_time: "Bugun 11:40",
    duration: "18 daqiqa",
    notes: "Qarzdorlik bo'yicha to'lov qabul qilindi, qoldiq holvalar yetarli",
  },
  {
    id: "vis-3",
    store_name: "Havas Discounter — Yunusobod",
    address: "Toshkent sh., Yunusobod 14-mavze",
    status: "IN_PROGRESS",
    start_time: "Bugun 14:00 (Jarayonda)",
    duration: "12 daqiqa",
    notes: "Menejer bilan yangi assortiment bo'yicha muzokara olib borilmoqda",
  },
  {
    id: "vis-4",
    store_name: "Baraka Qandolat Do'koni",
    address: "Samarqand sh., Registon ko'chasi, 88",
    status: "PLANNED",
    start_time: "Bugun 16:30 (Rejada)",
    duration: "—",
    notes: "Muddati o'tgan mahsulotlar tekshiruvi va yangi ta'mlar namoyishi",
  },
]

const STORAGE_KEY_VISITS = "holva_crm_stored_visits"
const STORAGE_KEY_COMPLETED_COUNT = "holva_crm_visits_completed_count"

export function getStoredVisits(): MockVisit[] {
  if (typeof window === "undefined") return INITIAL_VISITS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error("Error reading stored visits:", e)
  }
  try {
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(INITIAL_VISITS))
  } catch {}
  return INITIAL_VISITS
}

export function saveStoredVisits(visits: MockVisit[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits))
  } catch {}
}

export function completeStoredVisit(id: string): { visits: MockVisit[]; completedCount: number } {
  if (typeof window === "undefined") return { visits: INITIAL_VISITS, completedCount: 9 }
  const current = getStoredVisits()
  const updated = current.map((v) =>
    v.id === id ? { ...v, status: "COMPLETED" as const, duration: "25 daqiqa", start_time: v.start_time.replace(" (Jarayonda)", "").replace(" (Rejada)", "") } : v
  )
  saveStoredVisits(updated)

  // Completed count ni 1 ga oshiramiz
  const currentCount = getStoredCompletedVisitsCount()
  const newCount = Math.min(currentCount + 1, 12)
  setStoredCompletedVisitsCount(newCount)

  return { visits: updated, completedCount: newCount }
}

export function getStoredCompletedVisitsCount(): number {
  if (typeof window === "undefined") return 9
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_COUNT)
    if (raw) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed)) return parsed
    }
  } catch {}
  return 9
}

export function setStoredCompletedVisitsCount(count: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED_COUNT, String(count))
    window.dispatchEvent(new CustomEvent("visits-updated", { detail: { count } }))
  } catch {}
}

// ==========================================
// BUYURTMALAR (ORDERS) LOCALSTORAGE PERSISTENCE
// ==========================================
const STORAGE_KEY_ORDERS = "holva_crm_stored_orders"

export function getStoredOrders(): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error("Error reading stored orders:", e)
  }
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS))
  } catch {}
  return INITIAL_ORDERS
}

export function saveStoredOrders(orders: MockOrder[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
    window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orders } }))
  } catch {}
}

export async function syncOrdersFromServer(): Promise<MockOrder[]> {
  if (typeof window === "undefined") return INITIAL_ORDERS
  try {
    const res = await fetch("/api/sync/orders", { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(data.orders))
        window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orders: data.orders } }))
        return data.orders
      }
    }
  } catch (e) {
    console.error("syncOrdersFromServer error:", e)
  }
  return getStoredOrders()
}

export function recordStoredOrderPayment(orderId: string, amount: number): { orders: MockOrder[]; updatedOrder: MockOrder | null } {
  if (typeof window === "undefined") return { orders: INITIAL_ORDERS, updatedOrder: null }
  const currentOrders = getStoredOrders()
  let updatedOrder: MockOrder | null = null

  const updatedOrders: MockOrder[] = currentOrders.map((ord) => {
    if (ord.id === orderId || ord.order_number === orderId) {
      const currentPaid = ord.paid_amount || 0
      const newPaid = currentPaid + amount
      const isFull = newPaid >= ord.total_amount
      const newPaymentStatus: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" = isFull ? "PAID" : newPaid > 0 ? "PARTIAL" : "PENDING"
      
      const res: MockOrder = {
        ...ord,
        paid_amount: newPaid,
        payment_status: newPaymentStatus,
        status: isFull && ord.status === "CONFIRMED" ? "DELIVERED" : ord.status,
      }
      updatedOrder = res
      return res
    }
    return ord
  })

  saveStoredOrders(updatedOrders)

  // Serverga cross-device sync yuborish
  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pay", orderId, amount }),
    }).catch(() => {})
  } catch {}

  return { orders: updatedOrders, updatedOrder }
}

export function createStoredOrder(newOrder: MockOrder): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  const list = getStoredOrders()
  const updatedList = [newOrder, ...list]
  saveStoredOrders(updatedList)

  // Serverga cross-device sync yuborish
  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", order: newOrder }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function deleteStoredOrder(orderId: string): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  const list = getStoredOrders()
  const updatedList = list.filter((o) => o.id !== orderId && o.order_number !== orderId)
  saveStoredOrders(updatedList)

  // Serverga cross-device sync yuborish
  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", orderId }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

// ==========================================
// SINXRONLASHGAN REAL-TIME CHAT TIZIMI (HAR BIR AGENT UCHUN ALOHIDA)
// ==========================================
export interface RealtimeChatMessage {
  id: string
  agentId: string
  sender: "agent" | "admin"
  senderName: string
  text: string
  time: string
  timestamp: number
}

const STORAGE_KEY_CHAT = "holva_crm_chat_messages"

export const INITIAL_CHAT_MESSAGES: RealtimeChatMessage[] = [
  // 1. Sardor Rahimov bilan chat
  {
    id: "msg-s1",
    agentId: "sardor",
    sender: "admin",
    senderName: "Super Admin",
    text: "Assalomu alaykum Sardor! Bugungi buyurtmalar va do'konlar rejasi qanday ketyapti?",
    time: "08:30",
    timestamp: Date.now() - 3600000 * 3,
  },
  {
    id: "msg-s2",
    agentId: "sardor",
    sender: "agent",
    senderName: "Sardor Rahimov",
    text: "Va alaykum assalom! Hammasi a'lo, Korzinka va Makroga yangi partiya yetkazildi, to'lovlar ham qabul qilinmoqda.",
    time: "08:35",
    timestamp: Date.now() - 3600000 * 2.8,
  },
  {
    id: "msg-s3",
    agentId: "sardor",
    sender: "admin",
    senderName: "Super Admin",
    text: "Barakalla! Pista mag'izli va kunjutli holvalardan zaxira tayyorlab qo'ydik, xaridorlarga taklif qilsangiz bo'ladi.",
    time: "09:00",
    timestamp: Date.now() - 3600000 * 2,
  },

  // 2. Jasur Qodirov bilan chat
  {
    id: "msg-j1",
    agentId: "jasur",
    sender: "admin",
    senderName: "Super Admin",
    text: "Salom Jasur! Sergeli va Chilonzor hududidagi do'konlarda talab qanday?",
    time: "09:15",
    timestamp: Date.now() - 3600000 * 2.5,
  },
  {
    id: "msg-j2",
    agentId: "jasur",
    sender: "agent",
    senderName: "Jasur Qodirov",
    text: "Assalomu alaykum! Sergeli bo'yicha 5 ta yangi buyurtma oldim, shokoladli holvaga talab juda yuqori.",
    time: "09:20",
    timestamp: Date.now() - 3600000 * 2.2,
  },

  // 3. Alisher Vohidov bilan chat
  {
    id: "msg-a1",
    agentId: "alisher",
    sender: "admin",
    senderName: "Super Admin",
    text: "Assalomu alaykum Alisher! Viloyat yo'nalishidagi do'konlarga mahsulot yetkazish rejasini tasdiqlaymiz.",
    time: "10:00",
    timestamp: Date.now() - 3600000 * 1.5,
  },
  {
    id: "msg-a2",
    agentId: "alisher",
    sender: "agent",
    senderName: "Alisher Vohidov",
    text: "Rahmat! Samarqand va Jizzax yo'nalishida 10 ta do'kondan buyurtma shakllantirdim.",
    time: "10:05",
    timestamp: Date.now() - 3600000 * 1.2,
  },
]

export function getStoredChatMessages(agentId?: string): RealtimeChatMessage[] {
  if (typeof window === "undefined") {
    return agentId ? INITIAL_CHAT_MESSAGES.filter((m) => m.agentId === agentId) : INITIAL_CHAT_MESSAGES
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT)
    if (raw !== null) {
      const parsed: RealtimeChatMessage[] = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return agentId ? parsed.filter((m) => (m.agentId || "sardor") === agentId) : parsed
      }
    }
  } catch (e) {
    console.error("Error reading stored chat messages:", e)
  }
  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(INITIAL_CHAT_MESSAGES))
  } catch {}
  return agentId ? INITIAL_CHAT_MESSAGES.filter((m) => m.agentId === agentId) : INITIAL_CHAT_MESSAGES
}

export async function syncChatMessagesFromServer(agentId?: string): Promise<RealtimeChatMessage[]> {
  if (typeof window === "undefined") return INITIAL_CHAT_MESSAGES
  try {
    const url = agentId ? `/api/sync/chat?agentId=${encodeURIComponent(agentId)}` : `/api/sync/chat`
    const res = await fetch(url, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.allMessages)) {
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(data.allMessages))
        window.dispatchEvent(new CustomEvent("holva-chat-updated", { detail: { messages: data.allMessages, agentId } }))
        return agentId ? data.allMessages.filter((m: RealtimeChatMessage) => (m.agentId || "sardor") === agentId) : data.allMessages
      }
    }
  } catch (e) {
    console.error("syncChatMessagesFromServer error:", e)
  }
  return getStoredChatMessages(agentId)
}

export function sendStoredChatMessage(
  agentId: string,
  sender: "agent" | "admin",
  senderName: string,
  text: string
): RealtimeChatMessage[] {
  if (typeof window === "undefined") return INITIAL_CHAT_MESSAGES
  const allMessages = getStoredChatMessages() // barcha agentlar xabarlari
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  
  const newMsg: RealtimeChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    agentId,
    sender,
    senderName,
    text: text.trim(),
    time: timeStr,
    timestamp: Date.now(),
  }

  const updated = [...allMessages, newMsg]
  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("holva-chat-updated", { detail: { messages: updated, agentId } }))
  } catch {}

  // Serverga cross-device sync yuborish
  try {
    fetch("/api/sync/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, sender, senderName, text: text.trim() }),
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.allMessages)) {
          localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(data.allMessages))
        }
      }
    }).catch(() => {})
  } catch {}

  return updated
}

