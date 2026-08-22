import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Shield, Truck, User, LogOut, Calculator, Bell } from 'lucide-react'

export default function Navbar({ onOpenCalculator, onOpenNotifications }) {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Truck className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                LastMin
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Logistics v1.0
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              
              <button
                onClick={onOpenCalculator}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
              >
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span>Rate Engine</span>
              </button>

              <button
                onClick={onOpenNotifications}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition relative"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Notify Log</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
              </button>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
                {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-rose-400" />}
                {user.role === 'agent' && <Truck className="w-3.5 h-3.5 text-amber-400" />}
                {user.role === 'customer' && <User className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="capitalize">{user.role}</span>
              </div>

              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-slate-200">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </nav>
  )
}
