import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchInvoices, createInvoice, confirmInvoice, cancelInvoice, fetchWarehouses, fetchItems } from '../api'
import type { Invoice, Warehouse, Item } from '../types'
import { Receipt, Plus, X, Check, XCircle, Trash2 } from 'lucide-react'
import { fmtDate, fmtCurrency } from '../lib/utils'

const STATUS_BADGE: Record<string, string> = { draft: 'badge-blue', paid: 'badge-emerald', cancelled: 'badge-red' }

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
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
      const [i, w, it] = await Promise.all([fetchInvoices(), fetchWarehouses(), fetchItems()])
      setInvoices(i); setWarehouses(w); setItems(it)
    } catch { show('Failed to load', 'error') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleConfirm = async (id: string) => {
    if (!confirm('Mark as paid? Stock will be deducted.')) return
    try { await confirmInvoice(id); show('Invoice marked as paid'); load() } catch { show('Failed', 'error') }
  }
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this invoice?')) return
    try { await cancelInvoice(id); show('Invoice cancelled'); load() } catch { show('Failed', 'error') }
  }

  const [formCust, setFormCust] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formWh, setFormWh] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formTax, setFormTax] = useState(0)
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitPrice: number }[]>([])

  const handleAddLine = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitPrice: 0 }])
  const handleLine = (i: number, field: string, val: any) =>
    setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  const handleRemoveLine = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const openForm = () => {
    setFormCust(''); setFormEmail(''); setFormPhone(''); setFormWh('')
    setFormNotes(''); setFormTax(0); setFormItems([])
    setShowForm(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCust || !formWh || !formItems.length) return show('Fill all required fields', 'error')
    try {
      await createInvoice({ customerName: formCust, customerEmail: formEmail, customerPhone: formPhone, warehouseId: formWh, notes: formNotes, tax: formTax, items: formItems })
      show('Invoice created')
      setShowForm(false); load()
    } catch { show('Failed to create invoice', 'error') }
  }

  const whMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))
  const subtotal = formItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
  const total = subtotal + formTax

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
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openForm}>
          <Plus size={14} /> New Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Receipt size={20} style={{ color: 'var(--color-text-muted)' }} /></div>
          <p>No invoices yet</p>
          <span>Create an invoice to record a sale</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Warehouse</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-brand-gold-light)', fontWeight: 600 }}>{inv.invoiceNumber}</span></td>
                  <td><span className="cell-primary">{inv.customerName}</span></td>
                  <td>{whMap[inv.warehouseId] || inv.warehouseId}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-text-primary)' }}>{fmtCurrency(inv.total)}</td>
                  <td><span className={`badge ${STATUS_BADGE[inv.status] || 'badge-gray'}`}>{inv.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{fmtDate(inv.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
                      {inv.status === 'draft' && (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'rgba(5,150,105,0.12)', color: '#10b981', border: '1px solid rgba(5,150,105,0.2)' }}
                            onClick={() => handleConfirm(inv.id)}
                          >
                            <Check size={12} /> Paid
                          </button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleCancel(inv.id)} title="Cancel">
                            <XCircle size={12} />
                          </button>
                        </>
                      )}
                      {inv.status === 'paid' && (
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Paid</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={15} style={{ color: '#10b981' }} />
                </div>
                <h2 className="modal-title">New Invoice</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="input-label">Customer Name *</label>
                  <input required value={formCust} onChange={e => setFormCust(e.target.value)} className="input" placeholder="Customer name" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Email</label>
                    <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input" placeholder="customer@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Phone</label>
                    <input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="input" placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="input-label">Warehouse *</label>
                  <select required value={formWh} onChange={e => setFormWh(e.target.value)} className="input">
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
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
                        <select value={line.itemId} onChange={e => handleLine(i, 'itemId', e.target.value)} className="input" style={{ fontSize: 12, padding: '6px 10px' }}>
                          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                        <input type="number" min="1" value={line.quantity} onChange={e => handleLine(i, 'quantity', parseInt(e.target.value) || 1)} className="input" style={{ fontSize: 12, padding: '6px 10px', textAlign: 'center' }} placeholder="Qty" />
                        <input type="number" step="0.01" min="0" value={line.unitPrice} onChange={e => handleLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="input" style={{ fontSize: 12, padding: '6px 10px' }} placeholder="Price" />
                        <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => handleRemoveLine(i)}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Tax ($)</label>
                    <input type="number" step="0.01" min="0" value={formTax} onChange={e => setFormTax(parseFloat(e.target.value) || 0)} className="input" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Notes</label>
                    <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input" placeholder="Optional notes" />
                  </div>
                </div>

                {formItems.length > 0 && (
                  <div style={{
                    background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <span>Subtotal</span><span>{fmtCurrency(subtotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                      <span>Tax</span><span>{fmtCurrency(formTax)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--color-brand-gold-light)', borderTop: '1px solid var(--color-border)', paddingTop: 6, marginTop: 4 }}>
                      <span>Total</span><span>{fmtCurrency(total)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
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
