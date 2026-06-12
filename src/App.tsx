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
    const q = search.toLowerCase()
    const matchSearch = !q || item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q)
    const matchCategory = !categoryFilter || item.category === categoryFilter
    return matchSearch && matchCategory
  })

  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const lowStockCount = items.filter(i => i.quantity <= i.minStock && i.quantity > 0).length
  const outOfStockCount = items.filter(i => i.quantity === 0).length

  const handleSave = useCallback(async (data: Partial<Item> & { id?: string; createdAt?: string }) => {
    if (data.id) {
      await api.updateItem(data.id, data)
      dispatch({ type: 'UPDATE_ITEM', payload: data as Item })
    } else {
      const newItem: Item = {
        id: generateId(),
        name: data.name!,
        sku: data.sku!,
        category: data.category!,
        brand: data.brand || '',
        location: data.location || '',
        condition: data.condition || 'New',
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
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🏋️</div>
          <p className="text-white/40 text-lg">Loading gym inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <header className="sticky top-0 z-40 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff375f] to-[#5e5ce6] flex items-center justify-center text-lg shadow-lg shadow-[#ff375f]/20">
                💪
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">GYM INVENTORY</h1>
                <p className="text-[10px] text-white/30 tracking-widest uppercase">Equipment &amp; Supplies</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </button>
              <button
                onClick={() => { setEditItem(undefined); setShowForm(true) }}
                className="btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showCategories && (
          <div className="gradient-card p-5">
            <h2 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#5e5ce6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Manage Categories
            </h2>
            <CategoryManager categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="gradient-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Total Items</p>
                <p className="text-2xl font-bold text-white mt-1.5">{items.length}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Equipment & supplies</p>
              </div>
              <div className="stat-ring bg-[#ff375f]/10 text-[#ff375f]">🏋️</div>
            </div>
          </div>
          <div className="gradient-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Total Value</p>
                <p className="text-2xl font-bold text-white mt-1.5">${totalValue.toLocaleString()}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Inventory worth</p>
              </div>
              <div className="stat-ring bg-[#00d4aa]/10 text-[#00d4aa]">💰</div>
            </div>
          </div>
          <div className="gradient-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-[#ffd60a] mt-1.5">{lowStockCount}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Below min threshold</p>
              </div>
              <div className="stat-ring bg-[#ffd60a]/10 text-[#ffd60a]">⚠️</div>
            </div>
          </div>
          <div className="gradient-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-[#ff375f] mt-1.5">{outOfStockCount}</p>
                <p className="text-[11px] text-white/30 mt-0.5">Needs reorder</p>
              </div>
              <div className="stat-ring bg-[#ff375f]/10 text-[#ff375f]">🚫</div>
            </div>
          </div>
        </div>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
        />

        <ItemList items={filtered} onEdit={(item) => { setEditItem(item); setShowForm(true) }} onDelete={handleDelete} />
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
