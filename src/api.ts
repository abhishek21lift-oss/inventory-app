import type { Item, StockHistoryEntry } from './types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export function fetchItems() {
  return request<Item[]>('/api/items')
}

export function fetchItem(id: string) {
  return request<Item>(`/api/items/${id}`)
}

export function createItem(item: Item) {
  return request<Item>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function updateItem(id: string, data: Partial<Item>) {
  return request<{ message: string; updatedAt: string }>(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteItem(id: string) {
  return request<{ message: string }>(`/api/items/${id}`, {
    method: 'DELETE',
  })
}

export function adjustStock(id: string, change: number, note?: string) {
  return request<{ message: string; previousQty: number; newQty: number; change: number; updatedAt: string }>(`/api/items/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ change, note }),
  })
}

export function duplicateItem(id: string) {
  return request<Item>(`/api/items/${id}/duplicate`, {
    method: 'POST',
  })
}

export function fetchItemHistory(id: string) {
  return request<StockHistoryEntry[]>(`/api/items/${id}/history`)
}

export function fetchCategories() {
  return request<{ id: string; name: string }[]>('/api/categories')
}

export function createCategory(id: string, name: string) {
  return request<{ id: string; name: string }>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ id, name }),
  })
}

export function deleteCategory(id: string) {
  return request<{ message: string }>(`/api/categories/${id}`, {
    method: 'DELETE',
  })
}
