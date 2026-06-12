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
      if (isRegister) { await register(email, password, name) }
      else { await login(email, password) }
      navigate('/')
    } catch (err: any) { setError(err.message || 'Authentication failed') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8f0ff 50%, #f0ebff 100%)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-blue-500/20 mb-4">
            💪
          </div>
          <h1 className="text-xl font-bold text-gray-900">Inventory System</h1>
          <p className="text-sm text-gray-500 mt-1">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="input-gym w-full" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-gym w-full" placeholder="admin@inventory.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-gym w-full" placeholder="••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm font-semibold">
            {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 hover:underline font-semibold">
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
