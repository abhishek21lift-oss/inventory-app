import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchWarehouses, fetchItems, fetchCategories, updateWarehouse } from '../api'
import type { Warehouse, Item, Category } from '../types'
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

const COLORS = ['#0071e3', '#5856D6', '#34C759', '#FF9500', '#FF2D55', '#5AC8FA', '#FFCC00']

const catColorMap: Record<string, string> = {
  'Cardio': 'cat-cardio', 'Strength': 'cat-strength', 'Free Weights': 'cat-free-weights',
  'Machines': 'cat-machines', 'Accessories': 'cat-accessories', 'Supplements': 'cat-supplements', 'Apparel': 'cat-apparel',
}

export default function Warehouses() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editLoc, setEditLoc] = useState('')
  const [toast, setToast] = useState('')
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    try {
      const [whs, its, cats] = await Promise.all([
        fetchWarehouses(), fetchItems({ warehouseId: 'wh1' }), fetchCategories()
      ])
      const wh = whs.find(w => w.id === 'wh1') || whs[0]
      setWarehouse(wh || null)
      setItems(its)
      setCategories(cats)
    } catch { show('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleEdit = async () => {
    if (!warehouse) return
    try {
      await updateWarehouse(warehouse.id, { name: editName, location: editLoc })
      setWarehouse({ ...warehouse, name: editName, location: editLoc })
      show('Updated')
      setEditing(false)
    } catch { show('Failed') }
  }

  const catCount = categories.length
  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const lowItems = items.filter(i => i.quantity > 0 && i.quantity <= i.minStock)
  const outItems = items.filter(i => i.quantity === 0)

  const stockByCat = categories.map(c => ({
    category: c.name,
    total: items.filter(i => i.category === c.name).reduce((s, i) => s + i.quantity, 0),
  })).filter(c => c.total > 0)

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16,1,0.3,1] as const } } }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 bg-gray-100 rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
      </div>
      <div className="h-72 bg-gray-100 rounded-2xl" />
    </div>
  )

  if (!warehouse) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-5xl mb-4 opacity-30">🏭</div>
        <p className="text-gray-500 text-lg font-medium">No warehouse found</p>
        <Link to="/items" className="btn-premium mt-4 inline-flex">Go to Items</Link>
      </div>
    </div>
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Hero */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,113,227,0.25),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#5856D6]/20 rounded-full blur-[100px]" />
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-widest">{warehouse.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/25">🏭</div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{warehouse.name}</h1>
                  <p className="text-blue-200/70 text-sm mt-0.5 font-medium">{warehouse.location || 'No location set'} · ID: {warehouse.id}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setEditing(true); setEditName(warehouse.name); setEditLoc(warehouse.location || '') }}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            >
              ✏️ Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">📦 {items.length} items stored</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">📂 {catCount} categories</span>
            <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-4 py-1.5 text-[11px] font-semibold backdrop-blur-sm border border-white/10">💰 ${totalValue.toLocaleString()} value</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: items.length, icon: '📦', color: '#0071e3' },
          { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: '💰', color: '#34C759' },
          { label: 'Low Stock', value: lowItems.length, icon: '⚠️', color: '#FF9500', alert: lowItems.length > 0 },
          { label: 'Out of Stock', value: outItems.length, icon: '🚫', color: '#FF2D55', alert: outItems.length > 0 },
        ].map(s => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3 }}
            className="premium-card p-5 relative"
          >
            {s.alert && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] font-semibold">{s.label}</p>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ background: `${s.color}15` }}>{s.icon}</div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stock by category donut + items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut */}
        <motion.div variants={fadeUp} className="lg:col-span-1 premium-card p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-1">Stock by Category</h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-4">At {warehouse.name}</p>
          {stockByCat.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400 text-sm">No stock data</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={stockByCat} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {stockByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
                {stockByCat.map((c, i) => (
                  <div key={c.category} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] text-gray-500 font-medium">{c.category}</span>
                    <span className="text-[11px] text-gray-900 font-bold">{c.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Items table */}
        <motion.div variants={fadeUp} className="lg:col-span-2 premium-card overflow-hidden">
          <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Items in Warehouse</h3>
            <Link to="/items" className="text-xs text-blue-600 hover:underline font-semibold">Manage all</Link>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 opacity-50">📦</div>
              <p className="text-gray-400 text-sm font-medium">No items in this warehouse</p>
              <Link to="/items" className="text-blue-600 hover:underline text-xs font-semibold mt-2 inline-block">Add items</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`${item.quantity === 0 ? 'row-out' : item.quantity <= item.minStock ? 'row-low' : ''}`}
                    >
                      <td className="font-semibold text-gray-800">{item.name}</td>
                      <td className="font-mono text-xs text-gray-400">{item.sku}</td>
                      <td>
                        <span className={`cat-pill ${catColorMap[item.category] || 'cat-accessories'}`}>{item.category}</span>
                      </td>
                      <td>
                        <span className={`font-semibold text-xs ${
                          item.condition === 'New' ? 'text-green-600' :
                          item.condition === 'Good' ? 'text-blue-600' :
                          item.condition === 'Fair' ? 'text-orange-600' : 'text-red-600'
                        }`}>{item.condition}</span>
                      </td>
                      <td className="text-right">
                        <span className={`font-extrabold ${item.quantity <= item.minStock ? 'text-orange-600' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="text-right font-semibold text-gray-800">${item.price.toFixed(2)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">✏️ Edit Warehouse</h2>
            <form onSubmit={e => { e.preventDefault(); handleEdit() }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
                <input required value={editName} onChange={e => setEditName(e.target.value)} className="input-apple w-full" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Location</label>
                <input value={editLoc} onChange={e => setEditLoc(e.target.value)} className="input-apple w-full" placeholder="e.g. Lucknow" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="btn-light">Cancel</button>
                <button type="submit" className="btn-premium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </motion.div>
  )
}
