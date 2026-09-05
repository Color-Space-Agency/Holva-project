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
  initial_balance?: number
  status: "ACTIVE" | "INACTIVE" | "BLOCKED"
  created_at?: string
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
  updated_at?: string
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
    name: "Rulet 400 Gr",
    sku: "HLV-841",
    category: "Ruletlar",
    price: 25000,
    cost_price: 15000,
    unit: "dona",
    stock: 100,
    min_stock: 20,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80",
    description: "Yumshoq va shirin qaymoqli rulet holva",
  },
  {
    id: "p-2",
    name: "Klassik Holva",
    sku: "HLV-842",
    category: "Klassik",
    price: 25000,
    cost_price: 14000,
    unit: "dona",
    stock: 150,
    min_stock: 30,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500&q=80",
    description: "An'anaviy usulda tayyorlangan qadimiy klassik holva",
  },
  {
    id: "p-3",
    name: "Yong'oqli Holva",
    sku: "HLV-843",
    category: "Premium",
    price: 35000,
    cost_price: 20000,
    unit: "dona",
    stock: 80,
    min_stock: 15,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&q=80",
    description: "Yong'oq mag'zi bilan boyitilgan mayin holva",
  },
  {
    id: "p-4",
    name: "Shokoladli Holva",
    sku: "HLV-844",
    category: "Premium",
    price: 30000,
    cost_price: 18000,
    unit: "dona",
    stock: 90,
    min_stock: 15,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
    description: "Haqiqiy shokolad qoplamali desert holva",
  },
]

export const INITIAL_RAW_MATERIALS: MockRawMaterial[] = []

export const INITIAL_STORES: MockStore[] = [
  {
    id: "st-1",
    name: "Al-Baraka Do'koni",
    phone: "+998 90 123 45 67",
    address: "Toshkent sh., Chilonzor tumani, 9-mavze",
    contact_person: "Otabek Qodirov",
    credit_limit: 10000000,
    current_balance: -2150000,
    initial_balance: -500000,
    status: "ACTIVE",
    created_at: "2026-08-01T08:00:00.000Z",
  },
  {
    id: "st-2",
    name: "Saxovat Savdo Markazi",
    phone: "+998 93 555 44 33",
    address: "Toshkent sh., Yunusobod tumani, 4-mavze",
    contact_person: "Dilshod Karimov",
    credit_limit: 15000000,
    current_balance: -2200000,
    initial_balance: -800000,
    status: "ACTIVE",
    created_at: "2026-08-05T09:30:00.000Z",
  },
  {
    id: "st-3",
    name: "Shirinliklar Dunyosi",
    phone: "+998 97 777 88 99",
    address: "Toshkent sh., Mirobod tumani, Nukus ko'chasi",
    contact_person: "Bobur Rahmonov",
    credit_limit: 8000000,
    current_balance: -1300000,
    initial_balance: -300000,
    status: "ACTIVE",
    created_at: "2026-08-10T10:00:00.000Z",
  },
]

export const INITIAL_ORDERS: (MockOrder & { order_items?: any[] })[] = [
  {
    id: "ord-101",
    order_number: "HLV-8401",
    store_name: "Al-Baraka Do'koni",
    agent_name: "Sardor Rahimov",
    total_amount: 1250000,
    paid_amount: 500000,
    status: "DELIVERED",
    payment_status: "PARTIAL",
    created_at: "2026-08-25T10:30:00.000Z",
    order_items: [
      {
        id: "oi-1",
        product_name: "Rulet 400 Gr",
        quantity: 50,
        unit_price: 25000,
        price: 25000,
        products: { name: "Rulet 400 Gr", unit: "dona" },
      },
    ],
  },
  {
    id: "ord-102",
    order_number: "HLV-8402",
    store_name: "Saxovat Savdo Markazi",
    agent_name: "Sardor Rahimov",
    total_amount: 2000000,
    paid_amount: 600000,
    status: "DELIVERED",
    payment_status: "PARTIAL",
    created_at: "2026-09-02T14:15:00.000Z",
    order_items: [
      {
        id: "oi-2",
        product_name: "Klassik Holva",
        quantity: 80,
        unit_price: 25000,
        price: 25000,
        products: { name: "Klassik Holva", unit: "dona" },
      },
    ],
  },
  {
    id: "ord-103",
    order_number: "HLV-8403",
    store_name: "Shirinliklar Dunyosi",
    agent_name: "Sardor Rahimov",
    total_amount: 1400000,
    paid_amount: 400000,
    status: "CONFIRMED",
    payment_status: "PARTIAL",
    created_at: "2026-09-04T11:00:00.000Z",
    order_items: [
      {
        id: "oi-3",
        product_name: "Yong'oqli Holva",
        quantity: 40,
        unit_price: 35000,
        price: 35000,
        products: { name: "Yong'oqli Holva", unit: "dona" },
      },
    ],
  },
  {
    id: "ord-104",
    order_number: "HLV-8404",
    store_name: "Al-Baraka Do'koni",
    agent_name: "Sardor Rahimov",
    total_amount: 900000,
    paid_amount: 0,
    status: "CONFIRMED",
    payment_status: "PENDING",
    created_at: "2026-09-05T09:45:00.000Z",
    order_items: [
      {
        id: "oi-4",
        product_name: "Shokoladli Holva",
        quantity: 30,
        unit_price: 30000,
        price: 30000,
        products: { name: "Shokoladli Holva", unit: "dona" },
      },
    ],
  },
]

