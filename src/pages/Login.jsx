import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Truck, Shield, User, ArrowRight, Sparkles } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Truck className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
            LastMin Logistics
          </h1>
          <p className="text-slate-400 text-xs font-medium">Last-Mile Logistics & Delivery Management Platform</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:border-indigo-500 focus:ring-0"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:border-indigo-500 focus:ring-0"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Demo Evaluator Access</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@lastmin.com')}
                className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-[11px] font-semibold text-center transition flex flex-col items-center space-y-1"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => handleQuickLogin('customer@lastmin.com')}
                className="p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 text-indigo-300 text-[11px] font-semibold text-center transition flex flex-col items-center space-y-1"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>Customer</span>
              </button>

              <button
                onClick={() => handleQuickLogin('agent1@lastmin.com')}
                className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 text-[11px] font-semibold text-center transition flex flex-col items-center space-y-1"
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
