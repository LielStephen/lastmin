import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Shield, Truck, User, LogOut, Calculator, Bell } from 'lucide-react'

export default function Navbar({ onOpenCalculator, onOpenNotifications }) {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                LastMin
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Logistics
              </span>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-3">
              
              <button
                onClick={onOpenCalculator}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rate Calculator</span>
              </button>

              <button
                onClick={onOpenNotifications}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Notifications</span>
              </button>

              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-rose-400" />}
                {user.role === 'agent' && <Truck className="w-3.5 h-3.5 text-amber-400" />}
                {user.role === 'customer' && <User className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="capitalize">{user.role}</span>
              </div>

              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800/80">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  )
}