export const INITIAL_EMPLOYEES: MockEmployee[] = []

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
const STORAGE_KEY_DELETED_PRODUCTS = "holva_crm_deleted_products"

export function getDeletedProductIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_PRODUCTS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function getStoredProducts(): MockProduct[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const deletedSet = new Set(getDeletedProductIds())
        return parsed.filter((p) => !deletedSet.has(p.id) && !deletedSet.has(p.name.toLowerCase().trim()))
      }
    }
  } catch (e) {
    console.error("Error reading stored products:", e)
  }
  return []
}

export async function syncProductsFromServer(): Promise<MockProduct[]> {
  if (typeof window === "undefined") return []
  const deletedIds = getDeletedProductIds()
  const deletedSet = new Set(deletedIds)
  try {
    const res = await fetch("/api/sync/products", { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.products)) {
        if (Array.isArray(data.deletedProductIds)) {
          data.deletedProductIds.forEach((id: string) => deletedSet.add(id))
          try {
            localStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(Array.from(deletedSet)))
          } catch {}
        }
        const filteredServer = data.products.filter(
          (p: MockProduct) => !deletedSet.has(p.id) && !deletedSet.has(p.name.toLowerCase().trim())
        )
        const local = getStoredProducts()
        const map = new Map<string, MockProduct>()
        filteredServer.forEach((p: MockProduct) => map.set(p.id, p))
        local.forEach((p: MockProduct) => {
          if (map.has(p.id)) {
            const serverItem = map.get(p.id)!
            map.set(p.id, {
              ...serverItem,
              ...p,
              image_url: p.image_url || serverItem.image_url,
            })
          } else if (!deletedSet.has(p.id) && !deletedSet.has(p.name.toLowerCase().trim())) {
            map.set(p.id, p)
          }
        })
        const merged = Array.from(map.values()).filter(
          (p) => !deletedSet.has(p.id) && !deletedSet.has(p.name.toLowerCase().trim())
        )
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(merged))
        window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: merged } }))

        fetch("/api/sync/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync_all", productsList: merged, deletedProductIds: Array.from(deletedSet) }),
        }).catch(() => {})

        syncProductsToInventory(merged)
        return merged
      }
    }
  } catch (e) {
    console.error("syncProductsFromServer error:", e)
  }
  return getStoredProducts()
}

export function saveStoredProduct(updated: Partial<MockProduct> & { id: string }): MockProduct[] {
  if (typeof window === "undefined") return []
  const list = getStoredProducts()
  const updatedList = list.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: updatedList } }))
  } catch {}

  try {
    fetch("/api/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", product: updated, deletedProductIds: getDeletedProductIds() }),
    }).catch(() => {})
  } catch {}

  syncProductsToInventory(updatedList)
  return updatedList
}

