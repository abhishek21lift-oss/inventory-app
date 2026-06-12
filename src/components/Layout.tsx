import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/items', label: 'Items', icon: '📦' },
  { path: '/warehouses', label: 'Warehouses', icon: '🏭' },
  { path: '/suppliers', label: 'Suppliers', icon: '🚚' },
  { path: '/purchase-orders', label: 'POs', icon: '📋' },
  { path: '/invoices', label: 'Invoices', icon: '🧾' },
  { path: '/activity', label: 'Activity', icon: '📜' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f7' }}>
      {/* Top navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
                💪
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-extrabold text-gray-900 tracking-tight leading-tight">Inventory</h1>
                <p className="text-[8px] text-gray-400 tracking-[0.12em] uppercase font-semibold -mt-0.5">Suite</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 px-4">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-500" />}
                      <span className="text-[15px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-50/80 border border-gray-100/50">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-gray-800 leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[9px] text-gray-400 capitalize font-medium leading-tight">{user?.role}</p>
                </div>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 ml-1" title="Logout">
                  ⏻
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(prev => !prev)}
                className="md:hidden relative w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="relative w-4 h-3.5">
                  <span className={`absolute left-0 top-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
                  <span className={`absolute left-0 top-1/2 -translate-y-[1px] w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                  <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-current rounded-full transition-all duration-200 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-lg">
            <nav className="px-3 py-2 space-y-0.5">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 border-l-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              {/* Mobile user section */}
              <div className="border-t border-gray-100 pt-2 mt-2 pb-1 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{user?.name || 'User'}</p>
                      <p className="text-[10px] text-gray-400 capitalize font-medium">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 text-lg" title="Logout">
                    ⏻
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
