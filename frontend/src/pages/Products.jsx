import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'

const EMPTY = { name: '', sku: '', description: '', price: '', stock_quantity: '', category: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/products/', { params: { search: search || undefined, limit: 200 } })
      setProducts(data)
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (p) => { setSelected(p); setForm({ ...p, price: p.price.toString(), stock_quantity: p.stock_quantity.toString() }); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity, 10) }
    try {
      if (modal === 'create') {
        await api.post('/api/products/', payload)
        toast.success('Product created')
      } else {
        const { sku, ...updatePayload } = payload
        await api.put(`/api/products/${selected.id}`, updatePayload)
        toast.success('Product updated')
      }
      closeModal()
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      load()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} items in inventory</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="input pl-9"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Name', 'SKU', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">
                  <Package size={32} className="mx-auto mb-2 opacity-30" />
                  No products found
                </td></tr>
              ) : products.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-400">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 font-medium ${p.stock_quantity <= 10 ? 'text-red-400' : 'text-slate-200'}`}>
                      {p.stock_quantity <= 10 && <AlertTriangle size={12} />}
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-sky-400 transition-colors p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
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
        <Modal title={modal === 'create' ? 'Add Product' : 'Edit Product'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Product Name *</label>
                <input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Keyboard" />
              </div>
              <div>
                <label className="label">SKU *</label>
                <input className="input font-mono" required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WKB-001" disabled={modal === 'edit'} />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />
              </div>
              <div>
                <label className="label">Price ($) *</label>
                <input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="label">Stock Quantity *</label>
                <input className="input" type="number" min="0" required value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional product description…" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : modal === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
