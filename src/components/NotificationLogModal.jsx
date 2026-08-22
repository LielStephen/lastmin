import React, { useState, useEffect } from 'react'
import { X, Bell, Mail, MessageSquare, RefreshCw } from 'lucide-react'

export default function NotificationLogModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('antigravity_token')}` }
      })
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchLogs()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-100">Multi-Channel Notification Stream</h3>
              <p className="text-xs text-slate-400">Real-Time Email & SMS Dispatch Simulator</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No notifications dispatched yet. Change order status to generate live notifications!
            </div>
          ) : (
            logs.map(item => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.channel === 'EMAIL' ? (
                      <span className="flex items-center space-x-1 text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        <Mail className="w-3.5 h-3.5" />
                        <span>EMAIL</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </span>
                    )}

                    <span className="text-slate-300 font-medium">
                      To: {item.recipientEmail || item.recipientPhone}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {item.subject && (
                  <div className="font-semibold text-slate-200 pt-1">{item.subject}</div>
                )}

                <div className="text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800 font-mono text-[11px]">
                  {item.body}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
