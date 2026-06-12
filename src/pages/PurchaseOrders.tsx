import { useEffect, useState } from 'react'
import { fetchPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder, fetchSuppliers, fetchWarehouses, fetchItems } from '../api'
import type { PurchaseOrder, Supplier, Warehouse, Item } from '../types'

export default function PurchaseOrders() {
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    try {
      const [p, s, w, i] = await Promise.all([fetchPurchaseOrders(), fetchSuppliers(), fetchWarehouses(), fetchItems()])
      setPos(p); setSuppliers(s); setWarehouses(w); setItems(i)
    } catch { show('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const statusColor: Record<string, string> = { pending: 'text-[#ff9f0a]', received: 'text-[#00d4aa]', cancelled: 'text-[#ff375f]' }

  const handleReceive = async (id: string) => {
    if (!confirm('Mark this PO as fully received? Stock will be added.')) return
    try { await receivePurchaseOrder(id); show('PO received & stock updated'); load() } catch { show('Failed') }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this PO?')) return
    try { await cancelPurchaseOrder(id); show('PO cancelled'); load() } catch { show('Failed') }
  }

  // PO form state
  const [formSupplier, setFormSupplier] = useState('')
  const [formWarehouse, setFormWarehouse] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitCost: number }[]>([])

  const handleAddLine = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitCost: 0 }])
  const handleLineChange = (i: number, field: string, val: any) => {
    setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  }
  const handleRemoveLine = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSupplier || !formWarehouse || !formItems.length) return show('Fill all required fields')
    try {
      await createPurchaseOrder({ supplierId: formSupplier, warehouseId: formWarehouse, notes: formNotes, items: formItems })
      show('PO created'); setShowForm(false); setFormSupplier(''); setFormWarehouse(''); setFormNotes(''); setFormItems([]); load()
    } catch { show('Failed to create PO') }
  }

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]))
  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Purchase Orders</h1><p className="text-sm text-white/40 mt-0.5">{pos.length} orders</p></div>
        <button onClick={() => { setFormSupplier(''); setFormWarehouse(''); setFormNotes(''); setFormItems([]); setShowForm(true) }} className="btn-primary px-4 py-2.5 text-sm">+ New PO</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="table-gym">
          <thead>
            <tr><th>PO #</th><th>Supplier</th><th>Warehouse</th><th>Total</th><th>Status</th><th>Created</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id} className="group">
                <td className="font-mono text-xs text-white font-medium">{po.poNumber}</td>
                <td className="text-white/70">{supplierMap[po.supplierId] || po.supplierId}</td>
                <td className="text-white/70">{warehouseMap[po.warehouseId] || po.warehouseId}</td>
                <td className="text-white font-medium">${po.totalAmount.toFixed(2)}</td>
                <td><span className={`text-xs font-medium capitalize ${statusColor[po.status] || 'text-white/40'}`}>{po.status}</span></td>
                <td className="text-xs text-white/30">{new Date(po.createdAt).toLocaleDateString()}</td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  {po.status === 'pending' && (
                    <>
                      <button onClick={() => handleReceive(po.id)} className="px-2 py-1.5 text-xs rounded-lg bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa]">Receive</button>
                      <button onClick={() => handleCancel(po.id)} className="px-2 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1">Cancel</button>
                    </>
                  )}
                  {po.status === 'received' && <span className="text-xs text-white/30">✓ Received {po.receivedAt ? new Date(po.receivedAt).toLocaleDateString() : ''}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="gradient-card w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">New Purchase Order</h2>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Supplier *</label>
                  <select required value={formSupplier} onChange={e => setFormSupplier(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm">
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Warehouse *</label>
                  <select required value={formWarehouse} onChange={e => setFormWarehouse(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm">
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Notes</label>
                <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" placeholder="Optional notes" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Items</label>
                  <button type="button" onClick={handleAddLine} className="text-xs text-[#5e5ce6] hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {formItems.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={line.itemId} onChange={e => handleLineChange(i, 'itemId', e.target.value)} className="input-neon flex-1 px-3 py-2 text-xs">
                        <option value="">Select item</option>
                        {items.map(it => <option key={it.id} value={it.id}>{it.name} (${it.price.toFixed(2)})</option>)}
                      </select>
                      <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(i, 'quantity', parseInt(e.target.value) || 1)} className="input-neon w-20 px-3 py-2 text-xs text-center" placeholder="Qty" />
                      <input type="number" step="0.01" min="0" value={line.unitCost} onChange={e => handleLineChange(i, 'unitCost', parseFloat(e.target.value) || 0)} className="input-neon w-24 px-3 py-2 text-xs" placeholder="$ Cost" />
                      <button type="button" onClick={() => handleRemoveLine(i)} className="text-red-400 hover:text-red-300 text-xs px-2">&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Create PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
