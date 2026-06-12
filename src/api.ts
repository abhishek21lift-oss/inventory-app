import type { Item, StockHistoryEntry, Category, Warehouse, Supplier, PurchaseOrder, Invoice, ActivityLog, DashboardData } from './types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  const u = localStorage.getItem('user')
  if (u) { const p = JSON.parse(u); return p?.token || '' }
  return ''
}

function authHeaders(): Record<string, string> {
  const t = getToken()
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...options })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// Auth
export function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; email: string; name: string; role: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function register(email: string, password: string, name: string) {
  return request<{ token: string; user: { id: string; email: string; name: string; role: string } }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })
}

export function fetchUsers() { return request<{ id: string; email: string; name: string; role: string }[]>('/api/auth/users') }

// Dashboard
export function fetchDashboard() { return request<DashboardData>('/api/dashboard') }

// Items
export function fetchItems(params?: { search?: string; category?: string; condition?: string; warehouseId?: string }) {
  const q = new URLSearchParams()
  if (params?.search) q.set('search', params.search)
  if (params?.category) q.set('category', params.category)
  if (params?.condition) q.set('condition', params.condition)
  if (params?.warehouseId) q.set('warehouseId', params.warehouseId)
  const qs = q.toString()
  return request<Item[]>(`/api/items${qs ? '?' + qs : ''}`)
}

export function fetchItem(id: string) { return request<Item>(`/api/items/${id}`) }
export function createItem(item: Item) { return request<Item>('/api/items', { method: 'POST', body: JSON.stringify(item) }) }
export function updateItem(id: string, data: Partial<Item>) { return request<{ message: string; updatedAt: string }>(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteItem(id: string) { return request<{ message: string }>(`/api/items/${id}`, { method: 'DELETE' }) }
export function adjustStock(id: string, change: number, note?: string, warehouseId?: string) { return request<{ message: string; previousQty: number; newQty: number; change: number; updatedAt: string }>(`/api/items/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ change, note, warehouseId }) }) }
export function duplicateItem(id: string) { return request<Item>(`/api/items/${id}/duplicate`, { method: 'POST' }) }
export function fetchItemHistory(id: string) { return request<StockHistoryEntry[]>(`/api/items/${id}/history`) }
export function fetchItemWarehouses(id: string) { return request<{ warehouseId: string; warehouseName: string; quantity: number }[]>(`/api/items/${id}/warehouses`) }
export function transferStock(id: string, fromWarehouseId: string, toWarehouseId: string, quantity: number) { return request<{ message: string }>(`/api/items/${id}/transfer`, { method: 'POST', body: JSON.stringify({ fromWarehouseId, toWarehouseId, quantity }) }) }

// Categories
export function fetchCategories() { return request<Category[]>('/api/categories') }
export function createCategory(id: string, name: string) { return request<Category>('/api/categories', { method: 'POST', body: JSON.stringify({ id, name }) }) }
export function deleteCategory(id: string) { return request<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' }) }

// Warehouses
export function fetchWarehouses() { return request<Warehouse[]>('/api/warehouses') }
export function createWarehouse(name: string, location?: string) { return request<Warehouse>('/api/warehouses', { method: 'POST', body: JSON.stringify({ name, location }) }) }
export function updateWarehouse(id: string, data: Partial<Warehouse>) { return request<{ message: string }>(`/api/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteWarehouse(id: string) { return request<{ message: string }>(`/api/warehouses/${id}`, { method: 'DELETE' }) }

// Suppliers
export function fetchSuppliers() { return request<Supplier[]>('/api/suppliers') }
export function createSupplier(data: Partial<Supplier>) { return request<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }) }
export function updateSupplier(id: string, data: Partial<Supplier>) { return request<{ message: string }>(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }) }
export function deleteSupplier(id: string) { return request<{ message: string }>(`/api/suppliers/${id}`, { method: 'DELETE' }) }

// Purchase Orders
export function fetchPurchaseOrders() { return request<PurchaseOrder[]>('/api/purchase-orders') }
export function fetchPurchaseOrder(id: string) { return request<PurchaseOrder>(`/api/purchase-orders/${id}`) }
export function createPurchaseOrder(data: { supplierId: string; warehouseId: string; notes?: string; items: { itemId: string; quantity: number; unitCost: number }[] }) { return request<PurchaseOrder>('/api/purchase-orders', { method: 'POST', body: JSON.stringify(data) }) }
export function receivePurchaseOrder(id: string) { return request<{ message: string }>(`/api/purchase-orders/${id}/receive`, { method: 'PATCH' }) }
export function cancelPurchaseOrder(id: string) { return request<{ message: string }>(`/api/purchase-orders/${id}/cancel`, { method: 'PATCH' }) }

// Invoices
export function fetchInvoices() { return request<Invoice[]>('/api/invoices') }
export function fetchInvoice(id: string) { return request<Invoice>(`/api/invoices/${id}`) }
export function createInvoice(data: { customerName: string; customerEmail?: string; customerPhone?: string; warehouseId: string; notes?: string; tax?: number; items: { itemId: string; quantity: number; unitPrice: number }[] }) { return request<Invoice>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }) }
export function confirmInvoice(id: string) { return request<{ message: string }>(`/api/invoices/${id}/confirm`, { method: 'PATCH' }) }
export function cancelInvoice(id: string) { return request<{ message: string }>(`/api/invoices/${id}/cancel`, { method: 'PATCH' }) }

// Activities
export function fetchActivities(limit?: number) { return request<ActivityLog[]>(`/api/activities?limit=${limit || 100}`) }
