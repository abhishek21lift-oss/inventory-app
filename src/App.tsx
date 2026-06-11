import { useState, useCallback } from 'react'
import { InventoryProvider, useInventory } from './InventoryProvider'
import SearchBar from './components/SearchBar'
import ItemList from './components/ItemList'
import ItemForm from './components/ItemForm'
import CategoryManager from './components/CategoryManager'
import type { Item } from './types'
import * as api from './api'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function Dashboard() {
  const { state, dispatch, loading } = useInventory()
  const { items, categories } = state

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | undefined>()
  const [showCategories, setShowCategories] = useState(false)

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchCategory
  })

  const lowStockCount = items.filter(i => i.quantity <= i.minStock && i.quantity > 0).length
  const outOfStockCount = items.filter(i => i.quantity === 0).length

  const handleSave = useCallback(async (data: Partial<Item>) => {
    if (data.id) {
      await api.updateItem(data.id, {
        name: data.name, sku: data.sku, category: data.category,
        quantity: data.quantity, minStock: data.minStock, price: data.price,
      })
      dispatch({ type: 'UPDATE_ITEM', payload: data as Item })
    } else {
      const newItem: Item = {
        id: generateId(),
        name: data.name!,
        sku: data.sku!,
        category: data.category!,
        quantity: data.quantity!,
        minStock: data.minStock!,
        price: data.price!,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      await api.createItem(newItem)
      dispatch({ type: 'ADD_ITEM', payload: newItem })
    }
    setShowForm(false)
    setEditItem(undefined)
  }, [dispatch])

  const handleDelete = useCallback(async (id: string) => {
    await api.deleteItem(id)
    dispatch({ type: 'DELETE_ITEM', payload: id })
  }, [dispatch])

  const handleAddCategory = useCallback(async (name: string) => {
    const id = generateId()
    await api.createCategory(id, name)
    dispatch({ type: 'ADD_CATEGORY', payload: { id, name } })
  }, [dispatch])

  const handleDeleteCategory = useCallback(async (id: string) => {
    await api.deleteCategory(id)
    dispatch({ type: 'DELETE_CATEGORY', payload: id })
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Categories
              </button>
              <button
                onClick={() => { setEditItem(undefined); setShowForm(true) }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                + Add Item
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showCategories && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Manage Categories</h2>
            <CategoryManager
              categories={categories}
              onAdd={handleAddCategory}
              onDelete={handleDeleteCategory}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
          </div>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />

        <ItemList
          items={filtered}
          onEdit={(item) => { setEditItem(item); setShowForm(true) }}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <ItemForm
          categories={categories}
          editItem={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(undefined) }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <InventoryProvider>
      <Dashboard />
    </InventoryProvider>
  )
}
