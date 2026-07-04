import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchPurchaseOrders, createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder, fetchSuppliers, fetchWarehouses, fetchItems } from '../api'
import type { PurchaseOrder, Supplier, Warehouse, Item } from '../types'
import { ClipboardList, Plus, X, Check, XCircle, Trash2 } from 'lucide-react'
import { fmtDate, fmtCurrency } from '../lib/utils'

const STATUS_BADGE: Record<string, string> = { pending: 'badge-yellow', received: 'badge-emerald', cancelled: 'badge-red' }

export default function PurchaseOrders() {
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try {
      const [p, s, w, i] = await Promise.all([fetchPurchaseOrders(), fetchSuppliers(), fetchWarehouses(), fetchItems()])
      setPos(p); setSuppliers(s); setWarehouses(w); setItems(i)
    } catch { show('Failed to load', 'error') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleReceive = async (id: string) => {
    if (!confirm('Mark as received? This will add stock.')) return
    try { await receivePurchaseOrder(id); show('PO received'); load() } catch { show('Failed', 'error') }
  }
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this purchase order?')) return
    try { await cancelPurchaseOrder(id); show('Cancelled'); load() } catch { show('Failed', 'error') }
  }

  const [formSupplier, setFormSupplier] = useState('')
  const [formWarehouse, setFormWarehouse] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitCost: number }[]>([])

  const handleAddLine = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitCost: 0 }])
  const handleLineChange = (i: number, field: string, val: any) =>
    setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  const handleRemoveLine = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const openForm = () => {
    setFormSupplier(''); setFormWarehouse(''); setFormNotes(''); setFormItems([])
    setShowForm(true)
  }

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formSupplier || !formWarehouse || !formItems.length) return show('Fill all required fields', 'error')
    try {
      await createPurchaseOrder({ supplierId: formSupplier, warehouseId: formWarehouse, notes: formNotes, items: formItems })
      show('Purchase order created')
      setShowForm(false); load()
    } catch { show('Failed to create PO', 'error') }
  }

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]))
  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))
  const formTotal = formItems.reduce((s, l) => s + l.quantity * l.unitCost, 0)

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 50 }} />
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">{pos.length} order{pos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openForm}>
          <Plus size={14} /> New PO
        </button>
      </div>

      {pos.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><ClipboardList size={20} style={{ color: 'var(--color-text-muted)' }} /></div>
          <p>No purchase orders</p>
          <span>Create a purchase order to restock inventory</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map(po => (
                <tr key={po.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-brand-gold-light)', fontWeight: 600 }}>{po.poNumber}</span></td>
                  <td><span className="cell-primary">{supplierMap[po.supplierId] || po.supplierId}</span></td>
                  <td>{warehouseMap[po.warehouseId] || po.warehouseId}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>{fmtCurrency(po.totalAmount)}</td>
                  <td><span className={`badge ${STATUS_BADGE[po.status] || 'badge-blue'}`}>{po.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{fmtDate(po.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
                      {po.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(5,150,105,0.12)', color: '#10b981', border: '1px solid rgba(5,150,105,0.2)' }}
                            onClick={() => handleReceive(po.id)}
                          >
                            <Check size={12} /> Receive
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleCancel(po.id)} title="Cancel">
                            <XCircle size={12} />
                          </button>
                        </>
                      )}
                      {po.status === 'received' && (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ✓ {po.receivedAt ? fmtDate(po.receivedAt) : 'Received'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create PO modal */}
      {showForm && (
        <div className="modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: 40, paddingBottom: 40, overflowY: 'auto' }} onClick={() => setShowForm(false)}>
          <motion.div
            className="modal modal-lg"
            style={{ maxHeight: 'none' }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(201,151,58,0.12)', border: '1px solid rgba(201,151,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={15} style={{ color: 'var(--color-brand-gold-light)' }} />
                </div>
                <h2 className="modal-title">New Purchase Order</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreatePO}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Supplier *</label>
                    <select required value={formSupplier} onChange={e => setFormSupplier(e.target.value)} className="input">
                      <option value="">Select supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Warehouse *</label>
                    <select required value={formWarehouse} onChange={e => setFormWarehouse(e.target.value)} className="input">
                      <option value="">Select warehouse</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Notes</label>
                  <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input" placeholder="Optional notes" />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label className="input-label" style={{ margin: 0 }}>Line Items</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddLine}>
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  {formItems.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--color-text-muted)', fontSize: 12, border: '1px dashed var(--color-border)', borderRadius: 10 }}>
                      Click "Add Item" to add line items
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formItems.map((line, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr 80px 100px 32px', gap: 6, alignItems: 'center',
                        background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                        borderRadius: 10, padding: 10
                      }}>
                        <select value={line.itemId} onChange={e => handleLineChange(i, 'itemId', e.target.value)} className="input" style={{ fontSize: 12, padding: '6px 10px' }}>
                          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                        <input type="number" min="1" value={line.quantity} onChange={e => handleLineChange(i, 'quantity', parseInt(e.target.value) || 1)} className="input" style={{ fontSize: 12, padding: '6px 10px', textAlign: 'center' }} placeholder="Qty" />
                        <input type="number" step="0.01" min="0" value={line.unitCost} onChange={e => handleLineChange(i, 'unitCost', parseFloat(e.target.value) || 0)} className="input" style={{ fontSize: 12, padding: '6px 10px' }} placeholder="Unit cost" />
                        <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveLine(i)}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {formItems.length > 0 && (
                  <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--color-brand-gold-light)' }}>
                    Total: {fmtCurrency(formTotal)}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create PO</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>{toast.msg}</div>}
      <style>{`.table tbody tr:hover .action-group { opacity: 1 !important; }`}</style>
    </div>
  )
}
