import { createContext, useContext, useState, type ReactNode } from 'react'
import * as api from '../api'

interface AuthUser {
  id: string; email: string; name: string; role: string; token: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.login(email, password)
      const u = { ...res.user, token: res.token }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    } finally { setLoading(false) }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const res = await api.register(email, password, name)
      const u = { ...res.user, token: res.token }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
