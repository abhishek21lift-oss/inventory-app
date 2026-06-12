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
      id: editItem?.id,
      name, sku, category, brand, location, condition,
      quantity: Number(quantity),
      minStock: Number(minStock),
      price: Number(price),
      createdAt: editItem?.createdAt,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div
        className="gradient-card w-full max-w-xl mx-4 p-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              {editItem ? '✏️ Edit Equipment' : '🏋️ Add Equipment'}
            </h2>
            <button onClick={onClose} className="text-white/40 hover:text-white/80 transition text-xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. Olympic Barbell" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">SKU</label>
                <input required value={sku} onChange={e => setSku(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. BB-001" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm">
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Brand</label>
                <input value={brand} onChange={e => setBrand(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. Rogue" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="e.g. Strength Area" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm">
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Quantity</label>
                <input required type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Min Stock</label>
                <input required type="number" min="0" value={minStock} onChange={e => setMinStock(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                {editItem ? 'Update Equipment' : 'Add Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
