import { useState } from 'react'
import type { Item, Category } from '../types'

interface ItemFormProps {
  categories: Category[]
  editItem?: Item
  onSave: (item: Partial<Item> & { id?: string; createdAt?: string }) => void
  onClose: () => void
}

const conditions = ['New', 'Good', 'Fair', 'Needs Service']

export default function ItemForm({ categories, editItem, onSave, onClose }: ItemFormProps) {
  const [name, setName] = useState(editItem?.name ?? '')
  const [sku, setSku] = useState(editItem?.sku ?? '')
  const [category, setCategory] = useState(editItem?.category ?? (categories[0]?.name ?? ''))
  const [brand, setBrand] = useState(editItem?.brand ?? '')
  const [location, setLocation] = useState(editItem?.location ?? '')
  const [condition, setCondition] = useState(editItem?.condition ?? 'New')
  const [quantity, setQuantity] = useState(editItem?.quantity?.toString() ?? '0')
  const [minStock, setMinStock] = useState(editItem?.minStock?.toString() ?? '1')
  const [price, setPrice] = useState(editItem?.price?.toString() ?? '0')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: editItem?.id, name, sku, category, brand, location, condition,
      quantity: Number(quantity), minStock: Number(minStock), price: Number(price),
      createdAt: editItem?.createdAt,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {editItem ? '✏️ Edit Item' : '📦 Add Item'}
              </span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-apple w-full" placeholder="e.g. Olympic Barbell" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">SKU</label>
                <input required value={sku} onChange={e => setSku(e.target.value)} className="input-apple w-full" placeholder="e.g. BB-001" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-apple w-full">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} className="input-apple w-full" placeholder="e.g. Rogue" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="input-apple w-full" placeholder="e.g. Strength Area" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="input-apple w-full">
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Quantity</label>
                <input required type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-apple w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Min Stock</label>
                <input required type="number" min="0" value={minStock} onChange={e => setMinStock(e.target.value)} className="input-apple w-full" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="input-apple w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-light">Cancel</button>
              <button type="submit" className="btn-premium">{editItem ? 'Update' : 'Add Item'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