export function createStoredProduct(newItem: Omit<MockProduct, "id"> & { id?: string }): MockProduct[] {
  if (typeof window === "undefined") return []
  const list = getStoredProducts()
  const product: MockProduct = {
    ...newItem,
    id: newItem.id || `p-${Date.now()}`,
  }
  const updatedList = [product, ...list]
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: updatedList } }))
  } catch {}

  try {
    fetch("/api/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", product, deletedProductIds: getDeletedProductIds() }),
    }).catch(() => {})
  } catch {}

  syncProductsToInventory(updatedList)
  return updatedList
}

export function deleteStoredProduct(id: string): MockProduct[] {
  if (typeof window === "undefined") return []
  const list = getStoredProducts()
  const matched = list.find((item) => item.id === id || item.name === id)

  const deletedIds = getDeletedProductIds()
  const set = new Set(deletedIds)
  set.add(id)
  if (matched) {
    set.add(matched.id)
    set.add(matched.name.toLowerCase().trim())
  }

  const updatedDeleted = Array.from(set)
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_PRODUCTS, JSON.stringify(updatedDeleted))
  } catch {}

  const updatedList = list.filter((item) => !set.has(item.id) && !set.has(item.name.toLowerCase().trim()))
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: updatedList } }))
  } catch {}

  try {
    fetch("/api/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", productId: id, deletedProductIds: updatedDeleted }),
    }).catch(() => {})
  } catch {}

  syncProductsToInventory(updatedList)
  return updatedList
}

export function syncProductsToInventory(productsList?: MockProduct[]): void {
  if (typeof window === "undefined") return
  const prods = productsList || getStoredProducts()
  const deletedSet = new Set(getDeletedProductIds())

  try {
    const rawInv = localStorage.getItem("holva_crm_stored_inventory")
    let invList: any[] = rawInv ? JSON.parse(rawInv) : []

    // Filter out deleted product inventory items
    invList = invList.filter((invItem) => {
      if (invItem.item_type === "product" || invItem.product_id || invItem.product?.name) {
        const pId = invItem.product_id
        const pName = (invItem.product?.name || "").toLowerCase().trim()
        if (deletedSet.has(pId) || deletedSet.has(pName)) return false
      }
      return true
    })

    const map = new Map<string, any>()
    invList.forEach((invItem) => {
      const key = invItem.product_id || (invItem.product?.name ? invItem.product.name.toLowerCase().trim() : invItem.id)
      map.set(key, invItem)
    })

    const activeKeys = new Set<string>()
    prods.forEach((p) => {
      if (deletedSet.has(p.id) || deletedSet.has(p.name.toLowerCase().trim())) return
      const key = p.id || p.name.toLowerCase().trim()
      activeKeys.add(p.id)
      activeKeys.add(p.name.toLowerCase().trim())

      const existing = map.get(key) || map.get(p.id) || map.get(p.name.toLowerCase().trim())

      if (existing) {
        existing.current_stock = p.stock
        existing.minimum_stock = p.min_stock || 10
        existing.product = { name: p.name }
        existing.unit = { short_name: p.unit || "dona" }
      } else {
        invList.push({
          id: `inv-${p.id}`,
          product_id: p.id,
          raw_material_id: null,
          item_type: "product",
          current_stock: p.stock,
          minimum_stock: p.min_stock || 10,
          reserved_stock: 0,
          warehouse: { name: "Tayyor Mahsulotlar Ombori" },
          product: { name: p.name },
          raw_material: null,
          unit: { short_name: p.unit || "dona" },
        })
      }
    })

    // Keep only active product inventory items or raw material items
    const finalInv = invList.filter((invItem) => {
      if (invItem.item_type === "product" || invItem.product_id || invItem.product?.name) {
        const pId = invItem.product_id
        const pName = (invItem.product?.name || "").toLowerCase().trim()
        if (deletedSet.has(pId) || deletedSet.has(pName)) return false
        return (pId && activeKeys.has(pId)) || (pName && activeKeys.has(pName))
      }
      return true
    })

    localStorage.setItem("holva_crm_stored_inventory", JSON.stringify(finalInv))
    window.dispatchEvent(new CustomEvent("inventory-updated", { detail: { items: finalInv } }))
  } catch (e) {
    console.error("syncProductsToInventory error:", e)
  }
}

