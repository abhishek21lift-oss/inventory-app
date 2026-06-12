import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('admin@inventory.com')
  const [password, setPassword] = useState('admin123')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await register(email, password, name)
      } else {
        await login(email, password)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">
      <div className="gradient-card w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff375f] to-[#5e5ce6] flex items-center justify-center text-2xl mx-auto shadow-lg shadow-[#ff375f]/20 mb-4">
            💪
          </div>
          <h1 className="text-xl font-bold text-white">Inventory System</h1>
          <p className="text-sm text-white/40 mt-1">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="input-neon w-full px-3.5 py-2.5 text-sm" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-neon w-full px-3.5 py-2.5 text-sm" placeholder="admin@inventory.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-neon w-full px-3.5 py-2.5 text-sm" placeholder="••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm font-semibold">
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-[#5e5ce6] hover:underline">
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
