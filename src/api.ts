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

export interface ItemData {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  minStock: number
  price: number
  createdAt: string
}

export interface CategoryData {
  id: string
  name: string
}

export function fetchItems() {
  return request<ItemData[]>('/api/items')
}

export function createItem(item: ItemData) {
  return request<ItemData>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function updateItem(id: string, data: Partial<ItemData>) {
  return request<{ message: string }>(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteItem(id: string) {
  return request<{ message: string }>(`/api/items/${id}`, {
    method: 'DELETE',
  })
}

export function fetchCategories() {
  return request<CategoryData[]>('/api/categories')
}

export function createCategory(id: string, name: string) {
  return request<CategoryData>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ id, name }),
  })
}

export function deleteCategory(id: string) {
  return request<{ message: string }>(`/api/categories/${id}`, {
    method: 'DELETE',
  })
}