export function deductStockForOrder(order: any): void {
  if (typeof window === "undefined" || !order) return

  const items = order.order_items || order.items || []
  if (!Array.isArray(items) || items.length === 0) return

  const productsList = getStoredProducts()
  let productsChanged = false

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 1
    const pName = (item.products?.name || item.product_name || "").toLowerCase().trim()
    const pId = item.product_id

    const foundProd = productsList.find(
      (p) => (pId && p.id === pId) || (pName && p.name.toLowerCase().trim() === pName)
    )

    if (foundProd) {
      foundProd.stock = Math.max(0, (foundProd.stock || 0) - qty)
      productsChanged = true
    }
  })

  if (productsChanged) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(productsList))
      window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: productsList } }))
    } catch (e) {}

    try {
      fetch("/api/sync/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_all", productsList }),
      }).catch(() => {})
    } catch (e) {}

    syncProductsToInventory(productsList)
  }
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

export const INITIAL_VISITS: MockVisit[] = []

const STORAGE_KEY_VISITS = "holva_crm_stored_visits"
const STORAGE_KEY_COMPLETED_COUNT = "holva_crm_visits_completed_count"

export function getStoredVisits(): MockVisit[] {
  if (typeof window === "undefined") return INITIAL_VISITS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITS)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
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
  if (typeof window === "undefined") return { visits: INITIAL_VISITS, completedCount: 0 }
  const current = getStoredVisits()
  const updated = current.map((v) =>
    v.id === id ? { ...v, status: "COMPLETED" as const, duration: "25 daqiqa", start_time: v.start_time.replace(" (Jarayonda)", "").replace(" (Rejada)", "") } : v
  )
  saveStoredVisits(updated)

  const currentCount = getStoredCompletedVisitsCount()
  const newCount = currentCount + 1
  setStoredCompletedVisitsCount(newCount)

  return { visits: updated, completedCount: newCount }
}

export function getStoredCompletedVisitsCount(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED_COUNT)
    if (raw) {
      const parsed = parseInt(raw, 10)
      if (!isNaN(parsed)) return parsed
    }
  } catch {}
  return 0
}

export function setStoredCompletedVisitsCount(count: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED_COUNT, String(count))
    window.dispatchEvent(new CustomEvent("visits-updated", { detail: { count } }))
  } catch {}
}

// ==========================================
// Do'konlar (STORES) LOCALSTORAGE PERSISTENCE
// ==========================================
const STORAGE_KEY_STORES = "holva_crm_stored_stores"
const STORAGE_KEY_DELETED_STORES = "holva_crm_deleted_stores"

export function getDeletedStoreIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_STORES)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function getStoredStores(): MockStore[] {
  if (typeof window === "undefined") return INITIAL_STORES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STORES)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const deletedSet = new Set(getDeletedStoreIds())
        const filtered = parsed.filter((s) => !deletedSet.has(s.id) && !deletedSet.has(s.name.toLowerCase().trim()))
        if (filtered.length > 0) return filtered
      }
    }
  } catch (e) {
    console.error("Error reading stored stores:", e)
  }
  return INITIAL_STORES
}

export function saveStoredStores(stores: MockStore[]): void {
  if (typeof window === "undefined") return
  try {
    const deletedSet = new Set(getDeletedStoreIds())
    const filtered = stores.filter((s) => !deletedSet.has(s.id) && !deletedSet.has(s.name.toLowerCase().trim()))
    localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent("stores-updated", { detail: { stores: filtered } }))
  } catch {}
}

export async function syncStoresFromServer(): Promise<MockStore[]> {
  if (typeof window === "undefined") return INITIAL_STORES
  const localStores = getStoredStores()
  const deletedIds = getDeletedStoreIds()
  try {
    const res = await fetch("/api/sync/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", stores: localStores, deletedStoreIds: deletedIds }),
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.stores)) {
        const deletedSet = new Set(deletedIds)
        if (Array.isArray(data.deletedStoreIds)) {
          data.deletedStoreIds.forEach((id: string) => deletedSet.add(id))
          try {
            localStorage.setItem(STORAGE_KEY_DELETED_STORES, JSON.stringify(Array.from(deletedSet)))
          } catch {}
        }
        const filtered = data.stores.filter((s: MockStore) => !deletedSet.has(s.id) && !deletedSet.has(s.name.toLowerCase().trim()))
        localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent("stores-updated", { detail: { stores: filtered } }))
        return filtered
      }
    }
  } catch (e) {
    console.error("syncStoresFromServer error:", e)
  }
  return localStores
}

