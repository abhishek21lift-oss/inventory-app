import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/items', label: 'Items', icon: '📦' },
  { path: '/warehouses', label: 'Warehouses', icon: '🏭' },
  { path: '/suppliers', label: 'Suppliers', icon: '🚚' },
  { path: '/purchase-orders', label: 'Purchase Orders', icon: '📋' },
  { path: '/invoices', label: 'Invoices', icon: '🧾' },
  { path: '/activity', label: 'Activity Log', icon: '📜' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0e0f15] border-r border-white/5 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff375f] to-[#5e5ce6] flex items-center justify-center text-lg shadow-lg shadow-[#ff375f]/20">
              💪
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">INVENTORY</h1>
              <p className="text-[9px] text-white/30 tracking-widest uppercase">Management System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff375f]/10 to-[#5e5ce6]/10 text-white font-medium border-l-2 border-[#ff375f]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff375f] to-[#5e5ce6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-white/30 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-[#ff375f] transition text-lg" title="Logout">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white text-xl">
              ☰
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
