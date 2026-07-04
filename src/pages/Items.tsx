import { useEffect, useState, useMemo, useCallback } from 'react'
import { fetchItems, fetchCategories, createItem, updateItem, deleteItem, adjustStock, duplicateItem, createCategory, updateCategory, deleteCategory } from '../api'
import type { Item, Category, SortField, SortDir } from '../types'
import SearchBar from '../components/SearchBar'
import ItemList from '../components/ItemList'
import ItemForm from '../components/ItemForm'
import ItemDetail from '../components/ItemDetail'
import CategoryManager from '../components/CategoryManager'
import { Package, Tag } from 'lucide-react'

export default function Items() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Item | undefined>()
  const [detailItem, setDetailItem] = useState<Item | undefined>()
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try {
      const [its, cats] = await Promise.all([
        fetchItems({ search: search || undefined, category: categoryFilter || undefined, condition: conditionFilter || undefined }),
        fetchCategories()
      ])
      setItems(its); setCategories(cats)
    } catch { showToast('Failed to load', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let result = [...items]
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'quantity' || sortField === 'price') cmp = (a[sortField] as number) - (b[sortField] as number)
      else cmp = (a[sortField] || '').toString().localeCompare((b[sortField] || '').toString())
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [items, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleSave = useCallback(async (data: Partial<Item> & { id?: string; createdAt?: string }) => {
    try {
      if (data.id) { await updateItem(data.id, data); showToast('Item updated') }
      else {
        await createItem({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name: data.name!, sku: data.sku!, category: data.category!,
          brand: data.brand || '', location: data.location || '', condition: data.condition || 'New',
          quantity: data.quantity!, minStock: data.minStock!, price: data.price!,
          createdAt: new Date().toISOString().slice(0, 10),
        })
        showToast('Item added')
      }
      load()
    } catch { showToast('Failed to save', 'error') }
    setShowForm(false); setEditItem(undefined)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    try { await deleteItem(id); showToast('Item deleted'); load() } catch { showToast('Delete failed', 'error') }
  }, [])

  const handleDuplicate = useCallback(async (id: string) => {
    try { await duplicateItem(id); showToast('Item duplicated'); load() } catch { showToast('Duplicate failed', 'error') }
  }, [])

  const handleAdjustStock = useCallback(async (id: string, change: number, note?: string) => {
    try { await adjustStock(id, change, note); showToast(change > 0 ? `+${change} added` : `${change} removed`); load() } catch { showToast('Stock update failed', 'error') }
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="skeleton" style={{ height: 50 }} />
      <div className="skeleton" style={{ height: 44 }} />
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Items</h1>
          <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in inventory</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowCategoryManager(true)}>
            <Tag size={13} /> Categories
          </button>
          <button className="btn btn-primary" onClick={() => { setEditItem(undefined); setShowForm(true) }}>
            <Package size={14} /> Add Item
          </button>
        </div>
      </div>

      <SearchBar
        search={search} onSearchChange={setSearch}
        categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter}
        conditionFilter={conditionFilter} onConditionChange={setConditionFilter}
        categories={categories}
      />

      <ItemList
        items={filtered} sortField={sortField} sortDir={sortDir} onSort={handleSort}
        onEdit={(item) => { setEditItem(item); setShowForm(true) }}
        onDelete={handleDelete} onDuplicate={handleDuplicate}
        onAdjustStock={handleAdjustStock} onSelectItem={setDetailItem}
      />

      {showForm && (
        <ItemForm
          categories={categories} editItem={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(undefined) }}
        />
      )}

      {detailItem && (
        <ItemDetail
          item={detailItem} onClose={() => setDetailItem(undefined)}
          onEdit={(item) => { setDetailItem(undefined); setEditItem(item); setShowForm(true) }}
          onAdjustStock={handleAdjustStock}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onAdd={async (name) => {
            try {
              const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
              await createCategory(id, name)
              showToast('Category added')
              load()
            } catch { showToast('Failed to add category', 'error') }
          }}
          onUpdate={async (id, name) => {
            try {
              await updateCategory(id, name)
              showToast('Category renamed')
              load()
            } catch { showToast('Failed to rename', 'error') }
          }}
          onDelete={async (id) => {
            try {
              await deleteCategory(id)
              showToast('Category deleted')
              load()
            } catch { showToast('Failed to delete', 'error') }
          }}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.message}</div>}
    </div>
  )
}