export function createStoredStore(newStore: MockStore): MockStore[] {
  if (typeof window === "undefined") return INITIAL_STORES
  const list = getStoredStores()
  const exists = list.some((s) => s.id === newStore.id || s.name.toLowerCase().trim() === newStore.name.toLowerCase().trim())
  const updatedList = exists
    ? list.map((s) => (s.id === newStore.id || s.name.toLowerCase().trim() === newStore.name.toLowerCase().trim() ? { ...s, ...newStore } : s))
    : [newStore, ...list]

  saveStoredStores(updatedList)

  try {
    fetch("/api/sync/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", store: newStore }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function updateStoredStore(id: string, updates: Partial<MockStore>): MockStore[] {
  if (typeof window === "undefined") return INITIAL_STORES
  const list = getStoredStores()
  const updatedList = list.map((s) => (s.id === id ? { ...s, ...updates } : s))
  saveStoredStores(updatedList)

  try {
    fetch("/api/sync/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", storeId: id, updates }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function deleteStoredStore(id: string): MockStore[] {
  if (typeof window === "undefined") return INITIAL_STORES
  const deletedIds = getDeletedStoreIds()
  const set = new Set(deletedIds)
  set.add(id)

  const list = getStoredStores()
  const matched = list.find((s) => s.id === id || s.name === id)
  if (matched) {
    set.add(matched.id)
    set.add(matched.name.toLowerCase().trim())
  }

  const updatedDeleted = Array.from(set)
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_STORES, JSON.stringify(updatedDeleted))
  } catch {}

  const updatedList = list.filter((s) => !set.has(s.id) && !set.has(s.name.toLowerCase().trim()))
  saveStoredStores(updatedList)

  try {
    fetch("/api/sync/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", storeId: id, deletedStoreIds: updatedDeleted }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

// ==========================================
// Sotuvlar (ORDERS) LOCALSTORAGE PERSISTENCE
// ==========================================
const STORAGE_KEY_ORDERS = "holva_crm_stored_orders"
const STORAGE_KEY_DELETED_ORDERS = "holva_crm_deleted_orders"

export function getDeletedOrderIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_ORDERS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function getStoredOrders(): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const deletedSet = new Set(getDeletedOrderIds())
        const filtered = parsed.filter((o) => !deletedSet.has(o.id) && !deletedSet.has(o.order_number))
        if (filtered.length > 0) return filtered
      }
    }
  } catch (e) {
    console.error("Error reading stored orders:", e)
  }
  return INITIAL_ORDERS
}

export function saveStoredOrders(orders: MockOrder[]): void {
  if (typeof window === "undefined") return
  try {
    const deletedSet = new Set(getDeletedOrderIds())
    const filtered = orders.filter((o) => !deletedSet.has(o.id) && !deletedSet.has(o.order_number))
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orders: filtered } }))
  } catch {}
}

