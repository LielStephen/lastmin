import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Truck, Shield, User, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('customer@lastmin.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('password123')
    login(demoEmail, 'password123').catch(err => setError(err.message))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-100">
            LastMin Logistics
          </h1>
          <p className="text-slate-400 text-xs">Last-mile delivery tracking platform</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-[11px] font-semibold text-slate-400">
              Quick Demo Login:
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@lastmin.com')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-300 text-[11px] font-medium text-center transition flex flex-col items-center space-y-1"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => handleQuickLogin('customer@lastmin.com')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 text-[11px] font-medium text-center transition flex flex-col items-center space-y-1"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => handleQuickLogin('agent1@lastmin.com')}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 text-[11px] font-medium text-center transition flex flex-col items-center space-y-1"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Agent</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
