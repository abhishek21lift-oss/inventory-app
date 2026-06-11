import type { Item, Category } from './types'

const STORAGE_ITEMS = 'inventory_items'
const STORAGE_CATEGORIES = 'inventory_categories'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

const defaultItems: Item[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', quantity: 42, minStock: 10, price: 29.99, createdAt: '2026-01-15' },
  { id: '2', name: 'Mechanical Keyboard', sku: 'MK-002', category: 'Electronics', quantity: 18, minStock: 5, price: 89.99, createdAt: '2026-01-20' },
  { id: '3', name: 'Office Chair', sku: 'OC-003', category: 'Furniture', quantity: 7, minStock: 3, price: 299.99, createdAt: '2026-02-01' },
  { id: '4', name: 'Standing Desk', sku: 'SD-004', category: 'Furniture', quantity: 3, minStock: 2, price: 499.99, createdAt: '2026-02-10' },
  { id: '5', name: 'USB-C Hub', sku: 'UH-005', category: 'Electronics', quantity: 55, minStock: 15, price: 34.99, createdAt: '2026-03-01' },
  { id: '6', name: 'Notebook (Pack of 5)', sku: 'NB-006', category: 'Stationery', quantity: 120, minStock: 20, price: 12.99, createdAt: '2026-03-05' },
  { id: '7', name: 'Monitor 27" 4K', sku: 'MN-007', category: 'Electronics', quantity: 4, minStock: 3, price: 449.99, createdAt: '2026-03-10' },
]

const defaultCategories: Category[] = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Furniture' },
  { id: '3', name: 'Stationery' },
]

export function loadItems(): Item[] {
  return load(STORAGE_ITEMS, defaultItems)
}

export function saveItems(items: Item[]) {
  save(STORAGE_ITEMS, items)
}

export function loadCategories(): Category[] {
  return load(STORAGE_CATEGORIES, defaultCategories)
}

export function saveCategories(categories: Category[]) {
  save(STORAGE_CATEGORIES, categories)
}
