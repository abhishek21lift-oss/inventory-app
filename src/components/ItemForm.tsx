import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Item, Category } from '../types'
import { X, Package } from 'lucide-react'

interface ItemFormProps {
  categories: Category[]
  editItem?: Item
  onSave: (item: Partial<Item> & { id?: string; createdAt?: string }) => void
  onClose: () => void
}

const CONDITIONS = ['New', 'Good', 'Fair', 'Needs Service']

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
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          className="modal modal-lg"
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(201,151,58,0.12)',
                border: '1px solid rgba(201,151,58,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Package size={15} style={{ color: 'var(--color-brand-gold-light)' }} />
              </div>
              <h2 className="modal-title">{editItem ? 'Edit Item' : 'Add New Item'}</h2>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Item Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="e.g. Olympic Barbell" />
                </div>
                <div className="form-group">
                  <label className="input-label">SKU</label>
                  <input required value={sku} onChange={e => setSku(e.target.value)} className="input" placeholder="e.g. BB-001" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Condition</label>
                  <select value={condition} onChange={e => setCondition(e.target.value)} className="input">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Brand</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)} className="input" placeholder="e.g. Rogue" />
                </div>
                <div className="form-group">
                  <label className="input-label">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="e.g. Strength Area" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Quantity</label>
                  <input required type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="input" />
                </div>
                <div className="form-group">
                  <label className="input-label">Min Stock Alert</label>
                  <input required type="number" min="0" value={minStock} onChange={e => setMinStock(e.target.value)} className="input" />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Unit Price (USD)</label>
                <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="input" />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                {editItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
