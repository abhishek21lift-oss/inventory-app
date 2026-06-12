import { useEffect, useState } from 'react'
import { fetchInvoices, createInvoice, confirmInvoice, cancelInvoice, fetchWarehouses, fetchItems } from '../api'
import type { Invoice, Warehouse, Item } from '../types'

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    try { const [i, w, it] = await Promise.all([fetchInvoices(), fetchWarehouses(), fetchItems()]); setInvoices(i); setWarehouses(w); setItems(it) }
    catch { show('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const statusColor: Record<string, string> = { draft: 'text-white/40', paid: 'text-[#00d4aa]', cancelled: 'text-[#ff375f]' }

  const handleConfirm = async (id: string) => {
    if (!confirm('Confirm & mark as paid? Stock will be deducted.')) return
    try { await confirmInvoice(id); show('Invoice paid & stock updated'); load() } catch { show('Failed') }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this invoice?')) return
    try { await cancelInvoice(id); show('Invoice cancelled'); load() } catch { show('Failed') }
  }

  // Form state
  const [formCust, setFormCust] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formWh, setFormWh] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formTax, setFormTax] = useState(0)
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitPrice: number }[]>([])

  const handleAdd = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitPrice: 0 }])
  const handleLine = (i: number, field: string, val: any) => {
    setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  }
  const handleRemove = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCust || !formWh || !formItems.length) return show('Fill all required fields')
    try {
      await createInvoice({ customerName: formCust, customerEmail: formEmail, customerPhone: formPhone, warehouseId: formWh, notes: formNotes, tax: formTax, items: formItems })
      show('Invoice created'); setShowForm(false); setFormCust(''); setFormEmail(''); setFormPhone(''); setFormWh(''); setFormNotes(''); setFormTax(0); setFormItems([]); load()
    } catch { show('Failed to create') }
  }

  const whMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Invoices</h1><p className="text-sm text-white/40 mt-0.5">{invoices.length} total</p></div>
        <button onClick={() => { setFormCust(''); setFormEmail(''); setFormPhone(''); setFormWh(''); setFormNotes(''); setFormTax(0); setFormItems([]); setShowForm(true) }} className="btn-primary px-4 py-2.5 text-sm">+ New Invoice</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="table-gym">
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Warehouse</th><th>Total</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="group">
                <td className="font-mono text-xs text-white font-medium">{inv.invoiceNumber}</td>
                <td className="text-white/70">{inv.customerName}</td>
                <td className="text-white/70">{whMap[inv.warehouseId] || inv.warehouseId}</td>
                <td className="text-white font-medium">${inv.total.toFixed(2)}</td>
                <td><span className={`text-xs font-medium capitalize ${statusColor[inv.status] || 'text-white/40'}`}>{inv.status}</span></td>
                <td className="text-xs text-white/30">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  {inv.status === 'draft' && (
                    <>
                      <button onClick={() => handleConfirm(inv.id)} className="px-2 py-1.5 text-xs rounded-lg bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 text-[#00d4aa]">Pay</button>
                      <button onClick={() => handleCancel(inv.id)} className="px-2 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1">Cancel</button>
                    </>
                  )}
                  {inv.status === 'paid' && <span className="text-xs text-white/30">✓ Paid</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="gradient-card w-full max-w-2xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">New Invoice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Customer Name *</label>
                  <input required value={formCust} onChange={e => setFormCust(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" />
                </div>
                <div><label className="block text-xs font-medium text-white/50 mb-1.5">Email</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
                <div><label className="block text-xs font-medium text-white/50 mb-1.5">Phone</label><input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Warehouse *</label>
                  <select required value={formWh} onChange={e => setFormWh(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm">
                    <option value="">Select warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Items</label>
                  <button type="button" onClick={handleAdd} className="text-xs text-[#5e5ce6] hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {formItems.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={line.itemId} onChange={e => handleLine(i, 'itemId', e.target.value)} className="input-neon flex-1 px-3 py-2 text-xs">
                        <option value="">Select item</option>
                        {items.map(it => <option key={it.id} value={it.id}>{it.name} (${it.price.toFixed(2)})</option>)}
                      </select>
                      <input type="number" min="1" value={line.quantity} onChange={e => handleLine(i, 'quantity', parseInt(e.target.value) || 1)} className="input-neon w-20 px-3 py-2 text-xs text-center" />
                      <input type="number" step="0.01" min="0" value={line.unitPrice} onChange={e => handleLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="input-neon w-24 px-3 py-2 text-xs" />
                      <button type="button" onClick={() => handleRemove(i)} className="text-red-400 hover:text-red-300 text-xs px-2">&times;</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Tax ($)</label>
                  <input type="number" step="0.01" min="0" value={formTax} onChange={e => setFormTax(parseFloat(e.target.value) || 0)} className="input-neon w-full px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Notes</label>
                  <input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-neon w-full px-3 py-2.5 text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
