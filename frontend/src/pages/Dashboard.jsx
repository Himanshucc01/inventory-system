import { useEffect, useState } from 'react'
import { Package, Users, ShoppingCart, Clock, AlertTriangle, DollarSign, TrendingUp, RefreshCw } from 'lucide-react'
import api from '../utils/api'

const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${accent || 'text-slate-100'}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-current/10' : 'bg-slate-800'}`}
        style={{ backgroundColor: 'rgba(148,163,184,0.08)' }}>
        <Icon size={18} className={accent || 'text-slate-400'} />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/orders/stats')
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">System overview at a glance</p>
        </div>
        <button onClick={load} className="btn-secondary" disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-24 bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={Package} label="Total Products" value={stats?.total_products} />
          <StatCard icon={Users} label="Total Customers" value={stats?.total_customers} />
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.total_orders} />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats?.pending_orders}
            accent="text-amber-400"
            sub="Awaiting confirmation"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Items"
            value={stats?.low_stock_products}
            accent="text-red-400"
            sub="≤ 10 units"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={stats ? `$${stats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null}
            accent="text-emerald-400"
            sub="Excl. cancelled orders"
          />
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-sky-400" />
          <h2 className="font-semibold text-slate-200 text-sm">Quick Tips</h2>
        </div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-sky-400 mt-0.5">•</span>
            Products are identified by unique SKU codes — duplicates are prevented automatically.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-400 mt-0.5">•</span>
            Orders can only be placed when sufficient stock is available. Stock is reduced automatically on order creation.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-400 mt-0.5">•</span>
            Cancelling an order restores the stock for all included products.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sky-400 mt-0.5">•</span>
            Items with ≤ 10 units are flagged as low stock above.
          </li>
        </ul>
      </div>
    </div>
  )
}
