import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'

const EMPTY = { name: '', email: '', phone: '', address: '' }

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/customers/', { params: { search: search || undefined, limit: 200 } })
      setCustomers(data)
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (c) => { setSelected(c); setForm({ ...c }); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/api/customers/', form)
        toast.success('Customer created')
      } else {
        await api.put(`/api/customers/${selected.id}`, form)
        toast.success('Customer updated')
      }
      closeModal()
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    try {
      await api.delete(`/api/customers/${id}`)
      toast.success('Customer deleted')
      load()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Name', 'Email', 'Phone', 'Address', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  No customers found
                </td></tr>
              ) : customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">{c.name}</td>
                  <td className="px-4 py-3 text-sky-400">{c.email}</td>
                  <td className="px-4 py-3 text-slate-400">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{c.address || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-sky-400 transition-colors p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Add Customer' : 'Edit Customer'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" />
              </div>
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create Customer' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
