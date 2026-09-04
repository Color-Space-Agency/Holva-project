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
    name: "Kunjutli Premium Holva (500g)",
    sku: "HLV-KNJ-500",
    category: "Premium Holvalar",
    price: 38000,
    cost_price: 22000,
    unit: "dona",
    stock: 120,
    min_stock: 20,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80",
    description: "Kunjut va tabiiy asal bilan boyitilgan premium sifatli holva",
  },
  {
    id: "p-2",
    name: "Shokoladli Yong'oqli Holva (400g)",
    sku: "HLV-SHK-400",
    category: "Shokoladli Holvalar",
    price: 45000,
    cost_price: 26000,
    unit: "dona",
    stock: 85,
    min_stock: 15,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
    description: "Belgiya shokoladi va o'rmon yong'og'i qo'shilgan holva",
  },
  {
    id: "p-3",
    name: "Pista Mag'izli Samarqand Holvasi (1kg)",
    sku: "HLV-PST-1000",
    category: "Premium Holvalar",
    price: 95000,
    cost_price: 58000,
    unit: "dona",
    stock: 45,
    min_stock: 10,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Eron pistasi mag'zi va Samarqand milliy retsepti asosida",
  },
  {
    id: "p-4",
    name: "Kungaboqar Klassik Holvasi (350g)",
    sku: "HLV-KNG-350",
    category: "Klassik Holvalar",
    price: 18000,
    cost_price: 10000,
    unit: "dona",
    stock: 200,
    min_stock: 30,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80",
    description: "Klassik kunjut va kungaboqar urug'laridan tayyorlangan",
  },
  {
    id: "p-5",
    name: "Bodomli Qandolat Holvasi (500g)",
    sku: "HLV-BDM-500",
    category: "Yong'oqli Holvalar",
    price: 60000,
    cost_price: 36000,
    unit: "dona",
    stock: 60,
    min_stock: 10,
    status: "ACTIVE",
    image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    description: "Maydalangan bodom va vanil xushbo'yligi",
  },
]

export const INITIAL_RAW_MATERIALS: MockRawMaterial[] = []

export const INITIAL_STORES: MockStore[] = []

export const INITIAL_ORDERS: MockOrder[] = []

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

export function getStoredProducts(): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error("Error reading stored products:", e)
  }
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
  } catch {}
  return INITIAL_PRODUCTS
}

export async function syncProductsFromServer(): Promise<MockProduct[]> {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  try {
    const res = await fetch("/api/sync/products", { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      if (data.success && Array.isArray(data.products)) {
        const local = getStoredProducts()
        const map = new Map<string, MockProduct>()
        data.products.forEach((p: MockProduct) => map.set(p.id, p))
        local.forEach((p: MockProduct) => {
          if (map.has(p.id)) {
            const serverItem = map.get(p.id)!
            map.set(p.id, {
              ...serverItem,
              ...p,
              image_url: p.image_url || serverItem.image_url,
            })
          } else {
            map.set(p.id, p)
          }
        })
        const merged = Array.from(map.values())
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(merged))
        window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: merged } }))
        return merged
      }
    }
  } catch (e) {
    console.error("syncProductsFromServer error:", e)
  }
  return getStoredProducts()
}

export function saveStoredProduct(updated: Partial<MockProduct> & { id: string }): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
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
      body: JSON.stringify({ action: "update", product: updated }),
    }).catch(() => {})
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
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: updatedList } }))
  } catch {}

  try {
    fetch("/api/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", product }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function deleteStoredProduct(id: string): MockProduct[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS
  const list = getStoredProducts()
  const updatedList = list.filter((item) => item.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updatedList))
    window.dispatchEvent(new CustomEvent("products-updated", { detail: { products: updatedList } }))
  } catch {}

  try {
    fetch("/api/sync/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", productId: id }),
    }).catch(() => {})
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
      if (Array.isArray(parsed)) {
        const deletedSet = new Set(getDeletedStoreIds())
        return parsed.filter((s) => !deletedSet.has(s.id) && !deletedSet.has(s.name.toLowerCase().trim()))
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
      if (Array.isArray(parsed)) {
        const deletedSet = new Set(getDeletedOrderIds())
        return parsed.filter((o) => !deletedSet.has(o.id) && !deletedSet.has(o.order_number))
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

  try {
    fetch("/api/sync/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", orderId, deletedOrderIds: updatedDeletedIds }),
    }).catch(() => {})
  } catch {}

  return updatedList
}

export function updateStoredOrder(id: string, updates: Partial<MockOrder>): MockOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS
  const list = getStoredOrders()
  const updatedList = list.map((o) => (o.id === id ? { ...o, ...updates } : o))
  saveStoredOrders(updatedList)

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