export async function syncOrdersFromServer(): Promise<MockOrder[]> {
  if (typeof window === "undefined") return INITIAL_ORDERS
  const localOrders = getStoredOrders()
  const deletedIds = getDeletedOrderIds()
  try {
    const res = await fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", orders: localOrders, deletedOrderIds: deletedIds }),
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.orders)) {
        const deletedSet = new Set(deletedIds)
        if (Array.isArray(data.deletedOrderIds)) {
          data.deletedOrderIds.forEach((id: string) => deletedSet.add(id))
          try {
            localStorage.setItem(STORAGE_KEY_DELETED_ORDERS, JSON.stringify(Array.from(deletedSet)))
          } catch {}
        }
        const filtered = data.orders.filter((o: MockOrder) => !deletedSet.has(o.id) && !deletedSet.has(o.order_number))
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orders: filtered } }))
        return filtered
      }
    }
  } catch (e) {
    console.error("syncOrdersFromServer error:", e)
  }
  return localOrders
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

  deductStockForOrder(newOrder)
  recalculateStoreBalances()

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
  
  const deletedIds = getDeletedOrderIds()
  const set = new Set(deletedIds)
  set.add(orderId)

  const currentList = getStoredOrders()
  const matched = currentList.find((o) => o.id === orderId || o.order_number === orderId)
  if (matched) {
    set.add(matched.id)
    set.add(matched.order_number)
  }

  const updatedDeletedIds = Array.from(set)
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_ORDERS, JSON.stringify(updatedDeletedIds))
  } catch {}

  const updatedList = currentList.filter((o) => !set.has(o.id) && !set.has(o.order_number))
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedList))
    window.dispatchEvent(new CustomEvent("orders-updated", { detail: { orders: updatedList } }))
  } catch {}

  recalculateStoreBalances()

  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", orderId, deletedOrderIds: updatedDeletedIds }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function recalculateStoreBalances(): void {
  if (typeof window === "undefined") return
  try {
    const rawStores = localStorage.getItem("holva_crm_stored_stores")
    if (!rawStores) return
    const stores: MockStore[] = JSON.parse(rawStores)
    const orders = getStoredOrders()

    const debtMap: Record<string, number> = {}
    orders.forEach((o: any) => {
      const sName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const total = o.total_amount || 0
      const paid = o.paid_amount || 0
      const debt = Math.max(0, total - paid)
      if (sName) {
        debtMap[sName] = (debtMap[sName] || 0) + debt
      }
    })

    const updatedStores = stores.map((s) => {
      const sName = s.name.toLowerCase().trim()
      const initDebt = Math.abs(s.initial_balance || 0)
      const orderDebt = debtMap[sName] || 0
      const totalDebt = initDebt + orderDebt
      return {
        ...s,
        current_balance: totalDebt > 0 ? -totalDebt : (s.current_balance || 0),
      }
    })

    localStorage.setItem("holva_crm_stored_stores", JSON.stringify(updatedStores))
    window.dispatchEvent(new CustomEvent("stores-updated", { detail: { stores: updatedStores } }))

    fetch("/api/sync/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", stores: updatedStores }),
    }).catch(() => {})
  } catch (e) {
    console.error("recalculateStoreBalances error:", e)
  }
}

export function updateStoredOrder(id: string, updates: Partial<MockOrder>): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  const list = getStoredOrders()
  const updatedList = list.map((o) => (o.id === id ? { ...o, ...updates } : o))
  saveStoredOrders(updatedList)
  recalculateStoreBalances()

  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", orders: updatedList }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

// ==========================================
// CHAT MESSAGES PERSISTENCE & SYNC
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

export const INITIAL_CHAT_MESSAGES: RealtimeChatMessage[] = []

const STORAGE_KEY_CHAT = "holva_crm_chat_messages"

export function getStoredChatMessages(agentId?: string): RealtimeChatMessage[] {
  if (typeof window === "undefined") return INITIAL_CHAT_MESSAGES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return agentId ? parsed.filter((m) => (m.agentId || "sardor") === agentId) : parsed
      }
    }
  } catch (e) {
    console.error("Error reading stored chat messages:", e)
  }
  return INITIAL_CHAT_MESSAGES
}

export function mergeChatMessages(localMsgs: RealtimeChatMessage[], serverMsgs: RealtimeChatMessage[]): RealtimeChatMessage[] {
  const map = new Map<string, RealtimeChatMessage>()
  for (const m of localMsgs) {
    if (m && m.id) map.set(m.id, m)
  }
  for (const m of serverMsgs) {
    if (m && m.id) map.set(m.id, m)
  }
  return Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
}

export async function syncChatMessagesFromServer(agentId?: string): Promise<RealtimeChatMessage[]> {
  if (typeof window === "undefined") return INITIAL_CHAT_MESSAGES
  const currentLocal = getStoredChatMessages()
  try {
    const url = agentId ? `/api/sync/chat?agentId=${encodeURIComponent(agentId)}` : "/api/sync/chat"
    const res = await fetch(url, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.allMessages)) {
        const merged = mergeChatMessages(currentLocal, data.allMessages)
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(merged))
        window.dispatchEvent(new CustomEvent("holva-chat-updated", { detail: { messages: merged, agentId } }))
        return agentId ? merged.filter((m) => (m.agentId || "sardor") === agentId) : merged
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
  const currentLocal = getStoredChatMessages()
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

  const updated = mergeChatMessages(currentLocal, [newMsg])
  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("holva-chat-updated", { detail: { messages: updated, agentId } }))
  } catch {}

  try {
    fetch("/api/sync/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        sender,
        senderName,
        newMessage: newMsg,
        clientMessages: updated,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.allMessages)) {
            const reMerged = mergeChatMessages(updated, data.allMessages)
            localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(reMerged))
          }
        }
      })
      .catch(() => {})
  } catch {}

  return updated
}

