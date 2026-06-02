import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Users, ShoppingCart, Menu, X, Boxes } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 border-r border-slate-800 flex flex-col
        transform transition-transform duration-200
        md:relative md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Boxes size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-100 leading-none">InvenTrack</p>
            <p className="text-xs text-slate-500 mt-0.5">Management System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 font-mono">v1.0.0</p>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-500 rounded-md flex items-center justify-center">
              <Boxes size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm">InvenTrack</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
