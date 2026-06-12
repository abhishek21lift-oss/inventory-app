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

  if (loading) return <div className="text-center py-20 text-lg text-gray-400 font-medium">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Suppliers</h1><p className="text-sm text-gray-500 mt-0.5">{suppliers.length} vendors</p></div>
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
                  <button onClick={() => handleDelete(s.id)} className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 border border-red-100">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-lg mx-4 p-6 border border-gray-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{edit ? 'Edit Supplier' : 'New Supplier'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-semibold text-gray-500 mb-1.5">Name *</label><input required value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-apple w-full" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact</label><input value={form.contactPerson || ''} onChange={e => setForm(f => ({...f, contactPerson: e.target.value}))} className="input-apple w-full" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-apple w-full" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-apple w-full" /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="input-apple w-full" /></div>
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-light">Cancel</button>
                <button type="submit" className="btn-premium">{edit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
