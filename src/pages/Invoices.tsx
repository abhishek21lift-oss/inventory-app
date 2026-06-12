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
    catch { show('Failed') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const statusColor: Record<string, string> = { draft: 'badge-blue', paid: 'badge-green', cancelled: 'badge-red' }

  const handleConfirm = async (id: string) => {
    if (!confirm('Confirm & mark as paid? Stock will be deducted.')) return
    try { await confirmInvoice(id); show('Invoice paid'); load() } catch { show('Failed') }
  }
  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this invoice?')) return
    try { await cancelInvoice(id); show('Cancelled'); load() } catch { show('Failed') }
  }

  const [formCust, setFormCust] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formWh, setFormWh] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formTax, setFormTax] = useState(0)
  const [formItems, setFormItems] = useState<{ itemId: string; quantity: number; unitPrice: number }[]>([])
  const handleAdd = () => setFormItems(f => [...f, { itemId: items[0]?.id || '', quantity: 1, unitPrice: 0 }])
  const handleLine = (i: number, field: string, val: any) => setFormItems(f => { const n = [...f]; n[i] = { ...n[i], [field]: val }; return n })
  const handleRemove = (i: number) => setFormItems(f => f.filter((_, idx) => idx !== i))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCust || !formWh || !formItems.length) return show('Fill all required fields')
    try {
      await createInvoice({ customerName: formCust, customerEmail: formEmail, customerPhone: formPhone, warehouseId: formWh, notes: formNotes, tax: formTax, items: formItems })
      show('Invoice created'); setShowForm(false); setFormCust(''); setFormEmail(''); setFormPhone(''); setFormWh(''); setFormNotes(''); setFormTax(0); setFormItems([]); load()
    } catch { show('Failed') }
  }

  const whMap = Object.fromEntries(warehouses.map(w => [w.id, w.name]))

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Invoices</h1><p className="text-sm text-gray-500 mt-0.5">{invoices.length} total</p></div>
        <button onClick={() => { setFormCust(''); setFormEmail(''); setFormPhone(''); setFormWh(''); setFormNotes(''); setFormTax(0); setFormItems([]); setShowForm(true) }} className="btn-premium flex items-center gap-1.5">+ New Invoice</button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Warehouse</th><th>Total</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="group">
                <td className="font-mono text-xs font-semibold text-gray-800">{inv.invoiceNumber}</td>
                <td className="text-gray-600">{inv.customerName}</td>
                <td className="text-gray-600">{whMap[inv.warehouseId] || inv.warehouseId}</td>
                <td className="text-gray-800 font-semibold">${inv.total.toFixed(2)}</td>
                <td><span className={`badge ${statusColor[inv.status] || 'badge-blue'}`}>{inv.status}</span></td>
                <td className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  {inv.status === 'draft' && (
                    <>
                      <button onClick={() => handleConfirm(inv.id)} className="text-xs bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 border border-green-100 mr-1">Pay</button>
                      <button onClick={() => handleCancel(inv.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">Cancel</button>
                    </>
                  )}
                  {inv.status === 'paid' && <span className="text-xs text-green-600 font-medium">✓ Paid</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-2xl mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">New Invoice</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5">Customer *</label><input required value={formCust} onChange={e => setFormCust(e.target.value)} className="input-apple w-full" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label><input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input-apple w-full" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label><input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="input-apple w-full" /></div>
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5">Warehouse *</label><select required value={formWh} onChange={e => setFormWh(e.target.value)} className="input-apple w-full"><option value="">Select</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</label>
                  <button type="button" onClick={handleAdd} className="text-xs text-blue-600 hover:underline font-semibold">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {formItems.map((line, i) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
                      <select value={line.itemId} onChange={e => handleLine(i, 'itemId', e.target.value)} className="input-apple flex-1 text-xs py-2">
                        <option value="">Select</option>
                        {items.map(it => <option key={it.id} value={it.id}>{it.name} (${it.price})</option>)}
                      </select>
                      <input type="number" min="1" value={line.quantity} onChange={e => handleLine(i, 'quantity', parseInt(e.target.value) || 1)} className="input-apple w-20 text-xs text-center py-2" />
                      <input type="number" step="0.01" min="0" value={line.unitPrice} onChange={e => handleLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="input-apple w-24 text-xs py-2" />
                      <button type="button" onClick={() => handleRemove(i)} className="text-red-500 hover:text-red-700 text-lg px-1">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Tax ($)</label><input type="number" step="0.01" min="0" value={formTax} onChange={e => setFormTax(parseFloat(e.target.value) || 0)} className="input-apple w-full" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Notes</label><input value={formNotes} onChange={e => setFormNotes(e.target.value)} className="input-apple w-full" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-light">Cancel</button>
                <button type="submit" className="btn-premium">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
