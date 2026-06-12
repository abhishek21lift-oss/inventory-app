export interface Item {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  minStock: number
  price: number
  brand: string
  location: string
  condition: string
  createdAt: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
}

export interface StockHistoryEntry {
  id: string
  itemId: string
  change: number
  previousQty: number
  newQty: number
  note: string
  createdAt: string
}

export type SortField = 'name' | 'sku' | 'category' | 'brand' | 'location' | 'condition' | 'quantity' | 'price' | 'updatedAt'
export type SortDir = 'asc' | 'desc'
