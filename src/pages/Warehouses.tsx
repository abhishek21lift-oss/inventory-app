import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchWarehouses, fetchItems, fetchCategories, updateWarehouse } from '../api'
import type { Warehouse, Item, Category } from '../types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Warehouse as WarehouseIcon, Package, DollarSign, AlertTriangle, XCircle, Pencil, X } from 'lucide-react'
import { fmtCurrency } from '../lib/utils'

const PIE_COLORS = ['#c9973a', '#7c1b1b', '#059669', '#2563eb', '#7c3aed', '#d97706', '#0e7490']
const CAT_CLASS: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories', 'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLoc, setEditLoc] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async (whId?: string) => {
    try {
      const [whs, cats] = await Promise.all([fetchWarehouses(), fetchCategories()])
      setWarehouses(whs)
      const wh = whs.find(w => w.id === whId) || whs[0] || null
      setWarehouse(wh)
      setCategories(cats)
      if (wh) {
        const its = await fetchItems({ warehouseId: wh.id })
        setItems(its)
      } else {
        setItems([])
      }
    } catch { show('Failed to load', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const switchWarehouse = async (id: string) => {
    const wh = warehouses.find(w => w.id === id)
    if (!wh) return
    setWarehouse(wh)
    setLoading(true)
    try {
      const its = await fetchItems({ warehouseId: wh.id })
      setItems(its)
    } finally { setLoading(false) }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!warehouse) return
    try {
      await updateWarehouse(warehouse.id, { name: editName, location: editLoc })
      setWarehouse({ ...warehouse, name: editName, location: editLoc })
      show('Warehouse updated')
      setEditing(false)
    } catch { show('Failed to update', 'error') }
  }

  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const lowItems = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock).length
  const outItems = items.filter(i => i.quantity === 0).length

  const stockByCat = categories.map(c => ({
    category: c.name,
    total: items.filter(i => i.category === c.name).reduce((s, i) => s + i.quantity, 0),
  })).filter(c => c.total > 0)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 100 : 200 }} />)}
    </div>
  )

  if (!warehouse) return (
    <div className="empty-state">
      <div className="empty-icon"><WarehouseIcon size={22} style={{ color: 'var(--color-text-muted)' }} /></div>
      <p>No warehouses found</p>
      <span>Contact an administrator to set up warehouses</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="hero-banner" style={{ padding: '20px 24px' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(201,151,58,0.12)',
              border: '1px solid rgba(201,151,58,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <WarehouseIcon size={20} style={{ color: 'var(--color-brand-gold-light)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{warehouse.name}</h1>
                <span className={`badge ${warehouse.isActive ? 'badge-emerald' : 'badge-red'}`}>
                  {warehouse.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {warehouse.location || 'No location set'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={warehouse.id}
              onChange={e => switchWarehouse(e.target.value)}
              className="input"
              style={{ width: 'auto', fontSize: 12 }}
            >
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setEditing(true); setEditName(warehouse.name); setEditLoc(warehouse.location || '') }}
            >
              <Pencil size={13} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Items', value: items.length, icon: Package, color: '#c9973a' },
          { label: 'Total Value', value: fmtCurrency(totalValue), icon: DollarSign, color: '#10b981', raw: true },
          { label: 'Low Stock', value: lowItems, icon: AlertTriangle, color: '#fbbf24', alert: lowItems > 0 },
          { label: 'Out of Stock', value: outItems, icon: XCircle, color: '#f87171', alert: outItems > 0 },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card" style={{ position: 'relative' }}>
              {s.alert && <span style={{ position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</span>
                <div className="stat-icon" style={{ background: `${s.color}18` }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
                {s.raw ? s.value : s.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart + Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Pie */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Stock by Category</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 14 }}>At {warehouse.name}</div>
          {stockByCat.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}><p style={{ fontSize: 12 }}>No stock data</p></div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={stockByCat} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={3}>
                      {stockByCat.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border-med)', borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                {stockByCat.map((c, i) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{c.category}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Items table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Items in {warehouse.name}</span>
            <Link to="/items" style={{ fontSize: 11, color: 'var(--color-brand-gold-light)', fontWeight: 600, textDecoration: 'none' }}>Manage all</Link>
          </div>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p style={{ fontSize: 13 }}>No items in this warehouse</p>
              <Link to="/items" style={{ fontSize: 12, color: 'var(--color-brand-gold-light)', fontWeight: 600 }}>Add items</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className={item.quantity === 0 ? 'row-danger' : item.quantity <= item.minStock ? 'row-warning' : ''}>
                      <td><span className="cell-primary">{item.name}</span></td>
                      <td><span className={`cat-pill ${CAT_CLASS[item.category] || 'cat-accessories'}`}>{item.category}</span></td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: item.condition === 'New' ? '#10b981' : item.condition === 'Good' ? '#60a5fa' : item.condition === 'Fair' ? '#fbbf24' : '#f87171'
                        }}>{item.condition}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: item.quantity === 0 ? '#f87171' : item.quantity <= item.minStock ? '#fbbf24' : 'var(--color-text-primary)' }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-brand-gold-light)', fontWeight: 600, fontSize: 13 }}>
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setEditing(false)}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Edit Warehouse</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditing(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="input-label">Name</label>
                  <input required value={editName} onChange={e => setEditName(e.target.value)} className="input" />
                </div>
                <div className="form-group">
                  <label className="input-label">Location</label>
                  <input value={editLoc} onChange={e => setEditLoc(e.target.value)} className="input" placeholder="e.g. Downtown" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>
      )}
    </div>
  )
}
