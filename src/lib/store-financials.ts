import { getStoredStores, getStoredOrders } from "@/lib/mock-data"
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/utils"

export type DocType = "Boshlang'ich qoldiq" | "Mahsulot xaridi" | "To'lov qabuli"

export interface TransactionEntry {
  id: string
  date: string
  fullDate: string
  timestamp: number
  docNumber: string
  storeName: string
  storeId: string
  docType: DocType
  description: string
  agentName: string
  debit: number
  credit: number
  balance: number
  orderId?: string
  orderItems?: any[]
}

export interface StoreFinancials {
  storeId: string
  storeName: string
  initialDebt: number
  totalDebit: number
  totalCredit: number
  currentDebt: number
  entries: TransactionEntry[]
}

function buildEntries(storeId: string, startDate?: string, endDate?: string): TransactionEntry[] {
  const stores = getStoredStores()
  const allOrders = getStoredOrders()
  const list: TransactionEntry[] = []

  const matchingStores = storeId === "all" ? stores : stores.filter((s) => s.id === storeId || s.name === storeId)

  for (const store of matchingStores) {
    const initBal = Math.abs(store.initial_balance || 0)
    if (initBal > 0) {
      const initDate = startDate || new Date().getFullYear() + "-01-01"
      list.push({
        id: `init-${store.id}`,
        date: initDate,
        fullDate: initDate,
        timestamp: 0,
        docNumber: "BOSH-001",
        storeName: store.name,
        storeId: store.id,
        docType: "Boshlang'ich qoldiq",
        description: "Oldingi davrdan o'tgan boshlang'ich qarz summasi",
        agentName: "Tizim",
        debit: initBal,
        credit: 0,
        balance: 0,
      })
    }

    const storeOrders = (allOrders as any[]).filter((o: any) => {
      const oStoreName = (o.stores?.name || o.store_name || "").toLowerCase().trim()
      const sName = store.name.toLowerCase().trim()
      return oStoreName === sName || o.store_id === store.id
    })

    for (const ord of storeOrders) {
      const ordDate = ord.created_at ? ord.created_at.split("T")[0] : new Date().toISOString().split("T")[0]
      const ts = ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? new Date(ord.created_at).getTime() : Date.now()
      const agentName = ord.agent_name || (ord.profiles?.first_name ? `${ord.profiles.first_name} ${ord.profiles.last_name || ""}`.trim() : "Agent")
      const fullDate = ord.created_at && !isNaN(new Date(ord.created_at).getTime()) ? formatDateTime(ord.created_at) : ordDate

      const items: any[] = ord.order_items || ord.items || []
      let desc = ""
      if (items.length > 0) {
        desc = items
          .map((it: any) => {
            const name = it.products?.name || it.product_name || "Mahsulot"
            const qty = formatNumber(it.quantity || 1)
            const price = formatCurrency(it.unit_price || it.price || 0)
            const lineTotal = formatCurrency((it.quantity || 1) * (it.unit_price || it.price || 0))
            return `${name} - ${qty} dona x ${price} = ${lineTotal}`
          })
          .join("; ")
      } else {
        desc = "Mahsulotlar xaridi"
      }

      if ((ord.total_amount || 0) > 0) {
        list.push({
          id: `ord-${ord.id}`,
          date: ordDate,
          fullDate,
          timestamp: ts,
          docNumber: ord.order_number || `ORD-${ord.id}`,
          storeName: store.name,
          storeId: store.id,
          docType: "Mahsulot xaridi",
          description: desc,
          agentName,
          debit: ord.total_amount,
          credit: 0,
          balance: 0,
          orderId: ord.id,
          orderItems: items,
        })
      }

      if ((ord.paid_amount || 0) > 0) {
        list.push({
          id: `pay-${ord.id}`,
          date: ordDate,
          fullDate,
          timestamp: ts + 1000,
          docNumber: `TOL-${(ord.order_number || ord.id).replace("HLV-", "").replace("ORD-", "")}`,
          storeName: store.name,
          storeId: store.id,
          docType: "To'lov qabuli",
          description: "Mijoz tomonidan to'lov amalga oshirildi",
          agentName,
          debit: 0,
          credit: ord.paid_amount,
          balance: 0,
          orderId: ord.id,
        })
      }
    }
  }

  list.sort((a, b) => a.timestamp - b.timestamp)

  let filtered = list
  if (startDate && endDate) {
    filtered = list.filter((e) => e.date >= startDate && e.date <= endDate)
  }

  let running = 0
  return filtered.map((e) => {
    running += e.debit - e.credit
    return { ...e, balance: running }
  })
}

export function buildStoreTransactions(storeId: string, startDate?: string, endDate?: string): TransactionEntry[] {
  return buildEntries(storeId, startDate, endDate)
}

export function buildAllStoresFinancials(): StoreFinancials[] {
  const stores = getStoredStores()
  return stores.map((store) => {
    const entries = buildEntries(store.id)
    const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
    const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
    const initialDebt = Math.abs(store.initial_balance || 0)
    return {
      storeId: store.id,
      storeName: store.name,
      initialDebt,
      totalDebit,
      totalCredit,
      currentDebt: totalDebit - totalCredit,
      entries,
    }
  })
}

export function getStoreSummary(storeId: string): {
  initialDebt: number
  totalDebit: number
  totalCredit: number
  currentDebt: number
} {
  const stores = getStoredStores()
  const store = stores.find((s) => s.id === storeId || s.name === storeId)
  if (!store) return { initialDebt: 0, totalDebit: 0, totalCredit: 0, currentDebt: 0 }
  const entries = buildEntries(storeId)
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0)
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0)
  const initialDebt = Math.abs(store.initial_balance || 0)
  return {
    initialDebt,
    totalDebit,
    totalCredit,
    currentDebt: totalDebit - totalCredit,
  }
}
