import React, { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import RateCalculatorModal from './components/RateCalculatorModal'
import NotificationLogModal from './components/NotificationLogModal'
import CustomerDashboard from './pages/CustomerDashboard'
import AgentDashboard from './pages/AgentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'

export default function App() {
  const { user, loading } = useAuth()
  const [isCalcOpen, setIsCalcOpen] = useState(false)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-mono text-sm">
        Initializing LastMin Logistics Platform...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenCalculator={() => setIsCalcOpen(true)}
        onOpenNotifications={() => setIsNotifyOpen(true)}
      />

      <main className="flex-1">
        {user.role === 'customer' && <CustomerDashboard />}
        {user.role === 'agent' && <AgentDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>

      <RateCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <NotificationLogModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
      />
    </div>
  )
}
