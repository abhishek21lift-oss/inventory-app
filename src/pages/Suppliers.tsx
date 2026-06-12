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

  const load = async () => { try { setSuppliers(await fetchSuppliers()) } catch { show('Failed to load') } finally { setLoading(false) } }
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

  const openEdit = (s: Supplier) => { setEdit(s); setForm(s); setShowForm(true) }
  const openNew = () => { setEdit(undefined); setForm({ name: '', contactPerson: '', email: '', phone: '', address: '' }); setShowForm(true) }

  if (loading) return <div className="text-white/40 text-center py-20 text-lg">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Suppliers</h1><p className="text-sm text-white/40 mt-0.5">{suppliers.length} vendors</p></div>
        <button onClick={openNew} className="btn-primary px-4 py-2.5 text-sm">+ Add Supplier</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="table-gym">
          <thead>
            <tr><th className="text-left">Name</th><th className="text-left">Contact</th><th className="text-left">Email</th><th className="text-left">Phone</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} className="group">
                <td className="font-medium text-white">{s.name}</td>
                <td className="text-white/60">{s.contactPerson || '—'}</td>
                <td className="text-white/60">{s.email || '—'}</td>
                <td className="text-white/60">{s.phone || '—'}</td>
                <td className="text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.isActive ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'bg-red-500/10 text-red-400'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="text-right opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(s)} className="px-2 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="px-2 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 ml-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={() => setShowForm(false)}>
          <div className="gradient-card w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">{edit ? 'Edit Supplier' : 'New Supplier'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-medium text-white/50 mb-1.5">Name *</label><input required value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Contact Person</label><input value={form.contactPerson || ''} onChange={e => setForm(f => ({...f, contactPerson: e.target.value}))} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Email</label><input type="email" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Phone</label><input value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-white/50 mb-1.5">Address</label><input value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} className="input-neon w-full px-3 py-2.5 text-sm" /></div>
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">{edit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
