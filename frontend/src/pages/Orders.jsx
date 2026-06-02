import { useEffect, useState } from 'react'
import { Plus, Search, Eye, Trash2, ShoppingCart, ChevronDown, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const StatusBadge = ({ status }) => (
  <span className={`badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
)

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [viewOrder, setViewOrder] = useState(null)
  const [saving, setSaving] = useState(false)

  // Create order state
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] })

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/api/orders/', { params: { ...params, limit: 200 } })
      setOrders(data)
    } catch (e) { toast.error(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter])

  const openCreate = async () => {
    try {
      const [cRes, pRes] = await Promise.all([api.get('/api/customers/?limit=500'), api.get('/api/products/?limit=500')])
      setCustomers(cRes.data)
      setProducts(pRes.data)
      setForm({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] })
      setModal('create')
    } catch (e) { toast.error(e.message) }
  }

  const closeModal = () => { setModal(null); setViewOrder(null) }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, key, val) => setForm(f => ({
    ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)
  }))

  const orderTotal = form.items.reduce((sum, item) => {
    const p = products.find(p => p.id === parseInt(item.product_id))
    return sum + (p ? p.price * parseInt(item.quantity || 0) : 0)
  }, 0)

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        customer_id: parseInt(form.customer_id),
        notes: form.notes || null,
        items: form.items.filter(i => i.product_id).map(i => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity),
        }))
      }
      await api.post('/api/orders/', payload)
      toast.success('Order created successfully')
      closeModal()
      load()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/api/orders/${orderId}`, { status })
      toast.success(`Order status updated to ${status}`)
      load()
      if (viewOrder?.id === orderId) {
        const { data } = await api.get(`/api/orders/${orderId}`)
        setViewOrder(data)
      }
    } catch (e) { toast.error(e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this order? Stock will be restored.')) return
    try {
      await api.delete(`/api/orders/${id}`)
      toast.success('Order deleted')
      load()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} orders</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> New Order
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                  No orders found
                </td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-sky-400 text-xs">#{o.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{o.customer?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">${o.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setViewOrder(o); setModal('view') }} className="text-slate-400 hover:text-sky-400 transition-colors p-1">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
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

      {/* Create Order Modal */}
      {modal === 'create' && (
        <Modal title="New Order" onClose={closeModal} size="lg">
          <form onSubmit={handleCreate} className="p-5 space-y-4">
            <div>
              <label className="label">Customer *</label>
              <select className="input" required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Order Items *</label>
                <button type="button" onClick={addItem} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  <Plus size={12} /> Add item
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => {
                  const p = products.find(p => p.id === parseInt(item.product_id))
                  return (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        className="input flex-1"
                        value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Select product…</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} (Stock: {p.stock_quantity})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={p?.stock_quantity || 9999}
                        className="input w-24"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        required
                      />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-slate-500 hover:text-red-400 p-1">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-400">Estimated Total</span>
              <span className="font-semibold text-emerald-400">${orderTotal.toFixed(2)}</span>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional order notes…" />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Order Modal */}
      {modal === 'view' && viewOrder && (
        <Modal title={`Order #${viewOrder.id}`} onClose={closeModal} size="lg">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label">Customer</p>
                <p className="text-slate-200 font-medium">{viewOrder.customer?.name}</p>
                <p className="text-sm text-slate-500">{viewOrder.customer?.email}</p>
              </div>
              <div>
                <p className="label">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={viewOrder.status} />
                </div>
              </div>
              <div>
                <p className="label">Date</p>
                <p className="text-slate-300 text-sm">{new Date(viewOrder.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="label">Total</p>
                <p className="text-emerald-400 font-semibold">${viewOrder.total_amount.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <p className="label mb-2">Items</p>
              <div className="space-y-1">
                {viewOrder.items?.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg text-sm">
                    <span className="text-slate-200">{item.product?.name || `Product #${item.product_id}`}</span>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>×{item.quantity}</span>
                      <span className="text-emerald-400">${(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {viewOrder.notes && (
              <div>
                <p className="label">Notes</p>
                <p className="text-slate-300 text-sm">{viewOrder.notes}</p>
              </div>
            )}

            <div>
              <p className="label mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(viewOrder.id, s)}
                    disabled={viewOrder.status === s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      viewOrder.status === s
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 cursor-default'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
