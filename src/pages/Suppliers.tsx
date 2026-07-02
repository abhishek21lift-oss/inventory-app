import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api'
import type { Supplier } from '../types'
import { Truck, Plus, Pencil, Trash2, X } from 'lucide-react'
import { fmtDate } from '../lib/utils'

const EMPTY_FORM: Partial<Supplier> = { name: '', contactPerson: '', email: '', phone: '', address: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [edit, setEdit] = useState<Supplier | undefined>()
  const [form, setForm] = useState<Partial<Supplier>>(EMPTY_FORM)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    try { setSuppliers(await fetchSuppliers()) } catch { show('Failed to load', 'error') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEdit(undefined); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (s: Supplier) => { setEdit(s); setForm(s); setShowForm(true) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (edit) { await updateSupplier(edit.id, form); show('Supplier updated') }
      else { await createSupplier(form); show('Supplier created') }
      setShowForm(false); setEdit(undefined); setForm(EMPTY_FORM); load()
    } catch { show('Failed to save', 'error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this supplier?')) return
    try { await deleteSupplier(id); show('Deleted'); load() } catch { show('Delete failed', 'error') }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 50 }} />
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">{suppliers.length} vendor{suppliers.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={14} /> Add Supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Truck size={20} style={{ color: 'var(--color-text-muted)' }} /></div>
          <p>No suppliers yet</p>
          <span>Add your first supplier to get started</span>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th>Since</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} onClick={() => openEdit(s)}>
                  <td><span className="cell-primary">{s.name}</span></td>
                  <td>{s.contactPerson || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                  <td>
                    {s.email
                      ? <a href={`mailto:${s.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--color-brand-gold-light)', fontSize: 12, textDecoration: 'none' }}>{s.email}</a>
                      : <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    }
                  </td>
                  <td>{s.phone || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${s.isActive ? 'badge-emerald' : 'badge-red'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{fmtDate(s.createdAt)}</td>
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div className="action-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(s)} title="Edit">
                        <Pencil size={12} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(s.id)} title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(201,151,58,0.12)', border: '1px solid rgba(201,151,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={15} style={{ color: 'var(--color-brand-gold-light)' }} />
                </div>
                <h2 className="modal-title">{edit ? 'Edit Supplier' : 'New Supplier'}</h2>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="input-label">Company Name *</label>
                  <input required value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Supplier name" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Contact Person</label>
                    <input value={form.contactPerson || ''} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} className="input" placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Email</label>
                    <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="vendor@example.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Phone</label>
                    <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="+1 234 567 890" />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Address</label>
                    <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input" placeholder="Street address" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{edit ? 'Save Changes' : 'Create Supplier'}</button>
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
