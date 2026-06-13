import { useEffect, useState } from 'react'
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api'
import type { Supplier } from '../types'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [edit, setEdit] = useState<Supplier | undefined>()
  const [form, setForm] = useState<Partial<Supplier>>({})
  const [toast, setToast] = useState('')
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const load = async () => { try { setSuppliers(await fetchSuppliers()) } catch { show('Failed') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (edit) { await updateSupplier(edit.id, form); show('Updated') }
      else { await createSupplier(form); show('Created') }
      setShowForm(false); setEdit(undefined); setForm({}); load()
    } catch { show('Failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    try { await deleteSupplier(id); show('Deleted'); load() } catch { show('Failed') }
  }

  if (loading) return <div className="text-center py-20 text-lg text-white/50 font-medium">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">Suppliers</span>
          </h1>
          <p className="text-sm text-blue-200/70 mt-0.5">{suppliers.length} vendors</p>
        </div>
        <button onClick={() => { setEdit(undefined); setForm({ name: '', contactPerson: '', email: '', phone: '', address: '' }); setShowForm(true) }} className="btn-premium flex items-center gap-1.5">+ Add Supplier</button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="table-premium">
          <thead>
            <tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} className="group">
                <td className="font-semibold text-gray-800">{s.name}</td>
                <td className="text-gray-500">{s.contactPerson || '—'}</td>
                <td className="text-gray-500">{s.email || '—'}</td>
                <td className="text-gray-500">{s.phone || '—'}</td>
                <td className="text-center"><span className={`badge ${s.isActive ? 'badge-green' : 'badge-red'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEdit(s); setForm(s); setShowForm(true) }} className="btn-light text-xs px-2.5 py-1.5 mr-1">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-xs bg-gradient-to-r from-red-50 to-rose-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:from-red-100 hover:to-rose-100 border border-red-200 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 shadow-2xl shadow-rose-500/20 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-bold">
                <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">{edit ? 'Edit Supplier' : 'New Supplier'}</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">{edit ? 'Update supplier details' : 'Add a new supplier to your network'}</p>
              <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5">Name *</label><input required value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-apple w-full" placeholder="Supplier name" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact</label><input value={form.contactPerson || ''} onChange={e => setForm(f => ({...f, contactPerson: e.target.value}))} className="input-apple w-full" placeholder="Contact person" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-apple w-full" placeholder="vendor@example.com" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-apple w-full" placeholder="+1 234 567 890" /></div>
                <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="input-apple w-full" placeholder="Address" /></div>
                <div className="col-span-2 flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-light">Cancel</button>
                  <button type="submit" className="btn-premium">{edit ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
