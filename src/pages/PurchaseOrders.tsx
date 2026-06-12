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
    } catch { show('Failed') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const statusColor: Record<string, string> = { pending: 'badge-yellow', received: 'badge-green', cancelled: 'badge-red' }

  const handleReceive = async (id: string) => {
    if (!confirm('Mark as fully received? Stock will be added.')) return
    try { await receivePurchaseOrder(id); show('PO received'); load() } catch { show('Failed') }
  }
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this PO?')) return
    try { await cancelPurchaseOrder(id); show('Cancelled'); load() } catch { show('Failed') }
  }

  const [formSupplier, setFormSupplier] = useState('')
  const [formWarehouse, setFormWarehouse] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitCost: number }[]>([])
  const handleAddLine = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitCost: 0 }])
  const handleLineChange = (i: number, field: string, val: any) => setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  const handleRemoveLine = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSupplier || !formWarehouse || !formItems.length) return show('Fill all required fields')
    try {
      await createPurchaseOrder({ supplierId: formSupplier, warehouseId: formWarehouse, notes: formNotes, items: formItems })
      show('PO created'); setShowForm(false); setFormSupplier(''); setFormWarehouse(''); setFormNotes(''); setFormItems([]); load()
    } catch { show('Failed') }
  }

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]))
  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1><p className="text-sm text-gray-500 mt-0.5">{pos.length} orders</p></div>
        <button onClick={() => { setFormSupplier(''); setFormWarehouse(''); setFormNotes(''); setFormItems([]); setShowForm(true) }} className="btn-primary flex items-center gap-1.5">+ New PO</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="table-gym">
          <thead>
            <tr><th>PO #</th><th>Supplier</th><th>Warehouse</th><th>Total</th><th>Status</th><th>Created</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id} className="group">
                <td className="font-mono text-xs font-semibold text-gray-800">{po.poNumber}</td>
                <td className="text-gray-600">{supplierMap[po.supplierId] || po.supplierId}</td>
                <td className="text-gray-600">{warehouseMap[po.warehouseId] || po.warehouseId}</td>
                <td className="text-gray-800 font-semibold">${po.totalAmount.toFixed(2)}</td>
                <td><span className={`badge ${statusColor[po.status] || 'badge-blue'}`}>{po.status}</span></td>
                <td className="text-xs text-gray-400">{new Date(po.createdAt).toLocaleDateString()}</td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  {po.status === 'pending' && (
                    <>
                      <button onClick={() => handleReceive(po.id)} className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 border border-green-100 mr-1">Receive</button>
                      <button onClick={() => handleCancel(po.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">Cancel</button>
                    </>
                  )}
                  {po.status === 'received' && <span className="text-xs text-green-600 font-medium">Received {po.receivedAt ? new Date(po.receivedAt).toLocaleDateString() : ''}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-2xl mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">New Purchase Order</h2>
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Supplier *</label>
                  <select required value={formSupplier} onChange={e => setFormSupplier(e.target.value)} className="input-gym w-full">
                    <option value="">Select supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Warehouse *</label>
                  <select required value={formWarehouse} onChange={e => setFormWarehouse(e.target.value)} className="input-gym w-full">
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes</label>
                <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-gym w-full" placeholder="Optional notes" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</label>
                  <button type="button" onClick={handleAddLine} className="text-xs text-blue-600 hover:underline font-semibold">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {formItems.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                      <select value={line.itemId} onChange={e => handleLineChange(i, 'itemId', e.target.value)} className="input-gym flex-1 text-xs py-2">
                        <option value="">Select item</option>
                        {items.map(it => <option key={it.id} value={it.id}>{it.name} (${it.price})</option>)}
                      </select>
                      <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(i, 'quantity', parseInt(e.target.value) || 1)} className="input-gym w-20 text-xs text-center py-2" />
                      <input type="number" step="0.01" min="0" value={line.unitCost} onChange={e => handleLineChange(i, 'unitCost', parseFloat(e.target.value) || 0)} className="input-gym w-24 text-xs py-2" />
                      <button type="button" onClick={() => handleRemoveLine(i)} className="text-red-500 hover:text-red-700 text-lg px-1">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
