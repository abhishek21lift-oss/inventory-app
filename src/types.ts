export interface User {
  id: string; email: string; name: string; role: string; avatar?: string
}

export interface Item {
  id: string; name: string; sku: string; category: string
  quantity: number; minStock: number; price: number
  brand: string; location: string; condition: string
  createdAt: string; updatedAt?: string
  warehouseStock?: Record<string, number>
}

export interface Category {
  id: string; name: string; items_count?: number
}

export interface Warehouse {
  id: string; name: string; location: string; isActive: boolean; createdAt: string
}

export interface Supplier {
  id: string; name: string; contactPerson: string
  email: string; phone: string; address: string
  isActive: boolean; createdAt: string
}

export interface PurchaseOrder {
  id: string; poNumber: string; supplierId: string
  warehouseId: string; status: string; totalAmount: number
  notes: string; createdBy: string; createdAt: string
  receivedAt: string | null; items: POItem[]
}

export interface POItem {
  id: string; poId: string; itemId: string
  quantity: number; unitCost: number; receivedQuantity: number
}

export interface Invoice {
  id: string; invoiceNumber: string; customerName: string
  customerEmail: string; customerPhone: string; warehouseId: string
  status: string; subtotal: number; tax: number; total: number
  notes: string; createdBy: string; createdAt: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string; invoiceId: string; itemId: string
  quantity: number; unitPrice: number; subtotal: number
}

export interface StockHistoryEntry {
  id: string; itemId: string; change: number
  previousQty: number; newQty: number; note: string; createdAt: string
}

export interface ActivityLog {
  id: string; userId: string; userName: string
  action: string; entityType: string; entityId: string
  details: string; createdAt: string
}

export interface DashboardData {
  totalItems: number; totalValue: number; lowStock: number; outStock: number
  pendingPOs: number; paidInvoices: number; activeWarehouses: number; activeSuppliers: number
  lowStockItems: { name: string; quantity: number; minStock: number; sku: string }[]
  stockByCategory: { category: string; total: number }[]
  recentActivity: ActivityLog[]
}

export type SortField = 'name' | 'sku' | 'category' | 'brand' | 'location' | 'condition' | 'quantity' | 'price' | 'updatedAt'
export type SortDir = 'asc' | 'desc'
