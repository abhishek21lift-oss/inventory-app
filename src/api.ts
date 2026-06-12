import type { Item } from './types'

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

export function createItem(item: Item) {
  return request<Item>('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function updateItem(id: string, data: Partial<Item>) {
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