export interface MockCategory {
  id: string
  name: string
  description?: string
  product_count?: number
}

export interface MockRecipe {
  id: string
  name: string
  product_id: string
  version: string
  yield_quantity: number
  yield_unit_id: string
  status: string
  is_active: boolean
  instructions?: string
  product?: { name: string }
  items?: Array<{
    raw_material_id: string
    quantity: number
    unit_id: string
    notes?: string
  }>
}

const STORAGE_KEY_CATEGORIES = "holva_crm_stored_categories"
const STORAGE_KEY_RECIPES = "holva_crm_stored_recipes"

export function getStoredProductCategories(): MockCategory[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function saveStoredProductCategories(items: MockCategory[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("holva-categories-updated", { detail: { categories: items } }))
  } catch {}

  fetch("/api/sync/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sync", categories: items }),
  }).catch(() => {})
}

export async function syncProductCategoriesFromServer(): Promise<MockCategory[]> {
  if (typeof window === "undefined") return []
  try {
    const local = getStoredProductCategories()
    const res = await fetch("/api/sync/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", categories: local }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.categories)) {
        const deletedSet = new Set<string>(data.deletedCategoryIds || [])
        const filtered = data.categories.filter((c: MockCategory) => !deletedSet.has(c.id) && !deletedSet.has(c.name.toLowerCase().trim()))
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent("holva-categories-updated", { detail: { categories: filtered } }))
        return filtered
      }
    }
  } catch {}
  return getStoredProductCategories()
}

export function createStoredProductCategory(cat: Omit<MockCategory, "id">): MockCategory {
  const newCat: MockCategory = {
    ...cat,
    id: `c-${Date.now()}`,
    product_count: cat.product_count || 0,
  }
  const current = getStoredProductCategories()
  const updated = [newCat, ...current]
  saveStoredProductCategories(updated)

  fetch("/api/sync/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", category: newCat }),
  }).catch(() => {})

  return newCat
}

export function deleteStoredProductCategory(id: string) {
  const current = getStoredProductCategories()
  const updated = current.filter((c) => c.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("holva-categories-updated", { detail: { categories: updated } }))
  } catch {}

  fetch("/api/sync/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", categoryId: id }),
  }).catch(() => {})
}

export function getStoredRecipes(): MockRecipe[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECIPES)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

export function saveStoredRecipes(items: MockRecipe[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent("holva-recipes-updated", { detail: { recipes: items } }))
  } catch {}

  fetch("/api/sync/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "sync", recipes: items }),
  }).catch(() => {})
}

export async function syncRecipesFromServer(): Promise<MockRecipe[]> {
  if (typeof window === "undefined") return []
  try {
    const local = getStoredRecipes()
    const res = await fetch("/api/sync/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync", recipes: local }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.recipes)) {
        const deletedSet = new Set<string>(data.deletedRecipeIds || [])
        const filtered = data.recipes.filter((r: MockRecipe) => !deletedSet.has(r.id))
        localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent("holva-recipes-updated", { detail: { recipes: filtered } }))
        return filtered
      }
    }
  } catch {}
  return getStoredRecipes()
}

export function createStoredRecipe(recipe: Omit<MockRecipe, "id">): MockRecipe {
  const list = getStoredRecipes()
  const newRec: MockRecipe = {
    ...recipe,
    id: `rec-${Date.now()}`,
  }
  const updated = [newRec, ...list]
  saveStoredRecipes(updated)

  fetch("/api/sync/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "create", recipe: newRec }),
  }).catch(() => {})

  return newRec
}

export function deleteStoredRecipe(id: string) {
  const list = getStoredRecipes()
  const updated = list.filter((r) => r.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("holva-recipes-updated", { detail: { recipes: updated } }))
  } catch {}

  fetch("/api/sync/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", recipeId: id }),
  }).catch(() => {})
}

